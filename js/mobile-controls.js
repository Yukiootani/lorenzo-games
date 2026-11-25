/* ================================================================
   LORENZO GAMES — Shared Mobile Touch Controls & WebGL Optimizer
   Works for Game 2, Game 3, and all future Lorenzo Games!
   ================================================================ */
(function (global) {
  'use strict';

  function isMobileDevice() {
    return (
      'ontouchstart' in window ||
      (navigator.maxTouchPoints && navigator.maxTouchPoints > 0) ||
      window.matchMedia('(pointer: coarse)').matches ||
      window.innerWidth <= 900
    );
  }

  function optimizeRendererForMobile(game) {
    const mobile = isMobileDevice();
    if (!game || !game.renderer || !game.camera) return mobile;

    const applyViewportSize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      game.camera.aspect = w / Math.max(1, h);
      // Wider vertical FOV in portrait mode so players see clearly on phones!
      game.camera.fov = h > w ? 72 : 60;
      game.camera.updateProjectionMatrix();
      game.renderer.setSize(w, h);
      game.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, mobile ? 1.5 : 2));
    };

    if (mobile) {
      // Disable heavy 2048x2048 shadow maps on mobile GPUs to prevent blank/black canvas & lag!
      game.renderer.shadowMap.enabled = false;
      if (game.sunLight) {
        game.sunLight.castShadow = false;
        game.sunLight.intensity = 1.05;
      }
      // Slightly pull camera back in portrait so character + partner + city are crystal clear
      if (window.innerHeight > window.innerWidth) {
        game.camDist = Math.max(game.camDist || 8, 9.2);
      }
    }

    applyViewportSize();
    window.addEventListener('resize', applyViewportSize);
    window.addEventListener('orientationchange', () => setTimeout(applyViewportSize, 180));

    // Guard against iOS/Android WebGL context loss
    if (game.renderer.domElement) {
      game.renderer.domElement.addEventListener('webglcontextlost', (e) => {
        e.preventDefault();
      }, false);
    }

    return mobile;
  }

  function attachMobileControls(game) {
    if (!game) return;
    optimizeRendererForMobile(game);

    const exploreHud = document.getElementById('explore-hud');
    const miniTeamPanel = document.getElementById('mini-team-panel');
    if (!exploreHud) return;

    // 1. Add Collapsible Mini-Team Drawer Button for Mobile
    let teamToggle = document.getElementById('mobile-team-toggle');
    if (!teamToggle && miniTeamPanel) {
      teamToggle = document.createElement('button');
      teamToggle.id = 'mobile-team-toggle';
      teamToggle.type = 'button';
      teamToggle.className = 'mobile-team-toggle';
      teamToggle.innerHTML = '<span>🎒 Equipe</span> <span id="mobile-team-badge">1</span>';
      exploreHud.appendChild(teamToggle);

      teamToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        miniTeamPanel.classList.toggle('mobile-open');
      });

      // Close drawer if tapping canvas outside it
      if (game.renderer && game.renderer.domElement) {
        game.renderer.domElement.addEventListener('touchstart', () => {
          miniTeamPanel.classList.remove('mobile-open');
        }, { passive: true });
      }
    }

    // 2. Build Floating Touch Controls Overlay
    const hasUltimate = typeof game.triggerExploreDestruction === 'function';
    const hasEvolve = typeof game.evolveTeamMember === 'function';

    let touchRoot = document.getElementById('mobile-touch-controls');
    if (!touchRoot) {
      touchRoot = document.createElement('div');
      touchRoot.id = 'mobile-touch-controls';
      touchRoot.innerHTML = `
        <div id="touch-joystick" class="touch-joystick-zone" aria-label="Mover personagem">
          <div id="touch-knob" class="touch-joystick-knob"></div>
        </div>
        <div class="touch-actions-pad">
          <button id="tbtn-battle" class="touch-btn touch-btn-battle" type="button">
            <span class="touch-btn-ico">⚔️</span>
            <span class="touch-btn-lbl">Lutar</span>
          </button>
          <button id="tbtn-jump" class="touch-btn touch-btn-jump" type="button">
            <span class="touch-btn-ico">⬆️</span>
            <span class="touch-btn-lbl">Pular</span>
          </button>
          ${hasEvolve ? `
          <button id="tbtn-evolve" class="touch-btn touch-btn-evolve" type="button">
            <span class="touch-btn-ico">🧬</span>
            <span class="touch-btn-lbl">Evoluir</span>
          </button>` : ''}
          ${hasUltimate ? `
          <button id="tbtn-ult" class="touch-btn touch-btn-ult disabled" type="button">
            <span class="touch-btn-ico">💥</span>
            <span class="touch-btn-lbl">Destruir</span>
          </button>` : ''}
        </div>
      `;
      exploreHud.appendChild(touchRoot);
    }

    const updateVisibility = () => {
      const mobile = isMobileDevice();
      touchRoot.classList.toggle('active', mobile);
    };
    updateVisibility();
    window.addEventListener('resize', updateVisibility);

    // 3. Virtual Analog Joystick Logic
    const joyZone = document.getElementById('touch-joystick');
    const joyKnob = document.getElementById('touch-knob');
    let joyTouchId = null;
    const maxR = 38;

    function resetJoy() {
      joyTouchId = null;
      joyKnob.style.transform = 'translate(0px, 0px)';
      game.keys['KeyW'] = false;
      game.keys['KeyS'] = false;
      game.keys['KeyA'] = false;
      game.keys['KeyD'] = false;
    }

    function handleJoyMove(clientX, clientY) {
      const rect = joyZone.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      let dx = clientX - cx;
      let dy = clientY - cy;
      const dist = Math.hypot(dx, dy);
      if (dist > maxR) {
        dx = (dx / dist) * maxR;
        dy = (dy / dist) * maxR;
      }
      joyKnob.style.transform = `translate(${dx}px, ${dy}px)`;
      const dead = 10;
      game.keys['KeyW'] = dy < -dead;
      game.keys['KeyS'] = dy > dead;
      game.keys['KeyA'] = dx < -dead;
      game.keys['KeyD'] = dx > dead;
    }

    joyZone.addEventListener('touchstart', (e) => {
      e.preventDefault();
      if (game.mode !== 'explore') return;
      if (global.L3Audio) global.L3Audio.init();
      if (global.L2Audio) global.L2Audio.init();
      const t = e.changedTouches[0];
      joyTouchId = t.identifier;
      handleJoyMove(t.clientX, t.clientY);
    }, { passive: false });

    window.addEventListener('touchmove', (e) => {
      if (joyTouchId === null) return;
      for (const t of e.changedTouches) {
        if (t.identifier === joyTouchId) {
          handleJoyMove(t.clientX, t.clientY);
          break;
        }
      }
    }, { passive: true });

    window.addEventListener('touchend', (e) => {
      if (joyTouchId === null) return;
      for (const t of e.changedTouches) {
        if (t.identifier === joyTouchId) { resetJoy(); break; }
      }
    });
    window.addEventListener('touchcancel', resetJoy);

    // 4. Touch Camera Orbit + Tap-on-Monster to Battle on 3D Canvas!
    const canvas = game.renderer.domElement;
    let camTouchId = null;
    let camLastX = 0, camLastY = 0, camMoved = 0;

    canvas.addEventListener('touchstart', (e) => {
      if (game.mode !== 'explore') return;
      if (game._isModalOpen && game._isModalOpen()) return;
      if (global.L3Audio) global.L3Audio.init();
      if (global.L2Audio) global.L2Audio.init();

      for (const t of e.changedTouches) {
        if (t.identifier !== joyTouchId && camTouchId === null) {
          camTouchId = t.identifier;
          camLastX = t.clientX;
          camLastY = t.clientY;
          camMoved = 0;
          break;
        }
      }
    }, { passive: true });

    canvas.addEventListener('touchmove', (e) => {
      if (camTouchId === null || game.mode !== 'explore') return;
      for (const t of e.changedTouches) {
        if (t.identifier === camTouchId) {
          e.preventDefault();
          const dx = t.clientX - camLastX;
          const dy = t.clientY - camLastY;
          camMoved += Math.abs(dx) + Math.abs(dy);
          game.camYaw -= dx * 0.0068;
          game.camPitch = Math.max(-0.1, Math.min(1.05, game.camPitch + dy * 0.0052));
          camLastX = t.clientX;
          camLastY = t.clientY;
          break;
        }
      }
    }, { passive: false });

    canvas.addEventListener('touchend', (e) => {
      if (camTouchId === null) return;
      for (const t of e.changedTouches) {
        if (t.identifier === camTouchId) {
          const wasTap = camMoved < 16;
          camTouchId = null;
          if (wasTap && game.mode === 'explore' && (!game._isModalOpen || !game._isModalOpen())) {
            const target = game._findWildAtClick ? game._findWildAtClick(t.clientX, t.clientY) : null;
            if (target && game.battle) {
              resetJoy();
              game.mode = 'battle';
              game.battle.start(target);
            }
          }
          break;
        }
      }
    });

    // 5. Action Buttons
    const btnJump = document.getElementById('tbtn-jump');
    if (btnJump) {
      btnJump.addEventListener('touchstart', (e) => {
        e.preventDefault();
        if (game.mode === 'explore' && game.state.player.grounded) {
          game.state.player.vy = 8.4;
          game.state.player.grounded = false;
          if (global.L3Audio) global.L3Audio.playJump();
          if (global.L2Audio) global.L2Audio.playJump();
        }
      }, { passive: false });
      btnJump.addEventListener('click', () => {
        if (game.mode === 'explore' && game.state.player.grounded) {
          game.state.player.vy = 8.4;
          game.state.player.grounded = false;
        }
      });
    }

    const btnBattle = document.getElementById('tbtn-battle');
    if (btnBattle) {
      const triggerNearestBattle = () => {
        if (game.mode !== 'explore' || !game.wildEntities) return;
        let best = null, bestD = 16;
        for (const w of game.wildEntities) {
          if (w.inBattle) continue;
          const d = w.mesh.position.distanceTo(game.playerMesh.position);
          if (d < bestD) { bestD = d; best = w; }
        }
        if (best && game.battle) {
          resetJoy();
          game.mode = 'battle';
          game.battle.start(best);
        } else if (game.showToast) {
          game.showToast('Chegue mais perto de um Pokémon selvagem para batalhar!');
        }
      };
      btnBattle.addEventListener('click', triggerNearestBattle);
    }

    const btnEvolve = document.getElementById('tbtn-evolve');
    if (btnEvolve && hasEvolve) {
      btnEvolve.addEventListener('click', () => {
        if (game.mode === 'explore') game.evolveTeamMember(game.state.activeTeamIndex);
      });
    }

    const btnUlt = document.getElementById('tbtn-ult');
    if (btnUlt && hasUltimate) {
      btnUlt.addEventListener('click', () => {
        if (game.mode === 'explore') game.triggerExploreDestruction();
      });
    }

    // 6. Sync Live Badges (Team Count & Ultimate Charge) periodically
    setInterval(() => {
      const teamBadge = document.getElementById('mobile-team-badge');
      const desktopBadge = document.getElementById('team-count-badge');
      if (teamBadge && desktopBadge) teamBadge.textContent = desktopBadge.textContent;
      if (btnUlt && game.state) {
        const ready = (game.state.powerOrbs || 0) >= 3;
        btnUlt.classList.toggle('disabled', !ready);
      }
    }, 350);
  }

  global.LorenzoMobile = {
    isMobileDevice,
    optimizeRendererForMobile,
    attachMobileControls
  };
})(window);
