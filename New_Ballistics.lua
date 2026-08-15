local ballistic = {}

local function rad(deg)
    return deg * math.pi / 180
end

local function flinspace(start, stop, num_elements, min_val, max_val)
    local result = {}
    start = math.max(start, min_val)
    stop = math.min(stop, max_val)
    if num_elements <= 1 then
        table.insert(result, start)
        return result
    end
    local step = (stop - start) / (num_elements - 1)
    for i = 0, num_elements - 1 do
        table.insert(result, start + i * step)
    end
    return result
end

function ballistic.getRoot(data, from_end)
    if from_end then
        for i = #data - 1, 1, -1 do
            if data[i][1] > data[i+1][1] then
                return data[i+1]
            end
        end
        return data[1]
    else
        for i = 2, #data do
            if data[i-1][1] < data[i][1] then
                return data[i-1]
            end
        end
        return data[#data]
    end
end

function ballistic.timeInAir(y0, y_target, Vy, gravity, drag, max_steps)
    gravity = gravity or 0.05
    drag = drag or 0.99
    max_steps = max_steps or 1000000

    local t = 0
    local t_below = math.huge

    if y0 < y_target then
        while t < max_steps do
            local y_prev = y0
            y0 = y0 + Vy
            Vy = drag * Vy - gravity
            t = t + 1
            if y0 > y_target then
                t_below = t - 1 + (y_target - y_prev) / (y0 - y_prev)
                break
            end
            if y0 - y_prev < 0 then
                return -1, -1
            end
        end
    end

    while t < max_steps do
        local y_prev = y0
        y0 = y0 + Vy
        Vy = drag * Vy - gravity
        t = t + 1
        if y0 <= y_target then
            local t_frac = t - 1 + (y_prev - y_target) / (y_prev - y0)
            return t_below, t_frac
        end
    end

    return t_below, -1
end

function ballistic.tryPitch(pitch_deg, speed, length, distance, cannon, target, gravity, drag, max_steps)
    local pitch_rad = rad(pitch_deg)
    local Vw = math.cos(pitch_rad) * speed
    local Vy = math.sin(pitch_rad) * speed

    local x = length * math.cos(pitch_rad)
    if Vw == 0 then return nil end

    local current_drag = drag or 0.99
    local part = 1 - (distance - x) / ((1 / (1 - current_drag)) * Vw)
    if part <= 0 then return nil end

    local time_h = math.abs(math.log(part) / math.log(current_drag))
    local y_end = cannon[2] + math.sin(pitch_rad) * length

    local t_below, t_above = ballistic.timeInAir(y_end, target[2], Vy, gravity, drag, max_steps)
    if t_below < 0 then return nil end

    local delta_t = math.min(math.abs(time_h - t_below), math.abs(time_h - t_above))
    return {delta_t, pitch_deg, delta_t + time_h}
end

function ballistic.tryPitches(pitch_list, speed, length, distance, cannon, target, gravity, drag, max_steps)
    local results = {}
    for _, pitch in ipairs(pitch_list) do
        local res = ballistic.tryPitch(pitch, speed, length, distance, cannon, target, gravity, drag, max_steps)
        if res then table.insert(results, res) end
    end
    return results
end

function ballistic.calculatePitch(cannon, target, speed, length,
    amin, amax, gravity, drag, max_delta_t_error, max_steps, num_iterations, num_elements, check_impossible)

    amin = amin or -30
    amax = amax or 60
    gravity = gravity or 0.05
    drag = drag or 0.99
    max_delta_t_error = max_delta_t_error or 1.0
    max_steps = max_steps or 1000000
    num_iterations = num_iterations or 5
    num_elements = num_elements or 20
    check_impossible = check_impossible == nil and true or check_impossible

    local Dx = cannon[1] - target[1]
    local Dz = cannon[3] - target[3]
    local distance = math.sqrt(Dx * Dx + Dz * Dz)

    local pitch_list = {}
    for i = amax, amin, -1 do table.insert(pitch_list, i) end
    local guesses = ballistic.tryPitches(pitch_list, speed, length, distance, cannon, target, gravity, drag, max_steps)

    if #guesses == 0 then
        return {-1, -1, -1}, {-1, -1, -1}
    end

    local r1 = ballistic.getRoot(guesses, false)
    local r2 = ballistic.getRoot(guesses, true)

    local p1, p2 = r1[2], r2[2]
    local same = p1 == p2
    local c1, c2 = true, not same
    local dTs1, dTs2 = {}, {}

    for i = 0, num_iterations - 1 do
        local range = 10^(-i)
        if c1 then
            local iter1 = flinspace(p1 - range, p1 + range, num_elements, amin, amax)
            dTs1 = ballistic.tryPitches(iter1, speed, length, distance, cannon, target, gravity, drag, max_steps)
            if #dTs1 == 0 then c1 = false end
        end
        if c2 then
            local iter2 = flinspace(p2 - range, p2 + range, num_elements, amin, amax)
            dTs2 = ballistic.tryPitches(iter2, speed, length, distance, cannon, target, gravity, drag, max_steps)
            if #dTs2 == 0 then c2 = false end
        end

        if not c1 and not c2 then
            return {-1, -1, -1}, {-1, -1, -1}
        end

        if c1 then
            table.sort(dTs1, function(a, b) return a[1] < b[1] end)
            r1 = dTs1[1]; p1 = r1[2]
        end
        if c2 then
            table.sort(dTs2, function(a, b) return a[1] < b[1] end)
            r2 = dTs2[1]; p2 = r2[2]
        end
    end

    if same then r2 = r1 end

    if check_impossible and r1[1] > max_delta_t_error then r1 = {-1, -1, -1} end
    if check_impossible and r2[1] > max_delta_t_error then r2 = {-1, -1, -1} end

    return r1, r2
end

function ballistic.getDrag(base_drag, dim_multiplier)
    if dim_multiplier <= 1 then
        return 1 + (base_drag - 1) * dim_multiplier
    else
        local diff = base_drag - 1
        return math.max(math.min(base_drag + diff * (dim_multiplier - 1), base_drag), 0.9)
    end
end

return ballistic
