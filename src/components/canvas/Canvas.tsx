
'use client';

import React from 'react';

export function Canvas() {
    return (
        <div className="w-full h-full flex items-center justify-center p-8 overflow-auto">
             <div 
                id="canvas-paper" 
                className="bg-white shadow-lg"
                style={{ width: '1200px', height: '792px' }}
             >
                {/* The actual HTML5 Canvas will go here */}
            </div>
        </div>
    );
}
