import { useState, useRef } from 'react';
import { isCanvasBlank } from '../utils/floodFill';

// Create a module-level variable to persist across component remounts
let hasEverShownNotification = false;

const useCanvasHistory = (canvasRef, setHasDrawing, setUndoNotification) => {
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const MAX_HISTORY_LENGTH = 5; // Limit history to prevent memory issues
  const totalActionsRef = useRef(0); // Track total number of actions performed

  // Save the current canvas state to history
  const saveToHistory = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Create a copy of the current canvas state
    const imageData = canvas.toDataURL('image/png');
    
    // If we're not at the end of the history (user has performed undo operations)
    // then truncate the history at the current index
    const newHistory = history.slice(0, historyIndex + 1);
    
    // Add the new state to history
    const updatedHistory = [...newHistory, imageData];
    
    // If history exceeds max length, remove oldest entries
    if (updatedHistory.length > MAX_HISTORY_LENGTH+1) {
      updatedHistory.shift();
    }
    
    setHistory(updatedHistory);
    setHistoryIndex(updatedHistory.length - 1);
    
    // Increment total actions counter
    totalActionsRef.current += 1;
  };

  // Initialize history with blank canvas
  const initializeHistory = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Create a blank white canvas
    const context = canvas.getContext("2d");
    context.fillStyle = "white";
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    // Save this blank state as the first history entry
    const imageData = canvas.toDataURL('image/png');
    setHistory([imageData]);
    setHistoryIndex(0);
  };

  // Add undo function
  const undo = () => {
 
    // Check if we're about to reach the beginning of history
    if (historyIndex <= 1) {
      // We're about to undo to the first item or we're already there
      if (setUndoNotification) {
        console.log("Showing undo notification"); // Debug log
        
        // If total actions is greater than MAX_HISTORY_LENGTH, show the limit message
        // but only if we haven't shown it before EVER
        if (totalActionsRef.current > MAX_HISTORY_LENGTH && !hasEverShownNotification) {
          setUndoNotification(`Undo is limited to ${MAX_HISTORY_LENGTH} steps`);
          hasEverShownNotification = true; // Mark that we've shown the notification
          
          // Clear the notification after 3 seconds
          setTimeout(() => {
            setUndoNotification(null);
          }, 3000);
        }
      }
    }
    
    // If we can't undo anymore, return
    if (historyIndex <= 0) {
      return; // Can't undo if at the beginning of history
    }
    
    // Clear any existing notification when successfully undoing (except the one we just set)
    if (setUndoNotification && historyIndex > 1) {
      setUndoNotification(null);
    }
    
    const newIndex = historyIndex - 1;
    setHistoryIndex(newIndex);
    
    // Load the previous canvas state
    const img = new Image();
    img.src = history[newIndex];
    img.onload = () => {
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      // Check if the canvas is actually blank instead of just checking history index
      const isBlank = isCanvasBlank(canvas);
      setHasDrawing(!isBlank);
    };
  };

  // Add redo function
  const redo = () => {
    if (historyIndex >= history.length - 1) return; // Can't redo if at the end of history
    
    const newIndex = historyIndex + 1;
    setHistoryIndex(newIndex);
    
    // Load the next canvas state
    const img = new Image();
    img.src = history[newIndex];
    img.onload = () => {
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      // Always set hasDrawing to true when redoing (except if it's the initial blank canvas)
      setHasDrawing(newIndex > 0);
    };
  };

  return {
    saveToHistory,
    initializeHistory,
    undo,
    redo,
    history,
    historyIndex,
    canUndoRedo: {
      canUndo: historyIndex > 0,
      canRedo: historyIndex < history.length - 1
    },
    totalActions: totalActionsRef.current
  };
};

export default useCanvasHistory;
