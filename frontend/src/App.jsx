import useResizableHook from "./hooks/useResizableHook";
import ChatSection from "./components/ChatSection";
import VideoSection from "./components/VideoSection";

const App = () => {
  const { isDragging, handleMouseDown, handleMouseMove, handleMouseUp } =
    useResizableHook();

  return (
    <>
      <div
        className="h-screen flex bg-[#d1d7de] text-black select-none"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        {/* Left Panel (Chat) */}
        <ChatSection />

        {/* Divider */}
        <div
          onMouseDown={handleMouseDown}
          className={`w-0.5 bg-gray-400 cursor-col-resize transition-all duration-100 ease-linear hover:w-1.5 hover:bg-orange-600 ${isDragging.current ? `bg-blue-500` : `bg-gray-400`}`}
        />

        {/* Right Panel (Video Call) */}
        <VideoSection />
      </div>
    </>
  );
};

export default App;
