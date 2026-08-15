// Quick test for new Ballistics JS functions
function rad(deg) { return deg * Math.PI / 180; }
function flinspace(start, stop, count, minValue, maxValue) {
  const result = [];
  const a = Math.max(start, minValue);
  const b = Math.min(stop, maxValue);
  if (count <= 1) return [a];
  const step = (b - a) / (count - 1);
  for (let i = 0; i < count; i += 1) result.push(a + i * step);
  return result;
}
function getRoot(data, fromEnd) {
  if (fromEnd) {
    for (let i = data.length - 2; i >= 0; i -= 1) {
      if (data[i][0] > data[i + 1][0]) return data[i + 1];
    }
    return data[0];
  }
  for (let i = 1; i < data.length; i += 1) {
    if (data[i - 1][0] < data[i][0]) return data[i - 1];
  }
  return data[data.length - 1];
}
function timeInAirNew(y0, yTarget, vy, gravity = 0.05, drag = 0.99, maxSteps = 1000000) {
  let t = 0;
  let tBelow = Infinity;
  if (y0 < yTarget) {
    while (t < maxSteps) {
      const yPrev = y0;
      y0 = y0 + vy;
      vy = drag * vy - gravity;
      t += 1;
      if (y0 > yTarget) {
        tBelow = t - 1 + (yTarget - yPrev) / (y0 - yPrev);
        break;
      }
      if (y0 - yPrev < 0) return [-1, -1];
    }
  }
  while (t < maxSteps) {
    const yPrev = y0;
    y0 = y0 + vy;
    vy = drag * vy - gravity;
    t += 1;
    if (y0 <= yTarget) {
      const tFrac = t - 1 + (yPrev - yTarget) / (yPrev - y0);
      return [tBelow, tFrac];
    }
  }
  return [tBelow, -1];
}
function tryPitchNew(pitchDeg, speed, length, distance, cannon, target, gravity, drag, maxSteps) {
  const pitch = rad(pitchDeg);
  const Vw = Math.cos(pitch) * speed;
  const Vy = Math.sin(pitch) * speed;
  const x = length * Math.cos(pitch);
  if (Vw === 0) return null;
  const current_drag = (drag === undefined || drag === null) ? 0.99 : drag;
  const denom = (1 / (1 - current_drag)) * Vw;
  const part = 1 - (distance - x) / denom;
  if (part <= 0) return null;
  const time_h = Math.abs(Math.log(part) / Math.log(current_drag));
  const y_end = cannon[1] + Math.sin(pitch) * length;
  const [t_below, t_above] = timeInAirNew(y_end, target[1], Vy, gravity, drag, maxSteps);
  if (t_below < 0) return null;
  const delta_t = Math.min(Math.abs(time_h - t_below), Math.abs(time_h - t_above));
  return [delta_t, pitchDeg, delta_t + time_h];
}
function tryPitchesNew(pitchList, speed, length, distance, cannon, target, gravity, drag, maxSteps) {
  const results = [];
  for (const pitch of pitchList) {
    const res = tryPitchNew(pitch, speed, length, distance, cannon, target, gravity, drag, maxSteps);
    if (res) results.push(res);
  }
  return results;
}
function calculatePitchNew(cannon, target, speed, length, opts) {
  const amin = opts.amin ?? -30;
  const amax = opts.amax ?? 60;
  const gravity = opts.gravity ?? 0.05;
  const drag = opts.drag ?? 0.99;
  const maxDelta = opts.maxDelta ?? 1.0;
  const maxSteps = opts.maxSteps ?? 1000000;
  const iterations = opts.iterations ?? 5;
  const elements = opts.elements ?? 20;
  const checkImpossible = opts.checkImpossible ?? true;
  const dx = cannon[0] - target[0];
  const dz = cannon[2] - target[2];
  const distance = Math.sqrt(dx * dx + dz * dz);
  const pitchList = [];
  for (let i = amax; i >= amin; i -= 1) pitchList.push(i);
  const guesses = tryPitchesNew(pitchList, speed, length, distance, cannon, target, gravity, drag, maxSteps);
  if (guesses.length === 0) return { low: [-1, -1, -1], high: [-1, -1, -1], ok: false };
  let r1 = getRoot(guesses, false);
  let r2 = getRoot(guesses, true);
  let p1 = r1[1];
  let p2 = r2[1];
  const same = p1 === p2;
  let c1 = true;
  let c2 = !same;
  for (let i = 0; i < iterations; i += 1) {
    const range = 10 ** (-i);
    let dTs1 = [];
    let dTs2 = [];
    if (c1) {
      dTs1 = tryPitchesNew(flinspace(p1 - range, p1 + range, elements, amin, amax), speed, length, distance, cannon, target, gravity, drag, maxSteps);
      if (dTs1.length === 0) c1 = false;
    }
    if (c2) {
      dTs2 = tryPitchesNew(flinspace(p2 - range, p2 + range, elements, amin, amax), speed, length, distance, cannon, target, gravity, drag, maxSteps);
      if (dTs2.length === 0) c2 = false;
    }
    if (!c1 && !c2) return { low: [-1, -1, -1], high: [-1, -1, -1], ok: false };
    if (c1) { dTs1.sort((a,b)=>a[0]-b[0]); r1 = dTs1[0]; p1 = r1[1]; }
    if (c2) { dTs2.sort((a,b)=>a[0]-b[0]); r2 = dTs2[0]; p2 = r2[1]; }
  }
  if (same) r2 = r1;
  if (checkImpossible && r1[0] > maxDelta) r1 = [-1,-1,-1];
  if (checkImpossible && r2[0] > maxDelta) r2 = [-1,-1,-1];
  return { low: r1, high: r2, ok: r1[1] !== -1 || r2[1] !== -1 };
}
function buildNewPath(pitchDeg, ticks, opts) {
  const pitch = rad(pitchDeg);
  const vw = Math.cos(pitch) * opts.speedBpt;
  let vy = Math.sin(pitch) * opts.speedBpt;
  let y = Math.sin(pitch) * opts.length;
  const x0 = Math.cos(pitch) * opts.length;
  const path = [{ x: 0, y: 0 }, { x: x0, y }];
  const maxTicks = Math.max(1, Math.ceil(Math.min(ticks || opts.maxSteps, opts.maxSteps)));
  for (let tick = 1; tick <= maxTicks; tick += 1) {
    const x = x0 + vw * (1 - Math.pow(opts.drag, tick)) / (1 - opts.drag);
    y += vy;
    vy = opts.drag * vy - opts.gravity;
    path.push({ x, y });
    if (x >= opts.distance) break;
  }
  return { path };
}

// Test case
const opts = {
  length: 8,
  speedMps: 160,
  speedBpt: 160 / 20,
  distance: 300,
  heightDelta: 0,
  preferArc: 'low',
  amin: -30,
  amax: 60,
  gravity: 0.05,
  drag: 0.99,
  maxDelta: 1,
  maxSteps: 1200,
  iterations: 5,
  elements: 20,
  checkImpossible: true
};
const cannon = [0,0,0];
const target = [opts.distance, opts.heightDelta, 0];
const res = calculatePitchNew(cannon, target, opts.speedBpt, opts.length, opts);
console.log('calculatePitchNew result low/high/ok:', res.low, res.high, res.ok);
const r = res.low[1] !== -1 ? res.low : (res.high[1] !== -1 ? res.high : null);
if (r) {
  console.log('chosen pitch deg:', r[1], 'ticks:', r[2]);
  const path = buildNewPath(r[1], r[2], opts).path;
  const last = path[path.length-1];
  console.log('final path last point:', last);
  const reached = path.some(p => p.x >= opts.distance);
  console.log('reached target distance?', reached);
  if (!reached) {
    console.log('shortfall (m):', opts.distance - last.x);
  }
} else console.log('no solution');
