/* ================================================================
   LORENZO GAME 2 — Famous Pokémon, Evolutions & 5 Cities Data
   ================================================================ */
(function (global) {
  'use strict';

  const TYPE_LABELS = {
    fogo: 'Fogo',
    agua: 'Água',
    planta: 'Planta',
    eletrico: 'Elétrico',
    dragao: 'Dragão',
    lutador: 'Lutador',
    normal: 'Normal'
  };

  const TYPE_COLORS = {
    fogo: '#ff5722',
    agua: '#0ea5e9',
    planta: '#22c55e',
    eletrico: '#facc15',
    dragao: '#818cf8',
    lutador: '#ef4444',
    normal: '#94a3b8'
  };

  const TYPE_CHART = {
    fogo:     { planta: 1.6, agua: 0.65, fogo: 0.7, dragao: 0.75 },
    agua:     { fogo: 1.6, planta: 0.65, agua: 0.7, dragao: 0.75 },
    planta:   { agua: 1.6, fogo: 0.65, planta: 0.7, dragao: 0.75 },
    eletrico: { agua: 1.6, planta: 0.65, eletrico: 0.7, dragao: 0.75 },
    dragao:   { dragao: 1.6, fogo: 1.15, agua: 1.15 },
    lutador:  { normal: 1.6, eletrico: 1.25, dragao: 1.15 },
    normal:   {}
  };

  function getEffectiveness(moveType, targetType) {
    const row = TYPE_CHART[moveType];
    if (!row || row[targetType] === undefined) return 1.0;
    return row[targetType];
  }

  // ================================================================
  // 17 FAMOUS POKÉMON ACROSS 6 COMPLETE EVOLUTION LINES
  // ================================================================
  const SPECIES = {
    // --- LINHA CHARMANDER ---
    charmander: {
      id: 'charmander', name: 'Charmander', type: 'fogo', stage: 1, evolvesTo: 'charmeleon',
      avatarClass: 'av-charmander',
      description: 'A chama na ponta de sua cauda mostra sua força vital. Evolui até Charizard!',
      baseHp: 48, baseAtk: 15, baseDef: 10, catchRate: 0.55,
      moves: [
        { name: 'Arranhão',      type: 'normal', power: 36, fx: 'normal' },
        { name: 'Brasas',        type: 'fogo',   power: 46, fx: 'fogo' },
        { name: 'Presa de Fogo', type: 'fogo',   power: 58, fx: 'fogo' },
        { name: 'Chama Vital',   type: 'fogo',   power: 0,  fx: 'heal', healPct: 0.36 }
      ]
    },
    charmeleon: {
      id: 'charmeleon', name: 'Charmeleon', type: 'fogo', stage: 2, evolvesTo: 'charizard',
      avatarClass: 'av-charmeleon',
      description: 'Evolução feroz de Charmander com garras afiadas e fogo mais intenso.',
      baseHp: 64, baseAtk: 21, baseDef: 14, catchRate: 0.42,
      moves: [
        { name: 'Garra Cortante', type: 'normal', power: 48, fx: 'normal' },
        { name: 'Lança-Chamas',   type: 'fogo',   power: 68, fx: 'fogo' },
        { name: 'Garra Dragão',   type: 'dragao', power: 62, fx: 'dragao' },
        { name: 'Fogo Interior',  type: 'fogo',   power: 0,  fx: 'heal', healPct: 0.40 }
      ]
    },
    charizard: {
      id: 'charizard', name: 'Charizard', type: 'fogo', stage: 3, evolvesTo: null,
      avatarClass: 'av-charizard',
      description: 'Dragão flamejante lendário com asas poderosas capaz de derreter rochas!',
      baseHp: 88, baseAtk: 30, baseDef: 20, catchRate: 0.30,
      moves: [
        { name: 'Lança-Chamas',     type: 'fogo',   power: 76, fx: 'fogo' },
        { name: 'Explosão de Fogo', type: 'fogo',   power: 94, fx: 'fogo' },
        { name: 'Fúria do Dragão',  type: 'dragao', power: 82, fx: 'dragao' },
        { name: 'Asas de Brasa',    type: 'fogo',   power: 0,  fx: 'heal', healPct: 0.45 }
      ]
    },

    // --- LINHA BULBASAUR ---
    bulbasaur: {
      id: 'bulbasaur', name: 'Bulbasaur', type: 'planta', stage: 1, evolvesTo: 'ivysaur',
      avatarClass: 'av-bulbasaur',
      description: 'Carrega um bulbo de planta nas costas que cresce ao absorver sol.',
      baseHp: 52, baseAtk: 14, baseDef: 12, catchRate: 0.55,
      moves: [
        { name: 'Investida',     type: 'normal', power: 36, fx: 'normal' },
        { name: 'Chicote Vinha', type: 'planta', power: 46, fx: 'planta' },
        { name: 'Folha Navalha', type: 'planta', power: 58, fx: 'planta' },
        { name: 'Síntese',       type: 'planta', power: 0,  fx: 'heal', healPct: 0.42 }
      ]
    },
    ivysaur: {
      id: 'ivysaur', name: 'Ivysaur', type: 'planta', stage: 2, evolvesTo: 'venusaur',
      avatarClass: 'av-ivysaur',
      description: 'O botão cor-de-rosa nas suas costas exala um aroma doce antes de desabrochar.',
      baseHp: 68, baseAtk: 19, baseDef: 16, catchRate: 0.42,
      moves: [
        { name: 'Folha Navalha',  type: 'planta', power: 56, fx: 'planta' },
        { name: 'Bomba Semente',  type: 'planta', power: 68, fx: 'planta' },
        { name: 'Golpe Corporal', type: 'normal', power: 52, fx: 'normal' },
        { name: 'Síntese Solar',  type: 'planta', power: 0,  fx: 'heal', healPct: 0.45 }
      ]
    },
    venusaur: {
      id: 'venusaur', name: 'Venusaur', type: 'planta', stage: 3, evolvesTo: null,
      avatarClass: 'av-venusaur',
      description: 'A flor gigante em suas costas canaliza energia solar pura para golpes devastadores!',
      baseHp: 94, baseAtk: 27, baseDef: 24, catchRate: 0.30,
      moves: [
        { name: 'Raio Solar',      type: 'planta', power: 92, fx: 'planta' },
        { name: 'Tempestade Flor', type: 'planta', power: 78, fx: 'planta' },
        { name: 'Terremoto Folha', type: 'normal', power: 70, fx: 'normal' },
        { name: 'Cura Florestal',  type: 'planta', power: 0,  fx: 'heal', healPct: 0.50 }
      ]
    },

    // --- LINHA SQUIRTLE ---
    squirtle: {
      id: 'squirtle', name: 'Squirtle', type: 'agua', stage: 1, evolvesTo: 'wartortle',
      avatarClass: 'av-squirtle',
      description: 'Tartaruga aquática com casco resistente e jatos d’água precisos.',
      baseHp: 50, baseAtk: 14, baseDef: 13, catchRate: 0.55,
      moves: [
        { name: 'Investida',    type: 'normal', power: 36, fx: 'normal' },
        { name: 'Jato d’Água',  type: 'agua',   power: 46, fx: 'agua' },
        { name: 'Pulso d’Água', type: 'agua',   power: 58, fx: 'agua' },
        { name: 'Refúgio Água', type: 'agua',   power: 0,  fx: 'heal', healPct: 0.38 }
      ]
    },
    wartortle: {
      id: 'wartortle', name: 'Wartortle', type: 'agua', stage: 2, evolvesTo: 'blastoise',
      avatarClass: 'av-wartortle',
      description: 'Suas orelhas e cauda peludas ajudam a nadar em altíssima velocidade.',
      baseHp: 68, baseAtk: 19, baseDef: 18, catchRate: 0.42,
      moves: [
        { name: 'Cauda Aqua',   type: 'agua',   power: 62, fx: 'agua' },
        { name: 'Surf Voxel',   type: 'agua',   power: 70, fx: 'agua' },
        { name: 'Quebra-Casco', type: 'normal', power: 54, fx: 'normal' },
        { name: 'Maré Curativa',type: 'agua',   power: 0,  fx: 'heal', healPct: 0.42 }
      ]
    },
    blastoise: {
      id: 'blastoise', name: 'Blastoise', type: 'agua', stage: 3, evolvesTo: null,
      avatarClass: 'av-blastoise',
      description: 'Equipado com dois canhões de aço no casco capazes de disparar Hidro Bombas!',
      baseHp: 94, baseAtk: 28, baseDef: 25, catchRate: 0.30,
      moves: [
        { name: 'Hidro Bomba',   type: 'agua',   power: 94, fx: 'agua' },
        { name: 'Canhão Flash',  type: 'agua',   power: 78, fx: 'agua' },
        { name: 'Quebra-Crânio', type: 'normal', power: 72, fx: 'normal' },
        { name: 'Escudo Marinho',type: 'agua',   power: 0,  fx: 'heal', healPct: 0.46 }
      ]
    },

    // --- LINHA PIKACHU ---
    pikachu: {
      id: 'pikachu', name: 'Pikachu', type: 'eletrico', stage: 1, evolvesTo: 'raichu',
      avatarClass: 'av-pikachu',
      description: 'O famoso Pokémon elétrico! Armazena eletricidade nas bochechas vermelhas.',
      baseHp: 50, baseAtk: 17, baseDef: 11, catchRate: 0.55,
      moves: [
        { name: 'Ataque Rápido',    type: 'normal',   power: 40, fx: 'normal' },
        { name: 'Choque do Trovão', type: 'eletrico', power: 52, fx: 'eletrico' },
        { name: 'Esfera Elétrica',  type: 'eletrico', power: 66, fx: 'eletrico' },
        { name: 'Recarga Estática', type: 'eletrico', power: 0,  fx: 'heal', healPct: 0.38 }
      ]
    },
    raichu: {
      id: 'raichu', name: 'Raichu', type: 'eletrico', stage: 2, evolvesTo: null,
      avatarClass: 'av-raichu',
      description: 'Evolução supercarregada de Pikachu! Sua cauda descarrega 100.000 volts!',
      baseHp: 82, baseAtk: 29, baseDef: 19, catchRate: 0.34,
      moves: [
        { name: 'Trovão Supremo',  type: 'eletrico', power: 92, fx: 'eletrico' },
        { name: 'Investida Trovão',type: 'eletrico', power: 78, fx: 'eletrico' },
        { name: 'Cauda de Ferro',  type: 'normal',   power: 68, fx: 'normal' },
        { name: 'Pulso Vital',     type: 'eletrico', power: 0,  fx: 'heal', healPct: 0.45 }
      ]
    },

    // --- LINHA DRATINI -> DRAGONITE ---
    dratini: {
      id: 'dratini', name: 'Dratini', type: 'dragao', stage: 1, evolvesTo: 'dragonair',
      avatarClass: 'av-dratini',
      description: 'Um raro Pokémon dragão azul que evolui até o poderoso Dragonite!',
      baseHp: 52, baseAtk: 16, baseDef: 12, catchRate: 0.48,
      moves: [
        { name: 'Enrolar',       type: 'normal', power: 38, fx: 'normal' },
        { name: 'Sopro Dragão',  type: 'dragao', power: 52, fx: 'dragao' },
        { name: 'Cauda Aqua',    type: 'agua',   power: 56, fx: 'agua' },
        { name: 'Escama Mística',type: 'dragao', power: 0,  fx: 'heal', healPct: 0.40 }
      ]
    },
    dragonair: {
      id: 'dragonair', name: 'Dragonair', type: 'dragao', stage: 2, evolvesTo: 'dragonite',
      avatarClass: 'av-dragonair',
      description: 'Dragão elegante adornado com pérolas azuis capazes de controlar o clima.',
      baseHp: 72, baseAtk: 23, baseDef: 17, catchRate: 0.36,
      moves: [
        { name: 'Pulso do Dragão', type: 'dragao',   power: 72, fx: 'dragao' },
        { name: 'Cauda Dragão',    type: 'dragao',   power: 64, fx: 'dragao' },
        { name: 'Raio Celeste',    type: 'eletrico', power: 62, fx: 'eletrico' },
        { name: 'Aura Dracônica',  type: 'dragao',   power: 0,  fx: 'heal', healPct: 0.44 }
      ]
    },
    dragonite: {
      id: 'dragonite', name: 'Dragonite', type: 'dragao', stage: 3, evolvesTo: null,
      avatarClass: 'av-dragonite',
      description: 'O lendário dragão gentil e invencível que dá a volta ao mundo em 16 horas!',
      baseHp: 102, baseAtk: 33, baseDef: 24, catchRate: 0.28,
      moves: [
        { name: 'Meteoro Dragão',  type: 'dragao',   power: 98, fx: 'dragao' },
        { name: 'Hiper Raio',      type: 'normal',   power: 88, fx: 'eletrico' },
        { name: 'Furacão Dragão',  type: 'agua',     power: 80, fx: 'agua' },
        { name: 'Pouso Celestial', type: 'dragao',   power: 0,  fx: 'heal', healPct: 0.50 }
      ]
    },

    // --- LINHA TORCHIC -> BLAZIKEN ---
    torchic: {
      id: 'torchic', name: 'Torchic', type: 'fogo', stage: 1, evolvesTo: 'combusken',
      avatarClass: 'av-torchic',
      description: 'Pintinho de fogo corajoso com uma chama ardente no peito. Evolui até Blaziken!',
      baseHp: 48, baseAtk: 16, baseDef: 10, catchRate: 0.55,
      moves: [
        { name: 'Bicada Rápida',  type: 'normal',  power: 38, fx: 'normal' },
        { name: 'Brasas Quentes', type: 'fogo',    power: 48, fx: 'fogo' },
        { name: 'Chute Duplo',    type: 'lutador', power: 54, fx: 'lutador' },
        { name: 'Fôlego Ardente', type: 'fogo',    power: 0,  fx: 'heal', healPct: 0.38 }
      ]
    },
    combusken: {
      id: 'combusken', name: 'Combusken', type: 'fogo', stage: 2, evolvesTo: 'blaziken',
      avatarClass: 'av-combusken',
      description: 'Lutador ágil que desfere até 10 chutes flamejantes por segundo!',
      baseHp: 66, baseAtk: 23, baseDef: 15, catchRate: 0.40,
      moves: [
        { name: 'Chute Duplo',    type: 'lutador', power: 62, fx: 'lutador' },
        { name: 'Roda de Fogo',   type: 'fogo',    power: 68, fx: 'fogo' },
        { name: 'Soco Flamejante',type: 'lutador', power: 72, fx: 'fogo' },
        { name: 'Foco Marcial',   type: 'fogo',    power: 0,  fx: 'heal', healPct: 0.42 }
      ]
    },
    blaziken: {
      id: 'blaziken', name: 'Blaziken', type: 'fogo', stage: 3, evolvesTo: null,
      avatarClass: 'av-blaziken',
      description: 'Mestre das artes marciais de fogo! Seus punhos e chutes explodem em chamas!',
      baseHp: 92, baseAtk: 34, baseDef: 21, catchRate: 0.28,
      moves: [
        { name: 'Chute Flamejante', type: 'fogo',    power: 96, fx: 'fogo' },
        { name: 'Gancho Celeste',   type: 'lutador', power: 86, fx: 'lutador' },
        { name: 'Chama Explosiva',  type: 'fogo',    power: 82, fx: 'fogo' },
        { name: 'Espírito Lutador', type: 'lutador', power: 0,  fx: 'heal', healPct: 0.46 }
      ]
    }
  };

  const SPECIES_IDS = Object.keys(SPECIES);

  // ================================================================
  // 5 SELECTABLE 3D VOXEL CITIES
  // ================================================================
  const CITIES = {
    verdejante: {
      id: 'verdejante',
      name: 'Vila Verdejante',
      emoji: '🏡',
      skyColor: 0x67d2ff,
      fogColor: 0x8be0ff,
      sunColor: 0xfffbeb,
      description: 'Cidade acolhedora com casas de telhado vermelho, praça de pedra, Centro Pokémon e bosques verdes.',
      spawns: ['pikachu', 'charmander', 'bulbasaur', 'squirtle', 'torchic', 'dratini'],
      levelRange: [5, 9]
    },
    vulcanica: {
      id: 'vulcanica',
      name: 'Cidade Vulcânica',
      emoji: '🌋',
      skyColor: 0x451a1a,
      fogColor: 0x6b2419,
      sunColor: 0xfdba74,
      description: 'Fortaleza de obsidiana cercada por canais de lava brilhante — lar dos Pokémon de Fogo!',
      spawns: ['charmander', 'charmeleon', 'torchic', 'combusken', 'blaziken', 'charizard'],
      levelRange: [10, 16]
    },
    costeira: {
      id: 'costeira',
      name: 'Porto Cerúleo',
      emoji: '🏖️',
      skyColor: 0x38bdf8,
      fogColor: 0x7dd3fc,
      sunColor: 0xfef9c3,
      description: 'Cidade praiana ensolarada com cais de madeira, palmeiras voxel e águas cristalinas.',
      spawns: ['squirtle', 'wartortle', 'blastoise', 'dratini', 'dragonair', 'pikachu'],
      levelRange: [8, 14]
    },
    eletrica: {
      id: 'eletrica',
      name: 'Metrópole Neon',
      emoji: '⚡',
      skyColor: 0x0f172a,
      fogColor: 0x1e1b4b,
      sunColor: 0x93c5fd,
      description: 'Cidade futurista iluminada por torres neon, ruas energizadas e faíscas elétricas!',
      spawns: ['pikachu', 'raichu', 'ivysaur', 'combusken', 'wartortle', 'dragonair'],
      levelRange: [11, 17]
    },
    dragoes: {
      id: 'dragoes',
      name: 'Pico dos Dragões',
      emoji: '🐉',
      skyColor: 0x312e81,
      fogColor: 0x4338ca,
      sunColor: 0xfde68a,
      description: 'Santuário nas nuvens com templos antigos e pilares de cristal onde vivem evoluções finais!',
      spawns: ['dratini', 'dragonair', 'dragonite', 'charizard', 'blaziken', 'venusaur'],
      levelRange: [15, 22]
    }
  };

  const CITY_IDS = Object.keys(CITIES);

  // ================================================================
  // MONSTER FACTORY, XP & INSTANT EVOLUTION
  // ================================================================
  function calcMaxHp(sp, level)  { return Math.round(sp.baseHp + (level - 1) * 7.5); }
  function calcAtk(sp, level)    { return Math.round(sp.baseAtk + (level - 1) * 2.5); }
  function calcDef(sp, level)    { return Math.round(sp.baseDef + (level - 1) * 2.0); }
  function xpForNextLevel(level) { return Math.round(40 + level * 22); }

  function createMonster(speciesId, level = 6) {
    const sp = SPECIES[speciesId] || SPECIES.charmander;
    const maxHp = calcMaxHp(sp, level);
    return {
      uid: speciesId + '_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 6),
      speciesId: sp.id,
      name: sp.name,
      type: sp.type,
      level,
      maxHp,
      hp: maxHp,
      atk: calcAtk(sp, level),
      def: calcDef(sp, level),
      xp: 0,
      xpToNext: xpForNextLevel(level)
    };
  }

  function grantXp(mon, amount) {
    const sp = SPECIES[mon.speciesId];
    mon.xp += amount;
    let leveled = false;
    while (mon.xp >= mon.xpToNext) {
      mon.xp -= mon.xpToNext;
      mon.level += 1;
      const oldMax = mon.maxHp;
      mon.maxHp = calcMaxHp(sp, mon.level);
      mon.atk = calcAtk(sp, mon.level);
      mon.def = calcDef(sp, mon.level);
      mon.hp = Math.min(mon.maxHp, mon.hp + (mon.maxHp - oldMax) + 8);
      mon.xpToNext = xpForNextLevel(mon.level);
      leveled = true;
    }
    return leveled;
  }

  function canEvolve(mon) {
    if (!mon) return false;
    const sp = SPECIES[mon.speciesId];
    return !!(sp && sp.evolvesTo && SPECIES[sp.evolvesTo]);
  }

  function evolveMonster(mon) {
    const curSp = SPECIES[mon.speciesId];
    if (!curSp || !curSp.evolvesTo) return null;
    const nextSp = SPECIES[curSp.evolvesTo];
    if (!nextSp) return null;

    const oldName = mon.name;
    mon.speciesId = nextSp.id;
    mon.name = nextSp.name;
    mon.type = nextSp.type;
    mon.level = Math.max(mon.level + 2, nextSp.stage === 2 ? 12 : 20);
    mon.maxHp = calcMaxHp(nextSp, mon.level);
    mon.hp = mon.maxHp; // Full heal on evolution!
    mon.atk = calcAtk(nextSp, mon.level);
    mon.def = calcDef(nextSp, mon.level);
    mon.xpToNext = xpForNextLevel(mon.level);

    return { oldName, newName: nextSp.name, newSpeciesId: nextSp.id };
  }

  global.L2Data = {
    TYPE_LABELS,
    TYPE_COLORS,
    SPECIES,
    SPECIES_IDS,
    CITIES,
    CITY_IDS,
    getEffectiveness,
    createMonster,
    grantXp,
    canEvolve,
    evolveMonster
  };
})(window);
