/* ================================================================
   LORENZO GAMES — Portal Animations, Save Detection & Share Link
   ================================================================ */
(function () {
  'use strict';

  // 1. Animated Cosmic Voxel Cubes & Stars Canvas
  const canvas = document.getElementById('bg-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let w = 0, h = 0;
    const cubes = [];
    const stars = [];
    const colors = ['#22d3ee', '#a855f7', '#ec4899', '#facc15', '#38bdf8', '#f97316'];

    function resize() {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resize);
    resize();

    for (let i = 0; i < 65; i++) {
      stars.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.6 + 0.4,
        phase: Math.random() * Math.PI * 2,
        spd: 0.015 + Math.random() * 0.025
      });
    }

    for (let i = 0; i < 18; i++) {
      cubes.push({
        x: Math.random() * w,
        y: Math.random() * h,
        size: 14 + Math.random() * 26,
        vx: (Math.random() - 0.5) * 0.35,
        vy: -0.25 - Math.random() * 0.45,
        rot: Math.random() * Math.PI,
        vrot: (Math.random() - 0.5) * 0.015,
        color: colors[i % colors.length],
        alpha: 0.14 + Math.random() * 0.22
      });
    }

    function draw() {
      ctx.clearRect(0, 0, w, h);

      // Stars
      for (const s of stars) {
        s.phase += s.spd;
        const a = 0.25 + Math.abs(Math.sin(s.phase)) * 0.7;
        ctx.fillStyle = `rgba(224, 242, 254, ${a.toFixed(2)})`;
        ctx.fillRect(s.x, s.y, s.r * 2, s.r * 2);
      }

      // Floating Neon Voxel Cubes
      for (const c of cubes) {
        c.x += c.vx;
        c.y += c.vy;
        c.rot += c.vrot;
        if (c.y < -50) { c.y = h + 50; c.x = Math.random() * w; }
        if (c.x < -50) c.x = w + 50;
        if (c.x > w + 50) c.x = -50;

        ctx.save();
        ctx.translate(c.x, c.y);
        ctx.rotate(c.rot);
        ctx.globalAlpha = c.alpha;
        ctx.strokeStyle = c.color;
        ctx.lineWidth = 2;
        ctx.strokeRect(-c.size / 2, -c.size / 2, c.size, c.size);
        ctx.fillStyle = c.color;
        ctx.globalAlpha = c.alpha * 0.25;
        ctx.fillRect(-c.size / 2, -c.size / 2, c.size, c.size);
        ctx.restore();
      }
      requestAnimationFrame(draw);
    }
    draw();
  }

  // 2. Detect Saved Progress on this Browser
  function detectSave(key, elId, maxTeam) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return;
      const data = JSON.parse(raw);
      if (!data || !Array.isArray(data.team) || data.team.length === 0) return;
      const el = document.getElementById(elId);
      if (!el) return;
      const caught = (data.caughtSpecies || []).length;
      el.textContent = `💾 Seu progresso salvo aqui: Equipe ${data.team.length}/${maxTeam} • Pokédex: ${caught}`;
      el.classList.remove('hidden');
    } catch (e) {}
  }
  detectSave('lorenzo_game_3_save_v2', 'save-status-g3', 30);
  detectSave('lorenzo_game_2_save_v1', 'save-status-g2', 6);

  // 3. Share Portal Link with Friends
  const toast = document.getElementById('portal-toast');
  let toastTimer = null;
  function showToast(msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.remove('hidden');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.add('hidden'), 2800);
  }

  async function sharePortal() {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'LORENZO GAMES — Jogos 3D do Lorenzo!',
          text: 'Vem jogar os jogos 3D do Lorenzo direto no navegador! 🎮✨',
          url
        });
        return;
      } catch (e) {}
    }
    try {
      await navigator.clipboard.writeText(url);
      showToast('🔗 Link copiado! Agora é só mandar para os amigos jogarem! 🚀');
    } catch (e) {
      showToast('Copie o endereço lá em cima no navegador para enviar aos amigos! 🎮');
    }
  }

  const btn1 = document.getElementById('btn-share');
  const btn2 = document.getElementById('btn-share-bottom');
  if (btn1) btn1.addEventListener('click', sharePortal);
  if (btn2) btn2.addEventListener('click', sharePortal);
})();
