from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class Log(models.Model):
    user = models.ForeignKey(User, null=True, blank=True, on_delete=models.SET_NULL)
    action = models.CharField(max_length=255)
    model = models.CharField(max_length=100, blank=True)
    object_id = models.CharField(max_length=100, blank=True)
    html = models.TextField(blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return f"[{self.timestamp}] {self.user} - {self.action}"