import React from 'react';
import Control from '../ToolBar/Control';
import './Brush.css';

const Export = ({ onAction, isSidebarMode, disabled = false }) => {
  return (
    <Control 
      menuId="export-button" 
      isActive={false}
      toggleMenu={onAction}
      isSidebarMode={isSidebarMode}
      disabled={disabled}
      icon={
        <i className="icon-export" style={{color: "white"}}></i>
      }
    />
  );
};

export default Export;
