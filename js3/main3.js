/* ================================================================
   LORENZO GAME 3 — Engine, 30-Team + Discard, Mew Shiny & Titan 3v1
   ================================================================ */
(function (global) {
  'use strict';

  class LorenzoGame3 {
    constructor() {
      this.mode = 'title';
      this.selectedStarter = 'mew';
      this.selectedCity = 'mesagoza';
      this.evolvingLock = false;
      this.destructingLock = false;

      this.state = {
        cityId: 'mesagoza',
        powerOrbs: 0,
        distinctSinceRaid: new Set(),
        recentCaptureUids: [],
        raidBossIndex: 0,
        raidsWon: 0,
        player: { x: 0, y: 2.5, z: 4, vy: 0, yaw: Math.PI, grounded: true },
        activeTeamIndex: 0,
        team: [],
        inventory: { cuboBalls: 15, superBalls: 6, potions: 6 },
        caughtSpecies: new Set(),
        battlesWon: 0
      };

      this.camYaw = 0;
      this.camPitch = 0.34;
      this.camDist = 8.0;
      this.exploreShakeTime = 0;

      this.keys = {};
      this.isDragging = false;
      this.dragMoved = 0;
      this.lastMouse = { x: 0, y: 0 };
      this.mouseNDC = new THREE.Vector2(0, 0);
      this.pointerLocked = false;

      this.wildEntities = [];
      this.partnerMesh = null;
      this.hoverRing = null;
      this.stepTimer = 0;
      this.autoSaveTimer = 0;
      this.healCooldown = 0;

      this._initThree();
      this._initWorld();
      this._initBattle();
      this._initUI();
      this._bindInputs();

      this.clock = new THREE.Clock();
      this._animate();
    }

    _initThree() {
      this.container = document.getElementById('game-container');
      this.scene = new THREE.Scene();
      this.scene.background = new THREE.Color(0x60c8ff);
      this.scene.fog = new THREE.FogExp2(0x93dcff, 0.013);

      this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 220);

      this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      if (THREE.sRGBEncoding) this.renderer.outputEncoding = THREE.sRGBEncoding;
      this.container.appendChild(this.renderer.domElement);

      this.scene.add(new THREE.HemisphereLight(0xdbeafe, 0x334155, 0.8));

      this.sunLight = new THREE.DirectionalLight(0xfffbeb, 0.94);
      this.sunLight.position.set(24, 38, -20);
      this.sunLight.castShadow = true;
      this.sunLight.shadow.mapSize.width = 2048;
      this.sunLight.shadow.mapSize.height = 2048;
      const d = 34;
      this.sunLight.shadow.camera.left = -d;
      this.sunLight.shadow.camera.right = d;
      this.sunLight.shadow.camera.top = d;
      this.sunLight.shadow.camera.bottom = -d;
      this.sunLight.shadow.bias = -0.0005;
      this.scene.add(this.sunLight);

      this.raycaster = new THREE.Raycaster();
      this.particles = new global.L3Particles(this.scene);

      window.addEventListener('resize', () => {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
      });
    }

    _initWorld() {
      this.world = new global.L3CityWorld(this.scene, this.sunLight);
      this.world.loadCity(this.selectedCity);

      this.playerMesh = global.L3Voxels.buildPlayerMesh();
      this.scene.add(this.playerMesh);
      this.teleportPlayerToPlaza();

      this.hoverRing = global.L3Voxels.buildTargetRing(0xfacc15);
      this.hoverRing.visible = false;
      this.scene.add(this.hoverRing);

      this._spawnCityWildPokemon(this.selectedCity);
    }

    _initBattle() {
      this.battle = new global.L3Battle(this);
    }

    // Hide/Restore Main City World when entering/leaving the Off-Map Titan Arena!
    setMainWorldVisible(visible) {
      this.world.cityGroup.visible = visible;
      for (const orb of this.world.powerOrbs) orb.mesh.visible = visible;
      for (const w of this.wildEntities) w.mesh.visible = visible;
      if (this.partnerMesh) this.partnerMesh.visible = visible;
      if (!visible) this.hoverRing.visible = false;
    }

    // ================================================================
    // TITAN ARENA 3 vs 1 TRIGGER (EVERY 3 DIFFERENT POKÉMON CAPTURED!)
    // ================================================================
    registerWildCapture(mon) {
      if (!mon) return;
      this.state.distinctSinceRaid.add(mon.speciesId);
      this.state.recentCaptureUids.push(mon.uid);
      if (this.state.recentCaptureUids.length > 3) {
        this.state.recentCaptureUids = this.state.recentCaptureUids.slice(-3);
      }
      this.autoSave(false);
    }

    checkAndTriggerTitanRaid() {
      if (this.state.distinctSinceRaid.size < 3) return;

      // Pick the next Giant Boss from the 23-Boss Roster (Koraidon, Salamence, Kyogre + 20 more!)
      const bosses = global.L3Data.GIANT_BOSS_IDS;
      const bossId = bosses[this.state.raidBossIndex % bosses.length];
      this.state.raidBossIndex = (this.state.raidBossIndex + 1) % bosses.length;
      this.state.distinctSinceRaid.clear();

      // Gather the last 3 captured Pokémon (fallback to latest team members if any was discarded)
      const squad = [];
      for (const uid of this.state.recentCaptureUids) {
        const found = this.state.team.find((m) => m.uid === uid);
        if (found && !squad.includes(found)) squad.push(found);
      }
      for (let i = this.state.team.length - 1; i >= 0 && squad.length < 3; i--) {
        if (!squad.includes(this.state.team[i])) squad.push(this.state.team[i]);
      }

      const bossSp = global.L3Data.SPECIES[bossId];
      const portalOverlay = document.getElementById('raid-portal-overlay');
      document.getElementById('raid-portal-boss').textContent = `👑 ${bossSp.name.toUpperCase()} GIGANTE DESAFIA VOCÊ!`;
      document.getElementById('raid-portal-sub').textContent = `Arena Titã 3 vs 1: ${squad.map((m) => m.name).join(' + ')} contra ${bossSp.name} Gigante!`;

      global.L3Audio.playRaidPortal();
      portalOverlay.classList.remove('hidden');
      this.mode = 'battle';
      this.setExplorationHudVisible(false);
      this.autoSave(false);

      setTimeout(() => {
        portalOverlay.classList.add('hidden');
        this.battle.startTitanRaid(bossId, squad);
      }, 2150);
    }

    // ================================================================
    // TOTAL DESTRUCTION SPECTACLE (SHAKES SCREEN, CRACKS & STRUCTURE!)
    // ================================================================
    triggerDestructionSpectacle(epicenter, titleText = 'DESTRUIÇÃO TOTAL!') {
      global.L3Audio.playTotalDestruction();
      this.world.triggerStructureQuake(2.2, 0.78);
      this.exploreShakeTime = 2.0;
      this.particles.spawnTotalDestruction(epicenter);

      const overlay = document.getElementById('destruction-overlay');
      document.getElementById('destruction-title').textContent = titleText;
      overlay.classList.remove('hidden');
      overlay.style.animation = 'none';
      overlay.offsetHeight;
      overlay.style.animation = '';
      document.body.classList.add('screen-earthquake');

      const inRaid = this.battle.active && this.battle.isTitanRaid;
      const cfg = global.L3Data.CITIES[this.state.cityId] || global.L3Data.CITIES.mesagoza;
      this.scene.background = new THREE.Color(0x450a0a);
      this.scene.fog.color.setHex(0x7f1d1d);
      setTimeout(() => {
        this.scene.background = new THREE.Color(0x2e1065);
        this.scene.fog.color.setHex(0x581c87);
      }, 650);
      setTimeout(() => {
        document.body.classList.remove('screen-earthquake');
        if (inRaid && this.battle.active && this.battle.isTitanRaid) {
          this.scene.background = new THREE.Color(0x0b051c);
          this.scene.fog.color.setHex(0x1e0b38);
        } else {
          this.scene.background = new THREE.Color(cfg.skyColor);
          this.scene.fog.color.setHex(cfg.fogColor);
        }
      }, 2100);
      setTimeout(() => overlay.classList.add('hidden'), 2600);
    }

    triggerExploreDestruction() {
      if (this.mode !== 'explore' || this.destructingLock) return;
      if (this.state.powerOrbs < 3) {
        this.showToast(`Colete ${3 - this.state.powerOrbs} Orbe(s) dourado(s) pelo mapa para carregar!`, 'gold');
        return;
      }

      this.destructingLock = true;
      this.state.powerOrbs = 0;

      const lead = this.state.team[this.state.activeTeamIndex];
      const sp = lead ? global.L3Data.SPECIES[lead.speciesId] : null;
      const ultName = (sp && sp.ultimateName) ? sp.ultimateName : 'APOCALIPSE VOXEL TOTAL!';

      const epicenter = this.playerMesh.position.clone().add(
        new THREE.Vector3(Math.sin(this.state.player.yaw) * 4.5, 0, Math.cos(this.state.player.yaw) * 4.5)
      );
      epicenter.y = this.world.getWalkableY(epicenter.x, epicenter.z);
      this.triggerDestructionSpectacle(epicenter, ultName);

      let hitCount = 0;
      for (const w of this.wildEntities) {
        if (w.mesh.position.distanceTo(epicenter) < 15) {
          hitCount++;
          this.particles.spawnBurst(w.mesh.position.clone().add(new THREE.Vector3(0, 1, 0)), [0xfacc15, 0xf43f5e, 0xffffff], 18, 7.5, 0.24, -6, 0.9);
          const push = w.mesh.position.clone().sub(epicenter).setY(0).normalize();
          w.targetX = Math.max(-24, Math.min(24, w.mesh.position.x + push.x * 6));
          w.targetZ = Math.max(-24, Math.min(24, w.mesh.position.z + push.z * 6));
        }
      }

      if (lead) {
        const bonusXp = 45 + hitCount * 15;
        const leveled = global.L3Data.grantXp(lead, bonusXp);
        this.state.inventory.superBalls += 1;
        this.showToast(`💥 ${ultName} Abalou a cidade! +${bonusXp} XP e +1 Master-Cubo!`, 'gold');
        if (leveled) {
          setTimeout(() => {
            global.L3Audio.playLevelUp();
            this.rebuildPartnerMesh();
            this.refreshHudAndTeam();
          }, 900);
        }
      }
      this.refreshHudAndTeam();
      this.autoSave(false);
      setTimeout(() => { this.destructingLock = false; }, 2500);
    }

    // ================================================================
    // DISCARD / RELEASE POKÉMON FROM TEAM (UP TO 30 SLOTS!)
    // ================================================================
    discardTeamMember(idx) {
      if (this.state.team.length <= 1) {
        this.showToast('Você precisa manter pelo menos 1 Pokémon na equipe!', 'gold');
        return;
      }
      const removed = this.state.team[idx];
      if (!removed) return;

      global.L3Audio.playDiscard();
      this.state.team.splice(idx, 1);
      this.state.recentCaptureUids = this.state.recentCaptureUids.filter((u) => u !== removed.uid);

      if (this.state.activeTeamIndex >= this.state.team.length) {
        this.state.activeTeamIndex = this.state.team.length - 1;
      } else if (idx < this.state.activeTeamIndex) {
        this.state.activeTeamIndex -= 1;
      }

      this.rebuildPartnerMesh();
      this.refreshHudAndTeam();
      this.autoSave(false);
      this.showToast(`🗑️ ${removed.name} foi solto na natureza (${this.state.team.length}/30).`);
    }

    // ================================================================
    // CITIES & WILD SPAWNING
    // ================================================================
    travelToCity(cityId, silent = false) {
      const cfg = global.L3Data.CITIES[cityId];
      if (!cfg) return;
      this.state.cityId = cityId;
      this.world.loadCity(cityId);
      this.teleportPlayerToPlaza();
      this._spawnCityWildPokemon(cityId);
      this.rebuildPartnerMesh();
      if (!silent) {
        global.L3Audio.playCityTravel();
        this.particles.spawnBurst(this.playerMesh.position.clone().add(new THREE.Vector3(0, 1.0, 0)), [0xe879f9, 0x22d3ee, 0xfacc15], 30, 5.8, 0.2, -3, 0.8);
        this.showToast(`${cfg.emoji} Bem-vindo a ${cfg.name}!`, 'gold');
        this.autoSave(false);
      }
      this.refreshHudAndTeam();
    }

    _clearWildPokemon() {
      for (const w of this.wildEntities) this.scene.remove(w.mesh);
      this.wildEntities = [];
    }

    _spawnCityWildPokemon(cityId) {
      this._clearWildPokemon();
      const cfg = global.L3Data.CITIES[cityId] || global.L3Data.CITIES.mesagoza;
      const [minL, maxL] = cfg.levelRange;

      const nearOffsets = [[-4.8, -3.5], [5.5, -2.8], [-5.8, 7.5], [6.2, 7.2]];
      nearOffsets.forEach(([ox, oz], idx) => {
        const spId = cfg.spawns[idx % cfg.spawns.length];
        this._spawnWild(spId, ox, oz, minL + Math.floor(Math.random() * (maxL - minL + 1)));
      });

      for (let i = 0; i < 11; i++) {
        const spId = cfg.spawns[i % cfg.spawns.length];
        const pt = this.world.getRandomSpawnPoint();
        this._spawnWild(spId, pt.x, pt.z, minL + Math.floor(Math.random() * (maxL - minL + 1)));
      }
    }

    _spawnWild(speciesId, x, z, level) {
      const sp = global.L3Data.SPECIES[speciesId];
      const mesh = global.L3Voxels.buildPokemonMesh(speciesId);
      const y = this.world.getWalkableY(x, z);
      mesh.position.set(x, y, z);

      const hitbox = new THREE.Mesh(
        new THREE.SphereGeometry(1.5, 10, 10),
        new THREE.MeshBasicMaterial({ visible: false })
      );
      hitbox.position.y = 1.05;
      mesh.add(hitbox);

      const plateY = sp.isMega ? 3.2 : sp.stage >= 2 ? 2.75 : 2.35;
      const nameplate = global.L3Voxels.buildNameplateSprite(sp.name, level, sp.type, false, sp.isMega);
      nameplate.position.set(0, plateY, 0);
      mesh.add(nameplate);

      this.scene.add(mesh);

      const entity = {
        id: 'w_' + Math.random().toString(36).slice(2, 8),
        speciesId, level, mesh, hitbox, nameplate,
        inBattle: false, targetX: x, targetZ: z,
        waitTimer: Math.random() * 2.5, speed: 1.7 + Math.random() * 0.9, phase: Math.random() * Math.PI * 2
      };
      hitbox.userData.wildEntity = entity;
      this.wildEntities.push(entity);
      return entity;
    }

    removeAndRespawnWild(entity) {
      this.scene.remove(entity.mesh);
      const idx = this.wildEntities.indexOf(entity);
      if (idx !== -1) this.wildEntities.splice(idx, 1);
      const cfg = global.L3Data.CITIES[this.state.cityId] || global.L3Data.CITIES.mesagoza;
      const [minL, maxL] = cfg.levelRange;
      const spId = cfg.spawns[Math.floor(Math.random() * cfg.spawns.length)];
      const pt = this.world.getRandomSpawnPoint();
      this._spawnWild(spId, pt.x, pt.z, minL + Math.floor(Math.random() * (maxL - minL + 1)));
    }

    // ================================================================
    // PARTNER & EVOLUTION (UP TO MEGA / SHINY MEGA MEW!)
    // ================================================================
    rebuildPartnerMesh() {
      if (this.partnerMesh) { this.scene.remove(this.partnerMesh); this.partnerMesh = null; }
      const lead = this.state.team[this.state.activeTeamIndex];
      if (!lead) return;
      const sp = global.L3Data.SPECIES[lead.speciesId];
      this.partnerMesh = global.L3Voxels.buildPokemonMesh(lead.speciesId);
      const px = this.state.player.x + 2.3;
      const pz = this.state.player.z + 1.2;
      this.partnerMesh.position.set(px, this.world.getWalkableY(px, pz), pz);

      const plate = global.L3Voxels.buildNameplateSprite(lead.name, lead.level, lead.type, true, sp.isMega || sp.isShiny);
      plate.position.set(0, sp.isMega ? 3.25 : 2.65, 0);
      this.partnerMesh.add(plate);
      this.partnerMesh.visible = this.mode !== 'battle';
      this.scene.add(this.partnerMesh);
    }

    evolveTeamMember(teamIndex) {
      if (this.evolvingLock) return;
      const mon = this.state.team[teamIndex];
      if (!mon || !global.L3Data.canEvolve(mon)) {
        this.showToast(`${mon ? mon.name : 'Este Pokémon'} já está na sua Forma Máxima!`, 'mega');
        return;
      }

      this.evolvingLock = true;
      const oldName = mon.name;
      const nextSp = global.L3Data.SPECIES[global.L3Data.SPECIES[mon.speciesId].evolvesTo];
      const isMega = !!(nextSp.isMega || nextSp.isShiny);
      const isLead = teamIndex === this.state.activeTeamIndex;
      const fxPos = (isLead && this.partnerMesh) ? this.partnerMesh.position.clone() : this.playerMesh.position.clone();

      global.L3Audio.playEvolutionStart(isMega);
      this.particles.spawnMegaVortex(fxPos, isMega);
      this.showToast(nextSp.isShiny
        ? `✨🧬 TRANSCENDENDO ${oldName} → ${nextSp.name}!!`
        : isMega ? `🧬 MEGA EVOLUINDO ${oldName} → ${nextSp.name}!!`
        : `✨ Evoluindo ${oldName} → ${nextSp.name}...`, 'mega');

      const start = performance.now();
      const step = (now) => {
        const t = Math.min(1, (now - start) / 760);
        if (isLead && this.partnerMesh) {
          this.partnerMesh.scale.setScalar(1 + Math.sin(t * Math.PI * 10) * 0.25);
          this.partnerMesh.rotation.y += 0.30;
        }
        if (t < 1) {
          requestAnimationFrame(step);
        } else {
          const res = global.L3Data.evolveMonster(mon);
          if (res) {
            this.state.caughtSpecies.add(res.newSpeciesId);
            global.L3Audio.playEvolutionComplete(res.isMega || res.isShiny);
            if (res.isMega || res.isShiny) this.world.triggerStructureQuake(0.65, 0.25);
            if (isLead) this.rebuildPartnerMesh();
            this._showEvoBanner(res.oldName, res.newName, res.isMega, res.isShiny);
            this.refreshHudAndTeam();
            this.autoSave(false);
          }
          this.evolvingLock = false;
        }
      };
      requestAnimationFrame(step);
    }

    _showEvoBanner(oldName, newName, isMega, isShiny) {
      const banner = document.getElementById('evo-banner');
      document.getElementById('evo-banner-tag').textContent = isShiny
        ? '✨🧬 SHINY MEGA EVOLUÇÃO LENDÁRIA! 🧬✨'
        : isMega ? '🧬 MEGA EVOLUÇÃO DESPERTADA! 🧬'
        : '✨ EVOLUÇÃO COMPLETA! ✨';
      document.getElementById('evo-banner-title').textContent = `${oldName.toUpperCase()}  →  ${newName.toUpperCase()}`;
      document.getElementById('evo-banner-sub').textContent = isShiny
        ? 'Poder cósmico Shiny Mega desbloqueado! Aura celeste ativada!'
        : isMega ? 'Aura prismática, poder colossal e golpes Mega desbloqueados!'
        : 'Atributos aumentados, HP restaurado e novos golpes liberados!';
      banner.classList.remove('hidden');
      clearTimeout(this._evoTimer);
      this._evoTimer = setTimeout(() => banner.classList.add('hidden'), 2900);
    }

    // ================================================================
    // UI INITIALIZATION
    // ================================================================
    _initUI() {
      this.elTitle = document.getElementById('title-screen');
      this.elExploreHud = document.getElementById('explore-hud');
      this.elCrosshair = document.getElementById('crosshair');
      this.elTargetPrompt = document.getElementById('target-prompt');
      this.elTargetPromptText = document.getElementById('target-prompt-text');

      this.elSetupSection = document.getElementById('setup-section');
      this.elSaveBanner = document.getElementById('save-banner');
      this.elSaveBannerText = document.getElementById('save-banner-text');
      this.elBtnPlay = document.getElementById('btn-play');
      this.elBtnNewGame = document.getElementById('btn-new-game');

      this.elHudCityName = document.getElementById('hud-city-name');
      this.elHudBalls = document.getElementById('hud-balls');
      this.elHudSuperBalls = document.getElementById('hud-super-balls');
      this.elHudDexCount = document.getElementById('hud-dex-count');
      this.elTeamCount = document.getElementById('team-count-badge');
      this.elMiniTeamList = document.getElementById('mini-team-list');

      this.elBtnHudEvolve = document.getElementById('btn-hud-evolve');
      this.elHudEvolveText = document.getElementById('hud-evolve-text');

      // Raid Tracker Elements
      this.elRaidProgressText = document.getElementById('raid-progress-text');
      this.elRaidNextHint = document.getElementById('raid-next-hint');
      this.elRaidSegs = [
        document.getElementById('raid-seg-0'),
        document.getElementById('raid-seg-1'),
        document.getElementById('raid-seg-2')
      ];

      // Power Meter Elements
      this.elPowerBox = document.getElementById('power-meter-box');
      this.elOrbCount = document.getElementById('power-orb-count');
      this.elOrbSegs = [
        document.getElementById('orb-seg-0'),
        document.getElementById('orb-seg-1'),
        document.getElementById('orb-seg-2')
      ];
      this.elBtnHudUltimate = document.getElementById('btn-hud-ultimate');
      this.elPowerHint = document.getElementById('power-hint');

      this.elCitiesModal = document.getElementById('cities-modal');
      this.elCitiesGrid = document.getElementById('cities-grid');
      this.elDexModal = document.getElementById('dex-modal');
      this.elDexGrid = document.getElementById('dex-grid');

      document.querySelectorAll('.starter-card').forEach((card) => {
        card.addEventListener('click', () => {
          global.L3Audio.playClick();
          document.querySelectorAll('.starter-card').forEach((c) => c.classList.remove('selected'));
          card.classList.add('selected');
          this.selectedStarter = card.dataset.starter;
        });
      });

      document.querySelectorAll('.city-pill').forEach((pill) => {
        pill.addEventListener('click', () => {
          global.L3Audio.playClick();
          document.querySelectorAll('.city-pill').forEach((p) => p.classList.remove('selected'));
          pill.classList.add('selected');
          this.selectedCity = pill.dataset.city;
          this.world.loadCity(this.selectedCity);
          this._spawnCityWildPokemon(this.selectedCity);
        });
      });

      this._refreshTitleState();

      this.elBtnPlay.addEventListener('click', () => {
        global.L3Audio.init(); global.L3Audio.playClick();
        if (global.L3Storage.hasSave()) this._loadSavedGame();
        else this._startFreshGame(this.selectedStarter, this.selectedCity);
        this._enterExploreMode();
      });

      this.elBtnNewGame.addEventListener('click', () => {
        global.L3Audio.init(); global.L3Audio.playClick();
        global.L3Storage.clear();
        this._refreshTitleState();
        this.showToast('Escolha seu Pokémon e sua cidade inicial!');
      });

      this.elBtnHudEvolve.addEventListener('click', () => this.evolveTeamMember(this.state.activeTeamIndex));
      this.elBtnHudUltimate.addEventListener('click', () => this.triggerExploreDestruction());

      document.getElementById('btn-cities').addEventListener('click', () => { global.L3Audio.playClick(); this._openCitiesModal(); });
      document.getElementById('btn-close-cities').addEventListener('click', () => { global.L3Audio.playClick(); this.elCitiesModal.classList.add('hidden'); });
      document.getElementById('btn-dex').addEventListener('click', () => { global.L3Audio.playClick(); this._openDexModal(); });
      document.getElementById('btn-close-dex').addEventListener('click', () => { global.L3Audio.playClick(); this.elDexModal.classList.add('hidden'); });
      document.getElementById('btn-heal-team').addEventListener('click', () => this.healTeam(false));
      document.getElementById('btn-mute').addEventListener('click', () => {
        const m = global.L3Audio.toggleMute();
        document.getElementById('mute-icon').textContent = m ? '🔇' : '🔊';
      });
      document.getElementById('btn-menu').addEventListener('click', () => {
        global.L3Audio.playClick();
        if (document.pointerLockElement) document.exitPointerLock();
        this.autoSave(false);
        this.mode = 'title';
        this.elExploreHud.classList.add('hidden');
        this.elTitle.classList.remove('hidden');
        this._refreshTitleState();
      });
    }

    _refreshTitleState() {
      const save = global.L3Storage.load();
      if (save) {
        this.elSetupSection.classList.add('hidden');
        this.elSaveBanner.classList.remove('hidden');
        this.elBtnNewGame.classList.remove('hidden');
        const c = global.L3Data.CITIES[save.cityId] || global.L3Data.CITIES.mesagoza;
        this.elSaveBannerText.textContent = `Save em ${c.name} • Equipe ${save.team.length}/30 • Titãs vencidos: ${save.raidsWon || 0} • Pokédex ${(save.caughtSpecies || []).length}/${global.L3Data.SPECIES_IDS.length}`;
      } else {
        this.elSetupSection.classList.remove('hidden');
        this.elSaveBanner.classList.add('hidden');
        this.elBtnNewGame.classList.add('hidden');
      }
    }

    _startFreshGame(starterId, cityId) {
      const starter = global.L3Data.createMonster(starterId, 14);
      this.state = {
        cityId: cityId || 'mesagoza',
        powerOrbs: 0,
        distinctSinceRaid: new Set(),
        recentCaptureUids: [starter.uid],
        raidBossIndex: 0,
        raidsWon: 0,
        player: { x: 0, y: 2.5, z: 4, vy: 0, yaw: Math.PI, grounded: true },
        activeTeamIndex: 0,
        team: [starter],
        inventory: { cuboBalls: 15, superBalls: 6, potions: 6 },
        caughtSpecies: new Set([starterId]),
        battlesWon: 0
      };
      this.travelToCity(this.state.cityId, true);
      this.camYaw = 0; this.camPitch = 0.34;
      this.autoSave(false);
      this.showToast(`🏟️ Capture 3 Pokémons diferentes para abrir a ARENA TITÃ 3 vs 1!`, 'gold');
    }

    _loadSavedGame() {
      const save = global.L3Storage.load();
      if (!save) { this._startFreshGame(this.selectedStarter, this.selectedCity); return; }
      this.state = {
        cityId: save.cityId || 'mesagoza',
        powerOrbs: Math.max(0, Math.min(3, save.powerOrbs || 0)),
        distinctSinceRaid: new Set(save.distinctSinceRaid || []),
        recentCaptureUids: save.recentCaptureUids || [],
        raidBossIndex: save.raidBossIndex || 0,
        raidsWon: save.raidsWon || 0,
        player: { x: save.player ? save.player.x : 0, y: 3, z: save.player ? save.player.z : 4, vy: 0, yaw: save.player ? save.player.yaw : Math.PI, grounded: true },
        activeTeamIndex: Math.min(save.activeTeamIndex || 0, save.team.length - 1),
        team: save.team,
        inventory: save.inventory || { cuboBalls: 15, superBalls: 6, potions: 6 },
        caughtSpecies: new Set(save.caughtSpecies || save.team.map((m) => m.speciesId)),
        battlesWon: save.battlesWon || 0
      };
      this.world.loadCity(this.state.cityId);
      this.state.player.y = this.world.getWalkableY(this.state.player.x, this.state.player.z);
      this.playerMesh.position.set(this.state.player.x, this.state.player.y, this.state.player.z);
      this._spawnCityWildPokemon(this.state.cityId);
      this.rebuildPartnerMesh();
      this.showToast('Progresso carregado!', 'success');
    }

    _enterExploreMode() {
      this.mode = 'explore';
      this.elTitle.classList.add('hidden');
      this.setExplorationHudVisible(true);
      this.refreshHudAndTeam();
    }

    setExplorationHudVisible(visible) {
      this.elExploreHud.classList.toggle('hidden', !visible);
      if (!visible) { this.elTargetPrompt.classList.add('hidden'); this.hoverRing.visible = false; }
    }

    refreshHudAndTeam() {
      const D = global.L3Data;
      const cityCfg = D.CITIES[this.state.cityId] || D.CITIES.mesagoza;
      this.elHudCityName.textContent = `${cityCfg.emoji} ${cityCfg.name}`;
      this.elHudBalls.textContent = this.state.inventory.cuboBalls;
      this.elHudSuperBalls.textContent = this.state.inventory.superBalls;
      this.elHudDexCount.textContent = `${this.state.caughtSpecies.size}/${D.SPECIES_IDS.length}`;
      this.elTeamCount.textContent = `${this.state.team.length}/30`;

      // Update Titan Arena 3-Capture Tracker
      const raidCnt = Math.min(3, this.state.distinctSinceRaid.size);
      const nextBossId = D.GIANT_BOSS_IDS[this.state.raidBossIndex % D.GIANT_BOSS_IDS.length];
      const nextBossName = D.SPECIES[nextBossId].name;
      this.elRaidProgressText.textContent = `${raidCnt} / 3 diferentes`;
      this.elRaidSegs.forEach((s, i) => s.classList.toggle('filled', i < raidCnt));
      this.elRaidNextHint.textContent = `Próximo Titã Gigante: ${nextBossName} (faltam ${3 - raidCnt} espécies!)`;

      // Update Power Orb Meter (0/3 .. 3/3)
      const orbs = Math.max(0, Math.min(3, this.state.powerOrbs || 0));
      this.elOrbCount.textContent = orbs >= 3 ? '3 / 3 PRONTO!!' : `${orbs} / 3 Orbes`;
      this.elOrbSegs.forEach((seg, i) => seg.classList.toggle('filled', i < orbs));
      this.elPowerBox.classList.toggle('ready', orbs >= 3);
      this.elBtnHudUltimate.disabled = orbs < 3;
      this.elPowerHint.textContent = orbs >= 3
        ? '⚡ CARGA TOTAL! Aperte Q ou use em Batalha/Arena Titã!'
        : `Faltam ${3 - orbs} Orbe(s) dourado(s) pela cidade!`;

      // Update Evolve / Shiny Mega Button
      const lead = this.state.team[this.state.activeTeamIndex];
      if (lead && D.canEvolve(lead)) {
        const nextSp = D.SPECIES[D.SPECIES[lead.speciesId].evolvesTo];
        this.elBtnHudEvolve.classList.remove('maxed');
        const prefix = nextSp.isShiny ? '✨ SHINY MEGA ' : nextSp.isMega ? 'MEGA EVOLUIR ' : 'EVOLUIR ';
        this.elHudEvolveText.textContent = `${prefix}${lead.name.toUpperCase()} → ${nextSp.name.toUpperCase()}`;
      } else if (lead) {
        this.elBtnHudEvolve.classList.add('maxed');
        this.elHudEvolveText.textContent = `${lead.name.toUpperCase()} — FORMA MÁXIMA ★`;
      }

      // Render Mini-Team (up to 30 Pokémon with Evolve 🧬 + Discard 🗑️ buttons!)
      this.elMiniTeamList.innerHTML = '';
      this.state.team.forEach((mon, idx) => {
        const sp = D.SPECIES[mon.speciesId];
        const pct = Math.max(0, Math.min(100, (mon.hp / mon.maxHp) * 100));
        const hpClass = pct <= 25 ? 'low' : pct <= 55 ? 'mid' : '';
        const evolvable = D.canEvolve(mon);
        const item = document.createElement('div');
        item.className = 'mini-mon-item' + (idx === this.state.activeTeamIndex ? ' active-lead' : '') + (mon.hp <= 0 ? ' fainted' : '');
        item.innerHTML = `
          <div class="poke-avatar sm ${sp.avatarClass} ${sp.isShiny ? 'shiny-glow' : sp.isMega ? 'mega-glow' : ''}"></div>
          <div class="mini-mon-details">
            <div class="mini-mon-top">
              <span class="mini-mon-name">${mon.name}</span>
              <span class="mini-mon-lvl">Nv.${mon.level}</span>
            </div>
            <div class="mini-hp-track">
              <div class="mini-hp-fill ${hpClass}" style="width:${pct}%"></div>
            </div>
          </div>
          <div class="mini-btn-row">
            ${evolvable ? `<button class="mini-evo-btn" type="button" title="Evoluir ${mon.name}!">🧬</button>` : ''}
            ${this.state.team.length > 1 ? `<button class="mini-discard-btn" type="button" title="Descartar / Soltar ${mon.name}">🗑️</button>` : ''}
          </div>
        `;
        const evoBtn = item.querySelector('.mini-evo-btn');
        if (evoBtn) evoBtn.addEventListener('click', (ev) => { ev.stopPropagation(); this.evolveTeamMember(idx); });
        const disBtn = item.querySelector('.mini-discard-btn');
        if (disBtn) disBtn.addEventListener('click', (ev) => { ev.stopPropagation(); this.discardTeamMember(idx); });
        item.addEventListener('click', () => {
          if (mon.hp <= 0) { this.showToast(`${mon.name} precisa ser curado primeiro!`); return; }
          global.L3Audio.playClick();
          this.state.activeTeamIndex = idx;
          this.rebuildPartnerMesh();
          this.refreshHudAndTeam();
          this.autoSave(false);
        });
        this.elMiniTeamList.appendChild(item);
      });
    }

    _openCitiesModal() {
      if (document.pointerLockElement) document.exitPointerLock();
      this.elCitiesGrid.innerHTML = '';
      const D = global.L3Data;
      D.CITY_IDS.forEach((cid) => {
        const c = D.CITIES[cid];
        const isCur = cid === this.state.cityId;
        const spawnNames = c.spawns.map((s) => D.SPECIES[s].name).join(', ');
        const btn = document.createElement('button');
        btn.type = 'button'; btn.className = 'city-card-btn' + (isCur ? ' current' : '');
        btn.innerHTML = `
          <div class="city-card-top">
            <span>${c.emoji} ${c.name}</span>
            <span style="font-size:0.74rem;color:${isCur ? '#e879f9' : '#22d3ee'};">${isCur ? 'AQUI' : 'VIAJAR →'}</span>
          </div>
          <div class="city-card-desc">${c.description}</div>
          <div class="city-card-spawns">Selvagens: ${spawnNames}</div>
        `;
        btn.addEventListener('click', () => {
          this.elCitiesModal.classList.add('hidden');
          if (!isCur) this.travelToCity(cid, false);
        });
        this.elCitiesGrid.appendChild(btn);
      });
      this.elCitiesModal.classList.remove('hidden');
    }

    _openDexModal() {
      if (document.pointerLockElement) document.exitPointerLock();
      this.elDexGrid.innerHTML = '';
      const D = global.L3Data;
      D.SPECIES_IDS.forEach((id) => {
        const sp = D.SPECIES[id];
        const caught = this.state.caughtSpecies.has(id);
        const tag = sp.isShiny ? '✨ SHINY MEGA' : sp.isMega ? '🧬 MEGA' : sp.isGiantBoss ? '👑 TITÃ GIGANTE' : (sp.evolvesTo ? `→ ${D.SPECIES[sp.evolvesTo].name}` : '★');
        const card = document.createElement('div');
        card.className = 'dex-entry' + (caught ? ' caught' : '') + (sp.isMega ? ' is-mega' : '') + (sp.isGiantBoss ? ' is-giant' : '');
        card.innerHTML = `
          <div class="dex-entry-top">
            <div class="poke-avatar ${sp.avatarClass} ${sp.isShiny ? 'shiny-glow' : sp.isMega ? 'mega-glow' : ''}" style="${caught ? '' : 'filter:brightness(0.25) saturate(0.2);'}"></div>
            <div>
              <div class="dex-entry-name">${sp.name}</div>
              <span class="type-pill type-${sp.type}">${D.TYPE_LABELS[sp.type]}</span>
            </div>
          </div>
          <div class="dex-entry-desc">${sp.description}</div>
          <div class="dex-status">${caught ? '★ REGISTRADO' : '○ Não obtido'} • ${tag}</div>
        `;
        this.elDexGrid.appendChild(card);
      });
      this.elDexModal.classList.remove('hidden');
    }

    healTeam(silent = false) {
      this.state.team.forEach((m) => (m.hp = m.maxHp));
      if (this.state.inventory.cuboBalls < 10) this.state.inventory.cuboBalls = 10;
      if (!silent) {
        global.L3Audio.playHeal();
        this.particles.spawnHeal(this.playerMesh.position);
        this.showToast('💚 Equipe curada e Poké-Cubos reabastecidos!', 'success');
      }
      this.refreshHudAndTeam();
      this.autoSave(false);
    }

    teleportPlayerToPlaza() {
      const y = this.world.getWalkableY(0, 4);
      this.state.player.x = 0; this.state.player.y = y; this.state.player.z = 4; this.state.player.vy = 0;
      this.playerMesh.position.set(0, y, 4);
    }

    syncPlayerFromMesh() {
      this.state.player.x = this.playerMesh.position.x;
      this.state.player.y = this.playerMesh.position.y;
      this.state.player.z = this.playerMesh.position.z;
      this.state.player.vy = 0;
      this.mode = 'explore';
    }

    autoSave(showFeedback = false) {
      if (this.state.team.length === 0) return;
      const ok = global.L3Storage.save(this.state);
      if (ok && showFeedback) this.showToast('💾 Progresso salvo!');
    }

    showToast(msg, variant = '') {
      const container = document.getElementById('toast-container');
      const el = document.createElement('div');
      el.className = 'toast ' + variant;
      el.textContent = msg;
      container.appendChild(el);
      setTimeout(() => el.remove(), 2800);
    }

    // ================================================================
    // INPUTS & GAME LOOP
    // ================================================================
    _isModalOpen() {
      return !this.elDexModal.classList.contains('hidden') || !this.elCitiesModal.classList.contains('hidden');
    }

    _bindInputs() {
      const canvas = this.renderer.domElement;

      window.addEventListener('keydown', (e) => {
        this.keys[e.code] = true;
        if (this.mode !== 'explore') return;

        if (e.code === 'Space' && !this._isModalOpen()) {
          e.preventDefault();
          if (this.state.player.grounded) {
            this.state.player.vy = 8.4; this.state.player.grounded = false;
            global.L3Audio.playJump();
          }
        }
        if (e.code === 'KeyE' && !this._isModalOpen()) this.evolveTeamMember(this.state.activeTeamIndex);
        if (e.code === 'KeyQ' && !this._isModalOpen()) this.triggerExploreDestruction();
        if (e.code === 'KeyM') {
          if (this.elCitiesModal.classList.contains('hidden')) this._openCitiesModal();
          else this.elCitiesModal.classList.add('hidden');
        }
        if (e.code === 'Escape') {
          this.elDexModal.classList.add('hidden');
          this.elCitiesModal.classList.add('hidden');
        }
      });

      window.addEventListener('keyup', (e) => { this.keys[e.code] = false; });

      canvas.addEventListener('mousedown', (e) => {
        if (this.mode !== 'explore' || this._isModalOpen()) return;
        global.L3Audio.init();
        this.isDragging = true; this.dragMoved = 0;
        this.lastMouse.x = e.clientX; this.lastMouse.y = e.clientY;
      });

      window.addEventListener('mousemove', (e) => {
        if (this.mode !== 'explore') return;
        this.mouseNDC.x = (e.clientX / window.innerWidth) * 2 - 1;
        this.mouseNDC.y = -(e.clientY / window.innerHeight) * 2 + 1;
        if (this.pointerLocked) {
          this.camYaw -= e.movementX * 0.0032;
          this.camPitch = Math.max(-0.12, Math.min(1.05, this.camPitch + e.movementY * 0.0028));
        } else if (this.isDragging) {
          const dx = e.clientX - this.lastMouse.x, dy = e.clientY - this.lastMouse.y;
          this.dragMoved += Math.abs(dx) + Math.abs(dy);
          this.camYaw -= dx * 0.0052;
          this.camPitch = Math.max(-0.12, Math.min(1.05, this.camPitch + dy * 0.0042));
          this.lastMouse.x = e.clientX; this.lastMouse.y = e.clientY;
        }
      });

      window.addEventListener('mouseup', (e) => {
        if (!this.isDragging) return;
        this.isDragging = false;
        if (this.mode !== 'explore' || this._isModalOpen()) return;
        if (this.dragMoved < 9 && e.button === 0) {
          const target = this._findWildAtClick(e.clientX, e.clientY);
          if (target) {
            this.mode = 'battle';
            this.battle.start(target);
          } else if (!this.pointerLocked && e.target === canvas && canvas.requestPointerLock) {
            try { canvas.requestPointerLock(); } catch (err) {}
          }
        }
      });

      canvas.addEventListener('contextmenu', (e) => e.preventDefault());
      canvas.addEventListener('wheel', (e) => {
        if (this.mode !== 'explore') return;
        this.camDist = Math.max(4.5, Math.min(14.5, this.camDist + e.deltaY * 0.005));
      }, { passive: true });

      document.addEventListener('pointerlockchange', () => {
        this.pointerLocked = document.pointerLockElement === canvas;
        this.elCrosshair.classList.toggle('hidden', !this.pointerLocked || this.mode !== 'explore');
      });
    }

    _findWildAtClick(clientX, clientY) {
      const ndc = this.pointerLocked
        ? new THREE.Vector2(0, 0)
        : new THREE.Vector2((clientX / window.innerWidth) * 2 - 1, -(clientY / window.innerHeight) * 2 + 1);
      this.raycaster.setFromCamera(ndc, this.camera);

      const hitboxes = this.wildEntities.filter((w) => !w.inBattle).map((w) => w.hitbox);
      const hits = this.raycaster.intersectObjects(hitboxes, false);
      if (hits.length > 0 && hits[0].distance < 26) return hits[0].object.userData.wildEntity;

      const ray = this.raycaster.ray;
      let best = null, bestD = Infinity;
      for (const w of this.wildEntities) {
        if (w.inBattle) continue;
        const c = w.mesh.position.clone().add(new THREE.Vector3(0, 1.0, 0));
        if (c.distanceTo(this.playerMesh.position) > 22) continue;
        const rd = ray.distanceToPoint(c);
        if (rd < 2.4 && rd < bestD) { bestD = rd; best = w; }
      }
      if (best) return best;

      let near = null, nearD = 4.6;
      for (const w of this.wildEntities) {
        if (w.inBattle) continue;
        const d = w.mesh.position.distanceTo(this.playerMesh.position);
        if (d < nearD) { nearD = d; near = w; }
      }
      return near;
    }

    _updatePlayer(dt, time) {
      const p = this.state.player;
      const forward = (this.keys['KeyW'] || this.keys['ArrowUp'] ? 1 : 0) - (this.keys['KeyS'] || this.keys['ArrowDown'] ? 1 : 0);
      const strafe  = (this.keys['KeyD'] || this.keys['ArrowRight'] ? 1 : 0) - (this.keys['KeyA'] || this.keys['ArrowLeft'] ? 1 : 0);

      let moveSpeed = 0;
      const inWater = this.world.isWaterAt(p.x, p.z);
      const baseSpeed = inWater ? 4.8 : 7.4;

      if ((forward !== 0 || strafe !== 0) && !this._isModalOpen()) {
        const cfX = -Math.sin(this.camYaw), cfZ = -Math.cos(this.camYaw);
        const crX = Math.cos(this.camYaw),  crZ = -Math.sin(this.camYaw);
        let dx = cfX * forward + crX * strafe;
        let dz = cfZ * forward + crZ * strafe;
        const len = Math.hypot(dx, dz) || 1;
        dx /= len; dz /= len;

        const lim = this.world.worldRadius - 1.2;
        const nx = Math.max(-lim, Math.min(lim, p.x + dx * baseSpeed * dt));
        const nz = Math.max(-lim, Math.min(lim, p.z + dz * baseSpeed * dt));

        if (!this.world.isBlocked(nx, p.z) && this.world.getWalkableY(nx, p.z) <= p.y + 1.15) p.x = nx;
        if (!this.world.isBlocked(p.x, nz) && this.world.getWalkableY(p.x, nz) <= p.y + 1.15) p.z = nz;

        const desiredYaw = Math.atan2(dx, dz);
        let diff = desiredYaw - p.yaw;
        while (diff > Math.PI) diff -= Math.PI * 2;
        while (diff < -Math.PI) diff += Math.PI * 2;
        p.yaw += diff * Math.min(1, dt * 12);
        moveSpeed = baseSpeed;
      }

      const groundY = this.world.getWalkableY(p.x, p.z);
      p.vy -= 21.5 * dt; p.y += p.vy * dt;
      if (p.y <= groundY) { p.y = groundY; p.vy = 0; p.grounded = true; } else p.grounded = false;

      this.playerMesh.position.set(p.x, p.y, p.z);
      this.playerMesh.rotation.y = p.yaw;
      global.L3Voxels.animatePlayer(this.playerMesh, time, moveSpeed, p.grounded);

      if (moveSpeed > 0.5 && p.grounded) {
        this.stepTimer -= dt;
        if (this.stepTimer <= 0) {
          global.L3Audio.playFootstep(inWater, this.world.isStoneAt(p.x, p.z));
          this.stepTimer = inWater ? 0.42 : 0.32;
        }
      } else this.stepTimer = 0.08;

      // Collectible Power Orbs
      for (let i = this.world.powerOrbs.length - 1; i >= 0; i--) {
        const orb = this.world.powerOrbs[i];
        if (Math.hypot(p.x - orb.x, p.z - orb.z) < 2.2) {
          this.particles.spawnBurst(orb.mesh.position.clone().add(new THREE.Vector3(0, 1.0, 0)), [0xfacc15, 0xf43f5e, 0x22d3ee, 0xffffff], 30, 6.2, 0.22, -4, 0.8);
          this.world.collectOrb(orb);
          if (this.state.powerOrbs < 3) {
            this.state.powerOrbs += 1;
            global.L3Audio.playOrbPickup(this.state.powerOrbs);
            if (this.state.powerOrbs >= 3) this.showToast('💥 3/3 ORBES! PODER DE DESTRUIÇÃO TOTAL PRONTO!', 'gold');
            else this.showToast(`⚡ Orbe de Poder coletado! (${this.state.powerOrbs} / 3)`, 'gold');
          } else {
            global.L3Audio.playOrbPickup(3);
            this.state.inventory.cuboBalls += 1;
            this.showToast('⚡ Poder 3/3 PRONTO! (+1 Poké-Cubo bônus!)', 'gold');
          }
          this.refreshHudAndTeam();
          this.autoSave(false);
        }
      }

      // Partner follows Lorenzo
      if (this.partnerMesh && !this.evolvingLock) {
        const bx = p.x - Math.sin(p.yaw) * 2.4 + Math.cos(p.yaw) * 1.5;
        const bz = p.z - Math.cos(p.yaw) * 2.4 - Math.sin(p.yaw) * 1.5;
        const dx = bx - this.partnerMesh.position.x, dz = bz - this.partnerMesh.position.z;
        const dist = Math.hypot(dx, dz);
        let spd = 0;
        if (dist > 0.55) {
          const step = Math.min(dist, 7.2 * dt);
          this.partnerMesh.position.x += (dx / dist) * step;
          this.partnerMesh.position.z += (dz / dist) * step;
          const gy = this.world.getWalkableY(this.partnerMesh.position.x, this.partnerMesh.position.z);
          this.partnerMesh.position.y += (gy - this.partnerMesh.position.y) * Math.min(1, dt * 10);
          const ty = Math.atan2(dx, dz);
          let dY = ty - this.partnerMesh.rotation.y;
          while (dY > Math.PI) dY -= Math.PI * 2;
          while (dY < -Math.PI) dY += Math.PI * 2;
          this.partnerMesh.rotation.y += dY * Math.min(1, dt * 8);
          spd = 5;
        }
        global.L3Voxels.animatePokemon(this.partnerMesh, time, spd);
      }

      if (this.healCooldown > 0) this.healCooldown -= dt;
      if (this.healCooldown <= 0 && this.playerMesh.position.distanceTo(this.world.healPos) < 2.3) {
        const needs = this.state.team.some((m) => m.hp < m.maxHp) || this.state.inventory.cuboBalls < 10;
        if (needs) { this.healTeam(false); this.healCooldown = 6; }
      }

      const camX = p.x + Math.sin(this.camYaw) * Math.cos(this.camPitch) * this.camDist;
      const camY = p.y + 1.85 + Math.sin(this.camPitch) * this.camDist;
      const camZ = p.z + Math.cos(this.camYaw) * Math.cos(this.camPitch) * this.camDist;
      const underY = this.world.getSurfaceTopY(camX, camZ) + 0.7;
      this.camera.position.lerp(new THREE.Vector3(camX, Math.max(camY, underY), camZ), Math.min(1, dt * 10));

      if (this.exploreShakeTime > 0) {
        this.exploreShakeTime -= dt;
        const mag = 0.85 * (this.exploreShakeTime / 2.0);
        this.camera.position.x += (Math.random() - 0.5) * mag;
        this.camera.position.y += (Math.random() - 0.5) * mag;
      }
      this.camera.lookAt(p.x, p.y + 1.45, p.z);

      this._updateHoverTarget(time);

      this.autoSaveTimer += dt;
      if (this.autoSaveTimer >= 15) { this.autoSaveTimer = 0; this.autoSave(false); }
    }

    _updateHoverTarget(time) {
      const ndc = this.pointerLocked ? new THREE.Vector2(0, 0) : this.mouseNDC;
      this.raycaster.setFromCamera(ndc, this.camera);
      const hitboxes = this.wildEntities.filter((w) => !w.inBattle).map((w) => w.hitbox);
      const hits = this.raycaster.intersectObjects(hitboxes, false);
      let found = hits.length > 0 && hits[0].distance < 24 ? hits[0].object.userData.wildEntity : null;
      if (!found) {
        let bestD = 4.6;
        for (const w of this.wildEntities) {
          if (w.inBattle) continue;
          const d = w.mesh.position.distanceTo(this.playerMesh.position);
          if (d < bestD) { bestD = d; found = w; }
        }
      }
      if (found) {
        const sp = global.L3Data.SPECIES[found.speciesId];
        this.hoverRing.visible = true;
        this.hoverRing.position.set(found.mesh.position.x, found.mesh.position.y + 0.08, found.mesh.position.z);
        this.hoverRing.rotation.z = time * 1.8;
        this.elTargetPrompt.classList.remove('hidden');
        this.elTargetPromptText.textContent = `Clique para batalhar com ${sp.name} (Nv. ${found.level})!`;
      } else {
        this.hoverRing.visible = false;
        this.elTargetPrompt.classList.add('hidden');
      }
    }

    _updateWilds(dt, time) {
      const lim = this.world.worldRadius - 3;
      for (const w of this.wildEntities) {
        if (w.inBattle) continue;
        const pos = w.mesh.position;
        const dx = w.targetX - pos.x, dz = w.targetZ - pos.z;
        const dist = Math.hypot(dx, dz);
        if (dist < 0.45) {
          w.waitTimer -= dt;
          global.L3Voxels.animatePokemon(w.mesh, time + w.phase, 0);
          if (w.waitTimer <= 0) {
            const a = Math.random() * Math.PI * 2;
            const step = 3 + Math.random() * 5.5;
            const nx = Math.max(-lim, Math.min(lim, pos.x + Math.cos(a) * step));
            const nz = Math.max(-lim, Math.min(lim, pos.z + Math.sin(a) * step));
            if (!this.world.isBlocked(nx, nz)) { w.targetX = nx; w.targetZ = nz; }
            w.waitTimer = 1.4 + Math.random() * 2.5;
          }
        } else {
          const nx = pos.x + (dx / dist) * w.speed * dt;
          const nz = pos.z + (dz / dist) * w.speed * dt;
          if (this.world.isBlocked(nx, nz)) { w.targetX = pos.x; w.targetZ = pos.z; w.waitTimer = 0.5; }
          else {
            pos.x = nx; pos.z = nz;
            const gy = this.world.getWalkableY(pos.x, pos.z);
            pos.y += (gy - pos.y) * Math.min(1, dt * 10);
            const ty = Math.atan2(dx, dz);
            let diff = ty - w.mesh.rotation.y;
            while (diff > Math.PI) diff -= Math.PI * 2;
            while (diff < -Math.PI) diff += Math.PI * 2;
            w.mesh.rotation.y += diff * Math.min(1, dt * 6);
            global.L3Voxels.animatePokemon(w.mesh, time + w.phase, w.speed);
          }
        }
      }
    }

    _animate() {
      requestAnimationFrame(() => this._animate());
      const dt = Math.min(0.05, this.clock.getDelta());
      const time = this.clock.elapsedTime;

      this.world.update(dt, time);
      this.particles.update(dt);
      if (this.mode !== 'battle' || !this.battle.isTitanRaid) {
        this._updateWilds(dt, time);
      }

      if (this.mode === 'title') {
        const r = 20;
        this.camera.position.set(Math.cos(time * 0.16) * r, 13.5 + Math.sin(time * 0.25) * 1.4, Math.sin(time * 0.16) * r);
        this.camera.lookAt(0, 4.0, -2);
      } else if (this.mode === 'explore') {
        this._updatePlayer(dt, time);
      } else if (this.mode === 'battle') {
        this.battle.update(dt, time);
      }

      this.renderer.render(this.scene, this.camera);
    }
  }

  window.addEventListener('DOMContentLoaded', () => {
    if (typeof THREE === 'undefined') {
      document.body.innerHTML = '<div style="color:#fff;padding:40px;font-family:sans-serif;text-align:center;"><h2>Erro ao carregar Three.js via CDN.</h2><p>Verifique sua conexão com a internet e recarregue.</p></div>';
      return;
    }
    global.lorenzoGame3 = new LorenzoGame3();
  });
})(window);
