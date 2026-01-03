import numpy as np
import tensorflow as tf
from PIL import Image
import os
from datetime import datetime

# Load the IMPROVED model using TFSMLayer for Keras 3 compatibility
# This model uses softmax activation and categorical_crossentropy loss
# Expected accuracy: ~97-98% (vs ~10% for the old model)
model = tf.keras.Sequential([
    tf.keras.layers.TFSMLayer("../models/digit_model_improved/1/", call_endpoint='serve')
])

def preprocess_image(image: Image.Image):
    """
    Preprocesses image for MNIST model prediction.

    Handles RGBA (280x280x4) images from frontend and converts to model input format.

    Steps:
    1. Convert to grayscale (handles RGBA, RGB, or L)
    2. Resize to 28x28 (MNIST standard)
    3. Normalize pixel values from [0, 255] to [0, 1]
    4. Flatten to (1, 784) for model input

    Returns:
        np.ndarray: Preprocessed image as (1, 784) float32 tensor
    """
    image = image.convert("L")            # RGBA/RGB → Grayscale
    image = image.resize((28, 28))         # 280x280 → 28x28 (MNIST size)
    image = np.array(image) / 255.0        # Normalize [0, 255] → [0, 1]
    image = image.reshape(1, 784)          # Flatten (28, 28) → (1, 784)
    return image.astype(np.float32)

def predict_digit(image: Image.Image):
    # Save the original image to uploads folder before preprocessing
    uploads_dir = "uploads"
    os.makedirs(uploads_dir, exist_ok=True)
    
    # Generate unique filename with timestamp
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S_%f")
    filename = f"digit_{timestamp}.png"
    filepath = os.path.join(uploads_dir, filename)
    
    # Save the image
    image.save(filepath)
    print(f"Saved image to: {filepath}")
    
    # Now preprocess and predict
    input_tensor = preprocess_image(image)
    print("Input Image: ", input_tensor)
    predictions = model.predict(input_tensor)
    
    # Get all predictions for each digit (0-9)
    all_predictions = [
        {"digit": i, "probability": float(predictions[0][i])}
        for i in range(10)
    ]
    
    # Sort by probability (highest first)
    all_predictions.sort(key=lambda x: x["probability"], reverse=True)
    
    digit = int(np.argmax(predictions))
    confidence = float(np.max(predictions))

    return {
        "digit": digit,
        "confidence": confidence,
        "allPredictions": all_predictions
    }