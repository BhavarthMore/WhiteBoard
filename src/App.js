import React, { useState, useRef } from 'react';
import './App.css';

function App() {
  const [textItems, setTextItems] = useState([]);
  const [currentText, setCurrentText] = useState('');
  const [currentFontSize, setCurrentFontSize] = useState(16);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [history, setHistory] = useState([]);
  const [redoHistory, setRedoHistory] = useState([]);
  const canvasRef = useRef(null);

  const addText = () => {
    if (currentText.trim() === '') return;

    const newText = {
      id: Date.now(),
      text: currentText,
      x: 150,
      y: 150,
      fontSize: currentFontSize,
      fontWeight: isBold ? 'bold' : 'normal',
      fontStyle: isItalic ? 'italic' : 'normal',
      textDecoration: isUnderline ? 'underline' : 'none',
    };

    const updatedTextItems = [...textItems, newText];
    setTextItems(updatedTextItems);
    setHistory([...history, updatedTextItems]);
    setRedoHistory([]);
    setCurrentText('');
  };

  const moveText = (event, id) => {
    const offsetLeft = canvasRef.current?.offsetLeft || 0;
    const offsetTop = canvasRef.current?.offsetTop || 0;

    const clientX = event.touches ? event.touches[0].clientX : event.clientX;
    const clientY = event.touches ? event.touches[0].clientY : event.clientY;

    const newX = clientX - offsetLeft;
    const newY = clientY - offsetTop;

    const textItem = textItems.find(item => item.id === id);
    const textWidth = calculateTextWidth(textItem);

    const updatedItems = textItems.map((item) => {
      if (item.id === id) {
        return {
          ...item,
          x: Math.max(0, Math.min(newX, canvasRef.current.clientWidth - textWidth)),
          y: Math.max(0, Math.min(newY, canvasRef.current.clientHeight - item.fontSize)),
        };
      }
      return item;
    });

    setTextItems(updatedItems);
    setHistory([...history, updatedItems]);
    setRedoHistory([]);
  };

  const handleMouseDown = (id, event) => {
    event.preventDefault();

    const onMouseMove = (e) => moveText(e, id);

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    const onTouchMove = (e) => moveText(e, id);

    const onTouchEnd = () => {
      document.removeEventListener('touchmove', onTouchMove);
      document.removeEventListener('touchend', onTouchEnd);
    };

    if (event.touches) {
      document.addEventListener('touchmove', onTouchMove);
      document.addEventListener('touchend', onTouchEnd);
    } else {
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    }
  };

  const calculateTextWidth = (item) => {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    context.font = `${item.fontWeight} ${item.fontSize}px Arial`;
    return context.measureText(item.text).width;
  };

  const undo = () => {
    if (history.length === 0) return;
    const lastState = history[history.length - 1];
    const newHistory = history.slice(0, history.length - 1);
    setRedoHistory([lastState, ...redoHistory]);
    setTextItems(newHistory[newHistory.length - 1] || []);
    setHistory(newHistory);
  };

  const redo = () => {
    if (redoHistory.length === 0) return;
    const nextState = redoHistory[0];
    const newRedoHistory = redoHistory.slice(1);
    setTextItems(nextState);
    setHistory([...history, nextState]);
    setRedoHistory(newRedoHistory);
  };

  const toggleBold = () => setIsBold(!isBold);
  const toggleItalic = () => setIsItalic(!isItalic);
  const toggleUnderline = () => setIsUnderline(!isUnderline);

  const increaseFontSize = () => setCurrentFontSize(prevSize => prevSize + 1);
  const decreaseFontSize = () => setCurrentFontSize(prevSize => Math.max(1, prevSize - 1));

  return (
    <div className="container">
      <div className="toolbar">
        <button onClick={undo}>↶ Undo</button>
        <button onClick={redo}>↷ Redo</button>
      </div>
      <div className="canvas" ref={canvasRef}>
        {textItems.map((item) => (
          <div
            key={item.id}
            className="text-item"
            style={{
              position: 'absolute',
              left: item.x,
              top: item.y,
              fontSize: `${item.fontSize}px`,
              fontWeight: item.fontWeight,
              fontStyle: item.fontStyle,
              textDecoration: item.textDecoration,
              cursor: 'move',
            }}
            onMouseDown={(event) => handleMouseDown(item.id, event)}
            onTouchStart={(event) => handleMouseDown(item.id, event)}
          >
            {item.text}
          </div>
        ))}
      </div>

      <div className="footer">
        <input
          type="text"
          value={currentText}
          onChange={(e) => setCurrentText(e.target.value)}
          placeholder="Enter text"
        />
        <button onClick={decreaseFontSize}>-</button>
        <span>{currentFontSize}px</span>
        <button onClick={increaseFontSize}>+</button>
        <button
          onClick={toggleBold}
          className={isBold ? 'active-button' : ''}
        >
          B
        </button>
        <button
          onClick={toggleItalic}
          className={isItalic ? 'active-button' : ''}
        >
          I
        </button>
        <button
          onClick={toggleUnderline}
          className={isUnderline ? 'active-button' : ''}
        >
          U
        </button>
        <button onClick={addText}>Add text</button>
      </div>
    </div>
  );
}

export default App;
