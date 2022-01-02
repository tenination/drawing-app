export function createShapeBoundingBoxCoordinates(left, top, width, height) {
  return {
    left,
    top,
    width,
    height,
  };
}

export function createPointCoordinates(x, y) {
  return {
    x,
    y,
  };
}

export function getMousePosition(x, y, canvasRef) {
  let canvasSizeData = canvasRef.current.getBoundingClientRect();
  return {
    x:
      (x - canvasSizeData.left) *
      (canvasRef.current.width / canvasSizeData.width),
    y:
      (y - canvasSizeData.top) *
      (canvasRef.current.height / canvasSizeData.height),
  };
}
