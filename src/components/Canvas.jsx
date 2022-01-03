import React, { useEffect, useRef, useState } from 'react';
import { useCanvas } from '../utils/useCanvas';
import {
  createShapeBoundingBoxCoordinates,
  createPointCoordinates,
  getMousePosition,
  getPolygonPoints,
} from '../utils/helpers';

function Canvas(props) {
  const contextRef = useRef(null);
  const canvasRef = useCanvas(contextRef);

  let currentTool = 'brush';
  let savedImageData;
  let dragging = false;
  let strokeColor = 'black';
  let fillColor = 'black';
  let lineWidth = 5;

  let usingBrush = false;
  let brushXPoints = new Array();
  let brushYPoints = new Array();
  let brushDownPos = new Array();
  let polygonSides = 6;

  let shapeBoundingBox = createShapeBoundingBoxCoordinates(0, 0, 0, 0);
  let mousedown = createPointCoordinates(0, 0);
  let loc = createPointCoordinates(0, 0);

  const drawRubberbandShape = loc => {
    contextRef.current.strokeColor = strokeColor;
    contextRef.current.fillColor = fillColor;
    contextRef.current.lineWidth = lineWidth;

    if (currentTool === 'brush') {
      drawBrush();
    }
    if (currentTool === 'line') {
      contextRef.current.beginPath();
      contextRef.current.moveTo(mousedown.x, mousedown.y);
      contextRef.current.lineTo(loc.x, loc.y);
      contextRef.current.stroke();
    }
    if (currentTool === 'rectangle') {
      contextRef.current.strokeRect(
        shapeBoundingBox.left,
        shapeBoundingBox.top,
        shapeBoundingBox.width,
        shapeBoundingBox.height
      );
    } else if (currentTool === 'circle') {
      let radius = shapeBoundingBox.width;
      contextRef.current.beginPath();
      contextRef.current.arc(mousedown.x, mousedown.y, radius, 0, 2 * Math.PI);
      contextRef.current.stroke();
    } else if (currentTool === 'ellipse') {
      let radiusX = shapeBoundingBox.width;
      let radiusY = shapeBoundingBox.height;
      contextRef.current.beginPath();
      contextRef.current.ellipse(
        mousedown.x,
        mousedown.y,
        radiusX,
        radiusY,
        0,
        0,
        2 * Math.PI
      );
      contextRef.current.stroke();
    } else if (currentTool == 'polygon') {
      getPolygon(loc);
      contextRef.current.stroke();
    }
  };

  const getPolygon = loc => {
    let polygonPoints = getPolygonPoints(
      loc,
      shapeBoundingBox,
      polygonSides,
      mousedown
    );
    contextRef.current.beginPath();
    contextRef.current.moveTo(polygonPoints[0].x, polygonPoints[0].y);

    for (let i = 1; i < polygonSides; i++) {
      contextRef.current.lineTo(polygonPoints[i].x, polygonPoints[i].y);
    }
    contextRef.current.closePath();
  };

  const drawBrush = () => {
    for (let i = 1; i < brushXPoints.length; i++) {
      contextRef.current.beginPath();

      if (brushDownPos[i]) {
        contextRef.current.moveTo(brushXPoints[i - 1], brushYPoints[i - 1]);
      } else {
        contextRef.current.moveTo(brushXPoints[i] - 1, brushYPoints[i]);
      }
      contextRef.current.lineTo(brushXPoints[i], brushYPoints[i]);
      contextRef.current.closePath();
      contextRef.current.stroke();
    }
  };

  const saveImage = () => {
    var imageFile = document.getElementById('img-file');
    imageFile.setAttribute('download', 'image.png');
    imageFile.setAttribute('href', canvasRef.current.toDataURL());
  };

  const openImage = () => {
    let img = new Image();
    img.onload = function () {
      contextRef.current.clearRect(
        0,
        0,
        canvasRef.current.width,
        canvasRef.current.height
      );
      contextRef.current.drawImage(img, 0, 0);
    };
    img.src = 'image.png';
  };

  const changeTool = toolClicked => {
    document.getElementById('open').className = '';
    document.getElementById('save').className = '';
    document.getElementById('brush').className = '';
    document.getElementById('line').className = '';
    document.getElementById('rectangle').className = '';
    document.getElementById('circle').className = '';
    document.getElementById('ellipse').className = '';
    document.getElementById('polygon').className = '';
    document.getElementById(toolClicked).className = 'selected';
    currentTool = toolClicked;
  };

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

  function addBrushPoint(x, y, mousedown) {
    brushXPoints.push(x);
    brushYPoints.push(y);
    brushDownPos.push(mousedown);
  }

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

    if (currentTool === 'brush') {
      usingBrush = true;
      addBrushPoint(loc.x, loc.y);
    }
  };

  const reactToMouseMove = e => {
    loc = getMousePosition(e.clientX, e.clientY, canvasRef);

    if (currentTool === 'brush' && dragging && usingBrush) {
      // Throw away brush drawings that occur outside of the canvas
      if (
        loc.x > 0 &&
        loc.x < canvasRef.current.width &&
        loc.y > 0 &&
        loc.y < canvasRef.current.height
      ) {
        addBrushPoint(loc.x, loc.y, true);
      }
      redrawCanvasImage();
      drawBrush();
    }
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
    <div className="wrapper">
      <div className="toolbar">
        <a className="selected" href="#" id="open" onClick={() => openImage}>
          <img src="open-icon.png" />
        </a>
        <a href="#" id="save" onClick={() => saveImage}>
          <img src="save-icon.png" />
        </a>
        <a href="#" id="brush" onClick={() => changeTool('brush')}>
          <img src="brush-icon.png" />
        </a>
        <a href="#" id="line" onClick={() => changeTool('line')}>
          <img src="line-icon.png" />
        </a>
        <a href="#" id="rectangle" onClick={() => changeTool('rectangle')}>
          <img src="rectangle-icon.png" />
        </a>
        <a href="#" id="circle" onClick={() => changeTool('circle')}>
          <img src="circle-icon.png" />
        </a>
        <a href="#" id="ellipse" onClick={() => changeTool('ellipse')}>
          <img src="ellipse-icon.png" />
        </a>
        <a href="#" id="polygon" onClick={() => changeTool('polygon')}>
          <img src="polygon-icon.png" />
        </a>
      </div>
      <canvas
        ref={canvasRef}
        onMouseDown={reactToMouseDown}
        onMouseUp={reactToMouseUp}
        onMouseMove={reactToMouseMove}
        {...props}
      />
      <div id="img-data-div">
        <a href="#" id="img-file" download="image.png">
          Download Image
        </a>
      </div>
    </div>
  );
}

export default Canvas;
