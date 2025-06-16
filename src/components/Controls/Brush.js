import React from 'react';
import Control from '../ToolBar/Control';
import { useCanvas } from "../../context/CanvasContext";
import { useBrush } from '../../context/BrushContext';
import './Brush.css';

const Brush = ({ menuContext, isSidebarMode }) => {
  const { activeMenu, toggleMenu } = menuContext;
  const { currentBrush, setCurrentBrush } = useBrush();
  const { changeStrokeWidth, strokeWidth } = useCanvas();

  const STROKE_THIN = 2;
  const STROKE_MEDIUM = 4;
  const STROKE_THICK = 10;

  return (
    <Control 
      menuId="brush-menu" 
      isActive={activeMenu === "brush-menu"}
      toggleMenu={toggleMenu}
      isSidebarMode={isSidebarMode}
      icon={
        <div className="brush-container">
          {currentBrush === 'pencil' ? 
            <i className={strokeWidth <= STROKE_THIN ? "icon-stroke-width-1" : 
                          strokeWidth <= STROKE_MEDIUM ? "icon-stroke-width-2" : 
                          "icon-stroke-width-3"} 
               style={{ color: "white" }}></i> :
            <i className="icon-fill" style={{ color: "white" }}></i>
          }
        </div>
      }
    >
      <div className="brush-menu">
          <button
            className={`stroke-button ${currentBrush === 'pencil' && strokeWidth === STROKE_THIN ? 'active' : ''}`}
            onClick={() => {
              if (!(currentBrush === 'pencil' && strokeWidth === STROKE_THIN)) {
                setCurrentBrush('pencil');
                changeStrokeWidth(STROKE_THIN);
                toggleMenu(null);
              }
            }}
          >
            <i className="icon-stroke-width-1 tool-icon"></i>
          </button>
          
          <button
            className={`stroke-button ${currentBrush === 'pencil' && strokeWidth === STROKE_MEDIUM ? 'active' : ''}`}
            onClick={() => {
              if (!(currentBrush === 'pencil' && strokeWidth === STROKE_MEDIUM)) {
                setCurrentBrush('pencil');
                changeStrokeWidth(STROKE_MEDIUM);
                toggleMenu(null);
              }
            }}
          >
            <i className="icon-stroke-width-2 tool-icon"></i>
          </button>
          
          <button
            className={`stroke-button ${currentBrush === 'pencil' && strokeWidth === STROKE_THICK ? 'active' : ''}`}
            onClick={() => {
              if (!(currentBrush === 'pencil' && strokeWidth === STROKE_THICK)) {
                setCurrentBrush('pencil');
                changeStrokeWidth(STROKE_THICK);
                toggleMenu(null);
              }
            }}
          >
            <i className="icon-stroke-width-3 tool-icon"></i>
          </button>
          
          <button
            className={`brush-button ${currentBrush === 'fill' ? 'active' : ''}`}
            onClick={() => {
              if (currentBrush !== 'fill') {
                setCurrentBrush('fill');
                toggleMenu(null);
              }
            }}
          >
            <i className="icon-fill tool-icon"></i>
          </button>
      </div>
    </Control>
  );
};

export default Brush;
