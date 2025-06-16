import React, { useEffect } from 'react';
import ToolBar from './components/ToolBar/ToolBar';
import { Canvas } from "./components/Canvas/Canvas";
import { BrushProvider } from "./context/BrushContext";
import { CanvasProvider } from "./context/CanvasContext";

const TOOLBAR_POSITION = 'bottom'; 

function App() {
  // Prevent text selection and context menu
  useEffect(() => {
    const preventSelection = (e) => {
      e.preventDefault();
      return false;
    };
    
    document.addEventListener('selectstart', preventSelection);
    document.addEventListener('contextmenu', preventSelection);
    
    return () => {
      document.removeEventListener('selectstart', preventSelection);
      document.removeEventListener('contextmenu', preventSelection);
    };
  }, []);

  return (
    <CanvasProvider>
      <BrushProvider>
        <div className="App" data-toolbar-position={TOOLBAR_POSITION}>
          <Canvas />
          <ToolBar position={TOOLBAR_POSITION} />
        </div>
      </BrushProvider>
    </CanvasProvider>
  );
}

export default App;
