"use client";
import { useEffect, useState } from "react";

const images = [
    "/Assests/sandbox.jpg",
    "/Assests/campus_tank.jpg",
    "/Assests/aifest-landscape.jpg"
];

export default function ImageSlider() {
    const [index, setIndex] = useState(0);

    const goNext = () => setIndex((i) => (i + 1) % images.length);
    const goPrev = () =>
        setIndex((i) => (i - 1 + images.length) % images.length);


    useEffect(() => {
        const timer = setInterval(() => {
            setIndex((prev) => (prev + 1) % images.length);
        }, 4000);

        return () => clearInterval(timer);
    }, []);

    return (
        <section className="hidden lg:block w-[70%] h-screen relative overflow-hidden bg-zinc-900 border-l border-white/10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
                src={images[index]}
                alt="slider"
                className="w-full h-full object-cover transition-opacity duration-1000 opacity-80"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

            {/* Navigation */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-4 z-10">
                {/* Left arrow */}
                <button
                    onClick={goPrev}
                    className="flex items-center justify-center w-8 h-8 rounded-full bg-white/10 backdrop-blur-md text-white border border-white/20 hover:bg-white/20 transition-all"
                >
                    ‹
                </button>

                {/* Dots */}
                <div className="flex gap-2">
                    {images.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => setIndex(i)}
                            className={`transition-all duration-300 rounded-full ${i === index ? "w-6 h-2 bg-acid shadow-[0_0_10px_#ccff00]" : "w-2 h-2 bg-white/40 hover:bg-white/60"
                                }`}
                        />
                    ))}
                </div>

                {/* Right arrow */}
                <button
                    onClick={goNext}
                    className="flex items-center justify-center w-8 h-8 rounded-full bg-white/10 backdrop-blur-md text-white border border-white/20 hover:bg-white/20 transition-all"
                >
                    ›
                </button>
            </div>
        </section>
    );
}
