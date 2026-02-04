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

export interface ItemFormData {
  name: string;
  description: string;
  system: SystemType;
  rarity: string;
  weight: number | null;
  properties: string[];
  diceFormula: string;
  tags: string[];
  isPublic: boolean;
}

interface ItemFormProps {
  initialData?: Partial<ItemFormData>;
  onChange: (data: ItemFormData) => void;
}

const rarities = [
  { value: 'comum', label: 'Comum' },
  { value: 'incomum', label: 'Incomum' },
  { value: 'raro', label: 'Raro' },
  { value: 'muito_raro', label: 'Muito Raro' },
  { value: 'lendario', label: 'Lendário' },
  { value: 'artefato', label: 'Artefato' },
];

export function ItemForm({ initialData, onChange }: ItemFormProps) {
  const [data, setData] = useState<ItemFormData>({
    name: initialData?.name || '',
    description: initialData?.description || '',
    system: initialData?.system || '5e',
    rarity: initialData?.rarity || 'comum',
    weight: initialData?.weight ?? null,
    properties: initialData?.properties || [],
    diceFormula: initialData?.diceFormula || '',
    tags: initialData?.tags || [],
    isPublic: initialData?.isPublic ?? false,
  });

  const [newProperty, setNewProperty] = useState('');
  const [newTag, setNewTag] = useState('');

  const update = (partial: Partial<ItemFormData>) => {
    const updated = { ...data, ...partial };
    setData(updated);
    onChange(updated);
  };

  const addProperty = () => {
    if (newProperty.trim()) {
      update({ properties: [...data.properties, newProperty.trim()] });
      setNewProperty('');
    }
  };

  const removeProperty = (index: number) => {
    update({ properties: data.properties.filter((_, i) => i !== index) });
  };

  const addTag = () => {
    if (newTag.trim() && !data.tags.includes(newTag.trim())) {
      update({ tags: [...data.tags, newTag.trim()] });
      setNewTag('');
    }
  };

  const removeTag = (tag: string) => {
    update({ tags: data.tags.filter(t => t !== tag) });
  };

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
                placeholder="Nome do item"
                value={data.name}
                onChange={(e) => update({ name: e.target.value })}
                maxLength={100}
              />
              <p className="text-xs text-muted-foreground">{data.name.length}/100</p>
            </div>
            <div className="space-y-2">
              <Label>Sistema *</Label>
              <Select value={data.system} onValueChange={(v) => update({ system: v as SystemType })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
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
              placeholder="Descreva o item..."
              value={data.description}
              onChange={(e) => update({ description: e.target.value })}
              rows={4}
              maxLength={5000}
            />
            <p className="text-xs text-muted-foreground">{data.description.length}/5000</p>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Raridade</Label>
              <Select value={data.rarity} onValueChange={(v) => update({ rarity: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {rarities.map(r => (
                    <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="weight">Peso (kg)</Label>
              <Input
                id="weight"
                type="number"
                placeholder="0"
                value={data.weight ?? ''}
                onChange={(e) => update({ weight: e.target.value ? parseFloat(e.target.value) : null })}
                min={0}
                step={0.1}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dice">Dado (ex: 1d8)</Label>
              <Input
                id="dice"
                placeholder="1d8+2"
                value={data.diceFormula}
                onChange={(e) => update({ diceFormula: e.target.value })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Propriedades e Efeitos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Nova propriedade..."
              value={newProperty}
              onChange={(e) => setNewProperty(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addProperty())}
            />
            <Button type="button" variant="outline" onClick={addProperty}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {data.properties.length > 0 && (
            <ul className="space-y-2">
              {data.properties.map((prop, i) => (
                <li key={i} className="flex items-center justify-between p-2 bg-muted rounded">
                  <span>{prop}</span>
                  <Button variant="ghost" size="sm" onClick={() => removeProperty(i)}>
                    <X className="h-4 w-4" />
                  </Button>
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
            <Button type="button" variant="outline" onClick={addTag}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {data.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {data.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="gap-1">
                  {tag}
                  <button onClick={() => removeTag(tag)} className="ml-1 hover:text-destructive">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Visibilidade</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Pública</p>
              <p className="text-sm text-muted-foreground">
                Outros usuários poderão ver e usar este item.
              </p>
            </div>
            <Switch 
              checked={data.isPublic} 
              onCheckedChange={(v) => update({ isPublic: v })}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
