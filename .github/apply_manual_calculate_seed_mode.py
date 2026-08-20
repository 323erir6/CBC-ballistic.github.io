from pathlib import Path
import re

APP = Path('app.js')
INDEX = Path('index.html')
STYLES = Path('styles.css')

app = APP.read_text(encoding='utf-8')
index = INDEX.read_text(encoding='utf-8')
styles = STYLES.read_text(encoding='utf-8')

MARKER = 'MANUAL_REALISTIC_CALCULATE_20260820_V1'
if MARKER in app:
    print('Patch already applied')
    raise SystemExit(0)

# Translations for the new button/status. No ballistic code is touched here.
for old, new in [
    ('    reset: "Reset",', '    reset: "Reset",\n    calculate: "Calculate",'),
    ('    reset: "Сброс",', '    reset: "Сброс",\n    calculate: "Рассчитать",'),
    ('    reset: "Скинути",', '    reset: "Скинути",\n    calculate: "Розрахувати",'),
]:
    if old not in app:
        raise SystemExit(f'Missing translation anchor: {old}')
    app = app.replace(old, new, 1)

# Seed values are meaningful only when actual world coordinates are supplied.
old = '    worldSeed: $("worldSeed").value,'
if old not in app:
    raise SystemExit('worldSeed config anchor missing')
app = app.replace(old, '    worldSeed: opts.useCoords ? $("worldSeed").value : "0",', 1)

old = '    seedSalt: $("windSeedSalt").value,'
if old not in app:
    raise SystemExit('seedSalt config anchor missing')
app = app.replace(old, '    seedSalt: opts.useCoords ? $("windSeedSalt").value : "0",', 1)

# Add tiny UI helpers before render(). Heavy CBC Realistic solve runs only from Calculate.
anchor = 'function render() {\n'
helper = '''// MANUAL_REALISTIC_CALCULATE_20260820_V1
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

function render() {
'''
if anchor not in app:
    raise SystemExit('render() anchor missing')
app = app.replace(anchor, helper, 1)

# Language changes must update labels/UI but not launch the expensive realistic solver.
old = '''  fillMethods();
  updateCalculatorType();
  updateInputMode();
  syncCannonVelocity();
  render();
}'''
new = '''  fillMethods();
  updateCalculatorType();
  updateInputMode();
  updateSeedVisibility();
  syncCannonVelocity();
  renderAfterInputChange();
}'''
if old not in app:
    raise SystemExit('applyLanguage anchor missing')
app = app.replace(old, new, 1)

# General field changes: keep old automatic behaviour for all other calculators,
# but only mark CBC Realistic as needing Calculate.
old = '''  const update = () => {
    if (id === "length") syncCannonVelocity();
    render();
  };'''
new = '''  const update = () => {
    if (id === "length") syncCannonVelocity();
    renderAfterInputChange();
  };'''
if old not in app:
    raise SystemExit('field listener anchor missing')
app = app.replace(old, new, 1)

old = 'if ($("useCoords")) $("useCoords").addEventListener("change", () => { updateInputMode(); render(); });'
new = 'if ($("useCoords")) $("useCoords").addEventListener("change", () => { updateInputMode(); updateSeedVisibility(); renderAfterInputChange(); });'
if old not in app:
    raise SystemExit('useCoords listener anchor missing')
app = app.replace(old, new, 1)

old = '''if ($("method")) $("method").addEventListener("change", () => {
  if ($("method").value === "realistic") syncRealisticProjectileDefaults();
  syncCannonVelocity();
  updateUIForMethod();
  render();
});'''
new = '''if ($("method")) $("method").addEventListener("change", () => {
  if ($("method").value === "realistic") syncRealisticProjectileDefaults();
  syncCannonVelocity();
  updateUIForMethod();
  updateSeedVisibility();
  renderAfterInputChange();
});'''
if old not in app:
    raise SystemExit('method listener anchor missing')
app = app.replace(old, new, 1)

old = '''if ($("projectile")) $("projectile").addEventListener("change", () => {
  if ($("method").value === "realistic") syncRealisticProjectileDefaults();
  syncCannonVelocity();
  updateUIForMethod();
  render();
});'''
new = '''if ($("projectile")) $("projectile").addEventListener("change", () => {
  if ($("method").value === "realistic") syncRealisticProjectileDefaults();
  syncCannonVelocity();
  updateUIForMethod();
  updateSeedVisibility();
  renderAfterInputChange();
});'''
if old not in app:
    raise SystemExit('projectile listener anchor missing')
app = app.replace(old, new, 1)

old = '''if ($("cannonProfile")) $("cannonProfile").addEventListener("change", () => {
  fillProjectiles($("projectile").value);
  syncRealisticProjectileDefaults();
  syncCannonVelocity();
  render();
});'''
new = '''if ($("cannonProfile")) $("cannonProfile").addEventListener("change", () => {
  fillProjectiles($("projectile").value);
  syncRealisticProjectileDefaults();
  syncCannonVelocity();
  renderAfterInputChange();
});'''
if old not in app:
    raise SystemExit('cannonProfile listener anchor missing')
app = app.replace(old, new, 1)

old = '''if ($("calculatorType")) $("calculatorType").addEventListener("change", () => {
  if ($("calculatorType").value === "mianbao" && num("amax") === 60) $("amax").value = 89;
  if ($("calculatorType").value === "cbc" && num("amax") === 89) $("amax").value = 60;
  updateCalculatorType();
  syncCannonVelocity();
  render();
});'''
new = '''if ($("calculatorType")) $("calculatorType").addEventListener("change", () => {
  if ($("calculatorType").value === "mianbao" && num("amax") === 60) $("amax").value = 89;
  if ($("calculatorType").value === "cbc" && num("amax") === 89) $("amax").value = 60;
  updateCalculatorType();
  updateSeedVisibility();
  syncCannonVelocity();
  renderAfterInputChange();
});'''
if old not in app:
    raise SystemExit('calculatorType listener anchor missing')
app = app.replace(old, new, 1)

# Explicit button is the only trigger for the heavy realistic solver after edits.
old = '$("resetBtn").addEventListener("click", resetDefaults);\napplyLanguage(lang);'
new = '$("resetBtn").addEventListener("click", resetDefaults);\nif ($("calculateBtn")) $("calculateBtn").addEventListener("click", render);\napplyLanguage(lang);'
if old not in app:
    raise SystemExit('bottom listener anchor missing')
app = app.replace(old, new, 1)

# Mark both seed controls as coordinate-only.
old = '''            <label>
              <span data-i18n="worldSeed">World seed</span>
              <input id="worldSeed" type="text" inputmode="numeric" value="0">'''
new = '''            <label class="seed-coordinate-only">
              <span data-i18n="worldSeed">World seed</span>
              <input id="worldSeed" type="text" inputmode="numeric" value="0">'''
if old not in index:
    raise SystemExit('world seed HTML anchor missing')
index = index.replace(old, new, 1)

old = '<label class="method-realistic"><span>Wind seed salt</span><input id="windSeedSalt"'
new = '<label class="method-realistic seed-coordinate-only"><span>Wind seed salt</span><input id="windSeedSalt"'
if old not in index:
    raise SystemExit('wind seed salt HTML anchor missing')
index = index.replace(old, new, 1)

# Prominent Calculate button, only visible in CBC Realistic mode via existing .method-realistic handling.
old = '''          </details>
        </form>'''
new = '''          </details>

          <button class="calculate-primary method-realistic" type="button" id="calculateBtn" data-i18n="calculate">Calculate</button>
        </form>'''
if old not in index:
    raise SystemExit('form closing anchor missing')
index = index.replace(old, new, 1)

# Bust only app/style cache. Physics script URL stays exactly as it was.
index = re.sub(r'app\.js\?v=[^"\']+', 'app.js?v=20260820-manual1', index, count=1)
index = re.sub(r'href="styles\.css(?:\?v=[^"\']+)?"', 'href="styles.css?v=20260820-manual1"', index, count=1)

if '.calculate-primary {' not in styles:
    styles += '''

.calculate-primary {
  width: 100%;
  min-height: 54px;
  margin-top: 16px;
  border: 1px solid var(--accent);
  border-radius: 8px;
  background: var(--accent);
  color: #04110e;
  font-weight: 800;
  font-size: 16px;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  cursor: pointer;
  box-shadow: 0 0 0 1px rgba(68, 215, 182, 0.16), 0 8px 24px rgba(0, 0, 0, 0.28);
}

.calculate-primary:hover {
  filter: brightness(1.08);
}

.calculate-primary:active {
  transform: translateY(1px);
}
'''

APP.write_text(app, encoding='utf-8')
INDEX.write_text(index, encoding='utf-8')
STYLES.write_text(styles, encoding='utf-8')
print('Applied manual Calculate + coordinate-only seed UI patch')
