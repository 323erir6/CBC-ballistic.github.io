from pathlib import Path
import re

cbc_path = Path('cbc_realistic_ballistics.js')
index_path = Path('index.html')
cbc = cbc_path.read_text(encoding='utf-8')
index = index_path.read_text(encoding='utf-8')

marker = 'REALISTIC_CROSSING_INTERPOLATION_FIX_20260820_V1'
if marker in cbc:
    print('Already patched')
    raise SystemExit(0)

# The current minified solver keeps a position from TWO samples back (px/pr)
# while the crossing fraction is measured from the CURRENT sample. On the
# descending branch that makes the predicted crossing altitude too high and
# drives the solved pitch too low. CBC itself advances from oldPos -> newPos,
# so crossing interpolation must use current x -> n.
old = ',path=pathOn?[{x:0,y:0}]:null,pa=0,px=[...x],mx='
new = ',path=pathOn?[{x:0,y:0}]:null,pa=0,mx='
if old not in cbc:
    raise SystemExit('sim px declaration anchor missing')
cbc = cbc.replace(old, new, 1)

old = 'hit=[lr(px[0],n[0],f),lr(px[1],n[1],f),lr(px[2],n[2],f)]'
new = 'hit=[lr(x[0],n[0],f),lr(x[1],n[1],f),lr(x[2],n[2],f)]'
if old not in cbc:
    raise SystemExit('sim hit interpolation anchor missing')
cbc = cbc.replace(old, new, 1)

old = 'pa=q;px=x;x=n;v=['
new = 'pa=q;x=n;v=['
if old not in cbc:
    raise SystemExit('sim px update anchor missing')
cbc = cbc.replace(old, new, 1)

old = 'x=[...S],pr=[...S],mx='
new = 'x=[...S],mx='
if old not in cbc:
    raise SystemExit('range previous declaration anchor missing')
cbc = cbc.replace(old, new, 1)

old = 'let f=(pr[1]-S[1])/Math.max(1e-12,pr[1]-n[1]),xx=lr(pr[0],n[0],f),z=lr(pr[2],n[2],f)'
new = 'let f=(x[1]-S[1])/Math.max(1e-12,x[1]-n[1]),xx=lr(x[0],n[0],f),z=lr(x[2],n[2],f)'
if old not in cbc:
    raise SystemExit('range interpolation anchor missing')
cbc = cbc.replace(old, new, 1)

old = 'pr=x;x=n;v=['
new = 'x=n;v=['
if old not in cbc:
    raise SystemExit('range previous update anchor missing')
cbc = cbc.replace(old, new, 1)

cbc = cbc.replace('"use strict";', '"use strict";/* '+marker+' */', 1)
index = re.sub(r'cbc_realistic_ballistics\.js\?v=[^"\']+', 'cbc_realistic_ballistics.js?v=20260820-crossing1', index, count=1)

cbc_path.write_text(cbc, encoding='utf-8')
index_path.write_text(index, encoding='utf-8')
print('Crossing interpolation fixed')
