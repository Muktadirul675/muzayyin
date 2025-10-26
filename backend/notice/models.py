from django.db import models

class Notice(models.Model):
    text = models.TextField()
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)  # optional but useful
    updated_at = models.DateTimeField(auto_now=True)      # optional

    def __str__(self):
        return f"Notice (Active: {self.is_active}): {self.text[:50]}"