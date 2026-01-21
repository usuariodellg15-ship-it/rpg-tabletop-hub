// ============================================
// MesaHub Mock Creatures Data
// ============================================

import { SystemType } from './mockData';

export interface CreatureAction {
  id: string;
  name: string;
  description: string;
  damage?: string;
  attackBonus?: number;
  isReaction?: boolean;
}

export interface Creature {
  id: string;
  name: string;
  system: SystemType;
  type: string;
  cr?: number | string; // Challenge Rating for 5e, or level for others
  hp: number;
  maxHp: number;
  ac: number;
  description: string;
  imageUrl?: string;
  // Attributes
  str?: number;
  dex?: number;
  con?: number;
  int?: number;
  wis?: number;
  cha?: number;
  // Other stats
  speed?: string;
  skills?: string[];
  resistances?: string[];
  immunities?: string[];
  vulnerabilities?: string[];
  saves?: string[];
  senses?: string;
  languages?: string;
  // Actions
  actions: CreatureAction[];
  reactions?: CreatureAction[];
  legendaryActions?: CreatureAction[];
  tags?: string[];
}

export const creatures: Creature[] = [
  // 5e Creatures
  {
    id: 'creature-1',
    name: 'Goblin',
    system: '5e',
    type: 'Humanoide',
    cr: '1/4',
    hp: 7,
    maxHp: 7,
    ac: 15,
    description: 'Goblins são pequenas criaturas malignas que habitam masmorras e cavernas. Preferem emboscadas e ataques em grupo.',
    imageUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=goblin',
    str: 8,
    dex: 14,
    con: 10,
    int: 10,
    wis: 8,
    cha: 8,
    speed: '30 ft',
    skills: ['Furtividade +6'],
    senses: 'Visão no Escuro 60 ft',
    languages: 'Comum, Goblin',
    actions: [
      { id: 'act-1', name: 'Cimitarra', description: 'Ataque corpo a corpo: +4 para acertar, alcance 1,5m, um alvo.', damage: '1d6+2 cortante', attackBonus: 4 },
      { id: 'act-2', name: 'Arco Curto', description: 'Ataque à distância: +4 para acertar, alcance 24/96m, um alvo.', damage: '1d6+2 perfurante', attackBonus: 4 },
    ],
    reactions: [
      { id: 'react-1', name: 'Fuga Ágil', description: 'O goblin pode usar Desengajar ou Esconder como ação bônus.', isReaction: true },
    ],
    tags: ['humanoide', 'goblinoide', 'baixo nível'],
  },
  {
    id: 'creature-2',
    name: 'Esqueleto',
    system: '5e',
    type: 'Morto-vivo',
    cr: '1/4',
    hp: 13,
    maxHp: 13,
    ac: 13,
    description: 'Ossadas animadas por magia negra, esqueletos são soldados incansáveis que obedecem cegamente seus mestres.',
    imageUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=skeleton',
    str: 10,
    dex: 14,
    con: 15,
    int: 6,
    wis: 8,
    cha: 5,
    speed: '30 ft',
    vulnerabilities: ['Contundente'],
    immunities: ['Veneno', 'Exaustão'],
    senses: 'Visão no Escuro 60 ft',
    languages: 'Entende os idiomas que conhecia em vida',
    actions: [
      { id: 'act-3', name: 'Espada Curta', description: 'Ataque corpo a corpo: +4 para acertar, alcance 1,5m, um alvo.', damage: '1d6+2 perfurante', attackBonus: 4 },
      { id: 'act-4', name: 'Arco Curto', description: 'Ataque à distância: +4 para acertar, alcance 24/96m, um alvo.', damage: '1d6+2 perfurante', attackBonus: 4 },
    ],
    tags: ['morto-vivo', 'baixo nível'],
  },
  {
    id: 'creature-3',
    name: 'Orc',
    system: '5e',
    type: 'Humanoide',
    cr: '1/2',
    hp: 15,
    maxHp: 15,
    ac: 13,
    description: 'Orcs são guerreiros brutais e agressivos. Vivem para o combate e a conquista.',
    imageUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=orc',
    str: 16,
    dex: 12,
    con: 16,
    int: 7,
    wis: 11,
    cha: 10,
    speed: '30 ft',
    skills: ['Intimidação +2'],
    senses: 'Visão no Escuro 60 ft',
    languages: 'Comum, Orc',
    actions: [
      { id: 'act-5', name: 'Machado Grande', description: 'Ataque corpo a corpo: +5 para acertar, alcance 1,5m, um alvo.', damage: '1d12+3 cortante', attackBonus: 5 },
      { id: 'act-6', name: 'Javelin', description: 'Ataque à distância: +5 para acertar, alcance 9/36m, um alvo.', damage: '1d6+3 perfurante', attackBonus: 5 },
    ],
    reactions: [
      { id: 'react-2', name: 'Agressividade', description: 'Como reação, quando reduzido a 0 PV, o orc pode fazer um último ataque corpo a corpo.', isReaction: true },
    ],
    tags: ['humanoide', 'orcoide', 'médio nível'],
  },
  {
    id: 'creature-4',
    name: 'Dragão Jovem Negro',
    system: '5e',
    type: 'Dragão',
    cr: 7,
    hp: 127,
    maxHp: 127,
    ac: 18,
    description: 'Dragões negros são criaturas malignas que habitam pântanos. Seu sopro ácido pode derreter armaduras.',
    imageUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=blackdragon',
    str: 19,
    dex: 14,
    con: 17,
    int: 12,
    wis: 11,
    cha: 15,
    speed: '40 ft, voo 80 ft, natação 40 ft',
    saves: ['DES +5', 'CON +6', 'SAB +3', 'CAR +5'],
    skills: ['Percepção +6', 'Furtividade +5'],
    immunities: ['Ácido'],
    senses: 'Visão no Escuro 120 ft, Percepção Cega 30 ft',
    languages: 'Comum, Dracônico',
    actions: [
      { id: 'act-7', name: 'Mordida', description: 'Ataque corpo a corpo: +7 para acertar, alcance 3m, um alvo.', damage: '2d10+4 perfurante + 1d8 ácido', attackBonus: 7 },
      { id: 'act-8', name: 'Garras', description: 'Ataque corpo a corpo: +7 para acertar, alcance 1,5m, um alvo.', damage: '2d6+4 cortante', attackBonus: 7 },
      { id: 'act-9', name: 'Sopro Ácido', description: 'Linha de 9m x 1,5m. CD 14 DES para metade do dano.', damage: '11d8 ácido' },
    ],
    tags: ['dragão', 'chefe', 'alto nível'],
  },
  // Sistema Autoral - Velho Oeste
  {
    id: 'creature-5',
    name: 'Bandido',
    system: 'autoral',
    type: 'Humano',
    cr: 1,
    hp: 12,
    maxHp: 12,
    ac: 11,
    description: 'Fora-da-lei comum que assalta viajantes nas estradas empoeiradas do Velho Oeste.',
    imageUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=bandit',
    str: 11,
    dex: 12,
    con: 11,
    int: 10,
    wis: 10,
    cha: 10,
    speed: '9m',
    actions: [
      { id: 'act-10', name: 'Revólver', description: 'Ataque à distância: +3 para acertar, alcance 18m.', damage: '1d8 perfurante', attackBonus: 3 },
      { id: 'act-11', name: 'Faca', description: 'Ataque corpo a corpo: +2 para acertar.', damage: '1d4 cortante', attackBonus: 2 },
    ],
    tags: ['humano', 'baixo nível'],
  },
  {
    id: 'creature-6',
    name: 'Wendigo',
    system: 'autoral',
    type: 'Espírito',
    cr: 5,
    hp: 65,
    maxHp: 65,
    ac: 14,
    description: 'Espírito faminto das montanhas geladas. Seu uivo paralisa as vítimas de medo.',
    imageUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=wendigo',
    str: 18,
    dex: 16,
    con: 15,
    int: 8,
    wis: 14,
    cha: 7,
    speed: '12m',
    resistances: ['Frio', 'Perfurante de armas não-mágicas'],
    immunities: ['Medo'],
    actions: [
      { id: 'act-12', name: 'Garras Gélidas', description: 'Ataque corpo a corpo: +7 para acertar.', damage: '2d8+4 cortante + 1d6 frio', attackBonus: 7 },
      { id: 'act-13', name: 'Uivo Paralisante', description: 'Todos num raio de 18m devem fazer teste de Vontade CD 14 ou ficam Paralisados por 1 rodada.' },
      { id: 'act-14', name: 'Mordida Devoradora', description: 'Só em alvos paralisados. +7 para acertar.', damage: '3d10+4 perfurante', attackBonus: 7 },
    ],
    reactions: [
      { id: 'react-3', name: 'Regeneração', description: 'No início de cada turno, recupera 5 PV se não recebeu dano de fogo.', isReaction: true },
    ],
    tags: ['espírito', 'chefe', 'alto nível'],
  },
  {
    id: 'creature-7',
    name: 'Pistoleiro Fantasma',
    system: 'autoral',
    type: 'Morto-vivo',
    cr: 3,
    hp: 35,
    maxHp: 35,
    ac: 13,
    description: 'Espírito de um pistoleiro morto em duelo, condenado a vagar eternamente.',
    imageUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=ghostgunslinger',
    str: 6,
    dex: 18,
    con: 10,
    int: 10,
    wis: 12,
    cha: 14,
    speed: '0, voo 12m (pairar)',
    resistances: ['Ácido', 'Fogo', 'Relâmpago', 'Trovão'],
    immunities: ['Frio', 'Necrótico', 'Veneno'],
    actions: [
      { id: 'act-15', name: 'Tiro Fantasmagórico', description: 'Ataque à distância espectral: +6 para acertar, alcance 30m.', damage: '2d8+4 necrótico', attackBonus: 6 },
      { id: 'act-16', name: 'Toque Gélido', description: 'Ataque corpo a corpo: +6 para acertar.', damage: '1d10+4 frio', attackBonus: 6 },
    ],
    tags: ['morto-vivo', 'médio nível'],
  },
  // Horror Cósmico
  {
    id: 'creature-8',
    name: 'Profundo',
    system: 'horror',
    type: 'Aberração',
    cr: 2,
    hp: 25,
    maxHp: 25,
    ac: 12,
    description: 'Criaturas anfíbias híbridas de humanos e algo muito mais antigo. Habitam cidades submersas.',
    imageUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=deepone',
    str: 14,
    dex: 12,
    con: 14,
    int: 11,
    wis: 10,
    cha: 8,
    speed: '6m, natação 12m',
    resistances: ['Frio'],
    senses: 'Visão no Escuro 36m',
    languages: 'Profundo, Comum',
    actions: [
      { id: 'act-17', name: 'Garras', description: 'Ataque corpo a corpo: +4 para acertar.', damage: '1d8+2 cortante', attackBonus: 4 },
      { id: 'act-18', name: 'Lança', description: 'Ataque à distância: +3 para acertar, alcance 6/18m.', damage: '1d6+2 perfurante', attackBonus: 3 },
    ],
    tags: ['aberração', 'cthulhu', 'médio nível'],
  },
  {
    id: 'creature-9',
    name: 'Shoggoth',
    system: 'horror',
    type: 'Aberração',
    cr: 10,
    hp: 180,
    maxHp: 180,
    ac: 8,
    description: 'Massa amorfa de protoplasma negro com milhares de olhos e bocas. Servos rebeldes dos Antigos.',
    imageUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=shoggoth',
    str: 24,
    dex: 6,
    con: 22,
    int: 6,
    wis: 8,
    cha: 1,
    speed: '9m, natação 9m, escalada 9m',
    resistances: ['Ácido', 'Frio', 'Fogo'],
    immunities: ['Cego', 'Surdo', 'Exaustão', 'Agarrado'],
    senses: 'Sentido Cego 36m',
    actions: [
      { id: 'act-19', name: 'Pseudópode', description: 'Ataque corpo a corpo: +10 para acertar, alcance 4,5m.', damage: '3d10+7 contundente + 2d6 ácido', attackBonus: 10 },
      { id: 'act-20', name: 'Engolfar', description: 'O shoggoth tenta engolfar uma criatura Média ou menor. CD 17 DES para evitar. Engolfados sofrem 4d10 ácido no início de cada turno.' },
      { id: 'act-21', name: 'Tekeli-li!', description: 'Grito horrendo. Criaturas em 18m devem fazer teste de Sanidade (-1d10 SAN em falha).' },
    ],
    reactions: [
      { id: 'react-4', name: 'Regeneração', description: 'Recupera 10 PV no início de cada turno se não estiver a 0 PV.', isReaction: true },
    ],
    tags: ['aberração', 'cthulhu', 'chefe', 'alto nível'],
  },
  {
    id: 'creature-10',
    name: 'Cultista',
    system: 'horror',
    type: 'Humano',
    cr: '1/2',
    hp: 9,
    maxHp: 9,
    ac: 10,
    description: 'Membro de culto dedicado a entidades cósmicas. Fanaticamente leal.',
    imageUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=cultist',
    str: 10,
    dex: 10,
    con: 10,
    int: 10,
    wis: 11,
    cha: 10,
    speed: '9m',
    skills: ['Religião +2', 'Enganação +2'],
    languages: 'Comum, um idioma alienígena',
    actions: [
      { id: 'act-22', name: 'Adaga Ritual', description: 'Ataque corpo a corpo: +2 para acertar.', damage: '1d4 perfurante', attackBonus: 2 },
      { id: 'act-23', name: 'Invocação Sombria', description: 'O cultista canaliza energia sombria. Uma criatura a até 9m deve fazer teste de Sanidade (-1d4 SAN em falha).' },
    ],
    tags: ['humano', 'cultista', 'baixo nível'],
  },
];

export const getCreaturesBySystem = (system: SystemType): Creature[] => {
  return creatures.filter(c => c.system === system);
};
