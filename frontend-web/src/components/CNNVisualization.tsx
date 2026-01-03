import { useEffect, useState } from 'react';

interface CNNVisualizationProps {
  isProcessing: boolean;
}

interface Layer {
  name: string;
  neurons: number;
  color: string;
}

const layers: Layer[] = [
  { name: 'Input', neurons: 12, color: '#a78bfa' },
  { name: 'Conv 1', neurons: 16, color: '#8b5cf6' },
  { name: 'Conv 2', neurons: 20, color: '#7c3aed' },
  { name: 'Dense', neurons: 16, color: '#6d28d9' },
  { name: 'Output', neurons: 10, color: '#5b21b6' },
];

const CNNVisualization = ({ isProcessing }: CNNVisualizationProps) => {
  const [activeLayer, setActiveLayer] = useState(-1);
  const [connections, setConnections] = useState<boolean[]>([]);

  useEffect(() => {
    if (isProcessing) {
      setActiveLayer(0);
      setConnections([]);

      layers.forEach((_, index) => {
        setTimeout(() => {
          setActiveLayer(index);
          if (index > 0) {
            setConnections(prev => [...prev, true]);
          }
        }, index * 400);
      });

      setTimeout(() => {
        setActiveLayer(-1);
        setConnections([]);
      }, layers.length * 400 + 500);
    } else {
      setActiveLayer(-1);
      setConnections([]);
    }
  }, [isProcessing]);

  return (
    <div className="neural-network">
      <div className="layers-flow">
        {layers.map((layer, layerIndex) => (
          <div key={layerIndex} className="layer-column">
            <div className="layer-name-tag">{layer.name}</div>
            <div className="neurons-column">
              {Array.from({ length: layer.neurons }).map((_, neuronIndex) => (
                <div
                  key={neuronIndex}
                  className={`neuron-circle ${
                    activeLayer === layerIndex ? 'active' :
                    activeLayer > layerIndex ? 'completed' : ''
                  }`}
                  style={{
                    backgroundColor: layer.color,
                    animationDelay: `${neuronIndex * 0.03}s`,
                  }}
                />
              ))}
            </div>
            {layerIndex < layers.length - 1 && (
              <div className="connection-lines">
                <div className={`flow-arrow ${connections[layerIndex] ? 'active-flow' : ''}`}>
                  <div className="arrow-line" />
                  <div className="arrow-head">›</div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CNNVisualization;
