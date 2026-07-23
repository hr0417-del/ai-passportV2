import sys
import subprocess

try:
    from PIL import Image
    import numpy as np
except ImportError:
    subprocess.check_call([sys.executable, "-m", "pip", "install", "pillow", "numpy"])
    from PIL import Image
    import numpy as np

# Create the base 512x512 LUT array for OBS
size = 512
block_size = 64
blocks_per_row = size // block_size

y, x = np.mgrid[0:size, 0:size]

# Calculate original RGB values (0 to 63)
r = x % block_size
g = y % block_size
b = (x // block_size) + (y // block_size) * blocks_per_row

# Normalize to 0.0 - 1.0
r = r / 63.0
g = g / 63.0
b = b / 63.0

# Calculate Luminance (brightness) of each pixel
luma = 0.299 * r + 0.587 * g + 0.114 * b

# --- ORANGE & TEAL HOLLYWOOD COLOR GRADE ---

# Shadows (Teal): Cool down the darks by boosting blue/green and dropping red
teal_r = r * 0.6
teal_g = g * 1.0 + 0.05
teal_b = b * 1.3 + 0.1

# Highlights (Orange): Warm up the brights (skin tones) by boosting red/green
orange_r = r * 1.3 + 0.1
orange_g = g * 1.1
orange_b = b * 0.8

# Blend based on brightness (Darks get Teal, Brights get Orange)
mix = np.clip((luma - 0.25) / 0.5, 0.0, 1.0)
mix = mix * mix * (3 - 2 * mix) # smooth transition

out_r = teal_r * (1 - mix) + orange_r * mix
out_g = teal_g * (1 - mix) + orange_g * mix
out_b = teal_b * (1 - mix) + orange_b * mix

# Add cinematic contrast (crush blacks slightly, pop whites)
def contrast(val, amount=1.15):
    return np.clip(((val - 0.5) * amount) + 0.5, 0.0, 1.0)

out_r = contrast(out_r)
out_g = contrast(out_g)
out_b = contrast(out_b)

# Convert back to 8-bit RGB
rgb_array = np.dstack((out_r, out_g, out_b)) * 255
rgb_array = np.clip(rgb_array, 0, 255).astype(np.uint8)

# Save the final LUT image
img = Image.fromarray(rgb_array, 'RGB')
img.save('cinematic_lut.png')
print("Generated cinematic_lut.png successfully!")
