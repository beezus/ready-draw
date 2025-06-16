import React from 'react';
import './ToolBar.css';

const ControlMenu = ({ id, isActive, isSidebarMode, children }) => {
  // Add a handler to prevent event propagation
  const handleMenuInteraction = (e) => {
    // Prevent the event from reaching the document
    e.stopPropagation();
  };

  return (
    <div 
      id={id} 
      className={`sub-menu ${isActive ? 'active' : ''} ${isSidebarMode ? 'sidebar-mode' : 'centered-mode'}`}
      onClick={handleMenuInteraction}
      onTouchStart={handleMenuInteraction}
    >
      {children}
    </div>
  );
};

export default ControlMenu;
