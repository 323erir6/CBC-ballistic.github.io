from pathlib import Path
import re

app_path = Path('app.js')
index_path = Path('index.html')
app = app_path.read_text(encoding='utf-8')
index = index_path.read_text(encoding='utf-8')

MARKER = 'REQUESTED_ROLLBACK_PATCH_20260820_V1'
if MARKER in app:
    print('Patch already applied')
    raise SystemExit(0)

# Calculate button translations.
for old, new in [
    ('    reset: "Reset",', '    reset: "Reset",\n    calculate: "Calculate",'),
    ('    reset: "Сброс",', '    reset: "Сброс",\n    calculate: "Рассчитать",'),
    ('    reset: "Скинути",', '    reset: "Скинути",\n    calculate: "Розрахувати",'),
]:
    if old not in app:
        raise SystemExit(f'Missing translation anchor: {old}')
    app = app.replace(old, new, 1)

# Seed only has an effect in coordinate mode.
old = '    worldSeed: $("worldSeed").value,'
if old not in app:
    raise SystemExit('worldSeed anchor missing')
app = app.replace(old, '    worldSeed: opts.useCoords ? $("worldSeed").value : "0",', 1)
old = '    seedSalt: $("windSeedSalt").value,'
if old not in app:
    raise SystemExit('seedSalt anchor missing')
app = app.replace(old, '    seedSalt: opts.useCoords ? $("windSeedSalt").value : "0",', 1)

# Seed controls are visible only for CBC Realistic + coordinate mode.
old_tail = '''  if (use) {
    if (distEl) distEl.style.display = "none";
    if (heightEl) heightEl.style.display = "none";
    if (coordsEl) coordsEl.style.display = "";
  } else {
    if (distEl) distEl.style.display = "";
    if (heightEl) heightEl.style.display = "";
    if (coordsEl) coordsEl.style.display = "none";
  }
}'''
new_tail = '''  if (use) {
    if (distEl) distEl.style.display = "none";
    if (heightEl) heightEl.style.display = "none";
    if (coordsEl) coordsEl.style.display = "";
  } else {
    if (distEl) distEl.style.display = "";
    if (heightEl) heightEl.style.display = "";
    if (coordsEl) coordsEl.style.display = "none";
  }

  const realistic = $("calculatorType")?.value === "cbc" && $("method")?.value === "realistic";
  document.querySelectorAll(".seed-coordinate-only").forEach((el) => {
    el.style.display = use && realistic ? "" : "none";
  });
}'''
if old_tail not in app:
    raise SystemExit('updateInputMode anchor missing')
app = app.replace(old_tail, new_tail)

# Manual Calculate only for CBC Realistic.
anchor = 'function render() {\n'
helper = '''// REQUESTED_ROLLBACK_PATCH_20260820_V1
function isRealisticMode() {
  return $("calculatorType")?.value === "cbc" && $("method")?.value === "realistic";
}

function renderAfterInputChange() {
  if (isRealisticMode()) {
    clearOutputs();
    setStatus(t("calculate"), "");
    drawTrajectory(null, collectOptions());
    return;
  }
  render();
}

function render() {
'''
if anchor not in app:
    raise SystemExit('render anchor missing')
app = app.replace(anchor, helper, 1)

# Artificial range offset: D_eff = D - L * 0.5.
old_solve = '    result = physics.solve(cannon, target, opts.speedBpt, config, opts.preferArc);'
new_solve = '''    const actualDx = target[0] - cannon[0];
    const actualDz = target[2] - cannon[2];
    const actualHorizontalRange = Math.hypot(actualDx, actualDz);
    const syntheticRangeOffset = Math.max(0, opts.length) * 0.5;
    const effectiveHorizontalRange = actualHorizontalRange - syntheticRangeOffset;
    if (!(effectiveHorizontalRange > 0)) {
      setStatus(t("noSolution"), "bad");
      clearOutputs();
      drawTrajectory(null, opts);
      return;
    }
    const horizontalScale = effectiveHorizontalRange / actualHorizontalRange;
    const calculationTarget = [
      cannon[0] + actualDx * horizontalScale,
      target[1],
      cannon[2] + actualDz * horizontalScale
    ];

    result = physics.solve(cannon, calculationTarget, opts.speedBpt, config, opts.preferArc);'''
if old_solve not in app:
    raise SystemExit('realistic solve anchor missing')
app = app.replace(old_solve, new_solve, 1)

old_debug = '      target,\n      velocityMps: opts.speedMps,'
new_debug = '''      target,
      calculationTarget,
      actualHorizontalRange,
      syntheticRangeOffset,
      effectiveHorizontalRange,
      velocityMps: opts.speedMps,'''
if old_debug not in app:
    raise SystemExit('debug anchor missing')
app = app.replace(old_debug, new_debug, 1)

# Replace automatic recalculation in the event/listener section.
old = 'if ($("useCoords")) $("useCoords").addEventListener("change", () => { updateInputMode(); render(); });'
if old not in app:
    raise SystemExit('useCoords listener anchor missing')
app = app.replace(old, 'if ($("useCoords")) $("useCoords").addEventListener("change", () => { updateInputMode(); renderAfterInputChange(); });', 1)

event_start = app.index('fields.forEach((id) => {')
event_end = app.index('document.querySelectorAll("[data-lang]")', event_start)
event_block = app[event_start:event_end]
event_block = event_block.replace('    render();', '    renderAfterInputChange();')
event_block = event_block.replace('  render();', '  renderAfterInputChange();')
event_block = event_block.replace('  updateUIForMethod();\n  renderAfterInputChange();',
                                  '  updateUIForMethod();\n  updateInputMode();\n  renderAfterInputChange();')
event_block = event_block.replace('  updateCalculatorType();\n  syncCannonVelocity();\n  renderAfterInputChange();',
                                  '  updateCalculatorType();\n  updateInputMode();\n  syncCannonVelocity();\n  renderAfterInputChange();')
app = app[:event_start] + event_block + app[event_end:]

# Language switch updates UI but does not silently rerun Realistic.
old = '  updateCalculatorType();\n  updateInputMode();\n  syncCannonVelocity();\n  render();\n}'
if old in app:
    app = app.replace(old, '  updateCalculatorType();\n  updateInputMode();\n  syncCannonVelocity();\n  renderAfterInputChange();\n}', 1)

# Explicit Calculate listener.
old = '$("resetBtn").addEventListener("click", resetDefaults);\napplyLanguage(lang);'
if old not in app:
    raise SystemExit('bottom listener anchor missing')
app = app.replace(old, '$("resetBtn").addEventListener("click", resetDefaults);\nif ($("calculateBtn")) $("calculateBtn").addEventListener("click", render);\napplyLanguage(lang);', 1)

# HTML seed controls.
old_world = '''            <label>
              <span data-i18n="worldSeed">World seed</span>
              <input id="worldSeed" type="text" inputmode="numeric" value="0">'''
new_world = '''            <label class="seed-coordinate-only">
              <span data-i18n="worldSeed">World seed</span>
              <input id="worldSeed" type="text" inputmode="numeric" value="0">'''
if old_world not in index:
    raise SystemExit('world seed HTML anchor missing')
index = index.replace(old_world, new_world, 1)
old_salt = '<label class="method-realistic"><span>Wind seed salt</span><input id="windSeedSalt"'
if old_salt not in index:
    raise SystemExit('wind salt HTML anchor missing')
index = index.replace(old_salt, '<label class="method-realistic seed-coordinate-only"><span>Wind seed salt</span><input id="windSeedSalt"', 1)

# Calculate button.
old = '''          </details>
        </form>'''
new = '''          </details>
          <button class="ghost method-realistic" type="button" id="calculateBtn" data-i18n="calculate" style="width:100%;margin-top:12px;">Calculate</button>
        </form>'''
if old not in index:
    raise SystemExit('calculate button HTML anchor missing')
index = index.replace(old, new, 1)

# Cache bust app.js only; realistic physics file is intentionally unchanged.
index = re.sub(r'app\.js\?v=[^"\']+', 'app.js?v=20260820-rollback1', index, count=1)

app_path.write_text(app, encoding='utf-8')
index_path.write_text(index, encoding='utf-8')
print('Requested patch applied')
