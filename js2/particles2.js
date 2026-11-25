/* ================================================================
   LORENZO GAME 2 — 3D Particle & Evolution Vortex FX (js2/particles2.js)
   ================================================================ */
(function (global) {
  'use strict';

  class ParticleSystem2 {
    constructor(scene) {
      this.scene = scene;
      this.particles = [];
      this.bolts = [];
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
        const spd = speed * (0.45 + Math.random() * 0.8);
        const col = colors[Math.floor(Math.random() * colors.length)];
        this._spawnCube(center.clone(), dir.multiplyScalar(spd), col, size * (0.65 + Math.random() * 0.7), life * (0.7 + Math.random() * 0.5), gravity, 7);
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

    // Dazzling 3D Evolution Light Spiral!
    spawnEvolutionVortex(center) {
      const colors = [0xfacc15, 0xffffff, 0x22d3ee, 0xc084fc, 0xfef08a];
      for (let i = 0; i < 55; i++) {
        const a = (i / 55) * Math.PI * 8;
        const r = 0.7 + (i % 5) * 0.22;
        const pos = new THREE.Vector3(center.x + Math.cos(a) * r, center.y + (i / 55) * 0.9, center.z + Math.sin(a) * r);
        const vel = new THREE.Vector3(-Math.sin(a) * 2.4, 3.2 + Math.random() * 2.5, Math.cos(a) * 2.4);
        this._spawnCube(pos, vel, colors[i % colors.length], 0.20 + Math.random() * 0.12, 1.05, 0.5, 9);
      }
      setTimeout(() => {
        this.spawnBurst(center.clone().add(new THREE.Vector3(0, 1.1, 0)), colors, 52, 8.2, 0.25, -4.5, 1.1);
      }, 420);
    }

    spawnAttack(type, fromPos, toPos) {
      const start = fromPos.clone().add(new THREE.Vector3(0, 1.0, 0));
      const end = toPos.clone().add(new THREE.Vector3(0, 0.95, 0));
      const travel = end.clone().sub(start);
      const dist = travel.length();
      const dir = travel.clone().normalize();

      if (type === 'heal') { this.spawnHeal(fromPos); return; }

      if (type === 'fogo') {
        const cols = [0xff4500, 0xf97316, 0xfacc15, 0xef4444];
        for (let i = 0; i < 36; i++) {
          const p = start.clone().addScaledVector(dir, Math.random() * 0.25 * dist);
          p.x += (Math.random() - 0.5) * 0.5; p.y += (Math.random() - 0.5) * 0.5; p.z += (Math.random() - 0.5) * 0.5;
          const v = dir.clone().multiplyScalar(dist * (1.8 + Math.random() * 0.9));
          v.y += (Math.random() - 0.3) * 1.4;
          this._spawnCube(p, v, cols[i % cols.length], 0.24, 0.52, 1.5, 8);
        }
        setTimeout(() => this.spawnBurst(end, cols, 32, 6.8, 0.25, -4, 0.75), 240);

      } else if (type === 'agua') {
        const cols = [0x0ea5e9, 0x38bdf8, 0x7dd3fc, 0xe0f2fe];
        for (let i = 0; i < 36; i++) {
          const p = start.clone().add(new THREE.Vector3((Math.random() - 0.5) * 0.6, (Math.random() - 0.5) * 0.4, (Math.random() - 0.5) * 0.6));
          const v = dir.clone().multiplyScalar(dist * (1.9 + Math.random() * 0.6));
          v.y += 1.6 + Math.random() * 1.2;
          this._spawnCube(p, v, cols[i % cols.length], 0.22, 0.55, -5.5, 6);
        }
        setTimeout(() => this.spawnBurst(end, cols, 34, 6.5, 0.23, -9.5, 0.8), 240);

      } else if (type === 'planta') {
        const cols = [0x22c55e, 0x4ade80, 0x15803d, 0xf472b6, 0xfacc15];
        for (let i = 0; i < 34; i++) {
          const a = (i / 34) * Math.PI * 6;
          const p = start.clone().add(new THREE.Vector3(Math.cos(a) * 0.45, Math.sin(a) * 0.45, 0));
          const v = dir.clone().multiplyScalar(dist * (1.95 + Math.random() * 0.65));
          v.x += Math.cos(a) * 1.3; v.y += Math.sin(a) * 1.1;
          this._spawnCube(p, v, cols[i % cols.length], 0.22, 0.54, -1.2, 12);
        }
        setTimeout(() => this.spawnBurst(end, cols, 30, 6.0, 0.22, -4.5, 0.78), 230);

      } else if (type === 'eletrico') {
        const cols = [0xfacc15, 0xfef08a, 0x38bdf8, 0xffffff];
        this._spawnLightning(start, end, 0xfacc15, 0.36);
        const sky = end.clone().add(new THREE.Vector3(0, 6.0, 0));
        setTimeout(() => {
          this._spawnLightning(sky, end, 0x38bdf8, 0.38);
          this.spawnBurst(end, cols, 36, 7.5, 0.20, -3.5, 0.68);
        }, 140);

      } else if (type === 'dragao') {
        // Purple-Cyan Dragon Meteor Beam & Sky Impact!
        const cols = [0x818cf8, 0xa855f7, 0x22d3ee, 0xfacc15];
        for (let i = 0; i < 42; i++) {
          const a = (i / 42) * Math.PI * 8;
          const p = start.clone().add(new THREE.Vector3(Math.cos(a) * 0.5, Math.sin(a) * 0.5, 0));
          const v = dir.clone().multiplyScalar(dist * (2.0 + Math.random() * 0.7));
          this._spawnCube(p, v, cols[i % cols.length], 0.26, 0.55, 0.5, 10);
        }
        setTimeout(() => this.spawnBurst(end, cols, 42, 7.8, 0.26, -3.5, 0.85), 240);

      } else if (type === 'lutador') {
        // Fiery Red-Gold Martial Impact Wave!
        const cols = [0xef4444, 0xf97316, 0xfacc15, 0xffffff];
        for (let i = 0; i < 24; i++) {
          const v = dir.clone().multiplyScalar(dist * 2.5);
          v.x += (Math.random() - 0.5) * 1.4; v.y += (Math.random() - 0.5) * 1.4;
          this._spawnCube(start, v, cols[i % cols.length], 0.24, 0.36, 0, 12);
        }
        setTimeout(() => this.spawnBurst(end, cols, 34, 7.5, 0.25, -5.5, 0.65), 180);

      } else {
        const cols = [0xf8fafc, 0xcbd5e1, 0x38bdf8];
        for (let i = 0; i < 18; i++) {
          const v = dir.clone().multiplyScalar(dist * 2.3);
          v.x += (Math.random() - 0.5) * 1.5; v.y += (Math.random() - 0.5) * 1.5;
          this._spawnCube(start, v, cols[i % cols.length], 0.18, 0.35, 0, 9);
        }
        setTimeout(() => this.spawnBurst(end, cols, 22, 5.5, 0.2, -6, 0.55), 180);
      }
    }

    _spawnLightning(from, to, color, duration) {
      const group = new THREE.Group();
      const segs = 9;
      const mat = new THREE.MeshBasicMaterial({ color });
      let prev = from.clone();
      for (let i = 1; i <= segs; i++) {
        const t = i / segs;
        const next = new THREE.Vector3().lerpVectors(from, to, t);
        if (i < segs) {
          next.x += (Math.random() - 0.5) * 1.1;
          next.y += (Math.random() - 0.5) * 0.9;
          next.z += (Math.random() - 0.5) * 1.1;
        }
        const diff = next.clone().sub(prev);
        const m = new THREE.Mesh(this.boxGeo, mat);
        m.scale.set(0.16, 0.16, diff.length());
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
          this.scene.remove(p.mesh);
          p.mesh.material.dispose();
          this.particles.splice(i, 1);
          continue;
        }
        p.vel.y += p.gravity * dt;
        p.mesh.position.addScaledVector(p.vel, dt);
        p.mesh.rotation.x += p.spin * dt;
        p.mesh.rotation.y += p.spin * 0.8 * dt;
        const ratio = p.life / p.maxLife;
        p.mesh.material.opacity = Math.min(1, ratio * 1.3);
        p.mesh.scale.setScalar(p.baseSize * (0.35 + ratio * 0.65));
      }

      for (let i = this.bolts.length - 1; i >= 0; i--) {
        const b = this.bolts[i];
        b.life -= dt;
        if (b.life <= 0) {
          this.scene.remove(b.group);
          this.bolts.splice(i, 1);
        } else {
          b.group.visible = Math.floor(b.life * 32) % 2 === 0;
        }
      }
    }
  }

  global.L2Particles = ParticleSystem2;
})(window);
