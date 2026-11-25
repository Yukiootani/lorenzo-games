/* ================================================================
   LORENZO GAME 3 — Auto-Save / LocalStorage (js3/storage3.js)
   ================================================================ */
(function (global) {
  'use strict';

  const SAVE_KEY = 'lorenzo_game_3_save_v2';

  const Storage3 = {
    hasSave() {
      try {
        const raw = localStorage.getItem(SAVE_KEY);
        if (!raw) return false;
        const p = JSON.parse(raw);
        return !!(p && Array.isArray(p.team) && p.team.length > 0);
      } catch (e) { return false; }
    },

    load() {
      try {
        const raw = localStorage.getItem(SAVE_KEY);
        if (!raw) return null;
        const data = JSON.parse(raw);
        if (!data || !Array.isArray(data.team) || data.team.length === 0) return null;
        return data;
      } catch (e) { return null; }
    },

    save(state) {
      try {
        const payload = {
          version: 2,
          savedAt: Date.now(),
          cityId: state.cityId || 'mesagoza',
          powerOrbs: Math.max(0, Math.min(3, state.powerOrbs || 0)),
          distinctSinceRaid: Array.from(state.distinctSinceRaid || []),
          recentCaptureUids: (state.recentCaptureUids || []).slice(-3),
          raidBossIndex: state.raidBossIndex || 0,
          raidsWon: state.raidsWon || 0,
          player: {
            x: Number(state.player.x.toFixed(2)),
            y: Number(state.player.y.toFixed(2)),
            z: Number(state.player.z.toFixed(2)),
            yaw: Number(state.player.yaw.toFixed(3))
          },
          activeTeamIndex: state.activeTeamIndex || 0,
          team: state.team,
          inventory: state.inventory,
          caughtSpecies: Array.from(state.caughtSpecies || []),
          battlesWon: state.battlesWon || 0
        };
        localStorage.setItem(SAVE_KEY, JSON.stringify(payload));
        return true;
      } catch (e) { return false; }
    },

    clear() {
      try { localStorage.removeItem(SAVE_KEY); } catch (e) {}
    }
  };

  global.L3Storage = Storage3;
})(window);
