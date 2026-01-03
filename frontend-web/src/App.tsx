import { useState, useRef } from 'react';
import DrawingCanvas, { type DrawingCanvasHandle } from './components/DrawingCanvas';
import CNNVisualization from './components/CNNVisualization';
import PredictionDisplay from './components/PredictionDisplay';
import './App.css';

// Backend API URL - can be configured via environment variable
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

function App() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [prediction, setPrediction] = useState<number | null>(null);
  const [confidence, setConfidence] = useState(0);
  const [allPredictions, setAllPredictions] = useState<
    { digit: number; probability: number }[]
  >([]);
  const [showResult, setShowResult] = useState(false);
  const canvasRef = useRef<DrawingCanvasHandle>(null);

  /**
   * Converts a base64 data URL to a Blob
   */
  const dataURLtoBlob = (dataURL: string): Blob => {
    const arr = dataURL.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/png';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  };

  const handlePredict = async () => {
    const imageData = canvasRef.current?.getImageData();
    if (!imageData) {
      alert('Please draw a digit first!');
      return;
    }

    setIsProcessing(true);
    setShowResult(false);
    setPrediction(null);

    try {
      // Convert base64 data URL to Blob
      const blob = dataURLtoBlob(imageData);
      
      // Create FormData to send as multipart/form-data
      const formData = new FormData();
      formData.append('file', blob, 'digit.png');

      // Send POST request to backend
      const response = await fetch(`${API_URL}/predict`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();

      // Update state with prediction results
      setPrediction(result.digit);
      setConfidence(result.confidence);
      setAllPredictions(result.allPredictions || []);

      // Show result with animation
      setTimeout(() => {
        setShowResult(true);
      }, 200);
    } catch (err) {
      console.error('Prediction error:', err);
      alert(`Error: ${err instanceof Error ? err.message : 'Failed to get prediction. Make sure the backend is running.'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    canvasRef.current?.clear();
    setPrediction(null);
    setConfidence(0);
    setAllPredictions([]);
    setShowResult(false);
    setIsProcessing(false);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Handwritten Digit Recognition</h1>
        <p>Draw a digit and let the neural network predict it!</p>
      </header>

      <div className="main-container">
        <div className="side-section left-section">
          <DrawingCanvas ref={canvasRef} onDrawingComplete={() => {}} />
          <div className="action-buttons">
            <button
              className="predict-btn"
              onClick={handlePredict}
              disabled={isProcessing}
            >
              {isProcessing ? 'Processing...' : 'Predict'}
            </button>
            <button
              className="reset-btn"
              onClick={handleReset}
              disabled={isProcessing}
            >
              Reset
            </button>
          </div>
        </div>

        <div className="middle-section">
          <CNNVisualization isProcessing={isProcessing} />
        </div>

        <div className="side-section right-section">
          <PredictionDisplay
            prediction={prediction}
            confidence={confidence}
            allPredictions={allPredictions}
            showResult={showResult}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
