from pathlib import Path
import re

app_path = Path('app.js')
cbc_path = Path('cbc_realistic_ballistics.js')
index_path = Path('index.html')

app = app_path.read_text(encoding='utf-8')
cbc = cbc_path.read_text(encoding='utf-8')
index = index_path.read_text(encoding='utf-8')

MARKER = 'REALISTIC_CALIBER_SYNC_20260820_V1'
if MARKER in cbc:
    print('Caliber sync already applied')
    raise SystemExit(0)

# Remove the empirical +1 degree calibration completely.
app = app.replace('// REALISTIC_GAME_PITCH_CALIBRATION_20260820_V1\n', '', 1)
app = app.replace('const REALISTIC_GAME_PITCH_CORRECTION_DEG = 1.0;\n', '', 1)

calibration_block = '''
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
'''
if calibration_block not in app:
    raise SystemExit('Pitch calibration block not found')
app = app.replace(calibration_block, '\n', 1)

old_outputs = '''    $("chosenPitch").textContent = chosenPitchDeg !== null ? `${fmt(chosenPitchDeg, 4)}°` : "-";
    $("lowPitch").textContent = lowPitchDeg !== null ? `${fmt(lowPitchDeg, 4)}°` : "-";
    $("highPitch").textContent = highPitchDeg !== null ? `${fmt(highPitchDeg, 4)}°` : "-";'''
new_outputs = '''    $("chosenPitch").textContent = chosen ? `${fmt(chosen.pitchDeg, 4)}°` : "-";
    $("lowPitch").textContent = result.low ? `${fmt(result.low.pitchDeg, 4)}°` : "-";
    $("highPitch").textContent = result.high ? `${fmt(result.high.pitchDeg, 4)}°` : "-";'''
if old_outputs not in app:
    raise SystemExit('Calibrated pitch outputs not found')
app = app.replace(old_outputs, new_outputs, 1)

for line in [
    '      rawSelectedPitchDeg: chosen ? chosen.pitchDeg : null,\n',
    '      gamePitchCorrectionDeg: REALISTIC_GAME_PITCH_CORRECTION_DEG,\n',
    '      calibratedSelectedPitchDeg: chosenPitchDeg,\n',
]:
    if line not in app:
        raise SystemExit(f'Debug calibration line missing: {line.strip()}')
    app = app.replace(line, '', 1)

# Match projectileDiameter() from CBC-Realistic-Ballistics 1.3.3.
# Standard CBC big cannon projectile IDs use 0.875 m nominal override.
# Medium cannon uses 0.155 m; heavy autocannon 0.045 m; autocannon 0.020 m.
# All other projectile types use their entity bounding-box size (minimum 0.05 m).
# Verified addon entity sizes relevant to the current calculator:
#   CBC AT rockets: 0.2 x 0.2 -> 0.2 m
#   CBC More Shells dual/normal/extended projectiles: 0.8 x 0.8 -> 0.8 m
old_diam = 'function diam(id){let v=id.toLowerCase();if(BIG.test(v))return .875;if(v.includes("mediumshell"))return .155;if(/^cbc_at:ha_.*_projectile$/.test(v))return .045;if(v.includes("autocannon")||v.includes("machine_gun")||/^cbc_at:(?:apds|apdsfs|he|hei|cluster)_projectile$/.test(v))return .02;if(/^cbcmoreshells:(?:normal_|extended_)/.test(v))return .4;return .8}'
new_diam = 'function diam(id){let v=id.toLowerCase();if(BIG.test(v))return .875;if(v.includes("mediumshell"))return .155;if(/^cbc_at:ha_.*_projectile$/.test(v))return .045;if(v.includes("autocannon")||v.includes("machine_gun")||/^cbc_at:(?:apds|apdsfs|he|hei|cluster)_projectile$/.test(v))return .02;if(/^cbc_at:(?:medium_)?(?:ap|flak|he|hei|hef|heat)_rocket$/.test(v))return .2;return .8}'
if old_diam not in cbc:
    raise SystemExit('Current diameter rule not found')
cbc = cbc.replace(old_diam, new_diam, 1)
cbc = cbc.replace('"use strict";(function(g){', '"use strict";/* REALISTIC_CALIBER_SYNC_20260820_V1 */(function(g){', 1)

# Cache-bust both files changed by this patch.
index = re.sub(r'cbc_realistic_ballistics\.js\?v=[^"\']+', 'cbc_realistic_ballistics.js?v=20260820-caliber1', index, count=1)
index = re.sub(r'app\.js\?v=[^"\']+', 'app.js?v=20260820-caliber1', index, count=1)

app_path.write_text(app, encoding='utf-8')
cbc_path.write_text(cbc, encoding='utf-8')
index_path.write_text(index, encoding='utf-8')
print('Removed +1 degree calibration and synchronized known projectile diameters')
