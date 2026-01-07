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
    Preprocesses image for MNIST model prediction using proper MNIST formatting.

    Handles RGBA (280x280x4) images from frontend and converts to model input format.

    Key improvements:
    - Finds bounding box of drawn digit to remove excess whitespace
    - Resizes while maintaining aspect ratio
    - Centers digit in 28x28 canvas (matching MNIST format)
    - Adds appropriate padding

    Steps:
    1. Convert to grayscale (handles RGBA, RGB, or L)
    2. Find bounding box of non-zero pixels
    3. Crop to bounding box with padding
    4. Resize to fit in 20x20 while maintaining aspect ratio
    5. Center in 28x28 canvas (MNIST standard)
    6. Normalize pixel values from [0, 255] to [0, 1]
    7. Flatten to (1, 784) for model input

    Returns:
        np.ndarray: Preprocessed image as (1, 784) float32 tensor
    """
    # Convert to grayscale
    image = image.convert("L")
    img_array = np.array(image)

    # Find bounding box of non-zero pixels (where digit is drawn)
    # Invert if needed (MNIST has white digits on black background)
    # But our canvas has white drawing on black, so we're good
    rows = np.any(img_array, axis=1)
    cols = np.any(img_array, axis=0)

    if not rows.any() or not cols.any():
        # Empty image, return zeros
        return np.zeros((1, 784), dtype=np.float32)

    rmin, rmax = np.where(rows)[0][[0, -1]]
    cmin, cmax = np.where(cols)[0][[0, -1]]

    # Add small padding to bounding box (10% of size)
    height = rmax - rmin
    width = cmax - cmin
    padding_h = int(height * 0.1)
    padding_w = int(width * 0.1)

    rmin = max(0, rmin - padding_h)
    rmax = min(img_array.shape[0], rmax + padding_h)
    cmin = max(0, cmin - padding_w)
    cmax = min(img_array.shape[1], cmax + padding_w)

    # Crop to bounding box
    cropped = img_array[rmin:rmax+1, cmin:cmax+1]

    # Resize to fit in 20x20 while maintaining aspect ratio
    # (MNIST digits typically occupy ~20x20 of the 28x28 canvas)
    cropped_pil = Image.fromarray(cropped)

    # Calculate new size maintaining aspect ratio
    max_size = 20
    height, width = cropped.shape
    if height > width:
        new_height = max_size
        new_width = int(width * max_size / height)
    else:
        new_width = max_size
        new_height = int(height * max_size / width)

    # Resize with high-quality resampling
    resized = cropped_pil.resize((new_width, new_height), Image.Resampling.LANCZOS)

    # Create 28x28 canvas and center the digit
    canvas = np.zeros((28, 28), dtype=np.uint8)

    # Calculate position to center the digit
    y_offset = (28 - new_height) // 2
    x_offset = (28 - new_width) // 2

    # Place resized digit in center
    canvas[y_offset:y_offset+new_height, x_offset:x_offset+new_width] = np.array(resized)

    # Normalize [0, 255] → [0, 1]
    normalized = canvas.astype(np.float32) / 255.0

    # Flatten (28, 28) → (1, 784)
    flattened = normalized.reshape(1, 784)

    return flattened

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