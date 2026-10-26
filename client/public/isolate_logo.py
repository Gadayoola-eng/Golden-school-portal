from PIL import Image, ImageDraw, ImageFilter

source_path = r"C:\Users\GAD\.gemini\antigravity-ide\brain\81bdceb0-09b5-4d4e-b926-bff1814ee0dd\.user_uploaded\media_1792144674767.jpg"
img = Image.open(source_path)

# Let's crop the logo tightly
# Let's see the bounds of the red outer boundary:
# Let's test crop from (10, 16, 204, 192)
logo = img.crop((10, 16, 204, 192)).convert("RGBA")
lw, lh = logo.size
print(f"Logo crop size: {lw}x{lh}")

# Let's inspect the corner pixels to detect the outside color:
# Corners like (0,0), (lw-1, 0), (0, lh-1), (lw-1, lh-1) are background.
# In RGBA:
# The shield is convex-ish (widest at top with two horns, curving down to a point at bottom).
# Outside the red outline:
# Background is warm orange/yellow/gold banner gradient.
# Let's create an alpha mask using flood fill from the 4 corners:

# Convert to grayscale or examine RGB distance from background:
pixels = logo.load()

# Find background color by flood-filling from the four corners:
# A pixel is considered outside if connected to the border and not part of the dark red shield border.
visited = set()
queue = [(0, 0), (lw - 1, 0), (0, lh - 1), (lw - 1, lh - 1), 
         (0, 10), (lw - 1, 10), (0, lh - 10), (lw - 1, lh - 10)]

def is_boundary_or_inside(r, g, b):
    # The red border of the shield has high red and relatively low green/blue,
    # or inside the badge where it is white/light blue.
    # The outside background is orange-gold: e.g. R ~ 210-250, G ~ 120-170, B ~ 30-80
    # Let's check red border:
    # Red border is prominent crimson: R > 150, G < 60, B < 60 (or dark red: R~120-200, G~20-60, B~20-60)
    if r > 120 and g < 70 and b < 70:
        return True # It's the red shield border!
    return False

# Let's test a simple distance threshold flood-fill from border pixels:
for x in range(lw):
    queue.append((x, 0))
    queue.append((x, lh - 1))
for y in range(lh):
    queue.append((0, y))
    queue.append((lw - 1, y))

bg_mask = Image.new("L", (lw, lh), 255) # 255 = keep (inside)
mask_pixels = bg_mask.load()

q = [pt for pt in queue if not is_boundary_or_inside(*pixels[pt][:3])]
for pt in q:
    visited.add(pt)

idx = 0
while idx < len(q):
    cx, cy = q[idx]
    idx += 1
    mask_pixels[cx, cy] = 0 # 0 = transparent
    
    for nx, ny in [(cx+1, cy), (cx-1, cy), (cx, cy+1), (cx, cy-1)]:
        if 0 <= nx < lw and 0 <= ny < lh:
            if (nx, ny) not in visited:
                r, g, b, _ = pixels[nx, ny]
                if not is_boundary_or_inside(r, g, b):
                    # Also check that it's still typical outside warm background (not inner white/blue)
                    # Outside background has high warmth: r > 160, g between 80 and 190, b < 130
                    if r > 140 and (r - b) > 50 and g > 60:
                        visited.add((nx, ny))
                        q.append((nx, ny))

logo.putalpha(bg_mask)
logo.save(r"c:\Users\GAD\.gemini\antigravity-ide\scratch\student-portal\client\public\logo_transparent_test.png")
print("Saved logo_transparent_test.png")
