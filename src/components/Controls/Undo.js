import React from 'react';
import Control from '../ToolBar/Control';
import { useCanvas } from "../../context/CanvasContext";
import './Brush.css';

const Undo = ({ menuContext, isSidebarMode }) => {
  const { toggleMenu } = menuContext;
  const { undo, canUndoRedo, undoNotification } = useCanvas();

  return (
    <>
      <Control 
        menuId="undo-button" 
        isActive={false}
        toggleMenu={() => {
          undo();
          toggleMenu(null);
        }}
        isSidebarMode={isSidebarMode}
        disabled={!canUndoRedo?.canUndo}
        icon={
          <i className="icon-undo" style={{ color: "white"}}></i>
        }
      />
      {undoNotification && (
        <div className="notification-toast" style={{
          position: 'fixed',
          bottom: '80px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          color: 'white',
          padding: '12px 24px',
          borderRadius: '8px',
          zIndex: 9999,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
          fontWeight: 'bold',
          fontSize: '16px',
          pointerEvents: 'none'
        }}>
          {undoNotification}
        </div>
      )}
    </>
  );
};

export default Undo;
