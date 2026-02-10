"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";

interface SwipeToBookProps {
    onComplete: () => void;
    disabled?: boolean;
    price?: number;
    isFree?: boolean;
    isLoading?: boolean;
}

export function SwipeToBook({
    onComplete,
    disabled = false,
    price = 0,
    isFree = false,
    isLoading = false,
}: SwipeToBookProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [dragProgress, setDragProgress] = useState(0);
    const [isCompleted, setIsCompleted] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const handleRef = useRef<HTMLDivElement>(null);
    const startXRef = useRef(0);
    const currentXRef = useRef(0);

    const COMPLETION_THRESHOLD = 0.85; // 85% of the way triggers completion

    const handleStart = useCallback(
        (clientX: number) => {
            if (disabled || isLoading || isCompleted) return;
            setIsDragging(true);
            startXRef.current = clientX;
            currentXRef.current = clientX;
        },
        [disabled, isLoading, isCompleted]
    );

    const handleMove = useCallback(
        (clientX: number) => {
            if (!isDragging || !containerRef.current || !handleRef.current) return;

            const containerWidth = containerRef.current.offsetWidth;
            const handleWidth = handleRef.current.offsetWidth;
            const maxDistance = containerWidth - handleWidth;

            const deltaX = clientX - startXRef.current;
            const clampedDelta = Math.max(0, Math.min(deltaX, maxDistance));
            const progress = clampedDelta / maxDistance;

            currentXRef.current = clampedDelta;
            setDragProgress(progress);
        },
        [isDragging]
    );

    const handleEnd = useCallback(() => {
        if (!isDragging) return;

        setIsDragging(false);

        if (dragProgress >= COMPLETION_THRESHOLD) {
            // Completed!
            setIsCompleted(true);
            setDragProgress(1);
            setTimeout(() => {
                onComplete();
            }, 200);
        } else {
            // Reset
            setDragProgress(0);
            currentXRef.current = 0;
        }
    }, [isDragging, dragProgress, onComplete]);

    // Mouse events
    const handleMouseDown = (e: React.MouseEvent) => {
        e.preventDefault();
        handleStart(e.clientX);
    };

    const handleMouseMove = useCallback(
        (e: MouseEvent) => {
            e.preventDefault();
            handleMove(e.clientX);
        },
        [handleMove]
    );

    const handleMouseUp = useCallback(() => {
        handleEnd();
    }, [handleEnd]);

    // Touch events
    const handleTouchStart = (e: React.TouchEvent) => {
        if (e.touches.length === 1) {
            handleStart(e.touches[0].clientX);
        }
    };

    const handleTouchMove = useCallback(
        (e: TouchEvent) => {
            if (e.touches.length === 1) {
                e.preventDefault();
                handleMove(e.touches[0].clientX);
            }
        },
        [handleMove]
    );

    const handleTouchEnd = useCallback(() => {
        handleEnd();
    }, [handleEnd]);

    // Add/remove global event listeners
    useEffect(() => {
        if (isDragging) {
            document.addEventListener("mousemove", handleMouseMove);
            document.addEventListener("mouseup", handleMouseUp);
            document.addEventListener("touchmove", handleTouchMove, {
                passive: false,
            });
            document.addEventListener("touchend", handleTouchEnd);

            return () => {
                document.removeEventListener("mousemove", handleMouseMove);
                document.removeEventListener("mouseup", handleMouseUp);
                document.removeEventListener("touchmove", handleTouchMove);
                document.removeEventListener("touchend", handleTouchEnd);
            };
        }
    }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);

    // Reset when disabled changes
    useEffect(() => {
        if (disabled || isLoading) {
            setDragProgress(0);
            setIsDragging(false);
            setIsCompleted(false);
        }
    }, [disabled, isLoading]);

    const containerWidth = containerRef.current?.offsetWidth || 0;
    const handleWidth = 56; // Width of the handle in pixels
    const maxDistance = containerWidth - handleWidth;
    const translateX = dragProgress * maxDistance;

    return (
        <div
            ref={containerRef}
            className={`relative w-full h-14 rounded-full bg-white/10 border-2 overflow-hidden transition-all ${isCompleted
                ? "border-acid shadow-lg shadow-acid/50"
                : isDragging
                    ? "border-acid/50"
                    : "border-white/20"
                } ${disabled || isLoading ? "opacity-50 cursor-not-allowed" : "cursor-grab active:cursor-grabbing"}`}
        >
            {/* Progress Fill */}
            <div
                className="absolute inset-0 bg-gradient-to-r from-acid/20 via-acid/10 to-transparent transition-all duration-200"
                style={{
                    width: `${Math.max(handleWidth, dragProgress * 100)}%`,
                }}
            />

            {/* Text */}
            <div className="absolute inset-0 flex items-center justify-end pointer-events-none pr-4 md:pr-6 pl-16">
                <div className={`flex items-center gap-2 font-bold text-xs md:text-sm uppercase tracking-wider transition-all duration-200 whitespace-nowrap ${dragProgress > 0.5 ? "opacity-0" : "opacity-100"
                        } ${isCompleted ? "text-acid" : "text-white"}`}>
                    <span>
                        {isLoading ? (
                            "Processing..."
                        ) : isCompleted ? (
                            "Confirmed!"
                        ) : isFree ? (
                            <>Swipe to Book Free Event</>
                        ) : (
                            <>Swipe to Pay ₹{price.toFixed(2)}</>
                        )}
                    </span>
                    {!isLoading && !isCompleted && (
                        <svg
                            className="w-5 h-5 flex-shrink-0"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" />
                        </svg>
                    )}
                </div>
            </div>

            {/* Draggable Handle */}
            <div
                ref={handleRef}
                className={`absolute top-1 left-1 bottom-1 w-14 rounded-full bg-acid flex items-center justify-center transition-all ${isDragging ? "scale-95" : "scale-100"
                    } ${isCompleted ? "animate-pulse" : ""} ${disabled || isLoading ? "pointer-events-none" : ""
                    }`}
                style={{
                    transform: `translateX(${translateX}px)`,
                    transition: isDragging ? "none" : "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                }}
                onMouseDown={handleMouseDown}
                onTouchStart={handleTouchStart}
            >
                {isLoading ? (
                    <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                ) : (
                    <svg
                        className="w-6 h-6 text-black"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M13 7l5 5m0 0l-5 5m5-5H6"
                        />
                    </svg>
                )}
            </div>

            {/* Chevron hints (fade out as dragging) - Hidden on mobile */}
            <div
                className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 gap-1 pointer-events-none transition-opacity duration-200"
                style={{ opacity: Math.max(0, 1 - dragProgress * 3) }}
            >
                <svg
                    className="w-4 h-4 text-white/40"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                    />
                </svg>
                <svg
                    className="w-4 h-4 text-white/40"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                    />
                </svg>
            </div>
        </div>
    );
}
