import { useRef, forwardRef, useImperativeHandle } from 'react';
import SignatureCanvas from 'react-signature-canvas';

export interface DrawingCanvasHandle {
  getImageData: () => string | null;
  clear: () => void;
}

interface DrawingCanvasProps {
  onDrawingComplete: () => void;
}

const DrawingCanvas = forwardRef<DrawingCanvasHandle, DrawingCanvasProps>(
  ({ onDrawingComplete }, ref) => {
    const sigCanvas = useRef<SignatureCanvas>(null);

    useImperativeHandle(ref, () => ({
      getImageData: () => {
        if (sigCanvas.current?.isEmpty()) {
          return null;
        }
        return sigCanvas.current?.toDataURL('image/png') || null;
      },
      clear: () => {
        sigCanvas.current?.clear();
      },
    }));

    return (
      <div className="drawing-canvas-container">
        <h2>Draw a Digit</h2>
        <div className="canvas-wrapper">
          <SignatureCanvas
            ref={sigCanvas}
            penColor="white"
            canvasProps={{
              width: 280,
              height: 280,
              className: 'signature-canvas',
            }}
            onEnd={onDrawingComplete}
          />
        </div>
        <button
          className="clear-btn"
          onClick={() => {
            sigCanvas.current?.clear();
          }}
        >
          Clear
        </button>
      </div>
    );
  }
);

DrawingCanvas.displayName = 'DrawingCanvas';

export default DrawingCanvas;
