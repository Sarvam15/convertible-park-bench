import * as THREE from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import fs from 'fs';
import path from 'path';

// Node.js FileReader polyfill for GLTFExporter
if (typeof globalThis.FileReader === 'undefined') {
  globalThis.FileReader = class FileReader {
    readAsArrayBuffer(blob) {
      if (blob && typeof blob.arrayBuffer === 'function') {
        blob.arrayBuffer().then((buf) => {
          this.result = buf;
          if (this.onloadend) this.onloadend();
          if (this.onload) this.onload();
        });
      } else {
        this.result = new ArrayBuffer(0);
        if (this.onloadend) this.onloadend();
        if (this.onload) this.onload();
      }
    }
    readAsDataURL(blob) {
      if (blob && typeof blob.arrayBuffer === 'function') {
        blob.arrayBuffer().then((buf) => {
          const base64 = Buffer.from(buf).toString('base64');
          this.result = `data:${blob.type || 'application/octet-stream'};base64,${base64}`;
          if (this.onloadend) this.onloadend();
          if (this.onload) this.onload();
        });
      } else {
        this.result = 'data:application/octet-stream;base64,';
        if (this.onloadend) this.onloadend();
        if (this.onload) this.onload();
      }
    }
  };
}

// Ensure output directories exist
const outputDir = path.resolve('public/models');
fs.mkdirSync(outputDir, { recursive: true });

console.log('Building Precision CAD 3D Model: Convertible Bench-to-Table...');

const scene = new THREE.Scene();
scene.name = 'Convertible_Bench_Scene';

// ==========================================
// PBR MATERIALS
// ==========================================
const steelMat = new THREE.MeshStandardMaterial({
  color: 0x24272c,
  metalness: 0.85,
  roughness: 0.35,
  name: 'Material_Architectural_Steel'
});

const darkSteelMat = new THREE.MeshStandardMaterial({
  color: 0x181a1d,
  metalness: 0.9,
  roughness: 0.28,
  name: 'Material_Dark_Steel_Frame'
});

const redAccentMat = new THREE.MeshStandardMaterial({
  color: 0xd63031,
  metalness: 0.6,
  roughness: 0.35,
  name: 'Material_Red_Anodized'
});

const stainlessHardwareMat = new THREE.MeshStandardMaterial({
  color: 0xdfe6e9,
  metalness: 0.95,
  roughness: 0.2,
  name: 'Material_Stainless_Hardware'
});

const woodMat = new THREE.MeshStandardMaterial({
  color: 0xc68c53,
  metalness: 0.05,
  roughness: 0.55,
  name: 'Material_Teak_Wood'
});

// Helper for boxes with metadata
function createPart(name, w, h, d, material, posX = 0, posY = 0, posZ = 0, rotX = 0, rotY = 0, rotZ = 0, explodeVec = [0, 0, 0]) {
  const geo = new THREE.BoxGeometry(w, h, d);
  const mesh = new THREE.Mesh(geo, material);
  mesh.name = name;
  mesh.position.set(posX, posY, posZ);
  mesh.rotation.set(rotX, rotY, rotZ);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.userData = { explodeDirection: explodeVec };
  return mesh;
}

// Helper for cylinders (tubes, pins, bolts)
function createCylinder(name, radiusTop, radiusBottom, height, segments, material, posX = 0, posY = 0, posZ = 0, rotX = 0, rotY = 0, rotZ = 0, explodeVec = [0, 0, 0]) {
  const geo = new THREE.CylinderGeometry(radiusTop, radiusBottom, height, segments);
  const mesh = new THREE.Mesh(geo, material);
  mesh.name = name;
  mesh.position.set(posX, posY, posZ);
  mesh.rotation.set(rotX, rotY, rotZ);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.userData = { explodeDirection: explodeVec };
  return mesh;
}

// ==========================================
// 1. ROOT MODEL STRUCTURE
// ==========================================
const rootModel = new THREE.Group();
rootModel.name = 'Convertible_Bench_Root';
scene.add(rootModel);

const stationaryGroup = new THREE.Group();
stationaryGroup.name = 'Stationary_Assembly';
rootModel.add(stationaryGroup);

// Left & Right C-shaped Steel Legs
const legXPositions = [-0.65, 0.65];

legXPositions.forEach((lx, idx) => {
  const side = idx === 0 ? 'Left' : 'Right';
  const legGroup = new THREE.Group();
  legGroup.name = `Leg_Assembly_${side}`;
  stationaryGroup.add(legGroup);

  const explodeSign = idx === 0 ? -1 : 1;

  // Bottom Horizontal Runner (750mm long along Z, 50x50mm profile)
  // Centered at Z = 0, Y = 0.025
  const baseRunner = createPart(
    `Base_Runner_${side}`,
    0.05, 0.05, 0.75,
    darkSteelMat,
    lx, 0.025, 0.0,
    0, 0, 0,
    [explodeSign * 0.2, -0.1, 0]
  );
  legGroup.add(baseRunner);

  // Front Vertical Post (rises to support seat at Y = 0.40, height = 0.35, Z = +0.225)
  const frontPost = createPart(
    `Front_Vertical_Post_${side}`,
    0.05, 0.35, 0.05,
    steelMat,
    lx, 0.225, 0.225,
    0, 0, 0,
    [explodeSign * 0.2, 0, 0.2]
  );
  legGroup.add(frontPost);

  // Rear Vertical Post (rises to clevis hinge pivot at Y = 0.70, height = 0.65, Z = -0.225)
  const rearPost = createPart(
    `Rear_Vertical_Post_${side}`,
    0.05, 0.65, 0.05,
    steelMat,
    lx, 0.375, -0.225,
    0, 0, 0,
    [explodeSign * 0.2, 0, -0.2]
  );
  legGroup.add(rearPost);

  // Top angled gusset / support cap at rear post top
  const rearCap = createPart(
    `Rear_Post_Cap_${side}`,
    0.055, 0.02, 0.065,
    darkSteelMat,
    lx, 0.705, -0.225,
    0, 0, 0,
    [explodeSign * 0.2, 0.1, -0.1]
  );
  legGroup.add(rearCap);

  // Mounting L-Brackets at Floor (Rear and Front of runner)
  // Rear Floor Bracket
  const rearFloorBracket = createPart(
    `Floor_L_Bracket_Rear_${side}`,
    0.08, 0.008, 0.08,
    redAccentMat,
    lx + (explodeSign * 0.025), 0.004, -0.32,
    0, 0, 0,
    [explodeSign * 0.3, -0.15, -0.2]
  );
  legGroup.add(rearFloorBracket);

  const rearBolt = createCylinder(
    `Anchor_Bolt_Rear_${side}`,
    0.008, 0.008, 0.025, 12,
    stainlessHardwareMat,
    lx + (explodeSign * 0.04), 0.015, -0.32,
    0, 0, 0,
    [explodeSign * 0.35, 0.1, -0.2]
  );
  legGroup.add(rearBolt);

  // Front Floor Bracket
  const frontFloorBracket = createPart(
    `Floor_L_Bracket_Front_${side}`,
    0.08, 0.008, 0.08,
    redAccentMat,
    lx + (explodeSign * 0.025), 0.004, 0.32,
    0, 0, 0,
    [explodeSign * 0.3, -0.15, 0.2]
  );
  legGroup.add(frontFloorBracket);

  const frontBolt = createCylinder(
    `Anchor_Bolt_Front_${side}`,
    0.008, 0.008, 0.025, 12,
    stainlessHardwareMat,
    lx + (explodeSign * 0.04), 0.015, 0.32,
    0, 0, 0,
    [explodeSign * 0.35, 0.1, 0.2]
  );
  legGroup.add(frontBolt);

  // Seat Top Mounting Bracket (on front post)
  const seatMountBracket = createPart(
    `Seat_Mount_L_Bracket_${side}`,
    0.06, 0.008, 0.12,
    redAccentMat,
    lx, 0.404, 0.225,
    0, 0, 0,
    [explodeSign * 0.1, 0.2, 0.1]
  );
  legGroup.add(seatMountBracket);

  // Clevis Hinge Base Bracket (Fixed on top of rear post)
  // U-bracket with outer cheeks
  const clevisBase = createPart(
    `Clevis_Base_Plate_${side}`,
    0.06, 0.01, 0.07,
    darkSteelMat,
    lx, 0.715, -0.225,
    0, 0, 0,
    [explodeSign * 0.2, 0.1, -0.1]
  );
  legGroup.add(clevisBase);

  // Clevis Left & Right Ears
  const cheek1 = createPart(
    `Clevis_Ear_Inner_${side}`,
    0.008, 0.05, 0.06,
    steelMat,
    lx - 0.025, 0.735, -0.225,
    0, 0, 0,
    [-0.08, 0.1, -0.1]
  );
  legGroup.add(cheek1);

  const cheek2 = createPart(
    `Clevis_Ear_Outer_${side}`,
    0.008, 0.05, 0.06,
    steelMat,
    lx + 0.025, 0.735, -0.225,
    0, 0, 0,
    [0.08, 0.1, -0.1]
  );
  legGroup.add(cheek2);
});

// Front Cross Reinforcement Rail (connecting left and right front posts under seat)
const frontCrossRail = createPart(
  'Front_Seat_Support_Crossmember',
  1.30, 0.04, 0.04,
  darkSteelMat,
  0.0, 0.38, 0.225,
  0, 0, 0,
  [0, -0.1, 0.15]
);
stationaryGroup.add(frontCrossRail);

// Rear Cross Reinforcement Rail (connecting left and right rear posts)
const rearCrossRail = createPart(
  'Rear_Frame_Crossmember',
  1.30, 0.04, 0.04,
  darkSteelMat,
  0.0, 0.30, -0.225,
  0, 0, 0,
  [0, -0.1, -0.15]
);
stationaryGroup.add(rearCrossRail);

// ==========================================
// 2. SEAT ASSEMBLY (Stationary, 1800mm Long)
// ==========================================
const seatGroup = new THREE.Group();
seatGroup.name = 'Seat_Assembly';
stationaryGroup.add(seatGroup);

// 3 Wooden Seat Slats (Length 1800mm, Width 110mm, Thickness 32mm, Gap 18mm)
// Centered around Z = +0.225, Top at Y = 0.450
const seatSlatZPositions = [0.097, 0.225, 0.353];
seatSlatZPositions.forEach((sz, sidx) => {
  const slat = createPart(
    `Seat_Slat_Wood_0${sidx + 1}`,
    1.80, 0.032, 0.110,
    woodMat,
    0.0, 0.434, sz, // Center Y = 0.450 - 0.016 = 0.434
    0, 0, 0,
    [0, 0.35 + (sidx * 0.05), (sidx - 1) * 0.08]
  );
  seatGroup.add(slat);

  // Fasteners / Carriage bolts through wood to steel
  legXPositions.forEach((lx, lidx) => {
    const bolt = createCylinder(
      `Seat_Fastener_Slat${sidx + 1}_Leg${lidx + 1}`,
      0.005, 0.005, 0.036, 10,
      stainlessHardwareMat,
      lx, 0.435, sz,
      0, 0, 0,
      [0, 0.5 + (sidx * 0.05), 0]
    );
    seatGroup.add(bolt);
  });
});

// ==========================================
// 3. MOVING SUBSYSTEM (Backrest <-> Tabletop)
// Pivots around axis [X, 0.735, -0.225]
// ==========================================
const pivotAxisY = 0.735;
const pivotAxisZ = -0.225;

// The pivot node: located right at the clevis hinge axis
const hingePivotGroup = new THREE.Group();
hingePivotGroup.name = 'Hinge_Pivot_Assembly';
hingePivotGroup.position.set(0, pivotAxisY, pivotAxisZ);
rootModel.add(hingePivotGroup);

// Moving Components Group under the pivot
const movingGroup = new THREE.Group();
movingGroup.name = 'Moving_Tabletop_Backrest_Assembly';
hingePivotGroup.add(movingGroup);

// Left & Right Pivot Swing Arms & Locking Levers
legXPositions.forEach((lx, idx) => {
  const side = idx === 0 ? 'Left' : 'Right';
  const armGroup = new THREE.Group();
  armGroup.name = `Pivot_Arm_${side}`;
  movingGroup.add(armGroup);

  const explodeSign = idx === 0 ? -1 : 1;

  // Clevis Pivot Pin (Stainless steel rod through hinge axis)
  const pivotPin = createCylinder(
    `Clevis_Pivot_Pin_${side}`,
    0.010, 0.010, 0.090, 16,
    stainlessHardwareMat,
    lx, 0, 0, // Relative to hingePivotGroup!
    0, 0, Math.PI / 2,
    [explodeSign * 0.3, 0, 0]
  );
  armGroup.add(pivotPin);

  // Quick-Release Cam Locking Lever (Red handle)
  const leverHandle = createPart(
    `Locking_Cam_Lever_${side}`,
    0.012, 0.110, 0.020,
    redAccentMat,
    lx + (explodeSign * 0.055), -0.045, 0,
    0, 0, explodeSign * 0.15,
    [explodeSign * 0.45, -0.1, 0]
  );
  armGroup.add(leverHandle);

  const leverCamHead = createCylinder(
    `Locking_Cam_Disc_${side}`,
    0.018, 0.018, 0.015, 16,
    darkSteelMat,
    lx + (explodeSign * 0.045), 0, 0,
    0, 0, Math.PI / 2,
    [explodeSign * 0.38, 0, 0]
  );
  armGroup.add(leverCamHead);

  // Structural Swing Arm (connecting clevis pivot to perimeter frame)
  // Extends from pivot (0, 0, 0) to frame attachment
  const swingArm = createPart(
    `Swing_Arm_${side}`,
    0.04, 0.04, 0.28,
    steelMat,
    lx, 0.025, 0.12,
    0, 0, 0,
    [explodeSign * 0.15, 0.1, 0.1]
  );
  armGroup.add(swingArm);

  const armMountBracket = createPart(
    `Table_Underside_Bracket_${side}`,
    0.06, 0.008, 0.10,
    redAccentMat,
    lx, 0.048, 0.22,
    0, 0, 0,
    [explodeSign * 0.1, 0.25, 0.1]
  );
  armGroup.add(armMountBracket);
});

// Tabletop / Backrest Perimeter Steel Frame (1800mm x 440mm x 35mm)
// Positioned relative to pivot axis: in horizontal table configuration, extends forward over seat
// In local space, centered at Z = 0.22, Y = 0.05
const tableFrameGroup = new THREE.Group();
tableFrameGroup.name = 'Tabletop_Perimeter_Frame_Group';
movingGroup.add(tableFrameGroup);

// Longitudinal frame bars (Length 1800mm, 40x40mm)
const frontTableBeam = createPart(
  'Tabletop_Front_Steel_Beam',
  1.80, 0.04, 0.04,
  steelMat,
  0.0, 0.04, 0.42,
  0, 0, 0,
  [0, 0.2, 0.3]
);
tableFrameGroup.add(frontTableBeam);

const rearTableBeam = createPart(
  'Tabletop_Rear_Steel_Beam',
  1.80, 0.04, 0.04,
  steelMat,
  0.0, 0.04, 0.02,
  0, 0, 0,
  [0, 0.2, -0.3]
);
tableFrameGroup.add(rearTableBeam);

// Transverse End Caps (440mm long along Z)
const leftTableCap = createPart(
  'Tabletop_Left_End_Cap',
  0.04, 0.04, 0.44,
  steelMat,
  -0.88, 0.04, 0.22,
  0, 0, 0,
  [-0.3, 0.2, 0]
);
tableFrameGroup.add(leftTableCap);

const rightTableCap = createPart(
  'Tabletop_Right_End_Cap',
  0.04, 0.04, 0.44,
  steelMat,
  0.88, 0.04, 0.22,
  0, 0, 0,
  [0.3, 0.2, 0]
);
tableFrameGroup.add(rightTableCap);

// Intermediate Transverse Ribs for stiffness (at 1/3 and 2/3 span)
[-0.30, 0.30].forEach((rx, ridx) => {
  const rib = createPart(
    `Tabletop_Transverse_Rib_0${ridx + 1}`,
    0.03, 0.03, 0.36,
    darkSteelMat,
    rx, 0.035, 0.22,
    0, 0, 0,
    [0, -0.15, 0]
  );
  tableFrameGroup.add(rib);
});

// 4 Wooden Tabletop / Backrest Slats (Length 1720mm, Width 90mm, Thickness 28mm, Gap 10mm)
// Surface at top of frame (Y = 0.064)
const tableSlatZPositions = [0.075, 0.175, 0.275, 0.375];
tableSlatZPositions.forEach((tz, tidx) => {
  const slat = createPart(
    `Tabletop_Slat_Wood_0${tidx + 1}`,
    1.72, 0.028, 0.090,
    woodMat,
    0.0, 0.064, tz,
    0, 0, 0,
    [0, 0.4 + (tidx * 0.05), (tidx - 1.5) * 0.1]
  );
  tableFrameGroup.add(slat);

  // Fasteners
  [-0.65, -0.30, 0.30, 0.65].forEach((fx, fidx) => {
    const bolt = createCylinder(
      `Table_Fastener_Slat${tidx + 1}_Rib${fidx + 1}`,
      0.004, 0.004, 0.032, 10,
      stainlessHardwareMat,
      fx, 0.065, tz,
      0, 0, 0,
      [0, 0.55 + (tidx * 0.04), 0]
    );
    tableFrameGroup.add(bolt);
  });
});

// In initial neutral CAD pose (Table Configuration), the tabletop is horizontal.
// When in Bench Configuration, hingePivotGroup rotates by -75° around X axis:
// hingePivotGroup.rotation.x = -Math.PI * (75 / 180);

console.log('Total nodes in scene:', scene.children.length);

// ==========================================
// 4. EXPORT GLB USING THREE.JS GLTFEXPORTER
// ==========================================
const exporter = new GLTFExporter();

const exportOptions = {
  binary: true,
  embedImages: true,
  includeCustomExtensions: true
};

exporter.parse(
  scene,
  (gltf) => {
    const glbPath = path.join(outputDir, 'convertible_bench.glb');
    fs.writeFileSync(glbPath, Buffer.from(gltf));
    const stats = fs.statSync(glbPath);
    console.log(`GLB Export Success! File written to: ${glbPath} (${stats.size} bytes)`);

    // Also export JSON glTF format for direct visual inspection / debugging
    exporter.parse(
      scene,
      (gltfJson) => {
        const jsonPath = path.join(outputDir, 'convertible_bench.gltf');
        fs.writeFileSync(jsonPath, JSON.stringify(gltfJson, null, 2));
        console.log(`glTF JSON written to: ${jsonPath}`);
      },
      (err) => console.error('Error exporting glTF JSON:', err),
      { binary: false }
    );
  },
  (error) => {
    console.error('An error occurred during GLB export:', error);
  },
  exportOptions
);
