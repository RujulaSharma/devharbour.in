export const clamp = (n: number, a = 0, b = 1) => Math.max(a, Math.min(b, n));
export const smooth = (t: number) => { t = clamp(t); return t * t * (3 - 2 * t); };
const hash = (n: number) => { const x = Math.sin(n * 127.1 + 31.7) * 43758.5453; return x - Math.floor(x); };

// Draw text into an off-screen canvas and sample actual letter pixels.
export function textCloud(word: string, count: number, { width = 1024, height = 170, fontSize = 127, spread = 7.0 } = {}) {
  const canvas = document.createElement('canvas'); canvas.width = width; canvas.height = height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return new Float32Array(count * 3);
  ctx.fillStyle = 'white'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.font = `800 ${fontSize}px Arial, sans-serif`;
  ctx.fillText(word, width / 2, height / 2, width - 20);
  const pixels = ctx.getImageData(0, 0, width, height).data;
  const valid: number[][] = [];
  for (let y = 0; y < height; y += 3) for (let x = 0; x < width; x += 3) {
    if (pixels[(y * width + x) * 4 + 3] > 140) valid.push([x, y]);
  }
  const result = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const [x, y] = valid[Math.floor(hash(i + 19) * valid.length)] || [width / 2, height / 2];
    result[i * 3] = (x / width - 0.5) * spread + (hash(i + 55) - 0.5) * 0.022;
    result[i * 3 + 1] = -(y / height - 0.5) * (spread * height / width) + (hash(i + 23) - 0.5) * 0.022;
    result[i * 3 + 2] = (hash(i + 87) - 0.5) * 0.19;
  }
  return result;
}

export function createParticleData(count: number) {
  const sphere = new Float32Array(count * 3);
  const clusters = new Float32Array(count * 3);
  const random = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const centers = [[-2.05, 0.1, 0], [0, 0.6, 0], [2.05, 0.1, 0]];
  for (let i = 0; i < count; i++) {
    const t = (i + 0.5) / count;
    const phi = Math.acos(1 - 2 * t);
    const theta = Math.PI * (1 + Math.sqrt(5)) * i;
    const radius = 1.85 + (hash(i + 3) - 0.5) * 0.20;
    const off = i * 3;
    sphere[off] = Math.sin(phi) * Math.cos(theta) * radius;
    sphere[off + 1] = Math.cos(phi) * radius;
    sphere[off + 2] = Math.sin(phi) * Math.sin(theta) * radius;
    const c = centers[i % 3];
    const a = hash(i + 11) * Math.PI * 2, b = Math.acos(hash(i + 71) * 2 - 1);
    const r = Math.cbrt(hash(i + 41)) * 0.8;
    clusters[off] = c[0] + Math.cos(a) * Math.sin(b) * r;
    clusters[off + 1] = c[1] + Math.cos(b) * r;
    clusters[off + 2] = c[2] + Math.sin(a) * Math.sin(b) * r;
    random[off] = (hash(i + 79) - 0.5) * 12;
    random[off + 1] = (hash(i + 94) - 0.5) * 8;
    random[off + 2] = (hash(i + 118) - 0.5) * 7;
    const shade = hash(i + 100);
    colors[off] = 0.48 + shade * 0.32;
    colors[off + 1] = 0.37 + shade * 0.30;
    colors[off + 2] = 0.77 + shade * 0.22;
    if (shade > 0.92) { colors[off] = 0.93; colors[off + 1] = 0.9; colors[off + 2] = 1; }
  }
  return { sphere, clusters, random, colors };
}
