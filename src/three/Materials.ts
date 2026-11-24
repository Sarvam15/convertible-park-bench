import * as THREE from 'three';

export type WoodType = 'teak' | 'walnut' | 'oak' | 'ash';
export type SteelFinish = 'anthracite' | 'raw' | 'white' | 'green';

export interface MaterialPalette {
  wood: THREE.MeshStandardMaterial;
  steel: THREE.MeshStandardMaterial;
  darkSteel: THREE.MeshStandardMaterial;
  redAccent: THREE.MeshStandardMaterial;
  hardware: THREE.MeshStandardMaterial;
  highlight: THREE.MeshStandardMaterial;
}

// Procedural Canvas Wood Texture Generator
function createProceduralWoodTexture(type: WoodType): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  const configs = {
    teak: { base: '#c68c53', dark: '#8b572a', ringFreq: 48, noiseAmp: 18 },
    walnut: { base: '#4a3222', dark: '#26170e', ringFreq: 36, noiseAmp: 24 },
    oak: { base: '#d8c29d', dark: '#a08358', ringFreq: 64, noiseAmp: 14 },
    ash: { base: '#e8dbca', dark: '#bda68d', ringFreq: 52, noiseAmp: 12 },
  };

  const cfg = configs[type];

  // Base wash
  ctx.fillStyle = cfg.base;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Growth rings & wood grain lines
  ctx.fillStyle = cfg.dark;
  ctx.globalAlpha = 0.35;

  for (let x = 0; x < canvas.width; x += 2) {
    const sin1 = Math.sin((x / canvas.width) * Math.PI * cfg.ringFreq);
    const sin2 = Math.sin((x / canvas.width) * Math.PI * 12 + 0.5);
    const alpha = Math.max(0, (sin1 * 0.6 + sin2 * 0.4));
    
    if (alpha > 0.15) {
      ctx.globalAlpha = alpha * 0.28;
      ctx.fillRect(x, 0, 1.5, canvas.height);
    }
  }

  // Cross pores & medullary rays
  ctx.globalAlpha = 0.08;
  for (let i = 0; i < 4000; i++) {
    const rx = Math.random() * canvas.width;
    const ry = Math.random() * canvas.height;
    const len = 4 + Math.random() * 25;
    ctx.fillRect(rx, ry, 1, len);
  }

  // Subtle natural plank variance
  const grad = ctx.createLinearGradient(0, 0, canvas.width, 0);
  grad.addColorStop(0, 'rgba(0,0,0,0.06)');
  grad.addColorStop(0.5, 'rgba(255,255,255,0.04)');
  grad.addColorStop(1, 'rgba(0,0,0,0.06)');
  ctx.globalAlpha = 1.0;
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 4);
  return texture;
}

export function createMaterialLibrary(): {
  getMaterials: (wood: WoodType, finish: SteelFinish) => MaterialPalette;
  materials: MaterialPalette;
  updateMaterials: (wood: WoodType, finish: SteelFinish) => void;
} {
  const woodTextures: Record<WoodType, THREE.CanvasTexture> = {
    teak: createProceduralWoodTexture('teak'),
    walnut: createProceduralWoodTexture('walnut'),
    oak: createProceduralWoodTexture('oak'),
    ash: createProceduralWoodTexture('ash'),
  };

  const steelColors: Record<SteelFinish, { main: number; dark: number; roughness: number }> = {
    anthracite: { main: 0x24272c, dark: 0x16181b, roughness: 0.35 },
    raw: { main: 0x5a5e66, dark: 0x3a3d44, roughness: 0.25 },
    white: { main: 0xe2e5ea, dark: 0xb4b9c2, roughness: 0.40 },
    green: { main: 0x223528, dark: 0x152219, roughness: 0.38 },
  };

  const woodMat = new THREE.MeshStandardMaterial({
    map: woodTextures.teak,
    roughness: 0.55,
    metalness: 0.04,
    bumpMap: woodTextures.teak,
    bumpScale: 0.002,
    name: 'Mat_Wood',
  });

  const steelMat = new THREE.MeshStandardMaterial({
    color: steelColors.anthracite.main,
    roughness: steelColors.anthracite.roughness,
    metalness: 0.88,
    name: 'Mat_Steel',
  });

  const darkSteelMat = new THREE.MeshStandardMaterial({
    color: steelColors.anthracite.dark,
    roughness: 0.28,
    metalness: 0.92,
    name: 'Mat_Dark_Steel',
  });

  const redAccentMat = new THREE.MeshStandardMaterial({
    color: 0xd63031,
    roughness: 0.32,
    metalness: 0.65,
    name: 'Mat_Red_Accent',
  });

  const hardwareMat = new THREE.MeshStandardMaterial({
    color: 0xe8ecf1,
    roughness: 0.18,
    metalness: 0.95,
    name: 'Mat_Hardware',
  });

  const highlightMat = new THREE.MeshStandardMaterial({
    color: 0x00f2fe,
    emissive: 0x00a8ff,
    emissiveIntensity: 0.6,
    roughness: 0.2,
    metalness: 0.5,
    name: 'Mat_Highlight',
  });

  const materials: MaterialPalette = {
    wood: woodMat,
    steel: steelMat,
    darkSteel: darkSteelMat,
    redAccent: redAccentMat,
    hardware: hardwareMat,
    highlight: highlightMat,
  };

  function updateMaterials(wood: WoodType, finish: SteelFinish) {
    // Update wood texture
    woodMat.map = woodTextures[wood];
    woodMat.bumpMap = woodTextures[wood];
    woodMat.needsUpdate = true;

    // Update steel colors
    const sc = steelColors[finish];
    steelMat.color.setHex(sc.main);
    steelMat.roughness = sc.roughness;
    steelMat.needsUpdate = true;

    darkSteelMat.color.setHex(sc.dark);
    darkSteelMat.needsUpdate = true;
  }

  function getMaterials(wood: WoodType, finish: SteelFinish): MaterialPalette {
    updateMaterials(wood, finish);
    return materials;
  }

  return { getMaterials, materials, updateMaterials };
}
