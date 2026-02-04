import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Plus, X } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type SystemType = Database['public']['Enums']['system_type'];

interface CreatureAction {
  name: string;
  description: string;
  damage?: string;
}

export interface CreatureFormData {
  name: string;
  description: string;
  system: SystemType;
  nd: number | null;
  ac: number;
  hp: number;
  speed: string;
  attributes: {
    str: number;
    dex: number;
    con: number;
    int: number;
    wis: number;
    cha: number;
  };
  resistances: string[];
  immunities: string[];
  actions: CreatureAction[];
  tags: string[];
  isPublic: boolean;
}

interface CreatureFormProps {
  initialData?: Partial<CreatureFormData>;
  onChange: (data: CreatureFormData) => void;
}

export function CreatureForm({ initialData, onChange }: CreatureFormProps) {
  const [data, setData] = useState<CreatureFormData>({
    name: initialData?.name || '',
    description: initialData?.description || '',
    system: initialData?.system || '5e',
    nd: initialData?.nd ?? null,
    ac: initialData?.ac ?? 10,
    hp: initialData?.hp ?? 10,
    speed: initialData?.speed || '9m',
    attributes: initialData?.attributes || { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
    resistances: initialData?.resistances || [],
    immunities: initialData?.immunities || [],
    actions: initialData?.actions || [],
    tags: initialData?.tags || [],
    isPublic: initialData?.isPublic ?? false,
  });

  const [newResistance, setNewResistance] = useState('');
  const [newImmunity, setNewImmunity] = useState('');
  const [newTag, setNewTag] = useState('');
  const [newAction, setNewAction] = useState<CreatureAction>({ name: '', description: '', damage: '' });

  const update = (partial: Partial<CreatureFormData>) => {
    const updated = { ...data, ...partial };
    setData(updated);
    onChange(updated);
  };

  const updateAttribute = (attr: keyof typeof data.attributes, value: number) => {
    update({ attributes: { ...data.attributes, [attr]: value } });
  };

  const addResistance = () => {
    if (newResistance.trim() && !data.resistances.includes(newResistance.trim())) {
      update({ resistances: [...data.resistances, newResistance.trim()] });
      setNewResistance('');
    }
  };

  const addImmunity = () => {
    if (newImmunity.trim() && !data.immunities.includes(newImmunity.trim())) {
      update({ immunities: [...data.immunities, newImmunity.trim()] });
      setNewImmunity('');
    }
  };

  const addAction = () => {
    if (newAction.name.trim() && newAction.description.trim()) {
      update({ actions: [...data.actions, { ...newAction }] });
      setNewAction({ name: '', description: '', damage: '' });
    }
  };

  const removeAction = (index: number) => {
    update({ actions: data.actions.filter((_, i) => i !== index) });
  };

  const addTag = () => {
    if (newTag.trim() && !data.tags.includes(newTag.trim())) {
      update({ tags: [...data.tags, newTag.trim()] });
      setNewTag('');
    }
  };

  const attrLabels = { str: 'FOR', dex: 'DES', con: 'CON', int: 'INT', wis: 'SAB', cha: 'CAR' };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Informações Básicas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                placeholder="Nome da criatura"
                value={data.name}
                onChange={(e) => update({ name: e.target.value })}
                maxLength={100}
              />
            </div>
            <div className="space-y-2">
              <Label>Sistema *</Label>
              <Select value={data.system} onValueChange={(v) => update({ system: v as SystemType })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="5e">D&D 5e (SRD)</SelectItem>
                  <SelectItem value="olho_da_morte">Sistema Olho da Morte</SelectItem>
                  <SelectItem value="horror">Horror Cósmico</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              placeholder="Descreva a criatura..."
              value={data.description}
              onChange={(e) => update({ description: e.target.value })}
              rows={3}
              maxLength={5000}
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nd">ND</Label>
              <Input
                id="nd"
                type="number"
                placeholder="1"
                value={data.nd ?? ''}
                onChange={(e) => update({ nd: e.target.value ? parseFloat(e.target.value) : null })}
                min={0}
                step={0.25}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ac">CA</Label>
              <Input
                id="ac"
                type="number"
                value={data.ac}
                onChange={(e) => update({ ac: parseInt(e.target.value) || 10 })}
                min={0}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hp">PV</Label>
              <Input
                id="hp"
                type="number"
                value={data.hp}
                onChange={(e) => update({ hp: parseInt(e.target.value) || 1 })}
                min={1}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="speed">Deslocamento</Label>
              <Input
                id="speed"
                placeholder="9m"
                value={data.speed}
                onChange={(e) => update({ speed: e.target.value })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Atributos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
            {(Object.keys(attrLabels) as (keyof typeof attrLabels)[]).map((attr) => (
              <div key={attr} className="text-center space-y-1">
                <Label className="text-xs">{attrLabels[attr]}</Label>
                <Input
                  type="number"
                  value={data.attributes[attr]}
                  onChange={(e) => updateAttribute(attr, parseInt(e.target.value) || 10)}
                  className="text-center"
                  min={1}
                  max={30}
                />
                <p className="text-xs text-muted-foreground">
                  {data.attributes[attr] >= 10 ? '+' : ''}{Math.floor((data.attributes[attr] - 10) / 2)}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Resistências e Imunidades</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-sm">Resistências</Label>
            <div className="flex gap-2 mt-1">
              <Input
                placeholder="Ex: Fogo, Frio..."
                value={newResistance}
                onChange={(e) => setNewResistance(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addResistance())}
              />
              <Button type="button" variant="outline" onClick={addResistance}><Plus className="h-4 w-4" /></Button>
            </div>
            {data.resistances.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {data.resistances.map((r) => (
                  <Badge key={r} variant="secondary" className="gap-1">
                    {r}
                    <button onClick={() => update({ resistances: data.resistances.filter(x => x !== r) })}>
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div>
            <Label className="text-sm">Imunidades</Label>
            <div className="flex gap-2 mt-1">
              <Input
                placeholder="Ex: Veneno, Psíquico..."
                value={newImmunity}
                onChange={(e) => setNewImmunity(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addImmunity())}
              />
              <Button type="button" variant="outline" onClick={addImmunity}><Plus className="h-4 w-4" /></Button>
            </div>
            {data.immunities.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {data.immunities.map((imm) => (
                  <Badge key={imm} variant="outline" className="gap-1">
                    {imm}
                    <button onClick={() => update({ immunities: data.immunities.filter(x => x !== imm) })}>
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ações</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-3 gap-2">
            <Input
              placeholder="Nome da ação"
              value={newAction.name}
              onChange={(e) => setNewAction({ ...newAction, name: e.target.value })}
            />
            <Input
              placeholder="Descrição"
              value={newAction.description}
              onChange={(e) => setNewAction({ ...newAction, description: e.target.value })}
            />
            <div className="flex gap-2">
              <Input
                placeholder="Dano (ex: 2d6)"
                value={newAction.damage}
                onChange={(e) => setNewAction({ ...newAction, damage: e.target.value })}
              />
              <Button type="button" variant="outline" onClick={addAction}><Plus className="h-4 w-4" /></Button>
            </div>
          </div>
          {data.actions.length > 0 && (
            <ul className="space-y-2">
              {data.actions.map((action, i) => (
                <li key={i} className="flex items-start justify-between p-3 bg-muted rounded">
                  <div>
                    <p className="font-medium">{action.name}</p>
                    <p className="text-sm text-muted-foreground">{action.description}</p>
                    {action.damage && <Badge variant="outline" className="mt-1">{action.damage}</Badge>}
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => removeAction(i)}><X className="h-4 w-4" /></Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tags</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Nova tag..."
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
            />
            <Button type="button" variant="outline" onClick={addTag}><Plus className="h-4 w-4" /></Button>
          </div>
          {data.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {data.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="gap-1">
                  {tag}
                  <button onClick={() => update({ tags: data.tags.filter(t => t !== tag) })}><X className="h-3 w-3" /></button>
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Visibilidade</CardTitle></CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Pública</p>
              <p className="text-sm text-muted-foreground">Outros usuários poderão ver e usar esta criatura.</p>
            </div>
            <Switch checked={data.isPublic} onCheckedChange={(v) => update({ isPublic: v })} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
