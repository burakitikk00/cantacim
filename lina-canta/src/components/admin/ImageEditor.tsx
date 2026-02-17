"use client";

import { useEffect, useRef, useState } from "react";

interface ImageEditorProps {
    imageSrc: string;
    onSave: (editedImage: string) => void;
    onCancel: () => void;
}

export default function ImageEditor({ imageSrc, onSave, onCancel }: ImageEditorProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [rotation, setRotation] = useState(0);
    const [scale, setScale] = useState(1);
    const [isProcessing, setIsProcessing] = useState(false);

    // For image loading and rendering
    const [image, setImage] = useState<HTMLImageElement | null>(null);

    useEffect(() => {
        const img = new Image();
        img.src = imageSrc;
        img.crossOrigin = "anonymous";
        img.onload = () => setImage(img);
    }, [imageSrc]);

    useEffect(() => {
        if (!image || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Set canvas dimensions based on image and rotation
        // We want to keep aspect ratio 3:4 for the product images if possible,
        // or just maintain original aspect but scaled.
        // Let's enforce a 600x800 workspace for 3:4 aspect ratio targeting (common for e-commerce)

        const TARGET_WIDTH = 600;
        const TARGET_HEIGHT = 800; // 3:4 Aspect Ratio

        canvas.width = TARGET_WIDTH;
        canvas.height = TARGET_HEIGHT;

        // Clear background
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.save();

        // Move to center
        ctx.translate(TARGET_WIDTH / 2, TARGET_HEIGHT / 2);

        // Rotate
        ctx.rotate((rotation * Math.PI) / 180);

        // Scale
        ctx.scale(scale, scale);

        // Draw Image Centered
        // We need to fit the image into the canvas "contain" or "cover" style?
        // User wants "adjust", so scale helps manually fit it.
        // Initial scale should fit the image.

        ctx.drawImage(
            image,
            -image.width / 2,
            -image.height / 2
        );

        ctx.restore();
    }, [image, rotation, scale]);

    const handleSave = () => {
        if (!canvasRef.current) return;
        setIsProcessing(true);
        try {
            const dataUrl = canvasRef.current.toDataURL("image/jpeg", 0.9);
            onSave(dataUrl);
        } catch (e) {
            console.error("Save error:", e);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-4">
            <div className="bg-white rounded-xl overflow-hidden max-w-4xl w-full flex flex-col md:flex-row h-[80vh]">
                {/* Canvas Area */}
                <div className="flex-1 bg-gray-100 relative flex items-center justify-center overflow-hidden p-4">
                    <canvas
                        ref={canvasRef}
                        className="max-w-full max-h-full shadow-lg bg-white"
                    />
                </div>

                {/* Controls */}
                <div className="w-full md:w-80 bg-white border-l border-gray-200 p-6 flex flex-col gap-6">
                    <h3 className="font-bold text-lg text-gray-800">Görsel Düzenle</h3>

                    <div className="space-y-4">
                        <div>
                            <label className="text-xs font-bold uppercase text-gray-500 mb-2 block">Döndür</label>
                            <div className="flex gap-2">
                                <button onClick={() => setRotation(r => r - 90)} className="flex-1 py-2 border border-gray-200 rounded hover:bg-gray-50">
                                    <span className="material-icons">rotate_left</span>
                                </button>
                                <button onClick={() => setRotation(r => r + 90)} className="flex-1 py-2 border border-gray-200 rounded hover:bg-gray-50">
                                    <span className="material-icons">rotate_right</span>
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-bold uppercase text-gray-500 mb-2 block">Yakınlaştır</label>
                            <input
                                type="range"
                                min="0.1"
                                max="3"
                                step="0.1"
                                value={scale}
                                onChange={(e) => setScale(parseFloat(e.target.value))}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#FF007F]"
                            />
                            <div className="text-center text-xs text-gray-400 mt-1">{Math.round(scale * 100)}%</div>
                        </div>

                        <div className="p-3 bg-blue-50 text-blue-700 text-xs rounded-lg">
                            <span className="font-bold block mb-1">Bilgi:</span>
                            Görsel otomatik olarak 3:4 dikey formata (600x800) kırpılacaktır. Sığdırmak için yakınlaştırmayı kullanın.
                        </div>
                    </div>

                    <div className="mt-auto flex flex-col gap-3">
                        <button
                            onClick={handleSave}
                            disabled={isProcessing}
                            className="w-full py-3 bg-[#FF007F] text-white rounded-lg font-medium hover:bg-[#D6006B] disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {isProcessing ? "İşleniyor..." : <><span className="material-icons">save</span> Kaydet</>}
                        </button>
                        <button
                            onClick={onCancel}
                            className="w-full py-3 border border-gray-200 text-gray-600 rounded-lg font-medium hover:bg-gray-50"
                        >
                            İptal
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
