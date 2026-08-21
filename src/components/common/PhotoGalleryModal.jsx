import { SpecimenImage } from "./SpecimenImage.jsx";
import { useState, useEffect } from "react";
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
const PhotoGalleryModal = ({
  photos,
  initialIndex = 0,
  specimenScientificName,
  accessionNumber,
  isOpen,
  onClose
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isPanning, setIsPanning] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  useEffect(() => {
    setCurrentIndex(initialIndex);
    setZoomLevel(1);
    setPosition({ x: 0, y: 0 });
  }, [initialIndex, isOpen]);
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "ArrowLeft") handlePrev();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, currentIndex, photos.length]);
  if (!isOpen || !photos || photos.length === 0) return null;
  const currentPhoto = photos[currentIndex];
  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % photos.length);
    setZoomLevel(1);
    setPosition({ x: 0, y: 0 });
  };
  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + photos.length) % photos.length);
    setZoomLevel(1);
    setPosition({ x: 0, y: 0 });
  };
  const zoomIn = () => setZoomLevel((z) => Math.min(3.5, z + 0.5));
  const zoomOut = () => {
    setZoomLevel((z) => {
      const next = Math.max(1, z - 0.5);
      if (next === 1) setPosition({ x: 0, y: 0 });
      return next;
    });
  };
  const resetZoom = () => {
    setZoomLevel(1);
    setPosition({ x: 0, y: 0 });
  };
  const handleMouseDown = (e) => {
    if (zoomLevel > 1) {
      setIsPanning(true);
      setStartPos({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  };
  const handleMouseMove = (e) => {
    if (isPanning && zoomLevel > 1) {
      setPosition({
        x: e.clientX - startPos.x,
        y: e.clientY - startPos.y
      });
    }
  };
  const handleMouseUp = () => setIsPanning(false);
  return <div className="fixed inset-0 z-50 bg-[#0F1712]/95 backdrop-blur-md flex flex-col justify-between select-none">
    {
      /* Top Bar */
    }
    <div className="flex items-center justify-between px-3 sm:px-6 py-3 sm:py-4 border-b border-white/10 text-white z-10 gap-2">
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <span className="font-mono-acc text-[10px] sm:text-xs bg-white/15 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-sm shrink-0">
          {accessionNumber}
        </span>
        <h2 className="font-serif-heading text-xs sm:text-base lg:text-lg font-bold truncate">
          <span className="italic">{specimenScientificName}</span>
        </h2>
        <span className="text-[10px] sm:text-xs text-white/60 hidden md:inline shrink-0">
          ({currentIndex + 1}/{photos.length})
        </span>
      </div>

      {
        /* Controls */
      }
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        <div className="flex items-center bg-white/10 rounded-sm p-0.5 sm:p-1 gap-0.5 sm:gap-1">
          <button
            onClick={zoomOut}
            disabled={zoomLevel <= 1}
            className="p-1 sm:p-1.5 hover:bg-white/20 disabled:opacity-30 rounded-xs text-white transition-colors"
            title="Zoom out"
            aria-label="Zoom out"
          >
            <ZoomOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
          <span className="text-[10px] sm:text-xs font-mono-acc px-1 text-white/80">
            {Math.round(zoomLevel * 100)}%
          </span>
          <button
            onClick={zoomIn}
            disabled={zoomLevel >= 3.5}
            className="p-1 sm:p-1.5 hover:bg-white/20 disabled:opacity-30 rounded-xs text-white transition-colors"
            title="Zoom in"
            aria-label="Zoom in"
          >
            <ZoomIn className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
          <button
            onClick={resetZoom}
            className="p-1 sm:p-1.5 hover:bg-white/20 rounded-xs text-white transition-colors ml-0.5 sm:ml-1"
            title="Reset Zoom"
            aria-label="Reset zoom"
          >
            <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 sm:p-2 hover:bg-white/20 rounded-sm text-white transition-colors"
          title="Close Gallery (Esc)"
          aria-label="Close photo gallery"
        >
          <X className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
      </div>
    </div>

    {
      /* Main Image Stage */
    }
    <div
      className="flex-1 relative flex items-center justify-center overflow-hidden cursor-grab active:cursor-grabbing p-2 sm:p-4"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {
        /* Prev / Next buttons */
      }
      {photos.length > 1 && <>
        <button
          onClick={handlePrev}
          className="absolute left-2 sm:left-6 z-20 p-2 sm:p-3 rounded-full bg-black/60 hover:bg-black/80 text-white transition-all transform hover:scale-105"
          aria-label="Previous photograph"
        >
          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
        <button
          onClick={handleNext}
          className="absolute right-2 sm:right-6 z-20 p-2 sm:p-3 rounded-full bg-black/60 hover:bg-black/80 text-white transition-all transform hover:scale-105"
          aria-label="Next photograph"
        >
          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
      </>}

      {
        /* Display Image with Pan & Zoom */
      }
      <div
        className="transition-transform duration-75 flex items-center justify-center max-w-full max-h-full"
        style={{
          transform: `scale(${zoomLevel}) translate(${position.x / zoomLevel}px, ${position.y / zoomLevel}px)`
        }}
      >
        <SpecimenImage
          src={currentPhoto.storageUrl}
          alt={currentPhoto.altText || specimenScientificName}
          className="max-h-[72vh] sm:max-h-[78vh] max-w-[92vw] sm:max-w-[85vw] object-contain rounded-xs shadow-2xl pointer-events-none"
          fallbackClassName="max-h-[72vh] sm:max-h-[78vh] max-w-[92vw] sm:max-w-[85vw]"
        />
      </div>
    </div>

    {
      /* Bottom Thumbnail Strip & Captions */
    }
    <div className="px-3 sm:px-6 py-2.5 sm:py-4 border-t border-white/10 bg-black/50 text-white flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-4 z-10">
      <div className="text-[11px] sm:text-xs text-white/80 max-w-xl text-center sm:text-left truncate w-full sm:w-auto">
        <p className="font-medium text-white truncate">
          {currentPhoto.caption || currentPhoto.altText}
        </p>
      </div>

      {
        /* Thumbnails */
      }
      {photos.length > 1 && <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 max-w-full sm:max-w-md">
        {photos.map((p, idx) => <button
          key={p.id || idx}
          onClick={() => {
            setCurrentIndex(idx);
            resetZoom();
          }}
          className={`relative w-10 h-10 sm:w-14 sm:h-14 rounded-xs overflow-hidden border-2 shrink-0 transition-all ${idx === currentIndex ? "border-[#5A9E72] scale-105" : "border-white/20 opacity-60 hover:opacity-100"}`}
        >
          <SpecimenImage
            src={p.storageUrl}
            alt={p.altText || ""}
            className="w-full h-full object-contain"
            fallbackClassName="w-full h-full"
          />
          {p.isPrimary && <span className="absolute bottom-0 inset-x-0 bg-[#2D5A3D] text-[8px] sm:text-[9px] text-center font-bold text-white uppercase">
            Primary
          </span>}
        </button>)}
      </div>}
    </div>
  </div>;
};
export {
  PhotoGalleryModal
};
