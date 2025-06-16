import React from 'react';
import SubMenu from './ControlMenu';
import './ToolBar.css';

const Control = ({ icon, menuId, isActive, toggleMenu, isSidebarMode, children, disabled = false }) => {
  return (
    <div className="button-container">
      <button 
        className={`button ${disabled ? 'disabled' : ''}`} 
        onClick={() => !disabled && toggleMenu(menuId)}
        disabled={disabled}
      >
        {icon}
      </button>
      
      <SubMenu 
        id={menuId} 
        isActive={isActive}
        isSidebarMode={isSidebarMode}
      >
        {children}
      </SubMenu>
    </div>
  );
};

export default Control;
