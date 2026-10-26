from PIL import Image

source_path = r"C:\Users\GAD\.gemini\antigravity-ide\brain\81bdceb0-09b5-4d4e-b926-bff1814ee0dd\.user_uploaded\media_1792144674767.jpg"
out_dir = r"c:\Users\GAD\.gemini\antigravity-ide\scratch\student-portal\client\public"
img = Image.open(source_path)

# 1. Proprietress pure portrait (clean green background, no brown frame edges)
# The head is centered around x=840.
# Let's crop from x=724 to 966, y=260 to 700.
prop_clean = img.crop((724, 258, 966, 700))
prop_clean.save(f"{out_dir}/proprietress.jpg", quality=95)

# 2. Proprietress full card with full name "MRS. OGUNLEYE E.A"
# Let's see the right boundary: x ends around 1005
prop_card = img.crop((684, 235, 1005, 770))
prop_card.save(f"{out_dir}/proprietress_card.jpg", quality=95)

# 3. Head of school full card with full name "PASTOR OGUNLEYE S.A"
hos_card = img.crop((20, 235, 340, 770))
hos_card.save(f"{out_dir}/head_of_school_card.jpg", quality=95)

# 4. Head of school clean portrait
hos_clean = img.crop((44, 250, 308, 698))
hos_clean.save(f"{out_dir}/head_of_school.jpg", quality=95)

print("Updated portraits and cards!")
