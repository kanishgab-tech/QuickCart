'use client';

import React from 'react';
import './SideBanners.css';
import FireworksSideAnimation from './FireworksSideAnimation';

const SideBanners = () => {
    return (
        <div
            aria-hidden="true"
            className="firework-viewport pointer-events-none fixed inset-0 z-30 hidden select-none 2xl:block"
        >
            {/* LEFT SIDEBAR — GOLDEN ROCKET LAUNCHES */}
            <aside className="firework-panel firework-left">
                <FireworksSideAnimation />
                
                
            </aside>

            {/* RIGHT SIDEBAR — COLORFUL FIREWORKS */}
            <aside className="firework-panel firework-right">
                <FireworksSideAnimation />
            </aside>
        </div>
    );
};

export default SideBanners;