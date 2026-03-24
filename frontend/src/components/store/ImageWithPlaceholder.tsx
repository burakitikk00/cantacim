"use client";

import { useState, useEffect, useRef } from "react";

export default function ImageWithPlaceholder({ 
    src, 
    alt, 
    className, 
    ...props 
}: React.ImgHTMLAttributes<HTMLImageElement>) {
    const [isLoaded, setIsLoaded] = useState(false);
    const imgRef = useRef<HTMLImageElement>(null);

    useEffect(() => {
        if (imgRef.current?.complete) {
            setIsLoaded(true);
        }
    }, [src]);

    return (
        <>
            {/* Skeleton Background with Navbar Icon (Diamond) */}
            {!isLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-primary/5 z-0 pointer-events-none">
                    <span className="material-symbols-outlined text-4xl text-primary/20 animate-pulse">
                        diamond
                    </span>
                </div>
            )}
            
            {/* Actual Lazy Image */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
                ref={imgRef}
                src={src}
                alt={alt}
                onLoad={() => setIsLoaded(true)}
                className={`absolute inset-0 w-full h-full object-cover ${className?.replace(/w-full|h-full|relative/g, '') || ''} ${isLoaded ? 'opacity-100' : 'opacity-0'} z-10 transition-all duration-500`}
                {...props}
            />
        </>
    );
}
