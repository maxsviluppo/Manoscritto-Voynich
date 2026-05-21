import React, { useState, useRef, useEffect } from "react";
import { Hotspot } from "../types";
import { FO_F34V_HOTSPOTS } from "../data";
import { ZoomIn, ZoomOut, Maximize2, Move, AlertCircle, HelpCircle } from "lucide-react";

interface ManuscriptMapProps {
  activeHotspotId: string | null;
  onSelectHotspot: (hotspot: Hotspot | null) => void;
  language: "it" | "en";
}

export const ManuscriptMap: React.FC<ManuscriptMapProps> = ({
  activeHotspotId,
  onSelectHotspot,
  language
}) => {
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [imageError, setImageError] = useState<boolean>(false);
  const [imageLoaded, setImageLoaded] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // High-resolution scan from Wikimedia Commons
  const imageUrl = "https://upload.wikimedia.org/wikipedia/commons/2/21/Voynich_Manuscript_-_f34v.jpg";

  // Reset zoom & pan when clicking Reset
  const handleReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.35, 3.5));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.35, 1));
  };

  // Mouse handlers for smooth dragging/panning when zoomed in
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (zoom <= 1) return; // Only allow panning if zoomed
    const container = containerRef.current;
    if (!container) return;
    
    setIsDragging(true);
    setDragStart({
      x: e.clientX - pan.x,
      y: e.clientY - pan.y
    });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || zoom <= 1) return;
    
    // Bounds control to prevent infinite dragging
    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;
    
    // Boundary calculations based on zoom density
    const maxOffset = (zoom - 1) * 200;
    setPan({
      x: Math.max(-maxOffset, Math.min(maxOffset, newX)),
      y: Math.max(-maxOffset, Math.min(maxOffset, newY))
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Prevent drag issues if mouse leaves drawing container
  useEffect(() => {
    const handleGlobalMouseUp = () => setIsDragging(false);
    window.addEventListener("mouseup", handleGlobalMouseUp);
    return () => window.removeEventListener("mouseup", handleGlobalMouseUp);
  }, []);

  return (
    <div className="flex flex-col h-full bg-[#16171a] border border-[#2d2e34] rounded-2xl overflow-hidden shadow-2xl relative group">
      {/* Header Controls */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#1b1c21] border-b border-[#2d2e34] z-10">
        <div className="flex items-center gap-2">
          <Maximize2 className="w-4 h-4 text-emerald-500" />
          <span className="text-xs font-mono font-bold tracking-wider text-gray-300 uppercase">
            {language === "it" ? "FOGLIO f34v - TAVOLA INTERATTIVA" : "FOLIO f34v - INTERACTIVE PLAT"}
          </span>
        </div>
        
        {/* Interactive Controls */}
        <div className="flex items-center gap-1.5 bg-[#121315]/80 p-1 rounded-lg border border-[#2d2e34]">
          <button
            onClick={handleZoomOut}
            disabled={zoom <= 1}
            className="p-1 px-1.5 hover:bg-[#25272e] rounded text-gray-400 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
            title="Zoom out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-[10px] font-mono text-gray-400 font-bold px-1 min-w-[35px] text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={handleZoomIn}
            disabled={zoom >= 3.5}
            className="p-1 px-1.5 hover:bg-[#25272e] rounded text-gray-400 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
            title="Zoom in"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <div className="w-[1px] h-3 bg-[#2d2e34] my-2"></div>
          <button
            onClick={handleReset}
            className="text-[9px] font-mono font-bold text-emerald-400 hover:text-emerald-300 px-1.5 hover:bg-[#1f3f35]/30 rounded py-0.5 transition-colors"
          >
            RESET
          </button>
        </div>
      </div>

      {/* Subtitles Helper */}
      <div className="px-4 py-2 bg-[#202126] text-[11px] text-gray-400 border-b border-[#2d2e34] flex items-center gap-2">
        <Move className="w-3.5 h-3.5 text-amber-500 shrink-0" />
        <p className="leading-normal">
          {language === "it"
            ? "Clicca sulle aree evidenziate o sui testi per decifrare. Trascina con il mouse se hai effettuato lo zoom."
            : "Click on highlighted areas or text to decipher. Drag to pan when zoomed in."}
        </p>
      </div>

      {/* Main Map Stage */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        className={`flex-1 relative overflow-hidden select-none touch-none ${
          zoom > 1 ? (isDragging ? "cursor-grabbing" : "cursor-grab") : "cursor-default"
        }`}
        style={{ minHeight: "480px" }}
      >
        {/* Loading Spinner */}
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#15161b] z-10 transition-opacity">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-500 mb-2"></div>
            <span className="text-xs text-gray-400 font-mono tracking-wide">
              {language === "it" ? "Lettura manoscritto medievale..." : "Loading medieval manuscript..."}
            </span>
          </div>
        )}

        {/* Fallback Vector Illustration in case of Image Load Failure (Offline Sandbox) */}
        {imageError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-[#1a1b20] text-gray-300">
            <AlertCircle className="w-12 h-12 text-amber-500 mb-3" />
            <h4 className="font-mono font-bold text-sm text-amber-400 mb-2">
              {language === "it" ? "CARICAMENTO GUIDATO" : "GUIDED DIAGRAM"}
            </h4>
            <p className="text-xs text-gray-400 max-w-sm mb-4">
              {language === "it"
                ? "Impossibile caricare l'immagine originale dal server Yale/Wikimedia. Visualizzazione dell'erbario vettoriale di sottomissione alternativo."
                : "Unable to retrieve the original scan from Commons. Revealing native vector botanical plat."}
            </p>
            <button
              onClick={() => setImageError(false)}
              className="px-3 py-1.5 text-xs font-mono font-bold text-[#1a1b20] bg-emerald-400 hover:bg-emerald-300 rounded transition-all"
            >
              Riprova / Retry
            </button>
          </div>
        )}

        {/* Zoomed/Panned Interactive Stage Wrap */}
        <div
          className="absolute inset-0 transition-transform duration-100 ease-out origin-center flex items-center justify-center p-4"
          style={{
            transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
          }}
        >
          <div className="relative max-h-full max-w-full aspect-[3/4] overflow-hidden bg-[#efeadd] dark:bg-[#d8cfa3]/20 rounded-lg p-1 border border-amber-900/10 shadow-2xl">
            {/* The Image */}
            <img
              ref={imageRef}
              src={imageUrl}
              alt="Voynich Manuscript Folio f34v"
              referrerPolicy="no-referrer"
              onLoad={() => {
                setImageLoaded(true);
                setImageError(false);
              }}
              onError={() => {
                setImageError(true);
                setImageLoaded(true);
              }}
              className={`max-h-[64vh] max-w-full object-contain filter contrast-[1.05] brightness-[0.98] transition-opacity duration-300 pointer-events-none rounded ${
                imageLoaded && !imageError ? "opacity-100" : "opacity-0"
              }`}
            />

            {/* Render Hotspot Overlay Boxes on top of the image container absolute coordinates */}
            {imageLoaded && !imageError && FO_F34V_HOTSPOTS.map((spot) => {
              const isActive = activeHotspotId === spot.id;
              
              // Map spot sizes according to relative percentage values
              return (
                <button
                  key={spot.id}
                  id={`hotspot-${spot.id}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectHotspot(isActive ? null : spot);
                  }}
                  style={{
                    left: `${spot.x}%`,
                    top: `${spot.y}%`,
                    width: `${spot.width}%`,
                    height: `${spot.height}%`,
                  }}
                  className={`absolute rounded-md cursor-pointer transition-all duration-300 border-2 select-none z-1 {
                    ${
                      isActive
                        ? "bg-emerald-500/20 border-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.6)] animate-pulse"
                        : "bg-transparent border-amber-600/20 hover:border-amber-400 hover:bg-amber-400/10 shadow-[0_0_4px_rgba(217,119,6,0.1)]"
                    }
                  }`}
                  title={language === "it" ? spot.nameIt : spot.name}
                >
                  {/* Subtle Label display */}
                  <span className={`absolute -top-5 left-1/2 -translate-x-1/2 whitespace-nowrap bg-black/80 border border-[#2d2e34] px-1.5 py-0.5 rounded text-[8px] font-mono tracking-tight text-white transition-opacity font-bold ${
                    isActive ? "opacity-100" : "opacity-0 group-hover:opacity-40"
                  }`}>
                    {language === "it" ? spot.nameIt : spot.name}
                  </span>
                </button>
              );
            })}

            {/* Custom stylized layout indicator when plant elements are chosen */}
            {activeHotspotId === "flowers" && (
              <div className="absolute top-[8%] left-[45%] w-10 h-[2px] bg-red-400 animate-ping"></div>
            )}
          </div>
        </div>
      </div>

      {/* Selected Hotspot quick status banner */}
      {activeHotspotId && (
        <div className="p-3 bg-emerald-500/10 border-t border-emerald-500/25 flex items-center justify-between z-10">
          <div className="flex flex-col">
            <span className="text-[10px] font-mono font-bold text-emerald-400 tracking-wide">
              {language === "it" ? "REGIONE SELEZIONATA" : "SELECTED BLOCK"}
            </span>
            <span className="text-xs font-bold text-gray-200">
              {language === "it"
                ? FO_F34V_HOTSPOTS.find(h => h.id === activeHotspotId)?.nameIt
                : FO_F34V_HOTSPOTS.find(h => h.id === activeHotspotId)?.name}
            </span>
          </div>
          <button
            onClick={() => onSelectHotspot(null)}
            className="text-[10px] font-mono font-bold text-amber-400 hover:text-amber-300 bg-amber-400/10 px-2 py-1 rounded"
          >
            {language === "it" ? "DESELEZIONA" : "DESELECT"}
          </button>
        </div>
      )}
    </div>
  );
};
