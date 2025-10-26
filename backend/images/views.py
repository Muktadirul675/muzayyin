from PIL import Image
from io import BytesIO
from django.core.files.base import ContentFile
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import UploadedImageSerializer
from datetime import datetime
from PIL import Image
from io import BytesIO
from django.core.files.base import ContentFile

def compress_image(image_file, format='WEBP', quality=80):
    image = Image.open(image_file)

    # Detect if image has transparency
    has_alpha = image.mode in ("RGBA", "LA") or (image.mode == "P" and "transparency" in image.info)

    # Convert to correct mode
    if has_alpha:
        image = image.convert("RGBA")
    else:
        image = image.convert("RGB")

    image_io = BytesIO()
    image.save(
        image_io,
        format=format,
        quality=quality,
        lossless=has_alpha,
        optimize=True
    )

    # Generate new file name with .webp and date stamp
    original_name = image_file.name.rsplit('.', 1)[0]
    date_stamp = datetime.now().strftime('%Y%m%d')
    new_image_name = f"{original_name}_{date_stamp}_zilmil.webp"

    return ContentFile(image_io.getvalue(), name=new_image_name)

class UploadImageView(APIView):
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request, format=None):
        if 'image' not in request.FILES:
            return Response({"error": "No image provided."}, status=status.HTTP_400_BAD_REQUEST)

        original_image = request.FILES['image']
        compressed_image = compress_image(original_image)

        # Build data dict manually
        data = {
            'image': compressed_image,
            'alt_text': request.data.get('alt_text', '')
        }

        serializer = UploadedImageSerializer(data=data)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        