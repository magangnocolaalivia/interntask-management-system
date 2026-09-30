import fs from 'node:fs';
import zlib from 'node:zlib';

// 1. Create crisp SVG of the exact logo
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">
  <rect width="400" height="400" fill="#ffffff" rx="40" />
  <g fill="#0f766e">
    <!-- Checkmark above i -->
    <path d="M 124 162 L 176 214 C 178 216 182 216 184 214 L 272 108 L 244 86 L 179 164 L 148 134 Z" />
    
    <!-- i vertical bar -->
    <rect x="156" y="234" width="46" height="116" rx="2" />
    
    <!-- T horizontal top bar -->
    <rect x="206" y="174" width="128" height="44" rx="2" />
    
    <!-- T vertical bar -->
    <rect x="247" y="218" width="46" height="132" rx="2" />
  </g>
</svg>`;

fs.writeFileSync('public/images/logo.svg', svgContent.trim());
console.log('logo.svg created successfully');

// 2. Generate crisp 256x256 PNG in pure Node.js
function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc ^= buf[i];
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function makeChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

const W = 256;
const H = 256;

// RGBA raw pixel buffer (each row has 1 filter byte + W*4 bytes)
const raw = Buffer.alloc(H * (1 + W * 4));

// Fill with white background
const TEAL_R = 15;
const TEAL_G = 118;
const TEAL_B = 110;

function setPixel(x, y, r, g, b, a = 255) {
  if (x < 0 || x >= W || y < 0 || y >= H) return;
  const idx = y * (1 + W * 4) + 1 + x * 4;
  raw[idx] = r;
  raw[idx + 1] = g;
  raw[idx + 2] = b;
  raw[idx + 3] = a;
}

// Initialize white canvas
for (let y = 0; y < H; y++) {
  raw[y * (1 + W * 4)] = 0; // Filter None
  for (let x = 0; x < W; x++) {
    setPixel(x, y, 255, 255, 255, 255);
  }
}

// Function to draw filled polygon / triangle
function pointInPoly(x, y, points) {
  let inside = false;
  for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
    const xi = points[i][0], yi = points[i][1];
    const xj = points[j][0], yj = points[j][1];
    const intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

// Checkmark polygon points mapped to 256x256
// Original coords in 400x400: (124, 162), (176, 214), (184, 214), (272, 108), (244, 86), (179, 164), (148, 134)
const scale = W / 400;
const checkPoly = [
  [124 * scale, 162 * scale],
  [176 * scale, 214 * scale],
  [184 * scale, 214 * scale],
  [272 * scale, 108 * scale],
  [244 * scale, 86 * scale],
  [179 * scale, 164 * scale],
  [148 * scale, 134 * scale]
];

// Draw checkmark with anti-aliasing
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    // 2x2 subpixel sampling
    let hits = 0;
    for (let sy = 0; sy < 2; sy++) {
      for (let sx = 0; sx < 2; sx++) {
        if (pointInPoly(x + (sx + 0.5) / 2, y + (sy + 0.5) / 2, checkPoly)) {
          hits++;
        }
      }
    }
    if (hits > 0) {
      const alpha = hits / 4;
      const r = Math.round(255 * (1 - alpha) + TEAL_R * alpha);
      const g = Math.round(255 * (1 - alpha) + TEAL_G * alpha);
      const b = Math.round(255 * (1 - alpha) + TEAL_B * alpha);
      setPixel(x, y, r, g, b, 255);
    }
  }
}

// Function to draw anti-aliased rectangle
function drawRect(rx, ry, rw, rh) {
  const x1 = Math.round(rx * scale);
  const y1 = Math.round(ry * scale);
  const x2 = Math.round((rx + rw) * scale);
  const y2 = Math.round((ry + rh) * scale);

  for (let y = y1; y <= y2; y++) {
    for (let x = x1; x <= x2; x++) {
      setPixel(x, y, TEAL_R, TEAL_G, TEAL_B, 255);
    }
  }
}

// Draw 'i' stem
drawRect(156, 234, 46, 116);

// Draw 'T' top bar
drawRect(206, 174, 128, 44);

// Draw 'T' vertical stem
drawRect(247, 218, 46, 132);

// Build PNG file buffers
const pngHeader = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(W, 0);
ihdr.writeUInt32BE(H, 4);
ihdr[8] = 8; // Bit depth: 8
ihdr[9] = 6; // Color type: 6 (RGBA)
ihdr[10] = 0; // Compression: 0
ihdr[11] = 0; // Filter: 0
ihdr[12] = 0; // Interlace: 0

const ihdrChunk = makeChunk('IHDR', ihdr);
const idatChunk = makeChunk('IDAT', zlib.deflateSync(raw));
const iendChunk = makeChunk('IEND', Buffer.alloc(0));

const pngBuffer = Buffer.concat([pngHeader, ihdrChunk, idatChunk, iendChunk]);
fs.writeFileSync('public/images/logo.png', pngBuffer);
console.log('public/images/logo.png created successfully (' + pngBuffer.length + ' bytes)');
