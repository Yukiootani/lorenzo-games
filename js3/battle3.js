/* ================================================================
   LORENZO GAME 3 — Standard 1v1 Battle + Off-Map Titan Arena 3v1!
   ================================================================ */
(function (global) {
  'use strict';

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const ARENA_Y = 160; // Completely outside the city world!

  class BattleManager3 {
    constructor(game) {
      this.game = game;
      this.active = false;
      this.busy = false;
      this.isTitanRaid = false;

      // 1v1 references
      this.wildEntity = null;
      this.wildMon = null;
      this.playerMon = null;
      this.playerMesh = null;
      this.playerRing = null;
      this.wildRing = null;
      this.cuboBallMesh = null;

      // 3v1 Titan Raid Arena references
      this.titanArena = global.L3Voxels.buildTitanArena(ARENA_Y);
      this.game.scene.add(this.titanArena);
      this.bossMesh = null;
      this.squadMons = [];      // up to 3 Monster instances (last 3 captured!)
      this.squadMeshes = [];    // 3 3D meshes
      this.squadRings = [];     // 3 neon rings
      this.squadSpots = [];     // 3 Vector3 positions
      this.squadActed = [];     // boolean[3] for current round
      this.activeSquadSlot = 0; // which of the 3 is acting now

      this.arenaCenter = new THREE.Vector3();
      this.playerSpot = new THREE.Vector3();
      this.wildSpot = new THREE.Vector3();
      this.arenaRight = new THREE.Vector3();

      this.camTargetPos = new THREE.Vector3();
      this.camTargetLook = new THREE.Vector3();
      this.camMode = 'overview';
      this.shakeTime = 0;
      this.shakeAmp = 0;

      this._cacheDOM();
      this._bindEvents();
    }

    _cacheDOM() {
      this.elBattleUI = document.getElementById('battle-ui');
      this.elFxLayer = document.getElementById('floating-fx-layer');

      // Standard 1v1 cards
      this.elWildCard = document.getElementById('wild-card');
      this.elPlayerCard = document.getElementById('player-card');
      this.elWildName = document.getElementById('wild-name');
      this.elWildLevel = document.getElementById('wild-level');
      this.elWildType = document.getElementById('wild-type');
      this.elWildHpText = document.getElementById('wild-hp-text');
      this.elWildHpBar = document.getElementById('wild-hp-bar');
      this.elWildCaught = document.getElementById('wild-caught-badge');

      this.elPlayerName = document.getElementById('player-mon-name');
      this.elPlayerLevel = document.getElementById('player-mon-level');
      this.elPlayerType = document.getElementById('player-mon-type');
      this.elPlayerHpText = document.getElementById('player-mon-hp-text');
      this.elPlayerHpBar = document.getElementById('player-mon-hp-bar');
      this.elPlayerXpBar = document.getElementById('player-mon-xp-bar');

      // Titan Arena 3v1 UI
      this.elRaidHeader = document.getElementById('raid-boss-header');
      this.elRaidBossName = document.getElementById('raid-boss-name');
      this.elRaidBossLevel = document.getElementById('raid-boss-level');
      this.elRaidBossType = document.getElementById('raid-boss-type');
      this.elRaidBossHpText = document.getElementById('raid-boss-hp-text');
      this.elRaidBossHpBar = document.getElementById('raid-boss-hp-bar');
      this.elRaidSquadStrip = document.getElementById('raid-squad-strip');

      this.elLog = document.getElementById('battle-log-text');
      this.elMoveBtns = Array.from(document.querySelectorAll('.move-btn'));

      this.elBtnUlt = document.getElementById('btn-battle-ultimate');
      this.elUltSub = document.getElementById('battle-ult-sub');
      this.elBtnEvolve = document.getElementById('btn-battle-evolve');
      this.elEvoSub = document.getElementById('battle-evo-sub');
      this.elBtnBag = document.getElementById('btn-bag');
      this.elBtnSwitch = document.getElementById('btn-switch');
      this.elBtnFlee = document.getElementById('btn-flee');

      this.elBagModal = document.getElementById('bag-modal');
      this.elSwitchModal = document.getElementById('switch-modal');
      this.elSwitchList = document.getElementById('switch-list');

      this.elItemCubo = document.getElementById('item-cuboball');
      this.elItemSuper = document.getElementById('item-superball');
      this.elItemPotion = document.getElementById('item-potion');
      this.elQtyCubo = document.getElementById('bag-count-cuboball');
      this.elQtySuper = document.getElementById('bag-count-superball');
      this.elQtyPotion = document.getElementById('bag-count-potion');
    }

    _bindEvents() {
      this.elMoveBtns.forEach((btn, idx) => {
        btn.addEventListener('click', () => {
          if (this.busy || !this.active) return;
          global.L3Audio.playClick();
          this.executePlayerMove(idx);
        });
      });

      this.elBtnUlt.addEventListener('click', () => {
        if (this.busy || !this.active || this.game.state.powerOrbs < 3) return;
        this.executeTotalDestruction();
      });

      this.elBtnEvolve.addEventListener('click', () => {
        if (this.busy || !this.active) return;
        this.executeBattleEvolution();
      });

      this.elBtnBag.addEventListener('click', () => {
        if (this.busy || !this.active) return;
        global.L3Audio.playClick();
        this._openBagModal();
      });

      document.getElementById('btn-close-bag').addEventListener('click', () => {
        global.L3Audio.playClick();
        this.elBagModal.classList.add('hidden');
      });

      this.elBtnSwitch.addEventListener('click', () => {
        if (this.busy || !this.active) return;
        global.L3Audio.playClick();
        this._openSwitchModal(false);
      });

      document.getElementById('btn-close-switch').addEventListener('click', () => {
        if (!this.isTitanRaid && this.playerMon && this.playerMon.hp <= 0) return;
        global.L3Audio.playClick();
        this.elSwitchModal.classList.add('hidden');
      });

      this.elBtnFlee.addEventListener('click', () => {
        if (this.busy || !this.active) return;
        this.executeFlee();
      });

      this.elItemCubo.addEventListener('click', () => {
        if (this.busy || !this.active) return;
        this.elBagModal.classList.add('hidden');
        this.executeThrowBall(false);
      });

      this.elItemSuper.addEventListener('click', () => {
        if (this.busy || !this.active) return;
        this.elBagModal.classList.add('hidden');
        this.executeThrowBall(true);
      });

      this.elItemPotion.addEventListener('click', () => {
        if (this.busy || !this.active) return;
        this.elBagModal.classList.add('hidden');
        this.executeUsePotion();
      });
    }

    // ================================================================
    // 1. STANDARD 1 vs 1 BATTLE START
    // ================================================================
    start(wildEntity) {
      if (this.active) return;
      this.isTitanRaid = false;

      let activeIdx = this.game.state.activeTeamIndex;
      if (!this.game.state.team[activeIdx] || this.game.state.team[activeIdx].hp <= 0) {
        const alive = this.game.state.team.findIndex((m) => m.hp > 0);
        if (alive === -1) { this.game.healTeam(true); activeIdx = 0; }
        else activeIdx = alive;
        this.game.state.activeTeamIndex = activeIdx;
      }

      this.active = true;
      this.busy = true;
      this.wildEntity = wildEntity;
      this.wildMon = global.L3Data.createMonster(wildEntity.speciesId, wildEntity.level);
      this.playerMon = this.game.state.team[activeIdx];

      if (document.pointerLockElement) document.exitPointerLock();
      global.L3Audio.playBattleStart();

      if (this.game.partnerMesh) this.game.partnerMesh.visible = false;
      if (wildEntity.nameplate) wildEntity.nameplate.visible = false;
      this.game.setExplorationHudVisible(false);

      this.elRaidHeader.classList.add('hidden');
      this.elRaidSquadStrip.classList.add('hidden');
      this.elWildCard.classList.remove('hidden');
      this.elPlayerCard.classList.remove('hidden');
      this.elBattleUI.classList.remove('hidden');
      this.elBagModal.classList.add('hidden');
      this.elSwitchModal.classList.add('hidden');
      this.elBtnSwitch.disabled = false;

      const wildPos = wildEntity.mesh.position.clone();
      const playerPos = this.game.playerMesh.position.clone();
      let dir = wildPos.clone().sub(playerPos).setY(0);
      if (dir.lengthSq() < 0.01) dir.set(0, 0, -1);
      dir.normalize();

      this.wildSpot.copy(wildPos);
      this.wildSpot.y = this.game.world.getWalkableY(this.wildSpot.x, this.wildSpot.z);
      this.playerSpot.copy(this.wildSpot).addScaledVector(dir, -6.8);
      const lim = this.game.world.worldRadius - 2;
      this.playerSpot.x = Math.max(-lim, Math.min(lim, this.playerSpot.x));
      this.playerSpot.z = Math.max(-lim, Math.min(lim, this.playerSpot.z));
      this.playerSpot.y = this.game.world.getWalkableY(this.playerSpot.x, this.playerSpot.z);

      this.arenaCenter.copy(this.playerSpot).lerp(this.wildSpot, 0.5);
      this.arenaRight.crossVectors(dir, new THREE.Vector3(0, 1, 0)).normalize();

      wildEntity.inBattle = true;
      wildEntity.mesh.position.copy(this.wildSpot);
      wildEntity.mesh.visible = true;
      wildEntity.mesh.lookAt(this.playerSpot.x, this.wildSpot.y, this.playerSpot.z);

      this.game.playerMesh.position.copy(this.playerSpot).addScaledVector(dir, -2.6);
      this.game.playerMesh.position.y = this.game.world.getWalkableY(this.game.playerMesh.position.x, this.game.playerMesh.position.z);
      this.game.playerMesh.lookAt(this.wildSpot.x, this.game.playerMesh.position.y, this.wildSpot.z);

      this._spawnPlayerMonMesh(this.playerMon.speciesId);

      this.playerRing = global.L3Voxels.buildTargetRing(0xe879f9);
      this.playerRing.position.set(this.playerSpot.x, this.playerSpot.y + 0.08, this.playerSpot.z);
      this.game.scene.add(this.playerRing);

      this.wildRing = global.L3Voxels.buildTargetRing(0xf43f5e);
      this.wildRing.position.set(this.wildSpot.x, this.wildSpot.y + 0.08, this.wildSpot.z);
      this.game.scene.add(this.wildRing);

      this.camMode = 'overview';
      this._updateUI();
      this._setControlsEnabled(false);
      this._setLog(`Um ${this.wildMon.name} selvagem (Nv. ${this.wildMon.level}) apareceu! Vai, ${this.playerMon.name}!`);
      this.game.particles.spawnBurst(this.playerSpot.clone().add(new THREE.Vector3(0, 1.0, 0)), [0xe879f9, 0x22d3ee, 0xffffff], 24, 5, 0.2, -4, 0.65);

      setTimeout(() => {
        if (this.active) { this.busy = false; this._setControlsEnabled(true); }
      }, 750);
    }

    // ================================================================
    // 2. SPECIAL OFF-MAP TITAN ARENA 3 vs 1 GIANT BOSS BATTLE!
    // ================================================================
    startTitanRaid(bossSpeciesId, squadMonsters) {
      if (this.active) return;
      this.isTitanRaid = true;
      this.active = true;
      this.busy = true;
      this.wildEntity = null;

      if (document.pointerLockElement) document.exitPointerLock();

      // Hide normal city world, wild city Pokémon, partner & orbs -> teleport to Cosmic Titan Arena!
      this.game.setMainWorldVisible(false);
      this.titanArena.visible = true;
      this.game.scene.background = new THREE.Color(0x0b051c);
      this.game.scene.fog = new THREE.FogExp2(0x1e0b38, 0.0085);

      // Prepare squad (heal slightly if any fainted so all 3 last captured can fight!)
      this.squadMons = squadMonsters.slice(0, 3);
      this.squadMons.forEach((m) => { if (m.hp <= 0) m.hp = Math.round(m.maxHp * 0.5); });
      this.squadActed = this.squadMons.map(() => false);
      this.activeSquadSlot = 0;
      this.playerMon = this.squadMons[0];

      // Create Colossal Giant Titan Boss!
      const avgLvl = Math.round(this.squadMons.reduce((s, m) => s + m.level, 0) / Math.max(1, this.squadMons.length));
      this.wildMon = global.L3Data.createGiantBoss(bossSpeciesId, Math.max(20, avgLvl + 4));

      // Spatial Layout inside Off-Map Floating Cosmic Colosseum (Y = ARENA_Y)
      this.wildSpot.set(0, ARENA_Y, -6.2);
      this.squadSpots = [
        new THREE.Vector3(-4.8, ARENA_Y, 5.2),
        new THREE.Vector3(0,    ARENA_Y, 6.4),
        new THREE.Vector3(4.8,  ARENA_Y, 5.2)
      ];
      this.playerSpot.copy(this.squadSpots[0]);
      this.arenaCenter.set(0, ARENA_Y, 0.4);
      this.arenaRight.set(1, 0, 0);

      // Build COLOSSAL 2.9x SCALE GIANT BOSS MESH!
      if (this.bossMesh) this.game.scene.remove(this.bossMesh);
      this.bossMesh = global.L3Voxels.buildPokemonMesh(bossSpeciesId);
      this.bossMesh.scale.setScalar(2.9);
      this.bossMesh.position.copy(this.wildSpot);
      this.bossMesh.lookAt(0, ARENA_Y, 6.4);
      this.game.scene.add(this.bossMesh);

      // Build all 3 Allied Pokémon Meshes + Rings!
      this._clearSquadMeshes();
      this.squadMons.forEach((mon, i) => {
        const m = global.L3Voxels.buildPokemonMesh(mon.speciesId);
        m.position.copy(this.squadSpots[i]);
        m.lookAt(this.wildSpot.x, ARENA_Y, this.wildSpot.z);
        this.game.scene.add(m);
        this.squadMeshes.push(m);

        const r = global.L3Voxels.buildTargetRing(i === 0 ? 0x22d3ee : 0xa855f7);
        r.position.set(this.squadSpots[i].x, ARENA_Y + 0.1, this.squadSpots[i].z);
        this.game.scene.add(r);
        this.squadRings.push(r);
      });
      this.playerMesh = this.squadMeshes[0];

      // Position Lorenzo behind his 3-Pokémon Squad
      this.game.playerMesh.visible = true;
      this.game.playerMesh.position.set(0, ARENA_Y, 10.6);
      this.game.playerMesh.lookAt(0, ARENA_Y, -6.2);

      // Show Titan Raid UI
      this.game.setExplorationHudVisible(false);
      this.elWildCard.classList.add('hidden');
      this.elPlayerCard.classList.add('hidden');
      this.elRaidHeader.classList.remove('hidden');
      this.elRaidSquadStrip.classList.remove('hidden');
      this.elBattleUI.classList.remove('hidden');
      this.elBagModal.classList.add('hidden');
      this.elSwitchModal.classList.add('hidden');

      this.camMode = 'overview';
      global.L3Audio.playTitanRoar();
      this.triggerShake(0.65, 0.7);
      this.game.particles.spawnBurst(this.wildSpot.clone().add(new THREE.Vector3(0, 3.0, 0)), [0xf43f5e, 0xfacc15, 0xa855f7, 0xffffff], 52, 9.5, 0.32, -5, 1.0);

      this._updateUI();
      this._setControlsEnabled(false);
      const squadNames = this.squadMons.map((m) => m.name).join(', ');
      this._setLog(`👑 ${this.wildMon.name.toUpperCase()} GIGANTE desafia seus 3 últimos capturados: ${squadNames}!`);

      setTimeout(() => {
        if (this.active) { this.busy = false; this._setControlsEnabled(true); }
      }, 1050);
    }

    _clearSquadMeshes() {
      for (const m of this.squadMeshes) this.game.scene.remove(m);
      for (const r of this.squadRings) this.game.scene.remove(r);
      this.squadMeshes = [];
      this.squadRings = [];
    }

    _spawnPlayerMonMesh(speciesId) {
      if (this.isTitanRaid) {
        const i = this.activeSquadSlot;
        if (this.squadMeshes[i]) this.game.scene.remove(this.squadMeshes[i]);
        const m = global.L3Voxels.buildPokemonMesh(speciesId);
        m.position.copy(this.squadSpots[i]);
        m.lookAt(this.wildSpot.x, ARENA_Y, this.wildSpot.z);
        this.game.scene.add(m);
        this.squadMeshes[i] = m;
        this.playerMesh = m;
      } else {
        if (this.playerMesh) this.game.scene.remove(this.playerMesh);
        this.playerMesh = global.L3Voxels.buildPokemonMesh(speciesId);
        this.playerMesh.position.copy(this.playerSpot);
        this.playerMesh.lookAt(this.wildSpot.x, this.playerSpot.y, this.wildSpot.z);
        this.game.scene.add(this.playerMesh);
      }
    }

    _getEnemyMesh() {
      return this.isTitanRaid ? this.bossMesh : (this.wildEntity ? this.wildEntity.mesh : null);
    }

    // ================================================================
    // END BATTLE (AND TRIGGER TITAN ARENA IF 3 DIFFERENT CAPTURED!)
    // ================================================================
    end(removeWild = false, triggerRaidCheck = false) {
      if (!this.active) return;
      const wasRaid = this.isTitanRaid;
      this.active = false;
      this.busy = false;
      this.isTitanRaid = false;

      if (wasRaid) {
        if (this.bossMesh) { this.game.scene.remove(this.bossMesh); this.bossMesh = null; }
        this._clearSquadMeshes();
        this.playerMesh = null;
        this.titanArena.visible = false;
        this.game.setMainWorldVisible(true);
        // Restore city atmosphere & Lorenzo position
        const cfg = global.L3Data.CITIES[this.game.state.cityId] || global.L3Data.CITIES.mesagoza;
        this.game.scene.background = new THREE.Color(cfg.skyColor);
        this.game.scene.fog = new THREE.FogExp2(cfg.fogColor, cfg.id === 'neotokyo' || cfg.id === 'vulcanica' ? 0.0155 : 0.013);
        const p = this.game.state.player;
        this.game.playerMesh.position.set(p.x, p.y, p.z);
      } else {
        if (this.playerMesh) { this.game.scene.remove(this.playerMesh); this.playerMesh = null; }
        if (this.playerRing) { this.game.scene.remove(this.playerRing); this.playerRing = null; }
        if (this.wildRing)   { this.game.scene.remove(this.wildRing); this.wildRing = null; }
        if (this.wildEntity) {
          if (removeWild) this.game.removeAndRespawnWild(this.wildEntity);
          else {
            this.wildEntity.inBattle = false;
            this.wildEntity.mesh.visible = true;
            if (this.wildEntity.nameplate) this.wildEntity.nameplate.visible = true;
          }
          this.wildEntity = null;
        }
        this.game.syncPlayerFromMesh();
      }

      if (this.cuboBallMesh) { this.game.scene.remove(this.cuboBallMesh); this.cuboBallMesh = null; }

      this.elBattleUI.classList.add('hidden');
      this.elBagModal.classList.add('hidden');
      this.elSwitchModal.classList.add('hidden');
      this.game.rebuildPartnerMesh();
      this.game.setExplorationHudVisible(true);
      this.game.refreshHudAndTeam();
      this.game.autoSave(false);

      // Check if 3 DIFFERENT Pokémon have been captured -> OPEN TITAN ARENA 3 vs 1!
      if (triggerRaidCheck && !wasRaid) {
        this.game.checkAndTriggerTitanRaid();
      }
    }

    _setLog(text) { this.elLog.textContent = text; }

    _setControlsEnabled(enabled) {
      this.elMoveBtns.forEach((b) => (b.disabled = !enabled));
      this.elBtnBag.disabled = !enabled;
      this.elBtnSwitch.disabled = !enabled || this.isTitanRaid;
      this.elBtnFlee.disabled = !enabled;
      this.elBtnEvolve.disabled = !enabled || !global.L3Data.canEvolve(this.playerMon);
      this.elBtnUlt.disabled = !enabled || this.game.state.powerOrbs < 3;
    }

    _setHpBar(barEl, textEl, hp, maxHp) {
      const c = Math.max(0, Math.round(hp));
      const pct = Math.max(0, Math.min(100, (c / maxHp) * 100));
      barEl.style.width = pct + '%';
      barEl.classList.remove('mid', 'low');
      if (pct <= 25) barEl.classList.add('low');
      else if (pct <= 55) barEl.classList.add('mid');
      textEl.textContent = `${c} / ${maxHp}`;
    }

    _selectActiveSquadSlot(idx) {
      if (!this.isTitanRaid) return;
      if (!this.squadMons[idx] || this.squadMons[idx].hp <= 0) return;
      this.activeSquadSlot = idx;
      this.playerMon = this.squadMons[idx];
      this.playerMesh = this.squadMeshes[idx];
      this.playerSpot.copy(this.squadSpots[idx]);
      this.squadRings.forEach((r, i) => {
        r.material.color.setHex(i === idx ? 0x22d3ee : (this.squadActed[i] ? 0x22c55e : 0xa855f7));
      });
      this._updateUI();
    }

    _updateUI() {
      if (!this.wildMon || !this.playerMon) return;
      const D = global.L3Data;

      if (this.isTitanRaid) {
        // Giant Boss Header
        this.elRaidBossName.textContent = `${this.wildMon.name.toUpperCase()} GIGANTE`;
        this.elRaidBossLevel.textContent = 'TITÃ Nv. ' + this.wildMon.level;
        this.elRaidBossType.textContent = D.TYPE_LABELS[this.wildMon.type];
        this.elRaidBossType.className = 'type-pill type-' + this.wildMon.type;
        this._setHpBar(this.elRaidBossHpBar, this.elRaidBossHpText, this.wildMon.hp, this.wildMon.maxHp);

        // 3-Fighter Squad Strip
        this.elRaidSquadStrip.innerHTML = '';
        this.squadMons.forEach((mon, idx) => {
          const sp = D.SPECIES[mon.speciesId];
          const pct = Math.max(0, Math.min(100, (mon.hp / mon.maxHp) * 100));
          const hpCls = pct <= 25 ? 'low' : pct <= 55 ? 'mid' : '';
          const isActing = idx === this.activeSquadSlot;
          const card = document.createElement('div');
          card.className = 'raid-ally-card' + (isActing ? ' acting' : '') + (this.squadActed[idx] ? ' acted' : '') + (mon.hp <= 0 ? ' fainted' : '');
          const stText = mon.hp <= 0 ? 'NOCAUTE' : isActing ? '▶ SUA VEZ' : this.squadActed[idx] ? '✓ ATACOU' : 'PRONTO';
          card.innerHTML = `
            <div class="raid-ally-top">
              <div class="poke-avatar sm ${sp.avatarClass} ${sp.isShiny ? 'shiny-glow' : sp.isMega ? 'mega-glow' : ''}"></div>
              <span class="raid-ally-name">${mon.name}</span>
              <span class="raid-ally-status">${stText}</span>
            </div>
            <div class="mini-hp-track"><div class="mini-hp-fill ${hpCls}" style="width:${pct}%"></div></div>
            <div style="display:flex;justify-content:space-between;font-size:0.68rem;color:#cbd5e1;margin-top:3px;">
              <span>Nv.${mon.level}</span><span>${Math.max(0, Math.round(mon.hp))}/${mon.maxHp}</span>
            </div>
          `;
          card.addEventListener('click', () => {
            if (this.busy || mon.hp <= 0 || this.squadActed[idx]) return;
            global.L3Audio.playClick();
            this._selectActiveSquadSlot(idx);
          });
          this.elRaidSquadStrip.appendChild(card);
        });
      } else {
        this.elWildName.textContent = this.wildMon.name;
        this.elWildLevel.textContent = 'Nv. ' + this.wildMon.level;
        this.elWildType.textContent = D.TYPE_LABELS[this.wildMon.type];
        this.elWildType.className = 'type-pill type-' + this.wildMon.type;
        this._setHpBar(this.elWildHpBar, this.elWildHpText, this.wildMon.hp, this.wildMon.maxHp);
        this.elWildCaught.classList.toggle('hidden', !this.game.state.caughtSpecies.has(this.wildMon.speciesId));

        this.elPlayerName.textContent = this.playerMon.name;
        this.elPlayerLevel.textContent = 'Nv. ' + this.playerMon.level;
        this.elPlayerType.textContent = D.TYPE_LABELS[this.playerMon.type];
        this.elPlayerType.className = 'type-pill type-' + this.playerMon.type;
        this._setHpBar(this.elPlayerHpBar, this.elPlayerHpText, this.playerMon.hp, this.playerMon.maxHp);
        this.elPlayerXpBar.style.width = Math.min(100, (this.playerMon.xp / this.playerMon.xpToNext) * 100) + '%';
      }

      // 4 Moves for the currently acting Pokémon
      const sp = D.SPECIES[this.playerMon.speciesId];
      sp.moves.forEach((mv, idx) => {
        const btn = this.elMoveBtns[idx];
        if (!btn) return;
        const eff = mv.power > 0 ? D.getEffectiveness(mv.type, this.wildMon.type) : 1;
        const effHtml = mv.power === 0
          ? `<span class="eff-tag super">CURA +${Math.round(mv.healPct * 100)}%</span>`
          : eff > 1.1 ? `<span class="eff-tag super">SUPER EFETIVO</span>`
          : eff < 0.9 ? `<span class="eff-tag weak">POUCO EFETIVO</span>`
          : `<span class="eff-tag">NEUTRO</span>`;
        btn.innerHTML = `
          <div class="move-btn-top">
            <span class="move-name">${mv.name}</span>
            <span class="type-pill type-${mv.type}">${D.TYPE_LABELS[mv.type]}</span>
          </div>
          <div class="move-btn-bottom">
            <span>${mv.power > 0 ? 'POD ' + mv.power : 'SUPORTE'}</span>
            ${effHtml}
          </div>
        `;
      });

      const orbs = this.game.state.powerOrbs || 0;
      this.elBtnUlt.disabled = this.busy || orbs < 3;
      this.elUltSub.textContent = orbs >= 3 ? 'PRONTO!' : `${orbs}/3 Orbes`;

      if (D.canEvolve(this.playerMon)) {
        const nextSp = D.SPECIES[sp.evolvesTo];
        this.elBtnEvolve.disabled = this.busy;
        this.elEvoSub.textContent = (nextSp.isShiny ? '✨ ' : nextSp.isMega ? '🧬 ' : '→ ') + nextSp.name;
      } else {
        this.elBtnEvolve.disabled = true;
        this.elEvoSub.textContent = 'FORMA MÁXIMA ★';
      }
    }

    // ================================================================
    // 💥 TOTAL DESTRUCTION ULTIMATE (1v1 & TITAN ARENA!)
    // ================================================================
    async executeTotalDestruction() {
      if (this.game.state.powerOrbs < 3) return;
      this.busy = true;
      this._setControlsEnabled(false);
      this.game.state.powerOrbs = 0;

      const sp = global.L3Data.SPECIES[this.playerMon.speciesId];
      const ultName = sp.ultimateName || 'DESTRUIÇÃO TOTAL VOXEL!';
      this.camMode = 'wildFocus';
      this._setLog(`💥 ${this.playerMon.name} LIBEROU O PODER ESPECIAL: ${ultName}`);

      this.game.triggerDestructionSpectacle(this.wildSpot, ultName);
      this.triggerShake(1.25, 1.9);
      await sleep(580);

      const mult = this.isTitanRaid ? 0.55 : 0.88;
      const dmg = Math.max(Math.round(this.wildMon.maxHp * mult), Math.round(this.playerMon.atk * 5.8));
      this.wildMon.hp = Math.max(0, this.wildMon.hp - dmg);
      this._spawnFloatingText(this.wildSpot, `💥 -${dmg}`, 'ult');
      this._updateUI();

      await sleep(1600);
      this.camMode = 'overview';

      if (this.wildMon.hp <= 0) { await this._handleVictory(); return; }
      await this._advanceAfterPlayerAction();
    }

    // ================================================================
    // 🧬 LIVE MEGA / SHINY MEGA EVOLUTION IN BATTLE!
    // ================================================================
    async executeBattleEvolution() {
      if (!global.L3Data.canEvolve(this.playerMon)) return;
      this.busy = true;
      this._setControlsEnabled(false);

      const oldName = this.playerMon.name;
      const nextSp = global.L3Data.SPECIES[global.L3Data.SPECIES[this.playerMon.speciesId].evolvesTo];
      const isMega = !!(nextSp.isMega || nextSp.isShiny);

      this.camMode = 'playerFocus';
      global.L3Audio.playEvolutionStart(isMega);
      this._setLog(nextSp.isShiny
        ? `✨🧬 TRANSCENDÊNCIA SHINY MEGA! ${oldName} está virando ${nextSp.name}!!`
        : isMega ? `🧬 MEGA EVOLUÇÃO! ${oldName} está virando ${nextSp.name}!!`
        : `✨ ${oldName} está evoluindo para ${nextSp.name}!`);
      this.game.particles.spawnMegaVortex(this.playerSpot, isMega);

      await this._animateDuration(780, (t) => {
        if (this.playerMesh) {
          this.playerMesh.scale.setScalar(1.0 + Math.sin(t * Math.PI * 10) * 0.25);
          this.playerMesh.rotation.y += 0.26;
        }
      });

      const res = global.L3Data.evolveMonster(this.playerMon);
      this.game.state.caughtSpecies.add(res.newSpeciesId);
      this._spawnPlayerMonMesh(res.newSpeciesId);
      global.L3Audio.playEvolutionComplete(isMega);
      this.triggerShake(isMega ? 0.55 : 0.3, 0.45);

      this._updateUI();
      this._setLog(`🌟 ${res.oldName} transformou-se em ${res.newName.toUpperCase()}!`);
      this.game.autoSave(false);

      await sleep(1250);
      this.camMode = 'overview';
      this.busy = false;
      this._setControlsEnabled(true);
    }

    // ================================================================
    // TURN FLOW (1v1 & 3v1 SQUAD CYCLING)
    // ================================================================
    async executePlayerMove(moveIdx) {
      this.busy = true;
      this._setControlsEnabled(false);
      const sp = global.L3Data.SPECIES[this.playerMon.speciesId];
      const move = sp.moves[moveIdx];
      if (!move) { this.busy = false; this._setControlsEnabled(true); return; }

      await this._performMove(this.playerMon, this.wildMon, this.playerMesh, this._getEnemyMesh(), move, true);
      if (this.wildMon.hp <= 0) { await this._handleVictory(); return; }

      await this._advanceAfterPlayerAction();
    }

    async _advanceAfterPlayerAction() {
      if (!this.isTitanRaid) {
        await this._executeEnemyTurn();
        if (this.active) { this.busy = false; this._setControlsEnabled(true); }
        return;
      }

      // 3 vs 1 Titan Raid: mark current ally as acted, move to next ready alive ally!
      this.squadActed[this.activeSquadSlot] = true;
      const nextReady = this.squadMons.findIndex((m, i) => m.hp > 0 && !this.squadActed[i]);
      if (nextReady !== -1) {
        this._selectActiveSquadSlot(nextReady);
        this._setLog(`Agora é a vez de ${this.playerMon.name}! Escolha o ataque contra ${this.wildMon.name} GIGANTE!`);
        this.busy = false;
        this._setControlsEnabled(true);
        return;
      }

      // All alive allies acted -> GIANT TITAN BOSS STRIKES!
      await this._executeTitanBossTurn();
      if (!this.active) return;

      // Reset round for all alive squad members
      this.squadActed = this.squadMons.map((m) => m.hp <= 0);
      const firstAlive = this.squadMons.findIndex((m) => m.hp > 0);
      if (firstAlive !== -1) {
        this._selectActiveSquadSlot(firstAlive);
        this._setLog(`Nova rodada na Arena Titã! Sua vez com ${this.playerMon.name}!`);
        this.busy = false;
        this._setControlsEnabled(true);
      }
    }

    async _executeTitanBossTurn() {
      if (!this.active || this.wildMon.hp <= 0) return;
      const sp = global.L3Data.SPECIES[this.wildMon.speciesId];
      const move = sp.moves[Math.floor(Math.random() * 3)];

      this.camMode = 'wildFocus';
      global.L3Audio.playTitanRoar();
      this._setLog(`👑 ${this.wildMon.name.toUpperCase()} GIGANTE usou ${move.name} contra seus 3 Pokémons!!`);
      await sleep(500);

      // Boss sweeps ALL alive allies in the 3-fighter squad!
      const aliveIndices = this.squadMons.map((m, i) => (m.hp > 0 ? i : -1)).filter((i) => i !== -1);
      global.L3Audio.playAttack(move.fx);
      this.triggerShake(0.65, 0.55);

      for (const idx of aliveIndices) {
        const ally = this.squadMons[idx];
        const allyMesh = this.squadMeshes[idx];
        this.game.particles.spawnAttack(move.fx, this.wildSpot.clone().add(new THREE.Vector3(0, 2.0, 0)), allyMesh.position);

        const eff = global.L3Data.getEffectiveness(move.type, ally.type);
        const raw = ((move.power * 0.24) * (this.wildMon.atk / Math.max(10, ally.def))) * eff * (0.88 + Math.random() * 0.22);
        const dmg = Math.max(10, Math.round(raw));
        ally.hp = Math.max(0, ally.hp - dmg);
        this._spawnFloatingText(allyMesh.position, `-${dmg}`, eff > 1.1 ? 'super' : '');
        if (ally.hp <= 0) allyMesh.visible = false;
      }

      this._updateUI();
      await sleep(1100);
      this.camMode = 'overview';

      // Check if all 3 allies fainted
      const anyAlive = this.squadMons.some((m) => m.hp > 0);
      if (!anyAlive) {
        this._setLog(`O Titã ${this.wildMon.name} venceu desta vez! Retornando à cidade com equipe curada...`);
        await sleep(1650);
        this.game.healTeam(true);
        this.end(false, false);
      }
    }

    async _executeEnemyTurn() {
      if (!this.active || this.wildMon.hp <= 0) return;
      const sp = global.L3Data.SPECIES[this.wildMon.speciesId];
      let move = sp.moves[Math.floor(Math.random() * 3)];
      if (this.wildMon.hp < this.wildMon.maxHp * 0.35 && Math.random() < 0.28) move = sp.moves[3];

      await this._performMove(this.wildMon, this.playerMon, this._getEnemyMesh(), this.playerMesh, move, false);
      if (this.playerMon.hp <= 0) {
        this.playerMon.hp = 0; this._updateUI();
        this._setLog(`${this.playerMon.name} foi derrotado!`);
        await sleep(900);
        const alive = this.game.state.team.findIndex((m) => m.hp > 0);
        if (alive !== -1) { this._setLog('Escolha outro Pokémon!'); this._openSwitchModal(true); }
        else {
          this._setLog('Equipe derrotada! Levando ao Centro Pokémon...');
          await sleep(1250); this.game.healTeam(true); this.game.teleportPlayerToPlaza(); this.end(false, false);
        }
      }
    }

    async _performMove(attacker, defender, atkMesh, defMesh, move, isPlayerAttack) {
      this.camMode = isPlayerAttack ? 'playerFocus' : 'wildFocus';
      this._setLog(`${attacker.name} usou ${move.name}!`);

      if (move.power === 0 && move.healPct) {
        global.L3Audio.playHeal();
        const amt = Math.max(12, Math.round(attacker.maxHp * move.healPct));
        attacker.hp = Math.min(attacker.maxHp, attacker.hp + amt);
        this.game.particles.spawnHeal(atkMesh.position);
        this._spawnFloatingText(atkMesh.position, `+${amt}`, 'heal');
        this._updateUI();
        await sleep(800);
        this.camMode = 'overview';
        return;
      }

      const origin = atkMesh.position.clone();
      const lungeDir = defMesh.position.clone().sub(origin).setY(0).normalize();
      atkMesh.position.addScaledVector(lungeDir, 0.9);
      global.L3Audio.playAttack(move.fx);
      const targetAim = defMesh.position.clone().add(new THREE.Vector3(0, this.isTitanRaid && isPlayerAttack ? 2.2 : 0, 0));
      this.game.particles.spawnAttack(move.fx, origin, targetAim);
      await sleep(230);
      atkMesh.position.copy(origin);

      this.camMode = isPlayerAttack ? 'wildFocus' : 'playerFocus';
      const eff = global.L3Data.getEffectiveness(move.type, defender.type);
      const stab = attacker.type === move.type ? 1.15 : 1.0;
      const variance = 0.88 + Math.random() * 0.24;
      const raw = ((move.power * 0.35) * (attacker.atk / Math.max(8, defender.def))) * stab * eff * variance;
      const dmg = Math.max(9, Math.round(raw));

      defender.hp = Math.max(0, defender.hp - dmg);
      global.L3Audio.playHit(eff);
      this.triggerShake(eff > 1.1 ? 0.42 : 0.24, 0.28);

      const defOrigin = defMesh.position.clone();
      defMesh.position.addScaledVector(lungeDir, 0.45);
      this._spawnFloatingText(targetAim, `-${dmg}`, eff > 1.1 ? 'super' : '');
      this._updateUI();
      await sleep(220);
      defMesh.position.copy(defOrigin);

      if (eff > 1.1) this._setLog(`SUPER EFETIVO! ${defender.name} sofreu ${dmg} de dano!`);
      else if (eff < 0.9) this._setLog(`Pouco efetivo... ${defender.name} sofreu ${dmg} de dano.`);
      else this._setLog(`${defender.name} recebeu ${dmg} de dano!`);
      await sleep(650);
      this.camMode = 'overview';
    }

    // ================================================================
    // BAG: POTION & CAPTURE (UP TO 30 POKÉMON + TITAN CAPTURE!)
    // ================================================================
    _openBagModal() {
      const inv = this.game.state.inventory;
      this.elQtyCubo.textContent = 'x' + inv.cuboBalls;
      this.elQtySuper.textContent = 'x' + inv.superBalls;
      this.elQtyPotion.textContent = 'x' + inv.potions;
      this.elItemCubo.disabled = inv.cuboBalls <= 0;
      this.elItemSuper.disabled = inv.superBalls <= 0;
      const needHeal = this.isTitanRaid ? this.squadMons.some((m) => m.hp > 0 && m.hp < m.maxHp) : this.playerMon.hp < this.playerMon.maxHp;
      this.elItemPotion.disabled = inv.potions <= 0 || !needHeal;
      this.elBagModal.classList.remove('hidden');
    }

    _openSwitchModal(forced = false) {
      if (this.isTitanRaid) return;
      this.elSwitchList.innerHTML = '';
      const D = global.L3Data;
      this.game.state.team.forEach((mon, idx) => {
        const sp = D.SPECIES[mon.speciesId];
        const isCur = idx === this.game.state.activeTeamIndex;
        const btn = document.createElement('button');
        btn.type = 'button'; btn.className = 'bag-item-btn';
        btn.disabled = mon.hp <= 0 || isCur;
        btn.innerHTML = `
          <div class="poke-avatar ${sp.avatarClass} ${sp.isShiny ? 'shiny-glow' : sp.isMega ? 'mega-glow' : ''}"></div>
          <div class="bag-item-info">
            <div class="bag-item-title">${mon.name} <span style="color:#facc15;font-size:0.82rem;">Nv.${mon.level}</span></div>
            <div class="bag-item-desc">HP: ${Math.round(mon.hp)} / ${mon.maxHp} • ${D.TYPE_LABELS[mon.type]}</div>
          </div>
          <div class="bag-item-qty" style="font-size:0.78rem;">${isCur ? 'EM CAMPO' : mon.hp <= 0 ? 'NOCAUTE' : 'TROCAR'}</div>
        `;
        btn.addEventListener('click', () => {
          global.L3Audio.playClick();
          this.elSwitchModal.classList.add('hidden');
          this._switchToMonster(idx, forced);
        });
        this.elSwitchList.appendChild(btn);
      });
      this.elSwitchModal.classList.remove('hidden');
    }

    async _switchToMonster(newIdx, forced) {
      this.busy = true; this._setControlsEnabled(false);
      this.game.state.activeTeamIndex = newIdx;
      this.playerMon = this.game.state.team[newIdx];
      this._spawnPlayerMonMesh(this.playerMon.speciesId);
      this.game.particles.spawnBurst(this.playerSpot.clone().add(new THREE.Vector3(0, 1.0, 0)), [0xe879f9, 0x22d3ee, 0xffffff], 24, 5, 0.2, -4, 0.6);
      this._updateUI();
      this._setLog(`Vai, ${this.playerMon.name}!`);
      await sleep(750);
      if (!forced) await this._executeEnemyTurn();
      if (this.active) { this.busy = false; this._setControlsEnabled(true); }
    }

    async executeUsePotion() {
      if (this.game.state.inventory.potions <= 0) return;
      this.busy = true; this._setControlsEnabled(false);
      this.game.state.inventory.potions -= 1;

      global.L3Audio.playHeal();
      if (this.isTitanRaid) {
        this.squadMons.forEach((m, i) => {
          if (m.hp > 0) {
            const amt = Math.round(m.maxHp * 0.75);
            m.hp = Math.min(m.maxHp, m.hp + amt);
            this.game.particles.spawnHeal(this.squadSpots[i]);
            this._spawnFloatingText(this.squadSpots[i], `+${amt}`, 'heal');
          }
        });
        this._setLog('🧪 Poção Mega usada! Todo o seu trio da Arena Titã recuperou HP!');
      } else {
        const amt = Math.max(25, Math.round(this.playerMon.maxHp * 0.75));
        this.playerMon.hp = Math.min(this.playerMon.maxHp, this.playerMon.hp + amt);
        this.game.particles.spawnHeal(this.playerMesh.position);
        this._spawnFloatingText(this.playerMesh.position, `+${amt}`, 'heal');
        this._setLog(`Poção Mega usada! ${this.playerMon.name} recuperou ${amt} HP!`);
      }
      this._updateUI();
      await sleep(850);
      await this._advanceAfterPlayerAction();
    }

    async executeThrowBall(isMaster = false) {
      const inv = this.game.state.inventory;
      if (isMaster && inv.superBalls <= 0) return;
      if (!isMaster && inv.cuboBalls <= 0) return;
      this.busy = true; this._setControlsEnabled(false);
      if (isMaster) inv.superBalls -= 1; else inv.cuboBalls -= 1;
      this._updateUI();

      const enemyMesh = this._getEnemyMesh();
      const label = isMaster ? 'Master-Cubo' : 'Poké-Cubo';
      this._setLog(`Lorenzo arremessou um ${label}!`);
      global.L3Audio.playThrow();
      this.camMode = 'captureFocus';

      if (this.cuboBallMesh) this.game.scene.remove(this.cuboBallMesh);
      this.cuboBallMesh = global.L3Voxels.buildPokeCuboMesh(isMaster);
      if (this.isTitanRaid) this.cuboBallMesh.scale.setScalar(1.65);

      const startPos = this.game.playerMesh.position.clone().add(new THREE.Vector3(0, 1.8, 0));
      const targetPos = this.wildSpot.clone().add(new THREE.Vector3(0, this.isTitanRaid ? 2.6 : 1.0, 0));
      const landPos = this.wildSpot.clone().add(new THREE.Vector3(0, this.isTitanRaid ? 0.55 : 0.32, 0));
      this.cuboBallMesh.position.copy(startPos);
      this.game.scene.add(this.cuboBallMesh);

      await this._animateDuration(500, (t) => {
        const p = new THREE.Vector3().lerpVectors(startPos, targetPos, t);
        p.y += Math.sin(t * Math.PI) * (this.isTitanRaid ? 5.2 : 3.1);
        this.cuboBallMesh.position.copy(p);
        this.cuboBallMesh.rotation.x += 0.25;
      });

      global.L3Audio.playAbsorb();
      this.game.particles.spawnBurst(targetPos, [0xe879f9, 0x22d3ee, 0xffffff], 32, 6.2, 0.24, -2, 0.6);

      const origScale = enemyMesh.scale.x;
      await this._animateDuration(340, (t) => {
        enemyMesh.scale.setScalar(Math.max(0.01, (1 - t) * origScale));
        this.cuboBallMesh.position.lerpVectors(targetPos, landPos, t);
        this.cuboBallMesh.rotation.set(0, 0, 0);
      });
      enemyMesh.visible = false;

      const sp = global.L3Data.SPECIES[this.wildMon.speciesId];
      const hpRatio = this.wildMon.hp / this.wildMon.maxHp;
      const catchChance = Math.min(0.97, (sp.catchRate + (1 - hpRatio) * 0.54) * (isMaster ? 2.3 : 1.0));
      const caught = Math.random() < catchChance;
      const wobbles = caught ? 3 : (1 + Math.floor(Math.random() * 2));

      for (let w = 0; w < wobbles; w++) {
        await sleep(280);
        global.L3Audio.playWobble(w);
        this._setLog(`O ${label} balançou${'.'.repeat(w + 1)}`);
        await this._animateDuration(360, (t) => {
          this.cuboBallMesh.rotation.z = Math.sin(t * Math.PI * 2) * 0.42;
          this.cuboBallMesh.position.y = landPos.y + Math.abs(Math.sin(t * Math.PI)) * 0.2;
        });
        this.cuboBallMesh.rotation.z = 0; this.cuboBallMesh.position.y = landPos.y;
      }

      await sleep(300);

      if (caught) {
        global.L3Audio.playCaptureSuccess();
        this.game.particles.spawnBurst(landPos.clone().add(new THREE.Vector3(0, 0.5, 0)), [0xfacc15, 0xe879f9, 0x22d3ee, 0xffffff], 52, 8.0, 0.25, -5, 1.1);

        // Normalize boss HP back to team HP when captured!
        const capturedMon = this.wildMon;
        if (capturedMon.isGiantBossInstance && capturedMon.normalMaxHp) {
          capturedMon.maxHp = capturedMon.normalMaxHp;
          delete capturedMon.normalMaxHp;
          delete capturedMon.isGiantBossInstance;
        }
        capturedMon.hp = Math.max(Math.round(capturedMon.maxHp * 0.7), Math.min(capturedMon.maxHp, capturedMon.hp));
        this.game.state.caughtSpecies.add(capturedMon.speciesId);

        if (this.game.state.team.length < 30) {
          this.game.state.team.push(capturedMon);
          // Register capture for the 3-different Titan Arena trigger!
          if (!this.isTitanRaid) {
            this.game.registerWildCapture(capturedMon);
          } else {
            this.game.state.raidsWon = (this.game.state.raidsWon || 0) + 1;
            this.game.state.inventory.superBalls += 3;
          }
          this._setLog(`✨ CAPTURADO! ${capturedMon.name} entrou para sua equipe (${this.game.state.team.length}/30)!`);
          this.game.showToast(`${capturedMon.name} capturado! (${this.game.state.team.length}/30)`, 'success');
        } else {
          this.game.state.inventory.superBalls += 2;
          this._setLog(`✨ ${capturedMon.name} registrado na Pokédex! Equipe cheia (30/30) — descarte um Pokémon na aba Equipe para abrir vaga!`);
        }

        // Grant XP
        const recipients = this.isTitanRaid ? this.squadMons : [this.playerMon];
        const xpGain = this.isTitanRaid ? 85 : (30 + capturedMon.level * 11);
        recipients.forEach((m) => global.L3Data.grantXp(m, xpGain));
        this._updateUI();
        await sleep(1450);
        this.end(true, !this.isTitanRaid);
      } else {
        global.L3Audio.playCaptureFail();
        this.game.particles.spawnBurst(landPos, [0xf43f5e, 0xf97316, 0xffffff], 24, 5.5, 0.2, -5, 0.65);
        this.game.scene.remove(this.cuboBallMesh); this.cuboBallMesh = null;
        enemyMesh.visible = true;
        enemyMesh.scale.setScalar(origScale);
        this._setLog(`Quase! ${this.wildMon.name} escapou do ${label}!`);
        this.camMode = 'overview';
        await sleep(800);
        await this._advanceAfterPlayerAction();
      }
    }

    async _handleVictory() {
      this.wildMon.hp = 0; this._updateUI();
      const enemyMesh = this._getEnemyMesh();
      if (enemyMesh) enemyMesh.visible = false;
      this.game.particles.spawnBurst(this.wildSpot.clone().add(new THREE.Vector3(0, this.isTitanRaid ? 2.5 : 1.0, 0)), [0xfacc15, 0xe879f9, 0xffffff], 48, 8.2, 0.26, -6, 0.95);

      if (this.isTitanRaid) {
        this.game.state.raidsWon = (this.game.state.raidsWon || 0) + 1;
        this.game.state.inventory.superBalls += 3;
        this.game.state.inventory.cuboBalls += 5;
        this.squadMons.forEach((m) => global.L3Data.grantXp(m, 95));
        global.L3Audio.playLevelUp();
        this._setLog(`🏆 VITÓRIA TITÂNICA!! ${this.wildMon.name.toUpperCase()} GIGANTE foi derrotado! +95 XP p/ o trio e +3 Master-Cubos!`);
        this.game.showToast(`👑 Titã ${this.wildMon.name} derrotado! (+3 Master-Cubos!)`, 'gold');
        await sleep(1800);
        this.end(false, false);
        return;
      }

      this.game.state.battlesWon = (this.game.state.battlesWon || 0) + 1;
      const xpGain = 34 + this.wildMon.level * 12;
      const leveled = global.L3Data.grantXp(this.playerMon, xpGain);
      this.game.state.inventory.cuboBalls += 2;
      if (this.game.state.battlesWon % 2 === 0) this.game.state.inventory.superBalls += 1;

      this._setLog(`🏆 Vitória! ${this.wildMon.name} foi derrotado! +${xpGain} XP e Poké-Cubos!`);
      this._updateUI();
      if (leveled) {
        await sleep(800); global.L3Audio.playLevelUp(); this.game.particles.spawnHeal(this.playerSpot);
        this._setLog(`🎉 ${this.playerMon.name} subiu para Nv. ${this.playerMon.level}!`); this._updateUI();
      }
      await sleep(1300);
      this.end(true, false);
    }

    async executeFlee() {
      this.busy = true; this._setControlsEnabled(false);
      global.L3Audio.playFlee();
      this._setLog(this.isTitanRaid ? 'Saindo da Arena Titã de volta para a cidade...' : 'Você fugiu da batalha!');
      await sleep(600);
      this.end(false, false);
    }

    _animateDuration(ms, onFrame) {
      return new Promise((resolve) => {
        const start = performance.now();
        const step = (now) => {
          const t = Math.min(1, (now - start) / ms);
          onFrame(t);
          if (t < 1 && this.active) requestAnimationFrame(step); else resolve();
        };
        requestAnimationFrame(step);
      });
    }

    triggerShake(amp = 0.25, duration = 0.25) { this.shakeAmp = amp; this.shakeTime = duration; }

    _spawnFloatingText(worldPos, text, extraClass = '') {
      const proj = worldPos.clone().add(new THREE.Vector3(0, 2.2, 0)).project(this.game.camera);
      const el = document.createElement('div');
      el.className = 'floating-dmg ' + extraClass;
      el.textContent = text;
      el.style.left = ((proj.x * 0.5 + 0.5) * window.innerWidth) + 'px';
      el.style.top = ((-proj.y * 0.5 + 0.5) * window.innerHeight) + 'px';
      this.elFxLayer.appendChild(el);
      setTimeout(() => el.remove(), 1300);
    }

    update(dt, time) {
      if (!this.active) return;

      if (this.isTitanRaid) {
        // Animate Giant Boss, 3 Allied Squad Pokémon & Cosmic Colosseum Crystals!
        if (this.bossMesh && this.bossMesh.visible) global.L3Voxels.animatePokemon(this.bossMesh, time * 0.85, 0);
        this.squadMeshes.forEach((m, i) => { if (m.visible) global.L3Voxels.animatePokemon(m, time + i * 0.9, 0); });
        this.squadRings.forEach((r) => (r.rotation.z = time * 1.4));
        if (this.titanArena.userData.crystals) {
          this.titanArena.userData.crystals.forEach((c, i) => {
            c.rotation.y = time * 1.8 + i;
            c.position.y = 11.4 + Math.sin(time * 2.5 + i) * 0.35;
          });
        }
        // Cinematic wide cosmic stadium camera framing all 3 fighters vs Giant Boss!
        const sway = Math.sin(time * 0.55) * 2.4;
        if (this.camMode === 'wildFocus') {
          this.camTargetPos.set(6.5, ARENA_Y + 6.4, 4.5);
          this.camTargetLook.set(0, ARENA_Y + 3.4, -6.2);
        } else if (this.camMode === 'playerFocus') {
          this.camTargetPos.set(this.playerSpot.x + 5.2, ARENA_Y + 3.2, this.playerSpot.z + 4.8);
          this.camTargetLook.set(this.playerSpot.x, ARENA_Y + 1.3, this.playerSpot.z);
        } else if (this.camMode === 'captureFocus') {
          this.camTargetPos.set(5.5, ARENA_Y + 4.2, 2.5);
          this.camTargetLook.set(0, ARENA_Y + 1.8, -6.2);
        } else {
          this.camTargetPos.set(9.8 + sway, ARENA_Y + 6.8 + Math.cos(time * 0.5) * 0.4, 13.8);
          this.camTargetLook.set(0, ARENA_Y + 2.4, -1.6);
        }
      } else {
        if (this.playerMesh) global.L3Voxels.animatePokemon(this.playerMesh, time, 0);
        if (this.wildEntity && this.wildEntity.mesh.visible) global.L3Voxels.animatePokemon(this.wildEntity.mesh, time + 1.2, 0);
        if (this.playerRing) this.playerRing.rotation.z = time * 1.4;
        if (this.wildRing) this.wildRing.rotation.z = -time * 1.4;

        const dirToWild = this.wildSpot.clone().sub(this.playerSpot).setY(0).normalize();
        const sway = Math.sin(time * 0.7) * 0.85;
        if (this.camMode === 'playerFocus') {
          this.camTargetPos.copy(this.playerSpot).addScaledVector(this.arenaRight, 4.8).addScaledVector(dirToWild, 2.5).add(new THREE.Vector3(0, 2.6, 0));
          this.camTargetLook.copy(this.playerSpot).add(new THREE.Vector3(0, 1.2, 0));
        } else if (this.camMode === 'wildFocus') {
          this.camTargetPos.copy(this.wildSpot).addScaledVector(this.arenaRight, 4.8).addScaledVector(dirToWild, -2.6).add(new THREE.Vector3(0, 2.6, 0));
          this.camTargetLook.copy(this.wildSpot).add(new THREE.Vector3(0, 1.2, 0));
        } else if (this.camMode === 'captureFocus') {
          this.camTargetPos.copy(this.wildSpot).addScaledVector(this.arenaRight, 3.8).addScaledVector(dirToWild, -3.2).add(new THREE.Vector3(0, 2.1, 0));
          this.camTargetLook.copy(this.wildSpot).add(new THREE.Vector3(0, 0.8, 0));
        } else {
          this.camTargetPos.copy(this.arenaCenter).addScaledVector(this.arenaRight, 8.3 + sway).addScaledVector(dirToWild, -4.1).add(new THREE.Vector3(0, 3.9 + Math.cos(time * 0.6) * 0.25, 0));
          this.camTargetLook.copy(this.arenaCenter).add(new THREE.Vector3(0, 1.25, 0));
        }
      }

      this.game.camera.position.lerp(this.camTargetPos, Math.min(1, dt * 4.4));
      if (this.shakeTime > 0) {
        this.shakeTime -= dt;
        const mag = this.shakeAmp * Math.min(1, this.shakeTime / 0.3);
        this.game.camera.position.x += (Math.random() - 0.5) * mag;
        this.game.camera.position.y += (Math.random() - 0.5) * mag;
      }
      this.game.camera.lookAt(this.camTargetLook);
    }
  }

  global.L3Battle = BattleManager3;
})(window);
