import { useState, useRef } from 'react';
import DrawingCanvas, { type DrawingCanvasHandle } from './components/DrawingCanvas';
import CNNVisualization from './components/CNNVisualization';
import PredictionDisplay from './components/PredictionDisplay';
import './App.css';

function App() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [prediction, setPrediction] = useState<number | null>(null);
  const [confidence, setConfidence] = useState(0);
  const [allPredictions, setAllPredictions] = useState<
    { digit: number; probability: number }[]
  >([]);
  const [showResult, setShowResult] = useState(false);
  const canvasRef = useRef<DrawingCanvasHandle>(null);

  const generateDummyPrediction = () => {
    const predictedDigit = Math.floor(Math.random() * 10);
    const baseConfidence = 0.85 + Math.random() * 0.14;
    const remainingProb = 1 - baseConfidence;

    const predictions = Array.from({ length: 10 }, (_, i) => {
      if (i === predictedDigit) {
        return { digit: i, probability: baseConfidence };
      }
      const randomProb = Math.random() * remainingProb * 0.3;
      return { digit: i, probability: randomProb };
    });

    const total = predictions.reduce((sum, p) => sum + p.probability, 0);
    const normalized = predictions.map((p) => ({
      ...p,
      probability: p.probability / total,
    }));

    return {
      digit: predictedDigit,
      confidence: baseConfidence,
      allPredictions: normalized,
    };
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

    setTimeout(() => {
      const result = generateDummyPrediction();
      setPrediction(result.digit);
      setConfidence(result.confidence);
      setAllPredictions(result.allPredictions);

      setTimeout(() => {
        setShowResult(true);
      }, 200);

      setIsProcessing(false);
    }, 2200);
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
