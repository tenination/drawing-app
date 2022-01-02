import React, { useEffect, useRef, useState } from 'react';
import { useCanvas } from '../utils/useCanvas';
import {
  createShapeBoundingBoxCoordinates,
  createPointCoordinates,
  getMousePosition,
} from '../utils/helpers';

function Canvas(props) {
  const contextRef = useRef(null);
  const canvasRef = useCanvas(contextRef);

  let savedImageData;
  let dragging = false;
  let strokeColor = 'black';
  let fillColor = 'black';
  let lineWidth = 5;

  let shapeBoundingBox = createShapeBoundingBoxCoordinates(0, 0, 0, 0);
  let mousedown = createPointCoordinates(0, 0);
  let loc = createPointCoordinates(0, 0);

  const saveCanvasImage = () => {
    savedImageData = contextRef.current.getImageData(
      0,
      0,
      canvasRef.current.width,
      canvasRef.current.height
    );
  };

  const redrawCanvasImage = () => {
    contextRef.current.putImageData(savedImageData, 0, 0);
  };

  const updateRubberbandSizeData = loc => {
    shapeBoundingBox.width = Math.abs(loc.x - mousedown.x);
    shapeBoundingBox.height = Math.abs(loc.y - mousedown.y);

    if (loc.x > mousedown.x) {
      shapeBoundingBox.left = mousedown.x;
    } else {
      shapeBoundingBox.left = loc.x;
    }

    if (loc.y > mousedown.y) {
      shapeBoundingBox.top = mousedown.y;
    } else {
      shapeBoundingBox.top = loc.y;
    }
  };

  const drawRubberbandShape = () => {
    contextRef.current.strokeStyle = strokeColor;
    contextRef.current.fillStyle = fillColor;
    contextRef.current.lineWidth = lineWidth;

    contextRef.current.strokeRect(
      shapeBoundingBox.left,
      shapeBoundingBox.top,
      shapeBoundingBox.width,
      shapeBoundingBox.height
    );
  };

  const updateRubberbandOnMove = loc => {
    updateRubberbandSizeData(loc);
    drawRubberbandShape(loc);
  };

  const reactToMouseDown = e => {
    loc = getMousePosition(e.clientX, e.clientY, canvasRef);
    saveCanvasImage(contextRef);
    mousedown.x = loc.x;
    mousedown.y = loc.y;
    dragging = true;
  };

  const reactToMouseMove = e => {
    loc = getMousePosition(e.clientX, e.clientY, canvasRef);
    if (dragging) {
      redrawCanvasImage();
      updateRubberbandOnMove(loc);
    }
  };

  const reactToMouseUp = e => {
    loc = getMousePosition(e.clientX, e.clientY, canvasRef);
    redrawCanvasImage();
    updateRubberbandOnMove(loc);
    dragging = false;
  };

  return (
    <>
      <canvas
        ref={canvasRef}
        onMouseDown={e => reactToMouseDown(e)}
        onMouseUp={e => reactToMouseUp(e)}
        onMouseMove={e => reactToMouseMove(e)}
        {...props}
      />
    </>
  );
}

export default Canvas;
