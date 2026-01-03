# Arduino LCD Display Setup Guide

This guide will help you set up your Arduino to display digit predictions from the FastAPI backend on a 16x2 LCD display.

## Hardware Requirements

- Arduino (Uno, Nano, Mega, etc.)
- 16x2 LCD with I2C module (address 0x27 or 0x3F)
- USB cable to connect Arduino to computer
- Jumper wires

## Wiring Diagram

Connect the I2C LCD to Arduino:

| LCD Pin | Arduino Pin |
|---------|-------------|
| VCC     | 5V          |
| GND     | GND         |
| SDA     | A4 (Uno/Nano) or SDA pin |
| SCL     | A5 (Uno/Nano) or SCL pin |

## Arduino Setup

### 1. Install Required Libraries

In Arduino IDE, install these libraries via Library Manager (Sketch > Include Library > Manage Libraries):

- **LiquidCrystal I2C** by Frank de Brabander

### 2. Upload the Code

1. Open `arduino/digit_display.ino` in Arduino IDE
2. Select your Arduino board (Tools > Board)
3. Select the correct COM port (Tools > Port)
4. Click Upload

### 3. Find Your LCD I2C Address (if needed)

If you see boxes instead of text, your LCD might be on address 0x3F instead of 0x27.

To check, upload this I2C scanner sketch:

```cpp
#include <Wire.h>

void setup() {
  Wire.begin();
  Serial.begin(9600);
  Serial.println("I2C Scanner");
}

void loop() {
  byte error, address;
  int nDevices = 0;

  for(address = 1; address < 127; address++ ) {
    Wire.beginTransmission(address);
    error = Wire.endTransmission();

    if (error == 0) {
      Serial.print("Device found at 0x");
      Serial.println(address, HEX);
      nDevices++;
    }
  }

  if (nDevices == 0) Serial.println("No I2C devices found");
  delay(5000);
}
```

Then open Serial Monitor (Tools > Serial Monitor) and note the address. Update line 6 in `digit_display.ino`:

```cpp
LiquidCrystal_I2C lcd(0x27, 16, 2);  // Change 0x27 to your address
```

## Backend Setup

### 1. Install Python Dependencies

```bash
cd backend-fastapi
pip install pyserial
# Or install all requirements
pip install -r requirements.txt
```

### 2. Find Arduino Port

The backend will try to auto-detect your Arduino. If it fails, you can manually specify the port:

**Linux**: Usually `/dev/ttyUSB0` or `/dev/ttyACM0`
**Windows**: Usually `COM3`, `COM4`, etc.
**macOS**: Usually `/dev/cu.usbserial-*` or `/dev/cu.usbmodem-*`

To list available ports on Linux:
```bash
ls /dev/tty*
```

### 3. Configure Port (Optional)

If auto-detection doesn't work, edit `backend-fastapi/send_to_arduino.py` line 76:

```python
# Change from:
arduino = ArduinoConnection()

# To:
arduino = ArduinoConnection(port='/dev/ttyUSB0')  # Your port here
```

## Testing the Setup

### 1. Start the Backend

```bash
cd backend-fastapi
uvicorn main:app --reload
```

### 2. Make a Prediction

Upload a digit image through your frontend or use curl:

```bash
curl -X POST "http://localhost:8000/predict" \
  -F "file=@your_digit_image.png"
```

### 3. Check the LCD

The LCD should display:
```
Predicted: 8
Accuracy: 94%
```

## Troubleshooting

### LCD shows boxes or garbage characters
- Check I2C address (try 0x3F if 0x27 doesn't work)
- Check wiring connections
- Verify LCD backlight is on

### Arduino not detected
- Check USB cable connection
- Install Arduino drivers if on Windows
- Check port permissions on Linux: `sudo usermod -a -G dialout $USER` (logout and login)
- Manually specify port in `send_to_arduino.py`

### No data received on Arduino
- Check Serial Monitor (9600 baud) to see if data arrives
- Verify Arduino is connected to correct port
- Check backend console for connection errors
- Try unplugging and replugging Arduino USB cable

### Backend errors
- Ensure `pyserial` is installed: `pip install pyserial`
- Check that Arduino serial monitor is CLOSED (only one program can use serial port)
- Check file permissions on Linux: `sudo chmod 666 /dev/ttyUSB0`

## How It Works

1. User uploads digit image to FastAPI backend
2. Model predicts digit and confidence
3. Backend sends formatted message to Arduino via serial: `PRED:8,94\n`
4. Arduino receives message, parses it, and updates LCD display
5. LCD shows: "Predicted: 8" and "Accuracy: 94%"

## Communication Protocol

Format: `PRED:digit,accuracy\n`

Examples:
- `PRED:0,98\n` - Digit 0 with 98% accuracy
- `PRED:7,85\n` - Digit 7 with 85% accuracy
- `PRED:9,100\n` - Digit 9 with 100% accuracy
