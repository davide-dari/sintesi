import React, { useRef, useEffect, useCallback } from 'react';
import { Eraser } from 'lucide-react';

interface Props {
  value: string | null;
  onChange: (dataUrl: string | null) => void;
}

export const SignaturePad: React.FC<Props> = ({ value, onChange }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const hasInk = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.scale(dpr, dpr);
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    }
    if (value) {
      const img = new Image();
      img.onload = () => {
        const ctx2 = canvas.getContext('2d');
        if (ctx2) ctx2.drawImage(img, 0, 0, rect.width, rect.height);
        hasInk.current = true;
      };
      img.src = value;
    }
  }, []);

  const getPos = (e: React.PointerEvent) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const handleDown = (e: React.PointerEvent) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    canvas.setPointerCapture(e.pointerId);
    drawing.current = true;
    hasInk.current = true;
    const { x, y } = getPos(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + 0.1, y + 0.1);
    ctx.stroke();
  };

  const handleMove = (e: React.PointerEvent) => {
    if (!drawing.current) return;
    e.preventDefault();
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    const { x, y } = getPos(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const handleUp = () => {
    if (!drawing.current) return;
    drawing.current = false;
    const canvas = canvasRef.current;
    if (canvas && hasInk.current) {
      onChange(canvas.toDataURL('image/png'));
    }
  };

  const handleClear = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (canvas && ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      hasInk.current = false;
      onChange(null);
    }
  }, [onChange]);

  return (
    <div>
      <div className="relative bg-white border-2 border-dashed border-gray-300 rounded-2xl overflow-hidden" style={{ height: 170 }}>
        <canvas
          ref={canvasRef}
          className="w-full h-full touch-none"
          onPointerDown={handleDown}
          onPointerMove={handleMove}
          onPointerUp={handleUp}
          onPointerCancel={handleUp}
        />
        {!value && (
          <p className="absolute inset-0 flex items-center justify-center text-gray-400 font-medium text-sm pointer-events-none">
            Firma qui con il dito
          </p>
        )}
      </div>
      <button onClick={handleClear} className="mt-2 flex items-center gap-2 text-gray-500 font-bold text-sm px-3 py-2 rounded-xl bg-gray-100 active:scale-95 transition-all">
        <Eraser size={16} /> Cancella firma
      </button>
    </div>
  );
};