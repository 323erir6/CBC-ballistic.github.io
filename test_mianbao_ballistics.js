"use strict";

const assert = require("node:assert/strict");
const ballistics = require("./mianbao_ballistics.js");

function near(actual, expected, tolerance, label) {
  assert.ok(
    Math.abs(actual - expected) <= tolerance,
    `${label}: expected ${expected}, got ${actual}`
  );
}

const mediumPod = ballistics.getMode("medium_pod_he");
const mediumLauncher = ballistics.getMode("medium_launcher_he");
assert.ok(mediumPod);
assert.ok(mediumLauncher);

const pod45 = ballistics.simulate(45, mediumPod, 0, 12000);
assert.equal(pod45.hit, true);
near(pod45.range, 3941.516904215, 1e-6, "medium pod 45 degree range");
near(pod45.flightTicks, 563.035010976, 1e-6, "medium pod flight time");

const launcher40 = ballistics.simulate(40, mediumLauncher, 0, 12000);
near(launcher40.range, 1907.811683069, 1e-6, "medium launcher 40 degree range");

const launcherMaximum = ballistics.maximumRange(mediumLauncher, {
  minimumPitchDeg: 0,
  maximumPitchDeg: 89,
  maxTicks: 12000,
  scanStepDeg: 0.25
});
assert.ok(launcherMaximum);
near(launcherMaximum.range, 1935.782886922, 0.1, "medium launcher maximum range");

for (const mode of ballistics.MODES) {
  const solution = ballistics.solveCoordinates(500, 0, 0, mode, {
    arc: "low",
    minimumPitchDeg: 0,
    maximumPitchDeg: 89,
    maxTicks: 12000,
    scanStepDeg: 0.25
  });
  assert.equal(solution.ok, true, `${mode.id} must solve a 500 metre target`);
  const sample = ballistics.trajectoryAtDistance(
    solution.selectedPitchDeg,
    mode,
    solution.ballisticDistance,
    12000
  );
  near(sample.relativeY, 0, 1e-6, `${mode.id} target height error`);
}

console.log("Mianbao web ballistics: all tests passed");
