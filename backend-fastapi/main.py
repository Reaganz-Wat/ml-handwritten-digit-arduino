from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from model import predict_digit
from typing import Union
from PIL import Image
from send_to_arduino import send_to_arduino


app = FastAPI(title="MNIST Digit Classifier API")

# Add CORS middleware to allow frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://localhost:5174"],  # Vite default ports
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"Hello": "World"}

@app.get("/health")
def check_health():
    return {"status": "healthy"}

@app.get("/items/{item_id}")
def read_item(item_id: int, q: Union[str, None] = None):
    return {"item_id": item_id, "q": q}

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    image = Image.open(file.file)
    result = predict_digit(image)

    # Send prediction to Arduino LCD
    try:
        send_to_arduino(result["digit"], result["confidence"])
    except Exception as e:
        print(f"Failed to send to Arduino: {e}")
        # Don't fail the request if Arduino communication fails

    return result

@app.get("/test")
async def testArduino():
    return {
        "prediction": 8
    }