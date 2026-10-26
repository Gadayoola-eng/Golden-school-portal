import React, { useRef, useState, useEffect } from 'react';
import { Palette, RotateCcw, Check, Sparkles, X, PenTool, Eraser } from 'lucide-react';

const COLORS = [
  { name: 'Pencil Black', hex: '#1e293b' },
  { name: 'Crayon Red', hex: '#ef4444' },
  { name: 'Ocean Blue', hex: '#2563eb' },
  { name: 'Leaf Green', hex: '#16a34a' },
  { name: 'Sun Yellow', hex: '#eab308' },
  { name: 'Grape Purple', hex: '#9333ea' },
  { name: 'Orange', hex: '#ea580c' },
  { name: 'Eraser', hex: '#ffffff', isEraser: true },
];

const BRUSH_SIZES = [
  { name: 'Fine Pencil', size: 3 },
  { name: 'Medium Crayon', size: 7 },
  { name: 'Chunky Marker', size: 14 },
];

export default function DrawingCanvas({ onSaveDrawing, onCancel }) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#1e293b');
  const [brushSize, setBrushSize] = useState(7);
  const [hasDrawn, setHasDrawn] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // Fill white background so transparent canvas doesn't save as black PNG
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Subtle faint lined paper grid for primary school handwriting/drawing assistance
    ctx.strokeStyle = '#f1f5f9';
    ctx.lineWidth = 1;
    for (let y = 30; y < canvas.height; y += 30) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }
  }, []);

  const getCoordinates = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    if (e.touches && e.touches[0]) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY,
      };
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const startDrawing = (e) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const { x, y } = getCoordinates(e);

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = color;
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    setIsDrawing(true);
    setHasDrawn(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const { x, y } = getCoordinates(e);

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = (e) => {
    if (!isDrawing) return;
    e.preventDefault();
    setIsDrawing(false);
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Redraw faint lines
    ctx.strokeStyle = '#f1f5f9';
    ctx.lineWidth = 1;
    for (let y = 30; y < canvas.height; y += 30) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }
    setHasDrawn(false);
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.toBlob((blob) => {
      if (!blob) return;
      const file = new File([blob], `pupil_drawing_${Date.now()}.png`, { type: 'image/png' });
      onSaveDrawing(file);
    }, 'image/png');
  };

  return (
    <div className="bg-amber-50/50 border-2 border-amber-300 rounded-3xl p-4 sm:p-5 space-y-4 animate-scale-up">
      {/* Top Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-amber-200">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-amber-400 text-amber-950 flex items-center justify-center font-bold text-sm shadow-xs">
            🎨
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-extrabold text-slate-900">
              Primary Digital Doodle & Drawing Pad
            </h4>
            <p className="text-[11px] text-slate-500">
              Draw numbers, sketch diagrams, or write in pencil!
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleClear}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-slate-600 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Clear Pad
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Colors & Brush Size Selector */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Color Palette */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-bold text-slate-500 mr-1 uppercase tracking-wider">
            Color:
          </span>
          {COLORS.map((c) => (
            <button
              key={c.name}
              type="button"
              title={c.name}
              onClick={() => setColor(c.hex)}
              className={`w-7 h-7 rounded-full border-2 transition-transform flex items-center justify-center ${
                color === c.hex ? 'scale-125 shadow-md ring-2 ring-brand-500/50' : 'hover:scale-110'
              } ${c.isEraser ? 'border-slate-300 bg-white text-slate-700' : 'border-white'}`}
              style={{ backgroundColor: c.hex }}
            >
              {c.isEraser ? (
                <Eraser className="w-3.5 h-3.5 text-slate-700" />
              ) : color === c.hex ? (
                <Check className={`w-3.5 h-3.5 ${c.hex === '#eab308' || c.hex === '#ffffff' ? 'text-slate-900' : 'text-white'}`} />
              ) : null}
            </button>
          ))}
        </div>

        {/* Brush Size */}
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-bold text-slate-500 mr-1 uppercase tracking-wider">
            Size:
          </span>
          {BRUSH_SIZES.map((b) => (
            <button
              key={b.name}
              type="button"
              onClick={() => setBrushSize(b.size)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                brushSize === b.size
                  ? 'bg-amber-400 text-amber-950 shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {b.name}
            </button>
          ))}
        </div>
      </div>

      {/* Drawing Canvas Area */}
      <div className="relative border-4 border-amber-200 rounded-2xl overflow-hidden bg-white shadow-inner touch-none">
        <canvas
          ref={canvasRef}
          width={800}
          height={400}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="w-full h-[280px] sm:h-[340px] cursor-crosshair block select-none"
        />
        {!hasDrawn && (
          <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center text-slate-300">
            <PenTool className="w-8 h-8 mb-1 opacity-50" />
            <p className="text-xs font-bold">Use your finger or mouse to draw here ✏️</p>
          </div>
        )}
      </div>

      {/* Bottom Save Action */}
      <div className="flex items-center justify-between pt-2">
        <p className="text-xs text-amber-900 font-medium flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          Click below to attach this drawing to your homework submission!
        </p>

        <button
          type="button"
          onClick={handleSave}
          disabled={!hasDrawn}
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs sm:text-sm font-extrabold transition-all shadow-md hover:shadow-lg disabled:opacity-40 flex items-center gap-2"
        >
          <Check className="w-4 h-4" />
          Attach Drawing to Homework 🖼️
        </button>
      </div>
    </div>
  );
}
