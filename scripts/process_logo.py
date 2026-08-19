import os
from PIL import Image, ImageFilter

input_path = r"C:\Users\FenyxMoura\.gemini\antigravity-ide\brain\9844ebe2-12dc-48a0-a845-ed9d05559327\.user_uploaded\media_1787102403924.jpg"
output_path1 = r"c:\Users\FenyxMoura\Desktop\sistema-haras-v2\public\logo.png"
output_path2 = r"c:\Users\FenyxMoura\Desktop\sistema-haras-v2\src\assets\logo.png"
output_path3 = r"c:\Users\FenyxMoura\Desktop\sistema-haras-v2\public\favicon.png"

os.makedirs(os.path.dirname(output_path2), exist_ok=True)

img = Image.open(input_path).convert("RGBA")
width, height = img.size

# Carrega pixels
pixels = img.load()

# Cria máscara baseada em brilho e cor dourada
# O fundo é quase preto/vinho escuro (R<60, G<35, B<35, brilho total < 100)
# O escudo é dourado brilhante (R>90, G>60, B>25)
mask = Image.new("L", (width, height), 0)
mask_pixels = mask.load()

for y in range(height):
    for x in range(width):
        r, g, b, a = pixels[x, y]
        
        # Remove a estrelinha no canto inferior direito se houver
        if x > width * 0.85 and y > height * 0.8:
            # se estiver fora do escudo
            pass
            
        # Brilho e saturação
        brightness = (r * 299 + g * 587 + b * 114) / 1000
        
        # Se for escuro (fundo)
        if brightness < 45 and r < 75 and g < 45 and b < 45:
            mask_pixels[x, y] = 0
        elif brightness < 65:
            # Transição suave (antialiasing)
            alpha = int(((brightness - 45) / 20) * 255)
            mask_pixels[x, y] = max(0, min(255, alpha))
        else:
            mask_pixels[x, y] = 255

# Suaviza as bordas da máscara
mask_smooth = mask.filter(ImageFilter.GaussianBlur(radius=1.2))

# Aplica máscara como canal alpha
img.putalpha(mask_smooth)

# Faz crop do conteúdo visível
bbox = img.getbbox()
if bbox:
    # pequeno padding
    pad = 10
    x0 = max(0, bbox[0] - pad)
    y0 = max(0, bbox[1] - pad)
    x1 = min(width, bbox[2] + pad)
    y1 = min(height, bbox[3] + pad)
    img_cropped = img.crop((x0, y0, x1, y1))
else:
    img_cropped = img

img_cropped.save(output_path1, "PNG")
img_cropped.save(output_path2, "PNG")
img_cropped.resize((128, 128), Image.Resampling.LANCZOS).save(output_path3, "PNG")

print("Logo processed successfully! Cropped size:", img_cropped.size)
