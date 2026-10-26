from PIL import Image, ImageFilter

source_path = r"C:\Users\GAD\.gemini\antigravity-ide\brain\81bdceb0-09b5-4d4e-b926-bff1814ee0dd\.user_uploaded\media_1792144674767.jpg"
out_dir = r"c:\Users\GAD\.gemini\antigravity-ide\scratch\student-portal\client\public"

img = Image.open(source_path)

# ==========================================
# 1. LOGO WITH CLEAN PADDING & ANTIALIASING
# ==========================================
logo_raw = img.crop((6, 10, 208, 198)).convert("RGBA")
lw, lh = logo_raw.size
pixels = logo_raw.load()

# Let's detect red border
def is_red_shield_border(r, g, b):
    # The red border has high R, low G, low B
    return (r > 125 and g < 75 and b < 75)

visited = set()
queue = []
for x in range(lw):
    queue.append((x, 0))
    queue.append((x, lh - 1))
for y in range(lh):
    queue.append((0, y))
    queue.append((lw - 1, y))

bg_mask = Image.new("L", (lw, lh), 255)
mask_pixels = bg_mask.load()

q = [pt for pt in queue if not is_red_shield_border(*pixels[pt][:3])]
for pt in q:
    visited.add(pt)

idx = 0
while idx < len(q):
    cx, cy = q[idx]
    idx += 1
    mask_pixels[cx, cy] = 0
    for nx, ny in [(cx+1, cy), (cx-1, cy), (cx, cy+1), (cx, cy-1)]:
        if 0 <= nx < lw and 0 <= ny < lh and (nx, ny) not in visited:
            r, g, b, _ = pixels[nx, ny]
            if not is_red_shield_border(r, g, b):
                # Outside background is warm/gold/brownish
                if r > 130 and g > 55 and (r - b) > 40:
                    visited.add((nx, ny))
                    q.append((nx, ny))

# Soften the mask slightly for smooth anti-aliased edge
smooth_mask = bg_mask.filter(ImageFilter.GaussianBlur(0.6))
logo_raw.putalpha(smooth_mask)

# Save final logo.png
logo_raw.save(f"{out_dir}/logo.png", "PNG")
logo_raw.save(f"{out_dir}/logo_gold.png", "PNG")
# Also create favicon
favicon = logo_raw.resize((64, 64), Image.Resampling.LANCZOS)
favicon.save(f"{out_dir}/favicon.png", "PNG")

# ==========================================
# 2. HEAD OF SCHOOL - PASTOR OGUNLEYE S.A
# ==========================================
# Inside portrait without borders (perfect for avatars, hero cards, circular profiles)
hos_portrait = img.crop((44, 250, 310, 700))
hos_portrait.save(f"{out_dir}/head_of_school.jpg", quality=95)

# Full card version with the official gold border and name banner:
hos_full_card = img.crop((20, 235, 332, 755))
hos_full_card.save(f"{out_dir}/head_of_school_card.jpg", quality=95)

# ==========================================
# 3. PROPRIETRESS - MRS. OGUNLEYE E.A
# ==========================================
# Inside portrait without borders
prop_portrait = img.crop((706, 245, 978, 702))
prop_portrait.save(f"{out_dir}/proprietress.jpg", quality=95)

# Full card version with the official gold border and name banner:
prop_full_card = img.crop((686, 235, 998, 755))
prop_full_card.save(f"{out_dir}/proprietress_card.jpg", quality=95)

# ==========================================
# 4. STUDENTS / PUPILS (Graduation & Class of 2026)
# ==========================================
pupils_grad = img.crop((362, 268, 654, 488))
pupils_grad.save(f"{out_dir}/pupils_graduates.jpg", quality=95)

pupils_mid = img.crop((362, 504, 654, 722))
pupils_mid.save(f"{out_dir}/pupils_middle.jpg", quality=95)

pupils_bottom = img.crop((362, 746, 654, 819))
pupils_bottom.save(f"{out_dir}/pupils_bottom.jpg", quality=95)

# Full center graduation strip
pupils_strip = img.crop((356, 260, 660, 818))
pupils_strip.save(f"{out_dir}/pupils_gallery.jpg", quality=95)

# Class of 2026 diploma graphic on top right
class_2026_badge = img.crop((840, 16, 995, 230))
class_2026_badge.save(f"{out_dir}/class_of_2026.jpg", quality=95)

print("All cutout assets processed and saved successfully!")
