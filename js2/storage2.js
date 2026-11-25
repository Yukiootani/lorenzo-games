/* ================================================================
   LORENZO GAME 2 — Auto-Save / LocalStorage (js2/storage2.js)
   ================================================================ */
(function (global) {
  'use strict';

  const SAVE_KEY = 'lorenzo_game_2_save_v1';

  const Storage2 = {
    hasSave() {
      try {
        const raw = localStorage.getItem(SAVE_KEY);
        if (!raw) return false;
        const parsed = JSON.parse(raw);
        return !!(parsed && Array.isArray(parsed.team) && parsed.team.length > 0);
      } catch (e) {
        return false;
      }
    },

    load() {
      try {
        const raw = localStorage.getItem(SAVE_KEY);
        if (!raw) return null;
        const data = JSON.parse(raw);
        if (!data || !Array.isArray(data.team) || data.team.length === 0) return null;
        return data;
      } catch (e) {
        return null;
      }
    },

    save(state) {
      try {
        const payload = {
          version: 1,
          savedAt: Date.now(),
          cityId: state.cityId || 'verdejante',
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
      } catch (e) {
        return false;
      }
    },

    clear() {
      try { localStorage.removeItem(SAVE_KEY); } catch (e) {}
    }
  };

  global.L2Storage = Storage2;
})(window);
