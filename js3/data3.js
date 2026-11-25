/* ================================================================
   LORENZO GAME 3 — Mew Shiny Mega, All Megas & 23 Giant Titan Bosses
   ================================================================ */
(function (global) {
  'use strict';

  const TYPE_LABELS = {
    fogo: 'Fogo', agua: 'Água', planta: 'Planta', eletrico: 'Elétrico',
    dragao: 'Dragão', lutador: 'Lutador', pedra: 'Pedra',
    fantasma: 'Fantasma', fada: 'Fada', psiquico: 'Psíquico', aco: 'Aço', normal: 'Normal'
  };

  const TYPE_COLORS = {
    fogo: '#ff5722', agua: '#0ea5e9', planta: '#22c55e', eletrico: '#facc15',
    dragao: '#818cf8', lutador: '#ef4444', pedra: '#a8a29e',
    fantasma: '#a855f7', fada: '#f472b6', psiquico: '#ec4899', aco: '#cbd5e1', normal: '#94a3b8'
  };

  const TYPE_CHART = {
    fogo:     { planta: 1.6, aco: 1.6, agua: 0.65, pedra: 0.65, dragao: 0.75 },
    agua:     { fogo: 1.6, pedra: 1.6, planta: 0.65, dragao: 0.75 },
    planta:   { agua: 1.6, pedra: 1.6, fogo: 0.65 },
    eletrico: { agua: 1.6, dragao: 0.75, eletrico: 0.7 },
    dragao:   { dragao: 1.6, fada: 0.55 },
    lutador:  { normal: 1.6, pedra: 1.6, aco: 1.6, fantasma: 0.6 },
    pedra:    { fogo: 1.6, eletrico: 1.25, lutador: 0.65 },
    fantasma: { fantasma: 1.6, psiquico: 1.6, normal: 0.65 },
    fada:     { dragao: 1.7, lutador: 1.5, aco: 0.65 },
    psiquico: { lutador: 1.6, fantasma: 0.75 },
    aco:      { fada: 1.6, pedra: 1.6, fogo: 0.65 },
    normal:   { pedra: 0.7 }
  };

  function getEffectiveness(moveType, targetType) {
    const row = TYPE_CHART[moveType];
    if (!row || row[targetType] === undefined) return 1.0;
    return row[targetType];
  }

  // ================================================================
  // FULL ROSTER: MEW -> SHINY MEGA MEW + MEGAS + 23 GIANT BOSSES!
  // ================================================================
  const SPECIES = {
    // --- LINHA MEW -> MEWTWO -> MEGA MEWTWO -> SHINY MEGA MEW! ---
    mew: {
      id: 'mew', name: 'Mew', type: 'psiquico', stage: 1, isMega: false, evolvesTo: 'mewtwo',
      avatarClass: 'av-mew', ultimateName: 'SUPERNOVA GÊNESE DE MEW!',
      description: 'Pokémon mítico ancestral que carrega o DNA de todos os Pokémons! Evolui até SHINY MEGA MEW!',
      baseHp: 82, baseAtk: 26, baseDef: 24, catchRate: 0.44,
      moves: [
        { name: 'Psíquico Estelar', type: 'psiquico', power: 76, fx: 'psiquico' },
        { name: 'Esfera de Aura',   type: 'lutador',  power: 72, fx: 'lutador' },
        { name: 'Raio Metronomo',   type: 'eletrico', power: 68, fx: 'eletrico' },
        { name: 'Brilho Ancestral', type: 'psiquico', power: 0,  fx: 'heal', healPct: 0.48 }
      ]
    },
    mewtwo: {
      id: 'mewtwo', name: 'Mewtwo', type: 'psiquico', stage: 2, isMega: false, evolvesTo: 'megamewtwo',
      avatarClass: 'av-mewtwo', isGiantBoss: true, ultimateName: 'GOLPE PSÍQUICO APOCALÍPTICO!',
      description: 'Lendário psíquico de poder genético descomunal! Evolui para Mega Mewtwo e Shiny Mega Mew!',
      baseHp: 98, baseAtk: 34, baseDef: 26, catchRate: 0.34,
      moves: [
        { name: 'Golpe Psíquico', type: 'psiquico', power: 90, fx: 'psiquico' },
        { name: 'Bola Sombria',   type: 'fantasma', power: 82, fx: 'fantasma' },
        { name: 'Esfera de Aura', type: 'lutador',  power: 80, fx: 'lutador' },
        { name: 'Recuperação',    type: 'psiquico', power: 0,  fx: 'heal', healPct: 0.50 }
      ]
    },
    megamewtwo: {
      id: 'megamewtwo', name: 'Mega Mewtwo', type: 'psiquico', stage: 3, isMega: true, evolvesTo: 'shinymegamew',
      avatarClass: 'av-megamewtwo', ultimateName: 'COLAPSO MENTAL MEGA!',
      description: 'MEGA EVOLUÇÃO! Aperte E mais uma vez para transcender até a forma suprema SHINY MEGA MEW!',
      baseHp: 118, baseAtk: 44, baseDef: 32, catchRate: 0.28,
      moves: [
        { name: 'Psicocorte Mega', type: 'psiquico', power: 106, fx: 'psiquico' },
        { name: 'Pulso Cósmico',   type: 'fantasma', power: 98,  fx: 'fantasma' },
        { name: 'Hiper Aura',      type: 'lutador',  power: 94,  fx: 'lutador' },
        { name: 'Barreira Mega',   type: 'psiquico', power: 0,   fx: 'heal', healPct: 0.56 }
      ]
    },
    shinymegamew: {
      id: 'shinymegamew', name: 'Shiny Mega Mew', type: 'psiquico', stage: 5, isMega: true, isShiny: true, evolvesTo: null,
      avatarClass: 'av-shinymegamew', ultimateName: 'BIG BANG SHINY MEGA MEW!',
      description: '✨ FORMA SHINY MEGA SUPREMA! Mew azul-celeste brilhante com asas de cristal dourado e poder infinito!',
      baseHp: 145, baseAtk: 52, baseDef: 40, catchRate: 0.25,
      moves: [
        { name: 'Gênese Shiny X',  type: 'psiquico', power: 124, fx: 'psiquico' },
        { name: 'Estrela Prismática', type: 'fada',  power: 114, fx: 'fada' },
        { name: 'Meteoro Divino',  type: 'dragao',   power: 110, fx: 'dragao' },
        { name: 'Milagre Shiny',   type: 'psiquico', power: 0,   fx: 'heal', healPct: 0.68 }
      ]
    },

    // --- MIRAIDON -> MEGA MIRAIDON ---
    miraidon: {
      id: 'miraidon', name: 'Miraidon', type: 'eletrico', stage: 2, isMega: false, evolvesTo: 'megamiraidon',
      avatarClass: 'av-miraidon', ultimateName: 'ELETRO-DERIVA APOCALÍPTICA!',
      description: 'Dragão futurista de Paldea movido por propulsores de plasma elétrico!',
      baseHp: 84, baseAtk: 28, baseDef: 21, catchRate: 0.42,
      moves: [
        { name: 'Deriva Elétrica', type: 'eletrico', power: 78, fx: 'eletrico' },
        { name: 'Pulso do Dragão', type: 'dragao',   power: 74, fx: 'dragao' },
        { name: 'Turbo Plasma',    type: 'eletrico', power: 68, fx: 'eletrico' },
        { name: 'Sobrecarga Zero', type: 'eletrico', power: 0,  fx: 'heal', healPct: 0.45 }
      ]
    },
    megamiraidon: {
      id: 'megamiraidon', name: 'Mega Miraidon', type: 'eletrico', stage: 4, isMega: true, evolvesTo: null,
      avatarClass: 'av-megamiraidon', ultimateName: 'COLAPSO QUÂNTICO APEX!',
      description: 'FORMA MEGA APEX! Seus reatores de energia criam tempestades que partem o céu!',
      baseHp: 118, baseAtk: 42, baseDef: 31, catchRate: 0.30,
      moves: [
        { name: 'Super Deriva Mega', type: 'eletrico', power: 108, fx: 'eletrico' },
        { name: 'Meteoro Quântico',  type: 'dragao',   power: 102, fx: 'dragao' },
        { name: 'Hiper Relâmpago',   type: 'eletrico', power: 92,  fx: 'eletrico' },
        { name: 'Núcleo Infinito',   type: 'eletrico', power: 0,   fx: 'heal', healPct: 0.55 }
      ]
    },

    // --- KORAIDON (KURAIDON!) -> MEGA KORAIDON ---
    koraidon: {
      id: 'koraidon', name: 'Koraidon', type: 'dragao', stage: 2, isMega: false, evolvesTo: 'megakoraidon',
      avatarClass: 'av-koraidon', isGiantBoss: true, ultimateName: 'COLISÃO ESCARLATE TOTAL!',
      description: 'Rei dragão ancestral de Paldea e Chefe Titã Gigante da Arena 3 vs 1!',
      baseHp: 88, baseAtk: 30, baseDef: 23, catchRate: 0.42,
      moves: [
        { name: 'Curso Colisão',   type: 'lutador', power: 82, fx: 'lutador' },
        { name: 'Garra Ancestral', type: 'dragao',  power: 78, fx: 'dragao' },
        { name: 'Chama Solar',     type: 'fogo',    power: 72, fx: 'fogo' },
        { name: 'Rugido Primevo',  type: 'dragao',  power: 0,  fx: 'heal', healPct: 0.45 }
      ]
    },
    megakoraidon: {
      id: 'megakoraidon', name: 'Mega Koraidon', type: 'dragao', stage: 4, isMega: true, evolvesTo: null,
      avatarClass: 'av-megakoraidon', ultimateName: 'IMPACTO PRIMEVO DESTRUIDOR!',
      description: 'FORMA MEGA ESCARLATE! Suas plumas solares ardem como um meteoro pré-histórico!',
      baseHp: 122, baseAtk: 44, baseDef: 32, catchRate: 0.30,
      moves: [
        { name: 'Colisão Suprema', type: 'lutador', power: 110, fx: 'lutador' },
        { name: 'Fúria Escarlate', type: 'dragao',  power: 104, fx: 'dragao' },
        { name: 'Explosão Solar',  type: 'fogo',    power: 94,  fx: 'fogo' },
        { name: 'Vigor Ancestral', type: 'dragao',  power: 0,   fx: 'heal', healPct: 0.55 }
      ]
    },

    // --- SNORLAX -> MEGA SNORLAX ---
    snorlax: {
      id: 'snorlax', name: 'Snorlax', type: 'normal', stage: 2, isMega: false, evolvesTo: 'megasnorlax',
      avatarClass: 'av-snorlax', ultimateName: 'TERREMOTO GIGANTE SNORLAX!',
      description: 'Gigante adormecido com HP colossal! Evolui para Mega Snorlax Gigamax!',
      baseHp: 108, baseAtk: 25, baseDef: 24, catchRate: 0.46,
      moves: [
        { name: 'Impacto Pesado', type: 'normal',  power: 76, fx: 'normal' },
        { name: 'Terremoto',      type: 'pedra',   power: 74, fx: 'pedra' },
        { name: 'Soco Megaton',   type: 'lutador', power: 68, fx: 'lutador' },
        { name: 'Soneca Total',   type: 'normal',  power: 0,  fx: 'heal', healPct: 0.55 }
      ]
    },
    megasnorlax: {
      id: 'megasnorlax', name: 'Mega Snorlax', type: 'normal', stage: 4, isMega: true, evolvesTo: null,
      avatarClass: 'av-megasnorlax', ultimateName: 'CATACLISMO GIGAMAX!',
      description: 'MEGA GIGAMAX! Uma ilha com árvore gigante cresceu em sua barriga colossal!',
      baseHp: 155, baseAtk: 38, baseDef: 36, catchRate: 0.32,
      moves: [
        { name: 'Queda Continental', type: 'normal', power: 108, fx: 'pedra' },
        { name: 'Giga Terremoto',    type: 'pedra',  power: 100, fx: 'pedra' },
        { name: 'Hiper Raio Titã',   type: 'normal', power: 94,  fx: 'eletrico' },
        { name: 'Banquete Mega',     type: 'normal', power: 0,   fx: 'heal', healPct: 0.65 }
      ]
    },

    // --- AERODACTYL -> MEGA AERODACTYL ---
    aerodactyl: {
      id: 'aerodactyl', name: 'Aerodactyl', type: 'pedra', stage: 2, isMega: false, evolvesTo: 'megaaerodactyl',
      avatarClass: 'av-aerodactyl', ultimateName: 'CHUVA DE METEOROS JURÁSSICA!',
      description: 'Predador alado pré-histórico dos céus! Evolui para Mega Aerodactyl!',
      baseHp: 76, baseAtk: 28, baseDef: 19, catchRate: 0.46,
      moves: [
        { name: 'Deslizamento Rocha', type: 'pedra',  power: 76, fx: 'pedra' },
        { name: 'Presa de Dragão',    type: 'dragao', power: 72, fx: 'dragao' },
        { name: 'Asa Supersônica',    type: 'normal', power: 66, fx: 'normal' },
        { name: 'Pouso Ancestral',    type: 'pedra',  power: 0,  fx: 'heal', healPct: 0.44 }
      ]
    },
    megaaerodactyl: {
      id: 'megaaerodactyl', name: 'Mega Aerodactyl', type: 'pedra', stage: 4, isMega: true, evolvesTo: null,
      avatarClass: 'av-megaaerodactyl', ultimateName: 'EXTINÇÃO METEORO MEGA!',
      description: 'MEGA EVOLUÇÃO! Espinhos de rocha cristalina brotaram em suas asas!',
      baseHp: 108, baseAtk: 42, baseDef: 29, catchRate: 0.30,
      moves: [
        { name: 'Tempestade Meteoro', type: 'pedra',  power: 106, fx: 'pedra' },
        { name: 'Mordida Obsidiana',  type: 'dragao', power: 98,  fx: 'dragao' },
        { name: 'Rasante Fóssil',     type: 'pedra',  power: 90,  fx: 'pedra' },
        { name: 'Couraça Cristalina', type: 'pedra',  power: 0,   fx: 'heal', healPct: 0.52 }
      ]
    },

    // --- LUCARIO -> MEGA LUCARIO ---
    lucario: {
      id: 'lucario', name: 'Lucario', type: 'lutador', stage: 2, isMega: false, evolvesTo: 'megalucario',
      avatarClass: 'av-lucario', ultimateName: 'ESFERA DE AURA COLOSSAL!',
      description: 'Mestre guerreiro que molda a Aura! Evolui para Mega Lucario!',
      baseHp: 76, baseAtk: 29, baseDef: 20, catchRate: 0.46,
      moves: [
        { name: 'Esfera de Aura',  type: 'lutador',  power: 78, fx: 'lutador' },
        { name: 'Combate Próximo', type: 'lutador',  power: 84, fx: 'lutador' },
        { name: 'Pulso Metálico',  type: 'aco',      power: 70, fx: 'aco' },
        { name: 'Meditação Aura',  type: 'lutador',  power: 0,  fx: 'heal', healPct: 0.45 }
      ]
    },
    megalucario: {
      id: 'megalucario', name: 'Mega Lucario', type: 'lutador', stage: 4, isMega: true, evolvesTo: null,
      avatarClass: 'av-megalucario', ultimateName: 'MEGA AURA SUPER-NOVA!',
      description: 'MEGA EVOLUÇÃO! Sua aura transborda em marcas carmesins e punhos energizados!',
      baseHp: 108, baseAtk: 44, baseDef: 29, catchRate: 0.30,
      moves: [
        { name: 'Mega Esfera Aura', type: 'lutador', power: 110, fx: 'lutador' },
        { name: 'Fúria Escarlate',  type: 'lutador', power: 102, fx: 'fogo' },
        { name: 'Soco Meteoro',     type: 'aco',     power: 94,  fx: 'aco' },
        { name: 'Despertar Aura',   type: 'lutador', power: 0,   fx: 'heal', healPct: 0.54 }
      ]
    },

    // --- FROAKIE -> GRENINJA -> MEGA GRENINJA ---
    froakie: {
      id: 'froakie', name: 'Froakie', type: 'agua', stage: 1, isMega: false, evolvesTo: 'greninja',
      avatarClass: 'av-froakie', ultimateName: 'TSUNAMI BOLHA NINJA!',
      description: 'Sapo ninja ágil que evolui até Greninja e Mega Ash-Greninja!',
      baseHp: 54, baseAtk: 18, baseDef: 13, catchRate: 0.60,
      moves: [
        { name: 'Ataque Rápido', type: 'normal', power: 38, fx: 'normal' },
        { name: 'Pulso d’Água',  type: 'agua',   power: 52, fx: 'agua' },
        { name: 'Estrela Bolha', type: 'agua',   power: 60, fx: 'agua' },
        { name: 'Espuma Ninja',  type: 'agua',   power: 0,  fx: 'heal', healPct: 0.40 }
      ]
    },
    greninja: {
      id: 'greninja', name: 'Greninja', type: 'agua', stage: 3, isMega: false, evolvesTo: 'megagreninja',
      avatarClass: 'av-greninja', ultimateName: 'SHURIKEN D’ÁGUA GIGANTE!',
      description: 'Ninja aquático ultraveloz que cria lâminas shuriken de água pressurizada!',
      baseHp: 80, baseAtk: 30, baseDef: 19, catchRate: 0.42,
      moves: [
        { name: 'Shuriken d’Água', type: 'agua',     power: 80, fx: 'agua' },
        { name: 'Corte Noturno',   type: 'fantasma', power: 74, fx: 'fantasma' },
        { name: 'Hidro Bomba',     type: 'agua',     power: 86, fx: 'agua' },
        { name: 'Clone das Águas', type: 'agua',     power: 0,  fx: 'heal', healPct: 0.45 }
      ]
    },
    megagreninja: {
      id: 'megagreninja', name: 'Mega Greninja', type: 'agua', stage: 4, isMega: true, evolvesTo: null,
      avatarClass: 'av-megagreninja', ultimateName: 'MEGA SHURIKEN MAREMOTO!',
      description: 'FORMA MEGA ASH-GRENINJA! Carrega uma gigantesca Shuriken de Água girando nas costas!',
      baseHp: 112, baseAtk: 44, baseDef: 28, catchRate: 0.30,
      moves: [
        { name: 'Mega Shuriken X', type: 'agua',     power: 112, fx: 'agua' },
        { name: 'Lâmina Sombria',  type: 'fantasma', power: 98,  fx: 'fantasma' },
        { name: 'Tsunami Ninja',   type: 'agua',     power: 96,  fx: 'agua' },
        { name: 'Vínculo Supremo', type: 'agua',     power: 0,   fx: 'heal', healPct: 0.55 }
      ]
    },

    // --- CHARMANDER -> CHARMELEON -> CHARIZARD -> MEGA CHARIZARD X ---
    charmander: {
      id: 'charmander', name: 'Charmander', type: 'fogo', stage: 1, isMega: false, evolvesTo: 'charmeleon',
      avatarClass: 'av-charmander', ultimateName: 'TEMPESTADE DE BRASAS!',
      description: 'Clássico inicial de fogo que evolui até Mega Charizard X!',
      baseHp: 52, baseAtk: 17, baseDef: 12, catchRate: 0.60,
      moves: [
        { name: 'Arranhão',      type: 'normal', power: 38, fx: 'normal' },
        { name: 'Brasas',        type: 'fogo',   power: 48, fx: 'fogo' },
        { name: 'Presa de Fogo', type: 'fogo',   power: 60, fx: 'fogo' },
        { name: 'Chama Vital',   type: 'fogo',   power: 0,  fx: 'heal', healPct: 0.38 }
      ]
    },
    charmeleon: {
      id: 'charmeleon', name: 'Charmeleon', type: 'fogo', stage: 2, isMega: false, evolvesTo: 'charizard',
      avatarClass: 'av-charmeleon', ultimateName: 'FURACÃO DE FOGO!',
      description: 'Evolução ardente de Charmander a caminho de Charizard!',
      baseHp: 68, baseAtk: 22, baseDef: 15, catchRate: 0.48,
      moves: [
        { name: 'Lança-Chamas', type: 'fogo',   power: 68, fx: 'fogo' },
        { name: 'Garra Dragão', type: 'dragao', power: 64, fx: 'dragao' },
        { name: 'Corte Brasa',  type: 'normal', power: 54, fx: 'normal' },
        { name: 'Fogo Interior',type: 'fogo',   power: 0,  fx: 'heal', healPct: 0.42 }
      ]
    },
    charizard: {
      id: 'charizard', name: 'Charizard', type: 'fogo', stage: 3, isMega: false, evolvesTo: 'megacharizard',
      avatarClass: 'av-charizard', ultimateName: 'EXPLOSÃO SOLAR DRAGÃO!',
      description: 'Icônico dragão de fogo! Evolui para MEGA CHARIZARD X!',
      baseHp: 90, baseAtk: 31, baseDef: 21, catchRate: 0.40,
      moves: [
        { name: 'Explosão de Fogo', type: 'fogo',   power: 88, fx: 'fogo' },
        { name: 'Fúria do Dragão',  type: 'dragao', power: 80, fx: 'dragao' },
        { name: 'Lança-Chamas',     type: 'fogo',   power: 76, fx: 'fogo' },
        { name: 'Asas de Brasa',    type: 'fogo',   power: 0,  fx: 'heal', healPct: 0.46 }
      ]
    },
    megacharizard: {
      id: 'megacharizard', name: 'Mega Charizard X', type: 'dragao', stage: 4, isMega: true, evolvesTo: null,
      avatarClass: 'av-megacharizard', ultimateName: 'INFERNO AZUL MEGA X!',
      description: 'MEGA CHARIZARD X! Escamas negras, chamas azuis incandescentes e poder Fogo/Dragão!',
      baseHp: 122, baseAtk: 45, baseDef: 32, catchRate: 0.30,
      moves: [
        { name: 'Chama Azul X',     type: 'fogo',   power: 112, fx: 'eletrico' },
        { name: 'Meteoro Dragão X', type: 'dragao', power: 106, fx: 'dragao' },
        { name: 'Explosão Infernal',type: 'fogo',   power: 98,  fx: 'fogo' },
        { name: 'Regeneração Azul', type: 'dragao', power: 0,   fx: 'heal', healPct: 0.56 }
      ]
    },

    // --- CERULEDGE / CINDERACE / TINKATON / PIKACHU ---
    ceruledge: {
      id: 'ceruledge', name: 'Ceruledge', type: 'fantasma', stage: 2, isMega: false, evolvesTo: 'megaceruledge',
      avatarClass: 'av-ceruledge', ultimateName: 'ESPADAS FANTASMAS DO ABISMO!',
      description: 'Cavaleiro sombrio de Paldea armado com duas espadas espectrais!',
      baseHp: 80, baseAtk: 31, baseDef: 20, catchRate: 0.44,
      moves: [
        { name: 'Lâmina Amarga',   type: 'fogo',     power: 82, fx: 'fogo' },
        { name: 'Corte Espectral', type: 'fantasma', power: 78, fx: 'fantasma' },
        { name: 'Chama Violeta',   type: 'fantasma', power: 70, fx: 'fantasma' },
        { name: 'Armadura Sombria',type: 'fantasma', power: 0,  fx: 'heal', healPct: 0.46 }
      ]
    },
    megaceruledge: {
      id: 'megaceruledge', name: 'Mega Ceruledge', type: 'fantasma', stage: 4, isMega: true, evolvesTo: null,
      avatarClass: 'av-megaceruledge', ultimateName: 'JULGAMENTO DAS LÂMINAS MEGA!',
      description: 'MEGA EVOLUÇÃO! Suas lâminas viram espadas gigantes de plasma violeta!',
      baseHp: 114, baseAtk: 45, baseDef: 29, catchRate: 0.30,
      moves: [
        { name: 'Espada Abissal',  type: 'fantasma', power: 112, fx: 'fantasma' },
        { name: 'Inferno Carmesim',type: 'fogo',     power: 104, fx: 'fogo' },
        { name: 'Corte Dimensional',type: 'fantasma',power: 96,  fx: 'dragao' },
        { name: 'Chama Imortal',   type: 'fantasma', power: 0,   fx: 'heal', healPct: 0.55 }
      ]
    },
    cinderace: {
      id: 'cinderace', name: 'Cinderace', type: 'fogo', stage: 3, isMega: false, evolvesTo: 'megacinderace',
      avatarClass: 'av-cinderace', ultimateName: 'SUPER PIRO-BOLA ESTELAR!',
      description: 'Craque de fogo de Galar que chuta bolas de fogo supersônicas!',
      baseHp: 82, baseAtk: 30, baseDef: 19, catchRate: 0.44,
      moves: [
        { name: 'Piro-Bola',       type: 'fogo',    power: 86, fx: 'fogo' },
        { name: 'Chute Flamejante',type: 'lutador', power: 76, fx: 'lutador' },
        { name: 'Arrancada Solar', type: 'fogo',    power: 70, fx: 'fogo' },
        { name: 'Aquecimento Pro', type: 'fogo',    power: 0,  fx: 'heal', healPct: 0.45 }
      ]
    },
    megacinderace: {
      id: 'megacinderace', name: 'Mega Cinderace', type: 'fogo', stage: 4, isMega: true, evolvesTo: null,
      avatarClass: 'av-megacinderace', ultimateName: 'SUPERNOVA GIGAMAX DE FOGO!',
      description: 'MEGA GIGAMAX! Flutua com uma esfera solar gigante pronta para detonar!',
      baseHp: 114, baseAtk: 44, baseDef: 28, catchRate: 0.30,
      moves: [
        { name: 'Giga Piro-Bola', type: 'fogo',    power: 112, fx: 'fogo' },
        { name: 'Chute Meteoro',  type: 'lutador', power: 102, fx: 'lutador' },
        { name: 'Vórtice Solar',  type: 'fogo',    power: 94,  fx: 'fogo' },
        { name: 'Fôlego Campeão', type: 'fogo',    power: 0,   fx: 'heal', healPct: 0.55 }
      ]
    },
    tinkaton: {
      id: 'tinkaton', name: 'Tinkaton', type: 'fada', stage: 3, isMega: false, evolvesTo: 'megatinkaton',
      avatarClass: 'av-tinkaton', ultimateName: 'MARTELO GIGATON DESTRUIDOR!',
      description: 'Guerreira cor-de-rosa de Paldea com um martelo de aço de 100 quilos!',
      baseHp: 84, baseAtk: 28, baseDef: 23, catchRate: 0.44,
      moves: [
        { name: 'Martelo Gigaton', type: 'aco',  power: 88, fx: 'aco' },
        { name: 'Brilho Fada',     type: 'fada', power: 76, fx: 'fada' },
        { name: 'Impacto Estelar', type: 'fada', power: 72, fx: 'fada' },
        { name: 'Forja Mágica',    type: 'fada', power: 0,  fx: 'heal', healPct: 0.46 }
      ]
    },
    megatinkaton: {
      id: 'megatinkaton', name: 'Mega Tinkaton', type: 'fada', stage: 4, isMega: true, evolvesTo: null,
      avatarClass: 'av-megatinkaton', ultimateName: 'COLAPSO DO MARTELO TITÂNICO!',
      description: 'MEGA EVOLUÇÃO! Martelo dourado gigante com energia cósmica!',
      baseHp: 116, baseAtk: 42, baseDef: 33, catchRate: 0.30,
      moves: [
        { name: 'Mega Gigaton X', type: 'aco',  power: 114, fx: 'aco' },
        { name: 'Explosão Fada',  type: 'fada', power: 102, fx: 'fada' },
        { name: 'Forja Estelar',  type: 'fada', power: 94,  fx: 'fada' },
        { name: 'Escudo Mágico',  type: 'fada', power: 0,   fx: 'heal', healPct: 0.55 }
      ]
    },
    pikachu: {
      id: 'pikachu', name: 'Pikachu', type: 'eletrico', stage: 1, isMega: false, evolvesTo: 'megaraichu',
      avatarClass: 'av-pikachu', ultimateName: 'MILHÃO DE VOLTS SUPREMO!',
      description: 'O lendário Pikachu! Evolui direto para Mega Raichu!',
      baseHp: 58, baseAtk: 20, baseDef: 14, catchRate: 0.60,
      moves: [
        { name: 'Choque do Trovão', type: 'eletrico', power: 58, fx: 'eletrico' },
        { name: 'Esfera Elétrica',  type: 'eletrico', power: 70, fx: 'eletrico' },
        { name: 'Cauda de Ferro',   type: 'aco',      power: 64, fx: 'aco' },
        { name: 'Recarga Estática', type: 'eletrico', power: 0,  fx: 'heal', healPct: 0.42 }
      ]
    },
    megaraichu: {
      id: 'megaraichu', name: 'Mega Raichu', type: 'eletrico', stage: 4, isMega: true, evolvesTo: null,
      avatarClass: 'av-megaraichu', ultimateName: 'TEMPESTADE DE RAIOS MEGA!',
      description: 'MEGA EVOLUÇÃO! Cercado por arcos elétricos de alta voltagem!',
      baseHp: 106, baseAtk: 42, baseDef: 27, catchRate: 0.30,
      moves: [
        { name: 'Mega Trovão X',   type: 'eletrico', power: 108, fx: 'eletrico' },
        { name: 'Tempestade Neon', type: 'eletrico', power: 98,  fx: 'eletrico' },
        { name: 'Impacto Plasma',  type: 'normal',   power: 90,  fx: 'eletrico' },
        { name: 'Sobrecarga Vital',type: 'eletrico', power: 0,   fx: 'heal', healPct: 0.54 }
      ]
    },

    // ================================================================
    // 21 MORE GIANT TITAN ARENA BOSSES (+ KORAIDON & MEWTWO = 23 TOTAL!)
    // ================================================================
    salamence: {
      id: 'salamence', name: 'Salamence', type: 'dragao', stage: 3, isMega: false, isGiantBoss: true, evolvesTo: null,
      avatarClass: 'av-salamence', ultimateName: 'METEORO DRAGÃO SALAMENCE!',
      description: 'Dragão azul alado com enormes asas carmesins — Titã Gigante da Arena 3 vs 1!',
      baseHp: 96, baseAtk: 35, baseDef: 24, catchRate: 0.42,
      moves: [
        { name: 'Meteoro Dragão', type: 'dragao', power: 96, fx: 'dragao' },
        { name: 'Garra Aérea',    type: 'dragao', power: 84, fx: 'dragao' },
        { name: 'Lança-Chamas',   type: 'fogo',   power: 80, fx: 'fogo' },
        { name: 'Fúria Alada',    type: 'dragao', power: 0,  fx: 'heal', healPct: 0.46 }
      ]
    },
    kyogre: {
      id: 'kyogre', name: 'Kyogre', type: 'agua', stage: 4, isMega: false, isGiantBoss: true, evolvesTo: null,
      avatarClass: 'av-kyogre', ultimateName: 'PULSO PRIMORDIAL DOS OCEANOS!',
      description: 'Leviatã lendário criador dos mares com linhas rubras brilhantes — Chefe Titã Gigante!',
      baseHp: 112, baseAtk: 37, baseDef: 30, catchRate: 0.36,
      moves: [
        { name: 'Pulso Primordial', type: 'agua',     power: 102, fx: 'agua' },
        { name: 'Trovão Oceânico',  type: 'eletrico', power: 88,  fx: 'eletrico' },
        { name: 'Hidro Bomba',      type: 'agua',     power: 94,  fx: 'agua' },
        { name: 'Maré Ancestral',   type: 'agua',     power: 0,   fx: 'heal', healPct: 0.48 }
      ]
    },
    groudon: {
      id: 'groudon', name: 'Groudon', type: 'fogo', stage: 4, isMega: false, isGiantBoss: true, evolvesTo: null,
      avatarClass: 'av-groudon', ultimateName: 'LÂMINAS DO PRECIPÍCIO!',
      description: 'Titã lendário que ergueu os continentes com placas de magma incandescentes!',
      baseHp: 114, baseAtk: 38, baseDef: 32, catchRate: 0.36,
      moves: [
        { name: 'Lâmina Precipício', type: 'pedra', power: 102, fx: 'pedra' },
        { name: 'Erupção Solar',     type: 'fogo',  power: 96,  fx: 'fogo' },
        { name: 'Terremoto Titã',    type: 'pedra', power: 88,  fx: 'pedra' },
        { name: 'Força Tectônica',   type: 'fogo',  power: 0,   fx: 'heal', healPct: 0.48 }
      ]
    },
    rayquaza: {
      id: 'rayquaza', name: 'Rayquaza', type: 'dragao', stage: 4, isMega: false, isGiantBoss: true, evolvesTo: null,
      avatarClass: 'av-rayquaza', ultimateName: 'ASCENSÃO DO DRAGÃO!',
      description: 'Guardião esmeralda da camada de ozônio que domina os céus em tamanho colossal!',
      baseHp: 112, baseAtk: 40, baseDef: 28, catchRate: 0.35,
      moves: [
        { name: 'Ascensão Dragão', type: 'dragao',   power: 106, fx: 'dragao' },
        { name: 'Hiper Raio',      type: 'eletrico', power: 94,  fx: 'eletrico' },
        { name: 'Pulso Celeste',   type: 'dragao',   power: 88,  fx: 'dragao' },
        { name: 'Vento Esmeralda', type: 'dragao',   power: 0,   fx: 'heal', healPct: 0.48 }
      ]
    },
    garchomp: {
      id: 'garchomp', name: 'Garchomp', type: 'dragao', stage: 3, isMega: false, isGiantBoss: true, evolvesTo: null,
      avatarClass: 'av-garchomp', ultimateName: 'INVESTIDA DRAGÃO SÍSMICA!',
      description: 'Tubarão-dragão terrestre supersônico com foices afiadas nos braços!',
      baseHp: 104, baseAtk: 36, baseDef: 27, catchRate: 0.40,
      moves: [
        { name: 'Investida Dragão', type: 'dragao', power: 94, fx: 'dragao' },
        { name: 'Terremoto',        type: 'pedra',  power: 92, fx: 'pedra' },
        { name: 'Garra Carmesim',   type: 'dragao', power: 82, fx: 'dragao' },
        { name: 'Pele Áspera',      type: 'pedra',  power: 0,  fx: 'heal', healPct: 0.45 }
      ]
    },
    tyranitar: {
      id: 'tyranitar', name: 'Tyranitar', type: 'pedra', stage: 3, isMega: false, isGiantBoss: true, evolvesTo: null,
      avatarClass: 'av-tyranitar', ultimateName: 'CATACLISMO DE ROCHA!',
      description: 'Kaiju blindado capaz de derrubar montanhas inteiras com sua cauda!',
      baseHp: 108, baseAtk: 36, baseDef: 30, catchRate: 0.40,
      moves: [
        { name: 'Gume de Pedra',  type: 'pedra',    power: 96, fx: 'pedra' },
        { name: 'Triturar Sombrio', type: 'fantasma', power: 86, fx: 'fantasma' },
        { name: 'Hiper Impacto',  type: 'normal',   power: 88, fx: 'normal' },
        { name: 'Couraça Rocha',  type: 'pedra',    power: 0,  fx: 'heal', healPct: 0.46 }
      ]
    },
    metagross: {
      id: 'metagross', name: 'Metagross', type: 'aco', stage: 3, isMega: false, isGiantBoss: true, evolvesTo: null,
      avatarClass: 'av-metagross', ultimateName: 'IMPACTO METEORO METÁLICO!',
      description: 'Supercomputador de aço com 4 patas e um enorme X prateado no rosto!',
      baseHp: 102, baseAtk: 36, baseDef: 32, catchRate: 0.40,
      moves: [
        { name: 'Soco Meteoro',    type: 'aco',      power: 96, fx: 'aco' },
        { name: 'Cabeçada Zen',    type: 'psiquico', power: 86, fx: 'psiquico' },
        { name: 'Canhão Flash',    type: 'aco',      power: 84, fx: 'aco' },
        { name: 'Blindagem Total', type: 'aco',      power: 0,  fx: 'heal', healPct: 0.48 }
      ]
    },
    hydreigon: {
      id: 'hydreigon', name: 'Hydreigon', type: 'dragao', stage: 3, isMega: false, isGiantBoss: true, evolvesTo: null,
      avatarClass: 'av-hydreigon', ultimateName: 'TRI-PULSO DAS TREVAS!',
      description: 'Dragão hidra de três cabeças com seis asas sombrias devastadoras!',
      baseHp: 100, baseAtk: 36, baseDef: 26, catchRate: 0.40,
      moves: [
        { name: 'Pulso Sombrio',  type: 'fantasma', power: 92, fx: 'fantasma' },
        { name: 'Meteoro Triplo', type: 'dragao',   power: 98, fx: 'dragao' },
        { name: 'Explosão Fogo',  type: 'fogo',     power: 86, fx: 'fogo' },
        { name: 'Aura Hidra',     type: 'fantasma', power: 0,  fx: 'heal', healPct: 0.46 }
      ]
    },
    dialga: {
      id: 'dialga', name: 'Dialga', type: 'aco', stage: 4, isMega: false, isGiantBoss: true, evolvesTo: null,
      avatarClass: 'av-dialga', ultimateName: 'RUGIDO DO TEMPO!',
      description: 'Dragão lendário de aço que controla o fluxo do próprio tempo!',
      baseHp: 112, baseAtk: 38, baseDef: 32, catchRate: 0.36,
      moves: [
        { name: 'Rugido do Tempo', type: 'dragao', power: 106, fx: 'dragao' },
        { name: 'Canhão Diamante', type: 'aco',    power: 94,  fx: 'aco' },
        { name: 'Pulso Temporal',  type: 'dragao', power: 88,  fx: 'eletrico' },
        { name: 'Rebobinar',       type: 'aco',    power: 0,   fx: 'heal', healPct: 0.50 }
      ]
    },
    palkia: {
      id: 'palkia', name: 'Palkia', type: 'agua', stage: 4, isMega: false, isGiantBoss: true, evolvesTo: null,
      avatarClass: 'av-palkia', ultimateName: 'FENDA ESPACIAL!',
      description: 'Dragão lendário das dimensões capaz de rasgar o espaço-tempo!',
      baseHp: 110, baseAtk: 38, baseDef: 30, catchRate: 0.36,
      moves: [
        { name: 'Fenda Espacial', type: 'dragao', power: 104, fx: 'dragao' },
        { name: 'Hidro Pérola',   type: 'agua',   power: 96,  fx: 'agua' },
        { name: 'Corte Cósmico',  type: 'psiquico', power: 88, fx: 'psiquico' },
        { name: 'Dobra Espacial', type: 'agua',   power: 0,   fx: 'heal', healPct: 0.50 }
      ]
    },
    giratina: {
      id: 'giratina', name: 'Giratina', type: 'fantasma', stage: 4, isMega: false, isGiantBoss: true, evolvesTo: null,
      avatarClass: 'av-giratina', ultimateName: 'FORÇA SOMBRIA DA DISTORÇÃO!',
      description: 'Soberano do Mundo Distorcido com asas negras e armadura dourada!',
      baseHp: 120, baseAtk: 37, baseDef: 32, catchRate: 0.35,
      moves: [
        { name: 'Força Sombria',   type: 'fantasma', power: 104, fx: 'fantasma' },
        { name: 'Garra Distorção', type: 'dragao',   power: 94,  fx: 'dragao' },
        { name: 'Bola Abissal',    type: 'fantasma', power: 88,  fx: 'fantasma' },
        { name: 'Véu Distorcido',  type: 'fantasma', power: 0,   fx: 'heal', healPct: 0.50 }
      ]
    },
    zekrom: {
      id: 'zekrom', name: 'Zekrom', type: 'eletrico', stage: 4, isMega: false, isGiantBoss: true, evolvesTo: null,
      avatarClass: 'av-zekrom', ultimateName: 'GOLPE RAIO DE FUSÃO!',
      description: 'Dragão negro dos ideais com uma turbina elétrica azul na cauda!',
      baseHp: 112, baseAtk: 39, baseDef: 30, catchRate: 0.36,
      moves: [
        { name: 'Raio de Fusão',  type: 'eletrico', power: 104, fx: 'eletrico' },
        { name: 'Garra Trovão',   type: 'dragao',   power: 94,  fx: 'dragao' },
        { name: 'Turbina Plasma', type: 'eletrico', power: 90,  fx: 'eletrico' },
        { name: 'Gerador Negro',  type: 'eletrico', power: 0,   fx: 'heal', healPct: 0.48 }
      ]
    },
    reshiram: {
      id: 'reshiram', name: 'Reshiram', type: 'fogo', stage: 4, isMega: false, isGiantBoss: true, evolvesTo: null,
      avatarClass: 'av-reshiram', ultimateName: 'CHAMA AZUL DA VERDADE!',
      description: 'Dragão branco da verdade cuja turbina incendeia os céus!',
      baseHp: 112, baseAtk: 39, baseDef: 30, catchRate: 0.36,
      moves: [
        { name: 'Chama Fusão',   type: 'fogo',   power: 104, fx: 'fogo' },
        { name: 'Pulso Branco',  type: 'dragao', power: 94,  fx: 'dragao' },
        { name: 'Turbina Solar', type: 'fogo',   power: 90,  fx: 'fogo' },
        { name: 'Asas de Luz',   type: 'fogo',   power: 0,   fx: 'heal', healPct: 0.48 }
      ]
    },
    lugia: {
      id: 'lugia', name: 'Lugia', type: 'psiquico', stage: 4, isMega: false, isGiantBoss: true, evolvesTo: null,
      avatarClass: 'av-lugia', ultimateName: 'AEROEXPLOSÃO DOS MARES!',
      description: 'Guardião prateado dos oceanos capaz de criar tempestades de 40 dias!',
      baseHp: 118, baseAtk: 35, baseDef: 34, catchRate: 0.36,
      moves: [
        { name: 'Aeroexplosão',   type: 'psiquico', power: 100, fx: 'psiquico' },
        { name: 'Hidro Furacão',  type: 'agua',     power: 92,  fx: 'agua' },
        { name: 'Onda Psíquica',  type: 'psiquico', power: 86,  fx: 'psiquico' },
        { name: 'Recuperação',    type: 'psiquico', power: 0,   fx: 'heal', healPct: 0.54 }
      ]
    },
    hooh: {
      id: 'hooh', name: 'Ho-Oh', type: 'fogo', stage: 4, isMega: false, isGiantBoss: true, evolvesTo: null,
      avatarClass: 'av-hooh', ultimateName: 'FOGO SAGRADO DO ARCO-ÍRIS!',
      description: 'Fênix dourada lendária cujas penas brilham em sete cores celestiais!',
      baseHp: 116, baseAtk: 38, baseDef: 32, catchRate: 0.36,
      moves: [
        { name: 'Fogo Sagrado',   type: 'fogo', power: 104, fx: 'fogo' },
        { name: 'Pássaro Bravo',  type: 'fogo', power: 94,  fx: 'fogo' },
        { name: 'Luz Arco-Íris',  type: 'fada', power: 88,  fx: 'fada' },
        { name: 'Cinzas Eternas', type: 'fogo', power: 0,   fx: 'heal', healPct: 0.54 }
      ]
    },
    darkrai: {
      id: 'darkrai', name: 'Darkrai', type: 'fantasma', stage: 4, isMega: false, isGiantBoss: true, evolvesTo: null,
      avatarClass: 'av-darkrai', ultimateName: 'VAZIO SOMBRIO DO PESADELO!',
      description: 'Entidade mítica das sombras que emerge da escuridão total!',
      baseHp: 102, baseAtk: 39, baseDef: 27, catchRate: 0.38,
      moves: [
        { name: 'Vazio Sombrio',  type: 'fantasma', power: 102, fx: 'fantasma' },
        { name: 'Pulso Pesadelo', type: 'fantasma', power: 94,  fx: 'fantasma' },
        { name: 'Raio Sombrio',   type: 'psiquico', power: 86,  fx: 'psiquico' },
        { name: 'Névoa Noturna',  type: 'fantasma', power: 0,   fx: 'heal', healPct: 0.48 }
      ]
    },
    arceus: {
      id: 'arceus', name: 'Arceus', type: 'normal', stage: 5, isMega: false, isGiantBoss: true, evolvesTo: null,
      avatarClass: 'av-arceus', ultimateName: 'JULGAMENTO DIVINO DE ARCEUS!',
      description: 'O Pokémon Alfa criador do universo envolto em sua roda dourada celestial!',
      baseHp: 128, baseAtk: 42, baseDef: 36, catchRate: 0.34,
      moves: [
        { name: 'Julgamento',     type: 'normal',   power: 112, fx: 'fada' },
        { name: 'Hiper Raio Alfa',type: 'eletrico', power: 98,  fx: 'eletrico' },
        { name: 'Pulso Estelar',  type: 'psiquico', power: 94,  fx: 'psiquico' },
        { name: 'Benção Alfa',    type: 'normal',   power: 0,   fx: 'heal', healPct: 0.56 }
      ]
    },
    eternatus: {
      id: 'eternatus', name: 'Eternatus', type: 'dragao', stage: 5, isMega: false, isGiantBoss: true, evolvesTo: null,
      avatarClass: 'av-eternatus', ultimateName: 'CANHÃO ETERNAMAX!',
      description: 'Dragão cósmico de energia pura vindo de um meteoro ancestral!',
      baseHp: 126, baseAtk: 41, baseDef: 31, catchRate: 0.34,
      moves: [
        { name: 'Canhão Dinamax', type: 'dragao',   power: 110, fx: 'dragao' },
        { name: 'Feixe Eterno',   type: 'fantasma', power: 98,  fx: 'fantasma' },
        { name: 'Pulso Veneno',   type: 'fantasma', power: 90,  fx: 'fantasma' },
        { name: 'Núcleo Galar',   type: 'dragao',   power: 0,   fx: 'heal', healPct: 0.50 }
      ]
    },
    zacian: {
      id: 'zacian', name: 'Zacian', type: 'fada', stage: 4, isMega: false, isGiantBoss: true, evolvesTo: null,
      avatarClass: 'av-zacian', ultimateName: 'LÂMINA BEHEMOTH!',
      description: 'Lobo guerreiro coroado que empunha a lendária espada dourada!',
      baseHp: 108, baseAtk: 42, baseDef: 30, catchRate: 0.36,
      moves: [
        { name: 'Lâmina Behemoth', type: 'aco',     power: 108, fx: 'aco' },
        { name: 'Espada Fada',     type: 'fada',    power: 96,  fx: 'fada' },
        { name: 'Corte Sagrado',   type: 'lutador', power: 90,  fx: 'lutador' },
        { name: 'Postura Real',    type: 'fada',    power: 0,   fx: 'heal', healPct: 0.48 }
      ]
    },
    zamazenta: {
      id: 'zamazenta', name: 'Zamazenta', type: 'lutador', stage: 4, isMega: false, isGiantBoss: true, evolvesTo: null,
      avatarClass: 'av-zamazenta', ultimateName: 'IMPACTO BEHEMOTH!',
      description: 'Lobo guardião coroado protegido pelo indestrutível escudo real!',
      baseHp: 116, baseAtk: 37, baseDef: 36, catchRate: 0.36,
      moves: [
        { name: 'Impacto Behemoth', type: 'aco',     power: 104, fx: 'aco' },
        { name: 'Combate Real',     type: 'lutador', power: 96,  fx: 'lutador' },
        { name: 'Investida Escudo', type: 'aco',     power: 88,  fx: 'aco' },
        { name: 'Muralha Real',     type: 'lutador', power: 0,   fx: 'heal', healPct: 0.52 }
      ]
    },
    baxcalibur: {
      id: 'baxcalibur', name: 'Baxcalibur', type: 'dragao', stage: 3, isMega: false, isGiantBoss: true, evolvesTo: null,
      avatarClass: 'av-baxcalibur', ultimateName: 'INVESTIDA GLAIVE GLACIAL!',
      description: 'Dragão glacial de Paldea com uma lâmina dorsal gigante capaz de partir montanhas!',
      baseHp: 110, baseAtk: 39, baseDef: 28, catchRate: 0.40,
      moves: [
        { name: 'Investida Glaive', type: 'dragao', power: 104, fx: 'dragao' },
        { name: 'Sopro Glacial',    type: 'agua',   power: 92,  fx: 'agua' },
        { name: 'Terremoto Gelo',   type: 'pedra',  power: 86,  fx: 'pedra' },
        { name: 'Troca Térmica',    type: 'dragao', power: 0,   fx: 'heal', healPct: 0.46 }
      ]
    }
  };

  const SPECIES_IDS = Object.keys(SPECIES);

  // EXACTLY 23 GIANT TITAN ARENA BOSSES (Koraidon, Salamence, Kyogre + 20 more!)
  const GIANT_BOSS_IDS = [
    'koraidon', 'salamence', 'kyogre',
    'groudon', 'rayquaza', 'mewtwo', 'garchomp', 'tyranitar',
    'metagross', 'hydreigon', 'dialga', 'palkia', 'giratina',
    'zekrom', 'reshiram', 'lugia', 'hooh', 'darkrai',
    'arceus', 'eternatus', 'zacian', 'zamazenta', 'baxcalibur'
  ];

  // ================================================================
  // 5 CITIES (ALL FULL OF VARIED SPECIES TO TRIGGER 3-DIFFERENT RAIDS!)
  // ================================================================
  const CITIES = {
    mesagoza: {
      id: 'mesagoza', name: 'Praça Mesagoza', emoji: '🌆',
      skyColor: 0x60c8ff, fogColor: 0x93dcff, sunColor: 0xfffbeb,
      description: 'Grande cidade ensolarada de Paldea — encontre Mew, Pikachu, Snorlax, Tinkaton e Cinderace!',
      spawns: ['pikachu', 'charmander', 'froakie', 'tinkaton', 'snorlax', 'cinderace', 'mew', 'lucario'],
      levelRange: [12, 18]
    },
    neotokyo: {
      id: 'neotokyo', name: 'Neo Cyber Zero', emoji: '⚡',
      skyColor: 0x0b1026, fogColor: 0x1e1b4b, sunColor: 0x93c5fd,
      description: 'Metrópole futurista de alta tensão — Miraidon, Lucario, Ceruledge, Metagross e Mega Raichu!',
      spawns: ['miraidon', 'lucario', 'ceruledge', 'metagross', 'pikachu', 'tinkaton', 'megaraichu'],
      levelRange: [15, 22]
    },
    vulcanica: {
      id: 'vulcanica', name: 'Cratera Mega', emoji: '🌋',
      skyColor: 0x3b1212, fogColor: 0x6b1d14, sunColor: 0xfdba74,
      description: 'Fortaleza de obsidiana e rios de magma — Charizard, Cinderace, Ceruledge, Koraidon e Tyranitar!',
      spawns: ['charmander', 'charmeleon', 'charizard', 'cinderace', 'ceruledge', 'koraidon', 'tyranitar'],
      levelRange: [15, 23]
    },
    ninja: {
      id: 'ninja', name: 'Vila Ninja', emoji: '🌊',
      skyColor: 0x38bdf8, fogColor: 0x7dd3fc, sunColor: 0xfef9c3,
      description: 'Porto místico com canais de água — Greninja, Froakie, Snorlax, Lucario e Baxcalibur!',
      spawns: ['froakie', 'greninja', 'snorlax', 'lucario', 'baxcalibur', 'tinkaton', 'megagreninja'],
      levelRange: [14, 21]
    },
    prehistorico: {
      id: 'prehistorico', name: 'Santuário Mega', emoji: '⛰️',
      skyColor: 0x2e1065, fogColor: 0x4c1d95, sunColor: 0xfde68a,
      description: 'Ruínas antigas nos céus — Aerodactyl, Salamence, Garchomp, Mew, Miraidon e Koraidon!',
      spawns: ['aerodactyl', 'salamence', 'garchomp', 'mew', 'miraidon', 'koraidon', 'megaaerodactyl'],
      levelRange: [18, 26]
    }
  };

  const CITY_IDS = Object.keys(CITIES);

  function calcMaxHp(sp, level)  { return Math.round(sp.baseHp + (level - 1) * 8); }
  function calcAtk(sp, level)    { return Math.round(sp.baseAtk + (level - 1) * 2.6); }
  function calcDef(sp, level)    { return Math.round(sp.baseDef + (level - 1) * 2.1); }
  function xpForNextLevel(level) { return Math.round(45 + level * 24); }

  function createMonster(speciesId, level = 14) {
    const sp = SPECIES[speciesId] || SPECIES.mew;
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

  function createGiantBoss(speciesId, level = 24) {
    const mon = createMonster(speciesId, level);
    // Giant 3 vs 1 Boss scaling: huge raid HP pool!
    mon.normalMaxHp = mon.maxHp;
    mon.maxHp = Math.round(mon.maxHp * 3.1);
    mon.hp = mon.maxHp;
    mon.atk = Math.round(mon.atk * 1.15);
    mon.isGiantBossInstance = true;
    return mon;
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
      mon.hp = Math.min(mon.maxHp, mon.hp + (mon.maxHp - oldMax) + 10);
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
    mon.level = Math.max(mon.level + 3, nextSp.isShiny ? 35 : nextSp.isMega ? 25 : 18);
    mon.maxHp = calcMaxHp(nextSp, mon.level);
    mon.hp = mon.maxHp;
    mon.atk = calcAtk(nextSp, mon.level);
    mon.def = calcDef(nextSp, mon.level);
    mon.xpToNext = xpForNextLevel(mon.level);

    return {
      oldName,
      newName: nextSp.name,
      newSpeciesId: nextSp.id,
      isMega: !!nextSp.isMega,
      isShiny: !!nextSp.isShiny
    };
  }

  global.L3Data = {
    TYPE_LABELS,
    TYPE_COLORS,
    SPECIES,
    SPECIES_IDS,
    GIANT_BOSS_IDS,
    CITIES,
    CITY_IDS,
    getEffectiveness,
    createMonster,
    createGiantBoss,
    grantXp,
    canEvolve,
    evolveMonster
  };
})(window);
