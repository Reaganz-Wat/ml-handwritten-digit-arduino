#include <Wire.h>
#include <LiquidCrystal_I2C.h>

// LCD setup - try 0x27 first. If boxes remain, try 0x3F.
LiquidCrystal_I2C lcd(0x27, 16, 2);

// Variables to store prediction data
int predictedDigit = -1;
int accuracy = 0;
String inputBuffer = "";

void setup() {
  // Initialize Serial communication (9600 baud rate)
  Serial.begin(9600);

  // Initialize I2C and LCD
  Wire.begin();
  lcd.begin(16, 2);
  lcd.backlight();

  // Display startup message
  lcd.setCursor(0, 0);
  lcd.print("Waiting for");
  lcd.setCursor(0, 1);
  lcd.print("prediction...");
}

void loop() {
  // Check if data is available on Serial
  if (Serial.available() > 0) {
    char receivedChar = Serial.read();

    // Build the input buffer until newline
    if (receivedChar == '\n') {
      // Process the complete message
      processMessage(inputBuffer);
      inputBuffer = ""; // Clear buffer
    } else {
      inputBuffer += receivedChar;
    }
  }
}

void processMessage(String message) {
  // Expected format: "PRED:digit,accuracy"
  // Example: "PRED:8,94"

  if (message.startsWith("PRED:")) {
    // Remove "PRED:" prefix
    String data = message.substring(5);

    // Find comma separator
    int commaIndex = data.indexOf(',');

    if (commaIndex > 0) {
      // Extract digit and accuracy
      String digitStr = data.substring(0, commaIndex);
      String accuracyStr = data.substring(commaIndex + 1);

      predictedDigit = digitStr.toInt();
      accuracy = accuracyStr.toInt();

      // Update the LCD display
      updateDisplay();

      // Send confirmation back to computer (optional)
      Serial.print("Displayed: ");
      Serial.print(predictedDigit);
      Serial.print(" at ");
      Serial.print(accuracy);
      Serial.println("%");
    }
  }
}

void updateDisplay() {
  // Clear the display
  lcd.clear();

  // First line: "Predicted: X"
  lcd.setCursor(0, 0);
  lcd.print("Predicted: ");
  lcd.print(predictedDigit);

  // Second line: "Accuracy: XX%"
  lcd.setCursor(0, 1);
  lcd.print("Accuracy: ");
  lcd.print(accuracy);
  lcd.print("%");
}
