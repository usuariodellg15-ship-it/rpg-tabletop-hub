// ============================================
// MesaHub Mock Items Catalog
// ============================================

import { SystemType } from './mockData';

export type ItemType = 'scroll' | 'weapon' | 'armor' | 'consumable' | 'misc';
export type ItemRarity = 'common' | 'uncommon' | 'rare' | 'very_rare' | 'legendary';

export interface CatalogItem {
  id: string;
  name: string;
  type: ItemType;
  system: SystemType;
  description: string;
  rarity: ItemRarity;
  weight: number; // in kg
  // Type-specific fields
  damage?: string;
  damageType?: string;
  healDice?: string;
  acBonus?: number;
  effect?: string;
  duration?: string;
  properties?: string[];
  tags?: string[];
}

export const itemCatalog: CatalogItem[] = [
  // 5e Items
  {
    id: 'cat-1',
    name: 'Espada Longa',
    type: 'weapon',
    system: '5e',
    description: 'Uma espada versátil, empunhável com uma ou duas mãos.',
    rarity: 'common',
    weight: 1.5,
    damage: '1d8',
    damageType: 'cortante',
    properties: ['Versátil (1d10)'],
    tags: ['arma', 'corpo-a-corpo'],
  },
  {
    id: 'cat-2',
    name: 'Arco Longo',
    type: 'weapon',
    system: '5e',
    description: 'Arco de guerra com grande alcance.',
    rarity: 'common',
    weight: 1,
    damage: '1d8',
    damageType: 'perfurante',
    properties: ['Distância (45/180)', 'Duas mãos', 'Pesada'],
    tags: ['arma', 'distância'],
  },
  {
    id: 'cat-3',
    name: 'Cota de Malha',
    type: 'armor',
    system: '5e',
    description: 'Armadura feita de anéis de metal entrelaçados.',
    rarity: 'common',
    weight: 25,
    acBonus: 16,
    properties: ['Força mínima 13', 'Desvantagem em Furtividade'],
    tags: ['armadura', 'pesada'],
  },
  {
    id: 'cat-4',
    name: 'Poção de Cura',
    type: 'consumable',
    system: '5e',
    description: 'Recupera pontos de vida ao beber.',
    rarity: 'common',
    weight: 0.25,
    healDice: '2d4+2',
    tags: ['consumível', 'cura'],
  },
  {
    id: 'cat-5',
    name: 'Poção de Cura Maior',
    type: 'consumable',
    system: '5e',
    description: 'Uma poção mais potente que recupera mais pontos de vida.',
    rarity: 'uncommon',
    weight: 0.25,
    healDice: '4d4+4',
    tags: ['consumível', 'cura'],
  },
  {
    id: 'cat-6',
    name: 'Pergaminho de Bola de Fogo',
    type: 'scroll',
    system: '5e',
    description: 'Um pergaminho contendo a magia Bola de Fogo de 3º nível.',
    rarity: 'rare',
    weight: 0.05,
    damage: '8d6',
    damageType: 'fogo',
    tags: ['pergaminho', 'magia', 'dano'],
  },
  {
    id: 'cat-7',
    name: 'Pergaminho de Curar Ferimentos',
    type: 'scroll',
    system: '5e',
    description: 'Um pergaminho contendo a magia Curar Ferimentos de 1º nível.',
    rarity: 'common',
    weight: 0.05,
    healDice: '1d8+3',
    tags: ['pergaminho', 'magia', 'cura'],
  },
  {
    id: 'cat-8',
    name: 'Ração (1 dia)',
    type: 'misc',
    system: '5e',
    description: 'Comida seca e preservada para viagem.',
    rarity: 'common',
    weight: 1,
    tags: ['suprimento', 'viagem'],
  },
  {
    id: 'cat-9',
    name: 'Corda de Cânhamo (15m)',
    type: 'misc',
    system: '5e',
    description: 'Corda resistente para escalada e amarração.',
    rarity: 'common',
    weight: 5,
    tags: ['equipamento', 'utilidade'],
  },
  // Sistema Autoral - Velho Oeste
  {
    id: 'cat-10',
    name: 'Revólver .45',
    type: 'weapon',
    system: 'autoral',
    description: 'Arma de fogo confiável do Velho Oeste.',
    rarity: 'common',
    weight: 1.2,
    damage: '1d10',
    damageType: 'perfurante',
    properties: ['Distância (18m)', '6 tiros'],
    tags: ['arma', 'distância', 'fogo'],
  },
  {
    id: 'cat-11',
    name: 'Espingarda de Caça',
    type: 'weapon',
    system: 'autoral',
    description: 'Espingarda de dois canos para caça ou defesa.',
    rarity: 'common',
    weight: 3.5,
    damage: '2d8',
    damageType: 'perfurante',
    properties: ['Distância (12m)', '2 tiros', 'Recarga'],
    tags: ['arma', 'distância', 'fogo'],
  },
  {
    id: 'cat-12',
    name: 'Faca Bowie',
    type: 'weapon',
    system: 'autoral',
    description: 'Grande faca de combate e sobrevivência.',
    rarity: 'common',
    weight: 0.5,
    damage: '1d6',
    damageType: 'cortante',
    properties: ['Arremesso (6m)'],
    tags: ['arma', 'corpo-a-corpo'],
  },
  {
    id: 'cat-13',
    name: 'Colete de Couro',
    type: 'armor',
    system: 'autoral',
    description: 'Colete reforçado que oferece alguma proteção.',
    rarity: 'common',
    weight: 3,
    acBonus: 2,
    tags: ['armadura', 'leve'],
  },
  {
    id: 'cat-14',
    name: 'Whisky (Garrafa)',
    type: 'consumable',
    system: 'autoral',
    description: 'Bebida forte. Acalma os nervos... ou os piora.',
    rarity: 'common',
    weight: 0.5,
    effect: '+1 em testes de Vontade por 1 hora, -1 em Agilidade',
    duration: '1 hora',
    tags: ['consumível', 'bebida'],
  },
  {
    id: 'cat-15',
    name: 'Kit de Primeiros Socorros',
    type: 'consumable',
    system: 'autoral',
    description: 'Bandagens e suprimentos médicos básicos.',
    rarity: 'common',
    weight: 2,
    healDice: '1d8',
    effect: 'Recupera PV e estabiliza um aliado',
    tags: ['consumível', 'cura'],
  },
  {
    id: 'cat-16',
    name: 'Dinamite',
    type: 'consumable',
    system: 'autoral',
    description: 'Explosivo poderoso. Manusear com cuidado.',
    rarity: 'uncommon',
    weight: 0.5,
    damage: '4d6',
    damageType: 'fogo',
    effect: 'Explosão em área de 6m',
    tags: ['consumível', 'explosivo'],
  },
  {
    id: 'cat-17',
    name: 'Munição (20 balas)',
    type: 'misc',
    system: 'autoral',
    description: 'Caixa de munição para revólver ou rifle.',
    rarity: 'common',
    weight: 0.5,
    tags: ['suprimento', 'munição'],
  },
  {
    id: 'cat-18',
    name: 'Sela de Cavalo',
    type: 'misc',
    system: 'autoral',
    description: 'Sela de qualidade para montaria.',
    rarity: 'common',
    weight: 12,
    tags: ['equipamento', 'montaria'],
  },
  // Horror Cósmico
  {
    id: 'cat-19',
    name: 'Revólver .32',
    type: 'weapon',
    system: 'horror',
    description: 'Arma pequena e discreta, comum entre detetives.',
    rarity: 'common',
    weight: 0.8,
    damage: '1d8',
    damageType: 'perfurante',
    properties: ['Distância (15m)', '6 tiros'],
    tags: ['arma', 'distância'],
  },
  {
    id: 'cat-20',
    name: 'Faca de Bolso',
    type: 'weapon',
    system: 'horror',
    description: 'Canivete comum, mais ferramenta que arma.',
    rarity: 'common',
    weight: 0.1,
    damage: '1d4',
    damageType: 'cortante',
    tags: ['arma', 'corpo-a-corpo'],
  },
  {
    id: 'cat-21',
    name: 'Laudanum',
    type: 'consumable',
    system: 'horror',
    description: 'Tintura de ópio medicinal. Alivia dor e acalma a mente.',
    rarity: 'uncommon',
    weight: 0.1,
    effect: 'Recupera 1d4 Sanidade, mas -10% em testes físicos por 4 horas',
    duration: '4 horas',
    tags: ['consumível', 'droga'],
  },
  {
    id: 'cat-22',
    name: 'Kit Médico',
    type: 'consumable',
    system: 'horror',
    description: 'Suprimentos médicos profissionais dos anos 1920.',
    rarity: 'common',
    weight: 2,
    healDice: '1d6+2',
    tags: ['consumível', 'cura'],
  },
  {
    id: 'cat-23',
    name: 'Lanterna',
    type: 'misc',
    system: 'horror',
    description: 'Lanterna a óleo. Ilumina a escuridão.',
    rarity: 'common',
    weight: 1,
    effect: 'Ilumina 9m por 6 horas',
    tags: ['equipamento', 'luz'],
  },
  {
    id: 'cat-24',
    name: 'Câmera Fotográfica',
    type: 'misc',
    system: 'horror',
    description: 'Câmera portátil para registrar evidências.',
    rarity: 'uncommon',
    weight: 2,
    tags: ['equipamento', 'investigação'],
  },
  {
    id: 'cat-25',
    name: 'Tomo Proibido',
    type: 'scroll',
    system: 'horror',
    description: 'Livro antigo com conhecimento proibido. Ler pode custar sua sanidade.',
    rarity: 'rare',
    weight: 1.5,
    effect: '+10% em Conhecimento Oculto, -1d10 Sanidade ao estudar',
    tags: ['pergaminho', 'oculto', 'perigoso'],
  },
  {
    id: 'cat-26',
    name: 'Amuleto de Proteção',
    type: 'misc',
    system: 'horror',
    description: 'Talismã antigo. Dizem que protege contra o mal.',
    rarity: 'rare',
    weight: 0.1,
    effect: '+5% em testes de resistência a efeitos sobrenaturais',
    tags: ['equipamento', 'proteção', 'oculto'],
  },
];

export const getRarityLabel = (rarity: ItemRarity): string => {
  switch (rarity) {
    case 'common': return 'Comum';
    case 'uncommon': return 'Incomum';
    case 'rare': return 'Raro';
    case 'very_rare': return 'Muito Raro';
    case 'legendary': return 'Lendário';
  }
};

export const getRarityColor = (rarity: ItemRarity): string => {
  switch (rarity) {
    case 'common': return 'text-gray-500';
    case 'uncommon': return 'text-green-500';
    case 'rare': return 'text-blue-500';
    case 'very_rare': return 'text-purple-500';
    case 'legendary': return 'text-amber-500';
  }
};

export const getItemTypeLabel = (type: ItemType): string => {
  switch (type) {
    case 'scroll': return 'Pergaminho';
    case 'weapon': return 'Arma';
    case 'armor': return 'Armadura';
    case 'consumable': return 'Consumível';
    case 'misc': return 'Item Geral';
  }
};

export const getItemsBySystem = (system: SystemType): CatalogItem[] => {
  return itemCatalog.filter(i => i.system === system);
};
