import * as THREE from 'three';
import { MaterialPalette, WoodType, SteelFinish } from './Materials';

export interface PartInfo {
  id: string;
  name: string;
  category: 'Structure' | 'Mechanism' | 'Surface' | 'Hardware';
  material: string;
  dimensions: string;
  description: string;
  meshNames: string[];
}

export type BenchMode = 'bench' | 'table' | 'extra_seating';

export class BenchModel {
  public root: THREE.Group;
  public stationaryGroup: THREE.Group;
  public hingePivotGroup: THREE.Group;
  public movingGroup: THREE.Group;
  public slatBedGroup: THREE.Group;
  public materials: MaterialPalette;

  private meshes: Map<string, THREE.Mesh> = new Map();
  private originalMaterials: Map<string, THREE.Material> = new Map();
  private originalPositions: Map<string, THREE.Vector3> = new Map();
  private explodeVectors: Map<string, THREE.Vector3> = new Map();
  private camLevers: THREE.Mesh[] = [];
  private swingArms: THREE.Mesh[] = [];

  // Pivot axis: Y = 0.680m, Z = -0.160m (Clevis hinge at top of rear vertical post)
  public readonly pivotY = 0.680;
  public readonly pivotZ = -0.160;

  constructor(materials: MaterialPalette) {
    this.materials = materials;
    this.root = new THREE.Group();
    this.root.name = 'Convertible_Bench_Root';

    this.stationaryGroup = new THREE.Group();
    this.stationaryGroup.name = 'Stationary_Assembly';
    this.root.add(this.stationaryGroup);

    this.hingePivotGroup = new THREE.Group();
    this.hingePivotGroup.name = 'Hinge_Pivot_Group';
    this.hingePivotGroup.position.set(0, this.pivotY, this.pivotZ);
    this.root.add(this.hingePivotGroup);

    this.movingGroup = new THREE.Group();
    this.movingGroup.name = 'Moving_Tabletop_Assembly';
    this.hingePivotGroup.add(this.movingGroup);

    this.slatBedGroup = new THREE.Group();
    this.slatBedGroup.name = 'Slat_Bed_Group';
    this.movingGroup.add(this.slatBedGroup);

    this.buildGeometry();
    this.setTransformation(0); // Start in Bench configuration
  }

  private registerPart(
    name: string,
    mesh: THREE.Mesh,
    explodeVec: [number, number, number] = [0, 0, 0]
  ) {
    mesh.name = name;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    this.meshes.set(name, mesh);
    this.originalMaterials.set(name, mesh.material as THREE.Material);
    this.originalPositions.set(name, mesh.position.clone());
    this.explodeVectors.set(name, new THREE.Vector3(...explodeVec));
  }

  private createBox(
    name: string,
    w: number, h: number, d: number,
    material: THREE.Material,
    pos: [number, number, number],
    rot: [number, number, number] = [0, 0, 0],
    explodeVec: [number, number, number] = [0, 0, 0]
  ): THREE.Mesh {
    const geo = new THREE.BoxGeometry(w, h, d);
    const mesh = new THREE.Mesh(geo, material);
    mesh.position.set(...pos);
    mesh.rotation.set(...rot);
    this.registerPart(name, mesh, explodeVec);
    return mesh;
  }

  private createCylinder(
    name: string,
    rTop: number, rBot: number, height: number, segments: number,
    material: THREE.Material,
    pos: [number, number, number],
    rot: [number, number, number] = [0, 0, 0],
    explodeVec: [number, number, number] = [0, 0, 0]
  ): THREE.Mesh {
    const geo = new THREE.CylinderGeometry(rTop, rBot, height, segments);
    const mesh = new THREE.Mesh(geo, material);
    mesh.position.set(...pos);
    mesh.rotation.set(...rot);
    this.registerPart(name, mesh, explodeVec);
    return mesh;
  }

  private buildGeometry() {
    const legX = [-0.65, 0.65];

    // ==========================================
    // 1. STATIONARY LEGS & BASE RUNNERS
    // Base runner: extends along Z from -0.22m to +0.36m (580mm total)
    // Front post: at Z = +0.20m (supporting seat at Y = 0.40m)
    // Rear post: strictly on the RIGHT-MOST SIDE at Z = -0.16m (height 0.63m to clevis at Y = 0.68m)
    // ==========================================
    legX.forEach((lx, idx) => {
      const side = idx === 0 ? 'Left' : 'Right';
      const sgn = idx === 0 ? -1 : 1;

      // Base runner along floor (580mm long along Z, 50x50mm HSS tube)
      const baseRunner = this.createBox(
        `Base_Runner_${side}`,
        0.05, 0.05, 0.58,
        this.materials.darkSteel,
        [lx, 0.025, 0.07],
        [0, 0, 0],
        [sgn * 0.2, -0.1, 0]
      );
      this.stationaryGroup.add(baseRunner);

      // Front Vertical Post (height 350mm to seat support at Y=0.40m, Z=+0.20m)
      const frontPost = this.createBox(
        `Front_Vertical_Post_${side}`,
        0.05, 0.35, 0.05,
        this.materials.steel,
        [lx, 0.225, 0.20],
        [0, 0, 0],
        [sgn * 0.2, 0, 0.2]
      );
      this.stationaryGroup.add(frontPost);

      // Rear Vertical Post: Positioned strictly at the RIGHT-MOST SIDE (Z = -0.16m)
      // Height 630mm extending to Y = 0.680m to mount clevis hinge
      const rearPost = this.createBox(
        `Rear_Vertical_Post_${side}`,
        0.05, 0.63, 0.05,
        this.materials.steel,
        [lx, 0.365, -0.16],
        [0, 0, 0],
        [sgn * 0.2, 0, -0.2]
      );
      this.stationaryGroup.add(rearPost);

      // Compact Corner Gusset at junction between base runner and rear post
      // Tucked cleanly inside the 90° corner at floor level (no floating diagonal bar!)
      const cornerGusset = this.createBox(
        `Diagonal_Gusset_${side}`,
        0.035, 0.08, 0.035,
        this.materials.steel,
        [lx, 0.07, -0.12],
        [0.785, 0, 0],
        [sgn * 0.2, 0, -0.1]
      );
      this.stationaryGroup.add(cornerGusset);

      // Rear post top cap (right-most side at Z = -0.16m)
      const rearCap = this.createBox(
        `Rear_Post_Cap_${side}`,
        0.056, 0.015, 0.065,
        this.materials.darkSteel,
        [lx, 0.675, -0.16],
        [0, 0, 0],
        [sgn * 0.2, 0.1, -0.1]
      );
      this.stationaryGroup.add(rearCap);

      // Floor Mounting L-Brackets (Red) & Anchor Bolts
      const rearFloorBracket = this.createBox(
        `Floor_L_Bracket_Rear_${side}`,
        0.08, 0.008, 0.08,
        this.materials.redAccent,
        [lx + (sgn * 0.025), 0.004, -0.16],
        [0, 0, 0],
        [sgn * 0.3, -0.15, -0.2]
      );
      this.stationaryGroup.add(rearFloorBracket);

      const rearBolt = this.createCylinder(
        `Anchor_Bolt_Rear_${side}`,
        0.008, 0.008, 0.025, 12,
        this.materials.hardware,
        [lx + (sgn * 0.04), 0.015, -0.16],
        [0, 0, 0],
        [sgn * 0.35, 0.1, -0.2]
      );
      this.stationaryGroup.add(rearBolt);

      const frontFloorBracket = this.createBox(
        `Floor_L_Bracket_Front_${side}`,
        0.08, 0.008, 0.08,
        this.materials.redAccent,
        [lx + (sgn * 0.025), 0.004, 0.34],
        [0, 0, 0],
        [sgn * 0.3, -0.15, 0.2]
      );
      this.stationaryGroup.add(frontFloorBracket);

      const frontBolt = this.createCylinder(
        `Anchor_Bolt_Front_${side}`,
        0.008, 0.008, 0.025, 12,
        this.materials.hardware,
        [lx + (sgn * 0.04), 0.015, 0.34],
        [0, 0, 0],
        [sgn * 0.35, 0.1, 0.2]
      );
      this.stationaryGroup.add(frontBolt);

      // Seat Support L-Bracket (Red)
      const seatMount = this.createBox(
        `Seat_Mount_L_Bracket_${side}`,
        0.06, 0.008, 0.12,
        this.materials.redAccent,
        [lx, 0.404, 0.20],
        [0, 0, 0],
        [sgn * 0.1, 0.2, 0.1]
      );
      this.stationaryGroup.add(seatMount);

      // Clevis Hinge U-Bracket Base & Ears at (lx, 0.680, -0.160) on right-most post
      const clevisBase = this.createBox(
        `Clevis_Base_${side}`,
        0.06, 0.015, 0.07,
        this.materials.darkSteel,
        [lx, 0.680, -0.16],
        [0, 0, 0],
        [sgn * 0.2, 0.1, -0.1]
      );
      this.stationaryGroup.add(clevisBase);

      const earInner = this.createBox(
        `Clevis_Ear_Inner_${side}`,
        0.008, 0.05, 0.06,
        this.materials.steel,
        [lx - 0.025, 0.700, -0.16],
        [0, 0, 0],
        [-0.08, 0.1, -0.1]
      );
      this.stationaryGroup.add(earInner);

      const earOuter = this.createBox(
        `Clevis_Ear_Outer_${side}`,
        0.008, 0.05, 0.06,
        this.materials.steel,
        [lx + 0.025, 0.700, -0.16],
        [0, 0, 0],
        [0.08, 0.1, -0.1]
      );
      this.stationaryGroup.add(earOuter);
    });

    // Structural Crossmembers
    const frontRail = this.createBox(
      'Front_Seat_Support_Crossmember',
      1.30, 0.04, 0.04,
      this.materials.darkSteel,
      [0.0, 0.38, 0.20],
      [0, 0, 0],
      [0, -0.1, 0.15]
    );
    this.stationaryGroup.add(frontRail);

    const rearRail = this.createBox(
      'Rear_Frame_Crossmember',
      1.30, 0.04, 0.04,
      this.materials.darkSteel,
      [0.0, 0.35, -0.16],
      [0, 0, 0],
      [0, -0.1, -0.15]
    );
    this.stationaryGroup.add(rearRail);

    // ==========================================
    // 2. SEAT ASSEMBLY (Stationary, 1800mm Long)
    // 3 Front Seat Slats positioned between Z = +0.08m and +0.32m
    // Rear edge sits at Z = +0.032m, providing a natural, tight gap to the backrest
    // ==========================================
    const seatSlatsZ = [0.08, 0.20, 0.32];
    seatSlatsZ.forEach((sz, sidx) => {
      const slat = this.createBox(
        `Seat_Slat_Wood_0${sidx + 1}`,
        1.80, 0.032, 0.095,
        this.materials.wood,
        [0.0, 0.434, sz],
        [0, 0, 0],
        [0, 0.35 + sidx * 0.05, (sidx - 1) * 0.08]
      );
      this.stationaryGroup.add(slat);

      // Fastener hardware
      legX.forEach((lx, lidx) => {
        const bolt = this.createCylinder(
          `Seat_Bolt_S${sidx + 1}_L${lidx + 1}`,
          0.005, 0.005, 0.036, 10,
          this.materials.hardware,
          [lx, 0.435, sz],
          [0, 0, 0],
          [0, 0.5 + sidx * 0.05, 0]
        );
        this.stationaryGroup.add(bolt);
      });
    });

    // ==========================================
    // 3. MOVING BACKREST / TABLETOP SUBSYSTEM
    // Connected to hingePivotGroup at (0, 0.680, -0.160)
    // Clevis pins & cam levers are centered on the right-most hinge axis
    // ==========================================
    legX.forEach((lx, idx) => {
      const side = idx === 0 ? 'Left' : 'Right';
      const sgn = idx === 0 ? -1 : 1;

      // Clevis Pivot Pin
      const pin = this.createCylinder(
        `Clevis_Pin_${side}`,
        0.010, 0.010, 0.090, 16,
        this.materials.hardware,
        [lx, 0, 0],
        [0, 0, Math.PI / 2],
        [sgn * 0.3, 0, 0]
      );
      this.movingGroup.add(pin);

      // Cam Lever Handle (Red)
      const lever = this.createBox(
        `Locking_Cam_Lever_${side}`,
        0.012, 0.110, 0.020,
        this.materials.redAccent,
        [lx + (sgn * 0.055), -0.045, 0],
        [0, 0, sgn * 0.15],
        [sgn * 0.45, -0.1, 0]
      );
      this.movingGroup.add(lever);
      this.camLevers.push(lever);

      const camDisc = this.createCylinder(
        `Locking_Cam_Disc_${side}`,
        0.018, 0.018, 0.015, 16,
        this.materials.darkSteel,
        [lx + (sgn * 0.045), 0, 0],
        [0, 0, Math.PI / 2],
        [sgn * 0.38, 0, 0]
      );
      this.movingGroup.add(camDisc);

      // Heavy-Duty Swing Arm: rigidly welded to back of backrest/tabletop frame
      // Flushed directly behind the wood slats at local Z = -0.016m (NO floating in air!)
      const arm = this.createBox(
        `Swing_Arm_${side}`,
        0.038, 0.24, 0.038,
        this.materials.steel,
        [lx, -0.02, -0.016],
        [0, 0, 0],
        [sgn * 0.15, 0.1, -0.1]
      );
      this.slatBedGroup.add(arm);
      this.swingArms.push(arm);
    });

    // ==========================================
    // 4. TABLETOP / BACKREST FRAME & SLATS (In SlatBedGroup)
    // SlatBedGroup local coordinates:
    // Wooden slats sit on the front face (local Z = +0.015m, facing +Z)
    // Steel support frame sits FLUSH BEHIND the slats (local Z = -0.015m)
    // Length: 1.68m, depth: 250mm — strictly contained behind the wood with NO bars poking out!
    // ==========================================
    const topBeam = this.createBox(
      'Tabletop_Top_Beam',
      1.68, 0.032, 0.032,
      this.materials.steel,
      [0.0, 0.11, -0.016],
      [0, 0, 0],
      [0, 0.2, 0.2]
    );
    this.slatBedGroup.add(topBeam);

    const bottomBeam = this.createBox(
      'Tabletop_Bottom_Beam',
      1.68, 0.032, 0.032,
      this.materials.steel,
      [0.0, -0.11, -0.016],
      [0, 0, 0],
      [0, 0.2, -0.3]
    );
    this.slatBedGroup.add(bottomBeam);

    const leftCap = this.createBox(
      'Tabletop_Left_Cap',
      0.032, 0.252, 0.032,
      this.materials.steel,
      [-0.82, 0.0, -0.016],
      [0, 0, 0],
      [-0.3, 0.2, 0]
    );
    this.slatBedGroup.add(leftCap);

    const rightCap = this.createBox(
      'Tabletop_Right_Cap',
      0.032, 0.252, 0.032,
      this.materials.steel,
      [0.82, 0.0, -0.016],
      [0, 0, 0],
      [0.3, 0.2, 0]
    );
    this.slatBedGroup.add(rightCap);

    // Stiffener ribs tucked behind slats
    [-0.30, 0.30].forEach((rx, ridx) => {
      const rib = this.createBox(
        `Tabletop_Rib_0${ridx + 1}`,
        0.028, 0.22, 0.028,
        this.materials.darkSteel,
        [rx, 0.0, -0.016],
        [0, 0, 0],
        [0, -0.15, 0]
      );
      this.slatBedGroup.add(rib);
    });

    // 4 Wooden Tabletop / Backrest Slats (Length 1720mm, Width 62mm, Thickness 28mm)
    // Mounted on local +Z face so smooth timber faces +Z
    const tableSlatsY = [-0.096, -0.032, 0.032, 0.096];
    tableSlatsY.forEach((ty, tidx) => {
      const slat = this.createBox(
        `Tabletop_Slat_Wood_0${tidx + 1}`,
        1.72, 0.058, 0.028,
        this.materials.wood,
        [0.0, ty, 0.014],
        [0, 0, 0],
        [0, 0.4 + tidx * 0.05, (tidx - 1.5) * 0.1]
      );
      this.slatBedGroup.add(slat);

      [-0.65, -0.30, 0.30, 0.65].forEach((fx, fidx) => {
        const bolt = this.createCylinder(
          `Table_Bolt_S${tidx + 1}_R${fidx + 1}`,
          0.004, 0.004, 0.032, 10,
          this.materials.hardware,
          [fx, ty, 0.016],
          [0, 0, 0],
          [0, 0.55 + tidx * 0.04, 0]
        );
        this.slatBedGroup.add(bolt);
      });
    });
  }

  // ==========================================
  // PARAMETRIC CONTROLLERS
  // ==========================================

  /**
   * Set continuous kinematic value:
   *  0.0 = Park Bench Mode (Backrest upright tilted at -15°, gap reduced to 50mm, frame neatly tucked behind)
   * +1.0 = Work Table Mode (Tabletop horizontal flat at 750mm height with 90mm ergonomic clearance)
   * Extra Seating is identical to Work Bench Mode.
   */
  public setKinematicValue(value: number) {
    // If negative (extra seating mode selected), map to 1.0 (identical to Work Bench mode)
    const t = value < 0 ? 1.0 : Math.min(1, Math.max(0, value));

    // Smooth trajectory from Bench (0.0) to Table (1.0):
    // Park Bench: backrest positioned right behind seat (Z = -0.09m, Y = 0.68m, rotX = -18°)
    // Work Table: tabletop horizontal at 750mm (Z = -0.05m, Y = 0.745m, rotX = -90°)
    const curY = THREE.MathUtils.lerp(0.68, 0.745, t);
    const curZ = THREE.MathUtils.lerp(-0.09, -0.05, t);
    const curRotX = THREE.MathUtils.lerp(
      THREE.MathUtils.degToRad(-18),
      THREE.MathUtils.degToRad(-90),
      t
    );

    this.slatBedGroup.position.set(0, curY - this.pivotY, curZ - this.pivotZ);
    this.slatBedGroup.rotation.set(curRotX, 0, 0);

    // Cam lever release during transition
    const unlock = Math.sin(t * Math.PI);
    this.camLevers.forEach((lever, idx) => {
      const sign = idx === 0 ? -1 : 1;
      lever.rotation.z = (sign * 0.15) + (sign * unlock * 1.4);
    });
  }

  /**
   * Backward-compatible 0..1 transformation for scroll narrative:
   * 0.0 = Bench backrest
   * 1.0 = Table flat horizontal
   */
  public setTransformation(progress: number) {
    this.setKinematicValue(progress);
  }

  /**
   * Set exploded assembly displacement (0.0 to 1.0)
   */
  public setExploded(amount: number) {
    const e = Math.max(0, Math.min(1, amount));
    this.meshes.forEach((mesh, name) => {
      const origPos = this.originalPositions.get(name);
      const vec = this.explodeVectors.get(name);
      if (origPos && vec) {
        mesh.position.set(
          origPos.x + vec.x * e,
          origPos.y + vec.y * e,
          origPos.z + vec.z * e
        );
      }
    });
  }

  /**
   * Highlight a specific part by name (or null to clear)
   */
  public highlightPart(partName: string | null) {
    this.meshes.forEach((mesh, name) => {
      if (partName && (name === partName || name.includes(partName))) {
        mesh.material = this.materials.highlight;
      } else {
        const orig = this.originalMaterials.get(name);
        if (orig) mesh.material = orig;
      }
    });
  }

  /**
   * Return raycastable meshes for interactive inspection
   */
  public getInteractiveMeshes(): THREE.Mesh[] {
    return Array.from(this.meshes.values());
  }

  /**
   * Component Parts Metadata Catalog for Engineering Inspector
   */
  public static getPartCatalog(): PartInfo[] {
    return [
      {
        id: 'clevis_hinge',
        name: 'Heavy-Duty Clevis Hinge Assembly',
        category: 'Mechanism',
        material: 'Structural Steel S275JR & Grade 8.8 Pin',
        dimensions: '60mm W x 70mm H x 20mm Ø Pin',
        description: 'CNC-milled dual-ear clevis hinge welded to rear post cap on the right-most frame post. Accommodates 75° rotational transformation with tight radial bearing tolerances.',
        meshNames: ['Clevis_Base', 'Clevis_Ear', 'Clevis_Pin']
      },
      {
        id: 'locking_lever',
        name: 'Quick-Release Cam Locking Lever',
        category: 'Mechanism',
        material: 'Anodized 6061-T6 Aluminum (Crimson Red)',
        dimensions: '110mm L x 12mm W x 20mm D',
        description: 'Over-center cam lever providing 1.2 kN clamping force. Secures backrest in bench mode and rigid horizontal orientation in table mode without play.',
        meshNames: ['Locking_Cam_Lever', 'Locking_Cam_Disc']
      },
      {
        id: 'wood_slats',
        name: 'Architectural Hardwood Slats (Teak)',
        category: 'Surface',
        material: 'Kiln-Dried Tectona Grandis (Satin UV Wax)',
        dimensions: '1800mm L x 100mm W x 32mm T',
        description: 'Sustainably sourced quarter-sawn teak slats with eased edges. Engineered for all-weather outdoor durability with 18mm drainage and expansion gaps.',
        meshNames: ['Seat_Slat_Wood', 'Tabletop_Slat_Wood']
      },
      {
        id: 'steel_frame',
        name: 'C-Shaped Welded Steel Frame Leg',
        category: 'Structure',
        material: 'Architectural Powder-Coated Steel (Anthracite)',
        dimensions: '50mm x 50mm x 3.2mm Wall Hollow Section',
        description: 'Continuous C-shaped structural loop transferring cantilevered loads directly to base runners. Rear post positioned on right-most edge with internal diagonal bracing.',
        meshNames: ['Base_Runner', 'Front_Vertical_Post', 'Rear_Vertical_Post']
      },
      {
        id: 'mounting_brackets',
        name: 'Ground Anchor Mounting L-Brackets',
        category: 'Hardware',
        material: 'Formed 6mm Steel Plate (Electrostatic Red)',
        dimensions: '80mm x 80mm x 6mm with M12 Anchor Holes',
        description: 'Heavy gauge steel anchoring brackets locking runners to concrete pads or pavers. Prevents tipping under heavy asymmetrical loads.',
        meshNames: ['Floor_L_Bracket', 'Anchor_Bolt']
      },
      {
        id: 'perimeter_frame',
        name: 'Tabletop Structural Perimeter Frame',
        category: 'Structure',
        material: 'Square Steel Tubing (32mm x 32mm x 2.5mm)',
        dimensions: '1680mm L x 250mm W x 32mm H',
        description: 'Torsion-resistant perimeter frame supporting tabletop slats. Sits flush behind the timber planks with no floating overhangs.',
        meshNames: ['Tabletop_Top_Beam', 'Tabletop_Bottom_Beam', 'Tabletop_Left_Cap', 'Tabletop_Right_Cap', 'Tabletop_Rib']
      }
    ];
  }
}
