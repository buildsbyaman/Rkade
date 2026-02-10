"use client";

export function AmbientBackground() {
    return (
        <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none" style={{ backgroundColor: 'var(--bg-base)' }}>
            {/* Glow Blue */}
            <div
                className="absolute inset-0 animate-pulse"
                style={{
                    backgroundImage: 'var(--glow-blue)',
                    animationDuration: '8s',
                    opacity: 0.8
                }}
            />
            {/* Glow Purple */}
            <div
                className="absolute inset-0 animate-pulse"
                style={{
                    backgroundImage: 'var(--glow-purple)',
                    animationDuration: '12s',
                    animationDelay: '1s',
                    opacity: 0.8
                }}
            />
            {/* Glow Green */}
            <div
                className="absolute inset-0 animate-pulse"
                style={{
                    backgroundImage: 'var(--glow-green)',
                    animationDuration: '10s',
                    animationDelay: '2s',
                    opacity: 0.7
                }}
            />

            {/* Global Noise Overlay for Texture */}
            <div className="absolute inset-0 bg-noise opacity-[0.03] mix-blend-overlay" />
        </div>
    );
}
