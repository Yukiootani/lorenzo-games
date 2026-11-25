/* ================================================================
   LORENZO GAME 3 — 5 Cities, Collectible Power Orbs & Quake Shake
   ================================================================ */
(function (global) {
  'use strict';

  const WORLD_RADIUS = 28;

  class CityWorld3 {
    constructor(scene, sunLight) {
      this.scene = scene;
      this.sunLight = sunLight;
      this.worldRadius = WORLD_RADIUS;
      this.materials = global.L3Voxels.createCityMaterials();
      this.boxGeo = new THREE.BoxGeometry(1, 1, 1);

      this.cityGroup = new THREE.Group();
      this.scene.add(this.cityGroup);

      this.currentCityId = 'mesagoza';
      this.heightMap = new Map();
      this.solidObstacles = new Set();
      this.waterCols = new Set();
      this.stoneCols = new Set();
      this.animatedLiquid = null;
      this.clouds = [];
      this.healCrystal = null;
      this.healPos = new THREE.Vector3(0, 3.5, -10);

      // Collectible Power Orbs scattered in the environment!
      this.powerOrbs = [];

      // City Structure Earthquake State (for Total Destruction!)
      this.quakeTime = 0;
      this.quakeMaxTime = 1;
      this.quakeIntensity = 0;
    }

    _k(x, z) { return x + ',' + z; }

    _hash(x, z, s = 1) {
      const n = Math.sin(x * 127.1 + z * 311.7 + s * 53.3) * 43758.5453;
      return n - Math.floor(n);
    }

    clearCity() {
      while (this.cityGroup.children.length > 0) this.cityGroup.remove(this.cityGroup.children[0]);
      for (const orb of this.powerOrbs) this.scene.remove(orb.mesh);
      this.powerOrbs = [];
      this.heightMap.clear();
      this.solidObstacles.clear();
      this.waterCols.clear();
      this.stoneCols.clear();
      this.clouds = [];
      this.animatedLiquid = null;
      this.healCrystal = null;
      this.cityGroup.position.set(0, 0, 0);
      this.cityGroup.rotation.set(0, 0, 0);
    }

    loadCity(cityId) {
      const cfg = global.L3Data.CITIES[cityId] || global.L3Data.CITIES.mesagoza;
      this.currentCityId = cfg.id;
      this.clearCity();

      this.scene.background = new THREE.Color(cfg.skyColor);
      this.scene.fog = new THREE.FogExp2(cfg.fogColor, cfg.id === 'neotokyo' || cfg.id === 'vulcanica' ? 0.0155 : 0.013);
      if (this.sunLight) this.sunLight.color.setHex(cfg.sunColor);

      const blocks = {
        grass: [], dirt: [], stone: [], road: [], water: [], lava: [], obsidian: [],
        wood: [], leaves: [], wall: [], roofRed: [], roofBlue: [], roofGold: [],
        roofPurple: [], neonRoad: [], neonTower: [], marble: [], windowGlow: []
      };
      const R = this.worldRadius;

      const setGround = (x, z, h, type) => {
        this.heightMap.set(this._k(x, z), h);
        blocks[type].push([x, h, z]);
        if (['stone', 'road', 'obsidian', 'neonRoad', 'marble'].includes(type)) this.stoneCols.add(this._k(x, z));
        for (let y = h - 1; y >= 1; y--) {
          const under = cfg.id === 'vulcanica' ? 'obsidian' : cfg.id === 'prehistorico' ? 'stone' : 'dirt';
          blocks[under].push([x, y, z]);
        }
      };

      const addBuilding = (cx, cz, w, d, h, wallType, roofType, isCenter = false) => {
        const baseH = this.heightMap.get(this._k(cx, cz)) || 2;
        const x0 = cx - Math.floor(w / 2);
        const z0 = cz - Math.floor(d / 2);
        for (let x = x0; x < x0 + w; x++) {
          for (let z = z0; z < z0 + d; z++) {
            this.solidObstacles.add(this._k(x, z));
            for (let y = 1; y <= h; y++) {
              const isEdge = x === x0 || x === x0 + w - 1 || z === z0 || z === z0 + d - 1;
              if (!isEdge) continue;
              const isDoor = z === z0 + d - 1 && x === cx && y <= 2;
              if (isDoor) continue;
              const isWin = y === 2 && ((x === cx - 1 || x === cx + 1) && (z === z0 + d - 1 || z === z0));
              blocks[isWin ? 'windowGlow' : wallType].push([x, baseH + y, z]);
            }
            blocks[roofType].push([x, baseH + h + 1, z]);
          }
        }
        for (let x = x0 + 1; x < x0 + w - 1; x++) {
          for (let z = z0 + 1; z < z0 + d - 1; z++) {
            blocks[roofType].push([x, baseH + h + 2, z]);
          }
        }
        if (isCenter) {
          this._addSign(cx, baseH + h + 4.1, z0 + d - 0.5, '🏥 CENTRO POKÉMON', '#f43f5e');
          this.healPos.set(cx, baseH + 0.5, z0 + d + 2.2);
        }
      };

      const addTree = (x, z) => {
        if (this.solidObstacles.has(this._k(x, z)) || this.waterCols.has(this._k(x, z))) return;
        const h = this.heightMap.get(this._k(x, z)) || 2;
        this.solidObstacles.add(this._k(x, z));
        for (let ty = 1; ty <= 3; ty++) blocks.wood.push([x, h + ty, z]);
        const top = h + 3;
        for (let lx = -1; lx <= 1; lx++) {
          for (let lz = -1; lz <= 1; lz++) {
            blocks.leaves.push([x + lx, top, z + lz]);
            if (Math.abs(lx) + Math.abs(lz) <= 1) blocks.leaves.push([x + lx, top + 1, z + lz]);
          }
        }
      };

      // Terrain Generation per City
      for (let x = -R; x <= R; x++) {
        for (let z = -R; z <= R; z++) {
          const isRoad = Math.abs(x) <= 2 || Math.abs(z) <= 2;
          const isPlaza = Math.abs(x) <= 5 && Math.abs(z) <= 5;

          if (cfg.id === 'mesagoza') {
            if (isPlaza || isRoad) setGround(x, z, 2, 'road');
            else setGround(x, z, Math.hypot(x, z) > 22 ? 3 : 2, 'grass');
          } else if (cfg.id === 'neotokyo') {
            if (isPlaza || isRoad || Math.abs(x) === 12 || Math.abs(z) === 12) setGround(x, z, 2, 'neonRoad');
            else setGround(x, z, 2, 'obsidian');
          } else if (cfg.id === 'vulcanica') {
            const lavaRing = Math.abs(Math.hypot(x, z) - 16) < 2.2 && !isRoad;
            if (lavaRing) {
              this.heightMap.set(this._k(x, z), 1);
              blocks.obsidian.push([x, 1, z]); blocks.lava.push([x, 2, z]);
              this.waterCols.add(this._k(x, z));
            } else if (isPlaza || isRoad) setGround(x, z, 2, 'stone');
            else setGround(x, z, Math.hypot(x, z) > 20 ? 4 : 2, 'obsidian');
          } else if (cfg.id === 'ninja') {
            const canal = (Math.abs(x - 10) <= 1 || Math.abs(x + 10) <= 1) && Math.abs(z) > 2;
            if (canal) {
              this.heightMap.set(this._k(x, z), 1);
              blocks.dirt.push([x, 1, z]); blocks.water.push([x, 2, z]);
              this.waterCols.add(this._k(x, z));
            } else if (isPlaza || isRoad) setGround(x, z, 2, 'wood');
            else setGround(x, z, 2, 'grass');
          } else {
            // Santuário Mega Pré-Histórico
            const dist = Math.hypot(x, z);
            if (isPlaza || isRoad) setGround(x, z, 3, 'marble');
            else setGround(x, z, dist > 20 ? 5 : 3, dist > 18 ? 'stone' : 'grass');
          }
        }
      }

      // Buildings & Landmarks
      const centerWall = cfg.id === 'neotokyo' ? 'neonTower' : cfg.id === 'prehistorico' ? 'marble' : 'wall';
      addBuilding(0, -11, 7, 5, 4, centerWall, 'roofRed', true);

      if (cfg.id === 'mesagoza') {
        addBuilding(-11, -10, 5, 5, 4, 'wall', 'roofPurple');
        addBuilding(11, -10, 5, 5, 4, 'wall', 'roofGold');
        addBuilding(-11, 10, 5, 5, 3, 'wall', 'roofBlue');
        addBuilding(11, 10, 5, 5, 3, 'wall', 'roofRed');
        for (let i = -24; i <= 24; i += 6) { addTree(i, -22); addTree(i, 22); addTree(-22, i); addTree(22, i); }
      } else if (cfg.id === 'neotokyo') {
        addBuilding(-9, -9, 5, 5, 8, 'neonTower', 'roofPurple');
        addBuilding(9, -9, 5, 5, 9, 'neonTower', 'roofBlue');
        addBuilding(-9, 9, 5, 5, 7, 'neonTower', 'roofGold');
        addBuilding(9, 9, 5, 5, 10, 'neonTower', 'roofPurple');
        addBuilding(-19, 0, 5, 5, 8, 'neonTower', 'roofBlue');
        addBuilding(19, 0, 5, 5, 8, 'neonTower', 'roofRed');
      } else if (cfg.id === 'vulcanica') {
        addBuilding(-10, -9, 5, 5, 4, 'obsidian', 'roofRed');
        addBuilding(10, -9, 5, 5, 4, 'obsidian', 'roofGold');
        addBuilding(-10, 9, 5, 5, 4, 'stone', 'roofRed');
        addBuilding(10, 9, 5, 5, 4, 'stone', 'roofPurple');
      } else if (cfg.id === 'ninja') {
        addBuilding(-16, -9, 5, 5, 4, 'wall', 'roofBlue');
        addBuilding(16, -9, 5, 5, 4, 'wall', 'roofBlue');
        addBuilding(-16, 10, 5, 5, 3, 'wall', 'roofPurple');
        addBuilding(16, 10, 5, 5, 3, 'wall', 'roofRed');
        [[-5, 8], [5, 8], [-16, 1], [16, 1], [-22, -16], [22, -16]].forEach(([x, z]) => addTree(x, z));
      } else {
        addBuilding(-11, -9, 5, 5, 5, 'marble', 'roofPurple');
        addBuilding(11, -9, 5, 5, 5, 'marble', 'roofGold');
        addBuilding(-11, 10, 5, 5, 4, 'marble', 'roofBlue');
        addBuilding(11, 10, 5, 5, 4, 'marble', 'roofPurple');
        [[-6, -6], [6, -6], [-6, 6], [6, 6]].forEach(([px, pz]) => {
          this.solidObstacles.add(this._k(px, pz));
          blocks.marble.push([px, 4, pz], [px, 5, pz], [px, 6, pz]);
          blocks.windowGlow.push([px, 7, pz]);
        });
      }

      const dummy = new THREE.Object3D();
      const buildInst = (key, castShadow = true) => {
        const arr = blocks[key];
        if (!arr || arr.length === 0) return null;
        const inst = new THREE.InstancedMesh(this.boxGeo, this.materials[key], arr.length);
        for (let i = 0; i < arr.length; i++) {
          dummy.position.set(arr[i][0], arr[i][1], arr[i][2]);
          dummy.scale.set(1, 1, 1);
          dummy.updateMatrix();
          inst.setMatrixAt(i, dummy.matrix);
        }
        inst.instanceMatrix.needsUpdate = true;
        inst.castShadow = castShadow;
        inst.receiveShadow = true;
        this.cityGroup.add(inst);
        return inst;
      };

      Object.keys(blocks).forEach((k) => {
        const isLiq = k === 'water' || k === 'lava';
        const mesh = buildInst(k, !isLiq && k !== 'dirt');
        if (isLiq && mesh) this.animatedLiquid = mesh;
      });

      this._buildHealingCrystal();
      this._buildClouds(cfg.id);
      this._addSign(0, 6.4, 0, `${cfg.emoji} ${cfg.name.toUpperCase()}`, '#e879f9');
      this.spawnPowerOrbs(5);
    }

    // ================================================================
    // SCATTERED COLLECTIBLE POWER ORBS (COLLECT 3 FOR TOTAL DESTRUCTION!)
    // ================================================================
    spawnPowerOrbs(count = 5) {
      // Ensure 1 orb is visible near the plaza so players immediately discover the mechanic!
      const presetSpots = [
        [7, 2],
        [-8, -4],
        [13, 13],
        [-14, 14],
        [15, -15]
      ];
      for (let i = 0; i < count; i++) {
        let pt;
        if (i < presetSpots.length && !this.solidObstacles.has(this._k(presetSpots[i][0], presetSpots[i][1]))) {
          pt = { x: presetSpots[i][0], z: presetSpots[i][1] };
        } else {
          pt = this.getRandomSpawnPoint();
        }
        this._addOneOrb(pt.x, pt.z);
      }
    }

    _addOneOrb(x, z) {
      const mesh = global.L3Voxels.buildPowerOrbMesh();
      const y = this.getWalkableY(x, z);
      mesh.position.set(x, y, z);
      this.scene.add(mesh);
      this.powerOrbs.push({ mesh, x, z, y, phase: Math.random() * Math.PI * 2 });
    }

    collectOrb(orb) {
      this.scene.remove(orb.mesh);
      const idx = this.powerOrbs.indexOf(orb);
      if (idx !== -1) this.powerOrbs.splice(idx, 1);
      // Respawn a fresh orb elsewhere in the city after 5 seconds!
      setTimeout(() => {
        if (this.powerOrbs.length < 5) {
          const pt = this.getRandomSpawnPoint();
          this._addOneOrb(pt.x, pt.z);
        }
      }, 5000);
    }

    // VIOLENTLY SHAKE THE ENTIRE 3D CITY STRUCTURE!
    triggerStructureQuake(duration = 2.1, intensity = 0.65) {
      this.quakeTime = duration;
      this.quakeMaxTime = duration;
      this.quakeIntensity = intensity;
    }

    _addSign(x, y, z, text, borderColor) {
      const c = document.createElement('canvas'); c.width = 440; c.height = 84;
      const ctx = c.getContext('2d');
      ctx.fillStyle = 'rgba(10, 14, 28, 0.84)'; ctx.fillRect(8, 8, 424, 68);
      ctx.strokeStyle = borderColor; ctx.lineWidth = 4; ctx.strokeRect(8, 8, 424, 68);
      ctx.fillStyle = '#f8fafc'; ctx.font = 'bold 28px Outfit, Arial, sans-serif'; ctx.textAlign = 'center';
      ctx.fillText(text, 220, 52);
      const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(c), transparent: true }));
      sp.position.set(x, y, z); sp.scale.set(4.4, 0.85, 1);
      this.cityGroup.add(sp);
    }

    _buildHealingCrystal() {
      const g = new THREE.Group(); g.position.copy(this.healPos);
      const base = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.35, 1.6), new THREE.MeshLambertMaterial({ color: 0x1e293b }));
      base.position.y = 0.175; g.add(base);
      const crystal = new THREE.Mesh(
        new THREE.BoxGeometry(0.55, 0.55, 0.55),
        new THREE.MeshStandardMaterial({ color: 0x4ade80, emissive: 0x22c55e, emissiveIntensity: 0.9 })
      );
      crystal.position.y = 1.15; crystal.rotation.set(0.6, 0.5, 0.6); g.add(crystal);
      const light = new THREE.PointLight(0x4ade80, 1.2, 9); light.position.y = 1.4; g.add(light);
      this.cityGroup.add(g); this.healCrystal = crystal;
    }

    _buildClouds(cityId) {
      const col = cityId === 'vulcanica' ? 0x7c2d12 : cityId === 'neotokyo' ? 0x312e81 : 0xffffff;
      const mat = new THREE.MeshLambertMaterial({ color: col, transparent: true, opacity: 0.8 });
      for (let i = 0; i < 12; i++) {
        const c = new THREE.Group();
        const b = new THREE.Mesh(this.boxGeo, mat);
        b.scale.set(5 + (i % 3) * 2, 1.1, 3 + (i % 2) * 2);
        c.add(b);
        c.position.set((this._hash(i, 1) - 0.5) * 85, 21 + this._hash(i, 2) * 8, (this._hash(i, 3) - 0.5) * 85);
        c.userData.speed = 0.4 + this._hash(i, 4) * 0.6;
        this.cityGroup.add(c); this.clouds.push(c);
      }
    }

    update(dt, time) {
      if (this.animatedLiquid) this.animatedLiquid.position.y = Math.sin(time * 2.1) * 0.05;
      if (this.healCrystal) {
        this.healCrystal.rotation.y = time * 1.6;
        this.healCrystal.position.y = 1.15 + Math.sin(time * 2.8) * 0.14;
      }
      for (const c of this.clouds) {
        c.position.x += c.userData.speed * dt;
        if (c.position.x > 48) c.position.x = -48;
      }

      // Animate Floating Power Orbs
      for (const orb of this.powerOrbs) {
        const u = orb.mesh.userData;
        const bob = Math.sin(time * 3.2 + orb.phase) * 0.24;
        u.core.position.y = 1.05 + bob;
        u.core.rotation.y = time * 2.4 + orb.phase;
        u.core.rotation.x = time * 1.8;
        u.frame.position.y = 1.05 + bob;
        u.frame.rotation.y = -time * 3.0;
        u.frame.rotation.z = Math.sin(time * 2.2) * 0.45;
      }

      // Apply Structure Earthquake Vibration!
      if (this.quakeTime > 0) {
        this.quakeTime -= dt;
        const decay = Math.max(0, this.quakeTime / this.quakeMaxTime);
        const mag = this.quakeIntensity * decay;
        this.cityGroup.position.set(
          (Math.random() - 0.5) * mag * 2.2,
          (Math.random() - 0.5) * mag * 1.4,
          (Math.random() - 0.5) * mag * 2.2
        );
        this.cityGroup.rotation.z = (Math.random() - 0.5) * mag * 0.05;
        this.cityGroup.rotation.x = (Math.random() - 0.5) * mag * 0.04;
      } else if (this.cityGroup.position.lengthSq() > 0) {
        this.cityGroup.position.set(0, 0, 0);
        this.cityGroup.rotation.set(0, 0, 0);
      }
    }

    getBlockHeight(x, z) {
      const ix = Math.max(-this.worldRadius, Math.min(this.worldRadius, Math.round(x)));
      const iz = Math.max(-this.worldRadius, Math.min(this.worldRadius, Math.round(z)));
      const h = this.heightMap.get(this._k(ix, iz));
      return h !== undefined ? h : 2;
    }
    getSurfaceTopY(x, z) { return this.getBlockHeight(x, z) + 0.5; }
    isWaterAt(x, z) { return this.waterCols.has(this._k(Math.round(x), Math.round(z))); }
    isStoneAt(x, z) { return this.stoneCols.has(this._k(Math.round(x), Math.round(z))); }
    isBlocked(x, z) {
      const ix = Math.round(x), iz = Math.round(z);
      if (!this.solidObstacles.has(this._k(ix, iz))) return false;
      return Math.hypot(x - ix, z - iz) < 0.78;
    }
    getWalkableY(x, z) {
      const top = this.getSurfaceTopY(x, z);
      return this.isWaterAt(x, z) ? top + 0.65 : top;
    }
    getRandomSpawnPoint() {
      const R = this.worldRadius - 4;
      for (let t = 0; t < 60; t++) {
        const x = Math.round((Math.random() * 2 - 1) * R);
        const z = Math.round((Math.random() * 2 - 1) * R);
        if (Math.hypot(x, z) < 5) continue;
        if (this.solidObstacles.has(this._k(x, z))) continue;
        if (this.waterCols.has(this._k(x, z)) && this.currentCityId === 'vulcanica') continue;
        return { x, z, y: this.getWalkableY(x, z) };
      }
      return { x: 7, z: 7, y: this.getWalkableY(7, 7) };
    }
  }

  global.L3CityWorld = CityWorld3;
})(window);
