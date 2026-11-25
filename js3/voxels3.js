/* ================================================================
   LORENZO GAME 3 — All 24 Voxel Pokémon + Megas + Power Orbs
   ================================================================ */
(function (global) {
  'use strict';

  function seededHash(x, y, s) {
    const n = Math.sin(x * 127.1 + y * 311.7 + s * 74.7) * 43758.5453123;
    return n - Math.floor(n);
  }

  function makePixelTex(drawFn) {
    const c = document.createElement('canvas');
    c.width = 16; c.height = 16;
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
      ctx.fillRect(0, 7, 16, 1); ctx.fillRect(7, 0, 1, 8);
    });
    const roadTex = makePixelTex((ctx) => {
      fillSpeckle(ctx, ['#e2e8f0', '#cbd5e1', '#d8b4fe', '#cbd5e1'], 11);
      ctx.fillStyle = 'rgba(30,41,59,0.2)';
      ctx.fillRect(0, 0, 16, 1); ctx.fillRect(0, 8, 16, 1);
    });
    const waterTex = makePixelTex((ctx) => {
      fillSpeckle(ctx, ['#1fb6f2', '#26c2ff', '#169fd9', '#38ccf8'], 5);
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.fillRect(2, 3, 5, 1); ctx.fillRect(9, 11, 5, 1);
    });
    const lavaTex = makePixelTex((ctx) => {
      fillSpeckle(ctx, ['#ea580c', '#f97316', '#dc2626', '#facc15'], 13);
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(3, 4, 4, 2); ctx.fillRect(10, 10, 4, 2);
    });
    const obsidianTex = makePixelTex((ctx) => fillSpeckle(ctx, ['#1e293b', '#273449', '#0f172a', '#334155'], 14));
    const woodTex     = makePixelTex((ctx) => fillSpeckle(ctx, ['#6b4423', '#5c381b', '#7a4f2a'], 6));
    const leavesTex   = makePixelTex((ctx) => fillSpeckle(ctx, ['#2d8a3e', '#38a64c', '#237032', '#47bf5c'], 7));
    const wallTex     = makePixelTex((ctx) => fillSpeckle(ctx, ['#f8fafc', '#e2e8f0', '#fef3c7'], 15));
    const roofRedTex  = makePixelTex((ctx) => fillSpeckle(ctx, ['#dc2626', '#ef4444', '#b91c1c'], 16));
    const roofBlueTex = makePixelTex((ctx) => fillSpeckle(ctx, ['#0284c7', '#0ea5e9', '#0369a1'], 17));
    const roofGoldTex = makePixelTex((ctx) => fillSpeckle(ctx, ['#d97706', '#f59e0b', '#fbbf24'], 18));
    const roofPurpTex = makePixelTex((ctx) => fillSpeckle(ctx, ['#7c3aed', '#9333ea', '#6d28d9'], 23));
    const neonRoadTex = makePixelTex((ctx) => {
      fillSpeckle(ctx, ['#0f172a', '#1e1b4b', '#172033'], 19);
      ctx.fillStyle = '#e879f9'; ctx.fillRect(0, 7, 16, 2);
    });
    const neonTowerTex = makePixelTex((ctx) => {
      fillSpeckle(ctx, ['#1e1b4b', '#312e81', '#1e293b'], 20);
      ctx.fillStyle = '#22d3ee'; ctx.fillRect(2, 3, 4, 3); ctx.fillRect(10, 3, 4, 3);
      ctx.fillStyle = '#f472b6'; ctx.fillRect(2, 10, 4, 3); ctx.fillRect(10, 10, 4, 3);
    });
    const marbleTex = makePixelTex((ctx) => {
      fillSpeckle(ctx, ['#f5f3ff', '#e0e7ff', '#f8fafc'], 21);
      ctx.fillStyle = 'rgba(232,121,249,0.5)'; ctx.fillRect(0, 14, 16, 2);
    });

    const gs = new THREE.MeshLambertMaterial({ map: grassSide });
    const gt = new THREE.MeshLambertMaterial({ map: grassTop });
    const dt = new THREE.MeshLambertMaterial({ map: dirtTex });

    return {
      grass: [gs, gs, gt, dt, gs, gs],
      dirt: dt,
      stone: new THREE.MeshLambertMaterial({ map: stoneTex }),
      road: new THREE.MeshLambertMaterial({ map: roadTex }),
      water: new THREE.MeshLambertMaterial({ map: waterTex, transparent: true, opacity: 0.78 }),
      lava: new THREE.MeshStandardMaterial({ map: lavaTex, emissive: 0xea580c, emissiveIntensity: 0.9 }),
      obsidian: new THREE.MeshLambertMaterial({ map: obsidianTex }),
      wood: new THREE.MeshLambertMaterial({ map: woodTex }),
      leaves: new THREE.MeshLambertMaterial({ map: leavesTex }),
      wall: new THREE.MeshLambertMaterial({ map: wallTex }),
      roofRed: new THREE.MeshLambertMaterial({ map: roofRedTex }),
      roofBlue: new THREE.MeshLambertMaterial({ map: roofBlueTex }),
      roofGold: new THREE.MeshLambertMaterial({ map: roofGoldTex }),
      roofPurple: new THREE.MeshLambertMaterial({ map: roofPurpTex }),
      neonRoad: new THREE.MeshStandardMaterial({ map: neonRoadTex, emissive: 0xa21caf, emissiveIntensity: 0.45 }),
      neonTower: new THREE.MeshStandardMaterial({ map: neonTowerTex, emissive: 0x3b82f6, emissiveIntensity: 0.45 }),
      marble: new THREE.MeshLambertMaterial({ map: marbleTex }),
      windowGlow: new THREE.MeshStandardMaterial({ color: 0xfef08a, emissive: 0xfacc15, emissiveIntensity: 0.85 })
    };
  }

  let _unitBox = null;
  function getUnitBox() { if (!_unitBox) _unitBox = new THREE.BoxGeometry(1, 1, 1); return _unitBox; }

  function addBox(parent, w, h, d, x, y, z, color, opts = {}) {
    const mat = opts.emissive
      ? new THREE.MeshStandardMaterial({ color, emissive: opts.emissive, emissiveIntensity: opts.emissiveIntensity || 0.85, roughness: 0.35 })
      : new THREE.MeshLambertMaterial({ color });
    const m = new THREE.Mesh(getUnitBox(), mat);
    m.scale.set(w, h, d);
    m.position.set(x, y, z);
    m.castShadow = opts.castShadow !== false;
    m.receiveShadow = opts.receiveShadow !== false;
    parent.add(m);
    return m;
  }

  function addEyes(head, zPos, eyeY, spreadX, color = 0x0f172a, glow = false) {
    addBox(head, 0.13, 0.16, 0.06, -spreadX, eyeY, zPos, color, glow ? { emissive: color, emissiveIntensity: 1.0 } : {});
    addBox(head, 0.13, 0.16, 0.06,  spreadX, eyeY, zPos, color, glow ? { emissive: color, emissiveIntensity: 1.0 } : {});
    if (!glow) {
      addBox(head, 0.05, 0.06, 0.07, -spreadX + 0.025, eyeY + 0.03, zPos + 0.01, 0xffffff);
      addBox(head, 0.05, 0.06, 0.07,  spreadX + 0.025, eyeY + 0.03, zPos + 0.01, 0xffffff);
    }
  }

  // Prismatic Mega Helix Aura added automatically to every Mega Evolution!
  function attachMegaAura(root, anim, color1 = 0xe879f9, color2 = 0x22d3ee) {
    const auraGroup = new THREE.Group();
    const ringGeo = new THREE.RingGeometry(1.05, 1.25, 24);
    const ringMat = new THREE.MeshBasicMaterial({ color: color1, side: THREE.DoubleSide, transparent: true, opacity: 0.72 });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.08;
    auraGroup.add(ring);

    // Floating orbiting Mega crystals
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2;
      addBox(auraGroup, 0.16, 0.28, 0.16, Math.cos(a) * 1.15, 0.9 + (i % 2) * 0.45, Math.sin(a) * 1.15, i % 2 === 0 ? color1 : color2, {
        emissive: i % 2 === 0 ? color1 : color2,
        emissiveIntensity: 1.0,
        castShadow: false
      });
    }
    root.add(auraGroup);
    anim.extras.push({ obj: auraGroup, type: 'spin' });
  }

  // ================================================================
  // ALL 24 VOXEL POKÉMON BUILDERS (INCLUDING 10 EPIC MEGAS!)
  // ================================================================
  function buildPokemonMesh(speciesId) {
    const root = new THREE.Group();
    const anim = { legs: [], extras: [], wingsL: [], wingsR: [], floatMode: false };
    const isMega = speciesId.startsWith('mega');

    switch (speciesId) {
      // ---------- MIRAIDON & MEGA MIRAIDON APEX (GEN 9 CYBER DRAGON!) ----------
      case 'miraidon':
      case 'megamiraidon': {
        anim.floatMode = true;
        const body = new THREE.Group();
        body.position.set(0, 0.95, 0);
        const mainPurple = isMega ? 0x581c87 : 0x6d28d9;
        const cyanGlow   = isMega ? 0xfacc15 : 0x22d3ee;
        // Sleek Futuristic Cyber-Dragon Torso & Wheel-Chest Core
        addBox(body, 0.76, 0.72, 1.35, 0, 0.12, 0, mainPurple);
        addBox(body, 0.86, 0.56, 0.48, 0, 0.16, 0.34, 0x334155); // Chest plasma wheel
        addBox(body, 0.90, 0.26, 0.34, 0, 0.16, 0.34, cyanGlow, { emissive: cyanGlow, emissiveIntensity: 1.0 });
        // Curved Neck + Pixel Visor Head!
        addBox(body, 0.38, 0.65, 0.38, 0, 0.68, 0.46, mainPurple);
        const head = new THREE.Group();
        head.position.set(0, 1.12, 0.60);
        addBox(head, 0.58, 0.46, 0.76, 0, 0, 0, mainPurple);
        addBox(head, 0.60, 0.16, 0.24, 0, 0.04, 0.32, 0x0f172a); // Digital visor
        addBox(head, 0.16, 0.10, 0.06, -0.16, 0.04, 0.45, cyanGlow, { emissive: cyanGlow, emissiveIntensity: 1.0 });
        addBox(head, 0.16, 0.10, 0.06,  0.16, 0.04, 0.45, cyanGlow, { emissive: cyanGlow, emissiveIntensity: 1.0 });
        // Twin Lightning Antennae Horns!
        addBox(head, 0.12, 0.56, 0.14, -0.26, 0.42, -0.18, 0xfacc15, { emissive: 0xfacc15, emissiveIntensity: 0.9 });
        addBox(head, 0.12, 0.56, 0.14,  0.26, 0.42, -0.18, 0xfacc15, { emissive: 0xfacc15, emissiveIntensity: 0.9 });
        body.add(head);
        // Dual Cyber Jet Thrusters on Back/Legs!
        addBox(body, 0.26, 0.26, 0.66, -0.46, 0.08, -0.56, 0x1e293b);
        addBox(body, 0.20, 0.20, 0.36, -0.46, 0.08, -0.96, 0x22d3ee, { emissive: 0x22d3ee, emissiveIntensity: 1.0 });
        addBox(body, 0.26, 0.26, 0.66,  0.46, 0.08, -0.56, 0x1e293b);
        addBox(body, 0.20, 0.20, 0.36,  0.46, 0.08, -0.96, 0x22d3ee, { emissive: 0x22d3ee, emissiveIntensity: 1.0 });
        // Plasma Energy Wings (HUGE on Mega Miraidon!)
        const wSpan = isMega ? 1.45 : 0.85;
        const wL = new THREE.Group(); wL.position.set(-0.42, 0.36, -0.12);
        addBox(wL, wSpan, 0.18, 0.45, -wSpan * 0.5, 0.15, -0.1, 0x22d3ee, { emissive: 0x22d3ee, emissiveIntensity: 0.95 });
        if (isMega) addBox(wL, wSpan * 0.8, 0.14, 0.32, -wSpan * 0.45, 0.42, -0.2, 0xfacc15, { emissive: 0xfacc15, emissiveIntensity: 1.0 });
        body.add(wL); anim.wingsL.push(wL);

        const wR = new THREE.Group(); wR.position.set(0.42, 0.36, -0.12);
        addBox(wR, wSpan, 0.18, 0.45, wSpan * 0.5, 0.15, -0.1, 0x22d3ee, { emissive: 0x22d3ee, emissiveIntensity: 0.95 });
        if (isMega) addBox(wR, wSpan * 0.8, 0.14, 0.32, wSpan * 0.45, 0.42, -0.2, 0xfacc15, { emissive: 0xfacc15, emissiveIntensity: 1.0 });
        body.add(wR); anim.wingsR.push(wR);

        // Glowing Electric Tail
        const tail = addBox(body, 0.26, 0.24, 0.95, 0, 0.04, -1.02, 0x7c3aed, { emissive: 0x22d3ee, emissiveIntensity: 0.6 });
        anim.extras.push({ obj: tail, type: 'wag' });
        root.add(body);
        if (isMega) { root.scale.setScalar(1.18); attachMegaAura(root, anim, 0x22d3ee, 0xfacc15); }
        break;
      }

      // ---------- KORAIDON & MEGA KORAIDON (GEN 9 SCARLET DRAGON) ----------
      case 'koraidon':
      case 'megakoraidon': {
        addBox(root, 0.96, 1.05, 0.90, 0, 0.98, 0, 0xdc2626);
        addBox(root, 0.72, 0.72, 0.52, 0, 1.00, 0.32, 0x1e293b); // Chest wheel crest
        addBox(root, 0.42, 0.54, 0.42, 0, 1.66, 0.18, 0xef4444);
        const head = new THREE.Group(); head.position.set(0, 2.02, 0.28);
        addBox(head, 0.64, 0.50, 0.76, 0, 0, 0, 0xdc2626);
        // Giant White-Gold Feathered Crest Plumes!
        addBox(head, 0.18, 0.65, 0.24, -0.28, 0.44, -0.22, 0xf8fafc);
        addBox(head, 0.18, 0.65, 0.24,  0.28, 0.44, -0.22, 0xf8fafc);
        addBox(head, 0.14, 0.48, 0.18, -0.28, 0.60, -0.26, 0xfacc15, { emissive: 0xf97316, emissiveIntensity: 0.9 });
        addBox(head, 0.14, 0.48, 0.18,  0.28, 0.60, -0.26, 0xfacc15, { emissive: 0xf97316, emissiveIntensity: 0.9 });
        addEyes(head, 0.38, 0.06, 0.20, 0xfacc15, true);
        root.add(head);
        anim.legs.push(addBox(root, 0.34, 0.54, 0.38, -0.34, 0.27, 0.04, 0x991b1b));
        anim.legs.push(addBox(root, 0.34, 0.54, 0.38,  0.34, 0.27, 0.04, 0x991b1b));
        const tail = addBox(root, 0.36, 0.36, 1.05, 0, 0.64, -0.82, 0xef4444);
        anim.extras.push({ obj: tail, type: 'wag' });
        if (isMega) {
          addBox(root, 1.75, 0.22, 0.45, 0, 1.56, -0.35, 0xfacc15, { emissive: 0xf97316, emissiveIntensity: 1.0 });
          root.scale.setScalar(1.18);
          attachMegaAura(root, anim, 0xf97316, 0xfacc15);
        }
        break;
      }

      // ---------- SNORLAX & MEGA GIGAMAX SNORLAX (WITH TREE ISLAND ON BELLY!) ----------
      case 'snorlax':
      case 'megasnorlax': {
        // Huge plump teal-navy body & cream belly
        addBox(root, 1.48, 1.38, 1.24, 0, 0.98, 0, 0x164e63);
        addBox(root, 1.18, 1.12, 0.30, 0, 0.94, 0.54, 0xfef3c7); // Big cream belly
        const head = new THREE.Group(); head.position.set(0, 1.88, 0.10);
        addBox(head, 0.96, 0.78, 0.86, 0, 0, 0, 0x164e63);
        addBox(head, 0.74, 0.52, 0.14, 0, -0.06, 0.40, 0xfef3c7); // Face patch
        // Pointed cat-like ears
        addBox(head, 0.24, 0.32, 0.20, -0.36, 0.46, 0, 0x0e3a4d);
        addBox(head, 0.24, 0.32, 0.20,  0.36, 0.46, 0, 0x0e3a4d);
        // Cute sleeping squinting eyes
        addBox(head, 0.22, 0.06, 0.06, -0.20, 0.06, 0.48, 0x0f172a);
        addBox(head, 0.22, 0.06, 0.06,  0.20, 0.06, 0.48, 0x0f172a);
        root.add(head);
        // Big Feet with cream soles + Stubby Arms
        anim.legs.push(addBox(root, 0.46, 0.34, 0.54, -0.46, 0.17, 0.22, 0xfef3c7));
        anim.legs.push(addBox(root, 0.46, 0.34, 0.54,  0.46, 0.17, 0.22, 0xfef3c7));
        addBox(root, 0.36, 0.68, 0.38, -0.88, 1.06, 0.14, 0x164e63);
        addBox(root, 0.36, 0.68, 0.38,  0.88, 1.06, 0.14, 0x164e63);
        if (isMega) {
          // GIGAMAX MEGA SNORLAX: Lush Voxel Grass & Glowing Berry Tree on its massive crown/shoulders!
          addBox(root, 1.56, 0.24, 1.32, 0, 1.72, -0.14, 0x22c55e); // Grassy plateau
          addBox(root, 0.30, 0.85, 0.30, 0, 2.65, -0.18, 0x78350f); // Giant tree trunk
          addBox(root, 1.15, 0.68, 1.15, 0, 3.20, -0.18, 0x16a34a); // Lush canopy
          addBox(root, 0.24, 0.24, 0.24, -0.45, 3.05, 0.45, 0xf43f5e, { emissive: 0xf43f5e, emissiveIntensity: 0.9 }); // Glowing berries
          addBox(root, 0.24, 0.24, 0.24,  0.45, 3.15, 0.45, 0xfacc15, { emissive: 0xfacc15, emissiveIntensity: 0.9 });
          root.scale.setScalar(1.16);
          attachMegaAura(root, anim, 0x22c55e, 0xfacc15);
        }
        break;
      }

      // ---------- AERODACTYL & MEGA AERODACTYL (WINGED PTEROSAUR DRAGON!) ----------
      case 'aerodactyl':
      case 'megaaerodactyl': {
        anim.floatMode = true;
        const body = new THREE.Group();
        body.position.set(0, 1.15, 0);
        addBox(body, 0.72, 0.66, 1.12, 0, 0, 0, 0x94a3b8); // Grey prehistoric torso
        const head = new THREE.Group(); head.position.set(0, 0.48, 0.72);
        addBox(head, 0.56, 0.44, 0.86, 0, 0, 0, 0x94a3b8);
        addBox(head, 0.44, 0.16, 0.74, 0, -0.22, 0.12, 0x64748b); // Fierce jaw
        addBox(head, 0.16, 0.30, 0.54, -0.24, 0.28, -0.34, 0x7c3aed); // Crest horn L
        addBox(head, 0.16, 0.30, 0.54,  0.24, 0.28, -0.34, 0x7c3aed); // Crest horn R
        if (isMega) {
          addBox(head, 0.24, 0.36, 0.30, 0, -0.36, 0.28, 0x1e293b); // Mega Obsidian Beard Spike!
          addBox(head, 0.18, 0.48, 0.20, 0, 0.46, -0.10, 0x38bdf8, { emissive: 0x38bdf8, emissiveIntensity: 0.9 });
        }
        addEyes(head, 0.38, 0.08, 0.20, 0xfacc15, true);
        body.add(head);

        // Huge Bat-Dragon Wings!
        const wL = new THREE.Group(); wL.position.set(-0.36, 0.16, 0.05);
        addBox(wL, 1.48, 0.12, 0.84, -0.76, 0.10, -0.12, 0x7c3aed);
        addBox(wL, 1.56, 0.18, 0.18, -0.76, 0.18,  0.26, 0x94a3b8);
        if (isMega) addBox(wL, 0.28, 0.55, 0.28, -1.25, 0.38, 0.22, 0x1e293b, { emissive: 0xa855f7, emissiveIntensity: 0.8 });
        body.add(wL); anim.wingsL.push(wL);

        const wR = new THREE.Group(); wR.position.set(0.36, 0.16, 0.05);
        addBox(wR, 1.48, 0.12, 0.84, 0.76, 0.10, -0.12, 0x7c3aed);
        addBox(wR, 1.56, 0.18, 0.18, 0.76, 0.18,  0.26, 0x94a3b8);
        if (isMega) addBox(wR, 0.28, 0.55, 0.28, 1.25, 0.38, 0.22, 0x1e293b, { emissive: 0xa855f7, emissiveIntensity: 0.8 });
        body.add(wR); anim.wingsR.push(wR);

        // Arrow-tipped tail
        const tail = new THREE.Group(); tail.position.set(0, -0.1, -0.60);
        addBox(tail, 0.18, 0.18, 0.84, 0, 0, -0.40, 0x64748b);
        addBox(tail, 0.42, 0.14, 0.40, 0, 0, -0.92, isMega ? 0x38bdf8 : 0x7c3aed, isMega ? { emissive: 0x38bdf8, emissiveIntensity: 0.9 } : {});
        body.add(tail); anim.extras.push({ obj: tail, type: 'wag' });

        root.add(body);
        if (isMega) { root.scale.setScalar(1.18); attachMegaAura(root, anim, 0xa855f7, 0x38bdf8); }
        break;
      }

      // ---------- LUCARIO & MEGA LUCARIO ----------
      case 'lucario':
      case 'megalucario': {
        addBox(root, 0.68, 0.86, 0.50, 0, 1.12, 0, 0xfef08a); // Cream/Yellow aura torso
        addBox(root, 0.72, 0.24, 0.54, 0, 1.42, 0, 0x0f172a); // Black shoulder harness
        addBox(root, 0.16, 0.16, 0.26, 0, 1.14, 0.32, 0xe2e8f0, { emissive: 0x38bdf8, emissiveIntensity: isMega ? 0.9 : 0.3 }); // Chest spike
        const head = new THREE.Group(); head.position.set(0, 1.84, 0.06);
        addBox(head, 0.54, 0.50, 0.56, 0, 0, 0, 0x2563eb); // Blue jackal head
        addBox(head, 0.56, 0.20, 0.14, 0, 0.04, 0.26, 0x0f172a); // Aura mask
        addBox(head, 0.30, 0.20, 0.32, 0, -0.10, 0.36, 0x2563eb); // Snout
        // Tall Jackal Ears
        addBox(head, 0.16, 0.46, 0.16, -0.20, 0.42, -0.02, 0x2563eb);
        addBox(head, 0.16, 0.46, 0.16,  0.20, 0.42, -0.02, 0x2563eb);
        // Aura Dreadlocks (crimson tipped on Mega Lucario!)
        addBox(head, 0.14, 0.48, 0.16, -0.26, -0.08, -0.34, isMega ? 0xef4444 : 0x0f172a, isMega ? { emissive: 0xef4444, emissiveIntensity: 0.7 } : {});
        addBox(head, 0.14, 0.48, 0.16,  0.26, -0.08, -0.34, isMega ? 0xef4444 : 0x0f172a, isMega ? { emissive: 0xef4444, emissiveIntensity: 0.7 } : {});
        addEyes(head, 0.32, 0.05, 0.15, 0xef4444, true);
        root.add(head);
        // Legs (blue shorts + dark calves)
        anim.legs.push(addBox(root, 0.26, 0.68, 0.28, -0.22, 0.34, 0, 0x1d4ed8));
        anim.legs.push(addBox(root, 0.26, 0.68, 0.28,  0.22, 0.34, 0, 0x1d4ed8));
        // Arms with glowing Aura Fists!
        const fistCol = isMega ? 0xef4444 : 0x0f172a;
        addBox(root, 0.20, 0.62, 0.22, -0.46, 1.18, 0.12, fistCol, isMega ? { emissive: 0xef4444, emissiveIntensity: 0.9 } : {});
        addBox(root, 0.20, 0.62, 0.22,  0.46, 1.18, 0.12, fistCol, isMega ? { emissive: 0xef4444, emissiveIntensity: 0.9 } : {});
        if (isMega) {
          addBox(root, 0.28, 0.28, 0.28, -0.46, 0.84, 0.24, 0x22d3ee, { emissive: 0x22d3ee, emissiveIntensity: 1.0 });
          addBox(root, 0.28, 0.28, 0.28,  0.46, 0.84, 0.24, 0x22d3ee, { emissive: 0x22d3ee, emissiveIntensity: 1.0 });
          root.scale.setScalar(1.16);
          attachMegaAura(root, anim, 0x22d3ee, 0xef4444);
        }
        break;
      }

      // ---------- FROAKIE ----------
      case 'froakie': {
        addBox(root, 0.60, 0.48, 0.64, 0, 0.46, 0, 0x38bdf8);
        addBox(root, 0.66, 0.22, 0.68, 0, 0.68, 0, 0xf8fafc); // White foam collar
        const head = new THREE.Group(); head.position.set(0, 0.94, 0.10);
        addBox(head, 0.56, 0.42, 0.52, 0, 0, 0, 0x38bdf8);
        addEyes(head, 0.26, 0.12, 0.18, 0xfacc15, true);
        root.add(head);
        anim.legs.push(addBox(root, 0.20, 0.28, 0.22, -0.22, 0.14, 0.04, 0x0284c7));
        anim.legs.push(addBox(root, 0.20, 0.28, 0.22,  0.22, 0.14, 0.04, 0x0284c7));
        break;
      }

      // ---------- GRENINJA & MEGA ASH-GRENINJA (GIANT WATER SHURIKEN!) ----------
      case 'greninja':
      case 'megagreninja': {
        addBox(root, 0.68, 0.86, 0.52, 0, 1.08, 0, 0x1e3a8a); // Dark ninja blue torso
        addBox(root, 0.50, 0.52, 0.16, 0, 1.04, 0.24, 0xfef3c7); // Chest
        // Iconic Pink Ninja Scarf!
        addBox(root, 0.78, 0.24, 0.64, 0, 1.50, 0.04, 0xf472b6);
        addBox(root, 0.28, 0.22, 0.76, 0.16, 1.44, -0.46, 0xf472b6);
        const head = new THREE.Group(); head.position.set(0, 1.84, 0.08);
        addBox(head, 0.62, 0.46, 0.58, 0, 0, 0, 0x1d4ed8);
        // Side Ninja Fin-Ears (with Red Ash-Greninja Crest on Mega!)
        addBox(head, 0.44, 0.16, 0.28, -0.44, 0.14, -0.06, isMega ? 0xef4444 : 0x1e3a8a, isMega ? { emissive: 0xef4444, emissiveIntensity: 0.7 } : {});
        addBox(head, 0.44, 0.16, 0.28,  0.44, 0.14, -0.06, isMega ? 0xef4444 : 0x1e3a8a, isMega ? { emissive: 0xef4444, emissiveIntensity: 0.7 } : {});
        addEyes(head, 0.30, 0.04, 0.18, 0xef4444, true);
        root.add(head);
        anim.legs.push(addBox(root, 0.24, 0.66, 0.26, -0.22, 0.33, 0, 0x1e3a8a));
        anim.legs.push(addBox(root, 0.24, 0.66, 0.26,  0.22, 0.33, 0, 0x1e3a8a));
        addBox(root, 0.18, 0.58, 0.20, -0.46, 1.14, 0.14, 0x1d4ed8);
        addBox(root, 0.18, 0.58, 0.20,  0.46, 1.14, 0.14, 0x1d4ed8);
        if (isMega) {
          // GIANT SPINNING WATER SHURIKEN ON BACK!
          const shuriken = new THREE.Group();
          shuriken.position.set(0, 1.32, -0.52);
          addBox(shuriken, 1.75, 0.22, 0.12, 0, 0, 0, 0x22d3ee, { emissive: 0x22d3ee, emissiveIntensity: 1.0 });
          addBox(shuriken, 0.22, 1.75, 0.12, 0, 0, 0, 0x38bdf8, { emissive: 0x38bdf8, emissiveIntensity: 1.0 });
          addBox(shuriken, 0.42, 0.42, 0.16, 0, 0, 0, 0xffffff, { emissive: 0x22d3ee, emissiveIntensity: 1.0 });
          root.add(shuriken);
          anim.extras.push({ obj: shuriken, type: 'spinZ' });
          root.scale.setScalar(1.16);
          attachMegaAura(root, anim, 0x22d3ee, 0xef4444);
        }
        break;
      }

      // ---------- CHARMANDER / CHARMELEON / CHARIZARD / MEGA CHARIZARD X ----------
      case 'charmander':
      case 'charmeleon': {
        const isMel = speciesId === 'charmeleon';
        const col = isMel ? 0xdc2626 : 0xf97316;
        addBox(root, isMel ? 0.74 : 0.62, isMel ? 0.84 : 0.66, 0.58, 0, isMel ? 0.74 : 0.62, 0, col);
        addBox(root, 0.46, 0.54, 0.14, 0, isMel ? 0.70 : 0.58, 0.26, 0xfef3c7);
        const head = new THREE.Group(); head.position.set(0, isMel ? 1.40 : 1.16, 0.08);
        addBox(head, 0.58, 0.50, 0.60, 0, 0, 0, col);
        if (isMel) addBox(head, 0.18, 0.22, 0.30, 0, 0.26, -0.32, 0xb91c1c);
        addEyes(head, 0.31, 0.05, 0.16);
        root.add(head);
        anim.legs.push(addBox(root, 0.24, 0.38, 0.26, -0.22, 0.19, 0.02, col));
        anim.legs.push(addBox(root, 0.24, 0.38, 0.26,  0.22, 0.19, 0.02, col));
        const tail = new THREE.Group(); tail.position.set(0, 0.46, -0.34);
        addBox(tail, 0.22, 0.22, 0.52, 0, 0.06, -0.26, col);
        addBox(tail, 0.28, 0.34, 0.28, 0, 0.34, -0.54, 0xf97316, { emissive: 0xea580c, emissiveIntensity: 1.0 });
        root.add(tail); anim.extras.push({ obj: tail, type: 'wag' });
        break;
      }

      case 'charizard':
      case 'megacharizard': {
        const bodyCol  = isMega ? 0x0f172a : 0xf97316; // Pitch black scales for Mega Charizard X!
        const bellyCol = isMega ? 0x38bdf8 : 0xfef08a; // Electric blue belly!
        const wingCol  = isMega ? 0x0284c7 : 0x0d9488;
        const flameCol = isMega ? 0x22d3ee : 0xf97316;
        addBox(root, 1.04, 1.12, 0.88, 0, 1.02, 0, bodyCol);
        addBox(root, 0.72, 0.86, 0.18, 0, 0.96, 0.38, bellyCol, isMega ? { emissive: 0x0284c7, emissiveIntensity: 0.45 } : {});
        addBox(root, 0.38, 0.44, 0.38, 0, 1.72, 0.12, bodyCol);
        const head = new THREE.Group(); head.position.set(0, 2.06, 0.22);
        addBox(head, 0.66, 0.52, 0.78, 0, 0, 0, bodyCol);
        addBox(head, 0.14, 0.22, 0.46, -0.24, 0.28, -0.36, isMega ? 0x22d3ee : 0xea580c);
        addBox(head, 0.14, 0.22, 0.46,  0.24, 0.28, -0.36, isMega ? 0x22d3ee : 0xea580c);
        if (isMega) {
          // Iconic Blue Flames shooting out of Mega Charizard X's mouth!
          addBox(head, 0.20, 0.18, 0.46, -0.34, -0.06, 0.36, 0x22d3ee, { emissive: 0x22d3ee, emissiveIntensity: 1.0 });
          addBox(head, 0.20, 0.18, 0.46,  0.34, -0.06, 0.36, 0x22d3ee, { emissive: 0x22d3ee, emissiveIntensity: 1.0 });
        }
        addEyes(head, 0.39, 0.08, 0.20, isMega ? 0xef4444 : 0x38bdf8, true);
        root.add(head);
        anim.legs.push(addBox(root, 0.34, 0.54, 0.38, -0.34, 0.27, 0.04, bodyCol));
        anim.legs.push(addBox(root, 0.34, 0.54, 0.38,  0.34, 0.27, 0.04, bodyCol));
        const wL = new THREE.Group(); wL.position.set(-0.50, 1.40, -0.32);
        addBox(wL, 1.35, 0.96, 0.12, -0.70, 0.38, -0.14, wingCol, isMega ? { emissive: 0x0ea5e9, emissiveIntensity: 0.65 } : {});
        addBox(wL, 1.42, 0.18, 0.18, -0.70, 0.88, -0.14, bodyCol);
        root.add(wL); anim.wingsL.push(wL);
        const wR = new THREE.Group(); wR.position.set(0.50, 1.40, -0.32);
        addBox(wR, 1.35, 0.96, 0.12, 0.70, 0.38, -0.14, wingCol, isMega ? { emissive: 0x0ea5e9, emissiveIntensity: 0.65 } : {});
        addBox(wR, 1.42, 0.18, 0.18, 0.70, 0.88, -0.14, bodyCol);
        root.add(wR); anim.wingsR.push(wR);
        const tail = new THREE.Group(); tail.position.set(0, 0.62, -0.46);
        addBox(tail, 0.30, 0.28, 0.90, 0, 0.06, -0.44, bodyCol);
        addBox(tail, 0.40, 0.52, 0.40, 0, 0.44, -0.94, flameCol, { emissive: flameCol, emissiveIntensity: 1.0 });
        root.add(tail); anim.extras.push({ obj: tail, type: 'wag' });
        if (isMega) { root.scale.setScalar(1.20); attachMegaAura(root, anim, 0x22d3ee, 0x3b82f6); }
        break;
      }

      // ---------- CERULEDGE & MEGA CERULEDGE (GEN 9 PLASMA SWORD KNIGHT!) ----------
      case 'ceruledge':
      case 'megaceruledge': {
        addBox(root, 0.66, 0.94, 0.48, 0, 1.18, 0, 0x1e1b4b); // Dark Knight Armor
        addBox(root, 0.50, 0.52, 0.52, 0, 1.24, 0, 0x4c1d95);
        const head = new THREE.Group(); head.position.set(0, 1.94, 0.04);
        addBox(head, 0.54, 0.52, 0.54, 0, 0, 0, 0x1e1b4b);
        // Blazing Violet Knight Helmet Plume!
        addBox(head, 0.18, 0.62, 0.44, 0, 0.52, -0.06, 0xa855f7, { emissive: 0xec4899, emissiveIntensity: 0.95 });
        addEyes(head, 0.28, 0.04, 0.14, 0xfacc15, true);
        root.add(head);
        anim.legs.push(addBox(root, 0.24, 0.72, 0.26, -0.22, 0.36, 0, 0x312e81));
        anim.legs.push(addBox(root, 0.24, 0.72, 0.26,  0.22, 0.36, 0, 0x312e81));
        // Twin Blazing Plasma Sword Arms!
        const swordLen = isMega ? 1.55 : 0.96;
        addBox(root, 0.22, 0.26, swordLen, -0.52, 1.24, swordLen * 0.42, 0xec4899, { emissive: 0xec4899, emissiveIntensity: 1.0 });
        addBox(root, 0.22, 0.26, swordLen,  0.52, 1.24, swordLen * 0.42, 0xec4899, { emissive: 0xec4899, emissiveIntensity: 1.0 });
        if (isMega) {
          addBox(root, 0.12, 0.14, swordLen * 1.1, -0.52, 1.24, swordLen * 0.5, 0x22d3ee, { emissive: 0x22d3ee, emissiveIntensity: 1.0 });
          addBox(root, 0.12, 0.14, swordLen * 1.1,  0.52, 1.24, swordLen * 0.5, 0x22d3ee, { emissive: 0x22d3ee, emissiveIntensity: 1.0 });
          root.scale.setScalar(1.16);
          attachMegaAura(root, anim, 0xec4899, 0xa855f7);
        }
        break;
      }

      // ---------- CINDERACE & MEGA CINDERACE (GEN 8 FIRE STRIKER!) ----------
      case 'cinderace':
      case 'megacinderace': {
        addBox(root, 0.64, 0.84, 0.48, 0, 1.12, 0, 0xf8fafc); // White striker body
        addBox(root, 0.68, 0.34, 0.52, 0, 0.76, 0, 0x1e293b); // Shorts
        addBox(root, 0.70, 0.24, 0.52, 0, 1.38, 0, 0xef4444); // Red jersey top
        const head = new THREE.Group(); head.position.set(0, 1.84, 0.04);
        addBox(head, 0.54, 0.48, 0.52, 0, 0, 0, 0xf8fafc);
        addBox(head, 0.56, 0.18, 0.54, 0, 0.26, 0, 0xfacc15); // Yellow crown
        // Tall rabbit ears
        addBox(head, 0.14, 0.58, 0.12, -0.20, 0.56, -0.06, 0xf8fafc);
        addBox(head, 0.14, 0.58, 0.12,  0.20, 0.56, -0.06, 0xf8fafc);
        addEyes(head, 0.27, 0.04, 0.14, 0xef4444, true);
        root.add(head);
        anim.legs.push(addBox(root, 0.22, 0.66, 0.26, -0.20, 0.33, 0, 0xef4444));
        anim.legs.push(addBox(root, 0.22, 0.66, 0.26,  0.20, 0.33, 0, 0xef4444));
        if (isMega) {
          // Floating Giant Pyro-Ball under/beside Mega Cinderace!
          const fireball = addBox(root, 0.92, 0.92, 0.92, 0, 0.45, 0.95, 0xf97316, { emissive: 0xfacc15, emissiveIntensity: 1.0 });
          anim.extras.push({ obj: fireball, type: 'spin' });
          root.scale.setScalar(1.16);
          attachMegaAura(root, anim, 0xf97316, 0xfacc15);
        }
        break;
      }

      // ---------- TINKATON & MEGA TINKATON (GEN 9 GIANT HAMMER!) ----------
      case 'tinkaton':
      case 'megatinkaton': {
        addBox(root, 0.58, 0.68, 0.48, 0, 0.72, 0, 0xf472b6); // Pink body
        const head = new THREE.Group(); head.position.set(0, 1.32, 0.04);
        addBox(head, 0.56, 0.48, 0.52, 0, 0, 0, 0xf9a8d4);
        addBox(head, 0.66, 0.32, 0.60, 0, 0.26, -0.08, 0xec4899); // Pink twin-tail hair
        addEyes(head, 0.27, 0.04, 0.14);
        root.add(head);
        anim.legs.push(addBox(root, 0.18, 0.38, 0.20, -0.18, 0.19, 0, 0xdb2777));
        anim.legs.push(addBox(root, 0.18, 0.38, 0.20,  0.18, 0.19, 0, 0xdb2777));
        // GIANT VOXEL STEEL HAMMER!
        const hammer = new THREE.Group(); hammer.position.set(0.54, 0.98, 0.20);
        addBox(hammer, 0.14, 1.35, 0.14, 0, 0.32, 0, 0x64748b); // Handle
        const hSize = isMega ? 1.05 : 0.72;
        addBox(hammer, hSize * 1.2, hSize * 0.85, hSize * 0.85, 0, 1.08, 0, isMega ? 0xfacc15 : 0x94a3b8, isMega ? { emissive: 0xfacc15, emissiveIntensity: 0.75 } : {});
        root.add(hammer);
        anim.extras.push({ obj: hammer, type: 'wag' });
        if (isMega) { root.scale.setScalar(1.16); attachMegaAura(root, anim, 0xf472b6, 0xfacc15); }
        break;
      }

      // ---------- MEW & ✨ SHINY MEGA MEW ----------
      case 'mew':
      case 'shinymegamew': {
        const isShiny = speciesId === 'shinymegamew';
        anim.floatMode = true;
        const body = new THREE.Group(); body.position.set(0, 1.05, 0);
        const col = isShiny ? 0x38bdf8 : 0xf9a8d4;
        const glowOpts = isShiny ? { emissive: 0x06b6d4, emissiveIntensity: 0.65 } : {};
        addBox(body, 0.52, 0.64, 0.44, 0, 0, 0, col, glowOpts);
        const head = new THREE.Group(); head.position.set(0, 0.56, 0.04);
        addBox(head, 0.56, 0.46, 0.50, 0, 0, 0, col, glowOpts);
        // Cute cat ears
        addBox(head, 0.14, 0.22, 0.14, -0.22, 0.30, 0, col, glowOpts);
        addBox(head, 0.14, 0.22, 0.14,  0.22, 0.30, 0, col, glowOpts);
        addEyes(head, 0.26, 0.04, 0.14, isShiny ? 0xfacc15 : 0x0ea5e9, true);
        body.add(head);
        // Long cute paws & feet
        addBox(body, 0.12, 0.26, 0.14, -0.30, 0.10, 0.16, col, glowOpts);
        addBox(body, 0.12, 0.26, 0.14,  0.30, 0.10, 0.16, col, glowOpts);
        addBox(body, 0.16, 0.36, 0.24, -0.22, -0.34, 0.06, col, glowOpts);
        addBox(body, 0.16, 0.36, 0.24,  0.22, -0.34, 0.06, col, glowOpts);
        // Iconic Long Swooping Mew Tail!
        const tail = new THREE.Group(); tail.position.set(0, -0.18, -0.24);
        addBox(tail, 0.10, 0.10, 0.72, 0, 0.08, -0.36, col, glowOpts);
        addBox(tail, 0.10, 0.62, 0.10, 0, 0.40, -0.72, col, glowOpts);
        addBox(tail, 0.22, 0.22, 0.22, 0, 0.78, -0.72, isShiny ? 0xfacc15 : 0xf472b6, { emissive: isShiny ? 0xfacc15 : 0xf472b6, emissiveIntensity: 0.9 });
        body.add(tail); anim.extras.push({ obj: tail, type: 'wag' });

        if (isShiny) {
          // ✨ SHINY MEGA MEW: Golden Crystal Halo Wings + Cosmic Crown!
          const wL = new THREE.Group(); wL.position.set(-0.32, 0.22, -0.18);
          addBox(wL, 1.18, 0.42, 0.10, -0.60, 0.20, -0.06, 0x22d3ee, { emissive: 0x22d3ee, emissiveIntensity: 1.0 });
          addBox(wL, 1.02, 0.14, 0.14, -0.55, 0.46, -0.06, 0xfacc15, { emissive: 0xfacc15, emissiveIntensity: 1.0 });
          body.add(wL); anim.wingsL.push(wL);
          const wR = new THREE.Group(); wR.position.set(0.32, 0.22, -0.18);
          addBox(wR, 1.18, 0.42, 0.10, 0.60, 0.20, -0.06, 0x22d3ee, { emissive: 0x22d3ee, emissiveIntensity: 1.0 });
          addBox(wR, 1.02, 0.14, 0.14, 0.55, 0.46, -0.06, 0xfacc15, { emissive: 0xfacc15, emissiveIntensity: 1.0 });
          body.add(wR); anim.wingsR.push(wR);
          const halo = addBox(body, 0.72, 0.09, 0.72, 0, 1.04, 0, 0xfacc15, { emissive: 0xfacc15, emissiveIntensity: 1.0 });
          anim.extras.push({ obj: halo, type: 'spin' });
          root.scale.setScalar(1.22);
          attachMegaAura(root, anim, 0x22d3ee, 0xfacc15);
        }
        root.add(body);
        break;
      }

      // ---------- MEWTWO & MEGA MEWTWO ----------
      case 'mewtwo':
      case 'megamewtwo': {
        anim.floatMode = isMega;
        const wrap = new THREE.Group();
        addBox(wrap, 0.66, 0.96, 0.48, 0, 1.18, 0, 0xe2e8f0);
        addBox(wrap, 0.62, 0.42, 0.54, 0, 0.88, 0, 0x9333ea); // Purple belly
        const head = new THREE.Group(); head.position.set(0, 1.92, 0.06);
        addBox(head, 0.54, 0.48, 0.54, 0, 0, 0, 0xe2e8f0);
        addBox(head, 0.14, 0.26, 0.14, -0.20, 0.32, 0, 0xe2e8f0);
        addBox(head, 0.14, 0.26, 0.14,  0.20, 0.32, 0, 0xe2e8f0);
        addEyes(head, 0.28, 0.04, 0.14, isMega ? 0xef4444 : 0xa855f7, true);
        if (isMega) {
          // Mega Mewtwo Y flowing psychic head-tail!
          addBox(head, 0.24, 0.24, 1.25, 0, 0.28, -0.72, 0xa855f7, { emissive: 0x9333ea, emissiveIntensity: 0.75 });
        }
        wrap.add(head);
        anim.legs.push(addBox(wrap, 0.26, 0.72, 0.28, -0.24, 0.36, 0, 0xcbd5e1));
        anim.legs.push(addBox(wrap, 0.26, 0.72, 0.28,  0.24, 0.36, 0, 0xcbd5e1));
        addBox(wrap, 0.18, 0.62, 0.20, -0.46, 1.26, 0.14, 0xe2e8f0);
        addBox(wrap, 0.18, 0.62, 0.20,  0.46, 1.26, 0.14, 0xe2e8f0);
        // Floating Psychic Energy Orb
        const orb = addBox(wrap, 0.32, 0.32, 0.32, 0.52, 1.28, 0.44, 0xe879f9, { emissive: 0xe879f9, emissiveIntensity: 1.0 });
        anim.extras.push({ obj: orb, type: 'spin' });
        if (!isMega) {
          const tail = addBox(wrap, 0.26, 0.26, 1.05, 0, 0.72, -0.66, 0x9333ea);
          anim.extras.push({ obj: tail, type: 'wag' });
        } else {
          root.scale.setScalar(1.18);
          attachMegaAura(root, anim, 0xe879f9, 0xa855f7);
        }
        root.add(wrap);
        break;
      }

      // ---------- SALAMENCE (BLUE DRAGON + CRIMSON FLAT WINGS!) ----------
      case 'salamence': {
        addBox(root, 0.96, 0.66, 1.38, 0, 0.72, 0, 0x2563eb);
        addBox(root, 0.74, 0.24, 1.18, 0, 0.42, 0.06, 0x94a3b8); // Armored grey belly
        const head = new THREE.Group(); head.position.set(0, 1.12, 0.84);
        addBox(head, 0.62, 0.48, 0.72, 0, 0, 0, 0x2563eb);
        addBox(head, 0.24, 0.16, 0.36, -0.36, 0.08, -0.14, 0xef4444); // Red cheek fins
        addBox(head, 0.24, 0.16, 0.36,  0.36, 0.08, -0.14, 0xef4444);
        addEyes(head, 0.37, 0.08, 0.18, 0xfacc15, true);
        root.add(head);
        [[-0.38, 0.42], [0.38, 0.42], [-0.38, -0.44], [0.38, -0.44]].forEach(([x, z]) => {
          anim.legs.push(addBox(root, 0.28, 0.44, 0.28, x, 0.22, z, 0x1d4ed8));
        });
        // Iconic Huge Red Salamence Wings!
        const wL = new THREE.Group(); wL.position.set(-0.48, 0.96, -0.05);
        addBox(wL, 1.65, 0.14, 0.95, -0.84, 0.22, -0.10, 0xef4444, { emissive: 0xb91c1c, emissiveIntensity: 0.4 });
        root.add(wL); anim.wingsL.push(wL);
        const wR = new THREE.Group(); wR.position.set(0.48, 0.96, -0.05);
        addBox(wR, 1.65, 0.14, 0.95,  0.84, 0.22, -0.10, 0xef4444, { emissive: 0xb91c1c, emissiveIntensity: 0.4 });
        root.add(wR); anim.wingsR.push(wR);
        const tail = addBox(root, 0.32, 0.28, 1.02, 0, 0.64, -1.06, 0x1d4ed8);
        anim.extras.push({ obj: tail, type: 'wag' });
        break;
      }

      // ---------- KYOGRE (OCEAN LEVIATHAN WITH GLOWING RED LINES!) ----------
      case 'kyogre': {
        anim.floatMode = true;
        const body = new THREE.Group(); body.position.set(0, 1.0, 0);
        addBox(body, 1.24, 0.72, 1.82, 0, 0, 0, 0x1d4ed8); // Deep ocean blue whale body
        addBox(body, 1.04, 0.26, 1.60, 0, -0.34, 0.06, 0xf8fafc); // White belly
        // Glowing Crimson Tribal Markings!
        addBox(body, 1.28, 0.12, 1.20, 0, 0.22, 0.18, 0xef4444, { emissive: 0xef4444, emissiveIntensity: 0.95 });
        addEyes(body, 0.92, 0.08, 0.42, 0xfacc15, true);
        // Giant Wing-Like Pectoral Fins with white spots & glowing red runes!
        const fL = new THREE.Group(); fL.position.set(-0.62, 0, 0.22);
        addBox(fL, 1.55, 0.16, 0.88, -0.78, 0, -0.10, 0x1e40af);
        addBox(fL, 1.15, 0.18, 0.16, -0.72, 0.02, 0.14, 0xef4444, { emissive: 0xef4444, emissiveIntensity: 0.95 });
        body.add(fL); anim.wingsL.push(fL);
        const fR = new THREE.Group(); fR.position.set(0.62, 0, 0.22);
        addBox(fR, 1.55, 0.16, 0.88, 0.78, 0, -0.10, 0x1e40af);
        addBox(fR, 1.15, 0.18, 0.16, 0.72, 0.02, 0.14, 0xef4444, { emissive: 0xef4444, emissiveIntensity: 0.95 });
        body.add(fR); anim.wingsR.push(fR);
        const tail = addBox(body, 1.12, 0.16, 0.76, 0, 0, -1.24, 0x2563eb);
        anim.extras.push({ obj: tail, type: 'wag' });
        root.add(body);
        break;
      }

      // ---------- GROUDON (CRIMSON MAGMA CONTINENT BEHEMOTH!) ----------
      case 'groudon': {
        addBox(root, 1.38, 1.22, 1.12, 0, 1.12, 0, 0xdc2626);
        addBox(root, 1.44, 0.18, 1.18, 0, 1.16, 0, 0xfacc15, { emissive: 0xf97316, emissiveIntensity: 1.0 }); // Magma seams
        addBox(root, 0.96, 0.78, 0.24, 0, 1.02, 0.50, 0x334155);
        const head = new THREE.Group(); head.position.set(0, 1.94, 0.34);
        addBox(head, 0.86, 0.64, 0.86, 0, 0, 0, 0xb91c1c);
        addBox(head, 0.22, 0.30, 0.56, -0.38, 0.24, -0.34, 0xdc2626);
        addBox(head, 0.22, 0.30, 0.56,  0.38, 0.24, -0.34, 0xdc2626);
        addEyes(head, 0.44, 0.08, 0.26, 0xfacc15, true);
        root.add(head);
        anim.legs.push(addBox(root, 0.46, 0.56, 0.52, -0.44, 0.28, 0.06, 0x991b1b));
        anim.legs.push(addBox(root, 0.46, 0.56, 0.52,  0.44, 0.28, 0.06, 0x991b1b));
        addBox(root, 0.34, 0.76, 0.36, -0.86, 1.26, 0.26, 0xdc2626);
        addBox(root, 0.34, 0.76, 0.36,  0.86, 1.26, 0.26, 0xdc2626);
        const tail = addBox(root, 0.78, 0.36, 1.18, 0, 0.66, -1.04, 0xb91c1c);
        anim.extras.push({ obj: tail, type: 'wag' });
        break;
      }

      // ---------- RAYQUAZA (EMERALD SKY SERPENT WITH GOLDEN RINGS!) ----------
      case 'rayquaza': {
        anim.floatMode = true;
        const body = new THREE.Group(); body.position.set(0, 1.15, 0);
        for (let i = 0; i < 4; i++) {
          const segY = Math.sin(i * 1.1) * 0.36;
          addBox(body, 0.62, 0.58, 0.64, 0, segY, 0.75 - i * 0.62, 0x16a34a);
          addBox(body, 0.68, 0.14, 0.16, 0, segY, 0.75 - i * 0.62, 0xfacc15, { emissive: 0xeab308, emissiveIntensity: 0.9 });
        }
        const head = new THREE.Group(); head.position.set(0, 0.52, 1.24);
        addBox(head, 0.68, 0.48, 0.84, 0, 0, 0, 0x15803d);
        addBox(head, 0.18, 0.24, 0.66, -0.34, 0.24, -0.38, 0x16a34a);
        addBox(head, 0.18, 0.24, 0.66,  0.34, 0.24, -0.38, 0x16a34a);
        addBox(head, 0.70, 0.10, 0.26, 0, -0.22, 0.22, 0xef4444); // Red mouth trim
        addEyes(head, 0.43, 0.08, 0.22, 0xfacc15, true);
        body.add(head);
        root.add(body);
        break;
      }

      // ---------- METAGROSS (4-LEGGED SUPERCOMPUTER WITH SILVER X!) ----------
      case 'metagross': {
        anim.floatMode = true;
        const body = new THREE.Group(); body.position.set(0, 0.9, 0);
        addBox(body, 1.32, 0.72, 1.22, 0, 0.15, 0, 0x0284c7);
        // Iconic Silver X on face!
        const xBar1 = addBox(body, 0.92, 0.16, 0.14, 0, 0.18, 0.64, 0xe2e8f0); xBar1.rotation.z = 0.65;
        const xBar2 = addBox(body, 0.92, 0.16, 0.14, 0, 0.18, 0.64, 0xe2e8f0); xBar2.rotation.z = -0.65;
        addEyes(body, 0.62, 0.18, 0.42, 0xef4444, true);
        [[-0.78, 0.56], [0.78, 0.56], [-0.78, -0.56], [0.78, -0.56]].forEach(([x, z]) => {
          anim.legs.push(addBox(body, 0.34, 0.92, 0.34, x, -0.22, z, 0x0369a1));
        });
        root.add(body);
        break;
      }

      // ---------- HYDREIGON (3-HEADED DARK HYDRA!) ----------
      case 'hydreigon': {
        anim.floatMode = true;
        const body = new THREE.Group(); body.position.set(0, 1.0, 0);
        addBox(body, 0.92, 0.96, 0.96, 0, 0, 0, 0x1e3a8a);
        addBox(body, 0.98, 0.22, 1.0, 0, 0.15, 0, 0xec4899); // Magenta stripes
        // Center Head + Left & Right Hand-Heads!
        const heads = [[0, 0.92, 0.32, 0.58], [-0.88, 0.32, 0.48, 0.42], [0.88, 0.32, 0.48, 0.42]];
        heads.forEach(([hx, hy, hz, sz]) => {
          const h = new THREE.Group(); h.position.set(hx, hy, hz);
          addBox(h, sz, sz * 0.85, sz * 1.1, 0, 0, 0, 0x1e1b4b);
          addBox(h, sz * 1.25, sz * 0.25, sz * 0.3, 0, 0.1, -0.1, 0xec4899);
          addEyes(h, sz * 0.56, 0.04, sz * 0.25, 0xef4444, true);
          body.add(h);
        });
        const wL = new THREE.Group(); wL.position.set(-0.46, 0.32, -0.32);
        addBox(wL, 1.35, 0.88, 0.12, -0.68, 0.22, -0.1, 0x0f172a);
        body.add(wL); anim.wingsL.push(wL);
        const wR = new THREE.Group(); wR.position.set(0.46, 0.32, -0.32);
        addBox(wR, 1.35, 0.88, 0.12, 0.68, 0.22, -0.1, 0x0f172a);
        body.add(wR); anim.wingsR.push(wR);
        root.add(body);
        break;
      }

      // ---------- ARCEUS (CREATOR DEITY WITH GOLDEN WHEEL!) ----------
      case 'arceus': {
        addBox(root, 0.84, 0.72, 1.34, 0, 1.02, 0, 0xf8fafc);
        addBox(root, 0.42, 0.84, 0.42, 0, 1.66, 0.54, 0xf8fafc);
        const head = new THREE.Group(); head.position.set(0, 2.16, 0.66);
        addBox(head, 0.52, 0.44, 0.68, 0, 0, 0, 0xf8fafc);
        addBox(head, 0.26, 0.34, 0.72, 0, 0.24, -0.32, 0xe2e8f0);
        addEyes(head, 0.35, 0.04, 0.16, 0x22c55e, true);
        root.add(head);
        [[-0.32, 0.48], [0.32, 0.48], [-0.32, -0.48], [0.32, -0.48]].forEach(([x, z]) => {
          anim.legs.push(addBox(root, 0.20, 0.72, 0.22, x, 0.36, z, 0xf8fafc));
        });
        // Iconic Glowing Golden Creation Wheel!
        const wheel = new THREE.Group(); wheel.position.set(0, 1.12, 0);
        addBox(wheel, 1.85, 0.18, 0.18, 0, 0, 0, 0xfacc15, { emissive: 0xfacc15, emissiveIntensity: 1.0 });
        addBox(wheel, 0.18, 1.85, 0.18, 0, 0, 0, 0xfacc15, { emissive: 0xfacc15, emissiveIntensity: 1.0 });
        root.add(wheel); anim.extras.push({ obj: wheel, type: 'spinZ' });
        attachMegaAura(root, anim, 0xfacc15, 0xffffff);
        break;
      }

      // ---------- ZACIAN & ZAMAZENTA (SWORD & SHIELD WOLVES!) ----------
      case 'zacian':
      case 'zamazenta': {
        const isZac = speciesId === 'zacian';
        const mainCol = isZac ? 0x06b6d4 : 0xdc2626;
        const trimCol = isZac ? 0xec4899 : 0x1e3a8a;
        addBox(root, 0.82, 0.72, 1.32, 0, 0.92, 0, mainCol);
        addBox(root, 0.96, 0.56, 0.66, 0, 1.08, 0.34, 0xfacc15, { emissive: 0xeab308, emissiveIntensity: 0.5 }); // Golden Royal Mane/Shield
        const head = new THREE.Group(); head.position.set(0, 1.48, 0.72);
        addBox(head, 0.56, 0.48, 0.68, 0, 0, 0, mainCol);
        addBox(head, 0.16, 0.36, 0.16, -0.22, 0.38, -0.06, trimCol);
        addBox(head, 0.16, 0.36, 0.16,  0.22, 0.38, -0.06, trimCol);
        addEyes(head, 0.35, 0.06, 0.16, 0xfacc15, true);
        if (isZac) {
          // Giant Glowing Golden Sword held in Zacian's mouth!
          addBox(head, 2.15, 0.16, 0.16, 0.25, -0.14, 0.38, 0xfacc15, { emissive: 0xfacc15, emissiveIntensity: 1.0 });
        }
        root.add(head);
        [[-0.30, 0.46], [0.30, 0.46], [-0.30, -0.46], [0.30, -0.46]].forEach(([x, z]) => {
          anim.legs.push(addBox(root, 0.22, 0.62, 0.24, x, 0.31, z, trimCol));
        });
        break;
      }

      // ---------- OTHER GIANT LEGENDARIES & PSEUDOS (CUSTOM COLOR-KEYED SILHOUETTES!) ----------
      case 'garchomp':
      case 'tyranitar':
      case 'dialga':
      case 'palkia':
      case 'giratina':
      case 'zekrom':
      case 'reshiram':
      case 'lugia':
      case 'hooh':
      case 'darkrai':
      case 'eternatus':
      case 'baxcalibur': {
        const themes = {
          garchomp:  { body: 0x1e3a8a, accent: 0xef4444, glow: 0xfacc15, wings: false, float: false },
          tyranitar: { body: 0x4d7c0f, accent: 0x38bdf8, glow: 0xa3e635, wings: false, float: false },
          dialga:    { body: 0x1d4ed8, accent: 0xcbd5e1, glow: 0x22d3ee, wings: false, float: false },
          palkia:    { body: 0xf8fafc, accent: 0xec4899, glow: 0xe879f9, wings: true,  float: false },
          giratina:  { body: 0x1e293b, accent: 0xfacc15, glow: 0xef4444, wings: true,  float: true  },
          zekrom:    { body: 0x0f172a, accent: 0x334155, glow: 0x22d3ee, wings: true,  float: false },
          reshiram:  { body: 0xf8fafc, accent: 0xe2e8f0, glow: 0xf97316, wings: true,  float: false },
          lugia:     { body: 0xf1f5f9, accent: 0x1d4ed8, glow: 0x38bdf8, wings: true,  float: true  },
          hooh:      { body: 0xef4444, accent: 0xfacc15, glow: 0x22c55e, wings: true,  float: true  },
          darkrai:   { body: 0x0f172a, accent: 0xef4444, glow: 0x38bdf8, wings: false, float: true  },
          eternatus: { body: 0x4c1d95, accent: 0xf43f5e, glow: 0x22d3ee, wings: true,  float: true  },
          baxcalibur:{ body: 0x334155, accent: 0x38bdf8, glow: 0xef4444, wings: false, float: false }
        };
        const th = themes[speciesId];
        anim.floatMode = th.float;
        const wrap = new THREE.Group();
        addBox(wrap, 1.06, 1.18, 0.94, 0, 1.06, 0, th.body);
        addBox(wrap, 0.72, 0.86, 0.24, 0, 1.02, 0.42, th.accent, { emissive: th.glow, emissiveIntensity: 0.45 });
        // Dorsal blade / crystal core
        addBox(wrap, 0.26, 0.96, 0.44, 0, 1.38, -0.46, th.glow, { emissive: th.glow, emissiveIntensity: 0.9 });
        const head = new THREE.Group(); head.position.set(0, 1.98, 0.26);
        addBox(head, 0.68, 0.56, 0.78, 0, 0, 0, th.body);
        addBox(head, 0.20, 0.38, 0.42, -0.32, 0.30, -0.18, th.accent);
        addBox(head, 0.20, 0.38, 0.42,  0.32, 0.30, -0.18, th.accent);
        addEyes(head, 0.40, 0.08, 0.20, th.glow, true);
        wrap.add(head);
        if (!th.float) {
          anim.legs.push(addBox(wrap, 0.36, 0.56, 0.42, -0.36, 0.28, 0.04, th.body));
          anim.legs.push(addBox(wrap, 0.36, 0.56, 0.42,  0.36, 0.28, 0.04, th.body));
        }
        addBox(wrap, 0.26, 0.68, 0.28, -0.68, 1.18, 0.24, th.accent);
        addBox(wrap, 0.26, 0.68, 0.28,  0.68, 1.18, 0.24, th.accent);
        if (th.wings) {
          const wL = new THREE.Group(); wL.position.set(-0.52, 1.44, -0.30);
          addBox(wL, 1.55, 0.96, 0.14, -0.78, 0.32, -0.14, th.accent, { emissive: th.glow, emissiveIntensity: 0.55 });
          wrap.add(wL); anim.wingsL.push(wL);
          const wR = new THREE.Group(); wR.position.set(0.52, 1.44, -0.30);
          addBox(wR, 1.55, 0.96, 0.14,  0.78, 0.32, -0.14, th.accent, { emissive: th.glow, emissiveIntensity: 0.55 });
          wrap.add(wR); anim.wingsR.push(wR);
        }
        const tail = addBox(wrap, 0.42, 0.42, 1.16, 0, 0.66, -0.96, th.glow, { emissive: th.glow, emissiveIntensity: 0.65 });
        anim.extras.push({ obj: tail, type: 'wag' });
        root.add(wrap);
        break;
      }

      // ---------- PIKACHU & MEGA RAICHU ----------
      default: {
        const col = isMega ? 0xf97316 : 0xfacc15;
        addBox(root, 0.68, 0.68, 0.58, 0, 0.62, 0, col);
        const head = new THREE.Group(); head.position.set(0, 1.18, 0.08);
        addBox(head, 0.64, 0.56, 0.56, 0, 0, 0, isMega ? 0xfb923c : 0xfde047);
        addBox(head, 0.14, 0.14, 0.08, -0.28, -0.08, 0.26, isMega ? 0x22d3ee : 0xef4444, { emissive: isMega ? 0x22d3ee : 0xef4444, emissiveIntensity: 0.9 });
        addBox(head, 0.14, 0.14, 0.08,  0.28, -0.08, 0.26, isMega ? 0x22d3ee : 0xef4444, { emissive: isMega ? 0x22d3ee : 0xef4444, emissiveIntensity: 0.9 });
        addBox(head, 0.15, 0.42, 0.12, -0.22, 0.46, 0, col);
        addBox(head, 0.15, 0.18, 0.12, -0.22, 0.72, 0, 0x0f172a);
        addBox(head, 0.15, 0.42, 0.12,  0.22, 0.46, 0, col);
        addBox(head, 0.15, 0.18, 0.12,  0.22, 0.72, 0, 0x0f172a);
        addEyes(head, 0.29, 0.05, 0.16);
        root.add(head);
        anim.legs.push(addBox(root, 0.20, 0.30, 0.24, -0.22, 0.15, 0.04, 0x78350f));
        anim.legs.push(addBox(root, 0.20, 0.30, 0.24,  0.22, 0.15, 0.04, 0x78350f));
        const tail = new THREE.Group(); tail.position.set(0, 0.56, -0.34);
        addBox(tail, 0.12, 0.40, 0.52, 0, 0.26, -0.44, 0xfacc15, { emissive: 0xfacc15, emissiveIntensity: 0.95 });
        root.add(tail); anim.extras.push({ obj: tail, type: 'wag' });
        if (isMega) { root.scale.setScalar(1.18); attachMegaAura(root, anim, 0xfacc15, 0x22d3ee); }
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
    parts.wingsL.forEach((w) => { w.rotation.y = Math.sin(time * 5.0) * 0.34 - 0.15; });
    parts.wingsR.forEach((w) => { w.rotation.y = -Math.sin(time * 5.0) * 0.34 + 0.15; });
    parts.extras.forEach((ex) => {
      if (ex.type === 'wag') ex.obj.rotation.y = Math.sin(time * 5.2) * 0.34;
      else if (ex.type === 'spin') ex.obj.rotation.y = time * 1.4;
      else if (ex.type === 'spinZ') ex.obj.rotation.z = time * 4.5;
    });
    if (parts.floatMode && mesh.children[0]) {
      mesh.children[0].position.y = 1.0 + Math.sin(time * 3.0) * 0.18;
    }
  }

  // ================================================================
  // 3D COLLECTIBLE POWER ORB (SCATTERED AROUND THE CITIES!)
  // ================================================================
  function buildPowerOrbMesh() {
    const group = new THREE.Group();

    // Glowing Inner Core Cube
    const core = addBox(group, 0.56, 0.56, 0.56, 0, 1.05, 0, 0xfacc15, {
      emissive: 0xf97316, emissiveIntensity: 1.0, castShadow: false
    });
    core.rotation.set(0.7, 0.7, 0.7);

    // Outer Rotating Magenta Energy Frame
    const frame = addBox(group, 0.76, 0.16, 0.76, 0, 1.05, 0, 0xf43f5e, {
      emissive: 0xf43f5e, emissiveIntensity: 1.0, castShadow: false
    });

    // Vertical Light Beacon shooting into the sky so players can easily spot Orbs!
    const beamMat = new THREE.MeshBasicMaterial({
      color: 0xfacc15, transparent: true, opacity: 0.24, side: THREE.DoubleSide
    });
    const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.42, 16, 8, 1, true), beamMat);
    beam.position.y = 8.0;
    group.add(beam);

    // Label sprite
    const c = document.createElement('canvas'); c.width = 256; c.height = 64;
    const ctx = c.getContext('2d');
    ctx.fillStyle = 'rgba(20, 8, 28, 0.85)'; ctx.fillRect(6, 6, 244, 52);
    ctx.strokeStyle = '#facc15'; ctx.lineWidth = 3; ctx.strokeRect(6, 6, 244, 52);
    ctx.fillStyle = '#fef08a'; ctx.font = 'bold 21px Orbitron, Arial, sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('⚡ ORBE DE PODER', 128, 40);
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(c), transparent: true }));
    sp.position.y = 2.25; sp.scale.set(2.4, 0.6, 1);
    group.add(sp);

    group.userData = { core, frame, beam };
    return group;
  }

  // Player Avatar (Lorenzo Mega Champion)
  function buildPlayerMesh() {
    const root = new THREE.Group();
    const leftLeg = new THREE.Group(); leftLeg.position.set(-0.18, 0.64, 0);
    addBox(leftLeg, 0.26, 0.64, 0.28, 0, -0.32, 0, 0x0f172a);
    addBox(leftLeg, 0.28, 0.14, 0.34, 0, -0.58, 0.03, 0xa855f7);
    root.add(leftLeg);

    const rightLeg = new THREE.Group(); rightLeg.position.set(0.18, 0.64, 0);
    addBox(rightLeg, 0.26, 0.64, 0.28, 0, -0.32, 0, 0x0f172a);
    addBox(rightLeg, 0.28, 0.14, 0.34, 0, -0.58, 0.03, 0xa855f7);
    root.add(rightLeg);

    addBox(root, 0.66, 0.72, 0.38, 0, 1.00, 0, 0x7c3aed); // Mega Champion Purple-Cyan Jacket
    addBox(root, 0.22, 0.70, 0.40, 0, 1.00, 0, 0x22d3ee);
    addBox(root, 0.48, 0.52, 0.24, 0, 1.02, -0.30, 0x1e293b);
    addBox(root, 0.18, 0.18, 0.08, 0, 1.04, -0.43, 0xfacc15, { emissive: 0xfacc15, emissiveIntensity: 0.9 });

    const leftArm = new THREE.Group(); leftArm.position.set(-0.46, 1.28, 0);
    addBox(leftArm, 0.22, 0.62, 0.24, 0, -0.26, 0, 0x9333ea);
    // Glowing Mega Bracelet on wrist!
    addBox(leftArm, 0.26, 0.12, 0.28, 0, -0.44, 0, 0x22d3ee, { emissive: 0x22d3ee, emissiveIntensity: 1.0 });
    addBox(leftArm, 0.20, 0.16, 0.22, 0, -0.56, 0, 0xfdba74);
    root.add(leftArm);

    const rightArm = new THREE.Group(); rightArm.position.set(0.46, 1.28, 0);
    addBox(rightArm, 0.22, 0.62, 0.24, 0, -0.26, 0, 0x9333ea);
    addBox(rightArm, 0.20, 0.18, 0.22, 0, -0.56, 0, 0xfdba74);
    root.add(rightArm);

    const head = new THREE.Group(); head.position.set(0, 1.66, 0);
    addBox(head, 0.56, 0.54, 0.56, 0, 0, 0, 0xfdba74);
    addBox(head, 0.60, 0.24, 0.60, 0, 0.22, 0, 0x0f172a);
    addBox(head, 0.60, 0.08, 0.30, 0, 0.12, 0.36, 0xa855f7);
    addBox(head, 0.24, 0.12, 0.06, 0, 0.24, 0.31, 0x22d3ee, { emissive: 0x22d3ee, emissiveIntensity: 0.9 });
    addEyes(head, 0.29, -0.02, 0.13);
    root.add(head);

    root.userData.limbs = { leftLeg, rightLeg, leftArm, rightArm, head };
    return root;
  }

  function animatePlayer(mesh, time, moveSpeed, isGrounded) {
    const limbs = mesh.userData.limbs;
    if (!limbs) return;
    if (!isGrounded) {
      limbs.leftLeg.rotation.x = 0.45; limbs.rightLeg.rotation.x = -0.35;
      limbs.leftArm.rotation.x = -0.7; limbs.rightArm.rotation.x = -0.7;
      return;
    }
    if (moveSpeed > 0.15) {
      const s = Math.sin(time * 11) * 0.65;
      limbs.leftLeg.rotation.x = s; limbs.rightLeg.rotation.x = -s;
      limbs.leftArm.rotation.x = -s * 0.85; limbs.rightArm.rotation.x = s * 0.85;
    } else {
      limbs.leftLeg.rotation.x *= 0.82; limbs.rightLeg.rotation.x *= 0.82;
      limbs.leftArm.rotation.x = Math.sin(time * 2.2) * 0.06;
      limbs.rightArm.rotation.x = -Math.sin(time * 2.2) * 0.06;
    }
  }

  function buildPokeCuboMesh(isMaster = false) {
    const g = new THREE.Group();
    const topCol = isMaster ? 0x7e22ce : 0xef4444;
    const bandCol = isMaster ? 0xec4899 : 0x0f172a;
    const btnCol = isMaster ? 0xfacc15 : 0x22d3ee;
    addBox(g, 0.52, 0.22, 0.52, 0,  0.14, 0, topCol);
    addBox(g, 0.54, 0.08, 0.54, 0,  0.00, 0, bandCol);
    addBox(g, 0.52, 0.22, 0.52, 0, -0.14, 0, 0xf8fafc);
    addBox(g, 0.16, 0.16, 0.08, 0,  0.00, 0.27, btnCol, { emissive: btnCol, emissiveIntensity: 1.0 });
    return g;
  }

  function buildNameplateSprite(name, level, type, isPartner = false, isMega = false) {
    const c = document.createElement('canvas'); c.width = 360; c.height = 96;
    const ctx = c.getContext('2d');
    const color = isMega ? '#e879f9' : isPartner ? '#facc15' : (global.L3Data.TYPE_COLORS[type] || '#22d3ee');
    const label = isPartner ? 'SEU PARCEIRO • E: Mega • Q: Destruir' : ((global.L3Data.TYPE_LABELS[type] || type).toUpperCase() + ' • Clique p/ batalhar');

    ctx.fillStyle = 'rgba(10, 14, 28, 0.86)';
    roundRect(ctx, 10, 10, 340, 76, 18); ctx.fill();
    ctx.lineWidth = 3.5; ctx.strokeStyle = color; ctx.stroke();

    ctx.fillStyle = color; roundRect(ctx, 22, 22, 16, 52, 6); ctx.fill();
    ctx.fillStyle = isMega ? '#f5d0fe' : '#f8fafc';
    ctx.font = 'bold 26px Outfit, Arial, sans-serif';
    ctx.fillText((isMega ? '🧬 ' : '') + name, 48, 48);

    ctx.fillStyle = '#facc15'; ctx.font = 'bold 22px Orbitron, Arial, sans-serif'; ctx.textAlign = 'right';
    ctx.fillText('Nv.' + level, 334, 48);

    ctx.textAlign = 'left'; ctx.fillStyle = '#cbd5e1'; ctx.font = 'bold 14px Outfit, Arial, sans-serif';
    ctx.fillText(label, 48, 72);

    const tex = new THREE.CanvasTexture(c); tex.minFilter = THREE.LinearFilter;
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true }));
    sp.scale.set(3.0, 0.84, 1);
    return sp;
  }

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y); ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r); ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h); ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y); ctx.closePath();
  }

  function buildTargetRing(color = 0xfacc15) {
    const geo = new THREE.RingGeometry(0.95, 1.2, 24);
    const mat = new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide, transparent: true, opacity: 0.9 });
    const m = new THREE.Mesh(geo, mat); m.rotation.x = -Math.PI / 2;
    return m;
  }

  // ================================================================
  // SPECIAL OFF-MAP FLOATING COSMIC TITAN ARENA (3 vs 1 GIANT RAIDS!)
  // ================================================================
  function buildTitanArena(originY = 160) {
    const arena = new THREE.Group();
    arena.position.set(0, originY, 0);

    // Massive Obsidian & Gold Octagonal Voxel Battle Platform (Radius ~18)
    const floorMat = new THREE.MeshLambertMaterial({ color: 0x111827 });
    const trimMat  = new THREE.MeshStandardMaterial({ color: 0xfacc15, emissive: 0xd97706, emissiveIntensity: 0.65 });
    const neonMat  = new THREE.MeshStandardMaterial({ color: 0x22d3ee, emissive: 0x06b6d4, emissiveIntensity: 0.9 });
    const bossMat  = new THREE.MeshStandardMaterial({ color: 0xf43f5e, emissive: 0xe11d48, emissiveIntensity: 0.95 });

    const base = new THREE.Mesh(new THREE.CylinderGeometry(18.5, 16, 2.2, 8), floorMat);
    base.position.y = -1.1;
    base.receiveShadow = true;
    arena.add(base);

    // Golden Rim Ring
    const rim = new THREE.Mesh(new THREE.RingGeometry(15.6, 17.4, 32), trimMat);
    rim.rotation.x = -Math.PI / 2;
    rim.position.y = 0.06;
    arena.add(rim);

    // Inner Neon Energy Arena Circle
    const innerRing = new THREE.Mesh(new THREE.RingGeometry(9.6, 10.3, 32), neonMat);
    innerRing.rotation.x = -Math.PI / 2;
    innerRing.position.y = 0.07;
    arena.add(innerRing);

    // 8 Towering Cosmic Monolith Pillars around the Colosseum!
    const crystals = [];
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      const px = Math.cos(a) * 16.5;
      const pz = Math.sin(a) * 16.5;
      addBox(arena, 2.0, 9.5, 2.0, px, 4.75, pz, 0x1e1b4b);
      addBox(arena, 2.3, 0.7, 2.3, px, 9.6, pz, 0xfacc15, { emissive: 0xd97706, emissiveIntensity: 0.7 });
      const cry = addBox(arena, 0.95, 1.8, 0.95, px, 11.4, pz, i % 2 === 0 ? 0xf43f5e : 0x22d3ee, {
        emissive: i % 2 === 0 ? 0xf43f5e : 0x22d3ee, emissiveIntensity: 1.0, castShadow: false
      });
      crystals.push(cry);
    }

    // Floating Cosmic Star Cubes surrounding the floating stadium
    const starGeo = new THREE.BoxGeometry(0.45, 0.45, 0.45);
    const starMat1 = new THREE.MeshBasicMaterial({ color: 0xfef08a });
    const starMat2 = new THREE.MeshBasicMaterial({ color: 0x67e8f9 });
    for (let s = 0; s < 70; s++) {
      const sa = (s / 70) * Math.PI * 6;
      const sr = 24 + (s % 7) * 5;
      const sy = -6 + ((s * 17) % 34);
      const st = new THREE.Mesh(starGeo, s % 2 === 0 ? starMat1 : starMat2);
      st.position.set(Math.cos(sa) * sr, sy, Math.sin(sa) * sr);
      arena.add(st);
    }

    // Dramatic Arena Lights
    const bossLight = new THREE.PointLight(0xf43f5e, 1.8, 38);
    bossLight.position.set(0, 12, -6);
    arena.add(bossLight);
    const squadLight = new THREE.PointLight(0x22d3ee, 1.6, 36);
    squadLight.position.set(0, 10, 8);
    arena.add(squadLight);

    // Huge Boss Pedestal Ring at (0, 0.1, -6.5)
    const bossPad = new THREE.Mesh(new THREE.RingGeometry(3.2, 4.1, 32), bossMat);
    bossPad.rotation.x = -Math.PI / 2;
    bossPad.position.set(0, 0.09, -6.2);
    arena.add(bossPad);

    arena.userData = { crystals, bossPad };
    arena.visible = false;
    return arena;
  }

  global.L3Voxels = {
    createCityMaterials,
    buildPokemonMesh,
    animatePokemon,
    buildPowerOrbMesh,
    buildPlayerMesh,
    animatePlayer,
    buildPokeCuboMesh,
    buildNameplateSprite,
    buildTargetRing,
    buildTitanArena
  };
})(window);
