import * as THREE from 'three';

export interface StudioStage {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  keyLight: THREE.DirectionalLight;
  rimLight: THREE.DirectionalLight;
  sheenLight: THREE.PointLight;
  hemiLight: THREE.HemisphereLight;
  floor: THREE.Mesh;
  resize: (width: number, height: number) => void;
  dispose: () => void;
}

export function createLightingStudio(
  canvas: HTMLCanvasElement,
  options: {
    dprMax?: number;
    bgColor?: string;
    fogNear?: number;
    fogFar?: number;
    isMobile?: boolean;
  } = {}
): StudioStage {
  const {
    dprMax = 2,
    bgColor = '#0c0d10',
    fogNear = 6,
    fogFar = 16,
    isMobile = false
  } = options;

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: !isMobile,
    alpha: true,
    powerPreference: 'high-performance'
  });

  const dpr = Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : dprMax);
  renderer.setPixelRatio(dpr);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const isWhiteBg = bgColor.toLowerCase() === '#ffffff' || bgColor.toLowerCase() === '#fff';
  const isTransparent = bgColor.toLowerCase() === 'transparent';

  const scene = new THREE.Scene();
  if (!isTransparent) {
    scene.background = new THREE.Color(bgColor);
    scene.fog = new THREE.Fog(bgColor, isWhiteBg ? 10 : fogNear, isWhiteBg ? 30 : fogFar);
  }

  // Perspective Camera
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 40);
  camera.position.set(2.8, 1.8, 3.2);
  camera.lookAt(0, 0.45, 0);

  // Studio Lighting
  // 1. Key Light: Warm golden directional light casting crisp soft shadows
  const keyLight = new THREE.DirectionalLight(0xfff8ee, isWhiteBg ? 2.2 : 2.6);
  keyLight.position.set(3.5, 5.5, 2.8);
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.set(isMobile ? 1024 : 2048, isMobile ? 1024 : 2048);
  keyLight.shadow.bias = -0.0003;
  keyLight.shadow.normalBias = 0.02;
  const sc = keyLight.shadow.camera;
  sc.left = -2.5;
  sc.right = 2.5;
  sc.top = 2.5;
  sc.bottom = -2.5;
  sc.near = 1;
  sc.far = 14;
  scene.add(keyLight);

  // 2. Rim Light: Cool steel grazing highlight from opposite side
  const rimLight = new THREE.DirectionalLight(isWhiteBg ? 0xd0e0f8 : 0x7aa0d8, isWhiteBg ? 1.4 : 0.9);
  rimLight.position.set(-4.5, 2.8, -3.5);
  scene.add(rimLight);

  // 3. Sheen Light: Point light creating rich wood specular highlight across tabletop
  const sheenLight = new THREE.PointLight(0xffe2b8, isWhiteBg ? 1.0 : 1.2, 4.0, 1.5);
  sheenLight.position.set(0, 1.4, 0);
  scene.add(sheenLight);

  // 4. Hemisphere Light: Natural ambient fill
  const hemiLight = new THREE.HemisphereLight(
    0xffffff,
    isWhiteBg ? 0xedf2f7 : 0x16181d,
    isWhiteBg ? 0.95 : 0.45
  );
  scene.add(hemiLight);

  // Floor Shadow Receiver Plane
  const floorGeo = new THREE.PlaneGeometry(16, 16);
  // Radial opacity shadow texture
  const floorCanvas = document.createElement('canvas');
  floorCanvas.width = 512;
  floorCanvas.height = 512;
  const fCtx = floorCanvas.getContext('2d')!;
  const fGrad = fCtx.createRadialGradient(256, 256, 0, 256, 256, 256);
  fGrad.addColorStop(0, isWhiteBg ? 'rgba(0,0,0,0.22)' : 'rgba(0,0,0,0.45)');
  fGrad.addColorStop(0.5, isWhiteBg ? 'rgba(0,0,0,0.08)' : 'rgba(0,0,0,0.18)');
  fGrad.addColorStop(1, 'rgba(0,0,0,0)');
  fCtx.fillStyle = fGrad;
  fCtx.fillRect(0, 0, 512, 512);
  const floorTex = new THREE.CanvasTexture(floorCanvas);

  const floorMat = new THREE.ShadowMaterial({
    opacity: isWhiteBg ? 0.22 : 0.55,
  });
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = 0;
  floor.receiveShadow = true;
  scene.add(floor);

  // Contact shadow subtle dark base plane
  const contactMat = new THREE.MeshBasicMaterial({
    map: floorTex,
    transparent: true,
    opacity: isWhiteBg ? 0.35 : 0.85,
    depthWrite: false
  });
  const contactPlane = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 2.4), contactMat);
  contactPlane.rotation.x = -Math.PI / 2;
  contactPlane.position.y = 0.001;
  scene.add(contactPlane);

  function resize(width: number, height: number) {
    if (width <= 0 || height <= 0) return;
    camera.aspect = width / height;
    
    // Apply offset for typography on desktop viewports
    if (width >= 960) {
      // Shift 3D model slightly to the right side (leave left 45% for typography)
      camera.setViewOffset(width, height, -width * 0.14, 0, width, height);
    } else {
      // Mobile: center or slight vertical offset
      camera.setViewOffset(width, height, 0, height * 0.12, width, height);
    }

    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  }

  function dispose() {
    renderer.dispose();
    floorGeo.dispose();
    floorMat.dispose();
    contactPlane.geometry.dispose();
    contactMat.dispose();
    floorTex.dispose();
  }

  return {
    renderer,
    scene,
    camera,
    keyLight,
    rimLight,
    sheenLight,
    hemiLight,
    floor,
    resize,
    dispose
  };
}
