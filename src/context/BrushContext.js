import React, { createContext, useContext, useState } from 'react';

// Create the context
const BrushContext = createContext();

// Provider component
export const BrushProvider = ({ children }) => {
  const [currentBrush, setCurrentBrush] = useState('pencil');
  const [strokeWidth, setStrokeWidth] = useState(5);

  return (
    <BrushContext.Provider
      value={{
        currentBrush,
        setCurrentBrush,
        strokeWidth,
        setStrokeWidth
      }}
    >
      {children}
    </BrushContext.Provider>
  );
};

// Custom hook to use the tool context
export const useBrush = () => useContext(BrushContext);
