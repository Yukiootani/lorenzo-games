/* ================================================================
   LORENZO GAME 2 — Textures & All 17 Famous Voxel Pokémon Models
   ================================================================ */
(function (global) {
  'use strict';

  function seededHash(x, y, s) {
    const n = Math.sin(x * 127.1 + y * 311.7 + s * 74.7) * 43758.5453123;
    return n - Math.floor(n);
  }

  function makePixelTex(drawFn) {
    const c = document.createElement('canvas');
    c.width = 16;
    c.height = 16;
    const ctx = c.getContext('2d');
    drawFn(ctx);
    const tex = new THREE.CanvasTexture(c);
    tex.magFilter = THREE.NearestFilter;
    tex.minFilter = THREE.NearestFilter;
    if (THREE.sRGBEncoding) tex.encoding = THREE.sRGBEncoding;
    return tex;
  }

  function fillSpeckle(ctx, palette, seed) {
    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 16; x++) {
        ctx.fillStyle = palette[Math.floor(seededHash(x, y, seed) * palette.length)];
        ctx.fillRect(x, y, 1, 1);
      }
    }
  }

  function createCityMaterials() {
    const grassTop = makePixelTex((ctx) => fillSpeckle(ctx, ['#4eb849', '#56c44f', '#44a840', '#63cf58'], 1));
    const dirtTex  = makePixelTex((ctx) => fillSpeckle(ctx, ['#8a5a36', '#7b4e2d', '#96643e', '#6f4527'], 2));
    const grassSide = makePixelTex((ctx) => {
      fillSpeckle(ctx, ['#8a5a36', '#7b4e2d', '#96643e'], 2);
      for (let x = 0; x < 16; x++) {
        const f = 3 + Math.floor(seededHash(x, 0, 9) * 3);
        for (let y = 0; y < f; y++) {
          ctx.fillStyle = seededHash(x, y, 3) > 0.5 ? '#56c44f' : '#44a840';
          ctx.fillRect(x, y, 1, 1);
        }
      }
    });
    const stoneTex = makePixelTex((ctx) => {
      fillSpeckle(ctx, ['#8d96a0', '#7c8590', '#9aa3ad', '#6e7782'], 4);
      ctx.fillStyle = 'rgba(15,23,42,0.22)';
      ctx.fillRect(0, 7, 16, 1); ctx.fillRect(7, 0, 1, 8); ctx.fillRect(12, 8, 1, 8);
    });
    const roadTex = makePixelTex((ctx) => {
      fillSpeckle(ctx, ['#cbd5e1', '#94a3b8', '#b4c0ce', '#a1aebf'], 11);
      ctx.fillStyle = 'rgba(30,41,59,0.25)';
      ctx.fillRect(0, 0, 16, 1); ctx.fillRect(0, 8, 16, 1);
      ctx.fillRect(8, 0, 1, 8); ctx.fillRect(4, 8, 1, 8);
    });
    const sandTex = makePixelTex((ctx) => fillSpeckle(ctx, ['#fde68a', '#fcd34d', '#f5d076', '#fef08a'], 12));
    const waterTex = makePixelTex((ctx) => {
      fillSpeckle(ctx, ['#1fb6f2', '#26c2ff', '#169fd9', '#38ccf8'], 5);
      ctx.fillStyle = 'rgba(255,255,255,0.38)';
      ctx.fillRect(2, 3, 5, 1); ctx.fillRect(9, 11, 5, 1);
    });
    const lavaTex = makePixelTex((ctx) => {
      fillSpeckle(ctx, ['#ea580c', '#f97316', '#dc2626', '#facc15'], 13);
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(3, 4, 4, 2); ctx.fillRect(10, 10, 4, 2);
    });
    const obsidianTex = makePixelTex((ctx) => fillSpeckle(ctx, ['#1e293b', '#273449', '#0f172a', '#334155'], 14));
    const woodTex = makePixelTex((ctx) => fillSpeckle(ctx, ['#6b4423', '#5c381b', '#7a4f2a', '#4f2f15'], 6));
    const leavesTex = makePixelTex((ctx) => fillSpeckle(ctx, ['#2d8a3e', '#38a64c', '#237032', '#47bf5c'], 7));
    const wallTex = makePixelTex((ctx) => {
      fillSpeckle(ctx, ['#f1f5f9', '#e2e8f0', '#f8fafc'], 15);
      ctx.fillStyle = 'rgba(148,163,184,0.35)';
      ctx.fillRect(0, 5, 16, 1); ctx.fillRect(0, 11, 16, 1);
    });
    const roofRedTex  = makePixelTex((ctx) => fillSpeckle(ctx, ['#dc2626', '#ef4444', '#b91c1c', '#f87171'], 16));
    const roofBlueTex = makePixelTex((ctx) => fillSpeckle(ctx, ['#0284c7', '#0ea5e9', '#0369a1', '#38bdf8'], 17));
    const roofGoldTex = makePixelTex((ctx) => fillSpeckle(ctx, ['#d97706', '#f59e0b', '#b45309', '#fbbf24'], 18));
    const neonRoadTex = makePixelTex((ctx) => {
      fillSpeckle(ctx, ['#0f172a', '#1e293b', '#172033'], 19);
      ctx.fillStyle = '#22d3ee';
      ctx.fillRect(0, 7, 16, 2);
    });
    const neonTowerTex = makePixelTex((ctx) => {
      fillSpeckle(ctx, ['#1e1b4b', '#312e81', '#1e293b'], 20);
      ctx.fillStyle = '#facc15';
      ctx.fillRect(2, 3, 4, 3); ctx.fillRect(10, 3, 4, 3);
      ctx.fillStyle = '#22d3ee';
      ctx.fillRect(2, 10, 4, 3); ctx.fillRect(10, 10, 4, 3);
    });
    const marbleTex = makePixelTex((ctx) => {
      fillSpeckle(ctx, ['#eef2ff', '#e0e7ff', '#f8fafc', '#c7d2fe'], 21);
      ctx.fillStyle = 'rgba(250,204,21,0.45)';
      ctx.fillRect(0, 14, 16, 2);
    });

    const grassSideMat = new THREE.MeshLambertMaterial({ map: grassSide });
    const grassTopMat  = new THREE.MeshLambertMaterial({ map: grassTop });
    const dirtMat      = new THREE.MeshLambertMaterial({ map: dirtTex });

    return {
      grass: [grassSideMat, grassSideMat, grassTopMat, dirtMat, grassSideMat, grassSideMat],
      dirt: dirtMat,
      stone: new THREE.MeshLambertMaterial({ map: stoneTex }),
      road: new THREE.MeshLambertMaterial({ map: roadTex }),
      sand: new THREE.MeshLambertMaterial({ map: sandTex }),
      water: new THREE.MeshLambertMaterial({ map: waterTex, transparent: true, opacity: 0.78 }),
      lava: new THREE.MeshStandardMaterial({ map: lavaTex, emissive: 0xea580c, emissiveIntensity: 0.85 }),
      obsidian: new THREE.MeshLambertMaterial({ map: obsidianTex }),
      wood: new THREE.MeshLambertMaterial({ map: woodTex }),
      leaves: new THREE.MeshLambertMaterial({ map: leavesTex }),
      wall: new THREE.MeshLambertMaterial({ map: wallTex }),
      roofRed: new THREE.MeshLambertMaterial({ map: roofRedTex }),
      roofBlue: new THREE.MeshLambertMaterial({ map: roofBlueTex }),
      roofGold: new THREE.MeshLambertMaterial({ map: roofGoldTex }),
      neonRoad: new THREE.MeshStandardMaterial({ map: neonRoadTex, emissive: 0x0891b2, emissiveIntensity: 0.4 }),
      neonTower: new THREE.MeshStandardMaterial({ map: neonTowerTex, emissive: 0x3b82f6, emissiveIntensity: 0.45 }),
      marble: new THREE.MeshLambertMaterial({ map: marbleTex }),
      windowGlow: new THREE.MeshStandardMaterial({ color: 0xfef08a, emissive: 0xfacc15, emissiveIntensity: 0.8 })
    };
  }

  let _unitBox = null;
  function getUnitBox() {
    if (!_unitBox) _unitBox = new THREE.BoxGeometry(1, 1, 1);
    return _unitBox;
  }

  function addBox(parent, w, h, d, x, y, z, color, opts = {}) {
    const mat = opts.emissive
      ? new THREE.MeshStandardMaterial({
          color,
          emissive: opts.emissive,
          emissiveIntensity: opts.emissiveIntensity || 0.75,
          roughness: 0.4
        })
      : new THREE.MeshLambertMaterial({ color });
    const mesh = new THREE.Mesh(getUnitBox(), mat);
    mesh.scale.set(w, h, d);
    mesh.position.set(x, y, z);
    mesh.castShadow = opts.castShadow !== false;
    mesh.receiveShadow = opts.receiveShadow !== false;
    parent.add(mesh);
    return mesh;
  }

  function addEyes(head, zPos, eyeY, spreadX, color = 0x0f172a, glow = false) {
    addBox(head, 0.13, 0.16, 0.06, -spreadX, eyeY, zPos, color, glow ? { emissive: color, emissiveIntensity: 0.9 } : {});
    addBox(head, 0.13, 0.16, 0.06,  spreadX, eyeY, zPos, color, glow ? { emissive: color, emissiveIntensity: 0.9 } : {});
    if (!glow) {
      addBox(head, 0.05, 0.06, 0.07, -spreadX + 0.025, eyeY + 0.03, zPos + 0.01, 0xffffff);
      addBox(head, 0.05, 0.06, 0.07,  spreadX + 0.025, eyeY + 0.03, zPos + 0.01, 0xffffff);
    }
  }

  // ================================================================
  // ALL 17 FAMOUS POKÉMON 3D VOXEL BUILDERS
  // ================================================================
  function buildPokemonMesh(speciesId) {
    const root = new THREE.Group();
    const anim = { legs: [], extras: [], wingsL: [], wingsR: [], floatMode: false };

    switch (speciesId) {
      // ---------- 1. CHARMANDER ----------
      case 'charmander': {
        addBox(root, 0.62, 0.66, 0.56, 0, 0.62, 0, 0xf97316); // Body
        addBox(root, 0.44, 0.50, 0.14, 0, 0.58, 0.25, 0xfef3c7); // Cream belly
        const head = new THREE.Group();
        head.position.set(0, 1.16, 0.08);
        addBox(head, 0.56, 0.50, 0.58, 0, 0, 0, 0xf97316);
        addBox(head, 0.36, 0.22, 0.22, 0, -0.08, 0.32, 0xf97316); // Snout
        addEyes(head, 0.30, 0.05, 0.16);
        root.add(head);
        anim.legs.push(addBox(root, 0.22, 0.34, 0.24, -0.20, 0.17, 0.02, 0xea580c));
        anim.legs.push(addBox(root, 0.22, 0.34, 0.24,  0.20, 0.17, 0.02, 0xea580c));
        addBox(root, 0.16, 0.32, 0.16, -0.38, 0.72, 0.12, 0xf97316); // Arms
        addBox(root, 0.16, 0.32, 0.16,  0.38, 0.72, 0.12, 0xf97316);
        const tail = new THREE.Group();
        tail.position.set(0, 0.42, -0.32);
        addBox(tail, 0.20, 0.20, 0.46, 0, 0.06, -0.22, 0xf97316);
        addBox(tail, 0.22, 0.26, 0.22, 0, 0.28, -0.46, 0xef4444, { emissive: 0xea580c, emissiveIntensity: 0.9 });
        addBox(tail, 0.14, 0.20, 0.14, 0, 0.46, -0.46, 0xfef08a, { emissive: 0xfacc15, emissiveIntensity: 1.0 });
        root.add(tail);
        anim.extras.push({ obj: tail, type: 'wag' });
        break;
      }

      // ---------- 2. CHARMELEON ----------
      case 'charmeleon': {
        addBox(root, 0.74, 0.84, 0.64, 0, 0.76, 0, 0xdc2626);
        addBox(root, 0.50, 0.64, 0.14, 0, 0.72, 0.29, 0xfef3c7);
        const head = new THREE.Group();
        head.position.set(0, 1.42, 0.10);
        addBox(head, 0.60, 0.52, 0.68, 0, 0, 0, 0xdc2626);
        addBox(head, 0.38, 0.24, 0.28, 0, -0.08, 0.38, 0xdc2626);
        addBox(head, 0.18, 0.22, 0.32, 0, 0.26, -0.32, 0xb91c1c); // Head horn
        addEyes(head, 0.34, 0.06, 0.18, 0x0f172a);
        root.add(head);
        anim.legs.push(addBox(root, 0.26, 0.42, 0.28, -0.24, 0.21, 0.02, 0xb91c1c));
        anim.legs.push(addBox(root, 0.26, 0.42, 0.28,  0.24, 0.21, 0.02, 0xb91c1c));
        addBox(root, 0.18, 0.42, 0.20, -0.46, 0.88, 0.16, 0xdc2626);
        addBox(root, 0.18, 0.42, 0.20,  0.46, 0.88, 0.16, 0xdc2626);
        const tail = new THREE.Group();
        tail.position.set(0, 0.52, -0.36);
        addBox(tail, 0.24, 0.22, 0.62, 0, 0.08, -0.30, 0xdc2626);
        addBox(tail, 0.30, 0.36, 0.30, 0, 0.36, -0.62, 0xf97316, { emissive: 0xea580c, emissiveIntensity: 0.95 });
        addBox(tail, 0.18, 0.28, 0.18, 0, 0.62, -0.62, 0xfef08a, { emissive: 0xfacc15, emissiveIntensity: 1.0 });
        root.add(tail);
        anim.extras.push({ obj: tail, type: 'wag' });
        break;
      }

      // ---------- 3. CHARIZARD (EPIC WINGS + FIRE TAIL) ----------
      case 'charizard': {
        addBox(root, 1.02, 1.12, 0.86, 0, 1.02, 0, 0xf97316); // Massive orange torso
        addBox(root, 0.72, 0.86, 0.18, 0, 0.96, 0.38, 0xfef08a); // Cream belly
        addBox(root, 0.38, 0.44, 0.38, 0, 1.72, 0.12, 0xf97316); // Neck
        const head = new THREE.Group();
        head.position.set(0, 2.06, 0.22);
        addBox(head, 0.66, 0.52, 0.76, 0, 0, 0, 0xf97316);
        addBox(head, 0.44, 0.26, 0.38, 0, -0.08, 0.44, 0xea580c); // Dragon snout
        // Twin horns
        addBox(head, 0.14, 0.20, 0.42, -0.22, 0.28, -0.36, 0xea580c);
        addBox(head, 0.14, 0.20, 0.42,  0.22, 0.28, -0.36, 0xea580c);
        addEyes(head, 0.38, 0.08, 0.20, 0x38bdf8, true);
        root.add(head);
        // Legs & Claws
        anim.legs.push(addBox(root, 0.34, 0.54, 0.38, -0.34, 0.27, 0.04, 0xea580c));
        anim.legs.push(addBox(root, 0.34, 0.54, 0.38,  0.34, 0.27, 0.04, 0xea580c));
        addBox(root, 0.20, 0.46, 0.22, -0.60, 1.18, 0.22, 0xf97316);
        addBox(root, 0.20, 0.46, 0.22,  0.60, 1.18, 0.22, 0xf97316);
        // Giant Dragon Wings (Orange outer, Teal inner!)
        const wingL = new THREE.Group();
        wingL.position.set(-0.50, 1.38, -0.32);
        addBox(wingL, 1.25, 0.92, 0.12, -0.65, 0.36, -0.14, 0x0d9488);
        addBox(wingL, 1.34, 0.18, 0.18, -0.66, 0.84, -0.14, 0xf97316);
        root.add(wingL);
        anim.wingsL.push(wingL);

        const wingR = new THREE.Group();
        wingR.position.set(0.50, 1.38, -0.32);
        addBox(wingR, 1.25, 0.92, 0.12, 0.65, 0.36, -0.14, 0x0d9488);
        addBox(wingR, 1.34, 0.18, 0.18, 0.66, 0.84, -0.14, 0xf97316);
        root.add(wingR);
        anim.wingsR.push(wingR);

        // Long Blazing Tail
        const tail = new THREE.Group();
        tail.position.set(0, 0.62, -0.46);
        addBox(tail, 0.30, 0.28, 0.88, 0, 0.06, -0.42, 0xf97316);
        addBox(tail, 0.38, 0.46, 0.38, 0, 0.42, -0.92, 0xef4444, { emissive: 0xea580c, emissiveIntensity: 1.0 });
        addBox(tail, 0.24, 0.36, 0.24, 0, 0.76, -0.92, 0xfef08a, { emissive: 0xfacc15, emissiveIntensity: 1.0 });
        root.add(tail);
        anim.extras.push({ obj: tail, type: 'wag' });
        break;
      }

      // ---------- 4. BULBASAUR ----------
      case 'bulbasaur': {
        addBox(root, 0.82, 0.48, 0.92, 0, 0.46, 0, 0x2dd4bf); // Teal body
        // Green Bulb on back
        addBox(root, 0.66, 0.46, 0.66, 0, 0.86, -0.08, 0x16a34a);
        addBox(root, 0.40, 0.26, 0.40, 0, 1.16, -0.08, 0x15803d);
        // Head
        const head = new THREE.Group();
        head.position.set(0, 0.56, 0.56);
        addBox(head, 0.66, 0.48, 0.48, 0, 0, 0, 0x2dd4bf);
        addBox(head, 0.16, 0.16, 0.12, -0.24, 0.28, -0.04, 0x0d9488);
        addBox(head, 0.16, 0.16, 0.12,  0.24, 0.28, -0.04, 0x0d9488);
        addEyes(head, 0.25, 0.04, 0.18, 0xdc2626, true);
        root.add(head);
        [[-0.30, 0.30], [0.30, 0.30], [-0.30, -0.32], [0.30, -0.32]].forEach(([x, z]) => {
          anim.legs.push(addBox(root, 0.22, 0.32, 0.22, x, 0.16, z, 0x14b8a6));
        });
        break;
      }

      // ---------- 5. IVYSAUR ----------
      case 'ivysaur': {
        addBox(root, 0.96, 0.58, 1.08, 0, 0.56, 0, 0x14b8a6);
        // Leaf collar + Pink Flower Bud
        addBox(root, 1.12, 0.14, 1.06, 0, 0.92, -0.06, 0x15803d);
        const bud = new THREE.Group();
        bud.position.set(0, 1.18, -0.08);
        addBox(bud, 0.58, 0.44, 0.58, 0, 0, 0, 0xec4899, { emissive: 0xdb2777, emissiveIntensity: 0.3 });
        addBox(bud, 0.34, 0.26, 0.34, 0, 0.32, 0, 0xf472b6);
        root.add(bud);
        anim.extras.push({ obj: bud, type: 'spin' });
        const head = new THREE.Group();
        head.position.set(0, 0.68, 0.64);
        addBox(head, 0.74, 0.52, 0.54, 0, 0, 0, 0x14b8a6);
        addEyes(head, 0.28, 0.05, 0.20, 0xef4444, true);
        root.add(head);
        [[-0.36, 0.36], [0.36, 0.36], [-0.36, -0.36], [0.36, -0.36]].forEach(([x, z]) => {
          anim.legs.push(addBox(root, 0.26, 0.38, 0.26, x, 0.19, z, 0x0d9488));
        });
        break;
      }

      // ---------- 6. VENUSAUR (GIANT BLOOMING FLOWER) ----------
      case 'venusaur': {
        addBox(root, 1.32, 0.76, 1.42, 0, 0.72, 0, 0x0d9488);
        // Palm Tree Trunk + Giant Tropical Flower on back!
        addBox(root, 0.42, 0.56, 0.42, 0, 1.32, -0.10, 0x92400e);
        const flower = new THREE.Group();
        flower.position.set(0, 1.66, -0.10);
        addBox(flower, 1.60, 0.16, 1.60, 0, -0.14, 0, 0x16a34a); // Huge palm leaves
        addBox(flower, 0.48, 0.28, 0.48, 0, 0.14, 0, 0xfacc15, { emissive: 0xeab308, emissiveIntensity: 0.6 });
        addBox(flower, 0.62, 0.20, 0.56, -0.56, 0.08, 0, 0xf43f5e);
        addBox(flower, 0.62, 0.20, 0.56,  0.56, 0.08, 0, 0xf43f5e);
        addBox(flower, 0.56, 0.20, 0.62, 0, 0.08, -0.56, 0xf43f5e);
        addBox(flower, 0.56, 0.20, 0.62, 0, 0.08,  0.56, 0xf43f5e);
        root.add(flower);
        anim.extras.push({ obj: flower, type: 'spin' });
        const head = new THREE.Group();
        head.position.set(0, 0.82, 0.84);
        addBox(head, 0.94, 0.64, 0.66, 0, 0, 0, 0x14b8a6);
        addEyes(head, 0.34, 0.08, 0.26, 0xef4444, true);
        root.add(head);
        [[-0.48, 0.48], [0.48, 0.48], [-0.48, -0.48], [0.48, -0.48]].forEach(([x, z]) => {
          anim.legs.push(addBox(root, 0.34, 0.48, 0.34, x, 0.24, z, 0x0f766e));
        });
        break;
      }

      // ---------- 7. SQUIRTLE ----------
      case 'squirtle': {
        addBox(root, 0.66, 0.68, 0.44, 0, 0.64, 0.06, 0x38bdf8); // Blue torso
        addBox(root, 0.52, 0.56, 0.14, 0, 0.62, 0.26, 0xfef08a); // Yellow belly
        addBox(root, 0.72, 0.72, 0.36, 0, 0.66, -0.22, 0x92400e); // Brown shell
        const head = new THREE.Group();
        head.position.set(0, 1.18, 0.10);
        addBox(head, 0.56, 0.52, 0.54, 0, 0, 0, 0x38bdf8);
        addEyes(head, 0.28, 0.05, 0.15);
        root.add(head);
        anim.legs.push(addBox(root, 0.22, 0.34, 0.24, -0.20, 0.17, 0.04, 0x0ea5e9));
        anim.legs.push(addBox(root, 0.22, 0.34, 0.24,  0.20, 0.17, 0.04, 0x0ea5e9));
        const tail = addBox(root, 0.26, 0.32, 0.36, 0, 0.42, -0.52, 0x7dd3fc);
        anim.extras.push({ obj: tail, type: 'wag' });
        break;
      }

      // ---------- 8. WARTORTLE ----------
      case 'wartortle': {
        addBox(root, 0.78, 0.84, 0.52, 0, 0.78, 0.06, 0x2563eb);
        addBox(root, 0.58, 0.68, 0.14, 0, 0.76, 0.30, 0xfef3c7);
        addBox(root, 0.84, 0.86, 0.40, 0, 0.80, -0.24, 0x78350f);
        const head = new THREE.Group();
        head.position.set(0, 1.40, 0.12);
        addBox(head, 0.62, 0.56, 0.58, 0, 0, 0, 0x3b82f6);
        addBox(head, 0.18, 0.28, 0.32, -0.36, 0.14, -0.10, 0xe0f2fe); // Fluffy ear L
        addBox(head, 0.18, 0.28, 0.32,  0.36, 0.14, -0.10, 0xe0f2fe); // Fluffy ear R
        addEyes(head, 0.30, 0.05, 0.17);
        root.add(head);
        anim.legs.push(addBox(root, 0.26, 0.42, 0.28, -0.24, 0.21, 0.04, 0x1d4ed8));
        anim.legs.push(addBox(root, 0.26, 0.42, 0.28,  0.24, 0.21, 0.04, 0x1d4ed8));
        const tail = addBox(root, 0.38, 0.46, 0.52, 0, 0.52, -0.62, 0xe0f2fe);
        anim.extras.push({ obj: tail, type: 'wag' });
        break;
      }

      // ---------- 9. BLASTOISE (DUAL WATER CANNONS!) ----------
      case 'blastoise': {
        addBox(root, 1.14, 1.12, 0.74, 0, 1.02, 0.08, 0x1d4ed8);
        addBox(root, 0.84, 0.90, 0.18, 0, 0.98, 0.42, 0xfef3c7);
        addBox(root, 1.24, 1.18, 0.54, 0, 1.04, -0.32, 0x78350f); // Massive shell
        // Dual Steel Water Cannons!
        addBox(root, 0.24, 0.24, 0.66, -0.44, 1.66, -0.06, 0x94a3b8);
        addBox(root, 0.16, 0.16, 0.12, -0.44, 1.66,  0.28, 0x38bdf8, { emissive: 0x0ea5e9, emissiveIntensity: 0.9 });
        addBox(root, 0.24, 0.24, 0.66,  0.44, 1.66, -0.06, 0x94a3b8);
        addBox(root, 0.16, 0.16, 0.12,  0.44, 1.66,  0.28, 0x38bdf8, { emissive: 0x0ea5e9, emissiveIntensity: 0.9 });
        const head = new THREE.Group();
        head.position.set(0, 1.78, 0.24);
        addBox(head, 0.70, 0.56, 0.62, 0, 0, 0, 0x2563eb);
        addEyes(head, 0.32, 0.06, 0.18);
        root.add(head);
        anim.legs.push(addBox(root, 0.36, 0.52, 0.40, -0.38, 0.26, 0.04, 0x1e40af));
        anim.legs.push(addBox(root, 0.36, 0.52, 0.40,  0.38, 0.26, 0.04, 0x1e40af));
        addBox(root, 0.26, 0.52, 0.28, -0.68, 1.08, 0.18, 0x2563eb);
        addBox(root, 0.26, 0.52, 0.28,  0.68, 1.08, 0.18, 0x2563eb);
        break;
      }

      // ---------- 10. PIKACHU ----------
      case 'pikachu': {
        addBox(root, 0.62, 0.62, 0.56, 0, 0.56, 0, 0xfacc15); // Yellow body
        addBox(root, 0.64, 0.10, 0.14, 0, 0.68, -0.24, 0x78350f); // Brown stripe 1
        addBox(root, 0.64, 0.10, 0.14, 0, 0.46, -0.24, 0x78350f); // Brown stripe 2
        const head = new THREE.Group();
        head.position.set(0, 1.06, 0.08);
        addBox(head, 0.62, 0.54, 0.54, 0, 0, 0, 0xfde047);
        // Red electric cheeks
        addBox(head, 0.13, 0.13, 0.08, -0.28, -0.08, 0.25, 0xef4444, { emissive: 0xef4444, emissiveIntensity: 0.75 });
        addBox(head, 0.13, 0.13, 0.08,  0.28, -0.08, 0.25, 0xef4444, { emissive: 0xef4444, emissiveIntensity: 0.75 });
        // Tall black-tipped ears
        addBox(head, 0.14, 0.38, 0.12, -0.22, 0.42, 0, 0xfacc15);
        addBox(head, 0.14, 0.18, 0.12, -0.22, 0.68, 0, 0x0f172a);
        addBox(head, 0.14, 0.38, 0.12,  0.22, 0.42, 0, 0xfacc15);
        addBox(head, 0.14, 0.18, 0.12,  0.22, 0.68, 0, 0x0f172a);
        addEyes(head, 0.28, 0.05, 0.15);
        root.add(head);
        anim.legs.push(addBox(root, 0.18, 0.28, 0.22, -0.20, 0.14, 0.04, 0xeab308));
        anim.legs.push(addBox(root, 0.18, 0.28, 0.22,  0.20, 0.14, 0.04, 0xeab308));
        // Classic Zigzag Lightning Tail
        const tail = new THREE.Group();
        tail.position.set(0, 0.50, -0.32);
        addBox(tail, 0.10, 0.22, 0.22, 0, 0.08, -0.10, 0x78350f);
        addBox(tail, 0.10, 0.24, 0.26, 0, 0.26, -0.26, 0xfacc15, { emissive: 0xeab308, emissiveIntensity: 0.65 });
        addBox(tail, 0.10, 0.36, 0.30, 0, 0.52, -0.44, 0xfef08a, { emissive: 0xfacc15, emissiveIntensity: 0.9 });
        root.add(tail);
        anim.extras.push({ obj: tail, type: 'wag' });
        break;
      }

      // ---------- 11. RAICHU ----------
      case 'raichu': {
        addBox(root, 0.78, 0.82, 0.68, 0, 0.74, 0, 0xf97316); // Orange body
        addBox(root, 0.56, 0.60, 0.16, 0, 0.72, 0.30, 0xfef9c3); // White belly
        const head = new THREE.Group();
        head.position.set(0, 1.36, 0.08);
        addBox(head, 0.70, 0.60, 0.60, 0, 0, 0, 0xfb923c);
        // Glowing yellow electric cheeks
        addBox(head, 0.15, 0.15, 0.08, -0.32, -0.08, 0.28, 0xfacc15, { emissive: 0xfacc15, emissiveIntensity: 0.95 });
        addBox(head, 0.15, 0.15, 0.08,  0.32, -0.08, 0.28, 0xfacc15, { emissive: 0xfacc15, emissiveIntensity: 0.95 });
        // Curled dark-brown ears with yellow inside
        addBox(head, 0.24, 0.42, 0.14, -0.36, 0.42, 0, 0x78350f);
        addBox(head, 0.24, 0.42, 0.14,  0.36, 0.42, 0, 0x78350f);
        addBox(head, 0.14, 0.20, 0.16, -0.36, 0.36, 0.02, 0xfacc15);
        addBox(head, 0.14, 0.20, 0.16,  0.36, 0.36, 0.02, 0xfacc15);
        addEyes(head, 0.31, 0.06, 0.18);
        root.add(head);
        anim.legs.push(addBox(root, 0.24, 0.36, 0.34, -0.26, 0.18, 0.06, 0x78350f));
        anim.legs.push(addBox(root, 0.24, 0.36, 0.34,  0.26, 0.18, 0.06, 0x78350f));
        // Long whip cord + Giant Lightning Bolt Paddle
        const tail = new THREE.Group();
        tail.position.set(0, 0.56, -0.38);
        addBox(tail, 0.10, 0.10, 0.78, 0, 0.10, -0.38, 0x451a03);
        addBox(tail, 0.12, 0.48, 0.42, 0, 0.34, -0.88, 0xfacc15, { emissive: 0xfacc15, emissiveIntensity: 1.0 });
        root.add(tail);
        anim.extras.push({ obj: tail, type: 'wag' });
        break;
      }

      // ---------- 12. DRATINI ----------
      case 'dratini': {
        addBox(root, 0.52, 0.42, 0.76, 0, 0.34, 0, 0x60a5fa);
        addBox(root, 0.38, 0.42, 0.52, 0, 0.62, 0.24, 0x60a5fa);
        addBox(root, 0.30, 0.34, 0.14, 0, 0.60, 0.48, 0xf8fafc); // White belly
        const head = new THREE.Group();
        head.position.set(0, 1.04, 0.32);
        addBox(head, 0.50, 0.46, 0.52, 0, 0, 0, 0x60a5fa);
        addBox(head, 0.34, 0.22, 0.24, 0, -0.08, 0.30, 0xf8fafc); // Cute white snout
        addBox(head, 0.22, 0.18, 0.10, -0.32, 0.10, -0.04, 0xf8fafc); // Wing ear L
        addBox(head, 0.22, 0.18, 0.10,  0.32, 0.10, -0.04, 0xf8fafc); // Wing ear R
        addEyes(head, 0.26, 0.06, 0.15);
        root.add(head);
        const tail = addBox(root, 0.32, 0.26, 0.72, 0, 0.22, -0.64, 0x3b82f6);
        anim.extras.push({ obj: tail, type: 'wag' });
        break;
      }

      // ---------- 13. DRAGONAIR ----------
      case 'dragonair': {
        anim.floatMode = true;
        const body = new THREE.Group();
        body.position.set(0, 0.85, 0);
        addBox(body, 0.46, 0.92, 0.46, 0, 0.15, 0.10, 0x3b82f6);
        addBox(body, 0.32, 0.82, 0.12, 0, 0.15, 0.30, 0xe0f2fe);
        // Glowing Cyan Neck Orb!
        addBox(body, 0.22, 0.22, 0.22, 0, 0.56, 0.34, 0x22d3ee, { emissive: 0x22d3ee, emissiveIntensity: 1.0 });
        const head = new THREE.Group();
        head.position.set(0, 0.86, 0.18);
        addBox(head, 0.52, 0.46, 0.56, 0, 0, 0, 0x3b82f6);
        addBox(head, 0.10, 0.24, 0.10, 0, 0.30, 0.12, 0xf8fafc); // Forehead horn
        addBox(head, 0.38, 0.28, 0.10, -0.40, 0.14, -0.06, 0xf8fafc);
        addBox(head, 0.38, 0.28, 0.10,  0.40, 0.14, -0.06, 0xf8fafc);
        addEyes(head, 0.29, 0.04, 0.15);
        body.add(head);
        const tail = new THREE.Group();
        tail.position.set(0, -0.28, -0.24);
        addBox(tail, 0.34, 0.30, 0.95, 0, -0.06, -0.45, 0x2563eb);
        addBox(tail, 0.24, 0.24, 0.24, 0, -0.06, -1.02, 0x22d3ee, { emissive: 0x22d3ee, emissiveIntensity: 1.0 });
        body.add(tail);
        anim.extras.push({ obj: tail, type: 'wag' });
        root.add(body);
        break;
      }

      // ---------- 14. DRAGONITE (ICONIC GOLDEN-ORANGE DRAGON!) ----------
      case 'dragonite': {
        addBox(root, 1.16, 1.24, 0.94, 0, 1.06, 0, 0xf59e0b); // Iconic plump orange body
        addBox(root, 0.84, 0.96, 0.18, 0, 1.00, 0.44, 0xfef3c7); // Cream ridged belly
        addBox(root, 0.46, 0.36, 0.46, 0, 1.80, 0.12, 0xf59e0b); // Neck
        const head = new THREE.Group();
        head.position.set(0, 2.12, 0.18);
        addBox(head, 0.68, 0.56, 0.66, 0, 0, 0, 0xf59e0b);
        addBox(head, 0.54, 0.28, 0.34, 0, -0.10, 0.40, 0xfbbf24); // Friendly rounded dragon snout
        addBox(head, 0.10, 0.22, 0.10, 0, 0.34, 0.04, 0xfef08a); // Little center horn
        // Twin golden antennae
        addBox(head, 0.08, 0.36, 0.08, -0.22, 0.40, -0.10, 0xfde047);
        addBox(head, 0.08, 0.36, 0.08,  0.22, 0.40, -0.10, 0xfde047);
        addEyes(head, 0.34, 0.08, 0.20);
        root.add(head);
        // Legs & Arms
        anim.legs.push(addBox(root, 0.38, 0.54, 0.44, -0.38, 0.27, 0.04, 0xd97706));
        anim.legs.push(addBox(root, 0.38, 0.54, 0.44,  0.38, 0.27, 0.04, 0xd97706));
        addBox(root, 0.24, 0.50, 0.24, -0.68, 1.24, 0.18, 0xf59e0b);
        addBox(root, 0.24, 0.50, 0.24,  0.68, 1.24, 0.18, 0xf59e0b);
        // Dragonite Wings (teal membrane, orange frame)
        const wL = new THREE.Group();
        wL.position.set(-0.56, 1.46, -0.36);
        addBox(wL, 1.05, 0.78, 0.12, -0.54, 0.30, -0.12, 0x0d9488);
        addBox(wL, 1.12, 0.16, 0.16, -0.55, 0.70, -0.12, 0xd97706);
        root.add(wL);
        anim.wingsL.push(wL);

        const wR = new THREE.Group();
        wR.position.set(0.56, 1.46, -0.36);
        addBox(wR, 1.05, 0.78, 0.12, 0.54, 0.30, -0.12, 0x0d9488);
        addBox(wR, 1.12, 0.16, 0.16, 0.55, 0.70, -0.12, 0xd97706);
        root.add(wR);
        anim.wingsR.push(wR);

        // Thick Dragon Tail
        const tail = addBox(root, 0.44, 0.38, 0.88, 0, 0.56, -0.78, 0xf59e0b);
        anim.extras.push({ obj: tail, type: 'wag' });
        break;
      }

      // ---------- 15. TORCHIC ----------
      case 'torchic': {
        addBox(root, 0.56, 0.54, 0.56, 0, 0.54, 0, 0xf97316); // Round chick body
        addBox(root, 0.62, 0.18, 0.62, 0, 0.74, 0, 0xfacc15); // Yellow neck fluff
        const head = new THREE.Group();
        head.position.set(0, 1.04, 0.04);
        addBox(head, 0.52, 0.48, 0.52, 0, 0, 0, 0xf97316);
        addBox(head, 0.18, 0.14, 0.22, 0, -0.06, 0.32, 0xfde047); // Cute beak
        // Flame Feather Crest
        addBox(head, 0.14, 0.32, 0.14, 0, 0.38, 0, 0xfacc15, { emissive: 0xeab308, emissiveIntensity: 0.6 });
        addBox(head, 0.12, 0.24, 0.12, -0.14, 0.32, -0.06, 0xf97316);
        addBox(head, 0.12, 0.24, 0.12,  0.14, 0.32, -0.06, 0xf97316);
        addEyes(head, 0.27, 0.05, 0.14);
        root.add(head);
        anim.legs.push(addBox(root, 0.14, 0.32, 0.18, -0.16, 0.16, 0.02, 0xfacc15));
        anim.legs.push(addBox(root, 0.14, 0.32, 0.18,  0.16, 0.16, 0.02, 0xfacc15));
        break;
      }

      // ---------- 16. COMBUSKEN ----------
      case 'combusken': {
        addBox(root, 0.68, 0.78, 0.60, 0, 0.92, 0, 0xf97316);
        addBox(root, 0.72, 0.32, 0.64, 0, 1.18, 0, 0xfacc15); // Yellow chest feathers
        const head = new THREE.Group();
        head.position.set(0, 1.56, 0.08);
        addBox(head, 0.56, 0.50, 0.54, 0, 0, 0, 0xf97316);
        addBox(head, 0.20, 0.16, 0.24, 0, -0.06, 0.34, 0xfef08a);
        addBox(head, 0.14, 0.36, 0.34, 0, 0.36, -0.06, 0xef4444); // Comb crest
        addEyes(head, 0.28, 0.06, 0.16);
        root.add(head);
        anim.legs.push(addBox(root, 0.22, 0.56, 0.24, -0.22, 0.28, 0.02, 0xdc2626));
        anim.legs.push(addBox(root, 0.22, 0.56, 0.24,  0.22, 0.28, 0.02, 0xdc2626));
        addBox(root, 0.18, 0.44, 0.18, -0.44, 1.02, 0.14, 0xf97316);
        addBox(root, 0.18, 0.44, 0.18,  0.44, 1.02, 0.14, 0xf97316);
        break;
      }

      // ---------- 17. BLAZIKEN (FIERY MARTIAL-ARTS CHAMPION!) ----------
      default: {
        // Tall Crimson Warrior Torso
        addBox(root, 0.78, 0.94, 0.58, 0, 1.24, 0, 0xdc2626);
        addBox(root, 0.60, 0.34, 0.62, 0, 1.56, 0.02, 0xfef3c7); // White-cream mane chest
        // Flowing White Crest / Hair + Yellow V-Crest Head
        const head = new THREE.Group();
        head.position.set(0, 1.98, 0.08);
        addBox(head, 0.54, 0.50, 0.54, 0, 0, 0, 0xdc2626);
        addBox(head, 0.22, 0.16, 0.26, 0, -0.08, 0.34, 0xfef08a); // Sharp beak
        // Iconic Yellow V-Horns!
        addBox(head, 0.12, 0.42, 0.12, -0.18, 0.38, 0.14, 0xfacc15, { emissive: 0xeab308, emissiveIntensity: 0.6 });
        addBox(head, 0.12, 0.42, 0.12,  0.18, 0.38, 0.14, 0xfacc15, { emissive: 0xeab308, emissiveIntensity: 0.6 });
        // Flowing White Hair Plumes behind head
        addBox(head, 0.68, 0.56, 0.36, 0, 0.04, -0.34, 0xf8fafc);
        addBox(head, 0.74, 0.44, 0.24, 0, -0.32, -0.40, 0xf1f5f9);
        addEyes(head, 0.28, 0.06, 0.15, 0x38bdf8, true);
        root.add(head);
        // Powerful Martial-Arts Legs (Red thighs, Yellow feathered shin guards)
        const legL = new THREE.Group();
        legL.position.set(-0.26, 0.76, 0);
        addBox(legL, 0.28, 0.42, 0.30, 0, -0.20, 0, 0xb91c1c);
        addBox(legL, 0.34, 0.38, 0.36, 0, -0.56, 0.02, 0xfacc15);
        root.add(legL);
        anim.legs.push(legL);

        const legR = new THREE.Group();
        legR.position.set(0.26, 0.76, 0);
        addBox(legR, 0.28, 0.42, 0.30, 0, -0.20, 0, 0xb91c1c);
        addBox(legR, 0.34, 0.38, 0.36, 0, -0.56, 0.02, 0xfacc15);
        root.add(legR);
        anim.legs.push(legR);

        // Arms with BLAZING FLAME WRISTS!
        const armL = new THREE.Group();
        armL.position.set(-0.52, 1.50, 0.10);
        addBox(armL, 0.22, 0.56, 0.22, 0, -0.22, 0.08, 0x334155);
        addBox(armL, 0.30, 0.34, 0.30, 0, -0.46, 0.20, 0xf97316, { emissive: 0xea580c, emissiveIntensity: 1.0 });
        addBox(armL, 0.20, 0.26, 0.20, 0, -0.26, 0.26, 0xfef08a, { emissive: 0xfacc15, emissiveIntensity: 1.0 });
        root.add(armL);

        const armR = new THREE.Group();
        armR.position.set(0.52, 1.50, 0.10);
        addBox(armR, 0.22, 0.56, 0.22, 0, -0.22, 0.08, 0x334155);
        addBox(armR, 0.30, 0.34, 0.30, 0, -0.46, 0.20, 0xf97316, { emissive: 0xea580c, emissiveIntensity: 1.0 });
        addBox(armR, 0.20, 0.26, 0.20, 0, -0.26, 0.26, 0xfef08a, { emissive: 0xfacc15, emissiveIntensity: 1.0 });
        root.add(armR);
        break;
      }
    }

    root.userData.animParts = anim;
    root.userData.speciesId = speciesId;
    return root;
  }

  function animatePokemon(mesh, time, speed = 0) {
    const parts = mesh.userData.animParts;
    if (!parts) return;
    const freq = speed > 0.1 ? 10 : 2.6;
    const amp = speed > 0.1 ? 0.38 : 0.05;

    parts.legs.forEach((leg, i) => {
      const phase = (i % 2 === 0 ? 1 : -1) * (i >= 2 ? -1 : 1);
      leg.rotation.x = Math.sin(time * freq) * amp * phase;
    });

    parts.wingsL.forEach((w) => {
      w.rotation.y = Math.sin(time * 4.8) * 0.32 - 0.15;
    });
    parts.wingsR.forEach((w) => {
      w.rotation.y = -Math.sin(time * 4.8) * 0.32 + 0.15;
    });

    parts.extras.forEach((ex) => {
      if (ex.type === 'wag') ex.obj.rotation.y = Math.sin(time * 5.2) * 0.34;
      else if (ex.type === 'spin') ex.obj.rotation.y = time * 1.1;
    });

    if (parts.floatMode && mesh.children[0]) {
      mesh.children[0].position.y = 0.85 + Math.sin(time * 3.0) * 0.16;
    }
  }

  // ================================================================
  // LORENZO TRAINER AVATAR
  // ================================================================
  function buildPlayerMesh() {
    const root = new THREE.Group();
    const leftLeg = new THREE.Group();
    leftLeg.position.set(-0.18, 0.64, 0);
    addBox(leftLeg, 0.26, 0.64, 0.28, 0, -0.32, 0, 0x1e293b);
    addBox(leftLeg, 0.28, 0.14, 0.34, 0, -0.58, 0.03, 0xef4444);
    root.add(leftLeg);

    const rightLeg = new THREE.Group();
    rightLeg.position.set(0.18, 0.64, 0);
    addBox(rightLeg, 0.26, 0.64, 0.28, 0, -0.32, 0, 0x1e293b);
    addBox(rightLeg, 0.28, 0.14, 0.34, 0, -0.58, 0.03, 0xef4444);
    root.add(rightLeg);

    addBox(root, 0.66, 0.72, 0.38, 0, 1.00, 0, 0x2563eb); // Trainer Jacket
    addBox(root, 0.22, 0.70, 0.40, 0, 1.00, 0, 0xf8fafc);
    addBox(root, 0.48, 0.52, 0.24, 0, 1.02, -0.30, 0x1e293b); // Backpack
    addBox(root, 0.18, 0.18, 0.08, 0, 1.04, -0.43, 0xef4444);

    const leftArm = new THREE.Group();
    leftArm.position.set(-0.46, 1.28, 0);
    addBox(leftArm, 0.22, 0.62, 0.24, 0, -0.26, 0, 0x3b82f6);
    addBox(leftArm, 0.20, 0.18, 0.22, 0, -0.56, 0, 0xfdba74);
    root.add(leftArm);

    const rightArm = new THREE.Group();
    rightArm.position.set(0.46, 1.28, 0);
    addBox(rightArm, 0.22, 0.62, 0.24, 0, -0.26, 0, 0x3b82f6);
    addBox(rightArm, 0.20, 0.18, 0.22, 0, -0.56, 0, 0xfdba74);
    root.add(rightArm);

    const head = new THREE.Group();
    head.position.set(0, 1.66, 0);
    addBox(head, 0.56, 0.54, 0.56, 0, 0, 0, 0xfdba74);
    addBox(head, 0.60, 0.24, 0.60, 0, 0.22, 0, 0xef4444); // Red Trainer Cap
    addBox(head, 0.60, 0.08, 0.30, 0, 0.12, 0.36, 0xdc2626);
    addBox(head, 0.24, 0.12, 0.06, 0, 0.24, 0.31, 0xfacc15, { emissive: 0xfacc15, emissiveIntensity: 0.7 });
    addEyes(head, 0.29, -0.02, 0.13);
    root.add(head);

    root.userData.limbs = { leftLeg, rightLeg, leftArm, rightArm, head };
    return root;
  }

  function animatePlayer(mesh, time, moveSpeed, isGrounded) {
    const limbs = mesh.userData.limbs;
    if (!limbs) return;
    if (!isGrounded) {
      limbs.leftLeg.rotation.x = 0.45;
      limbs.rightLeg.rotation.x = -0.35;
      limbs.leftArm.rotation.x = -0.7;
      limbs.rightArm.rotation.x = -0.7;
      return;
    }
    if (moveSpeed > 0.15) {
      const s = Math.sin(time * 11) * 0.65;
      limbs.leftLeg.rotation.x = s;
      limbs.rightLeg.rotation.x = -s;
      limbs.leftArm.rotation.x = -s * 0.85;
      limbs.rightArm.rotation.x = s * 0.85;
    } else {
      limbs.leftLeg.rotation.x *= 0.82;
      limbs.rightLeg.rotation.x *= 0.82;
      limbs.leftArm.rotation.x = Math.sin(time * 2.2) * 0.06;
      limbs.rightArm.rotation.x = -Math.sin(time * 2.2) * 0.06;
    }
  }

  function buildPokeCuboMesh(isUltra = false) {
    const g = new THREE.Group();
    const topCol = isUltra ? 0x1e293b : 0xef4444;
    const bandCol = isUltra ? 0xfacc15 : 0x0f172a;
    const btnCol = isUltra ? 0xfacc15 : 0x22d3ee;
    addBox(g, 0.52, 0.22, 0.52, 0,  0.14, 0, topCol);
    addBox(g, 0.54, 0.08, 0.54, 0,  0.00, 0, bandCol);
    addBox(g, 0.52, 0.22, 0.52, 0, -0.14, 0, 0xf8fafc);
    addBox(g, 0.16, 0.16, 0.08, 0,  0.00, 0.27, btnCol, { emissive: btnCol, emissiveIntensity: 1.0 });
    return g;
  }

  function buildNameplateSprite(name, level, type, isPartner = false) {
    const canvas = document.createElement('canvas');
    canvas.width = 340;
    canvas.height = 96;
    const ctx = canvas.getContext('2d');
    const color = isPartner ? '#facc15' : (global.L2Data.TYPE_COLORS[type] || '#22d3ee');
    const label = isPartner ? 'SEU PARCEIRO • Aperte E p/ Evoluir' : ((global.L2Data.TYPE_LABELS[type] || type).toUpperCase() + ' • Clique p/ batalhar');

    ctx.fillStyle = 'rgba(10, 15, 30, 0.84)';
    roundRect(ctx, 10, 10, 320, 76, 18);
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = color;
    ctx.stroke();

    ctx.fillStyle = color;
    roundRect(ctx, 22, 22, 16, 52, 6);
    ctx.fill();

    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 28px Outfit, Arial, sans-serif';
    ctx.fillText(name, 48, 48);

    ctx.fillStyle = '#facc15';
    ctx.font = 'bold 23px Orbitron, Arial, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('Nv.' + level, 314, 48);

    ctx.textAlign = 'left';
    ctx.fillStyle = '#cbd5e1';
    ctx.font = 'bold 15px Outfit, Arial, sans-serif';
    ctx.fillText(label, 48, 72);

    const tex = new THREE.CanvasTexture(canvas);
    tex.minFilter = THREE.LinearFilter;
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true }));
    sprite.scale.set(2.9, 0.84, 1);
    return sprite;
  }

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  function buildTargetRing(color = 0xfacc15) {
    const geo = new THREE.RingGeometry(0.9, 1.15, 24);
    const mat = new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide, transparent: true, opacity: 0.9 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.rotation.x = -Math.PI / 2;
    return mesh;
  }

  global.L2Voxels = {
    createCityMaterials,
    buildPokemonMesh,
    animatePokemon,
    buildPlayerMesh,
    animatePlayer,
    buildPokeCuboMesh,
    buildNameplateSprite,
    buildTargetRing
  };
})(window);
