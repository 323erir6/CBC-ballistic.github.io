"use strict";

const TICKS_PER_SECOND = 20;

const PROJECTILES = [
  "createbigcannons:shot",
  "createbigcannons:ap_shot",
  "createbigcannons:ap_shell",
  "createbigcannons:bag_of_grapeshot",
  "createbigcannons:he_shell",
  "createbigcannons:he_shot",
  "createbigcannons:mortar_stone",
  "createbigcannons:mortar_shot",
  "createbigcannons:drop_mortar_shell",
  "createbigcannons:shrapnel_shell",
  "createbigcannons:fluid_shell",
  "createbigcannons:smoke_shell",
  "createbigcannons:flak_autocannon",
  "createbigcannons:ap_autocannon",
  "createbigcannons:machine_gun_bullet",
  "cbc_at:cluster_projectile",
  "cbc_at:apds_projectile",
  "cbc_at:apdsfs_projectile",
  "cbc_at:he_projectile",
  "cbc_at:hei_projectile",
  "cbc_at:ha_ap_projectile",
  "cbc_at:ha_apds_projectile",
  "cbc_at:ha_apdsfs_projectile",
  "cbc_at:ha_he_projectile",
  "cbc_at:ha_hef_projectile",
  "cbc_at:ha_heat_projectile",
  "cbc_at:ha_smoke_projectile"
];

for (let i = 1; i <= 5; i += 1) {
  [
    "solid_shot",
    "ap_shot",
    "mortar_shot",
    "bag_of_grapeshot",
    "he_shot",
    "ap_shell",
    "shrapnel_shell",
    "drop_mortar_shell",
    "smoke_shell",
    "plasma_shell",
    "gravitational_shell",
    "vortex_shell",
    "cluster_shell",
    "disintegration_shell",
    "singularity_shell",
    "bunker_buster_shell",
    "shell_holder"
  ].forEach((name) => PROJECTILES.push(`cbc_enhanced_shells:${name}_mk${i}`));
}

PROJECTILES.push(
  "cbc_enhanced_shells:nuclear_shell",
  "cbc_enhanced_shells:nuclear_shell_mk2",
  "cbc_enhanced_shells:h_bomb_shell",
  "cbc_enhanced_shells:h_bomb_mini_shell"
);

const I18N = {
  en: {
    eyebrow: "Create: Big Cannons",
    title: "Ballistic calculator",
    shotSetup: "Shot setup",
    reset: "Reset",
    barrelLength: "Total cannon length",
    blocks: "blocks / meters",
    velocityMps: "Projectile speed",
    mpsHint: "m/s",
    projectileType: "Projectile type",
    distance: "Horizontal distance",
    distanceHint: "from cannon to target",
    heightDelta: "Target height delta",
    heightHint: "target Y minus cannon Y",
    details: "Detailed config",
    preferArc: "Preferred arc",
    lowArc: "Low",
    highArc: "High",
    amin: "Minimum pitch",
    amax: "Maximum pitch",
    gravity: "Gravity",
    drag: "Drag",
    maxDelta: "Max time error",
    maxSteps: "Max ticks",
    iterations: "Refine iterations",
    elements: "Samples per refine",
    checkImpossible: "Reject impossible results",
    result: "Result",
    chosenPitch: "Chosen pitch",
    lowSolution: "Low solution",
    highSolution: "High solution",
    flightTime: "Flight time",
    speedBpt: "Speed",
    yaw: "Yaw",
    usedMethod: "Used method",
    currentDistance: "Current distance",
    maxDistance: "Max distance",
    noSolution: "No solution",
    solved: "Solved",
    invalid: "Invalid input",
    originalFormula: "Original Ballistics.lua",
    method: "Method",
    improvedMethod: "Improved (projectile-aware)",
    mass: "Mass (kg)",
    radius: "Radius (m)",
    cd: "Drag coeff (C_d)",
    useQuadratic: "Use quadratic drag",
    useCoordinates: "Use coordinates",
    cannonCoords: "Cannon (X,Y,Z)",
    targetCoords: "Target (X,Y,Z)"
  },
  ru: {
    eyebrow: "Create: Big Cannons",
    title: "Баллистический калькулятор",
    shotSetup: "Параметры выстрела",
    reset: "Сброс",
    barrelLength: "Общая длина пушки",
    blocks: "блоки / метры",
    velocityMps: "Скорость снаряда",
    mpsHint: "м/с",
    projectileType: "Тип снаряда",
    distance: "Горизонтальная дистанция",
    distanceHint: "от пушки до цели",
    heightDelta: "Разница высоты цели",
    heightHint: "Y цели минус Y пушки",
    details: "Детальный конфиг",
    preferArc: "Предпочтительная дуга",
    lowArc: "Низкая",
    highArc: "Высокая",
    amin: "Минимальный угол",
    amax: "Максимальный угол",
    gravity: "Гравитация",
    drag: "Drag",
    maxDelta: "Макс. ошибка времени",
    maxSteps: "Макс. тиков",
    iterations: "Итерации уточнения",
    elements: "Сэмплов на уточнение",
    checkImpossible: "Отбрасывать невозможные результаты",
    result: "Результат",
    chosenPitch: "Выбранный угол",
    lowSolution: "Низкая дуга",
    highSolution: "Высокая дуга",
    flightTime: "Время полета",
    speedBpt: "Скорость",
    yaw: "Yaw",
    usedMethod: "Метод",
    currentDistance: "Текущая дистанция",
    maxDistance: "Максимальная дистанция",
    noSolution: "Нет решения",
    solved: "Рассчитано",
    invalid: "Некорректный ввод",
    originalFormula: "Оригинальная Ballistics.lua",
    method: "Метод",
    improvedMethod: "Improved (с учётом типа снаряда)",
    mass: "Масса (кг)",
    radius: "Радиус (м)",
    cd: "Коэффициент сопротивления (C_d)",
    useQuadratic: "Квадратичный воздух",
    useCoordinates: "Использовать координаты",
    cannonCoords: "Пушка (X,Y,Z)",
    targetCoords: "Цель (X,Y,Z)"
  },
  uk: {
    eyebrow: "Create: Big Cannons",
    title: "Балістичний калькулятор",
    shotSetup: "Параметри пострілу",
    reset: "Скинути",
    barrelLength: "Загальна довжина гармати",
    blocks: "блоки / метри",
    velocityMps: "Швидкість снаряда",
    mpsHint: "м/с",
    projectileType: "Тип снаряда",
    distance: "Горизонтальна дистанція",
    distanceHint: "від гармати до цілі",
    heightDelta: "Різниця висоти цілі",
    heightHint: "Y цілі мінус Y гармати",
    details: "Детальний конфіг",
    preferArc: "Переважна дуга",
    lowArc: "Низька",
    highArc: "Висока",
    amin: "Мінімальний кут",
    amax: "Максимальний кут",
    gravity: "Гравітація",
    drag: "Drag",
    maxDelta: "Макс. помилка часу",
    maxSteps: "Макс. тіків",
    iterations: "Ітерації уточнення",
    elements: "Семплів на уточнення",
    checkImpossible: "Відкидати неможливі результати",
    result: "Результат",
    chosenPitch: "Вибраний кут",
    lowSolution: "Низька дуга",
    highSolution: "Висока дуга",
    flightTime: "Час польоту",
    speedBpt: "Швидкість",
    yaw: "Yaw",
    usedMethod: "Метод",
    currentDistance: "Поточна дистанція",
    maxDistance: "Максимальна дистанція",
    noSolution: "Немає рішення",
    solved: "Розраховано",
    invalid: "Некоректний ввід",
    originalFormula: "Оригінальна Ballistics.lua",
    method: "Метод",
    improvedMethod: "Поліпшений (враховує тип снаряду)",
    mass: "Маса (кг)",
    radius: "Радіус (м)",
    cd: "Коефіцієнт опору (C_d)",
    useQuadratic: "Квадратичний опір",
    useCoordinates: "Вводити координати",
    cannonCoords: "Гармата (X,Y,Z)",
    targetCoords: "Ціль (X,Y,Z)"
  }
};

const $ = (id) => document.getElementById(id);
const fields = [
  "length",
  "speedMps",
  "method",
  "projectile",
  "distance",
  "heightDelta",
  "preferArc",
  "amin",
  "amax",
  "gravity",
  "drag",
  "mass",
  "radius",
  "cd",
  "useQuadratic",
  "maxDelta",
  "maxSteps",
  "iterations",
  "elements",
  "checkImpossible"
];

// add coordinate fields so they get input listeners
fields.push(
  "useCoords",
  "cannonX",
  "cannonY",
  "cannonZ",
  "targetX",
  "targetY",
  "targetZ"
);

// add coordinate-related fields so changes re-render
fields.push("useCoords", "cannonX", "cannonY", "cannonZ", "targetX", "targetY", "targetZ");

let lang = localStorage.getItem("cbcCalcLang") || "uk";

function rad(deg) {
  return deg * Math.PI / 180;
}

function num(id) {
  return Number($(id).value);
}

function fmt(value, digits = 3) {
  if (!Number.isFinite(value)) return "-";
  return Number(value).toFixed(digits).replace(/\.?0+$/, "");
}

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

function timeInAir(y0, yTarget, vy, gravity = 0.05, drag = 0.99, maxSteps = 1000000) {
  let t = 0;
  let tBelow = Infinity;

  if (y0 < yTarget) {
    while (t < maxSteps) {
      const yPrev = y0;
      y0 += vy;
      vy = drag * vy - gravity;
      t += 1;
      if (y0 > yTarget) {
        tBelow = t - 1;
        break;
      }
      if (y0 - yPrev < 0) return [-1, -1];
    }
  }

  while (t < maxSteps) {
    y0 += vy;
    vy = drag * vy - gravity;
    t += 1;
    if (y0 <= yTarget) return [tBelow, t];
  }

  return [tBelow, -1];
}

function tryPitch(pitchDeg, speed, length, distance, cannon, target, gravity, drag, maxSteps) {
  const pitch = rad(pitchDeg);
  const vw = Math.cos(pitch) * speed;
  const vy = Math.sin(pitch) * speed;
  const x = length * Math.cos(pitch);
  if (vw === 0) return null;

  const part = 1 - (distance - x) / (100 * vw);
  if (part <= 0) return null;

  const timeH = Math.abs(Math.log(part) / Math.log(drag || 0.99));
  const yEnd = cannon[1] + Math.sin(pitch) * length;
  const [tBelow, tAbove] = timeInAir(yEnd, target[1], vy, gravity, drag, maxSteps);
  if (tBelow < 0) return null;

  const deltaT = Math.min(Math.abs(timeH - tBelow), Math.abs(timeH - tAbove));
  return [deltaT, pitchDeg, deltaT + timeH];
}

function tryPitches(pitchList, speed, length, distance, cannon, target, gravity, drag, maxSteps) {
  return pitchList
    .map((pitch) => tryPitch(pitch, speed, length, distance, cannon, target, gravity, drag, maxSteps))
    .filter(Boolean);
}

function calculatePitch(cannon, target, speed, length, opts) {
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
  const guesses = tryPitches(pitchList, speed, length, distance, cannon, target, gravity, drag, maxSteps);

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
      dTs1 = tryPitches(flinspace(p1 - range, p1 + range, elements, amin, amax), speed, length, distance, cannon, target, gravity, drag, maxSteps);
      if (dTs1.length === 0) c1 = false;
    }

    if (c2) {
      dTs2 = tryPitches(flinspace(p2 - range, p2 + range, elements, amin, amax), speed, length, distance, cannon, target, gravity, drag, maxSteps);
      if (dTs2.length === 0) c2 = false;
    }

    if (!c1 && !c2) return { low: [-1, -1, -1], high: [-1, -1, -1], ok: false };

    if (c1) {
      dTs1.sort((a, b) => a[0] - b[0]);
      r1 = dTs1[0];
      p1 = r1[1];
    }

    if (c2) {
      dTs2.sort((a, b) => a[0] - b[0]);
      r2 = dTs2[0];
      p2 = r2[1];
    }
  }

  if (same) r2 = r1;
  if (checkImpossible && r1[0] > maxDelta) r1 = [-1, -1, -1];
  if (checkImpossible && r2[0] > maxDelta) r2 = [-1, -1, -1];

  return {
    low: r1,
    high: r2,
    ok: r1[1] !== -1 || r2[1] !== -1
  };
}

// --- Improved projectile-aware simulation ---
function fillMethods() {
  const sel = $("method");
  if (!sel) return;
  sel.innerHTML = "";
  const o1 = document.createElement("option");
  o1.value = "original";
  o1.textContent = t("originalFormula");
  sel.appendChild(o1);
  const o2 = document.createElement("option");
  o2.value = "improved";
  o2.textContent = t("improvedMethod");
  sel.appendChild(o2);
  sel.value = sel.value || "original";
}

function getProjectileDefaults(id) {
  const tid = (id || "").toLowerCase();
  const defaults = { mass: 10, radius: 0.05, cd: 0.47, useQuadratic: true };
  if (tid.includes("machine_gun") || tid.includes("bullet")) return { mass: 0.02, radius: 0.005, cd: 0.2, useQuadratic: true };
  if (tid.includes("autocannon") || tid.includes("flak")) return { mass: 0.3, radius: 0.02, cd: 0.3, useQuadratic: true };
  if (tid.includes("mortar")) return { mass: 40, radius: 0.13, cd: 0.6, useQuadratic: true };
  if (tid.includes("nuclear") || tid.includes("h_bomb")) return { mass: 1000, radius: 1.0, cd: 0.8, useQuadratic: true };
  if (tid.includes("ap") && tid.includes("shell") || tid.includes("ap_")) return { mass: 15, radius: 0.06, cd: 0.35, useQuadratic: true };
  if (tid.includes("he") || tid.includes("explosive")) return { mass: 20, radius: 0.07, cd: 0.45, useQuadratic: true };
  if (tid.includes("shot")) return { mass: 8, radius: 0.045, cd: 0.47, useQuadratic: true };
  return defaults;
}

function updateUIForMethod() {
  const method = $("method").value;
  const improvedEls = document.querySelectorAll(".method-improved");
  const projectileEl = $("projectile");
  const gravityEl = $("gravity") ? $("gravity").parentElement : null;
  const dragEl = $("drag") ? $("drag").parentElement : null;
  if (method === "original") {
    projectileEl.disabled = false;
    improvedEls.forEach((el) => { el.style.display = "none"; });
    if (gravityEl) gravityEl.style.display = "";
    if (dragEl) dragEl.style.display = "";
  } else {
    projectileEl.disabled = false;
    improvedEls.forEach((el) => { el.style.display = ""; });
    // populate improved fields from projectile defaults if user hasn't changed them
    const props = getProjectileDefaults(projectileEl.value);
    if (props) {
      $("mass").value = $("mass").value || props.mass;
      $("radius").value = $("radius").value || props.radius;
      $("cd").value = $("cd").value || props.cd;
      $("useQuadratic").checked = props.useQuadratic;
    }
    if (gravityEl) gravityEl.style.display = "none";
    if (dragEl) dragEl.style.display = "none";
  }
}

function updateInputMode() {
  const use = $("useCoords") && $("useCoords").checked;
  const distEl = $("distance") ? $("distance").parentElement : null;
  const heightEl = $("heightDelta") ? $("heightDelta").parentElement : null;
  const coordsEl = $("coordsGroup");
  if (use) {
    if (distEl) distEl.style.display = "none";
    if (heightEl) heightEl.style.display = "none";
    if (coordsEl) coordsEl.style.display = "";
  } else {
    if (distEl) distEl.style.display = "";
    if (heightEl) heightEl.style.display = "";
    if (coordsEl) coordsEl.style.display = "none";
  }
}

function updateInputMode() {
  const use = $("useCoords") && $("useCoords").checked;
  const distEl = $("distance") ? $("distance").parentElement : null;
  const heightEl = $("heightDelta") ? $("heightDelta").parentElement : null;
  const coordsEl = $("coordsGroup");
  if (use) {
    if (distEl) distEl.style.display = "none";
    if (heightEl) heightEl.style.display = "none";
    if (coordsEl) coordsEl.style.display = "";
  } else {
    if (distEl) distEl.style.display = "";
    if (heightEl) heightEl.style.display = "";
    if (coordsEl) coordsEl.style.display = "none";
  }
}

function simulateForPitch(pitchDeg, speedBpt, length, opts, props) {
  const pitch = rad(pitchDeg);
  let vx = Math.cos(pitch) * speedBpt;
  let vy = Math.sin(pitch) * speedBpt;
  let y = Math.sin(pitch) * length;
  const x0 = Math.cos(pitch) * length;
  let x = x0;
  const path = [{ x: 0, y: 0 }, { x: x0, y }];
  const maxTicks = Math.max(1, Math.floor(opts.maxSteps || 1200));

  const rho = 1.225; // kg/m^3
  const area = Math.PI * (props.radius ** 2);
  const k_drag = (rho * props.cd * area) / (2 * props.mass); // m^-1, works with blocks/tick velocities

  for (let tick = 1; tick <= maxTicks; tick += 1) {
    const vtot = Math.hypot(vx, vy);
    if (vtot === 0) break;
    const aDrag = props.useQuadratic ? k_drag * vtot * vtot : k_drag * vtot;
    const dragX = (vx / vtot) * aDrag;
    const dragY = (vy / vtot) * aDrag;

    vy -= dragY;
    vy -= opts.gravity;
    vx -= dragX;

    x += vx;
    y += vy;
    path.push({ x, y });
    if (x >= opts.distance) {
      // linear interpolate between last two points to get y at exact distance
      const last = path[path.length - 1];
      const prev = path[path.length - 2];
      const t = (opts.distance - prev.x) / (last.x - prev.x || 1);
      const yCross = prev.y + (last.y - prev.y) * t;
      return { hit: true, y: yCross, ticks: tick, path };
    }
  }

  return { hit: false, path };
}

function calculatePitchImproved(cannon, target, speed, length, opts, props) {
  const amin = opts.amin ?? -30;
  const amax = opts.amax ?? 60;
  const maxSteps = opts.maxSteps ?? 1000000;
  const iterations = opts.iterations ?? 5;
  const elements = opts.elements ?? 20;
  const checkImpossible = opts.checkImpossible ?? true;

  const dx = cannon[0] - target[0];
  const dz = cannon[2] - target[2];
  const distance = Math.sqrt(dx * dx + dz * dz);

  let pitchList = [];
  for (let i = amin; i <= amax; i += 1) pitchList.push(i);

  const results = [];
  for (const p of pitchList) {
    const sim = simulateForPitch(p, speed, length, opts, props);
    if (!sim.hit) {
      results.push([Infinity, p, -1]);
    } else {
      const err = Math.abs(sim.y - target[1]);
      results.push([err, p, sim.ticks]);
    }
  }

  // split into low and high halves and pick best in each
  const mid = Math.floor(results.length / 2);
  const lowCandidates = results.slice(0, Math.max(1, mid));
  const highCandidates = results.slice(Math.max(1, mid));

  lowCandidates.sort((a, b) => a[0] - b[0]);
  highCandidates.sort((a, b) => a[0] - b[0]);

  let low = lowCandidates[0] || [ -1, -1, -1 ];
  let high = highCandidates[0] || [ -1, -1, -1 ];

  // refine around best candidates
  for (let i = 0; i < iterations; i += 1) {
    const range = Math.max(0.1, 10 ** (-i));
    const refinedLow = [];
    if (low[1] !== -1) {
      const picks = flinspace(low[1] - range, low[1] + range, elements, amin, amax);
      for (const p of picks) {
        const sim = simulateForPitch(p, speed, length, opts, props);
        if (!sim.hit) refinedLow.push([Infinity, p, -1]); else refinedLow.push([Math.abs(sim.y - target[1]), p, sim.ticks]);
      }
      refinedLow.sort((a, b) => a[0] - b[0]);
      if (refinedLow.length) low = refinedLow[0];
    }

    const refinedHigh = [];
    if (high[1] !== -1) {
      const picks = flinspace(high[1] - range, high[1] + range, elements, amin, amax);
      for (const p of picks) {
        const sim = simulateForPitch(p, speed, length, opts, props);
        if (!sim.hit) refinedHigh.push([Infinity, p, -1]); else refinedHigh.push([Math.abs(sim.y - target[1]), p, sim.ticks]);
      }
      refinedHigh.sort((a, b) => a[0] - b[0]);
      if (refinedHigh.length) high = refinedHigh[0];
    }
  }

  if (checkImpossible) {
    if (!Number.isFinite(low[0]) || low[0] === Infinity) low = [-1, -1, -1];
    if (!Number.isFinite(high[0]) || high[0] === Infinity) high = [-1, -1, -1];
  }

  return { low, high, ok: (low[1] !== -1 || high[1] !== -1) };
}

// (removed fromscratch physics method)


function buildImprovedPath(pitchDeg, ticks, opts, props) {
  const sim = simulateForPitch(pitchDeg, opts.speedBpt, opts.length, opts, props);
  return { path: sim.path };
}

function collectOptions() {
  const useCoords = $("useCoords") ? $("useCoords").checked : false;
  const cannonX = $("cannonX") ? num("cannonX") : 0;
  const cannonY = $("cannonY") ? num("cannonY") : 0;
  const cannonZ = $("cannonZ") ? num("cannonZ") : 0;
  const targetX = $("targetX") ? num("targetX") : num("distance");
  const targetY = $("targetY") ? num("targetY") : num("heightDelta");
  const targetZ = $("targetZ") ? num("targetZ") : 0;

  const horiz = Math.sqrt((targetX - cannonX) ** 2 + (targetZ - cannonZ) ** 2);
  // clamp amax to +60 (don't change amin)
  const aminVal = num("amin");
  const amaxRaw = num("amax");
  const amaxVal = Number.isFinite(amaxRaw) ? Math.min(amaxRaw, 60) : 60;

  return {
    projectile: $("projectile").value,
    length: num("length"),
    speedMps: num("speedMps"),
    speedBpt: num("speedMps") / TICKS_PER_SECOND,
    distance: useCoords ? horiz : num("distance"),
    heightDelta: useCoords ? (targetY - cannonY) : num("heightDelta"),
    preferArc: $("preferArc").value,
    amin: aminVal,
    amax: amaxVal,
    gravity: num("gravity"),
    drag: num("drag"),
    maxDelta: num("maxDelta"),
    maxSteps: Math.floor(num("maxSteps")),
    iterations: Math.floor(num("iterations")),
    elements: Math.floor(num("elements")),
    checkImpossible: $("checkImpossible").checked,
    useCoords,
    cannon: [cannonX, cannonY, cannonZ],
    target: [targetX, targetY, targetZ]
  };
}

function render() {
  const opts = collectOptions();
  const invalid = !Number.isFinite(opts.speedBpt) || opts.speedBpt <= 0 || !Number.isFinite(opts.distance) || opts.distance <= 0 || opts.amin >= opts.amax || opts.drag <= 0 || opts.drag === 1;
  if (invalid) {
    setStatus(t("invalid"), "bad");
    clearOutputs();
    drawTrajectory(null, opts);
    return;
  }

  let cannon = [0, 0, 0];
  let target = [opts.distance, opts.heightDelta, 0];
  if (opts.useCoords) {
    cannon = opts.cannon;
    target = opts.target;
  }

  // show current distance when coordinates are used
  const currentDistEl = $("currentDistance");
  if (currentDistEl) {
    if (opts.useCoords) {
      const horizNow = Math.sqrt((target[0] - cannon[0]) ** 2 + (target[2] - cannon[2]) ** 2);
      currentDistEl.textContent = `${fmt(horizNow, 3)}`;
    } else {
      currentDistEl.textContent = "-";
    }
  }

  const method = $("method") ? $("method").value : "original";
  let result, chosen, fallback, preferred, ok, debugObj, pathObj;

  if (method === "original") {
    result = calculatePitch(cannon, target, opts.speedBpt, opts.length, opts);

    // classify arcs: if two distinct degrees exist, the larger degree is high arc; if only one degree exists,
    // then it's high if >45°, otherwise low.
    function classifyArcs(l, h) {
      const lDeg = l[1];
      const hDeg = h[1];
      let lowArc = [-1, -1, -1];
      let highArc = [-1, -1, -1];
      const hasL = lDeg !== -1;
      const hasH = hDeg !== -1;
      if (hasL && hasH && lDeg !== hDeg) {
        if (lDeg < hDeg) { lowArc = l; highArc = h; } else { lowArc = h; highArc = l; }
      } else if (hasL || hasH) {
        const only = hasL ? l : h;
        if (only[1] > 45) highArc = only; else lowArc = only;
      }
      return { low: lowArc, high: highArc };
    }

    const classified = classifyArcs(result.low, result.high);
    const lowArc = classified.low;
    const highArc = classified.high;

    // choose preferred arc if available
    const preferredArc = opts.preferArc === "high" ? highArc : lowArc;
    const fallbackArc = opts.preferArc === "high" ? lowArc : highArc;
    chosen = preferredArc[1] !== -1 ? preferredArc : fallbackArc;
    ok = result.ok && chosen[1] !== -1;

    setStatus(ok ? t("solved") : t("noSolution"), ok ? "ok" : "bad");
    $("chosenPitch").textContent = ok && chosen[1] !== -1 ? `${fmt(chosen[1], 4)}°` : "-";
    $("lowPitch").textContent = lowArc[1] !== -1 ? `${fmt(lowArc[1], 4)}°` : "-";
    $("highPitch").textContent = highArc[1] !== -1 ? `${fmt(highArc[1], 4)}°` : "-";
    $("flightTime").textContent = ok && chosen[2] !== -1 ? `${fmt(chosen[2], 2)} ticks / ${fmt(chosen[2] / TICKS_PER_SECOND, 2)} s` : "-";
    $("speedBpt").textContent = `${fmt(opts.speedBpt, 4)} m/tick`;
    $("usedMethod").textContent = t("originalFormula");

    pathObj = ok ? buildLegacyPath(chosen[1], chosen[2], opts) : null;

    // compute max distance for legacy method
    try {
      const maxRes = computeMaxDistance(opts, "original", null);
      $("maxDistance").textContent = Number.isFinite(maxRes.maxDistance) ? `${fmt(maxRes.maxDistance, 3)}` : "-";
    } catch (e) {
      $("maxDistance").textContent = "-";
    }
    debugObj = {
      source: "Lua/Artillery_all/Ballistics.lua",
      method: "original",
      projectile: opts.projectile,
      note: "Original Ballistics.lua (legacy). Projectile-specific properties are ignored.",
      velocityMps: opts.speedMps,
      velocityBpt: opts.speedBpt,
      low: result.low,
      high: result.high,
      selectedPitchDeg: ok ? chosen[1] : null,
      parameters: {
        length: opts.length,
        gravity: opts.gravity,
        drag: opts.drag,
        maxDeltaError: opts.maxDelta,
        maxSteps: opts.maxSteps,
        numIterations: opts.iterations,
        numElements: opts.elements,
        checkImpossible: opts.checkImpossible
      }
    };
    debugObj.cannon = cannon;
    debugObj.target = target;
  } else if (method === "improved") {
    // improved method: use projectile properties
    const props = {
      mass: num("mass") || getProjectileDefaults(opts.projectile).mass,
      radius: num("radius") || getProjectileDefaults(opts.projectile).radius,
      cd: num("cd") || getProjectileDefaults(opts.projectile).cd,
      useQuadratic: $("useQuadratic").checked
    };

    result = calculatePitchImproved(cannon, target, opts.speedBpt, opts.length, opts, props);

    // classify arcs: if two distinct degrees exist, the larger degree is high arc; if only one degree exists,
    // then it's high if >45°, otherwise low.
    function classifyArcs(l, h) {
      const lDeg = l[1];
      const hDeg = h[1];
      let lowArc = [-1, -1, -1];
      let highArc = [-1, -1, -1];
      const hasL = lDeg !== -1;
      const hasH = hDeg !== -1;
      if (hasL && hasH && lDeg !== hDeg) {
        if (lDeg < hDeg) { lowArc = l; highArc = h; } else { lowArc = h; highArc = l; }
      } else if (hasL || hasH) {
        const only = hasL ? l : h;
        if (only[1] > 45) highArc = only; else lowArc = only;
      }
      return { low: lowArc, high: highArc };
    }

    const classified = classifyArcs(result.low, result.high);
    const lowArc = classified.low;
    const highArc = classified.high;

    // choose preferred arc if available
    const preferredArc = opts.preferArc === "high" ? highArc : lowArc;
    const fallbackArc = opts.preferArc === "high" ? lowArc : highArc;
    chosen = preferredArc[1] !== -1 ? preferredArc : fallbackArc;
    ok = result.ok && chosen[1] !== -1;

    setStatus(ok ? t("solved") : t("noSolution"), ok ? "ok" : "bad");
    $("chosenPitch").textContent = ok && chosen[1] !== -1 ? `${fmt(chosen[1], 4)}°` : "-";
    $("lowPitch").textContent = lowArc[1] !== -1 ? `${fmt(lowArc[1], 4)}°` : "-";
    $("highPitch").textContent = highArc[1] !== -1 ? `${fmt(highArc[1], 4)}°` : "-";
    $("flightTime").textContent = ok && chosen[2] !== -1 ? `${fmt(chosen[2], 2)} ticks / ${fmt(chosen[2] / TICKS_PER_SECOND, 2)} s` : "-";
    $("speedBpt").textContent = `${fmt(opts.speedBpt, 4)} m/tick`;
    $("usedMethod").textContent = t("improvedMethod");
    pathObj = ok ? buildImprovedPath(chosen[1], chosen[2], opts, props) : null;

    // compute max distance for improved method (uses projectile props)
    try {
      const maxRes = computeMaxDistance(opts, "improved", props);
      $("maxDistance").textContent = Number.isFinite(maxRes.maxDistance) ? `${fmt(maxRes.maxDistance, 3)}` : "-";
    } catch (e) {
      $("maxDistance").textContent = "-";
    }
    debugObj = {
      source: "improved-method",
      method: "improved",
      projectile: opts.projectile,
      props,
      velocityMps: opts.speedMps,
      velocityBpt: opts.speedBpt,
      low: result.low,
      high: result.high,
      selectedPitchDeg: ok ? chosen[1] : null,
      parameters: {
        length: opts.length,
        maxSteps: opts.maxSteps,
        numIterations: opts.iterations,
        numElements: opts.elements,
        checkImpossible: opts.checkImpossible
      }
    };
    debugObj.cannon = cannon;
    debugObj.target = target;
  }

  // compute yaw: show actual yaw when using coordinates, otherwise leave empty
  if (opts.useCoords) {
    const dxYaw = target[0] - cannon[0];
    const dzYaw = target[2] - cannon[2];
    // invert yaw: make right negative, left positive by negating atan2 result
    let yawDeg = -Math.atan2(dxYaw, dzYaw) * 180 / Math.PI; // 0 = +Z
    if (yawDeg >= 180) yawDeg -= 360;
    if (yawDeg < -180) yawDeg += 360;
    $("yaw").textContent = `${fmt(yawDeg, 4)}°`;
  } else {
    $("yaw").textContent = "";
  }
  drawTrajectory(ok ? pathObj : null, opts);
  $("debug").textContent = JSON.stringify(debugObj, null, 2);
}

function buildLegacyPath(pitchDeg, ticks, opts) {
  const pitch = rad(pitchDeg);
  const vw = Math.cos(pitch) * opts.speedBpt;
  let vy = Math.sin(pitch) * opts.speedBpt;
  let y = Math.sin(pitch) * opts.length;
  const x0 = Math.cos(pitch) * opts.length;
  const path = [{ x: 0, y: 0 }, { x: x0, y }];
  const maxTicks = Math.max(1, Math.ceil(Math.min(ticks || opts.maxSteps, opts.maxSteps)));

  for (let tick = 1; tick <= maxTicks; tick += 1) {
    y += vy;
    vy = opts.drag * vy - opts.gravity;
    const x = x0 + vw * (1 - opts.drag ** tick) / (1 - opts.drag);
    path.push({ x, y });
    if (x >= opts.distance) break;
  }

  return { path };
}

// simulate legacy physics until projectile returns to or below muzzle height, return horizontal distance
function simulateLegacyRange(pitchDeg, speedBpt, length, opts) {
  const pitch = rad(pitchDeg);
  const vw = Math.cos(pitch) * speedBpt;
  let vy = Math.sin(pitch) * speedBpt;
  let y = Math.sin(pitch) * length;
  const x0 = Math.cos(pitch) * length;
  const maxTicks = Math.max(1, Math.floor(opts.maxSteps || 1200));

  for (let tick = 1; tick <= maxTicks; tick += 1) {
    y += vy;
    vy = opts.drag * vy - opts.gravity;
    const x = x0 + vw * (1 - opts.drag ** tick) / (1 - opts.drag);
    if (y <= 0) return { hit: true, x, ticks: tick };
  }

  const xEnd = x0 + vw * (1 - opts.drag ** maxTicks) / (1 - opts.drag);
  return { hit: false, x: xEnd, ticks: maxTicks };
}

// simulate improved physics until projectile returns to or below muzzle height, return horizontal distance
function simulateImprovedRange(pitchDeg, speedBpt, length, opts, props) {
  const pitch = rad(pitchDeg);
  let vx = Math.cos(pitch) * speedBpt;
  let vy = Math.sin(pitch) * speedBpt;
  let y = Math.sin(pitch) * length;
  let x = Math.cos(pitch) * length;
  const maxTicks = Math.max(1, Math.floor(opts.maxSteps || 1200));

  const rho = 1.225; // kg/m^3
  const area = Math.PI * (props.radius ** 2);
  const k_drag = (rho * props.cd * area) / (2 * props.mass);

  for (let tick = 1; tick <= maxTicks; tick += 1) {
    const vtot = Math.hypot(vx, vy);
    if (vtot === 0) return { hit: false, x, ticks: tick };
    const aDrag = props.useQuadratic ? k_drag * vtot * vtot : k_drag * vtot;
    const dragX = (vx / vtot) * aDrag;
    const dragY = (vy / vtot) * aDrag;

    vy -= dragY;
    vy -= opts.gravity;
    vx -= dragX;

    x += vx;
    y += vy;
    if (y <= 0) return { hit: true, x, ticks: tick };
  }

  return { hit: false, x, ticks: maxTicks };
}

function computeMaxDistance(opts, method = "original", props = null) {
  const amin = opts.amin ?? -30;
  const amax = opts.amax ?? 60;
  const aminClamped = Math.max(-89, amin);
  const amaxClamped = Math.min(89, amax);

  let best = { x: -Infinity, p: null };

  // coarse pass
  const coarseStep = 1;
  for (let p = aminClamped; p <= amaxClamped; p += coarseStep) {
    const res = method === "improved" ? simulateImprovedRange(p, opts.speedBpt, opts.length, opts, props) : simulateLegacyRange(p, opts.speedBpt, opts.length, opts);
    if (Number.isFinite(res.x) && res.x > best.x) best = { x: res.x, p };
  }

  // refine around best pitch
  if (best.p === null) return { maxDistance: NaN, bestPitch: null };
  const refineRange = 1;
  const refineStep = 0.1;
  const start = Math.max(aminClamped, best.p - refineRange);
  const end = Math.min(amaxClamped, best.p + refineRange);
  for (let p = start; p <= end; p += refineStep) {
    const res = method === "improved" ? simulateImprovedRange(p, opts.speedBpt, opts.length, opts, props) : simulateLegacyRange(p, opts.speedBpt, opts.length, opts);
    if (Number.isFinite(res.x) && res.x > best.x) best = { x: res.x, p };
  }

  return { maxDistance: best.x, bestPitch: best.p };
}

function clearOutputs() {
  ["chosenPitch", "lowPitch", "highPitch", "flightTime", "speedBpt", "usedMethod", "currentDistance", "maxDistance"].forEach((id) => {
    $(id).textContent = "-";
  });
  const yawEl = $("yaw");
  const useCoordsEl = $("useCoords");
  const useCoords = useCoordsEl ? useCoordsEl.checked : false;
  if (useCoords && yawEl) {
    const cannonX = $("cannonX") ? num("cannonX") : 0;
    const cannonZ = $("cannonZ") ? num("cannonZ") : 0;
    const targetX = $("targetX") ? num("targetX") : num("distance");
    const targetZ = $("targetZ") ? num("targetZ") : 0;
    const dxYaw = targetX - cannonX;
    const dzYaw = targetZ - cannonZ;
    // invert yaw: make right negative, left positive by negating atan2 result
    let yawDeg = -Math.atan2(dxYaw, dzYaw) * 180 / Math.PI; // 0 = +Z
    if (yawDeg >= 180) yawDeg -= 360;
    if (yawDeg < -180) yawDeg += 360;
    yawEl.textContent = `${fmt(yawDeg, 4)}°`;
  } else if (yawEl) {
    yawEl.textContent = "";
  }
  $("debug").textContent = "";
}

function setStatus(text, className) {
  const el = $("status");
  el.textContent = text;
  el.className = `status ${className}`;
}

function drawTrajectory(hit, opts) {
  const canvas = $("trajectory");
  const ctx = canvas.getContext("2d");
  const w = canvas.width;
  const h = canvas.height;
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = "#07090b";
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = "#1d232b";
  ctx.lineWidth = 1;

  for (let i = 1; i < 6; i += 1) {
    const y = (h / 6) * i;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }

  const path = hit?.path || null;
  if (!path || path.length < 2) {
    ctx.fillStyle = "#8c96a6";
    ctx.fillText("No trajectory", 24, 34);
    return;
  }

  const maxX = Math.max(opts.distance, ...path.map((p) => p.x), 1);
  const minY = Math.min(opts.heightDelta, ...path.map((p) => p.y), 0);
  const maxY = Math.max(opts.heightDelta, ...path.map((p) => p.y), 1);
  const pad = 26;
  const sx = (x) => pad + (x / maxX) * (w - pad * 2);
  const sy = (y) => h - pad - ((y - minY) / Math.max(maxY - minY, 1)) * (h - pad * 2);

  ctx.strokeStyle = "#44d7b6";
  ctx.lineWidth = 2;
  ctx.beginPath();
  path.forEach((p, i) => {
    if (i === 0) ctx.moveTo(sx(p.x), sy(p.y));
    else ctx.lineTo(sx(p.x), sy(p.y));
  });
  ctx.stroke();

  ctx.fillStyle = "#e8c468";
  ctx.beginPath();
  ctx.arc(sx(opts.distance), sy(opts.heightDelta), 5, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#f1f4f8";
  ctx.beginPath();
  ctx.arc(sx(0), sy(0), 4, 0, Math.PI * 2);
  ctx.fill();
}

function t(key) {
  return I18N[lang][key] || I18N.en[key] || key;
}

function applyLanguage(nextLang) {
  lang = nextLang;
  localStorage.setItem("cbcCalcLang", lang);
  document.documentElement.lang = lang;
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.dataset.i18n;
    if (I18N[lang][key]) el.textContent = I18N[lang][key];
  });
  document.querySelectorAll("[data-lang]").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.lang === lang);
  });
  fillMethods();
  updateUIForMethod();
  updateInputMode();
  render();
}

function fillProjectiles() {
  const select = $("projectile");
  PROJECTILES.sort().forEach((id) => {
    const option = document.createElement("option");
    option.value = id;
    option.textContent = id;
    select.appendChild(option);
  });
  select.value = "createbigcannons:ap_shell";
}

function resetDefaults() {
  $("length").value = 8;
  $("speedMps").value = 400;
  $("distance").value = 300;
  $("heightDelta").value = 0;
  $("projectile").value = "createbigcannons:ap_shell";
  $("method").value = "original";
  $("preferArc").value = "low";
  $("amin").value = -30;
  $("amax").value = 60;
  $("gravity").value = 0.05;
  $("drag").value = 0.99;
  $("mass").value = 10;
  $("radius").value = 0.05;
  $("cd").value = 0.47;
  $("useQuadratic").checked = true;
  $("maxDelta").value = 1;
  $("maxSteps").value = 1000000;
  $("iterations").value = 5;
  $("elements").value = 20;
  $("checkImpossible").checked = true;
  if ($("useCoords")) $("useCoords").checked = false;
  if ($("cannonX")) $("cannonX").value = 0;
  if ($("cannonY")) $("cannonY").value = 0;
  if ($("cannonZ")) $("cannonZ").value = 0;
  if ($("targetX")) $("targetX").value = 300;
  if ($("targetY")) $("targetY").value = 0;
  if ($("targetZ")) $("targetZ").value = 0;
  render();
}

fillProjectiles();
fillMethods();
updateUIForMethod();
fields.forEach((id) => {
  const el = $(id);
  el.addEventListener("input", render);
  el.addEventListener("change", render);
});

// coordinate mode toggle should update UI
if ($("useCoords")) $("useCoords").addEventListener("change", () => { updateInputMode(); render(); });
updateInputMode();

// Ensure method/projectile changes toggle UI specifically
if ($("method")) $("method").addEventListener("change", () => { updateUIForMethod(); render(); });
if ($("projectile")) $("projectile").addEventListener("change", () => { updateUIForMethod(); render(); });
document.querySelectorAll("[data-lang]").forEach((btn) => {
  btn.addEventListener("click", () => applyLanguage(btn.dataset.lang));
});
$("resetBtn").addEventListener("click", resetDefaults);
applyLanguage(lang);
