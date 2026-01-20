import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SystemType } from '@/data/mockData';

export type HomebrewItemType = 'scroll' | 'weapon' | 'armor' | 'consumable' | 'misc';
export type Rarity = 'common' | 'uncommon' | 'rare' | 'very_rare' | 'legendary';
export type MagicCategory = 'damage' | 'heal' | 'none';

interface FormFieldsProps {
  itemType: HomebrewItemType;
  system: SystemType;
  formData: Record<string, any>;
  onChange: (field: string, value: any) => void;
}

const DAMAGE_TYPES_5E = [
  'ácido', 'contundente', 'cortante', 'perfurante', 'fogo', 'frio', 
  'relâmpago', 'trovão', 'veneno', 'psíquico', 'radiante', 'necrótico', 'força'
];

const DAMAGE_TYPES_AUTORAL = [
  'cortante', 'perfurante', 'contundente', 'fogo', 'gelo', 'elétrico',
  'veneno', 'necrótico', 'sagrado', 'psíquico', 'força', 'ácido', 'trovão', 'indefensável'
];

const DAMAGE_TYPES_HORROR = [
  'contundente', 'cortante', 'perfurante', 'fogo', 'elétrico', 'veneno', 'psíquico'
];

export const getRarityLabel = (rarity: Rarity): string => {
  const labels: Record<Rarity, string> = {
    common: 'Comum',
    uncommon: 'Incomum',
    rare: 'Raro',
    very_rare: 'Muito Raro',
    legendary: 'Lendário'
  };
  return labels[rarity];
};

export const getItemTypeLabel = (type: HomebrewItemType): string => {
  const labels: Record<HomebrewItemType, string> = {
    scroll: 'Pergaminho',
    weapon: 'Arma',
    armor: 'Armadura',
    consumable: 'Consumível',
    misc: 'Item Geral'
  };
  return labels[type];
};

const getDamageTypes = (system: SystemType): string[] => {
  switch (system) {
    case '5e': return DAMAGE_TYPES_5E;
    case 'autoral': return DAMAGE_TYPES_AUTORAL;
    case 'horror': return DAMAGE_TYPES_HORROR;
    default: return DAMAGE_TYPES_5E;
  }
};

// Common fields for all types
const CommonFields = ({ formData, onChange }: Omit<FormFieldsProps, 'itemType' | 'system'>) => (
  <>
    <div>
      <Label>Nome *</Label>
      <Input 
        placeholder="Nome do item" 
        value={formData.name || ''} 
        onChange={e => onChange('name', e.target.value)} 
      />
    </div>
    <div>
      <Label>Descrição *</Label>
      <Textarea 
        placeholder="Descreva o item..." 
        rows={3} 
        value={formData.description || ''} 
        onChange={e => onChange('description', e.target.value)} 
      />
    </div>
    <div>
      <Label>Raridade *</Label>
      <Select value={formData.rarity || ''} onValueChange={v => onChange('rarity', v)}>
        <SelectTrigger><SelectValue placeholder="Selecione a raridade" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="common">Comum</SelectItem>
          <SelectItem value="uncommon">Incomum</SelectItem>
          <SelectItem value="rare">Raro</SelectItem>
          <SelectItem value="very_rare">Muito Raro</SelectItem>
          <SelectItem value="legendary">Lendário</SelectItem>
        </SelectContent>
      </Select>
    </div>
  </>
);

// Scroll-specific fields
const ScrollFields = ({ formData, onChange, system }: Omit<FormFieldsProps, 'itemType'>) => (
  <>
    <CommonFields formData={formData} onChange={onChange} />
    <div>
      <Label>Categoria de Magia *</Label>
      <Select value={formData.magicCategory || ''} onValueChange={v => onChange('magicCategory', v)}>
        <SelectTrigger><SelectValue placeholder="Selecione a categoria" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="damage">Dano</SelectItem>
          <SelectItem value="heal">Cura</SelectItem>
          <SelectItem value="none">Nenhum</SelectItem>
        </SelectContent>
      </Select>
    </div>
    
    {formData.magicCategory === 'damage' && (
      <>
        <div>
          <Label>Tipo de Dano *</Label>
          <Select value={formData.damageType || ''} onValueChange={v => onChange('damageType', v)}>
            <SelectTrigger><SelectValue placeholder="Selecione o tipo de dano" /></SelectTrigger>
            <SelectContent>
              {getDamageTypes(system).map(type => (
                <SelectItem key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Dado de Dano *</Label>
          <Input 
            placeholder="ex: 2d6, 3d8" 
            value={formData.damageDice || ''} 
            onChange={e => onChange('damageDice', e.target.value)} 
          />
        </div>
      </>
    )}
    
    {formData.magicCategory === 'heal' && (
      <div>
        <Label>Cura *</Label>
        <Input 
          placeholder="ex: 2d8 + 2" 
          value={formData.healAmount || ''} 
          onChange={e => onChange('healAmount', e.target.value)} 
        />
      </div>
    )}
  </>
);

// Weapon-specific fields
const WeaponFields = ({ formData, onChange, system }: Omit<FormFieldsProps, 'itemType'>) => (
  <>
    <CommonFields formData={formData} onChange={onChange} />
    <div className="grid grid-cols-2 gap-4">
      <div>
        <Label>Tipo de Arma *</Label>
        <Select value={formData.weaponType || ''} onValueChange={v => onChange('weaponType', v)}>
          <SelectTrigger><SelectValue placeholder="Tipo" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="melee">Corpo-a-corpo</SelectItem>
            <SelectItem value="ranged">Distância</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>Dado de Dano *</Label>
        <Input 
          placeholder="ex: 1d8, 2d6" 
          value={formData.damageDice || ''} 
          onChange={e => onChange('damageDice', e.target.value)} 
        />
      </div>
    </div>
    <div>
      <Label>Tipo de Dano *</Label>
      <Select value={formData.damageType || ''} onValueChange={v => onChange('damageType', v)}>
        <SelectTrigger><SelectValue placeholder="Selecione o tipo de dano" /></SelectTrigger>
        <SelectContent>
          {getDamageTypes(system).map(type => (
            <SelectItem key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
    <div>
      <Label>Propriedades/Tags</Label>
      <Input 
        placeholder="ex: versátil, pesada, acuidade (separadas por vírgula)" 
        value={formData.properties || ''} 
        onChange={e => onChange('properties', e.target.value)} 
      />
    </div>
  </>
);

// Armor-specific fields
const ArmorFields = ({ formData, onChange }: Omit<FormFieldsProps, 'itemType' | 'system'>) => (
  <>
    <CommonFields formData={formData} onChange={onChange} />
    <div className="grid grid-cols-2 gap-4">
      <div>
        <Label>Base de CA/Defesa *</Label>
        <Input 
          type="number" 
          placeholder="ex: 14" 
          value={formData.baseAC || ''} 
          onChange={e => onChange('baseAC', e.target.value)} 
        />
      </div>
      <div>
        <Label>Requisito (opcional)</Label>
        <Input 
          placeholder="ex: FOR 13" 
          value={formData.requirement || ''} 
          onChange={e => onChange('requirement', e.target.value)} 
        />
      </div>
    </div>
    <div>
      <Label>Penalidade (opcional)</Label>
      <Input 
        placeholder="ex: Desvantagem em Furtividade" 
        value={formData.penalty || ''} 
        onChange={e => onChange('penalty', e.target.value)} 
      />
    </div>
    <div>
      <Label>Tags</Label>
      <Input 
        placeholder="ex: pesada, metal (separadas por vírgula)" 
        value={formData.tags || ''} 
        onChange={e => onChange('tags', e.target.value)} 
      />
    </div>
  </>
);

// Consumable-specific fields
const ConsumableFields = ({ formData, onChange, system }: Omit<FormFieldsProps, 'itemType'>) => (
  <>
    <CommonFields formData={formData} onChange={onChange} />
    <div>
      <Label>Efeito *</Label>
      <Select value={formData.effect || ''} onValueChange={v => onChange('effect', v)}>
        <SelectTrigger><SelectValue placeholder="Tipo de efeito" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="heal">Cura</SelectItem>
          <SelectItem value="buff">Buff</SelectItem>
          <SelectItem value="damage">Dano</SelectItem>
          <SelectItem value="other">Outro</SelectItem>
        </SelectContent>
      </Select>
    </div>
    
    {formData.effect === 'heal' && (
      <div>
        <Label>Quantidade de Cura *</Label>
        <Input 
          placeholder="ex: 2d4 + 2" 
          value={formData.healAmount || ''} 
          onChange={e => onChange('healAmount', e.target.value)} 
        />
      </div>
    )}
    
    {formData.effect === 'damage' && (
      <>
        <div>
          <Label>Tipo de Dano *</Label>
          <Select value={formData.damageType || ''} onValueChange={v => onChange('damageType', v)}>
            <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
            <SelectContent>
              {getDamageTypes(system).map(type => (
                <SelectItem key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Dado de Dano *</Label>
          <Input 
            placeholder="ex: 1d6" 
            value={formData.damageDice || ''} 
            onChange={e => onChange('damageDice', e.target.value)} 
          />
        </div>
      </>
    )}
    
    {formData.effect === 'buff' && (
      <div>
        <Label>Descrição do Buff *</Label>
        <Textarea 
          placeholder="Descreva o efeito do buff..." 
          rows={2} 
          value={formData.buffDescription || ''} 
          onChange={e => onChange('buffDescription', e.target.value)} 
        />
      </div>
    )}
    
    <div>
      <Label>Duração (opcional)</Label>
      <Input 
        placeholder="ex: 1 hora, 10 minutos" 
        value={formData.duration || ''} 
        onChange={e => onChange('duration', e.target.value)} 
      />
    </div>
  </>
);

// Misc item fields
const MiscFields = ({ formData, onChange }: Omit<FormFieldsProps, 'itemType' | 'system'>) => (
  <>
    <CommonFields formData={formData} onChange={onChange} />
    <div>
      <Label>Tags</Label>
      <Input 
        placeholder="ex: ferramenta, mágico, raro (separadas por vírgula)" 
        value={formData.tags || ''} 
        onChange={e => onChange('tags', e.target.value)} 
      />
    </div>
  </>
);

export default function HomebrewFormFields({ itemType, system, formData, onChange }: FormFieldsProps) {
  switch (itemType) {
    case 'scroll':
      return <ScrollFields formData={formData} onChange={onChange} system={system} />;
    case 'weapon':
      return <WeaponFields formData={formData} onChange={onChange} system={system} />;
    case 'armor':
      return <ArmorFields formData={formData} onChange={onChange} />;
    case 'consumable':
      return <ConsumableFields formData={formData} onChange={onChange} system={system} />;
    case 'misc':
      return <MiscFields formData={formData} onChange={onChange} />;
    default:
      return <MiscFields formData={formData} onChange={onChange} />;
  }
}
