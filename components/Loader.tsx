import React, { useState, useEffect } from 'react';

const Loader: React.FC = () => {
  const [message, setMessage] = useState("Initializing GEOSINT Analysis...");

  useEffect(() => {
    const messages = [
      "Extracting 'Host' Building Fingerprint (Brick/Balcony Style)...",
      "Identifying 'Anchor' Neighbors (Buildings Across the Street)...",
      "Ignoring Generic Brand Logos (Anti-Bias Protocol)...",
      "Querying Specific Franchise Locations in Region...",
      "Comparing Street View: Host vs Anchor Match...",
      "Rejecting Locations with Mismatched Neighbors...",
      "Verifying Street Furniture (Bollards/Trees)...",
      "Pinpointing Exact Address Coordinates..."
    ];
    
    let i = 0;
    const interval = setInterval(() => {
      i = (i + 1) % messages.length;
      setMessage(messages[i]);
    }, 3000); // Change message every 3s

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center space-y-4 text-center p-4">
        <div className="relative">
            <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-blue-500"></div>
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-2 h-2 bg-teal-400 rounded-full animate-ping"></div>
            </div>
        </div>
        <div className="space-y-2 animate-pulse">
            <p className="text-lg font-semibold text-blue-300">{message}</p>
            <p className="text-xs text-gray-500 font-mono">Logic Budget: MAX (24k tokens)</p>
        </div>
    </div>
  );
};

export default Loader;