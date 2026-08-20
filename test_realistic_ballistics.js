"use strict";

const assert = require("node:assert/strict");

global.window = {};
require("./cbc_realistic_ballistics.js");

const ballistics = window.CBCRealisticBallistics;

function config(overrides = {}) {
  return {
    worldSeed: "0",
    seedSalt: "0",
    dimensionId: "minecraft:overworld",
    weather: "clear",
    biomeTemperature: 0.8,
    referenceMass: 2,
    diameter: 0.875,
    cd: 0,
    gravity: 9.80665,
    seaLevelY: 64,
    scaleHeight: 8500,
    projectileDensity: 7800,
    lengthCalibers: 3,
    solidFraction: 0.5,
    windEnabled: false,
    windSpeed: 0,
    windDirection: 0,
    gustSpeed: 0,
    weatherAffectsWind: false,
    windRegionSize: 2048,
    windDirectionVariation: 0,
    windSpeedVariation: 0,
    rainWindBonus: 0,
    thunderWindBonus: 0,
    rainGustBonus: 0,
    thunderGustBonus: 0,
    verticalTurbulence: 0,
    altitudeWindMultiplier: 1,
    enableCoriolis: false,
    latitude: 45,
    enableSpinDrift: false,
    spinDriftFactor: 0.02,
    minPitch: -30,
    maxPitch: 89.9,
    maxTicks: 10000,
    allowedMiss: 0.05,
    launchVelocityScale: 1,
    barrelLength: 0,
    ...overrides
  };
}

function analyticAngles(range, height, velocity, gravityPerTick) {
  const discriminant = velocity ** 4
    - gravityPerTick * (gravityPerTick * range ** 2 + 2 * height * velocity ** 2);
  if (discriminant < 0) return null;
  const root = Math.sqrt(discriminant);
  return [
    Math.atan((velocity ** 2 - root) / (gravityPerTick * range)) * 180 / Math.PI,
    Math.atan((velocity ** 2 + root) / (gravityPerTick * range)) * 180 / Math.PI
  ];
}

for (const range of [300, 1000, 3000, 8000, 14000, 15500, 16315]) {
  for (const height of [-200, 0, 200]) {
    const cfg = config();
    const expected = analyticAngles(range, height, 20, cfg.gravity / 400);
    const result = ballistics.solve([0, 64, 0], [range, 64 + height, 0], 20, cfg, "high");

    const expectedLow = expected && expected[0] >= cfg.minPitch;
    const expectedHigh = expected && expected[1] <= cfg.maxPitch;
    if (expectedLow) {
      assert.ok(result.low, `missing Low arc at R=${range}, dY=${height}`);
      assert.ok(Math.abs(result.low.pitchDeg - expected[0]) < 0.05);
      assert.ok(result.low.miss <= cfg.allowedMiss);
    }
    if (expectedHigh) {
      assert.ok(result.high, `missing High arc at R=${range}, dY=${height}`);
      assert.ok(Math.abs(result.high.pitchDeg - expected[1]) < 0.05);
      assert.ok(result.high.miss <= cfg.allowedMiss);
      assert.equal(result.selected, result.high);
    }
  }
}

const impossible = ballistics.solve(
  [0, 64, 0],
  [16400, 64, 0],
  20,
  config(),
  "high"
);
assert.equal(impossible.ok, false);
assert.equal(impossible.high, null);

const windy = ballistics.solve(
  [100, 64, -200],
  [5000, 264, 2000],
  20,
  config({
    worldSeed: "987654321",
    seedSalt: "17",
    weather: "thunder",
    cd: 0.25,
    windEnabled: true,
    windSpeed: 4,
    windDirection: 35,
    gustSpeed: 3,
    weatherAffectsWind: true,
    windDirectionVariation: 45,
    windSpeedVariation: 0.35,
    rainWindBonus: 5,
    thunderWindBonus: 7,
    rainGustBonus: 2,
    thunderGustBonus: 5,
    verticalTurbulence: 0.04,
    altitudeWindMultiplier: 1.55,
    enableCoriolis: true,
    enableSpinDrift: true,
    allowedMiss: 1
  }),
  "high"
);
assert.ok(windy.ok);
assert.ok(windy.low && windy.low.miss <= 1);
assert.ok(windy.high && windy.high.miss <= 1);
assert.equal(windy.selected, windy.high);

// Regression for the reported CBC 50 m gun shot. The solver must account for
// both the muzzle position and CBC's calibrated nominal-to-effective velocity.
const reportedShot = ballistics.solve(
  [-117.76, 171.62, -23.08],
  [11512, 168, -44499],
  50,
  config({
    worldSeed: "4859982396822044733",
    cd: 0.25,
    windEnabled: true,
    windSpeed: 4,
    windDirection: 35,
    gustSpeed: 3,
    weatherAffectsWind: true,
    windDirectionVariation: 45,
    windSpeedVariation: 0.35,
    rainWindBonus: 5,
    thunderWindBonus: 7,
    rainGustBonus: 2,
    thunderGustBonus: 5,
    verticalTurbulence: 0.04,
    altitudeWindMultiplier: 1.55,
    enableCoriolis: true,
    enableSpinDrift: true,
    launchVelocityScale: 0.99411,
    barrelLength: 50,
    maxTicks: 10000,
    allowedMiss: 1
  }),
  "high"
);
assert.ok(reportedShot.low, "reported shot is missing its low arc");
assert.ok(reportedShot.high, "reported shot is missing its high arc");
assert.ok(reportedShot.high.miss <= 1, "reported high arc does not converge");
assert.ok(reportedShot.high.pitchDeg > 69.64 && reportedShot.high.pitchDeg < 69.68);

console.log("CBC Realistic Ballistics: Low/High arc tests passed", {
  reportedLow: reportedShot.low && {
    pitch: reportedShot.low.pitchDeg,
    yaw: reportedShot.low.yawDeg,
    ticks: reportedShot.low.ticks
  },
  reportedHigh: {
    pitch: reportedShot.high.pitchDeg,
    yaw: reportedShot.high.yawDeg,
    ticks: reportedShot.high.ticks
  }
});
