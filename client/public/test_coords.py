from PIL import Image

source_path = r"C:\Users\GAD\.gemini\antigravity-ide\brain\81bdceb0-09b5-4d4e-b926-bff1814ee0dd\.user_uploaded\media_1792144674767.jpg"
img = Image.open(source_path)

# Let's test proprietress with higher top: y=235 to 700, x=700 to 985
# And let's check the white line on the left.
prop_test1 = img.crop((700, 235, 985, 705))
prop_test1.save(r"c:\Users\GAD\.gemini\antigravity-ide\scratch\student-portal\client\public\prop_test1.jpg")

# Let's check head of school inside photo: x=36 to 318, y=245 to 698
hos_inner = img.crop((36, 246, 318, 698))
hos_inner.save(r"c:\Users\GAD\.gemini\antigravity-ide\scratch\student-portal\client\public\head_of_school_clean.jpg")

# Let's check logo coordinates:
# Let's see where the logo badge outline is.
logo_wide = img.crop((8, 12, 205, 195))
logo_wide.save(r"c:\Users\GAD\.gemini\antigravity-ide\scratch\student-portal\client\public\logo_wide.png")
