import React, { useEffect } from "react";
import { useCanvas } from "../../context/CanvasContext";
import { useBrush } from "../../context/BrushContext";
import "./Canvas.css";

export function Canvas() {
  const {
    canvasRef,
    prepareCanvas,
    startDrawing,
    finishDrawing,
    draw,
    floodFill,
    strokeColor,
    isDrawing
  } = useCanvas();

  const { currentBrush } = useBrush();

  // Style object to prevent text selection and set cursor
  const canvasStyle = {
    userSelect: 'none',
    WebkitUserSelect: 'none',
    MozUserSelect: 'none',
    msUserSelect: 'none',
    cursor: currentBrush === 'fill' ? 'cell' : 'crosshair'
  };

  useEffect(() => {
    // Prepare the canvas initially - this will now only set dimensions once
    prepareCanvas();
    
    // We no longer need a resize handler since we don't want to resize the canvas
  }, [prepareCanvas]); // Only run this effect once

  return (
    <div className="canvas-container">
      <canvas
        onMouseDown={(e) => {
          if (currentBrush === 'pencil') {
            startDrawing(e.nativeEvent);
          } else if (currentBrush === 'fill') {
            floodFill(e.nativeEvent.offsetX, e.nativeEvent.offsetY, strokeColor);
          }
        }}
        onMouseUp={() => {
          if (currentBrush === 'pencil') {
            finishDrawing();
          }
        }}
        onMouseMove={(e) => {
          if (currentBrush === 'pencil' && isDrawing) {
            draw(e.nativeEvent);
          }
        }}
        onMouseLeave={() => {
          if (currentBrush === 'pencil') {
            finishDrawing();
          }
        }}
        onTouchStart={(e) => {
          e.preventDefault();
          const rect = canvasRef.current.getBoundingClientRect();
          const touch = e.touches[0];
          const offsetX = touch.clientX - rect.left;
          const offsetY = touch.clientY - rect.top;
          
          if (currentBrush === 'pencil') {
            startDrawing(touch);
          } else if (currentBrush === 'fill') {
            floodFill(offsetX, offsetY, strokeColor);
          }
        }}
        onTouchMove={(e) => {
          e.preventDefault();
          if (currentBrush === 'pencil' && isDrawing) {
            draw(e.touches[0]);
          }
        }}
        onTouchEnd={(e) => {
          e.preventDefault();
          if (currentBrush === 'pencil') {
            finishDrawing();
          }
        }}
        onTouchCancel={(e) => {
          e.preventDefault();
          if (currentBrush === 'pencil') {
            finishDrawing();
          }
        }}
        ref={canvasRef}
        style={canvasStyle}
        className="canvas"
      />
    </div>
  );
}
