from PIL import Image
from io import BytesIO
from django.core.files.base import ContentFile

def compress_image(image_file, format='WEBP', quality=80):
    image = Image.open(image_file)

    # Convert to RGBA if image has transparency
    if image.mode in ("RGBA", "LA") or (image.mode == "P" and "transparency" in image.info):
        image = image.convert("RGBA")
        lossless = True
    else:
        image = image.convert("RGB")
        lossless = False

    image_io = BytesIO()
    image.save(
        image_io,
        format=format,
        quality=quality if not lossless else None,
        lossless=lossless,
        optimize=True
    )
    
    new_image_file = ContentFile(
        image_io.getvalue(),
        name=image_file.name.rsplit('.', 1)[0] + '.webp'
    )
    return new_image_file
