import React, { useState, useEffect } from 'react';

export const YaquiLogo = ({ className = "h-14 w-auto", customLogoSrc = null }) => {
  const [imgError, setImgError] = useState(false);
  const [logoSrc, setLogoSrc] = useState(customLogoSrc || '/logo.png');

  useEffect(() => {
    if (customLogoSrc) {
      setLogoSrc(customLogoSrc);
      setImgError(false);
    }
  }, [customLogoSrc]);

  if (!imgError && logoSrc) {
    return (
      <img
        src={logoSrc}
        alt="Logo Yaqui"
        className={`object-contain transition-all ${className}`}
        onError={() => {
          // If /logo.png fails, try /logo-yaqui.svg
          if (logoSrc === '/logo.png') {
            setLogoSrc('/logo-yaqui.svg');
          } else {
            setImgError(true);
          }
        }}
      />
    );
  }

  // Fallback vector SVG if images fail to load
  return (
    <div className={`relative inline-flex items-center justify-center select-none ${className}`}>
      <svg 
        viewBox="0 0 160 190" 
        className="h-full w-auto drop-shadow-sm transition-transform" 
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Top Red Swoosh / Wave */}
        <path 
          d="M 22 72 C 16 38, 42 10, 80 10 C 118 10, 144 38, 138 72 C 116 58, 92 68, 56 62 C 38 59, 27 65, 22 72 Z" 
          fill="#E21D24" 
        />
        
        {/* Middle YAQUI Text in Deep Brand Blue */}
        <g fill="#004A94" className="font-sans font-black">
          <path d="M 20 86 L 29 86 L 35 99 L 41 86 L 50 86 L 40 103 L 40 118 L 30 118 L 30 103 Z" />
          <path d="M 52 118 L 62 86 L 72 86 L 82 118 L 72 118 L 70 110 L 64 110 L 62 118 Z M 65.5 103 L 68.5 103 L 67 94 Z" />
          <path d="M 84 102 C 84 92, 91 85, 101 85 C 111 85, 118 92, 118 102 C 118 108, 114 114, 108 116 L 116 122 L 109 125 L 103 118 C 102 118.5, 101.5 119, 101 119 C 91 119, 84 112, 84 102 Z M 93.5 102 C 93.5 108, 97 111.5, 101 111.5 C 105 111.5, 108.5 108, 108.5 102 C 108.5 96, 105 92.5, 101 92.5 C 97 92.5, 93.5 96, 93.5 102 Z" />
          <path d="M 121 86 L 130 86 L 130 107 C 130 110, 132 112, 135 112 C 138 112, 140 110, 140 107 L 140 86 L 149 86 L 149 107 C 149 115, 143 119, 135 119 C 127 119, 121 115, 121 107 Z" />
          <path d="M 152 95 L 160 93 L 157 118 L 149 118 Z" />
          <circle cx="157" cy="88" r="3.5" fill="#004A94" />
        </g>

        {/* Bottom Red Swoosh / Wave */}
        <path 
          d="M 22 130 C 40 120, 70 132, 105 125 C 128 120, 138 126, 142 134 C 136 166, 118 184, 80 184 C 42 184, 25 166, 22 130 Z" 
          fill="#E21D24" 
        />
      </svg>
    </div>
  );
};

export default YaquiLogo;
