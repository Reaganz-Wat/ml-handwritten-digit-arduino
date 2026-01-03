# Handwritten Digit Recognition with Arduino Display

A full-stack machine learning application that recognizes handwritten digits (0-9) drawn on a web canvas and displays predictions on both the web interface and an Arduino LCD screen in real-time. Built with React, FastAPI, TensorFlow/Keras, and Arduino.

![ML Handwritten Digits Architecture](./ML%20Handwritten%20Digits%20Architecture.png)

## What This Project Does

- **Draw digits** on a web-based canvas (280x280px)
- **ML prediction** using a trained MNIST model (97-98% accuracy)
- **Dual output**: Results displayed on web UI and Arduino LCD via serial communication
- **Real-time inference** with confidence scores for all 10 digits

## Tech Stack

- **Frontend**: React + TypeScript + Vite
- **Backend**: FastAPI + TensorFlow/Keras
- **ML Model**: Neural network trained on MNIST dataset
- **Hardware**: Arduino with I2C LCD display (16x2)
- **Communication**: Serial (USB) + optional Bluetooth support

## Project Structure

```
.
├── frontend-web/          # React web application
├── backend-fastapi/       # FastAPI server + ML model
├── arduino/               # Arduino sketch for LCD display
├── models/                # Trained TensorFlow models
│   ├── digit_model/       # Original model
│   └── digit_model_improved/  # Improved model (97-98% accuracy)
└── *.ipynb                # Jupyter notebooks for model training
```

## Prerequisites

- **Python**: 3.10+
- **Node.js**: 18+ and Yarn
- **Arduino IDE**: For uploading sketch to Arduino
- **Hardware**: Arduino board + I2C LCD 16x2 display

## Installation & Setup

### 1. Backend (FastAPI + ML Model)

```bash
cd backend-fastapi
pip install -r requirements.txt
```

**Note**: Ensure TensorFlow is installed:
```bash
pip install tensorflow
```

### 2. Frontend (React)

```bash
cd frontend-web
yarn install
```

### 3. Arduino Setup

1. Open `arduino/digit_display.ino` in Arduino IDE
2. Install required library: **LiquidCrystal I2C**
3. Connect I2C LCD to Arduino (SDA → A4, SCL → A5)
4. Upload sketch to your Arduino board
5. Note the serial port (e.g., `/dev/ttyACM0` on Linux, `COM3` on Windows)

See [ARDUINO_SETUP_GUIDE.md](./ARDUINO_SETUP_GUIDE.md) for detailed hardware setup.

## Running the Application

### Step 1: Start the Backend

```bash
cd backend-fastapi
python main.py
```

Backend runs on `http://localhost:8000`

**Serial Port Configuration**: Edit `backend-fastapi/send_to_arduino.py` to match your Arduino's port:
```python
SERIAL_PORT = '/dev/ttyACM0'  # Linux/Mac
# SERIAL_PORT = 'COM3'         # Windows
```

### Step 2: Start the Frontend

```bash
cd frontend-web
yarn dev
```

Frontend runs on `http://localhost:5173`

### Step 3: Use the Application

1. Open `http://localhost:5173` in your browser
2. Draw a digit (0-9) on the canvas
3. Click **Predict** or **Clear**
4. View predictions on web UI and Arduino LCD

## API Endpoints

- `POST /predict` - Upload image and get digit prediction
- `GET /` - Health check endpoint

## Model Information

The project uses an improved MNIST model located at `models/digit_model_improved/1/` with:
- **Architecture**: Dense neural network (784 → 128 → 64 → 10)
- **Activation**: ReLU (hidden) + Softmax (output)
- **Training**: Categorical crossentropy loss
- **Accuracy**: ~97-98% on test set

To retrain the model, use `TrainModel_Improved.ipynb`.

## Configuration

### Backend Serial Communication

Edit `backend-fastapi/send_to_arduino.py`:
```python
SERIAL_PORT = '/dev/ttyACM0'  # Your Arduino port
BAUD_RATE = 9600              # Must match Arduino sketch
```

### Frontend API URL

Edit `frontend-web/src/components/DrawingCanvas.tsx` if backend runs on different host/port:
```typescript
const response = await fetch('http://localhost:8000/predict', {
```

## Learn More

For detailed explanations about the architecture, ML model training, and hardware integration, read the full tutorial:

[**Handwritten Digit Recognition Meets Embedded Systems**](https://medium.com/@reaganwatmon6/handwritten-digit-recognition-meets-embedded-systems-60937a47b6e9)

## Troubleshooting

**Backend fails to start**: Ensure TensorFlow is installed and model exists at `models/digit_model_improved/1/`

**Arduino not receiving data**: Check serial port in `send_to_arduino.py` and verify USB connection

**Low prediction accuracy**: Verify backend is using `digit_model_improved` (not the old `digit_model`)

**Frontend CORS errors**: Ensure backend CORS settings allow frontend origin

## Contributing

This is a personal learning project. Feel free to fork and experiment!

## License

MIT
