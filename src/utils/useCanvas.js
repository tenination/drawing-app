import { useRef, useEffect } from 'react';

export const useCanvas = contextRef => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    contextRef.current = context;
  }, []);

  return canvasRef;
};
