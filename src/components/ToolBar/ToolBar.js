import React, { useState, useEffect, useRef } from 'react';
import './ToolBar.css';
import BrushControl from '../Controls/Brush';
import ColorsControl from '../Controls/Palette';
import UndoControl from '../Controls/Undo';
import ClearControl from '../Controls/Clear';
import ExportControl from '../Controls/Export';
import { useBrush } from '../../context/BrushContext';
import { useCanvas } from '../../context/CanvasContext';

const ToolBar = ({ position = 'bottom' }) => {
  const [activeMenu, setActiveMenu] = useState(null);
  const isSidebarMode = position === 'left';
  const { clearCanvas, exportAsPNG, undo, hasDrawing } = useCanvas();
  const toolBarRef = useRef(null);

  // Handle clicks outside the button bar to close menus
  useEffect(() => {
    const handleOutsideInteraction = (event) => {
      // Only process if a menu is active
      if (activeMenu && toolBarRef.current && !toolBarRef.current.contains(event.target)) {
        setActiveMenu(null);
      }
    };

    // Listen for mouse and touch events
    document.addEventListener('mousedown', handleOutsideInteraction);
    document.addEventListener('touchstart', handleOutsideInteraction);
    
    return () => {
      document.removeEventListener('mousedown', handleOutsideInteraction);
      document.removeEventListener('touchstart', handleOutsideInteraction);
    };
  }, [activeMenu]);

  // Toggle menu function
  const toggleMenu = (menuId) => {
    // If clicking the same menu that's already active, just close it
    if (activeMenu === menuId) {
      setActiveMenu(null);
      return;
    }
    
    // If clicking a different menu while one is open, close the current one and open the new one
    setActiveMenu(menuId);
  };
  
  // Handle tool actions and close menu
  const handleToolAction = (action) => {
    if (action) {
      action();
    }
    setActiveMenu(null);
  };

  return (
    <div 
      className="toolbar" 
      data-position={position}
      ref={toolBarRef}
      onClick={(e) => {
        // If the click is directly on the toolbar (not on a child element)
        if (e.target === toolBarRef.current) {
          setActiveMenu(null);
        }
      }}
    >
      <BrushControl 
        menuContext={{ activeMenu, toggleMenu }}
        isSidebarMode={isSidebarMode} 
      />

      <ColorsControl 
        menuContext={{ activeMenu, toggleMenu }}
        isSidebarMode={isSidebarMode} 
      />

      <UndoControl 
        menuContext={{ activeMenu, toggleMenu }}
        isSidebarMode={isSidebarMode} 
        disabled={!hasDrawing}
      />

      <ClearControl 
        onAction={() => {
          if (hasDrawing) {
            if (window.confirm('Are you sure?')) {
              handleToolAction(() => clearCanvas());
            }
          } else {
            handleToolAction(() => clearCanvas());
          }
        }}
        isSidebarMode={isSidebarMode} 
        disabled={!hasDrawing}
      />

      <ExportControl 
        onAction={() => handleToolAction(() => exportAsPNG())}
        isSidebarMode={isSidebarMode} 
        disabled={!hasDrawing}
      />

    </div>
  );
};

export default ToolBar;
