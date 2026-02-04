import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Plus, X, ChevronDown } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type SystemType = Database['public']['Enums']['system_type'];

interface Ability {
  name: string;
  level: number;
  description: string;
}

interface Specialization {
  name: string;
  description: string;
  abilities: Ability[];
}

export interface ClassFormData {
  name: string;
  description: string;
  system: SystemType;
  baseAbilities: Ability[];
  specializations: Specialization[];
  isPublic: boolean;
}

interface ClassFormProps {
  initialData?: Partial<ClassFormData>;
  onChange: (data: ClassFormData) => void;
}

export function ClassForm({ initialData, onChange }: ClassFormProps) {
  const [data, setData] = useState<ClassFormData>({
    name: initialData?.name || '',
    description: initialData?.description || '',
    system: initialData?.system || 'olho_da_morte',
    baseAbilities: initialData?.baseAbilities || [],
    specializations: initialData?.specializations || [{ name: '', description: '', abilities: [] }],
    isPublic: initialData?.isPublic ?? false,
  });

  const [newBaseAbility, setNewBaseAbility] = useState<Ability>({ name: '', level: 1, description: '' });

  const update = (partial: Partial<ClassFormData>) => {
    const updated = { ...data, ...partial };
    setData(updated);
    onChange(updated);
  };

  const addBaseAbility = () => {
    if (newBaseAbility.name.trim() && newBaseAbility.description.trim()) {
      update({ baseAbilities: [...data.baseAbilities, { ...newBaseAbility }] });
      setNewBaseAbility({ name: '', level: 1, description: '' });
    }
  };

  const removeBaseAbility = (index: number) => {
    update({ baseAbilities: data.baseAbilities.filter((_, i) => i !== index) });
  };

  const addSpecialization = () => {
    update({ specializations: [...data.specializations, { name: '', description: '', abilities: [] }] });
  };

  const removeSpecialization = (index: number) => {
    if (data.specializations.length > 1) {
      update({ specializations: data.specializations.filter((_, i) => i !== index) });
    }
  };

  const updateSpecialization = (index: number, partial: Partial<Specialization>) => {
    const specs = [...data.specializations];
    specs[index] = { ...specs[index], ...partial };
    update({ specializations: specs });
  };

  const addSpecAbility = (specIndex: number, ability: Ability) => {
    const specs = [...data.specializations];
    specs[specIndex].abilities.push(ability);
    update({ specializations: specs });
  };

  const removeSpecAbility = (specIndex: number, abilityIndex: number) => {
    const specs = [...data.specializations];
    specs[specIndex].abilities = specs[specIndex].abilities.filter((_, i) => i !== abilityIndex);
    update({ specializations: specs });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Informações da Classe</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome da Classe *</Label>
              <Input
                id="name"
                placeholder="Ex: Guerreiro"
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
            <Label htmlFor="description">Descrição da Classe</Label>
            <Textarea
              id="description"
              placeholder="Descreva a classe..."
              value={data.description}
              onChange={(e) => update({ description: e.target.value })}
              rows={3}
              maxLength={5000}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Habilidades Base da Classe</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Habilidades que todo personagem desta classe recebe conforme sobe de nível.
          </p>

          <div className="grid sm:grid-cols-4 gap-2 items-end">
            <div className="space-y-1">
              <Label className="text-xs">Nome</Label>
              <Input
                placeholder="Nome"
                value={newBaseAbility.name}
                onChange={(e) => setNewBaseAbility({ ...newBaseAbility, name: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Nível</Label>
              <Input
                type="number"
                min={1}
                max={20}
                value={newBaseAbility.level}
                onChange={(e) => setNewBaseAbility({ ...newBaseAbility, level: parseInt(e.target.value) || 1 })}
              />
            </div>
            <div className="space-y-1 sm:col-span-2">
              <Label className="text-xs">Descrição</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Descrição da habilidade"
                  value={newBaseAbility.description}
                  onChange={(e) => setNewBaseAbility({ ...newBaseAbility, description: e.target.value })}
                />
                <Button type="button" variant="outline" onClick={addBaseAbility}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {data.baseAbilities.length > 0 && (
            <ul className="space-y-2">
              {data.baseAbilities
                .sort((a, b) => a.level - b.level)
                .map((ability, i) => (
                  <li key={i} className="flex items-start justify-between p-3 bg-muted rounded">
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">NV {ability.level}</Badge>
                        <span className="font-medium">{ability.name}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{ability.description}</p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => removeBaseAbility(i)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </li>
                ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Especializações</CardTitle>
          <Button type="button" variant="outline" size="sm" onClick={addSpecialization}>
            <Plus className="h-4 w-4 mr-1" />Adicionar
          </Button>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Cada classe deve ter pelo menos uma especialização. O personagem escolhe uma especialização ao criar o personagem.
          </p>

          <Accordion type="multiple" className="space-y-2">
            {data.specializations.map((spec, specIndex) => (
              <AccordionItem key={specIndex} value={`spec-${specIndex}`} className="border rounded-lg px-4">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">
                      {spec.name || `Especialização ${specIndex + 1}`}
                    </span>
                    <Badge variant="secondary">{spec.abilities.length} habilidades</Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pt-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Nome da Especialização *</Label>
                      <Input
                        placeholder="Ex: Campeão"
                        value={spec.name}
                        onChange={(e) => updateSpecialization(specIndex, { name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Descrição</Label>
                      <Input
                        placeholder="Breve descrição"
                        value={spec.description}
                        onChange={(e) => updateSpecialization(specIndex, { description: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Habilidades da Especialização</Label>
                    <SpecAbilityInput
                      onAdd={(ability) => addSpecAbility(specIndex, ability)}
                    />
                    {spec.abilities.length > 0 && (
                      <ul className="space-y-2 mt-2">
                        {spec.abilities
                          .sort((a, b) => a.level - b.level)
                          .map((ability, abilityIndex) => (
                            <li key={abilityIndex} className="flex items-start justify-between p-2 bg-background border rounded">
                              <div>
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="text-xs">NV {ability.level}</Badge>
                                  <span className="text-sm font-medium">{ability.name}</span>
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">{ability.description}</p>
                              </div>
                              <Button variant="ghost" size="sm" onClick={() => removeSpecAbility(specIndex, abilityIndex)}>
                                <X className="h-3 w-3" />
                              </Button>
                            </li>
                          ))}
                      </ul>
                    )}
                  </div>

                  {data.specializations.length > 1 && (
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => removeSpecialization(specIndex)}
                    >
                      <X className="h-4 w-4 mr-1" />Remover Especialização
                    </Button>
                  )}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Visibilidade</CardTitle></CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Pública</p>
              <p className="text-sm text-muted-foreground">Outros usuários poderão ver e usar esta classe.</p>
            </div>
            <Switch checked={data.isPublic} onCheckedChange={(v) => update({ isPublic: v })} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function SpecAbilityInput({ onAdd }: { onAdd: (ability: Ability) => void }) {
  const [ability, setAbility] = useState<Ability>({ name: '', level: 3, description: '' });

  const handleAdd = () => {
    if (ability.name.trim() && ability.description.trim()) {
      onAdd({ ...ability });
      setAbility({ name: '', level: 3, description: '' });
    }
  };

  return (
    <div className="grid sm:grid-cols-4 gap-2 mt-2">
      <Input
        placeholder="Nome"
        value={ability.name}
        onChange={(e) => setAbility({ ...ability, name: e.target.value })}
      />
      <Input
        type="number"
        min={1}
        max={20}
        value={ability.level}
        onChange={(e) => setAbility({ ...ability, level: parseInt(e.target.value) || 1 })}
      />
      <div className="sm:col-span-2 flex gap-2">
        <Input
          placeholder="Descrição"
          value={ability.description}
          onChange={(e) => setAbility({ ...ability, description: e.target.value })}
        />
        <Button type="button" variant="outline" onClick={handleAdd}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
