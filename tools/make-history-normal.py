"""Builds public/history/moon_normal_2k.webp from the LOLA global height map (same maths MoonGlobe used at runtime).
Run: python3 tools/make-history-normal.py   (needs numpy, pillow)"""
import json, math
import numpy as np
from PIL import Image
m = json.load(open('public/moon/manifest.json'))
hMin, hMax = m['global']['hMin'], m['global']['hMax']
R = 1737.4
im = np.asarray(Image.open('public/moon/' + m['global']['file']).convert('RGB')).astype(np.uint32)
H, W = im.shape[:2]
h = hMin + ((im[..., 0] << 8) | im[..., 1]).astype(np.float64) * (hMax - hMin) / 65535
ow, oh = W // 2, H // 2
sy = np.arange(oh) * 2
sx = np.arange(ow) * 2
EX = 6.0
dyKm = math.pi * R / H * 2
lat = (0.5 - (np.arange(oh) + 0.5) / oh) * math.pi
dxKm = np.maximum(0.15 * dyKm, (2 * math.pi * R / W) * 2 * np.cos(lat))[:, None]
def at(ys, xs): return h[np.clip(ys, 0, H - 1)[:, None], (xs % W)[None, :]]
dhE = (at(sy, sx + 2) - at(sy, sx - 2)) / (2 * dxKm)
dhN = (at(sy - 2, sx) - at(sy + 2, sx)) / (2 * dyKm)
nx, ny = -dhE * EX, -dhN * EX
inv = 1 / np.sqrt(nx * nx + ny * ny + 1)
out = np.stack([nx * inv * .5 + .5, ny * inv * .5 + .5, inv * .5 + .5], -1)
Image.fromarray((out * 255).round().astype(np.uint8)).save('public/history/moon_normal_2k.webp', quality=92, method=6)
