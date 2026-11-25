/* ================================================================
   LORENZO GAME 3 — 3D Particles, Mega Vortex & TOTAL DESTRUCTION FX
   ================================================================ */
(function (global) {
  'use strict';

  class ParticleSystem3 {
    constructor(scene) {
      this.scene = scene;
      this.particles = [];
      this.bolts = [];
      this.rings = [];
      this.beams = [];
      this.boxGeo = new THREE.BoxGeometry(1, 1, 1);
    }

    _spawnCube(pos, vel, color, size, life, gravity = 0, spin = 5) {
      const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 1 });
      const mesh = new THREE.Mesh(this.boxGeo, mat);
      mesh.position.copy(pos);
      mesh.scale.setScalar(size);
      this.scene.add(mesh);
      this.particles.push({ mesh, vel: vel.clone(), life, maxLife: life, gravity, spin, baseSize: size });
    }

    spawnBurst(center, colors, count = 24, speed = 5.8, size = 0.22, gravity = -6.5, life = 0.8) {
      for (let i = 0; i < count; i++) {
        const dir = new THREE.Vector3(Math.random() * 2 - 1, Math.random() * 1.4 + 0.1, Math.random() * 2 - 1).normalize();
        const spd = speed * (0.45 + Math.random() * 0.85);
        const col = colors[Math.floor(Math.random() * colors.length)];
        this._spawnCube(center.clone(), dir.multiplyScalar(spd), col, size * (0.65 + Math.random() * 0.75), life * (0.7 + Math.random() * 0.5), gravity, 7);
      }
    }

    spawnHeal(center) {
      const colors = [0x4ade80, 0x22c55e, 0x86efac, 0xfef08a];
      for (let i = 0; i < 28; i++) {
        const a = (i / 28) * Math.PI * 4;
        const r = 0.55 + Math.random() * 0.55;
        const pos = new THREE.Vector3(center.x + Math.cos(a) * r, center.y + Math.random() * 0.6, center.z + Math.sin(a) * r);
        const vel = new THREE.Vector3(-Math.sin(a) * 0.9, 2.3 + Math.random() * 1.6, Math.cos(a) * 0.9);
        this._spawnCube(pos, vel, colors[i % colors.length], 0.18, 0.95, 0.3, 5);
      }
    }

    spawnMegaVortex(center, isMega = true) {
      const colors = isMega
        ? [0xe879f9, 0x22d3ee, 0xfacc15, 0xf43f5e, 0xffffff, 0xa855f7]
        : [0xfacc15, 0xffffff, 0x22d3ee];
      for (let i = 0; i < (isMega ? 72 : 48); i++) {
        const a = (i / 60) * Math.PI * 10;
        const r = 0.75 + (i % 5) * 0.25;
        const pos = new THREE.Vector3(center.x + Math.cos(a) * r, center.y + (i / 60) * 1.1, center.z + Math.sin(a) * r);
        const vel = new THREE.Vector3(-Math.sin(a) * 2.8, 3.6 + Math.random() * 2.8, Math.cos(a) * 2.8);
        this._spawnCube(pos, vel, colors[i % colors.length], 0.22 + Math.random() * 0.14, 1.1, 0.4, 10);
      }
      if (isMega) this._spawnRing(center, 0xe879f9, 0.8, 9.5, 0.85);
      setTimeout(() => {
        this.spawnBurst(center.clone().add(new THREE.Vector3(0, 1.2, 0)), colors, isMega ? 64 : 44, 9.0, 0.26, -4.5, 1.15);
        if (isMega) this._spawnRing(center, 0x22d3ee, 1.0, 12.0, 0.95);
      }, 420);
    }

    // ================================================================
    // APOCALYPTIC TOTAL DESTRUCTION 3D EFFECT!
    // Orbital Sky Beams + Shockwave Rings + Exploding Voxel Terrain Debris!
    // ================================================================
    spawnTotalDestruction(epicenter) {
      const center = epicenter.clone();

      // 1. Massive Orbital Sky Beam slamming down!
      const beamGeo = new THREE.CylinderGeometry(1.9, 2.8, 42, 16, 1, true);
      const beamMat = new THREE.MeshBasicMaterial({
        color: 0xfacc15, transparent: true, opacity: 0.85, side: THREE.DoubleSide
      });
      const beam = new THREE.Mesh(beamGeo, beamMat);
      beam.position.set(center.x, center.y + 21, center.z);
      this.scene.add(beam);
      this.beams.push({ mesh: beam, life: 1.5, maxLife: 1.5 });

      const innerGeo = new THREE.CylinderGeometry(0.9, 1.4, 42, 12, 1, true);
      const innerMat = new THREE.MeshBasicMaterial({
        color: 0xf43f5e, transparent: true, opacity: 0.92, side: THREE.DoubleSide
      });
      const inner = new THREE.Mesh(innerGeo, innerMat);
      inner.position.set(center.x, center.y + 21, center.z);
      this.scene.add(inner);
      this.beams.push({ mesh: inner, life: 1.4, maxLife: 1.4 });

      // 2. Three Massive Expanding Shockwave Rings!
      this._spawnRing(center, 0xfacc15, 1.2, 26, 1.15);
      setTimeout(() => this._spawnRing(center, 0xf43f5e, 1.2, 30, 1.25), 220);
      setTimeout(() => this._spawnRing(center, 0x22d3ee, 1.2, 34, 1.35), 480);

      // 3. Multiple Jagged Sky Lightning Strikes around the epicenter!
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        const dist = 2.5 + Math.random() * 6.5;
        const strikeEnd = new THREE.Vector3(center.x + Math.cos(a) * dist, center.y, center.z + Math.sin(a) * dist);
        const strikeTop = strikeEnd.clone().add(new THREE.Vector3((Math.random() - 0.5) * 4, 24, (Math.random() - 0.5) * 4));
        setTimeout(() => {
          this._spawnLightning(strikeTop, strikeEnd, i % 2 === 0 ? 0xfacc15 : 0x22d3ee, 0.55);
          this.spawnBurst(strikeEnd, [0xfacc15, 0xf43f5e, 0xffffff], 16, 8.5, 0.28, -9, 0.95);
        }, i * 110);
      }

      // 4. 95 Exploding 3D Voxel Debris Blocks blasting out of the ground!
      const debrisColors = [0x64748b, 0x475569, 0x8a5a36, 0xef4444, 0xf97316, 0xfacc15, 0x22d3ee, 0xa855f7];
      for (let i = 0; i < 95; i++) {
        const a = Math.random() * Math.PI * 2;
        const r = Math.random() * 5.5;
        const pos = new THREE.Vector3(center.x + Math.cos(a) * r, center.y + 0.3 + Math.random() * 1.4, center.z + Math.sin(a) * r);
        const outSpd = 5.5 + Math.random() * 13.0;
        const vel = new THREE.Vector3(
          Math.cos(a) * outSpd,
          7.5 + Math.random() * 13.5,
          Math.sin(a) * outSpd
        );
        const size = 0.28 + Math.random() * 0.42;
        this._spawnCube(pos, vel, debrisColors[i % debrisColors.length], size, 1.5 + Math.random() * 0.9, -18.0, 9);
      }
    }

    _spawnRing(center, color, startR, endR, duration) {
      const geo = new THREE.RingGeometry(0.75, 1.0, 32);
      const mat = new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide, transparent: true, opacity: 0.9 });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.rotation.x = -Math.PI / 2;
      mesh.position.set(center.x, center.y + 0.22, center.z);
      mesh.scale.setScalar(startR);
      this.scene.add(mesh);
      this.rings.push({ mesh, startR, endR, life: duration, maxLife: duration });
    }

    spawnAttack(type, fromPos, toPos) {
      const start = fromPos.clone().add(new THREE.Vector3(0, 1.0, 0));
      const end = toPos.clone().add(new THREE.Vector3(0, 0.95, 0));
      const travel = end.clone().sub(start);
      const dist = travel.length();
      const dir = travel.clone().normalize();

      if (type === 'heal') { this.spawnHeal(fromPos); return; }

      const palettes = {
        fogo:     [0xff4500, 0xf97316, 0xfacc15, 0xef4444],
        agua:     [0x0ea5e9, 0x38bdf8, 0x7dd3fc, 0xe0f2fe],
        planta:   [0x22c55e, 0x4ade80, 0x15803d, 0xf472b6],
        dragao:   [0x818cf8, 0xa855f7, 0x22d3ee, 0xfacc15],
        lutador:  [0xef4444, 0xf97316, 0xfacc15, 0xffffff],
        pedra:    [0x94a3b8, 0x64748b, 0xa8a29e, 0xf97316],
        fantasma: [0xa855f7, 0xec4899, 0x581c87, 0x22d3ee],
        fada:     [0xf472b6, 0xfbcfe8, 0xfacc15, 0xffffff],
        psiquico: [0xe879f9, 0x22d3ee, 0xf472b6, 0xfef08a],
        aco:      [0xe2e8f0, 0x94a3b8, 0x38bdf8, 0xfacc15],
        normal:   [0xf8fafc, 0xcbd5e1, 0x38bdf8]
      };

      if (type === 'eletrico') {
        const cols = [0xfacc15, 0xfef08a, 0x22d3ee, 0xffffff];
        this._spawnLightning(start, end, 0xfacc15, 0.36);
        const sky = end.clone().add(new THREE.Vector3(0, 6.5, 0));
        setTimeout(() => {
          this._spawnLightning(sky, end, 0x22d3ee, 0.38);
          this.spawnBurst(end, cols, 36, 7.5, 0.21, -3.5, 0.68);
        }, 140);
        return;
      }

      const cols = palettes[type] || palettes.normal;
      for (let i = 0; i < 34; i++) {
        const a = (i / 34) * Math.PI * 6;
        const p = start.clone().add(new THREE.Vector3(Math.cos(a) * 0.45, Math.sin(a) * 0.45, 0));
        const v = dir.clone().multiplyScalar(dist * (1.9 + Math.random() * 0.7));
        v.x += (Math.random() - 0.5) * 1.3; v.y += (Math.random() - 0.4) * 1.4;
        this._spawnCube(p, v, cols[i % cols.length], type === 'pedra' ? 0.30 : 0.22, 0.52, type === 'pedra' ? -6 : -1.5, 9);
      }
      setTimeout(() => this.spawnBurst(end, cols, 34, 6.8, 0.24, -5.5, 0.78), 230);
    }

    _spawnLightning(from, to, color, duration) {
      const group = new THREE.Group();
      const segs = 10;
      const mat = new THREE.MeshBasicMaterial({ color });
      let prev = from.clone();
      for (let i = 1; i <= segs; i++) {
        const t = i / segs;
        const next = new THREE.Vector3().lerpVectors(from, to, t);
        if (i < segs) {
          next.x += (Math.random() - 0.5) * 1.25;
          next.y += (Math.random() - 0.5) * 0.95;
          next.z += (Math.random() - 0.5) * 1.25;
        }
        const diff = next.clone().sub(prev);
        const m = new THREE.Mesh(this.boxGeo, mat);
        m.scale.set(0.20, 0.20, diff.length());
        m.position.copy(prev).addScaledVector(diff, 0.5);
        m.lookAt(next);
        group.add(m);
        prev = next;
      }
      this.scene.add(group);
      this.bolts.push({ group, life: duration });
    }

    update(dt) {
      for (let i = this.particles.length - 1; i >= 0; i--) {
        const p = this.particles[i];
        p.life -= dt;
        if (p.life <= 0) {
          this.scene.remove(p.mesh); p.mesh.material.dispose();
          this.particles.splice(i, 1); continue;
        }
        p.vel.y += p.gravity * dt;
        p.mesh.position.addScaledVector(p.vel, dt);
        p.mesh.rotation.x += p.spin * dt;
        p.mesh.rotation.y += p.spin * 0.8 * dt;
        const r = p.life / p.maxLife;
        p.mesh.material.opacity = Math.min(1, r * 1.3);
        p.mesh.scale.setScalar(p.baseSize * (0.35 + r * 0.65));
      }

      for (let i = this.bolts.length - 1; i >= 0; i--) {
        const b = this.bolts[i];
        b.life -= dt;
        if (b.life <= 0) { this.scene.remove(b.group); this.bolts.splice(i, 1); }
        else b.group.visible = Math.floor(b.life * 32) % 2 === 0;
      }

      for (let i = this.rings.length - 1; i >= 0; i--) {
        const rg = this.rings[i];
        rg.life -= dt;
        if (rg.life <= 0) {
          this.scene.remove(rg.mesh); rg.mesh.geometry.dispose(); rg.mesh.material.dispose();
          this.rings.splice(i, 1); continue;
        }
        const t = 1 - rg.life / rg.maxLife;
        const s = rg.startR + (rg.endR - rg.startR) * t;
        rg.mesh.scale.setScalar(s);
        rg.mesh.material.opacity = (1 - t) * 0.9;
      }

      for (let i = this.beams.length - 1; i >= 0; i--) {
        const bm = this.beams[i];
        bm.life -= dt;
        if (bm.life <= 0) {
          this.scene.remove(bm.mesh); bm.mesh.geometry.dispose(); bm.mesh.material.dispose();
          this.beams.splice(i, 1); continue;
        }
        const r = bm.life / bm.maxLife;
        bm.mesh.scale.set(0.3 + r * 1.15, 1, 0.3 + r * 1.15);
        bm.mesh.rotation.y += dt * 7;
        bm.mesh.material.opacity = r * 0.9;
      }
    }
  }

  global.L3Particles = ParticleSystem3;
})(window);
