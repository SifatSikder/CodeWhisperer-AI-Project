from fastapi import FastAPI
from fastapi import WebSocket
import asyncio
import websockets

from pydantic import BaseModel


class TextModel(BaseModel):
    text: str


app = FastAPI()

websocket_client = None


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    global websocket_client
    await websocket.accept()
    websocket_client = websocket


@app.post("/send_text")
async def send_text(text: dict):
    print(text)
    print(websocket_client.client)
    await websocket_client.send_json({"message": text})
    return {"message": "Text saved successfully"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=5000)
