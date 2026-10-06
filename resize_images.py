from PIL import Image
import os

os.makedirs("public", exist_ok=True)
img_path = r"C:\Users\Harmat Vajda\.gemini\antigravity-ide\brain\755c5860-032d-4fba-86fb-d2397cf839fe\hoedex_logo_h_1791287436302.jpg"
img = Image.open(img_path)

# Convert to RGBA just in case, though it's JPEG
img = img.convert("RGBA")

# Save main logo
img.save("public/logo.png")

# Save icons
img_192 = img.resize((192, 192), Image.Resampling.LANCZOS)
img_192.save("public/pwa-192x192.png")

img_512 = img.resize((512, 512), Image.Resampling.LANCZOS)
img_512.save("public/pwa-512x512.png")

print("Images resized and saved successfully!")
