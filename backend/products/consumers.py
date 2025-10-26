from channels.generic.websocket import AsyncWebsocketConsumer
import json

class ProductConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.channel_layer.group_add("products", self.channel_name)
        await self.accept()
        print("Connected Products")

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard("products", self.channel_name)
        print("Disconnected Products")

    async def receive(self, text_data):
        pass

    async def send_product_update(self, event):
        print("PRODUCT WS")
        await self.send(text_data=json.dumps(event["data"]))
        print("PRODUCT WS DONE")