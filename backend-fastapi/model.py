import numpy as np
import tensorflow as tf
from PIL import Image

# Load the model using TFSMLayer for Keras 3 compatibility
model = tf.keras.Sequential([
    tf.keras.layers.TFSMLayer("../models/digit_model/1/", call_endpoint='serve')
])

def preprocess_image(image: Image.Image):
    """
    Converts image to (1, 784) float32 tensor
    """
    image = image.convert("L")            # grayscale
    image = image.resize((28, 28))         # MNIST size
    image = np.array(image) / 255.0        # normalize
    image = image.reshape(1, 784)          # flatten
    return image.astype(np.float32)

def predict_digit(image: Image.Image):
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