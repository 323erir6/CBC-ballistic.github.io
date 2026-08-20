from pathlib import Path
import re

app_path = Path('app.js')
index_path = Path('index.html')
app = app_path.read_text(encoding='utf-8')
index = index_path.read_text(encoding='utf-8')

MARKER = 'REALISTIC_GAME_PITCH_CALIBRATION_20260820_V1'
if MARKER in app:
    print('Calibration already applied')
    raise SystemExit(0)

anchor = '// REQUESTED_ROLLBACK_PATCH_20260820_V1\n'
if anchor not in app:
    raise SystemExit('Requested rollback marker missing')
app = app.replace(
    anchor,
    anchor + '// REALISTIC_GAME_PITCH_CALIBRATION_20260820_V1\n'
             'const REALISTIC_GAME_PITCH_CORRECTION_DEG = 1.0;\n',
    1
)

old = '''    result = physics.solve(cannon, calculationTarget, opts.speedBpt, config, opts.preferArc);
    chosen = result.selected;
    ok = Boolean(result.ok && chosen);'''
new = '''    result = physics.solve(cannon, calculationTarget, opts.speedBpt, config, opts.preferArc);
    chosen = result.selected;

    // Empirical game calibration. The browser physics model was consistently
    // about one degree too low in the verified long-range shot, which caused
    // a multi-kilometre undershoot. Keep the physics solution intact and
    // correct only the gun elevation sent/shown to the player.
    const calibratedPitch = (solution) => solution
      ? Math.min(opts.amax, Math.max(opts.amin,
          solution.pitchDeg + REALISTIC_GAME_PITCH_CORRECTION_DEG))
      : null;
    const chosenPitchDeg = calibratedPitch(chosen);
    const lowPitchDeg = calibratedPitch(result.low);
    const highPitchDeg = calibratedPitch(result.high);

    ok = Boolean(result.ok && chosen);'''
if old not in app:
    raise SystemExit('Realistic solve/result anchor missing')
app = app.replace(old, new, 1)

old = '''    $("chosenPitch").textContent = chosen ? `${fmt(chosen.pitchDeg, 4)}°` : "-";
    $("lowPitch").textContent = result.low ? `${fmt(result.low.pitchDeg, 4)}°` : "-";
    $("highPitch").textContent = result.high ? `${fmt(result.high.pitchDeg, 4)}°` : "-";'''
new = '''    $("chosenPitch").textContent = chosenPitchDeg !== null ? `${fmt(chosenPitchDeg, 4)}°` : "-";
    $("lowPitch").textContent = lowPitchDeg !== null ? `${fmt(lowPitchDeg, 4)}°` : "-";
    $("highPitch").textContent = highPitchDeg !== null ? `${fmt(highPitchDeg, 4)}°` : "-";'''
if old not in app:
    raise SystemExit('Pitch output anchor missing')
app = app.replace(old, new, 1)

old = '''      effectiveHorizontalRange,
      velocityMps: opts.speedMps,'''
new = '''      effectiveHorizontalRange,
      rawSelectedPitchDeg: chosen ? chosen.pitchDeg : null,
      gamePitchCorrectionDeg: REALISTIC_GAME_PITCH_CORRECTION_DEG,
      calibratedSelectedPitchDeg: chosenPitchDeg,
      velocityMps: opts.speedMps,'''
if old not in app:
    raise SystemExit('Debug calibration anchor missing')
app = app.replace(old, new, 1)

index = re.sub(r'app\.js\?v=[^"\']+', 'app.js?v=20260820-pitchcal1', index, count=1)

app_path.write_text(app, encoding='utf-8')
index_path.write_text(index, encoding='utf-8')
print('Applied +1.0 degree CBC Realistic game pitch calibration')
