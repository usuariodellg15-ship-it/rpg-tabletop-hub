// ============================================
// DiceHub Mock Data
// ============================================

export type SystemType = '5e' | 'autoral' | 'olho_da_morte' | 'horror';
export type ThemeType = 'neutral' | 'medieval' | 'wildwest' | 'cosmic';
export type UserRole = 'player' | 'gm' | 'admin';
export type CampaignRole = 'gm' | 'player';
export type CampaignStatus = 'active' | 'closed' | 'paused';
export type MembershipStatus = 'approved' | 'pending' | 'rejected';
export type HomebrewType = 'item' | 'creature' | 'spell' | 'class';
export type MissionStatus = 'active' | 'completed' | 'failed';
export type EventType = 'boss_fight' | 'death' | 'mission' | 'discovery' | 'npc_meeting' | 'level_up';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  bio: string;
  role: UserRole;
  createdAt: string;
}

export interface Campaign {
  id: string;
  name: string;
  description: string;
  system: SystemType;
  status: CampaignStatus;
  coverImage: string;
  code: string;
  isPublic: boolean;
  gmId: string;
  createdAt: string;
  lastActivity: string;
}

export interface CampaignMember {
  id: string;
  campaignId: string;
  userId: string;
  role: CampaignRole;
  status: MembershipStatus;
  joinedAt: string;
}

export interface Character {
  id: string;
  campaignId: string;
  userId: string;
  name: string;
  portrait: string;
  level: number;
  class: string;
  // 5e attributes
  strength?: number;
  dexterity?: number;
  constitution?: number;
  intelligence?: number;
  wisdom?: number;
  charisma?: number;
  // Autoral attributes
  forca?: number;
  agilidade?: number;
  vigor?: number;
  intelecto?: number;
  vontade?: number;
  presenca?: number;
  // Horror attributes
  horrorStr?: number;
  horrorDex?: number;
  horrorCon?: number;
  horrorInt?: number;
  horrorEdu?: number;
  horrorPow?: number;
  horrorApp?: number;
  horrorSiz?: number;
  sanity?: number;
  maxSanity?: number;
  // Common
  hp: number;
  maxHp: number;
  ac: number;
  conditions: string[];
  inventory: InventoryItem[];
  abilities: Ability[];
  notes: string;
  lastEditedBy?: string;
  lastEditedAt?: string;
}

export interface Mission {
  id: string;
  campaignId: string;
  title: string;
  description: string;
  status: MissionStatus;
  notes: string;
  objectives?: string[];
  rewards?: string;
  createdAt: string;
}

export interface CombatStats {
  oddsDealt: number;
  damageDealt: number;
  damageReceived: number;
  healingDone: number;
}

export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  description: string;
}

export interface Ability {
  id: string;
  name: string;
  description: string;
  uses?: number;
  maxUses?: number;
}

export interface Homebrew {
  id: string;
  name: string;
  type: HomebrewType;
  system: SystemType;
  authorId: string;
  description: string;
  stats: Record<string, string | number>;
  tags: string[];
  isPublic: boolean;
  rating: number;
  ratingCount: number;
  createdAt: string;
  imageUrl?: string;
}

export interface EnabledHomebrew {
  id: string;
  campaignId: string;
  homebrewId: string;
  enabledAt: string;
}

export interface DiceRoll {
  id: string;
  campaignId: string;
  userId: string;
  formula: string;
  result: number;
  details: string;
  timestamp: string;
}

export interface TimelineEvent {
  id: string;
  campaignId: string;
  title: string;
  description: string;
  type: EventType;
  tags: string[];
  date: string;
  attachments: string[];
}

// Mission interface moved above to avoid duplicate

export interface Encounter {
  id: string;
  campaignId: string;
  name: string;
  creatures: EncounterCreature[];
  isActive: boolean;
  createdAt: string;
}

export interface EncounterCreature {
  id: string;
  name: string;
  initiative: number;
  hp: number;
  maxHp: number;
  ac: number;
  conditions: string[];
  isPlayer: boolean;
  characterId?: string;
}

export interface AdminLog {
  id: string;
  action: string;
  targetType: 'user' | 'campaign' | 'homebrew';
  targetId: string;
  adminId: string;
  timestamp: string;
  details: string;
}

// ============================================
// MOCK DATA
// ============================================

export const users: User[] = [
  {
    id: 'user-1',
    name: 'Rodrigo Silveira',
    email: 'rodrigo@example.com',
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=rodrigo',
    bio: 'Mestre de RPG há 10 anos. Amo criar mundos e contar histórias épicas.',
    role: 'gm',
    createdAt: '2023-01-15',
  },
  {
    id: 'user-2',
    name: 'Marina Costa',
    email: 'marina@example.com',
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=marina',
    bio: 'Jogadora casual, adoro personagens com histórias profundas.',
    role: 'player',
    createdAt: '2023-03-20',
  },
  {
    id: 'user-3',
    name: 'Carlos Admin',
    email: 'carlos.admin@example.com',
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=carlos',
    bio: 'Administrador da plataforma.',
    role: 'admin',
    createdAt: '2022-06-01',
  },
  {
    id: 'user-4',
    name: 'Felipe Santos',
    email: 'felipe@example.com',
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=felipe',
    bio: 'Sempre jogando de bardo!',
    role: 'player',
    createdAt: '2023-05-10',
  },
  {
    id: 'user-5',
    name: 'Ana Rodrigues',
    email: 'ana@example.com',
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=ana',
    bio: 'Criadora de homebrew e entusiasta de sistemas autorais.',
    role: 'player',
    createdAt: '2023-02-28',
  },
];

export const campaigns: Campaign[] = [
  {
    id: 'campaign-1',
    name: 'A Maldição do Dragão Negro',
    description: 'Uma aventura épica onde heróis devem enfrentar a ameaça de um dragão negro ancestral que desperta de seu sono milenar. O reino de Valdoria nunca esteve em tanto perigo.',
    system: '5e',
    status: 'active',
    coverImage: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800',
    code: 'DRAGON23',
    isPublic: true,
    gmId: 'user-1',
    createdAt: '2023-06-01',
    lastActivity: '2024-01-10',
  },
  {
    id: 'campaign-2',
    name: 'Sangue nas Dunas',
    description: 'No deserto implacável de Red Mesa, pistoleiros, fora-da-lei e criaturas sombrias disputam territórios amaldiçoados. A ferrovia do demônio atravessa terras onde a morte é a única certeza.',
    system: 'autoral',
    status: 'active',
    coverImage: 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=800',
    code: 'WEST666',
    isPublic: true,
    gmId: 'user-1',
    createdAt: '2023-09-15',
    lastActivity: '2024-01-12',
  },
  {
    id: 'campaign-3',
    name: 'Os Segredos de Ravenloft',
    description: 'Uma campanha de horror gótico nos domínios sombrios de Barovia.',
    system: '5e',
    status: 'closed',
    coverImage: 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=800',
    code: 'RAVEN01',
    isPublic: false,
    gmId: 'user-4',
    createdAt: '2022-10-01',
    lastActivity: '2023-08-20',
  },
  {
    id: 'campaign-4',
    name: 'O Chamado de Cthulhu',
    description: 'Investigadores enfrentam horrores indescritíveis enquanto desvendam cultos e segredos proibidos em Arkham, 1925. A sanidade é um luxo que poucos podem manter.',
    system: 'horror',
    status: 'active',
    coverImage: 'https://images.unsplash.com/photo-1509248961725-aec71f47838f?w=800',
    code: 'CTHULHU',
    isPublic: true,
    gmId: 'user-1',
    createdAt: '2024-01-01',
    lastActivity: '2024-01-15',
  },
];

export const campaignMembers: CampaignMember[] = [
  // Campaign 1 - Dragão Negro
  { id: 'member-1', campaignId: 'campaign-1', userId: 'user-1', role: 'gm', status: 'approved', joinedAt: '2023-06-01' },
  { id: 'member-2', campaignId: 'campaign-1', userId: 'user-2', role: 'player', status: 'approved', joinedAt: '2023-06-02' },
  { id: 'member-3', campaignId: 'campaign-1', userId: 'user-4', role: 'player', status: 'approved', joinedAt: '2023-06-03' },
  { id: 'member-4', campaignId: 'campaign-1', userId: 'user-5', role: 'player', status: 'pending', joinedAt: '2024-01-05' },
  // Campaign 2 - Sangue nas Dunas
  { id: 'member-5', campaignId: 'campaign-2', userId: 'user-1', role: 'gm', status: 'approved', joinedAt: '2023-09-15' },
  { id: 'member-6', campaignId: 'campaign-2', userId: 'user-2', role: 'player', status: 'approved', joinedAt: '2023-09-16' },
  { id: 'member-7', campaignId: 'campaign-2', userId: 'user-5', role: 'player', status: 'approved', joinedAt: '2023-09-17' },
  // Campaign 3 - Ravenloft
  { id: 'member-8', campaignId: 'campaign-3', userId: 'user-4', role: 'gm', status: 'approved', joinedAt: '2022-10-01' },
  { id: 'member-9', campaignId: 'campaign-3', userId: 'user-2', role: 'player', status: 'approved', joinedAt: '2022-10-02' },
  // Campaign 4 - Cthulhu
  { id: 'member-10', campaignId: 'campaign-4', userId: 'user-1', role: 'gm', status: 'approved', joinedAt: '2024-01-01' },
  { id: 'member-11', campaignId: 'campaign-4', userId: 'user-2', role: 'player', status: 'approved', joinedAt: '2024-01-02' },
  { id: 'member-12', campaignId: 'campaign-4', userId: 'user-4', role: 'player', status: 'approved', joinedAt: '2024-01-03' },
];

export const characters: Character[] = [
  // Campaign 1 characters (5e)
  {
    id: 'char-1',
    campaignId: 'campaign-1',
    userId: 'user-2',
    name: 'Lyanna Raio de Prata',
    portrait: 'https://api.dicebear.com/7.x/adventurer/svg?seed=lyanna',
    level: 7,
    class: 'Paladina',
    strength: 16,
    dexterity: 10,
    constitution: 14,
    intelligence: 10,
    wisdom: 13,
    charisma: 16,
    hp: 58,
    maxHp: 65,
    ac: 18,
    conditions: [],
    inventory: [
      { id: 'inv-1', name: 'Espada Longa +1', quantity: 1, description: 'Uma espada abençoada.' },
      { id: 'inv-2', name: 'Escudo de Mithral', quantity: 1, description: 'Leve e resistente.' },
      { id: 'inv-3', name: 'Poção de Cura', quantity: 3, description: 'Recupera 2d4+2 PV.' },
    ],
    abilities: [
      { id: 'ab-1', name: 'Destruição Divina', description: 'Causa dano radiante extra.', uses: 2, maxUses: 3 },
      { id: 'ab-2', name: 'Imposição de Mãos', description: 'Cura 35 pontos de vida.', uses: 20, maxUses: 35 },
    ],
    notes: 'Lyanna busca redenção por um erro do passado.',
  },
  {
    id: 'char-2',
    campaignId: 'campaign-1',
    userId: 'user-4',
    name: 'Theron Ventocanção',
    portrait: 'https://api.dicebear.com/7.x/adventurer/svg?seed=theron',
    level: 7,
    class: 'Bardo',
    strength: 8,
    dexterity: 14,
    constitution: 12,
    intelligence: 13,
    wisdom: 10,
    charisma: 18,
    hp: 42,
    maxHp: 45,
    ac: 14,
    conditions: ['inspirado'],
    inventory: [
      { id: 'inv-4', name: 'Alaúde Encantado', quantity: 1, description: 'Concede +1 em testes de Performance.' },
      { id: 'inv-5', name: 'Adaga', quantity: 2, description: 'Arma simples.' },
    ],
    abilities: [
      { id: 'ab-3', name: 'Inspiração Bárdica', description: 'd8 de bônus.', uses: 3, maxUses: 4 },
      { id: 'ab-4', name: 'Canção de Descanso', description: 'Aliados recuperam 1d6 PV extra.' },
    ],
    notes: 'Sempre com uma piada na ponta da língua.',
  },
  // Campaign 2 characters (Autoral)
  {
    id: 'char-3',
    campaignId: 'campaign-2',
    userId: 'user-2',
    name: 'Ezra "Seis Tiros" Blackwood',
    portrait: 'https://api.dicebear.com/7.x/adventurer/svg?seed=ezra',
    level: 5,
    class: 'Pistoleiro',
    forca: 10,
    agilidade: 16,
    vigor: 12,
    intelecto: 11,
    vontade: 14,
    presenca: 13,
    hp: 28,
    maxHp: 32,
    ac: 13,
    conditions: [],
    inventory: [
      { id: 'inv-6', name: 'Revólver .45 "Justiceiro"', quantity: 1, description: 'Nunca falha. Dizem.' },
      { id: 'inv-7', name: 'Munição', quantity: 24, description: 'Balas de prata.' },
      { id: 'inv-8', name: 'Whisky', quantity: 1, description: 'Para os nervos.' },
    ],
    abilities: [
      { id: 'ab-5', name: 'Tiro Rápido', description: 'Dois ataques em uma ação.', uses: 2, maxUses: 2 },
      { id: 'ab-6', name: 'Olhar Mortal', description: 'Intimida um alvo.' },
    ],
    notes: 'Caçador de recompensas com um passado sombrio.',
  },
  {
    id: 'char-4',
    campaignId: 'campaign-2',
    userId: 'user-5',
    name: 'Irmã Celeste',
    portrait: 'https://api.dicebear.com/7.x/adventurer/svg?seed=celeste',
    level: 5,
    class: 'Curandeira',
    forca: 8,
    agilidade: 10,
    vigor: 11,
    intelecto: 14,
    vontade: 17,
    presenca: 14,
    hp: 22,
    maxHp: 26,
    ac: 10,
    conditions: ['abençoada'],
    inventory: [
      { id: 'inv-9', name: 'Bíblia Sagrada', quantity: 1, description: 'Afasta o mal.' },
      { id: 'inv-10', name: 'Água Benta', quantity: 5, description: '2d6 dano em mortos-vivos.' },
    ],
    abilities: [
      { id: 'ab-7', name: 'Bênção de Cura', description: 'Restaura 2d8 PV.', uses: 3, maxUses: 4 },
      { id: 'ab-8', name: 'Expulsar Demônios', description: 'Força criaturas malignas a fugirem.' },
    ],
    notes: 'Uma freira que abandonou o convento para combater o mal nas terras selvagens.',
  },
  // Campaign 4 characters (Horror)
  {
    id: 'char-5',
    campaignId: 'campaign-4',
    userId: 'user-2',
    name: 'Dr. Henry Armitage',
    portrait: 'https://api.dicebear.com/7.x/adventurer/svg?seed=armitage',
    level: 1,
    class: 'Professor de Literatura Oculta',
    horrorStr: 45,
    horrorDex: 50,
    horrorCon: 55,
    horrorInt: 80,
    horrorEdu: 85,
    horrorPow: 65,
    horrorApp: 50,
    horrorSiz: 60,
    sanity: 58,
    maxSanity: 65,
    hp: 11,
    maxHp: 12,
    ac: 0,
    conditions: [],
    inventory: [
      { id: 'inv-11', name: 'Necronomicon (cópia)', quantity: 1, description: 'Livro proibido. -1d10 SAN ao ler.' },
      { id: 'inv-12', name: 'Lanterna', quantity: 1, description: 'Ilumina a escuridão.' },
      { id: 'inv-13', name: 'Revólver .32', quantity: 1, description: '1d8 dano.' },
    ],
    abilities: [
      { id: 'ab-9', name: 'Conhecimento Arcano', description: 'Pode identificar entidades e rituais.', uses: 1, maxUses: 1 },
      { id: 'ab-10', name: 'Biblioteca', description: 'Acesso à biblioteca da Universidade Miskatonic.' },
    ],
    notes: 'Professor da Universidade Miskatonic. Já viu coisas demais.',
  },
  {
    id: 'char-6',
    campaignId: 'campaign-4',
    userId: 'user-4',
    name: 'Margaret "Maggie" O\'Brien',
    portrait: 'https://api.dicebear.com/7.x/adventurer/svg?seed=maggie',
    level: 1,
    class: 'Jornalista Investigativa',
    horrorStr: 40,
    horrorDex: 65,
    horrorCon: 50,
    horrorInt: 70,
    horrorEdu: 60,
    horrorPow: 55,
    horrorApp: 65,
    horrorSiz: 45,
    sanity: 50,
    maxSanity: 55,
    hp: 9,
    maxHp: 10,
    ac: 0,
    conditions: ['paranoia leve'],
    inventory: [
      { id: 'inv-14', name: 'Câmera Fotográfica', quantity: 1, description: 'Para registrar evidências.' },
      { id: 'inv-15', name: 'Bloco de Notas', quantity: 1, description: 'Cheio de anotações suspeitas.' },
      { id: 'inv-16', name: 'Faca de Bolso', quantity: 1, description: '1d4 dano.' },
    ],
    abilities: [
      { id: 'ab-11', name: 'Contatos na Imprensa', description: 'Pode conseguir informações.' },
      { id: 'ab-12', name: 'Faro para Notícias', description: '+20% em Spot Hidden.' },
    ],
    notes: 'Repórter do Arkham Advertiser. Cética, mas curiosa demais.',
  },
];

export const homebrews: Homebrew[] = [
  {
    id: 'hb-1',
    name: 'Espada do Dragão Caído',
    type: 'item',
    system: '5e',
    authorId: 'user-5',
    description: 'Uma espada forjada com as escamas de um dragão negro derrotado. Emana uma aura de medo.',
    stats: {
      damage: '2d6 + 1',
      type: 'Cortante + Necrótico',
      rarity: 'Muito Raro',
      attunement: 'Requer sintonização',
    },
    tags: ['arma', 'espada', 'dragão', 'maldito'],
    isPublic: true,
    rating: 4.5,
    ratingCount: 12,
    createdAt: '2023-08-15',
    imageUrl: 'https://images.unsplash.com/photo-1589656966895-2f33e7653819?w=400',
  },
  {
    id: 'hb-2',
    name: 'Gárgula de Pedra Viva',
    type: 'creature',
    system: '5e',
    authorId: 'user-1',
    description: 'Guardiã silenciosa de antigos templos, esta criatura desperta apenas quando intrusos se aproximam.',
    stats: {
      hp: '52 (7d8 + 21)',
      ac: 15,
      cr: 4,
      str: 15,
      dex: 11,
      con: 16,
    },
    tags: ['construto', 'guardião', 'templo'],
    isPublic: true,
    rating: 4.2,
    ratingCount: 8,
    createdAt: '2023-07-20',
  },
  {
    id: 'hb-3',
    name: 'Pistola Amaldiçoada "Viúva Negra"',
    type: 'item',
    system: 'autoral',
    authorId: 'user-5',
    description: 'Diz a lenda que esta pistola matou seu criador. Cada bala carrega uma maldição.',
    stats: {
      damage: '2d8',
      range: '40m',
      special: 'Crítico em 19-20. Em crítico, o alvo deve fazer teste de Vontade ou ficar amaldiçoado.',
    },
    tags: ['arma', 'pistola', 'maldição', 'raro'],
    isPublic: true,
    rating: 4.8,
    ratingCount: 15,
    createdAt: '2023-10-01',
  },
  {
    id: 'hb-4',
    name: 'Wendigo das Montanhas',
    type: 'creature',
    system: 'autoral',
    authorId: 'user-1',
    description: 'Espírito faminto que habita as montanhas geladas. Quem ouve seu uivo raramente sobrevive para contar.',
    stats: {
      hp: 65,
      defesa: 14,
      dano: '2d10 + 4',
      habilidades: 'Uivo Paralisante, Garras Gélidas, Regeneração',
    },
    tags: ['morto-vivo', 'espírito', 'horror', 'chefe'],
    isPublic: true,
    rating: 4.9,
    ratingCount: 22,
    createdAt: '2023-11-05',
  },
  {
    id: 'hb-5',
    name: 'Amuleto do Xamã',
    type: 'item',
    system: 'autoral',
    authorId: 'user-4',
    description: 'Um amuleto feito de ossos e penas. Protege contra espíritos malignos.',
    stats: {
      bonus: '+2 em testes contra medo',
      special: 'Uma vez por dia, pode banir um espírito menor.',
    },
    tags: ['acessório', 'proteção', 'xamã'],
    isPublic: false,
    rating: 0,
    ratingCount: 0,
    createdAt: '2023-12-01',
  },
];

export const enabledHomebrews: EnabledHomebrew[] = [
  { id: 'eh-1', campaignId: 'campaign-1', homebrewId: 'hb-1', enabledAt: '2023-09-01' },
  { id: 'eh-2', campaignId: 'campaign-1', homebrewId: 'hb-2', enabledAt: '2023-09-01' },
  { id: 'eh-3', campaignId: 'campaign-2', homebrewId: 'hb-3', enabledAt: '2023-10-15' },
  { id: 'eh-4', campaignId: 'campaign-2', homebrewId: 'hb-4', enabledAt: '2023-11-10' },
];

export const diceRolls: DiceRoll[] = [
  { id: 'roll-1', campaignId: 'campaign-1', userId: 'user-2', formula: '1d20+5', result: 18, details: '13 + 5', timestamp: '2024-01-10T19:30:00' },
  { id: 'roll-2', campaignId: 'campaign-1', userId: 'user-4', formula: '2d6+3', result: 11, details: '4 + 4 + 3', timestamp: '2024-01-10T19:32:00' },
  { id: 'roll-3', campaignId: 'campaign-1', userId: 'user-1', formula: '1d20', result: 1, details: '1 (Crítico!)', timestamp: '2024-01-10T19:35:00' },
  { id: 'roll-4', campaignId: 'campaign-2', userId: 'user-2', formula: '2d8', result: 12, details: '7 + 5', timestamp: '2024-01-12T20:15:00' },
  { id: 'roll-5', campaignId: 'campaign-2', userId: 'user-5', formula: '1d20+3', result: 20, details: '17 + 3', timestamp: '2024-01-12T20:18:00' },
];

export const timelineEvents: TimelineEvent[] = [
  {
    id: 'event-1',
    campaignId: 'campaign-1',
    title: 'O Despertar do Dragão',
    description: 'O grupo encontrou a caverna onde o dragão negro dormia. Ao tocar no altar, Theron acidentalmente quebrou o selo que o mantinha adormecido.',
    type: 'boss_fight',
    tags: ['dragão', 'revelação', 'combate'],
    date: '2023-08-15',
    attachments: [],
  },
  {
    id: 'event-2',
    campaignId: 'campaign-1',
    title: 'A Queda de Sir Aldric',
    description: 'O paladino NPC Sir Aldric sacrificou sua vida para salvar Lyanna do sopro do dragão.',
    type: 'death',
    tags: ['npc', 'sacrifício', 'triste'],
    date: '2023-09-20',
    attachments: [],
  },
  {
    id: 'event-3',
    campaignId: 'campaign-1',
    title: 'A Profecia Revelada',
    description: 'Na biblioteca antiga, o grupo descobriu uma profecia sobre a única arma capaz de derrotar o dragão.',
    type: 'discovery',
    tags: ['profecia', 'lore', 'importante'],
    date: '2023-10-05',
    attachments: [],
  },
  {
    id: 'event-4',
    campaignId: 'campaign-2',
    title: 'Chegada em Red Mesa',
    description: 'O grupo chegou à cidade fantasma de Red Mesa, onde estranhos desaparecimentos têm ocorrido.',
    type: 'discovery',
    tags: ['cidade', 'mistério', 'início'],
    date: '2023-09-20',
    attachments: [],
  },
  {
    id: 'event-5',
    campaignId: 'campaign-2',
    title: 'Confronto no Saloon',
    description: 'Ezra enfrentou o bando de Jake "Serpente" em um tiroteio épico no saloon abandonado.',
    type: 'boss_fight',
    tags: ['tiroteio', 'vilão', 'ação'],
    date: '2023-10-15',
    attachments: [],
  },
];

export const missions: Mission[] = [
  {
    id: 'mission-1',
    campaignId: 'campaign-1',
    title: 'Encontrar a Espada Matadora de Dragões',
    description: 'A profecia menciona uma espada antiga capaz de perfurar as escamas do dragão. Rumores dizem que está na Tumba dos Reis.',
    status: 'active',
    notes: 'O grupo precisa viajar para as Montanhas Cinzentas.',
    createdAt: '2023-10-06',
  },
  {
    id: 'mission-2',
    campaignId: 'campaign-1',
    title: 'Recrutar aliados para a batalha final',
    description: 'O reino precisa de um exército para enfrentar as forças do dragão.',
    status: 'active',
    notes: 'Possíveis aliados: Anões das Montanhas, Elfos da Floresta, Ordem da Luz.',
    createdAt: '2023-11-01',
  },
  {
    id: 'mission-3',
    campaignId: 'campaign-2',
    title: 'Descobrir a origem das desaparições',
    description: 'Pessoas estão sumindo em Red Mesa. Investigar as minas abandonadas.',
    status: 'active',
    notes: 'Testemunhas falam de criaturas saindo das minas à noite.',
    createdAt: '2023-09-25',
  },
  {
    id: 'mission-4',
    campaignId: 'campaign-2',
    title: 'Derrotar o Bando da Serpente',
    description: 'Jake "Serpente" e seu bando aterrorizam a região.',
    status: 'completed',
    notes: 'Bando derrotado no saloon. Jake fugiu.',
    createdAt: '2023-10-01',
  },
];

export const encounters: Encounter[] = [
  {
    id: 'enc-1',
    campaignId: 'campaign-1',
    name: 'Emboscada na Estrada',
    creatures: [
      { id: 'ec-1', name: 'Lyanna Raio de Prata', initiative: 18, hp: 58, maxHp: 65, ac: 18, conditions: [], isPlayer: true, characterId: 'char-1' },
      { id: 'ec-2', name: 'Theron Ventocanção', initiative: 15, hp: 42, maxHp: 45, ac: 14, conditions: [], isPlayer: true, characterId: 'char-2' },
      { id: 'ec-3', name: 'Goblin Arqueiro', initiative: 14, hp: 12, maxHp: 12, ac: 13, conditions: [], isPlayer: false },
      { id: 'ec-4', name: 'Goblin Guerreiro', initiative: 12, hp: 8, maxHp: 15, ac: 15, conditions: ['ferido'], isPlayer: false },
      { id: 'ec-5', name: 'Líder Goblin', initiative: 10, hp: 25, maxHp: 30, ac: 16, conditions: [], isPlayer: false },
    ],
    isActive: true,
    createdAt: '2024-01-10',
  },
];

export const adminLogs: AdminLog[] = [
  { id: 'log-1', action: 'ban_user', targetType: 'user', targetId: 'user-banned-1', adminId: 'user-3', timestamp: '2024-01-05T10:00:00', details: 'Usuário banido por comportamento inadequado.' },
  { id: 'log-2', action: 'remove_homebrew', targetType: 'homebrew', targetId: 'hb-removed-1', adminId: 'user-3', timestamp: '2024-01-06T14:30:00', details: 'Homebrew removido por conteúdo impróprio.' },
  { id: 'log-3', action: 'close_campaign', targetType: 'campaign', targetId: 'campaign-closed-1', adminId: 'user-3', timestamp: '2024-01-07T09:15:00', details: 'Campanha fechada a pedido do mestre.' },
];

// ============================================
// HELPER FUNCTIONS
// ============================================

export const getSystemTheme = (system: SystemType | string): ThemeType => {
  switch (system) {
    case '5e':
      return 'medieval';
    case 'autoral':
    case 'olho_da_morte':
      return 'wildwest';
    case 'horror':
      return 'cosmic';
    default:
      return 'neutral';
  }
};

export const getSystemName = (system: SystemType | string): string => {
  switch (system) {
    case '5e':
      return 'D&D 5e (SRD)';
    case 'autoral':
    case 'olho_da_morte':
      return 'Sistema Olho da Morte';
    case 'horror':
      return 'Horror Cósmico';
    default:
      return 'Sistema';
  }
};

export const getEventIcon = (type: EventType): string => {
  switch (type) {
    case 'boss_fight':
      return '⚔️';
    case 'death':
      return '💀';
    case 'mission':
      return '📜';
    case 'discovery':
      return '🔍';
    case 'npc_meeting':
      return '👤';
    case 'level_up':
      return '⬆️';
    default:
      return '📌';
  }
};

export const getEventTypeName = (type: EventType): string => {
  switch (type) {
    case 'boss_fight':
      return 'Combate de Chefe';
    case 'death':
      return 'Morte';
    case 'mission':
      return 'Missão';
    case 'discovery':
      return 'Descoberta';
    case 'npc_meeting':
      return 'Encontro com NPC';
    case 'level_up':
      return 'Subida de Nível';
    default:
      return 'Evento';
  }
};

export const eventTypes: { value: EventType; label: string }[] = [
  { value: 'boss_fight', label: 'Boss Fight' },
  { value: 'death', label: 'Morte' },
  { value: 'mission', label: 'Missão' },
  { value: 'discovery', label: 'Descoberta' },
  { value: 'npc_meeting', label: 'Encontro com NPC' },
  { value: 'level_up', label: 'Subida de Nível' },
];

// Combat stats mock for dashboard
export const combatStats: Record<string, CombatStats> = {
  'char-1': { oddsDealt: 15, damageDealt: 245, damageReceived: 89, healingDone: 120 },
  'char-2': { oddsDealt: 12, damageDealt: 156, damageReceived: 45, healingDone: 65 },
  'char-3': { oddsDealt: 18, damageDealt: 312, damageReceived: 78, healingDone: 0 },
  'char-4': { oddsDealt: 8, damageDealt: 45, damageReceived: 112, healingDone: 180 },
  'char-5': { oddsDealt: 10, damageDealt: 178, damageReceived: 95, healingDone: 25 },
};
