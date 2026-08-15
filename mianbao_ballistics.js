"use strict";

// Browser/Node port of NURS_ART/nurs_ballistics.lua. The values mirror the
// launch procedures from Mianbao Modern Warfare 1.3.0 for Minecraft 1.21.1.
(function exposeMianbaoBallistics(root) {
  const TICKS_PER_SECOND = 20;
  const FIRST_TICK_AIR_INERTIA = 0.9900000095367432;

  const MODES = [
    {
      id: "medium_pod_he",
      launcherId: "medium_pod",
      launcher: "Medium Rocket Pod",
      ammunition: "High-Explosive Rocket",
      speed: 10,
      gravityPerTick: 0.025,
      firstTickGravity: 0,
      inaccuracyMin: 0,
      inaccuracyMax: 0,
      rangeCompensationBlocks: 0
    },
    {
      id: "medium_launcher_he",
      launcherId: "medium_launcher",
      launcher: "Medium Rocket Launcher",
      ammunition: "High-Explosive Rocket",
      speed: 7,
      gravityPerTick: 0.025,
      firstTickGravity: 0,
      inaccuracyMin: 0.5,
      inaccuracyMax: 2,
      rangeCompensationBlocks: 0
    },
    {
      id: "heavy_pod_he",
      launcherId: "heavy_pod",
      launcher: "Heavy Rocket Pod",
      ammunition: "Heavy High-Explosive Rocket",
      speed: 9,
      gravityPerTick: 0.03,
      firstTickGravity: 0.05,
      inaccuracyMin: 0,
      inaccuracyMax: 0,
      rangeCompensationBlocks: 20
    },
    {
      id: "heavy_pod_fire",
      launcherId: "heavy_pod",
      launcher: "Heavy Rocket Pod",
      ammunition: "Incendiary Rocket",
      speed: 10,
      gravityPerTick: 0.03,
      firstTickGravity: 0.05,
      inaccuracyMin: 0,
      inaccuracyMax: 0,
      rangeCompensationBlocks: 0
    },
    {
      id: "heavy_pod_cluster",
      launcherId: "heavy_pod",
      launcher: "Heavy Rocket Pod",
      ammunition: "Cluster Rocket",
      speed: 10,
      gravityPerTick: 0.03,
      firstTickGravity: 0.05,
      inaccuracyMin: 0,
      inaccuracyMax: 0,
      rangeCompensationBlocks: 40,
      airburstLookahead: 150
    }
  ];

  const finite = (name, value) => {
    const number = Number(value);
    if (!Number.isFinite(number)) throw new TypeError(`${name} must be finite`);
    return number;
  };

  function getMode(id) {
    return MODES.find((mode) => mode.id === id) || null;
  }

  function launchComponents(pitchDeg, mode) {
    const pitch = finite("pitchDeg", pitchDeg) * Math.PI / 180;
    return {
      horizontal: mode.speed * Math.abs(Math.cos(pitch)),
      vertical: mode.speed * Math.sin(pitch)
    };
  }

  function impactFraction(startY, endY) {
    const difference = startY - endY;
    if (difference === 0) return 0;
    return Math.max(0, Math.min(1, startY / difference));
  }

  function simulate(pitchDeg, mode, launchHeight = 0, maxTicks = 300, keepPath = false) {
    const velocity = launchComponents(pitchDeg, mode);
    let vx = velocity.horizontal;
    let vy = velocity.vertical;
    let x = 0;
    let y = finite("launchHeight", launchHeight);
    const limit = Math.max(1, Math.floor(finite("maxTicks", maxTicks)));
    const path = keepPath ? [{ x, y }] : null;
    let maximumHeight = y;

    for (let tick = 1; tick <= limit; tick += 1) {
      const oldX = x;
      const oldY = y;
      const nextX = oldX + vx;
      const nextY = oldY + vy;
      if ((oldY > 0 && nextY <= 0) || (oldY === 0 && vy < 0)) {
        const fraction = impactFraction(oldY, nextY);
        x = oldX + (nextX - oldX) * fraction;
        y = 0;
        if (path) path.push({ x, y });
        const flightTicks = tick - 1 + fraction;
        return {
          hit: true,
          range: x,
          flightTicks,
          time: flightTicks / TICKS_PER_SECOND,
          maximumHeight,
          path
        };
      }

      x = nextX;
      y = nextY;
      maximumHeight = Math.max(maximumHeight, y);
      if (path) path.push({ x, y });

      if (tick === 1) {
        vx *= FIRST_TICK_AIR_INERTIA;
        vy = vy * FIRST_TICK_AIR_INERTIA - mode.firstTickGravity;
      } else {
        vy -= mode.gravityPerTick;
      }
    }

    return {
      hit: false,
      range: x,
      flightTicks: limit,
      time: limit / TICKS_PER_SECOND,
      y,
      maximumHeight,
      path
    };
  }

  function trajectoryAtDistance(pitchDeg, mode, distance, maxTicks) {
    const horizontalDistance = finite("distance", distance);
    const velocity = launchComponents(pitchDeg, mode);
    const limit = Math.max(1, Math.floor(maxTicks));
    if (horizontalDistance < 0 || velocity.horizontal <= 1e-9) {
      return { reachable: false };
    }
    if (horizontalDistance === 0) {
      return { reachable: true, relativeY: 0, flightTicks: 0, time: 0 };
    }
    if (horizontalDistance <= velocity.horizontal) {
      const fraction = horizontalDistance / velocity.horizontal;
      return {
        reachable: fraction <= limit,
        relativeY: velocity.vertical * fraction,
        flightTicks: fraction,
        time: fraction / TICKS_PER_SECOND
      };
    }

    const horizontal1 = velocity.horizontal * FIRST_TICK_AIR_INERTIA;
    const afterFirst = (horizontalDistance - velocity.horizontal) / horizontal1;
    const flightTicks = 1 + afterFirst;
    if (flightTicks > limit + 1e-9) return { reachable: false, flightTicks };

    const full = Math.floor(afterFirst + 1e-12);
    const fraction = afterFirst - full;
    const vertical1 = velocity.vertical * FIRST_TICK_AIR_INERTIA - mode.firstTickGravity;
    const relativeY = velocity.vertical
      + full * vertical1
      - mode.gravityPerTick * full * (full - 1) / 2
      + fraction * (vertical1 - mode.gravityPerTick * full);
    return {
      reachable: true,
      relativeY,
      flightTicks,
      time: flightTicks / TICKS_PER_SECOND
    };
  }

  function solveCoordinates(dx, dy, dz, mode, options = {}) {
    const horizontalDistance = Math.hypot(finite("dx", dx), finite("dz", dz));
    const verticalDifference = finite("dy", dy);
    if (horizontalDistance < 1e-6) return { ok: false, reason: "vertical-target" };

    const compensation = Number.isFinite(Number(options.rangeCompensationBlocks))
      ? Number(options.rangeCompensationBlocks)
      : (mode.rangeCompensationBlocks || 0);
    const ballisticDistance = horizontalDistance + compensation;
    const minimum = Number.isFinite(Number(options.minimumPitchDeg)) ? Number(options.minimumPitchDeg) : 0;
    const maximum = Number.isFinite(Number(options.maximumPitchDeg)) ? Number(options.maximumPitchDeg) : 89;
    const lowLimit = Math.min(minimum, maximum);
    const highLimit = Math.max(minimum, maximum);
    const step = Math.max(0.05, Number(options.scanStepDeg) || 0.25);
    const maxTicks = Math.max(1, Math.floor(Number(options.maxTicks) || 300));
    const roots = [];
    let previousPitch = null;
    let previousError = null;

    const errorAt = (pitch) => {
      const sample = trajectoryAtDistance(pitch, mode, ballisticDistance, maxTicks);
      return sample.reachable ? { error: sample.relativeY - verticalDifference, sample } : null;
    };
    const addRoot = (pitch) => {
      if (!roots.some((old) => Math.abs(old - pitch) < 0.002)) roots.push(pitch);
    };

    for (let pitch = lowLimit; pitch <= highLimit + 1e-9; pitch += step) {
      const current = errorAt(pitch);
      if (!current) {
        previousPitch = null;
        previousError = null;
        continue;
      }
      if (Math.abs(current.error) < 1e-6) addRoot(pitch);
      if (previousError !== null && current.error * previousError < 0) {
        let low = previousPitch;
        let high = pitch;
        let lowError = previousError;
        for (let iteration = 0; iteration < 42; iteration += 1) {
          const middle = (low + high) / 2;
          const middleResult = errorAt(middle);
          if (!middleResult) {
            high = middle;
          } else if (lowError * middleResult.error <= 0) {
            high = middle;
          } else {
            low = middle;
            lowError = middleResult.error;
          }
        }
        addRoot((low + high) / 2);
      }
      previousPitch = pitch;
      previousError = current.error;
    }

    roots.sort((a, b) => a - b);
    if (roots.length === 0) return { ok: false, reason: "unreachable", roots: [] };
    const lowPitchDeg = roots[0];
    const highPitchDeg = roots.length > 1 ? roots[roots.length - 1] : null;
    const selectedPitchDeg = options.arc === "high" && highPitchDeg !== null
      ? highPitchDeg
      : lowPitchDeg;
    const sample = trajectoryAtDistance(selectedPitchDeg, mode, ballisticDistance, maxTicks);
    return {
      ok: true,
      mode,
      lowPitchDeg,
      highPitchDeg,
      selectedPitchDeg,
      horizontalDistance,
      ballisticDistance,
      verticalDifference,
      rangeCompensationBlocks: compensation,
      flightTicks: sample.flightTicks,
      time: sample.time,
      roots
    };
  }

  const maximumCache = new Map();
  function maximumRange(mode, options = {}) {
    const minimum = Math.max(0, Number(options.minimumPitchDeg) || 0);
    const maximum = Math.min(89, Number.isFinite(Number(options.maximumPitchDeg))
      ? Number(options.maximumPitchDeg)
      : 89);
    const low = Math.min(minimum, maximum);
    const high = Math.max(minimum, maximum);
    const maxTicks = Math.max(1, Math.floor(Number(options.maxTicks) || 300));
    const coarseStep = Math.max(0.05, Number(options.scanStepDeg) || 0.25);
    const key = [mode.id, low, high, maxTicks, coarseStep].join("|");
    if (maximumCache.has(key)) return maximumCache.get(key);

    let best = null;
    const sample = (pitch) => {
      const result = simulate(pitch, mode, 0, maxTicks, false);
      if (result.hit && (!best || result.range > best.range)) {
        best = { range: result.range, pitchDeg: pitch, time: result.time, flightTicks: result.flightTicks };
      }
    };
    for (let pitch = low; pitch <= high + 1e-9; pitch += coarseStep) sample(pitch);
    sample(high);
    if (best) {
      const start = Math.max(low, best.pitchDeg - coarseStep);
      const end = Math.min(high, best.pitchDeg + coarseStep);
      const fineStep = Math.max(0.0025, coarseStep / 25);
      for (let pitch = start; pitch <= end + 1e-9; pitch += fineStep) sample(pitch);
    }
    maximumCache.set(key, best);
    return best;
  }

  function buildPath(pitchDeg, mode, maxTicks, flightTicks = maxTicks) {
    const velocity = launchComponents(pitchDeg, mode);
    let vx = velocity.horizontal;
    let vy = velocity.vertical;
    let x = 0;
    let y = 0;
    const endTick = Math.min(Math.max(0, finite("flightTicks", flightTicks)), maxTicks);
    const wholeTicks = Math.floor(endTick + 1e-12);
    const path = [{ x, y }];

    for (let tick = 1; tick <= wholeTicks; tick += 1) {
      x += vx;
      y += vy;
      path.push({ x, y });
      if (tick === 1) {
        vx *= FIRST_TICK_AIR_INERTIA;
        vy = vy * FIRST_TICK_AIR_INERTIA - mode.firstTickGravity;
      } else {
        vy -= mode.gravityPerTick;
      }
    }

    const fraction = endTick - wholeTicks;
    if (fraction > 1e-9) path.push({ x: x + vx * fraction, y: y + vy * fraction });
    return path;
  }

  const api = {
    TICKS_PER_SECOND,
    FIRST_TICK_AIR_INERTIA,
    MODES,
    getMode,
    simulate,
    trajectoryAtDistance,
    solveCoordinates,
    maximumRange,
    buildPath
  };
  root.MianbaoBallistics = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
}(typeof globalThis !== "undefined" ? globalThis : window));
