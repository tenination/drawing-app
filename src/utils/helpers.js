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

export const radiansToDegrees = rad => {
  return (rad * (180 / Math.PI)).toFixed(2);
};

export const degreesToRadians = degrees => {
  return (degrees * Math.PI) / 180;
};

export const getAngleUsingXAndY = (mouselocX, mouselocY, mousedown) => {
  let adjacent = Math.abs(mousedown.x - mouselocX);
  let opposite = Math.abs(mousedown.y - mouselocY);

  return radiansToDegrees(Math.atan2(opposite, adjacent));
};

export const getPolygonPoints = (
  loc,
  shapeBoundingBox,
  polygonSides,
  mousedown
) => {
  let angle = degreesToRadians(getAngleUsingXAndY(loc.x, loc.y, mousedown));
  let radiusX = shapeBoundingBox.width;
  let radiusY = shapeBoundingBox.height;
  let polygonPoints = [];

  for (let i = 0; i < polygonSides; i++) {
    polygonPoints.push(
      createPointCoordinates(
        loc.x - radiusX * Math.sin(angle),
        loc.y - radiusY * Math.cos(angle)
      )
    );
    angle += (2 * Math.PI) / polygonSides;
  }

  return polygonPoints;
};
