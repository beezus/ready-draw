import React, { useContext, useRef, useState, useEffect } from "react";
import useCanvasHistory from "../hooks/useCanvasHistory";
import { performFloodFill } from "../utils/floodFill";

// enabling drawing on the blank canvas
const CanvasContext = React.createContext();

export const CanvasProvider = ({ children }) => {
  const [isDrawing, setIsDrawing] = useState(false);
  const [strokeColor, setStrokeColor] = useState("black");
  const [strokeWidth, setStrokeWidth] = useState(5);
  const [hasDrawing, setHasDrawing] = useState(false);
  const [canvasInitialized, setCanvasInitialized] = useState(false);
  // Add state to track if initial sizing is done
  const [initialSizingDone, setInitialSizingDone] = useState(false);
  // Store initial canvas dimensions
  const [initialCanvasSize, setInitialCanvasSize] = useState({ width: 0, height: 0 });
  const [undoNotification, setUndoNotification] = useState(null);
  const canvasRef = useRef(null);
  const contextRef = useRef(null);

  // Use the history hook
  const { saveToHistory, initializeHistory, undo, redo, history, historyIndex, canUndoRedo } = useCanvasHistory(canvasRef, setHasDrawing, setUndoNotification);
  
  // Debug: Log when notification changes
  useEffect(() => {
    if (undoNotification) {
      console.log("Notification state updated:", undoNotification);
    }
  }, [undoNotification]);

  //defining width & height of the canvas
  const prepareCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Only set canvas dimensions once at initial load
    if (!initialSizingDone) {
      const container = canvas.parentElement;
      if (!container) return;
      
      // Get the button bar position and size
      const toolBarPosition = document.querySelector('.App').getAttribute('data-toolbar-position');
      const toolBarSize = 64;

      // Calculate available space accounting for the button bar
      let availableWidth, availableHeight;
      
      if (toolBarPosition === 'left') {
        availableWidth = window.innerWidth - toolBarSize;
        availableHeight = window.innerHeight;
      } else { // bottom
        availableWidth = window.innerWidth;
        availableHeight = window.innerHeight - toolBarSize;
      }
      
      // Set canvas dimensions to fill available space
      canvas.width = availableWidth;
      canvas.height = availableHeight;
      
      // Store these initial dimensions
      setInitialCanvasSize({ width: availableWidth, height: availableHeight });
      
      // Set canvas style to ensure it maintains this size
      canvas.style.width = `${availableWidth}px`;
      canvas.style.height = `${availableHeight}px`;
      
      // Configure drawing context - ONLY do this during initial setup
      const context = canvas.getContext("2d");
      context.lineCap = "round";
      context.strokeStyle = strokeColor;
      context.lineWidth = strokeWidth;
      contextRef.current = context;
      
      // Initialize with a blank canvas in history if not already initialized
      if (!canvasInitialized) {
        initializeHistory();
        setCanvasInitialized(true);
      }
      
      // Mark initial sizing as done
      setInitialSizingDone(true);
    } else if (!contextRef.current) {
      // If context is somehow lost but sizing is done, just recreate the context
      // without changing the canvas size or content
      const context = canvas.getContext("2d");
      context.lineCap = "round";
      context.strokeStyle = strokeColor;
      context.lineWidth = strokeWidth;
      contextRef.current = context;
    }
  };

  const startDrawing = (event) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
  
    // Get the bounding rectangle of the canvas
    const rect = canvas.getBoundingClientRect();
  
    // Handle both mouse and touch events
    let clientX, clientY;
  
    // Check if it's a touch event (has touches property)
    if (event.touches || event.clientX === undefined) {
      // Touch event or touch object passed directly
      clientX = event.touches ? event.touches[0].clientX : event.clientX;
      clientY = event.touches ? event.touches[0].clientY : event.clientY;
    } else {
      // Mouse event
      clientX = event.clientX;
      clientY = event.clientY;
    }
  
    // Calculate the actual position in canvas coordinates
    const x = clientX - rect.left;
    const y = clientY - rect.top;
  
    // Make sure we have the correct context settings before starting to draw
    if (contextRef.current) {
      contextRef.current.strokeStyle = strokeColor;
      contextRef.current.lineWidth = strokeWidth;
      contextRef.current.lineCap = "round";
      contextRef.current.beginPath();
      contextRef.current.moveTo(x, y);
      setIsDrawing(true);
    }
  };

  const finishDrawing = () => {
    contextRef.current.closePath();
    setIsDrawing(false);
    
    // Only save to history if something was actually drawn
    const canvas = canvasRef.current;
    const currentState = canvas.toDataURL('image/png');
    
    // Check if the current state is different from the last state in history
    if (history.length === 0 || currentState !== history[historyIndex]) {
      saveToHistory(); // Save the canvas state after each completed stroke
      setHasDrawing(true); // Set hasDrawing to true when a stroke is completed
    }
  };

  const draw = (event) => {
    if (!isDrawing) {
      return;
    }
  
    const canvas = canvasRef.current;
    if (!canvas || !contextRef.current) return;
  
    // Get the bounding rectangle of the canvas
    const rect = canvas.getBoundingClientRect();
  
    // Handle both mouse and touch events
    let clientX, clientY;
  
    // Check if it's a touch event (has touches property)
    if (event.touches || event.clientX === undefined) {
      // Touch event or touch object passed directly
      clientX = event.touches ? event.touches[0].clientX : event.clientX;
      clientY = event.touches ? event.touches[0].clientY : event.clientY;
    } else {
      // Mouse event
      clientX = event.clientX;
      clientY = event.clientY;
    }
  
    // Calculate the actual position in canvas coordinates
    const x = clientX - rect.left;
    const y = clientY - rect.top;
  
    // Ensure we're using the correct stroke settings
    contextRef.current.strokeStyle = strokeColor;
    contextRef.current.lineWidth = strokeWidth;
  
    contextRef.current.lineTo(x, y);
    contextRef.current.stroke();
  };

  //once the canvas is cleared it return to the default colour
  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    context.fillStyle = "white";
    context.fillRect(0, 0, canvas.width, canvas.height);
    saveToHistory(); // Save the cleared canvas to history
    setHasDrawing(false); // Reset hasDrawing when canvas is cleared
  };


  const changeStrokeColor = (color) => {
    setStrokeColor(color);
    if (contextRef.current) {
      contextRef.current.strokeStyle = color;
    }
  };

  const changeStrokeWidth = (width) => {
    setStrokeWidth(width);
    if (contextRef.current) {
      contextRef.current.lineWidth = width;
    }
  };

  const exportAsPNG = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Create a temporary link element
    const link = document.createElement('a');
    
    // Set the download attribute with a filename
    const timestamp = Date.now();
    link.download = `ReadyDraw_${timestamp}.png`;
    
    // Convert the canvas to a data URL and set it as the href
    link.href = canvas.toDataURL('image/png');
    
    // Append to the document, click it to trigger download, then remove it
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const floodFill = (offsetX, offsetY, fillColor) => {
    const wasModified = performFloodFill(canvasRef.current, offsetX, offsetY, fillColor, saveToHistory);
    if (wasModified) {
      setHasDrawing(true);
    }
  };

  return (
    <CanvasContext.Provider
      value={{
        canvasRef,
        contextRef,
        prepareCanvas,
        startDrawing,
        finishDrawing,
        clearCanvas,
        changeStrokeColor,
        changeStrokeWidth,
        strokeColor,
        strokeWidth,
        undo,
        redo,
        draw,
        exportAsPNG,
        hasDrawing,
        floodFill,
        isDrawing,
        canUndoRedo,
        undoNotification,
        setUndoNotification
      }}
    >
      {children}
    </CanvasContext.Provider>
  );
};

export const useCanvas = () => useContext(CanvasContext);
