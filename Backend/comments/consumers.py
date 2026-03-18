from channels.generic.websocket import AsyncWebsocketConsumer
import json

class CommentConsumer(AsyncWebsocketConsumer):

    async def connect(self):
    # Ensure we get the ID from the URL scope
        self.article_id = self.scope['url_route']['kwargs']['article_id']
        self.room_group_name = f"comments_{self.article_id}"
    
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def send_comment(self, event):
        await self.send(text_data=json.dumps(event["data"]))
        
    # Add this method to your CommentConsumer class
    async def delete_comment(self, event):
        await self.send(text_data=json.dumps({
            "type": "delete",
            "id": event["data"]["id"]
        }))