/* ================================================================
   LORENZO GAME 2 — 5 Selectable 3D Voxel Cities Builder (js2/cities2.js)
   ================================================================ */
(function (global) {
  'use strict';

  const WORLD_RADIUS = 28; // 57x57 city map

  class CityWorld {
    constructor(scene, sunLight) {
      this.scene = scene;
      this.sunLight = sunLight;
      this.worldRadius = WORLD_RADIUS;
      this.materials = global.L2Voxels.createCityMaterials();
      this.boxGeo = new THREE.BoxGeometry(1, 1, 1);

      this.cityGroup = new THREE.Group();
      this.scene.add(this.cityGroup);

      this.currentCityId = 'verdejante';
      this.heightMap = new Map();
      this.solidObstacles = new Set(); // Buildings, pillars, tree trunks
      this.waterCols = new Set();
      this.stoneCols = new Set();
      this.animatedLiquid = null;
      this.clouds = [];
      this.healCrystal = null;
      this.healPos = new THREE.Vector3(0, 3.5, -10);
    }

    _k(x, z) { return x + ',' + z; }

    _hash(x, z, s = 1) {
      const n = Math.sin(x * 127.1 + z * 311.7 + s * 53.3) * 43758.5453;
      return n - Math.floor(n);
    }

    clearCity() {
      while (this.cityGroup.children.length > 0) {
        const ch = this.cityGroup.children[0];
        this.cityGroup.remove(ch);
      }
      this.heightMap.clear();
      this.solidObstacles.clear();
      this.waterCols.clear();
      this.stoneCols.clear();
      this.clouds = [];
      this.animatedLiquid = null;
      this.healCrystal = null;
    }

    loadCity(cityId) {
      const cfg = global.L2Data.CITIES[cityId] || global.L2Data.CITIES.verdejante;
      this.currentCityId = cfg.id;
      this.clearCity();

      // Update sky, fog & sunlight to match city atmosphere
      this.scene.background = new THREE.Color(cfg.skyColor);
      this.scene.fog = new THREE.FogExp2(cfg.fogColor, cfg.id === 'eletrica' || cfg.id === 'vulcanica' ? 0.0155 : 0.0135);
      if (this.sunLight) this.sunLight.color.setHex(cfg.sunColor);

      const blocks = {
        grass: [], dirt: [], stone: [], road: [], sand: [],
        water: [], lava: [], obsidian: [], wood: [], leaves: [],
        wall: [], roofRed: [], roofBlue: [], roofGold: [],
        neonRoad: [], neonTower: [], marble: [], windowGlow: []
      };

      const R = this.worldRadius;

      // Helper to add a walkable block column
      const setGround = (x, z, h, type) => {
        this.heightMap.set(this._k(x, z), h);
        blocks[type].push([x, h, z]);
        if (type === 'stone' || type === 'road' || type === 'obsidian' || type === 'neonRoad' || type === 'marble') {
          this.stoneCols.add(this._k(x, z));
        }
        // Fill skirt down to y=1 if elevated
        for (let y = h - 1; y >= 1; y--) {
          const under = cfg.id === 'vulcanica' ? 'obsidian' : cfg.id === 'dragoes' ? 'stone' : 'dirt';
          blocks[under].push([x, y, z]);
        }
      };

      // Helper to build a Voxel House / Building
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
              const isWindow = y === 2 && ((x === cx - 1 || x === cx + 1) && (z === z0 + d - 1 || z === z0));
              blocks[isWindow ? 'windowGlow' : wallType].push([x, baseH + y, z]);
            }
            // Roof layer 1
            blocks[roofType].push([x, baseH + h + 1, z]);
          }
        }
        // Stepped Roof Layer 2
        for (let x = x0 + 1; x < x0 + w - 1; x++) {
          for (let z = z0 + 1; z < z0 + d - 1; z++) {
            blocks[roofType].push([x, baseH + h + 2, z]);
          }
        }

        if (isCenter) {
          // Iconic Glowing Sign on Pokémon Center
          this._addCitySign(cx, baseH + h + 4.0, z0 + d - 0.5, '🏥 CENTRO POKÉMON', '#f43f5e');
          this.healPos.set(cx, baseH + 0.5, z0 + d + 2.2);
        }
      };

      // Helper to build a Voxel Tree or Palm
      const addTree = (x, z, palm = false) => {
        if (this.solidObstacles.has(this._k(x, z)) || this.waterCols.has(this._k(x, z))) return;
        const h = this.heightMap.get(this._k(x, z)) || 2;
        this.solidObstacles.add(this._k(x, z));
        const th = palm ? 4 : 3;
        for (let ty = 1; ty <= th; ty++) blocks.wood.push([x, h + ty, z]);
        const top = h + th;
        if (palm) {
          blocks.leaves.push([x, top + 1, z]);
          [[1, 0], [-1, 0], [0, 1], [0, -1], [2, 0], [-2, 0], [0, 2], [0, -2]].forEach(([dx, dz]) => {
            blocks.leaves.push([x + dx, top + (Math.abs(dx) + Math.abs(dz) === 1 ? 1 : 0), z + dz]);
          });
        } else {
          for (let lx = -1; lx <= 1; lx++) {
            for (let lz = -1; lz <= 1; lz++) {
              blocks.leaves.push([x + lx, top, z + lz]);
              if (Math.abs(lx) + Math.abs(lz) <= 1) blocks.leaves.push([x + lx, top + 1, z + lz]);
            }
          }
        }
      };

      // ================================================================
      // BUILD CITY TERRAIN & ARCHITECTURE BY CITY ID
      // ================================================================
      for (let x = -R; x <= R; x++) {
        for (let z = -R; z <= R; z++) {
          const isMainRoad = Math.abs(x) <= 2 || Math.abs(z) <= 2;
          const isPlaza = Math.abs(x) <= 5 && Math.abs(z) <= 5;

          if (cfg.id === 'verdejante') {
            // Pallet-style lush village with cobblestone cross-roads & pond
            const pond = Math.hypot(x - 14, z - 12) < 6.5;
            if (pond) {
              this.heightMap.set(this._k(x, z), 1);
              blocks.dirt.push([x, 1, z]);
              blocks.water.push([x, 2, z]);
              this.waterCols.add(this._k(x, z));
            } else if (isMainRoad || isPlaza) {
              setGround(x, z, 2, 'road');
            } else {
              const hill = Math.hypot(x, z) > 21 ? 3 : 2;
              setGround(x, z, hill, 'grass');
            }
          } else if (cfg.id === 'vulcanica') {
            // Volcanic obsidian city with glowing lava moat & stone bridges!
            const inLavaRing = Math.abs(Math.hypot(x, z) - 16) < 2.2 && !isMainRoad;
            if (inLavaRing) {
              this.heightMap.set(this._k(x, z), 1);
              blocks.obsidian.push([x, 1, z]);
              blocks.lava.push([x, 2, z]);
              this.waterCols.add(this._k(x, z)); // Liquid slowing/glow
            } else if (isMainRoad || isPlaza) {
              setGround(x, z, 2, 'stone');
            } else {
              const ridge = Math.hypot(x, z) > 20 ? 4 : 2;
              setGround(x, z, ridge, 'obsidian');
            }
          } else if (cfg.id === 'costeira') {
            // Cerulean Harbor: sandy beach + turquoise ocean bay + wooden pier!
            const isOcean = z > 10;
            const isPier = Math.abs(x) <= 2 && z > 10 && z <= 22;
            if (isPier) {
              setGround(x, z, 2, 'wood');
            } else if (isOcean) {
              this.heightMap.set(this._k(x, z), 1);
              blocks.sand.push([x, 1, z]);
              blocks.water.push([x, 2, z]);
              this.waterCols.add(this._k(x, z));
            } else if (isMainRoad || isPlaza) {
              setGround(x, z, 2, 'road');
            } else if (z > 4) {
              setGround(x, z, 2, 'sand');
            } else {
              setGround(x, z, 2, 'grass');
            }
          } else if (cfg.id === 'eletrica') {
            // Cyber Neon Electric Metropolis
            if (isMainRoad || isPlaza || Math.abs(x) === 12 || Math.abs(z) === 12) {
              setGround(x, z, 2, 'neonRoad');
            } else {
              setGround(x, z, 2, 'obsidian');
            }
          } else {
            // Pico dos Dragões — Celestial Marble Sanctuary on Mountain Top!
            const dist = Math.hypot(x, z);
            const isPond = Math.abs(dist - 18) < 2.0 && !isMainRoad;
            if (isPond) {
              this.heightMap.set(this._k(x, z), 2);
              blocks.stone.push([x, 2, z]);
              blocks.water.push([x, 3, z]);
              this.waterCols.add(this._k(x, z));
            } else if (isMainRoad || isPlaza) {
              setGround(x, z, 3, 'marble');
            } else {
              const h = dist > 22 ? 5 : 3;
              setGround(x, z, h, dist > 20 ? 'stone' : 'grass');
            }
          }
        }
      }

      // ================================================================
      // PLACE ICONIC CITY BUILDINGS & LANDMARKS
      // ================================================================
      // Pokémon Center directly north of central plaza in EVERY city!
      const centerWall = cfg.id === 'eletrica' ? 'neonTower' : cfg.id === 'dragoes' ? 'marble' : 'wall';
      addBuilding(0, -11, 7, 5, 4, centerWall, 'roofRed', true);

      if (cfg.id === 'verdejante') {
        addBuilding(-11, -10, 5, 5, 3, 'wall', 'roofBlue');
        addBuilding(11, -10, 5, 5, 3, 'wall', 'roofGold');
        addBuilding(-11, 10, 5, 5, 3, 'wall', 'roofRed');
        // Lush forest border trees
        for (let i = -24; i <= 24; i += 6) {
          addTree(i, -22, false);
          addTree(i, 22, false);
          addTree(-22, i, false);
          addTree(22, i, false);
        }
        addTree(-14, 2, false);
        addTree(14, -3, false);
      } else if (cfg.id === 'vulcanica') {
        addBuilding(-10, -9, 5, 5, 4, 'obsidian', 'roofRed');
        addBuilding(10, -9, 5, 5, 4, 'obsidian', 'roofGold');
        addBuilding(-10, 9, 5, 5, 4, 'stone', 'roofRed');
        addBuilding(10, 9, 5, 5, 4, 'stone', 'roofRed');
        // Glowing lava braziers on plaza corners
        [[-5, -5], [5, -5], [-5, 5], [5, 5]].forEach(([bx, bz]) => {
          this.solidObstacles.add(this._k(bx, bz));
          blocks.obsidian.push([bx, 3, bz], [bx, 4, bz]);
          blocks.lava.push([bx, 5, bz]);
        });
      } else if (cfg.id === 'costeira') {
        addBuilding(-11, -9, 5, 5, 3, 'wall', 'roofBlue');
        addBuilding(11, -9, 5, 5, 3, 'wall', 'roofBlue');
        addBuilding(-12, 3, 5, 4, 3, 'wall', 'roofGold');
        addBuilding(12, 3, 5, 4, 3, 'wall', 'roofRed');
        // Beach Palm Trees
        [[-16, 7], [-8, 8], [8, 8], [16, 7], [-18, -2], [18, -2]].forEach(([tx, tz]) => addTree(tx, tz, true));
      } else if (cfg.id === 'eletrica') {
        // Tall Cyber Neon Skyscrapers!
        addBuilding(-9, -9, 5, 5, 7, 'neonTower', 'roofGold');
        addBuilding(9, -9, 5, 5, 8, 'neonTower', 'roofBlue');
        addBuilding(-9, 9, 5, 5, 6, 'neonTower', 'roofBlue');
        addBuilding(9, 9, 5, 5, 9, 'neonTower', 'roofGold');
        addBuilding(-19, -8, 5, 5, 7, 'neonTower', 'roofRed');
        addBuilding(19, 8, 5, 5, 8, 'neonTower', 'roofBlue');
      } else {
        // Pico dos Dragões — Golden Pagoda Temples & Crystal Pillars!
        addBuilding(-11, -9, 5, 5, 5, 'marble', 'roofGold');
        addBuilding(11, -9, 5, 5, 5, 'marble', 'roofGold');
        addBuilding(-11, 10, 5, 5, 4, 'marble', 'roofBlue');
        addBuilding(11, 10, 5, 5, 4, 'marble', 'roofBlue');
        [[-6, -6], [6, -6], [-6, 6], [6, 6]].forEach(([px, pz]) => {
          this.solidObstacles.add(this._k(px, pz));
          blocks.marble.push([px, 4, pz], [px, 5, pz], [px, 6, pz]);
          blocks.windowGlow.push([px, 7, pz]);
        });
      }

      // ================================================================
      // INSTANCED MESH GENERATION
      // ================================================================
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
        const isLiquid = k === 'water' || k === 'lava';
        const mesh = buildInst(k, !isLiquid && k !== 'dirt');
        if (isLiquid && mesh) this.animatedLiquid = mesh;
      });

      this._buildHealingCrystal();
      this._buildSkyDecor(cfg.id);
      this._addCitySign(0, 6.2, 0, `${cfg.emoji} ${cfg.name.toUpperCase()}`, '#22d3ee');
    }

    _addCitySign(x, y, z, text, borderColor) {
      const c = document.createElement('canvas');
      c.width = 420;
      c.height = 84;
      const ctx = c.getContext('2d');
      ctx.fillStyle = 'rgba(10, 15, 30, 0.82)';
      ctx.fillRect(8, 8, 404, 68);
      ctx.strokeStyle = borderColor;
      ctx.lineWidth = 4;
      ctx.strokeRect(8, 8, 404, 68);
      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 28px Outfit, Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(text, 210, 52);
      const tex = new THREE.CanvasTexture(c);
      const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true }));
      sp.position.set(x, y, z);
      sp.scale.set(4.2, 0.85, 1);
      this.cityGroup.add(sp);
    }

    _buildHealingCrystal() {
      const g = new THREE.Group();
      g.position.copy(this.healPos);
      const base = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.35, 1.6), new THREE.MeshLambertMaterial({ color: 0x1e293b }));
      base.position.y = 0.175;
      g.add(base);

      const crystal = new THREE.Mesh(
        new THREE.BoxGeometry(0.55, 0.55, 0.55),
        new THREE.MeshStandardMaterial({ color: 0x4ade80, emissive: 0x22c55e, emissiveIntensity: 0.9 })
      );
      crystal.position.y = 1.15;
      crystal.rotation.set(0.6, 0.5, 0.6);
      g.add(crystal);

      const light = new THREE.PointLight(0x4ade80, 1.2, 9);
      light.position.y = 1.4;
      g.add(light);

      this.cityGroup.add(g);
      this.healCrystal = crystal;
    }

    _buildSkyDecor(cityId) {
      const cloudColor = cityId === 'vulcanica' ? 0x7c2d12 : cityId === 'eletrica' ? 0x312e81 : 0xffffff;
      const cloudMat = new THREE.MeshLambertMaterial({ color: cloudColor, transparent: true, opacity: 0.82 });
      for (let i = 0; i < 12; i++) {
        const c = new THREE.Group();
        const b = new THREE.Mesh(this.boxGeo, cloudMat);
        b.scale.set(5 + (i % 3) * 2, 1.1, 3 + (i % 2) * 2);
        c.add(b);
        c.position.set((this._hash(i, 1) - 0.5) * 85, 20 + this._hash(i, 2) * 8, (this._hash(i, 3) - 0.5) * 85);
        c.userData.speed = 0.4 + this._hash(i, 4) * 0.6;
        this.cityGroup.add(c);
        this.clouds.push(c);
      }
    }

    update(dt, time) {
      if (this.animatedLiquid) {
        this.animatedLiquid.position.y = Math.sin(time * 2.1) * 0.05;
      }
      if (this.healCrystal) {
        this.healCrystal.rotation.y = time * 1.6;
        this.healCrystal.position.y = 1.15 + Math.sin(time * 2.8) * 0.14;
      }
      for (const c of this.clouds) {
        c.position.x += c.userData.speed * dt;
        if (c.position.x > 48) c.position.x = -48;
      }
    }

    // --- Queries ---
    getBlockHeight(x, z) {
      const ix = Math.max(-this.worldRadius, Math.min(this.worldRadius, Math.round(x)));
      const iz = Math.max(-this.worldRadius, Math.min(this.worldRadius, Math.round(z)));
      const h = this.heightMap.get(this._k(ix, iz));
      return h !== undefined ? h : 2;
    }

    getSurfaceTopY(x, z) { return this.getBlockHeight(x, z) + 0.5; }

    isWaterAt(x, z) {
      return this.waterCols.has(this._k(Math.round(x), Math.round(z)));
    }

    isStoneAt(x, z) {
      return this.stoneCols.has(this._k(Math.round(x), Math.round(z)));
    }

    isBlocked(x, z) {
      const ix = Math.round(x);
      const iz = Math.round(z);
      if (!this.solidObstacles.has(this._k(ix, iz))) return false;
      return Math.hypot(x - ix, z - iz) < 0.78;
    }

    getWalkableY(x, z) {
      const top = this.getSurfaceTopY(x, z);
      if (this.isWaterAt(x, z)) return top + 0.65;
      return top;
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
      return { x: 6, z: 6, y: this.getWalkableY(6, 6) };
    }
  }

  global.L2CityWorld = CityWorld;
})(window);
