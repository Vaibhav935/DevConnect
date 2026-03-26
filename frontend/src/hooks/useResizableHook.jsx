import React, { useRef, useState } from "react";

const useResizableHook = () => {
  const [leftWidth, setLeftWidth] = useState(350);
  const isDragging = useRef(false);

  const handleMouseDown = () => {
    isDragging.current = true;
  };

  const handleMouseMove = (e) => {
    if (!isDragging.current) return;

    // Update width based on mouse X
    setLeftWidth(e.clientX);
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };
  return {
    isDragging,
    leftWidth,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
  };
};

export default useResizableHook;
