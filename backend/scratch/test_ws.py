
import asyncio
import websockets
import json

async def test_ws():
    token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzc4OTQyODI5LCJpYXQiOjE3Nzg5NDEwMjksImp0aSI6ImI0ZDc0Zjc4Y2Q3OTRjZTZhOTAzY2Y1ZWQwZTA4NTZjIiwidXNlcl9pZCI6IjMifQ.VwgoVuLpHatwdTUTTXG0iEg0k6Pm8ok12QrHu3EOSxM"
    url = f"ws://localhost:8000/ws/dashboard/?token={token}"
    print(f"Connecting to {url}...")
    try:
        async with websockets.connect(url) as websocket:
            print("Connected successfully!")
            # Wait a bit to see if it closes
            try:
                message = await asyncio.wait_for(websocket.recv(), timeout=5.0)
                print(f"Received: {message}")
            except asyncio.TimeoutError:
                print("Connected but no message received (this is normal if no updates happened)")
    except Exception as e:
        print(f"Connection failed: {e}")

if __name__ == "__main__":
    asyncio.run(test_ws())
