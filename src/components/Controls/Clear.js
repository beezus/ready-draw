import React from 'react';
import Control from '../ToolBar/Control';
import './Brush.css';

const Clear = ({ onAction, isSidebarMode, disabled = false }) => {
  return (
    <Control 
      menuId="clear-button" 
      isActive={false}
      toggleMenu={onAction}
      isSidebarMode={isSidebarMode}
      disabled={disabled}
      icon={<i className="icon-trash" style={{ color: "white"}}></i>}
    />
  );
};

export default Clear;
