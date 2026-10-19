import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Clean SVG reproduction of the Yaqui Logo
const yaquiSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 240" width="100%" height="100%">
  <!-- Top Red Wave / Swoosh -->
  <path d="M 28 92 C 18 52, 45 15, 100 15 C 155 15, 182 52, 172 92 C 145 74, 115 88, 70 80 C 48 76, 35 84, 28 92 Z" fill="#E21D24" />
  
  <!-- Middle YAQUI Typography -->
  <g fill="#004B93">
    <!-- Y -->
    <path d="M 32 108 L 43 108 L 50 123 L 57 108 L 68 108 L 56 129 L 56 148 L 44 148 L 44 129 Z" />
    
    <!-- A -->
    <path d="M 70 148 L 82 108 L 94 108 L 106 148 L 94 148 L 91.5 138 L 84.5 138 L 82 148 Z M 86.5 129 L 89.5 129 L 88 120 Z" />
    
    <!-- Q -->
    <path d="M 108 128 C 108 116, 116 107, 128 107 C 140 107, 148 116, 148 128 C 148 136, 143 143, 136 146 L 145 152 L 138 156 L 130 148 C 129 148, 128.5 148, 128 148 C 116 148, 108 139, 108 128 Z M 119 128 C 119 135, 123 139, 128 139 C 133 139, 137 135, 137 128 C 137 121, 133 117, 128 117 C 123 117, 119 121, 119 128 Z" />
    
    <!-- U -->
    <path d="M 152 108 L 163 108 L 163 134 C 163 138, 166 140, 170 140 C 174 140, 177 138, 177 134 L 177 108 L 188 108 L 188 134 C 188 144, 180 149, 170 149 C 160 149, 152 144, 152 134 Z" />
    
    <!-- i -->
    <circle cx="178" cy="116" r="3.5" fill="#004B93" />
  </g>

  <!-- Bottom Red Wave / Swoosh -->
  <path d="M 28 160 C 50 148, 85 162, 130 154 C 158 149, 170 156, 174 165 C 168 205, 145 228, 100 228 C 55 228, 32 205, 28 160 Z" fill="#E21D24" />
</svg>`;

const publicDir = path.join(__dirname, 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

fs.writeFileSync(path.join(publicDir, 'logo-yaqui.svg'), yaquiSvg);
console.log('Saved public/logo-yaqui.svg');
