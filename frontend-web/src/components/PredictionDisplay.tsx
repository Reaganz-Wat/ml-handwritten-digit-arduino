import { useEffect, useState } from 'react';

interface PredictionDisplayProps {
  prediction: number | null;
  confidence: number;
  allPredictions: { digit: number; probability: number }[];
  showResult: boolean;
}

const PredictionDisplay = ({
  prediction,
  confidence,
  allPredictions,
  showResult,
}: PredictionDisplayProps) => {
  const [animateResult, setAnimateResult] = useState(false);

  useEffect(() => {
    if (showResult && prediction !== null) {
      setAnimateResult(false);
      setTimeout(() => setAnimateResult(true), 50);
    }
  }, [showResult, prediction]);

  return (
    <div className="prediction-display">
      <h2>Prediction</h2>
      {prediction === null ? (
        <div className="empty-state">
          <div className="placeholder-digit">?</div>
          <p>Draw a digit to see the prediction</p>
        </div>
      ) : (
        <>
          <div className={`predicted-digit ${animateResult ? 'show' : ''}`}>
            {prediction}
          </div>
          <div className={`confidence ${animateResult ? 'show' : ''}`}>
            <div className="confidence-label">Confidence</div>
            <div className="confidence-value">{(confidence * 100).toFixed(1)}%</div>
            <div className="confidence-bar">
              <div
                className="confidence-fill"
                style={{ width: `${confidence * 100}%` }}
              />
            </div>
          </div>
          <div className={`all-predictions ${animateResult ? 'show' : ''}`}>
            <div className="predictions-label">All Predictions</div>
            <div className="predictions-list">
              {allPredictions
                .sort((a, b) => b.probability - a.probability)
                .map((pred, index) => (
                  <div key={pred.digit} className="prediction-item">
                    <span className="digit-label">{pred.digit}</span>
                    <div className="probability-bar-container">
                      <div
                        className="probability-bar"
                        style={{
                          width: `${pred.probability * 100}%`,
                          animationDelay: `${index * 0.05}s`,
                        }}
                      />
                    </div>
                    <span className="probability-value">
                      {(pred.probability * 100).toFixed(1)}%
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default PredictionDisplay;
