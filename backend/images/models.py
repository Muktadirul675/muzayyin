from django.db import models

class UploadedImage(models.Model):
    image = models.ImageField(upload_to='uploads/images/')
    alt_text = models.CharField(max_length=255, blank=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.image.name