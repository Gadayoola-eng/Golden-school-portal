import os
from PIL import Image, ImageOps

source_path = r"C:\Users\GAD\.gemini\antigravity-ide\brain\81bdceb0-09b5-4d4e-b926-bff1814ee0dd\.user_uploaded\media_1792144674767.jpg"
out_dir = r"c:\Users\GAD\.gemini\antigravity-ide\scratch\student-portal\client\public"
os.makedirs(out_dir, exist_ok=True)

img = Image.open(source_path)
w, h = img.size
print(f"Original image size: {w}x{h}")

# 1. Logo crop
# In the original image (1024x819):
# The logo is at the top left. Let's find its exact boundary.
# Let's crop a generous area around logo: (10, 10, 210, 195)
# And let's inspect the bounding box.
logo_crop = img.crop((12, 18, 203, 190))
logo_crop.save(os.path.join(out_dir, "logo_raw.png"))

# 2. Head of School - Pastor Ogunleye S.A (Man in suit)
# Left rounded frame:
# Frame starts around x=20, ends around x=330
# y starts around y=235, ends around y=760 (including the label)
# Let's also do a crop of just the portrait (without label) and with label
head_of_school = img.crop((20, 235, 332, 707))
head_of_school.save(os.path.join(out_dir, "head_of_school.jpg"))

head_of_school_with_label = img.crop((20, 235, 332, 760))
head_of_school_with_label.save(os.path.join(out_dir, "head_of_school_card.jpg"))

# 3. Proprietress - Mrs. Ogunleye E.A (Woman in white)
# Right rounded frame:
# x starts around x=688, ends around x=995
# y starts around y=260, ends around y=707
proprietress = img.crop((688, 260, 995, 707))
proprietress.save(os.path.join(out_dir, "proprietress.jpg"))

proprietress_with_label = img.crop((688, 260, 995, 760))
proprietress_with_label.save(os.path.join(out_dir, "proprietress_card.jpg"))

# 4. Middle graduation / students pictures
graduates = img.crop((358, 266, 658, 492))
graduates.save(os.path.join(out_dir, "pupils_graduates.jpg"))

pupils_all = img.crop((358, 266, 658, 770))
pupils_all.save(os.path.join(out_dir, "pupils_gallery.jpg"))

# 5. Full school banner header
header_banner = img.crop((0, 0, 1024, 215))
header_banner.save(os.path.join(out_dir, "school_header_banner.jpg"))

print("Initial crops saved successfully!")
