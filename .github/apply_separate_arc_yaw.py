from pathlib import Path
import re

APP = Path('app.js')
INDEX = Path('index.html')
app = APP.read_text(encoding='utf-8')
index = INDEX.read_text(encoding='utf-8')

MARKER = 'REALISTIC_SEPARATE_ARC_YAW_20260820_V1'
if MARKER in app:
    print('Separate arc yaw already applied')
    raise SystemExit(0)

# I18N labels only; no physics changes.
for old, new in [
    ('    yaw: "Yaw",', '    yaw: "Selected yaw",\n    lowYaw: "Low yaw",\n    highYaw: "High yaw",'),
    ('    yaw: "Yaw",', '    yaw: "Yaw выбранной дуги",\n    lowYaw: "Yaw низкой дуги",\n    highYaw: "Yaw высокой дуги",'),
    ('    yaw: "Yaw",', '    yaw: "Yaw обраної дуги",\n    lowYaw: "Yaw низької дуги",\n    highYaw: "Yaw високої дуги",'),
]:
    if old in app:
        app = app.replace(old, new, 1)
    else:
        raise SystemExit('Missing yaw translation anchor')

# Helper deliberately only converts the solver's own per-arc yaw into the
# motor/display convention. It does not alter trajectory solving.
render_anchor = 'function render() {\n'
helper = '''// REALISTIC_SEPARATE_ARC_YAW_20260820_V1
function motorYawForRealisticSolution(solution) {
  if (!solution || !Number.isFinite(solution.yawDeg)) return null;
  let motorYaw = -solution.yawDeg;
  if (motorYaw >= 180) motorYaw -= 360;
  if (motorYaw < -180) motorYaw += 360;
  return motorYaw;
}

function render() {
'''
if render_anchor not in app:
    raise SystemExit('render() anchor missing')
app = app.replace(render_anchor, helper, 1)

old_pitch_block = '''    $("chosenPitch").textContent = chosen ? `${fmt(chosen.pitchDeg, 4)}°` : "-";
    $("lowPitch").textContent = result.low ? `${fmt(result.low.pitchDeg, 4)}°` : "-";
    $("highPitch").textContent = result.high ? `${fmt(result.high.pitchDeg, 4)}°` : "-";
    $("flightTime").textContent = chosen'''
new_pitch_block = '''    $("chosenPitch").textContent = chosen ? `${fmt(chosen.pitchDeg, 4)}°` : "-";
    $("lowPitch").textContent = result.low ? `${fmt(result.low.pitchDeg, 4)}°` : "-";
    $("highPitch").textContent = result.high ? `${fmt(result.high.pitchDeg, 4)}°` : "-";

    const lowMotorYaw = motorYawForRealisticSolution(result.low);
    const highMotorYaw = motorYawForRealisticSolution(result.high);
    $("lowYaw").textContent = lowMotorYaw === null ? "-" : `${fmt(lowMotorYaw, 4)}°`;
    $("highYaw").textContent = highMotorYaw === null ? "-" : `${fmt(highMotorYaw, 4)}°`;

    $("flightTime").textContent = chosen'''
if old_pitch_block not in app:
    raise SystemExit('Realistic pitch output anchor missing')
app = app.replace(old_pitch_block, new_pitch_block, 1)

old_yaw_block = '''    if (chosen) {
      let motorYaw = -chosen.yawDeg;
      if (motorYaw >= 180) motorYaw -= 360;
      if (motorYaw < -180) motorYaw += 360;
      $("yaw").textContent = `${fmt(motorYaw, 4)}°`;
      realisticYawHandled = true;
    }'''
new_yaw_block = '''    if (chosen) {
      const motorYaw = motorYawForRealisticSolution(chosen);
      $("yaw").textContent = motorYaw === null ? "-" : `${fmt(motorYaw, 4)}°`;
      realisticYawHandled = true;
    }'''
if old_yaw_block not in app:
    raise SystemExit('Selected realistic yaw anchor missing')
app = app.replace(old_yaw_block, new_yaw_block, 1)

# Clear the new outputs together with all other outputs when Realistic inputs
# become pending for Calculate.
old_clear = '["chosenPitch", "lowPitch", "highPitch", "flightTime", "speedBpt", "usedMethod", "currentDistance", "maxDistance"]'
new_clear = '["chosenPitch", "lowPitch", "highPitch", "lowYaw", "highYaw", "flightTime", "speedBpt", "usedMethod", "currentDistance", "maxDistance"]'
if old_clear not in app:
    raise SystemExit('clearOutputs list anchor missing')
app = app.replace(old_clear, new_clear, 1)

# Add Realistic-only result cards next to the arc pitch results.
old_metrics = '''            <div>
              <span data-i18n="highSolution">High solution</span>
              <strong id="highPitch">-</strong>
            </div>
            <div>
              <span data-i18n="currentDistance">Current distance</span>'''
new_metrics = '''            <div>
              <span data-i18n="highSolution">High solution</span>
              <strong id="highPitch">-</strong>
            </div>
            <div class="method-realistic">
              <span data-i18n="lowYaw">Low yaw</span>
              <strong id="lowYaw">-</strong>
            </div>
            <div class="method-realistic">
              <span data-i18n="highYaw">High yaw</span>
              <strong id="highYaw">-</strong>
            </div>
            <div>
              <span data-i18n="currentDistance">Current distance</span>'''
if old_metrics not in index:
    raise SystemExit('Metrics anchor missing')
index = index.replace(old_metrics, new_metrics, 1)

# Cache bust only changed UI/application code. The physics file is left exactly
# as-is, preserving the isolated high-arc solver and historical low arc.
index = re.sub(r'app\.js\?v=[^"\']+', 'app.js?v=20260820-arcyaw1', index, count=1)

APP.write_text(app, encoding='utf-8')
INDEX.write_text(index, encoding='utf-8')
print('Separate Low/High yaw UI applied without changing physics')
