/* ================================================================
   LORENZO GAME 2 — Turn-Based Battle, Capture & Live Evolution
   ================================================================ */
(function (global) {
  'use strict';

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  class BattleManager2 {
    constructor(game) {
      this.game = game;
      this.active = false;
      this.busy = false;

      this.wildEntity = null;
      this.wildMon = null;
      this.playerMon = null;

      this.playerMesh = null;
      this.playerRing = null;
      this.wildRing = null;
      this.cuboBallMesh = null;

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

      this.elLog = document.getElementById('battle-log-text');
      this.elMoveBtns = Array.from(document.querySelectorAll('.move-btn'));

      this.elBtnEvolve = document.getElementById('btn-battle-evolve');
      this.elEvoSub = document.getElementById('battle-evo-sub');
      this.elBtnBag = document.getElementById('btn-bag');
      this.elBtnSwitch = document.getElementById('btn-switch');
      this.elBtnFlee = document.getElementById('btn-flee');
      this.elBagBadge = document.getElementById('bag-ball-badge');

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
          global.L2Audio.playClick();
          this.executePlayerMove(idx);
        });
      });

      this.elBtnEvolve.addEventListener('click', () => {
        if (this.busy || !this.active) return;
        this.executeBattleEvolution();
      });

      this.elBtnBag.addEventListener('click', () => {
        if (this.busy || !this.active) return;
        global.L2Audio.playClick();
        this._openBagModal();
      });

      document.getElementById('btn-close-bag').addEventListener('click', () => {
        global.L2Audio.playClick();
        this.elBagModal.classList.add('hidden');
      });

      this.elBtnSwitch.addEventListener('click', () => {
        if (this.busy || !this.active) return;
        global.L2Audio.playClick();
        this._openSwitchModal(false);
      });

      document.getElementById('btn-close-switch').addEventListener('click', () => {
        if (this.playerMon && this.playerMon.hp <= 0) return;
        global.L2Audio.playClick();
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

    start(wildEntity) {
      if (this.active) return;
      let activeIdx = this.game.state.activeTeamIndex;
      if (!this.game.state.team[activeIdx] || this.game.state.team[activeIdx].hp <= 0) {
        const aliveIdx = this.game.state.team.findIndex((m) => m.hp > 0);
        if (aliveIdx === -1) { this.game.healTeam(true); activeIdx = 0; }
        else activeIdx = aliveIdx;
        this.game.state.activeTeamIndex = activeIdx;
      }

      this.active = true;
      this.busy = true;
      this.wildEntity = wildEntity;
      this.wildMon = global.L2Data.createMonster(wildEntity.speciesId, wildEntity.level);
      this.playerMon = this.game.state.team[activeIdx];

      if (document.pointerLockElement) document.exitPointerLock();
      global.L2Audio.playBattleStart();

      // Hide exploration partner while battle copy is active
      if (this.game.partnerMesh) this.game.partnerMesh.visible = false;
      if (wildEntity.nameplate) wildEntity.nameplate.visible = false;
      this.game.setExplorationHudVisible(false);
      this.elBattleUI.classList.remove('hidden');
      this.elBagModal.classList.add('hidden');
      this.elSwitchModal.classList.add('hidden');

      const wildPos = wildEntity.mesh.position.clone();
      const playerPos = this.game.playerMesh.position.clone();
      let dir = wildPos.clone().sub(playerPos).setY(0);
      if (dir.lengthSq() < 0.01) dir.set(0, 0, -1);
      dir.normalize();

      this.wildSpot.copy(wildPos);
      this.wildSpot.y = this.game.world.getWalkableY(this.wildSpot.x, this.wildSpot.z);

      this.playerSpot.copy(this.wildSpot).addScaledVector(dir, -6.5);
      const lim = this.game.world.worldRadius - 2;
      this.playerSpot.x = Math.max(-lim, Math.min(lim, this.playerSpot.x));
      this.playerSpot.z = Math.max(-lim, Math.min(lim, this.playerSpot.z));
      this.playerSpot.y = this.game.world.getWalkableY(this.playerSpot.x, this.playerSpot.z);

      this.arenaCenter.copy(this.playerSpot).lerp(this.wildSpot, 0.5);
      this.arenaRight.crossVectors(dir, new THREE.Vector3(0, 1, 0)).normalize();

      wildEntity.inBattle = true;
      wildEntity.mesh.position.copy(this.wildSpot);
      wildEntity.mesh.visible = true;
      wildEntity.mesh.scale.setScalar(1.1);
      wildEntity.mesh.lookAt(this.playerSpot.x, this.wildSpot.y, this.playerSpot.z);

      this.game.playerMesh.position.copy(this.playerSpot).addScaledVector(dir, -2.5);
      this.game.playerMesh.position.y = this.game.world.getWalkableY(this.game.playerMesh.position.x, this.game.playerMesh.position.z);
      this.game.playerMesh.lookAt(this.wildSpot.x, this.game.playerMesh.position.y, this.wildSpot.z);

      this._spawnPlayerMonMesh(this.playerMon.speciesId);

      this.playerRing = global.L2Voxels.buildTargetRing(0x22d3ee);
      this.playerRing.position.set(this.playerSpot.x, this.playerSpot.y + 0.08, this.playerSpot.z);
      this.game.scene.add(this.playerRing);

      this.wildRing = global.L2Voxels.buildTargetRing(0xf43f5e);
      this.wildRing.position.set(this.wildSpot.x, this.wildSpot.y + 0.08, this.wildSpot.z);
      this.game.scene.add(this.wildRing);

      this.camMode = 'overview';
      this._updateUI();
      this._setControlsEnabled(false);
      this._setLog(`Um ${this.wildMon.name} selvagem (Nv. ${this.wildMon.level}) apareceu! Vai, ${this.playerMon.name}!`);
      this.game.particles.spawnBurst(this.playerSpot.clone().add(new THREE.Vector3(0, 0.9, 0)), [0x22d3ee, 0xffffff, 0xfacc15], 22, 4.8, 0.2, -4, 0.65);

      setTimeout(() => {
        if (this.active) {
          this.busy = false;
          this._setControlsEnabled(true);
        }
      }, 800);
    }

    _spawnPlayerMonMesh(speciesId) {
      if (this.playerMesh) this.game.scene.remove(this.playerMesh);
      this.playerMesh = global.L2Voxels.buildPokemonMesh(speciesId);
      this.playerMesh.position.copy(this.playerSpot);
      this.playerMesh.scale.setScalar(1.1);
      this.playerMesh.lookAt(this.wildSpot.x, this.playerSpot.y, this.wildSpot.z);
      this.game.scene.add(this.playerMesh);
    }

    end(removeWild = false) {
      if (!this.active) return;
      this.active = false;
      this.busy = false;

      if (this.playerMesh)   { this.game.scene.remove(this.playerMesh); this.playerMesh = null; }
      if (this.playerRing)   { this.game.scene.remove(this.playerRing); this.playerRing = null; }
      if (this.wildRing)     { this.game.scene.remove(this.wildRing); this.wildRing = null; }
      if (this.cuboBallMesh) { this.game.scene.remove(this.cuboBallMesh); this.cuboBallMesh = null; }

      if (this.wildEntity) {
        if (removeWild) this.game.removeAndRespawnWild(this.wildEntity);
        else {
          this.wildEntity.inBattle = false;
          this.wildEntity.mesh.visible = true;
          this.wildEntity.mesh.scale.setScalar(1);
          if (this.wildEntity.nameplate) this.wildEntity.nameplate.visible = true;
        }
        this.wildEntity = null;
      }

      this.game.syncPlayerFromMesh();
      this.game.rebuildPartnerMesh();
      this.elBattleUI.classList.add('hidden');
      this.elBagModal.classList.add('hidden');
      this.elSwitchModal.classList.add('hidden');
      this.game.setExplorationHudVisible(true);
      this.game.refreshHudAndTeam();
      this.game.autoSave(false);
    }

    _setLog(text) { this.elLog.textContent = text; }

    _setControlsEnabled(enabled) {
      this.elMoveBtns.forEach((b) => (b.disabled = !enabled));
      this.elBtnBag.disabled = !enabled;
      this.elBtnSwitch.disabled = !enabled;
      this.elBtnFlee.disabled = !enabled;
      this.elBtnEvolve.disabled = !enabled || !global.L2Data.canEvolve(this.playerMon);
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

    _updateUI() {
      if (!this.wildMon || !this.playerMon) return;
      const D = global.L2Data;

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

      // Evolve Button State
      if (D.canEvolve(this.playerMon)) {
        const nextSp = D.SPECIES[sp.evolvesTo];
        this.elBtnEvolve.disabled = this.busy;
        this.elEvoSub.textContent = '→ ' + nextSp.name;
      } else {
        this.elBtnEvolve.disabled = true;
        this.elEvoSub.textContent = 'Forma Final!';
      }

      const inv = this.game.state.inventory;
      this.elBagBadge.textContent = (inv.cuboBalls + inv.superBalls) + ' Cubos';
    }

    // ================================================================
    // INSTANT LIVE EVOLUTION IN BATTLE!
    // ================================================================
    async executeBattleEvolution() {
      if (!global.L2Data.canEvolve(this.playerMon)) return;
      this.busy = true;
      this._setControlsEnabled(false);

      const oldName = this.playerMon.name;
      const nextSp = global.L2Data.SPECIES[global.L2Data.SPECIES[this.playerMon.speciesId].evolvesTo];

      this.camMode = 'playerFocus';
      global.L2Audio.playEvolutionStart();
      this._setLog(`✨ O quê?! ${oldName} está evoluindo para ${nextSp.name}!!`);
      this.game.particles.spawnEvolutionVortex(this.playerSpot);

      // Pulsing golden transformation
      await this._animateDuration(750, (t) => {
        if (this.playerMesh) {
          const pulse = 1.1 + Math.sin(t * Math.PI * 10) * 0.25;
          this.playerMesh.scale.setScalar(pulse);
          this.playerMesh.rotation.y += 0.22;
        }
      });

      // Perform evolution
      const res = global.L2Data.evolveMonster(this.playerMon);
      this.game.state.caughtSpecies.add(res.newSpeciesId);
      this._spawnPlayerMonMesh(res.newSpeciesId);
      global.L2Audio.playEvolutionComplete();
      this.triggerShake(0.32, 0.35);

      this._updateUI();
      this._setLog(`🌟 INCRÍVEL! ${res.oldName} evoluiu para ${res.newName.toUpperCase()}! HP restaurado e novos golpes liberados!`);
      this.game.autoSave(false);

      await sleep(1350);
      this.camMode = 'overview';
      this.busy = false;
      this._setControlsEnabled(true);
    }

    _openBagModal() {
      const inv = this.game.state.inventory;
      this.elQtyCubo.textContent = 'x' + inv.cuboBalls;
      this.elQtySuper.textContent = 'x' + inv.superBalls;
      this.elQtyPotion.textContent = 'x' + inv.potions;
      this.elItemCubo.disabled = inv.cuboBalls <= 0;
      this.elItemSuper.disabled = inv.superBalls <= 0;
      this.elItemPotion.disabled = inv.potions <= 0 || this.playerMon.hp >= this.playerMon.maxHp;
      this.elBagModal.classList.remove('hidden');
    }

    _openSwitchModal(forced = false) {
      this.elSwitchList.innerHTML = '';
      const D = global.L2Data;
      this.game.state.team.forEach((mon, idx) => {
        const sp = D.SPECIES[mon.speciesId];
        const isCurrent = idx === this.game.state.activeTeamIndex;
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'bag-item-btn';
        btn.disabled = mon.hp <= 0 || isCurrent;
        btn.innerHTML = `
          <div class="poke-avatar ${sp.avatarClass}"></div>
          <div class="bag-item-info">
            <div class="bag-item-title">${mon.name} <span style="color:#facc15;font-size:0.82rem;">Nv.${mon.level}</span></div>
            <div class="bag-item-desc">HP: ${Math.round(mon.hp)} / ${mon.maxHp} • ${D.TYPE_LABELS[mon.type]}</div>
          </div>
          <div class="bag-item-qty" style="font-size:0.78rem;">${isCurrent ? 'EM CAMPO' : mon.hp <= 0 ? 'NOCAUTE' : 'TROCAR'}</div>
        `;
        btn.addEventListener('click', () => {
          global.L2Audio.playClick();
          this.elSwitchModal.classList.add('hidden');
          this._switchToMonster(idx, forced);
        });
        this.elSwitchList.appendChild(btn);
      });
      this.elSwitchModal.classList.remove('hidden');
    }

    async _switchToMonster(newIdx, forced) {
      this.busy = true;
      this._setControlsEnabled(false);
      this.game.state.activeTeamIndex = newIdx;
      this.playerMon = this.game.state.team[newIdx];
      this._spawnPlayerMonMesh(this.playerMon.speciesId);
      this.game.particles.spawnBurst(this.playerSpot.clone().add(new THREE.Vector3(0, 0.9, 0)), [0x22d3ee, 0xffffff], 22, 4.8, 0.2, -4, 0.6);
      this._updateUI();
      this._setLog(`Vai, ${this.playerMon.name}! Eu escolho você!`);
      await sleep(850);
      if (!forced) await this._executeWildTurn();
      if (this.active) { this.busy = false; this._setControlsEnabled(true); }
    }

    async executePlayerMove(moveIdx) {
      this.busy = true;
      this._setControlsEnabled(false);
      const sp = global.L2Data.SPECIES[this.playerMon.speciesId];
      const move = sp.moves[moveIdx];
      if (!move) { this.busy = false; this._setControlsEnabled(true); return; }

      await this._performMove(this.playerMon, this.wildMon, this.playerMesh, this.wildEntity.mesh, move, true);
      if (this.wildMon.hp <= 0) { await this._handleVictory(); return; }

      await this._executeWildTurn();
      if (this.active) { this.busy = false; this._setControlsEnabled(true); }
    }

    async _executeWildTurn() {
      if (!this.active || this.wildMon.hp <= 0) return;
      const sp = global.L2Data.SPECIES[this.wildMon.speciesId];
      let move = sp.moves[Math.floor(Math.random() * 3)];
      if (this.wildMon.hp < this.wildMon.maxHp * 0.38 && Math.random() < 0.3) move = sp.moves[3];

      await this._performMove(this.wildMon, this.playerMon, this.wildEntity.mesh, this.playerMesh, move, false);
      if (this.playerMon.hp <= 0) {
        this.playerMon.hp = 0;
        this._updateUI();
        this._setLog(`${this.playerMon.name} foi derrotado!`);
        await sleep(1000);
        const aliveIdx = this.game.state.team.findIndex((m) => m.hp > 0);
        if (aliveIdx !== -1) {
          this._setLog('Escolha outro Pokémon da sua equipe!');
          this._openSwitchModal(true);
        } else {
          this._setLog('Equipe derrotada! Levando ao Centro Pokémon...');
          await sleep(1300);
          this.game.healTeam(true);
          this.game.teleportPlayerToPlaza();
          this.end(false);
        }
      }
    }

    async _performMove(attacker, defender, atkMesh, defMesh, move, isPlayerAttack) {
      this.camMode = isPlayerAttack ? 'playerFocus' : 'wildFocus';
      this._setLog(`${attacker.name} usou ${move.name}!`);

      if (move.power === 0 && move.healPct) {
        global.L2Audio.playHeal();
        const amt = Math.max(10, Math.round(attacker.maxHp * move.healPct));
        attacker.hp = Math.min(attacker.maxHp, attacker.hp + amt);
        this.game.particles.spawnHeal(atkMesh.position);
        this._spawnFloatingText(atkMesh.position, `+${amt}`, 'heal');
        this._updateUI();
        await sleep(900);
        this.camMode = 'overview';
        return;
      }

      const origin = atkMesh.position.clone();
      const lungeDir = defMesh.position.clone().sub(origin).setY(0).normalize();
      atkMesh.position.addScaledVector(lungeDir, 0.85);
      global.L2Audio.playAttack(move.fx);
      this.game.particles.spawnAttack(move.fx, origin, defMesh.position);

      await sleep(240);
      atkMesh.position.copy(origin);

      this.camMode = isPlayerAttack ? 'wildFocus' : 'playerFocus';
      const eff = global.L2Data.getEffectiveness(move.type, defender.type);
      const stab = attacker.type === move.type ? 1.15 : 1.0;
      const variance = 0.88 + Math.random() * 0.24;
      const raw = ((move.power * 0.34) * (attacker.atk / Math.max(6, defender.def))) * stab * eff * variance;
      const dmg = Math.max(6, Math.round(raw));

      defender.hp = Math.max(0, defender.hp - dmg);
      global.L2Audio.playHit(eff);
      this.triggerShake(eff > 1.1 ? 0.38 : 0.22, 0.28);

      const defOrigin = defMesh.position.clone();
      defMesh.position.addScaledVector(lungeDir, 0.45);
      this._spawnFloatingText(defMesh.position, `-${dmg}`, eff > 1.1 ? 'super' : '');
      this._updateUI();

      await sleep(220);
      defMesh.position.copy(defOrigin);

      if (eff > 1.1) this._setLog(`SUPER EFETIVO! ${defender.name} sofreu ${dmg} de dano!`);
      else if (eff < 0.9) this._setLog(`Pouco efetivo... ${defender.name} sofreu ${dmg} de dano.`);
      else this._setLog(`${defender.name} recebeu ${dmg} de dano!`);

      await sleep(720);
      this.camMode = 'overview';
    }

    async executeUsePotion() {
      if (this.game.state.inventory.potions <= 0) return;
      this.busy = true;
      this._setControlsEnabled(false);
      this.game.state.inventory.potions -= 1;
      const amt = Math.max(20, Math.round(this.playerMon.maxHp * 0.65));
      this.playerMon.hp = Math.min(this.playerMon.maxHp, this.playerMon.hp + amt);
      this.camMode = 'playerFocus';
      global.L2Audio.playHeal();
      this.game.particles.spawnHeal(this.playerMesh.position);
      this._spawnFloatingText(this.playerMesh.position, `+${amt}`, 'heal');
      this._setLog(`Lorenzo usou Hiper Poção! ${this.playerMon.name} recuperou ${amt} HP!`);
      this._updateUI();
      await sleep(950);
      this.camMode = 'overview';
      await this._executeWildTurn();
      if (this.active) { this.busy = false; this._setControlsEnabled(true); }
    }

    async executeThrowBall(isUltra = false) {
      const inv = this.game.state.inventory;
      if (isUltra && inv.superBalls <= 0) return;
      if (!isUltra && inv.cuboBalls <= 0) return;

      this.busy = true;
      this._setControlsEnabled(false);
      if (isUltra) inv.superBalls -= 1; else inv.cuboBalls -= 1;
      this._updateUI();

      const label = isUltra ? 'Ultra-Cubo' : 'Poké-Cubo';
      this._setLog(`Lorenzo arremessou um ${label}!`);
      global.L2Audio.playThrow();
      this.camMode = 'captureFocus';

      if (this.cuboBallMesh) this.game.scene.remove(this.cuboBallMesh);
      this.cuboBallMesh = global.L2Voxels.buildPokeCuboMesh(isUltra);
      const startPos = this.game.playerMesh.position.clone().add(new THREE.Vector3(0, 1.5, 0));
      const targetPos = this.wildSpot.clone().add(new THREE.Vector3(0, 1.0, 0));
      const landPos = this.wildSpot.clone().add(new THREE.Vector3(0, 0.32, 0));
      this.cuboBallMesh.position.copy(startPos);
      this.game.scene.add(this.cuboBallMesh);

      await this._animateDuration(500, (t) => {
        const p = new THREE.Vector3().lerpVectors(startPos, targetPos, t);
        p.y += Math.sin(t * Math.PI) * 3.1;
        this.cuboBallMesh.position.copy(p);
        this.cuboBallMesh.rotation.x += 0.25;
      });

      global.L2Audio.playAbsorb();
      this.game.particles.spawnBurst(targetPos, [0x22d3ee, 0xffffff, 0xfacc15], 28, 5.2, 0.2, -2, 0.6);

      await this._animateDuration(320, (t) => {
        this.wildEntity.mesh.scale.setScalar(Math.max(0.01, (1 - t) * 1.1));
        this.cuboBallMesh.position.lerpVectors(targetPos, landPos, t);
        this.cuboBallMesh.rotation.set(0, 0, 0);
      });
      this.wildEntity.mesh.visible = false;

      const sp = global.L2Data.SPECIES[this.wildMon.speciesId];
      const hpRatio = this.wildMon.hp / this.wildMon.maxHp;
      const catchChance = Math.min(0.96, (sp.catchRate + (1 - hpRatio) * 0.50) * (isUltra ? 1.9 : 1.0));
      const caught = Math.random() < catchChance;
      const wobbles = caught ? 3 : (1 + Math.floor(Math.random() * 2));

      for (let w = 0; w < wobbles; w++) {
        await sleep(300);
        global.L2Audio.playWobble(w);
        this._setLog(`O ${label} balançou${'.'.repeat(w + 1)}`);
        await this._animateDuration(400, (t) => {
          this.cuboBallMesh.rotation.z = Math.sin(t * Math.PI * 2) * 0.42;
          this.cuboBallMesh.position.y = landPos.y + Math.abs(Math.sin(t * Math.PI)) * 0.16;
        });
        this.cuboBallMesh.rotation.z = 0;
        this.cuboBallMesh.position.y = landPos.y;
      }

      await sleep(340);

      if (caught) {
        global.L2Audio.playCaptureSuccess();
        this.game.particles.spawnBurst(landPos.clone().add(new THREE.Vector3(0, 0.4, 0)), [0xfacc15, 0x22d3ee, 0x4ade80, 0xffffff], 46, 7.5, 0.24, -5, 1.1);
        this.game.state.caughtSpecies.add(this.wildMon.speciesId);

        this.wildMon.hp = Math.max(Math.round(this.wildMon.maxHp * 0.6), this.wildMon.hp);
        if (this.game.state.team.length < 6) {
          this.game.state.team.push(this.wildMon);
          this._setLog(`✨ CAPTURADO! ${this.wildMon.name} entrou para sua equipe!`);
          this.game.showToast(`${this.wildMon.name} entrou para sua equipe!`, 'success');
        } else {
          this.game.state.inventory.superBalls += 1;
          this._setLog(`✨ ${this.wildMon.name} registrado na Pokédex! Equipe cheia (+1 Ultra-Cubo)!`);
        }

        const xpGain = 25 + this.wildMon.level * 10;
        const leveled = global.L2Data.grantXp(this.playerMon, xpGain);
        this._updateUI();
        if (leveled) {
          await sleep(800);
          global.L2Audio.playLevelUp();
          this._setLog(`🎉 ${this.playerMon.name} subiu para o Nível ${this.playerMon.level}!`);
          this._updateUI();
        }
        await sleep(1500);
        this.end(true);
      } else {
        global.L2Audio.playCaptureFail();
        this.game.particles.spawnBurst(landPos, [0xf43f5e, 0xf97316, 0xffffff], 24, 5.5, 0.2, -5, 0.65);
        this.game.scene.remove(this.cuboBallMesh);
        this.cuboBallMesh = null;
        this.wildEntity.mesh.visible = true;
        this.wildEntity.mesh.scale.setScalar(1.1);
        this._setLog(`Quase! ${this.wildMon.name} escapou do ${label}!`);
        this.camMode = 'overview';
        await sleep(900);
        await this._executeWildTurn();
        if (this.active) { this.busy = false; this._setControlsEnabled(true); }
      }
    }

    async _handleVictory() {
      this.wildMon.hp = 0;
      this._updateUI();
      this.game.particles.spawnBurst(this.wildSpot.clone().add(new THREE.Vector3(0, 0.9, 0)), [0xfacc15, 0xf43f5e, 0xffffff], 36, 6.5, 0.22, -6, 0.85);
      this.wildEntity.mesh.visible = false;

      this.game.state.battlesWon = (this.game.state.battlesWon || 0) + 1;
      const xpGain = 30 + this.wildMon.level * 11;
      const leveled = global.L2Data.grantXp(this.playerMon, xpGain);

      this.game.state.inventory.cuboBalls += 2;
      if (this.game.state.battlesWon % 2 === 0) this.game.state.inventory.superBalls += 1;

      this._setLog(`🏆 Vitória! ${this.wildMon.name} foi derrotado! +${xpGain} XP e Poké-Cubos!`);
      this._updateUI();

      if (leveled) {
        await sleep(900);
        global.L2Audio.playLevelUp();
        this.game.particles.spawnHeal(this.playerSpot);
        this._setLog(`🎉 ${this.playerMon.name} subiu para o Nível ${this.playerMon.level}!`);
        this._updateUI();
      }
      await sleep(1400);
      this.end(true);
    }

    async executeFlee() {
      this.busy = true;
      this._setControlsEnabled(false);
      global.L2Audio.playFlee();
      this._setLog('Você fugiu da batalha!');
      await sleep(650);
      this.end(false);
    }

    _animateDuration(ms, onFrame) {
      return new Promise((resolve) => {
        const start = performance.now();
        const step = (now) => {
          const t = Math.min(1, (now - start) / ms);
          onFrame(t);
          if (t < 1 && this.active) requestAnimationFrame(step);
          else resolve();
        };
        requestAnimationFrame(step);
      });
    }

    triggerShake(amp = 0.25, duration = 0.25) { this.shakeAmp = amp; this.shakeTime = duration; }

    _spawnFloatingText(worldPos, text, extraClass = '') {
      const proj = worldPos.clone().add(new THREE.Vector3(0, 2.0, 0)).project(this.game.camera);
      const el = document.createElement('div');
      el.className = 'floating-dmg ' + extraClass;
      el.textContent = text;
      el.style.left = ((proj.x * 0.5 + 0.5) * window.innerWidth) + 'px';
      el.style.top = ((-proj.y * 0.5 + 0.5) * window.innerHeight) + 'px';
      this.elFxLayer.appendChild(el);
      setTimeout(() => el.remove(), 1200);
    }

    update(dt, time) {
      if (!this.active) return;
      if (this.playerMesh) global.L2Voxels.animatePokemon(this.playerMesh, time, 0);
      if (this.wildEntity && this.wildEntity.mesh.visible) global.L2Voxels.animatePokemon(this.wildEntity.mesh, time + 1.2, 0);
      if (this.playerRing) this.playerRing.rotation.z = time * 1.2;
      if (this.wildRing) this.wildRing.rotation.z = -time * 1.2;

      const dirToWild = this.wildSpot.clone().sub(this.playerSpot).setY(0).normalize();
      const sway = Math.sin(time * 0.7) * 0.8;

      if (this.camMode === 'playerFocus') {
        this.camTargetPos.copy(this.playerSpot).addScaledVector(this.arenaRight, 4.6).addScaledVector(dirToWild, 2.4).add(new THREE.Vector3(0, 2.5, 0));
        this.camTargetLook.copy(this.playerSpot).add(new THREE.Vector3(0, 1.15, 0));
      } else if (this.camMode === 'wildFocus') {
        this.camTargetPos.copy(this.wildSpot).addScaledVector(this.arenaRight, 4.6).addScaledVector(dirToWild, -2.5).add(new THREE.Vector3(0, 2.5, 0));
        this.camTargetLook.copy(this.wildSpot).add(new THREE.Vector3(0, 1.15, 0));
      } else if (this.camMode === 'captureFocus') {
        this.camTargetPos.copy(this.wildSpot).addScaledVector(this.arenaRight, 3.8).addScaledVector(dirToWild, -3.2).add(new THREE.Vector3(0, 2.1, 0));
        this.camTargetLook.copy(this.wildSpot).add(new THREE.Vector3(0, 0.8, 0));
      } else {
        this.camTargetPos.copy(this.arenaCenter).addScaledVector(this.arenaRight, 8.0 + sway).addScaledVector(dirToWild, -4.0).add(new THREE.Vector3(0, 3.8 + Math.cos(time * 0.6) * 0.25, 0));
        this.camTargetLook.copy(this.arenaCenter).add(new THREE.Vector3(0, 1.15, 0));
      }

      this.game.camera.position.lerp(this.camTargetPos, Math.min(1, dt * 4.4));
      if (this.shakeTime > 0) {
        this.shakeTime -= dt;
        const mag = this.shakeAmp * (this.shakeTime / 0.28);
        this.game.camera.position.x += (Math.random() - 0.5) * mag;
        this.game.camera.position.y += (Math.random() - 0.5) * mag;
      }
      this.game.camera.lookAt(this.camTargetLook);
    }
  }

  global.L2Battle = BattleManager2;
})(window);
