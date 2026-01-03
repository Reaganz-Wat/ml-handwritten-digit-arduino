import serial
import serial.tools.list_ports
import time

class ArduinoConnection:
    def __init__(self, port=None, baudrate=9600, timeout=1):
        """
        Initialize Arduino serial connection.

        Args:
            port: Serial port (e.g., '/dev/ttyUSB0' on Linux, 'COM3' on Windows)
                  If None, will attempt to auto-detect Arduino
            baudrate: Communication speed (default: 9600)
            timeout: Read timeout in seconds
        """
        self.port = port
        self.baudrate = baudrate
        self.timeout = timeout
        self.serial_connection = None

    def find_arduino_port(self):
        """Auto-detect Arduino port"""
        ports = serial.tools.list_ports.comports()
        for port in ports:
            # Look for Arduino in port description
            if 'Arduino' in port.description or 'USB' in port.description:
                print(f"Found potential Arduino at: {port.device}")
                return port.device
        return None

    def connect(self):
        """Establish connection to Arduino"""
        try:
            if self.port is None:
                self.port = self.find_arduino_port()
                if self.port is None:
                    print("No Arduino detected. Available ports:")
                    for port in serial.tools.list_ports.comports():
                        print(f"  - {port.device}: {port.description}")
                    return False

            self.serial_connection = serial.Serial(
                port=self.port,
                baudrate=self.baudrate,
                timeout=self.timeout
            )

            # Wait for Arduino to reset after serial connection
            time.sleep(2)
            print(f"Connected to Arduino on {self.port}")
            return True

        except serial.SerialException as e:
            print(f"Failed to connect to Arduino: {e}")
            return False

    def send_prediction(self, digit, confidence):
        """
        Send prediction to Arduino in format: "PRED:digit,accuracy"

        Args:
            digit: Predicted digit (0-9)
            confidence: Confidence score (0-1)
        """
        if not self.serial_connection or not self.serial_connection.is_open:
            print("Arduino not connected. Attempting to reconnect...")
            if not self.connect():
                print("Failed to send prediction - no connection")
                return False

        try:
            # Convert confidence to percentage
            accuracy = int(confidence * 100)

            # Format: "PRED:digit,accuracy\n"
            message = f"PRED:{digit},{accuracy}\n"

            self.serial_connection.write(message.encode())
            print(f"Sent to Arduino: {message.strip()}")
            return True

        except Exception as e:
            print(f"Error sending to Arduino: {e}")
            return False

    def close(self):
        """Close serial connection"""
        if self.serial_connection and self.serial_connection.is_open:
            self.serial_connection.close()
            print("Arduino connection closed")

# Global Arduino connection instance
arduino = ArduinoConnection()

def send_to_arduino(digit, confidence):
    """
    Convenience function to send prediction to Arduino.
    Handles connection automatically.

    Args:
        digit: Predicted digit (0-9)
        confidence: Confidence score (0-1)
    """
    return arduino.send_prediction(digit, confidence)
