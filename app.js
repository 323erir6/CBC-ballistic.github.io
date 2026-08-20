"use strict";

const TICKS_PER_SECOND = 20;

// cbc_realistic_ballistics.js is generated from the actual 6.8.3 modpack
// registries/properties. Keep a tiny CBC-only fallback for offline editing.
const PROJECTILES = window.CBCRealisticBallistics
  ? window.CBCRealisticBallistics.PROJECTILES.map((entry) => entry.id)
  : [
      "createbigcannons:shot",
      "createbigcannons:ap_shot",
      "createbigcannons:ap_shell",
      "createbigcannons:he_shell"
    ];

const I18N = {
  en: {
    eyebrow: "Create: Big Cannons & Mianbao",
    title: "Ballistic calculator",
    shotSetup: "Shot setup",
    reset: "Reset",
    calculate: "Calculate",
    barrelLength: "Total cannon length",
    blocks: "blocks / meters",
    velocityMps: "Projectile speed",
    mpsHint: "m/s",
    projectileType: "Projectile type",
    cannonType: "Cannon",
    cannonVariantsHint: "All equivalent material variants are grouped",
    worldSeed: "World seed",
    worldSeedHint: "Required for the exact static wind field",
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
    yaw: "Selected yaw",
    lowYaw: "Low yaw",
    highYaw: "High yaw",
    usedMethod: "Used method",
    currentDistance: "Current distance",
    maxDistance: "Max distance",
    noSolution: "No solution",
    solved: "Solved",
    invalid: "Invalid input",
    originalFormula: "Old Ballistics.lua",
    newFormula: "New Ballistics.lua",
    realisticFormula: "CBC Realistic Ballistics",
    method: "Method",
    improvedMethod: "Improved (projectile-aware)",
    mass: "Mass (kg)",
    radius: "Radius (m)",
    cd: "Drag coeff (C_d)",
    useQuadratic: "Use quadratic drag",
    useCoordinates: "Use coordinates",
    cannonCoords: "Cannon (X,Y,Z)",
    targetCoords: "Target (X,Y,Z)",
    calculatorType: "Ballistics system",
    rocketLauncher: "Rocket launcher",
    rocketType: "Rocket type",
    missileLifetime: "Missile lifetime",
    secondsHint: "seconds; must match the Mianbao lifetime config",
    rangeCorrection: "Aim range correction",
    rangeCorrectionHint: "added to the ballistic distance, in meters",
    mianbaoMethod: "Exact Mianbao trajectory"
  },
  ru: {
    eyebrow: "Create: Big Cannons & Mianbao",
    title: "Баллистический калькулятор",
    shotSetup: "Параметры выстрела",
    reset: "Сброс",
    calculate: "Рассчитать",
    barrelLength: "Общая длина пушки",
    blocks: "блоки / метры",
    velocityMps: "Скорость снаряда",
    mpsHint: "м/с",
    projectileType: "Тип снаряда",
    cannonType: "Орудие",
    cannonVariantsHint: "Материальные варианты с одинаковой баллистикой сгруппированы",
    worldSeed: "Seed мира",
    worldSeedHint: "Нужен для точного расчёта статического ветра",
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
    yaw: "Yaw выбранной дуги",
    lowYaw: "Yaw низкой дуги",
    highYaw: "Yaw высокой дуги",
    usedMethod: "Метод",
    currentDistance: "Текущая дистанция",
    maxDistance: "Максимальная дистанция",
    noSolution: "Нет решения",
    solved: "Рассчитано",
    invalid: "Некорректный ввод",
    originalFormula: "Старый Ballistics.lua",
    newFormula: "Новая Ballistics.lua",
    realisticFormula: "CBC Realistic Ballistics",
    method: "Метод",
    improvedMethod: "Improved (с учётом типа снаряда)",
    mass: "Масса (кг)",
    radius: "Радиус (м)",
    cd: "Коэффициент сопротивления (C_d)",
    useQuadratic: "Квадратичный воздух",
    useCoordinates: "Использовать координаты",
    cannonCoords: "Пушка (X,Y,Z)",
    targetCoords: "Цель (X,Y,Z)",
    calculatorType: "Баллистическая система",
    rocketLauncher: "Ракетная установка",
    rocketType: "Тип ракеты",
    missileLifetime: "Время жизни ракеты",
    secondsHint: "секунды; значение должно совпадать с конфигом Mianbao",
    rangeCorrection: "Поправка дальности наведения",
    rangeCorrectionHint: "добавляется к баллистической дистанции, в метрах",
    mianbaoMethod: "Точная траектория Mianbao"
  },
  uk: {
    eyebrow: "Create: Big Cannons & Mianbao",
    title: "Балістичний калькулятор",
    shotSetup: "Параметри пострілу",
    reset: "Скинути",
    calculate: "Розрахувати",
    barrelLength: "Загальна довжина гармати",
    blocks: "блоки / метри",
    velocityMps: "Швидкість снаряда",
    mpsHint: "м/с",
    projectileType: "Тип снаряда",
    cannonType: "Гармата",
    cannonVariantsHint: "Матеріальні варіанти з однаковою балістикою згруповані",
    worldSeed: "Seed світу",
    worldSeedHint: "Потрібен для точного розрахунку статичного вітру",
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
    yaw: "Yaw обраної дуги",
    lowYaw: "Yaw низької дуги",
    highYaw: "Yaw високої дуги",
    usedMethod: "Метод",
    currentDistance: "Поточна дистанція",
    maxDistance: "Максимальна дистанція",
    noSolution: "Немає рішення",
    solved: "Розраховано",
    invalid: "Некоректний ввід",
    originalFormula: "Старий Ballistics.lua",
    newFormula: "Новий Ballistics.lua",
    realisticFormula: "CBC Realistic Ballistics",
    method: "Метод",
    improvedMethod: "Поліпшений (враховує тип снаряду)",
    mass: "Маса (кг)",
    radius: "Радіус (м)",
    cd: "Коефіцієнт опору (C_d)",
    useQuadratic: "Квадратичний опір",
    useCoordinates: "Вводити координати",
    cannonCoords: "Гармата (X,Y,Z)",
    targetCoords: "Ціль (X,Y,Z)",
    calculatorType: "Балістична система",
    rocketLauncher: "Ракетна установка",
    rocketType: "Тип ракети",
    missileLifetime: "Час життя ракети",
    secondsHint: "секунди; значення має збігатися з конфігом Mianbao",
    rangeCorrection: "Поправка дальності наведення",
    rangeCorrectionHint: "додається до балістичної дистанції, у метрах",
    mianbaoMethod: "Точна траєкторія Mianbao"
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
  "maxDelta",
  "maxSteps",
  "iterations",
  "elements",
  "checkImpossible"
];

fields.push("missileLifetime", "rocketCompensation");

fields.push(
  "worldSeed", "dimensionId", "weatherMode", "biomeTemperature",
  "referenceMass", "projectileDiameter", "realisticCd", "realisticGravity",
  "seaLevelY", "scaleHeight", "projectileDensity", "lengthCalibers",
  "solidFraction", "realisticWindEnabled", "windSpeed", "windDirection",
  "gustSpeed", "weatherAffectsWind", "windRegionSize", "windSeedSalt",
  "windDirectionVariation", "windSpeedVariation", "rainWindBonus",
  "thunderWindBonus", "rainGustBonus", "thunderGustBonus",
  "verticalTurbulence", "altitudeWindMultiplier", "enableCoriolis",
  "latitude", "enableSpinDrift", "spinDriftFactor"
);

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
  return Number(Number(value).toFixed(digits)).toString();
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
// New Ballistics (ported from New_Ballistics.lua)
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
  const L = length / 2;
  const x = L * Math.cos(pitch);
  if (Vw === 0) return null;

  const current_drag = (drag === undefined || drag === null) ? 0.99 : drag;
  const denom = (1 / (1 - current_drag)) * Vw;
  const part = 1 - (distance - x) / denom;
  if (part <= 0) return null;

  const time_h = Math.abs(Math.log(part) / Math.log(current_drag));
  const y_end = cannon[1] + Math.sin(pitch) * L;

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

    if (c1) {
      dTs1.sort((a, b) => a[0] - b[0]);
      r1 = dTs1[0]; p1 = r1[1];
    }
    if (c2) {
      dTs2.sort((a, b) => a[0] - b[0]);
      r2 = dTs2[0]; p2 = r2[1];
    }
  }

  if (same) r2 = r1;

  if (checkImpossible && r1[0] > maxDelta) r1 = [-1, -1, -1];
  if (checkImpossible && r2[0] > maxDelta) r2 = [-1, -1, -1];

  return { low: r1, high: r2, ok: r1[1] !== -1 || r2[1] !== -1 };
}

function simulateNewRange(pitchDeg, speedBpt, length, opts) {
  const pitch = rad(pitchDeg);
  const Vw = Math.cos(pitch) * speedBpt;
  let vy = Math.sin(pitch) * speedBpt;
  const L = length / 2;
  let y = Math.sin(pitch) * L;
  const x0 = Math.cos(pitch) * L;
  const maxTicks = Math.max(1, Math.floor(opts.maxSteps || 1200));

  for (let tick = 1; tick <= maxTicks; tick += 1) {
    // vertical: advance by current vy, then apply drag and gravity (matches Lua timeInAir)
    y += vy;
    vy = opts.drag * vy - opts.gravity;

    // horizontal: closed-form geometric-series position for multiplicative drag
    const x = x0 + Vw * (1 - Math.pow(opts.drag, tick)) / (1 - opts.drag);
    if (y <= 0) return { hit: true, x, ticks: tick };
  }

  const xEnd = x0 + Vw * (1 - Math.pow(opts.drag, maxTicks)) / (1 - opts.drag);
  return { hit: false, x: xEnd, ticks: maxTicks };
}

function buildNewPath(pitchDeg, ticks, opts) {
  const pitch = rad(pitchDeg);
  const vw = Math.cos(pitch) * opts.speedBpt;
  let vy = Math.sin(pitch) * opts.speedBpt;
  const L = opts.length / 2;
  let y = Math.sin(pitch) * L;
  const x0 = Math.cos(pitch) * L;
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

// --- Improved projectile-aware simulation ---
function fillRocketLaunchers() {
  const select = $("rocketLauncher");
  if (!select || !window.MianbaoBallistics) return;
  const previous = select.value;
  const launchers = [];
  window.MianbaoBallistics.MODES.forEach((mode) => {
    if (!launchers.some((entry) => entry.id === mode.launcherId)) {
      launchers.push({ id: mode.launcherId, label: mode.launcher });
    }
  });
  select.innerHTML = "";
  launchers.forEach((launcher) => {
    const option = document.createElement("option");
    option.value = launcher.id;
    option.textContent = launcher.label;
    select.appendChild(option);
  });
  select.value = launchers.some((launcher) => launcher.id === previous)
    ? previous
    : "medium_pod";
}

function fillRocketModes() {
  const launcher = $("rocketLauncher");
  const select = $("rocketMode");
  if (!launcher || !select || !window.MianbaoBallistics) return;
  const previous = select.value;
  const modes = window.MianbaoBallistics.MODES.filter(
    (mode) => mode.launcherId === launcher.value
  );
  select.innerHTML = "";
  modes.forEach((mode) => {
    const option = document.createElement("option");
    option.value = mode.id;
    option.textContent = mode.ammunition;
    select.appendChild(option);
  });
  select.value = modes.some((mode) => mode.id === previous) ? previous : modes[0]?.id || "";
  syncRocketModeDefaults();
}

function syncRocketModeDefaults() {
  const mode = window.MianbaoBallistics?.getMode($("rocketMode")?.value);
  if (mode && $("rocketCompensation")) {
    $("rocketCompensation").value = mode.rangeCompensationBlocks || 0;
  }
}

function updateCalculatorType() {
  const mianbao = $("calculatorType")?.value === "mianbao";
  document.querySelectorAll(".cbc-only").forEach((element) => {
    element.style.display = mianbao ? "none" : "";
  });
  const setup = $("mianbaoSetup");
  if (setup) setup.hidden = !mianbao;
  updateUIForMethod();
}

function fillMethods() {
  const sel = $("method");
  if (!sel) return;
  const previous = sel.value;
  sel.innerHTML = "";
  const o1 = document.createElement("option");
  o1.value = "new";
  o1.textContent = t("newFormula");
  sel.appendChild(o1);
  const o2 = document.createElement("option");
  o2.value = "realistic";
  o2.textContent = t("realisticFormula");
  sel.appendChild(o2);
  sel.value = ["new", "realistic"].includes(previous) ? previous : "new";
}

function syncRealisticProjectileDefaults() {
  if (!window.CBCRealisticBallistics) return;
  const props = window.CBCRealisticBallistics.projectileDefaults($("projectile").value);
  if (!props) return;
  const cannon = window.CBCRealisticBallistics.CANNONS
    .find((entry) => entry.id === $("cannonProfile")?.value);
  $("referenceMass").value = props.referenceMass;
  $("projectileDiameter").value = cannon?.caliber ?? props.diameter;
  $("realisticCd").value = props.cd;
}

function syncCannonVelocity() {
  const input = $("speedMps");
  if (!input) return;
  const useFixedValue = $("calculatorType")?.value === "cbc"
    && $("method")?.value === "realistic";
  const fixedVelocity = useFixedValue
    ? window.CBCRealisticBallistics?.fixedMuzzleVelocity(
        $("cannonProfile")?.value,
        $("projectile")?.value,
        num("length")
      )
    : null;
  const fixed = Number.isFinite(fixedVelocity);

  input.disabled = fixed;
  input.title = fixed ? "Fixed by the selected weapon" : "";
  if (fixed) input.value = fmt(fixedVelocity, 3);
}

function fillCannons() {
  const select = $("cannonProfile");
  const profiles = window.CBCRealisticBallistics?.CANNONS || [];
  if (!select) return;
  select.innerHTML = "";
  profiles.forEach((profile) => {
    const option = document.createElement("option");
    option.value = profile.id;
    option.textContent = profile.caliber
      ? `${profile.name} — ${fmt(profile.caliber * 1000, 0)} mm`
      : profile.name;
    select.appendChild(option);
  });
  select.value = profiles.some((entry) => entry.id === "cbc_big_cannon")
    ? "cbc_big_cannon" : profiles[0]?.id || "";
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
  const mianbao = $("calculatorType")?.value === "mianbao";
  const method = $("method").value;
  const realisticEls = document.querySelectorAll(".method-realistic");
  const projectileEl = $("projectile");
  const gravityEl = $("gravity") ? $("gravity").parentElement : null;
  const dragEl = $("drag") ? $("drag").parentElement : null;
  if (mianbao) {
    realisticEls.forEach((el) => { el.style.display = "none"; });
    return;
  }
  realisticEls.forEach((el) => { el.style.display = method === "realistic" ? "" : "none"; });
  projectileEl.disabled = false;
  if (method === "realistic") {
    if (gravityEl) gravityEl.style.display = "none";
    if (dragEl) dragEl.style.display = "none";
  } else {
    if (gravityEl) gravityEl.style.display = "";
    if (dragEl) dragEl.style.display = "";
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
  const calculatorType = $("calculatorType")?.value || "cbc";
  const useCoords = $("useCoords") ? $("useCoords").checked : false;
  const cannonX = $("cannonX") ? num("cannonX") : 0;
  const cannonY = $("cannonY") ? num("cannonY") : 0;
  const cannonZ = $("cannonZ") ? num("cannonZ") : 0;
  const targetX = $("targetX") ? num("targetX") : num("distance");
  const targetY = $("targetY") ? num("targetY") : num("heightDelta");
  const targetZ = $("targetZ") ? num("targetZ") : 0;

  const horiz = Math.sqrt((targetX - cannonX) ** 2 + (targetZ - cannonZ) ** 2);
  // Keep the legacy/New Ballistics motor limit at +60. CBC Realistic may
  // search a separate high arc up to +89 without changing its low-arc scan.
  const aminVal = num("amin");
  const amaxRaw = num("amax");
  const realisticMode = calculatorType === "cbc" && $("method")?.value === "realistic";
  const amaxLimit = calculatorType === "mianbao" || realisticMode ? 89 : 60;
  const amaxVal = Number.isFinite(amaxRaw) ? Math.min(amaxRaw, amaxLimit) : amaxLimit;

  return {
    calculatorType,
    rocketMode: $("rocketMode")?.value || "medium_pod_he",
    missileLifetime: num("missileLifetime"),
    rocketCompensation: num("rocketCompensation"),
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

function collectRealisticConfig(opts) {
  return {
    worldSeed: opts.useCoords ? $("worldSeed").value : "0",
    dimensionId: $("dimensionId").value || "minecraft:overworld",
    weather: $("weatherMode").value,
    biomeTemperature: num("biomeTemperature"),
    referenceMass: num("referenceMass"),
    diameter: num("projectileDiameter"),
    cd: num("realisticCd"),
    gravity: num("realisticGravity"),
    seaLevelY: num("seaLevelY"),
    scaleHeight: num("scaleHeight"),
    projectileDensity: num("projectileDensity"),
    lengthCalibers: num("lengthCalibers"),
    solidFraction: num("solidFraction"),
    windEnabled: $("realisticWindEnabled").checked,
    windSpeed: num("windSpeed"),
    windDirection: num("windDirection"),
    gustSpeed: num("gustSpeed"),
    weatherAffectsWind: $("weatherAffectsWind").checked,
    windRegionSize: num("windRegionSize"),
    seedSalt: opts.useCoords ? $("windSeedSalt").value : "0",
    windDirectionVariation: num("windDirectionVariation"),
    windSpeedVariation: num("windSpeedVariation"),
    rainWindBonus: num("rainWindBonus"),
    thunderWindBonus: num("thunderWindBonus"),
    rainGustBonus: num("rainGustBonus"),
    thunderGustBonus: num("thunderGustBonus"),
    verticalTurbulence: num("verticalTurbulence"),
    altitudeWindMultiplier: num("altitudeWindMultiplier"),
    enableCoriolis: $("enableCoriolis").checked,
    latitude: num("latitude"),
    enableSpinDrift: $("enableSpinDrift").checked,
    spinDriftFactor: num("spinDriftFactor"),
    minPitch: opts.amin,
    maxPitch: opts.amax,
    maxTicks: opts.maxSteps,
    allowedMiss: Math.max(0.05, opts.maxDelta)
  };
}

function renderMianbao(opts) {
  const physics = window.MianbaoBallistics;
  const mode = physics?.getMode(opts.rocketMode);
  const maxTicks = Math.max(1, Math.floor(opts.missileLifetime * TICKS_PER_SECOND));
  const invalid = !mode
    || !Number.isFinite(opts.distance) || opts.distance <= 0
    || !Number.isFinite(opts.heightDelta)
    || !Number.isFinite(opts.missileLifetime) || opts.missileLifetime <= 0
    || !Number.isFinite(opts.amin) || !Number.isFinite(opts.amax) || opts.amin >= opts.amax;

  let cannon = [0, 0, 0];
  let target = [opts.distance, opts.heightDelta, 0];
  if (opts.useCoords) {
    cannon = opts.cannon;
    target = opts.target;
  }
  const dx = target[0] - cannon[0];
  const dy = target[1] - cannon[1];
  const dz = target[2] - cannon[2];
  const horizontalDistance = Math.hypot(dx, dz);
  $("currentDistance").textContent = Number.isFinite(horizontalDistance)
    ? `${fmt(horizontalDistance, 3)} m`
    : "-";

  if (invalid) {
    setStatus(t("invalid"), "bad");
    clearOutputs();
    drawTrajectory(null, opts);
    return;
  }

  const solveOptions = {
    arc: opts.preferArc,
    minimumPitchDeg: opts.amin,
    maximumPitchDeg: opts.amax,
    maxTicks,
    scanStepDeg: 0.25,
    rangeCompensationBlocks: opts.rocketCompensation
  };
  const solution = physics.solveCoordinates(dx, dy, dz, mode, solveOptions);
  const maximum = physics.maximumRange(mode, solveOptions);

  $("maxDistance").textContent = maximum
    ? `${fmt(maximum.range, 2)} m @ ${fmt(maximum.pitchDeg, 2)}°`
    : "-";
  $("speedBpt").textContent = `${fmt(mode.speed, 3)} m/tick / ${Math.round(mode.speed * TICKS_PER_SECOND)} m/s`;
  $("usedMethod").textContent = t("mianbaoMethod");

  let yawDeg = -Math.atan2(dx, dz) * 180 / Math.PI;
  if (yawDeg >= 180) yawDeg -= 360;
  if (yawDeg < -180) yawDeg += 360;
  $("yaw").textContent = `${fmt(yawDeg, 4)}°`;

  if (!solution.ok) {
    setStatus(t("noSolution"), "bad");
    $("chosenPitch").textContent = "-";
    $("lowPitch").textContent = "-";
    $("highPitch").textContent = "-";
    $("flightTime").textContent = "-";
    drawTrajectory(null, opts);
  } else {
    setStatus(t("solved"), "ok");
    $("chosenPitch").textContent = `${fmt(solution.selectedPitchDeg, 4)}°`;
    $("lowPitch").textContent = `${fmt(solution.lowPitchDeg, 4)}°`;
    $("highPitch").textContent = solution.highPitchDeg === null
      ? "-"
      : `${fmt(solution.highPitchDeg, 4)}°`;
    $("flightTime").textContent = `${fmt(solution.flightTicks, 2)} ticks / ${fmt(solution.time, 2)} s`;
    const path = physics.buildPath(
      solution.selectedPitchDeg,
      mode,
      maxTicks,
      solution.flightTicks
    );
    drawTrajectory({ path }, opts);
  }

  $("debug").textContent = JSON.stringify({
    source: "Mianbao Modern Warfare 1.3.0 / NURS_ART",
    method: "mianbao-exact",
    launcher: mode.launcher,
    ammunition: mode.ammunition,
    mode: mode.id,
    speedBlocksPerTick: mode.speed,
    gravityPerTick: mode.gravityPerTick,
    firstTickGravity: mode.firstTickGravity,
    randomInaccuracy: [mode.inaccuracyMin, mode.inaccuracyMax],
    missileLifetimeSeconds: opts.missileLifetime,
    maxTicks,
    cannon,
    target,
    solution,
    maximumRange: maximum
  }, null, 2);
}

// MANUAL_REALISTIC_CALCULATE_20260820_V1
function isManualRealisticMode() {
  return $("calculatorType")?.value === "cbc" && $("method")?.value === "realistic";
}

function updateSeedVisibility() {
  const visible = isManualRealisticMode() && Boolean($("useCoords")?.checked);
  document.querySelectorAll(".seed-coordinate-only").forEach((element) => {
    element.style.display = visible ? "" : "none";
  });
}

function renderAfterInputChange() {
  if (isManualRealisticMode()) {
    clearOutputs();
    setStatus(t("calculate"), "warn");
    drawTrajectory(null, collectOptions());
    return;
  }
  render();
}

// REALISTIC_SEPARATE_ARC_YAW_20260820_V1
function motorYawForRealisticSolution(solution) {
  if (!solution || !Number.isFinite(solution.yawDeg)) return null;
  let motorYaw = -solution.yawDeg;
  if (motorYaw >= 180) motorYaw -= 360;
  if (motorYaw < -180) motorYaw += 360;
  return motorYaw;
}

function render() {
  const opts = collectOptions();
  if (opts.calculatorType === "mianbao") {
    renderMianbao(opts);
    return;
  }
  // Old site builds may have left a removed method in browser state. Treat
  // every value except the realistic solver as New Ballistics.
  const method = $("method")?.value === "realistic" ? "realistic" : "new";
  const invalid = !Number.isFinite(opts.speedBpt) || opts.speedBpt <= 0
    || !Number.isFinite(opts.distance) || opts.distance <= 0 || opts.amin >= opts.amax
    || (method !== "realistic" && (opts.drag <= 0 || opts.drag === 1));
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

  let result, chosen, fallback, preferred, ok, debugObj, pathObj;
  let realisticYawHandled = false;

  if (method === "realistic") {
    const physics = window.CBCRealisticBallistics;
    const config = collectRealisticConfig(opts);
    if (!physics || !Number.isFinite(config.referenceMass) || config.referenceMass <= 0
        || !Number.isFinite(config.diameter) || config.diameter <= 0
        || !Number.isFinite(config.cd) || config.cd < 0) {
      setStatus(t("invalid"), "bad");
      clearOutputs();
      drawTrajectory(null, opts);
      return;
    }

    result = physics.solve(cannon, target, opts.speedBpt, config, opts.preferArc);
    chosen = result.selected;
    ok = Boolean(result.ok && chosen);
    setStatus(ok ? t("solved") : t("noSolution"), ok ? "ok" : "bad");
    $("chosenPitch").textContent = chosen ? `${fmt(chosen.pitchDeg, 4)}°` : "-";
    $("lowPitch").textContent = result.low ? `${fmt(result.low.pitchDeg, 4)}°` : "-";
    $("highPitch").textContent = result.high ? `${fmt(result.high.pitchDeg, 4)}°` : "-";

    const lowMotorYaw = motorYawForRealisticSolution(result.low);
    const highMotorYaw = motorYawForRealisticSolution(result.high);
    $("lowYaw").textContent = lowMotorYaw === null ? "-" : `${fmt(lowMotorYaw, 4)}°`;
    $("highYaw").textContent = highMotorYaw === null ? "-" : `${fmt(highMotorYaw, 4)}°`;

    $("flightTime").textContent = chosen
      ? `${fmt(chosen.ticks, 2)} ticks / ${fmt(chosen.ticks / TICKS_PER_SECOND, 2)} s` : "-";
    $("speedBpt").textContent = `${fmt(opts.speedBpt, 4)} m/tick`;
    $("usedMethod").textContent = t("realisticFormula");
    pathObj = chosen ? { path: chosen.path } : null;

    const bearing = Math.atan2(target[0] - cannon[0], target[2] - cannon[2]) * 180 / Math.PI;
    const maximum = physics.maximumRange(cannon, opts.speedBpt, config, bearing);
    $("maxDistance").textContent = maximum && Number.isFinite(maximum.range)
      ? `${fmt(maximum.range, 3)} m @ ${fmt(maximum.pitchDeg, 2)}°` : "-";
    if (chosen) {
      const motorYaw = motorYawForRealisticSolution(chosen);
      $("yaw").textContent = motorYaw === null ? "-" : `${fmt(motorYaw, 4)}°`;
      realisticYawHandled = true;
    }
    const debugConfig = { ...config };
    delete debugConfig._windSeed;
    const compactSolution = {
      ok: result.ok,
      low: result.low ? { ...result.low, path: undefined } : null,
      high: result.high ? { ...result.high, path: undefined } : null,
      selected: result.selected ? { ...result.selected, path: undefined } : null
    };
    debugObj = {
      source: "CBC Realistic Ballistics browser port",
      method: "realistic",
      projectile: opts.projectile,
      cannonProfile: $("cannonProfile")?.value,
      note: "Matches the mod's static seed-derived wind and aerodynamic trajectory model.",
      cannon,
      target,
      velocityMps: opts.speedMps,
      velocityBpt: opts.speedBpt,
      windAtMuzzleBpt: physics.windAt(cannon, config),
      config: debugConfig,
      solution: compactSolution,
      maximumRange: maximum
    };
  } else if (method === "original") {
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
  } else if (method === "new") {
    // new legacy-style method: uses the new Ballistics formula (ported from New_Ballistics.lua)
    result = calculatePitchNew(cannon, target, opts.speedBpt, opts.length, opts);

    function classifyArcsNew(l, h) {
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

    const classifiedNew = classifyArcsNew(result.low, result.high);
    const lowArcNew = classifiedNew.low;
    const highArcNew = classifiedNew.high;

    const preferredArcNew = opts.preferArc === "high" ? highArcNew : lowArcNew;
    const fallbackArcNew = opts.preferArc === "high" ? lowArcNew : highArcNew;
    chosen = preferredArcNew[1] !== -1 ? preferredArcNew : fallbackArcNew;
    ok = result.ok && chosen[1] !== -1;

    setStatus(ok ? t("solved") : t("noSolution"), ok ? "ok" : "bad");
    $("chosenPitch").textContent = ok && chosen[1] !== -1 ? `${fmt(chosen[1], 4)}°` : "-";
    $("lowPitch").textContent = lowArcNew[1] !== -1 ? `${fmt(lowArcNew[1], 4)}°` : "-";
    $("highPitch").textContent = highArcNew[1] !== -1 ? `${fmt(highArcNew[1], 4)}°` : "-";
    $("flightTime").textContent = ok && chosen[2] !== -1 ? `${fmt(chosen[2], 2)} ticks / ${fmt(chosen[2] / TICKS_PER_SECOND, 2)} s` : "-";
    $("speedBpt").textContent = `${fmt(opts.speedBpt, 4)} m/tick`;
    $("usedMethod").textContent = t("newFormula");

    pathObj = ok ? buildNewPath(chosen[1], chosen[2], opts) : null;

    try {
      const maxRes = computeMaxDistance(opts, "new", null);
      $("maxDistance").textContent = Number.isFinite(maxRes.maxDistance) ? `${fmt(maxRes.maxDistance, 3)}` : "-";
    } catch (e) {
      $("maxDistance").textContent = "-";
    }

    debugObj = {
      source: "Lua/Artillery_all/New_Ballistics.lua",
      method: "new",
      projectile: opts.projectile,
      note: "New Ballistics.lua (ported).",
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
  if (!realisticYawHandled && opts.useCoords) {
    const dxYaw = target[0] - cannon[0];
    const dzYaw = target[2] - cannon[2];
    // invert yaw: make right negative, left positive by negating atan2 result
    let yawDeg = -Math.atan2(dxYaw, dzYaw) * 180 / Math.PI; // 0 = +Z
    if (yawDeg >= 180) yawDeg -= 360;
    if (yawDeg < -180) yawDeg += 360;
    $("yaw").textContent = `${fmt(yawDeg, 4)}°`;
  } else if (!realisticYawHandled) {
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
    let res;
    if (method === "improved") res = simulateImprovedRange(p, opts.speedBpt, opts.length, opts, props);
    else if (method === "new") res = simulateNewRange(p, opts.speedBpt, opts.length, opts);
    else res = simulateLegacyRange(p, opts.speedBpt, opts.length, opts);
    if (Number.isFinite(res.x) && res.x > best.x) best = { x: res.x, p };
  }

  // refine around best pitch
  if (best.p === null) return { maxDistance: NaN, bestPitch: null };
  const refineRange = 1;
  const refineStep = 0.1;
  const start = Math.max(aminClamped, best.p - refineRange);
  const end = Math.min(amaxClamped, best.p + refineRange);
  for (let p = start; p <= end; p += refineStep) {
    let res;
    if (method === "improved") res = simulateImprovedRange(p, opts.speedBpt, opts.length, opts, props);
    else if (method === "new") res = simulateNewRange(p, opts.speedBpt, opts.length, opts);
    else res = simulateLegacyRange(p, opts.speedBpt, opts.length, opts);
    if (Number.isFinite(res.x) && res.x > best.x) best = { x: res.x, p };
  }

  return { maxDistance: best.x, bestPitch: best.p };
}

function clearOutputs() {
  ["chosenPitch", "lowPitch", "highPitch", "lowYaw", "highYaw", "flightTime", "speedBpt", "usedMethod", "currentDistance", "maxDistance"].forEach((id) => {
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
  updateCalculatorType();
  updateInputMode();
  updateSeedVisibility();
  syncCannonVelocity();
  renderAfterInputChange();
}

function fillProjectiles(preferredProjectile) {
  const select = $("projectile");
  const previous = preferredProjectile || select.value;
  const cannonId = $("cannonProfile")?.value || "manual";
  const physics = window.CBCRealisticBallistics;
  const compatible = PROJECTILES
    .filter((id) => !physics?.isProjectileCompatible || physics.isProjectileCompatible(cannonId, id))
    .sort();

  select.innerHTML = "";
  compatible.forEach((id) => {
    const option = document.createElement("option");
    option.value = id;
    option.textContent = id;
    select.appendChild(option);
  });

  select.disabled = compatible.length === 0;
  if (compatible.length === 0) {
    const option = document.createElement("option");
    option.value = "";
    option.textContent = "No compatible projectiles";
    select.appendChild(option);
    return;
  }
  select.value = compatible.includes(previous) ? previous : compatible[0];
}

function resetDefaults() {
  $("calculatorType").value = "cbc";
  $("length").value = 8;
  $("speedMps").value = 400;
  $("distance").value = 300;
  $("heightDelta").value = 0;
  if ($("cannonProfile")) $("cannonProfile").value = "cbc_big_cannon";
  fillProjectiles("createbigcannons:ap_shell");
  $("method").value = "new";
  $("preferArc").value = "low";
  $("amin").value = -30;
  $("amax").value = 60;
  $("gravity").value = 0.05;
  $("drag").value = 0.99;
  $("maxDelta").value = 1;
  $("maxSteps").value = 10000;
  $("iterations").value = 5;
  $("elements").value = 20;
  $("checkImpossible").checked = true;
  $("worldSeed").value = 0;
  $("dimensionId").value = "minecraft:overworld";
  $("weatherMode").value = "clear";
  $("biomeTemperature").value = 0.8;
  $("referenceMass").value = 2;
  $("projectileDiameter").value = 0.8;
  $("realisticCd").value = 0.25;
  $("realisticGravity").value = 9.80665;
  $("seaLevelY").value = 64;
  $("scaleHeight").value = 8500;
  $("projectileDensity").value = 7800;
  $("lengthCalibers").value = 3;
  $("solidFraction").value = 0.5;
  $("realisticWindEnabled").checked = true;
  $("windSpeed").value = 4;
  $("windDirection").value = 35;
  $("gustSpeed").value = 3;
  $("weatherAffectsWind").checked = true;
  $("windRegionSize").value = 2048;
  $("windSeedSalt").value = 0;
  $("windDirectionVariation").value = 45;
  $("windSpeedVariation").value = 0.35;
  $("rainWindBonus").value = 5;
  $("thunderWindBonus").value = 7;
  $("rainGustBonus").value = 2;
  $("thunderGustBonus").value = 5;
  $("verticalTurbulence").value = 0.04;
  $("altitudeWindMultiplier").value = 1.55;
  $("enableCoriolis").checked = true;
  $("latitude").value = 45;
  $("enableSpinDrift").checked = true;
  $("spinDriftFactor").value = 0.02;
  if ($("rocketLauncher")) $("rocketLauncher").value = "medium_pod";
  fillRocketModes();
  if ($("rocketMode")) $("rocketMode").value = "medium_pod_he";
  if ($("missileLifetime")) $("missileLifetime").value = 600;
  if ($("rocketCompensation")) $("rocketCompensation").value = 0;
  if ($("useCoords")) $("useCoords").checked = false;
  if ($("cannonX")) $("cannonX").value = 0;
  if ($("cannonY")) $("cannonY").value = 0;
  if ($("cannonZ")) $("cannonZ").value = 0;
  if ($("targetX")) $("targetX").value = 300;
  if ($("targetY")) $("targetY").value = 0;
  if ($("targetZ")) $("targetZ").value = 0;
  updateCalculatorType();
  syncCannonVelocity();
  render();
}

fillMethods();
fillCannons();
fillProjectiles("createbigcannons:ap_shell");
syncCannonVelocity();
fillRocketLaunchers();
fillRocketModes();
updateCalculatorType();
fields.forEach((id) => {
  const el = $(id);
  if (!el || id === "method" || id === "projectile") return;
  const update = () => {
    if (id === "length") syncCannonVelocity();
    renderAfterInputChange();
  };
  el.addEventListener("input", update);
  el.addEventListener("change", update);
});

// coordinate mode toggle should update UI
if ($("useCoords")) $("useCoords").addEventListener("change", () => { updateInputMode(); updateSeedVisibility(); renderAfterInputChange(); });
updateInputMode();

// Ensure method/projectile changes toggle UI specifically
if ($("method")) $("method").addEventListener("change", () => {
  if ($("method").value === "realistic") {
    if (num("amax") === 60) $("amax").value = 89;
    syncRealisticProjectileDefaults();
  } else if (num("amax") === 89) {
    $("amax").value = 60;
  }
  syncCannonVelocity();
  updateUIForMethod();
  updateSeedVisibility();
  renderAfterInputChange();
});
if ($("projectile")) $("projectile").addEventListener("change", () => {
  if ($("method").value === "realistic") syncRealisticProjectileDefaults();
  syncCannonVelocity();
  updateUIForMethod();
  updateSeedVisibility();
  renderAfterInputChange();
});
if ($("cannonProfile")) $("cannonProfile").addEventListener("change", () => {
  fillProjectiles($("projectile").value);
  syncRealisticProjectileDefaults();
  syncCannonVelocity();
  renderAfterInputChange();
});
if ($("calculatorType")) $("calculatorType").addEventListener("change", () => {
  const realisticCbc = $("calculatorType").value === "cbc" && $("method").value === "realistic";
  if (($("calculatorType").value === "mianbao" || realisticCbc) && num("amax") === 60) $("amax").value = 89;
  if ($("calculatorType").value === "cbc" && !realisticCbc && num("amax") === 89) $("amax").value = 60;
  updateCalculatorType();
  updateSeedVisibility();
  syncCannonVelocity();
  renderAfterInputChange();
});
if ($("rocketLauncher")) $("rocketLauncher").addEventListener("change", () => {
  fillRocketModes();
  render();
});
if ($("rocketMode")) $("rocketMode").addEventListener("change", () => {
  syncRocketModeDefaults();
  render();
});
document.querySelectorAll("[data-lang]").forEach((btn) => {
  btn.addEventListener("click", () => applyLanguage(btn.dataset.lang));
});
$("resetBtn").addEventListener("click", resetDefaults);
if ($("calculateBtn")) $("calculateBtn").addEventListener("click", render);
applyLanguage(lang);
