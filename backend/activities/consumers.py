# activities/consumers.py

from channels.generic.websocket import AsyncJsonWebsocketConsumer

class ActivityConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        await self.channel_layer.group_add("activity_logs", self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard("activity_logs", self.channel_name)

    async def activity_log(self, event):
        await self.send_json(event["data"])