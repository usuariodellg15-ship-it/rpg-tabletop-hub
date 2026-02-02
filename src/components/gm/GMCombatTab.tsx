import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  GripVertical, 
  Plus, 
  ArrowUpDown, 
  Wand2, 
  X, 
  ChevronDown, 
  ChevronRight,
  Dices,
  Trash2,
  Eye,
  Loader2
} from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { toast } from 'sonner';
import { Creature, creatures as creatureCatalog } from '@/data/mockCreatures';

type SystemType = Database['public']['Enums']['system_type'];
type EncounterEntry = Database['public']['Tables']['encounter_entries']['Row'];
type CombatEncounter = Database['public']['Tables']['combat_encounters']['Row'];
type Character = Database['public']['Tables']['characters']['Row'];

interface SortableEntryProps {
  entry: EncounterEntry;
  onInitiativeChange: (id: string, value: number) => void;
  onNameChange: (id: string, name: string) => void;
  onViewCreature: (creatureId: string) => void;
  onRemove: (id: string) => void;
  linkedCreature?: Creature;
  characters: Character[];
}

function SortableEntry({ entry, onInitiativeChange, onNameChange, onViewCreature, onRemove, linkedCreature, characters }: SortableEntryProps) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: entry.id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(entry.custom_name || '');

  const handleSaveName = () => {
    onNameChange(entry.id, editName);
    setIsEditing(false);
  };

  const getPlayerName = () => {
    if (entry.is_player && entry.character_id) {
      const char = characters.find(c => c.id === entry.character_id);
      return char?.name || null;
    }
    return null;
  };

  const playerName = getPlayerName();
  const displayName = entry.custom_name || 'Criatura';

  return (
    <div ref={setNodeRef} style={style} className={`flex items-center gap-3 p-3 rounded-lg border ${entry.is_player ? 'bg-primary/5 border-primary/20' : 'bg-card'}`}>
      <button {...attributes} {...listeners} className="cursor-grab">
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </button>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          {isEditing ? (
            <div className="flex items-center gap-2">
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="h-7 w-40"
                onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
              />
              <Button size="sm" variant="ghost" onClick={handleSaveName}>OK</Button>
            </div>
          ) : (
            <span 
              className="font-semibold cursor-pointer hover:underline" 
              onClick={() => !entry.is_player && setIsEditing(true)}
            >
              {displayName}
            </span>
          )}
          {entry.is_player && <Badge variant="secondary" className="text-xs">Jogador</Badge>}
          {linkedCreature && (
            <Button 
              size="sm" 
              variant="ghost" 
              className="h-6 px-2"
              onClick={() => onViewCreature(linkedCreature.id)}
            >
              <Eye className="h-3 w-3" />
            </Button>
          )}
        </div>
        <div className="text-sm text-muted-foreground">
          PV: {entry.hp_current}/{entry.hp_max} | CA: 10
          {playerName && <span className="ml-2">• Controlado por: {playerName}</span>}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Label className="text-xs text-muted-foreground">Init:</Label>
        <Input 
          type="number" 
          className="w-16 h-8 text-center" 
          value={entry.initiative} 
          onChange={(e) => onInitiativeChange(entry.id, parseInt(e.target.value) || 0)}
        />
      </div>
      <Button size="sm" variant="ghost" onClick={() => onRemove(entry.id)}>
        <Trash2 className="h-4 w-4 text-destructive" />
      </Button>
    </div>
  );
}

interface GMCombatTabProps {
  campaignId: string;
  system: SystemType;
  avgLevelRounded: number;
  characters: Character[];
}

export function GMCombatTab({ 
  campaignId, 
  system, 
  avgLevelRounded, 
  characters
}: GMCombatTabProps) {
  const queryClient = useQueryClient();
  const [isAutoCompleteOpen, setIsAutoCompleteOpen] = useState(false);
  const [creatureCount, setCreatureCount] = useState(1);
  const [distributionMode, setDistributionMode] = useState<'fixed' | 'random'>('fixed');
  const [excludedCreatures, setExcludedCreatures] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<Creature[]>([]);
  const [selectedCreature, setSelectedCreature] = useState<Creature | null>(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor), 
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Fetch or create active encounter
  const { data: encounter, isLoading: loadingEncounter } = useQuery({
    queryKey: ['active-encounter', campaignId],
    queryFn: async () => {
      // Try to find existing active encounter
      const { data: existing, error } = await supabase
        .from('combat_encounters')
        .select('*')
        .eq('campaign_id', campaignId)
        .eq('is_active', true)
        .maybeSingle();

      if (error) throw error;
      if (existing) return existing as CombatEncounter;

      // Create new encounter if none exists
      const { data: created, error: createError } = await supabase
        .from('combat_encounters')
        .insert({
          campaign_id: campaignId,
          name: 'Encontro Atual',
          is_active: true,
          round_number: 1,
          current_turn: 0,
        })
        .select()
        .single();

      if (createError) throw createError;
      return created as CombatEncounter;
    },
  });

  // Fetch encounter entries
  const { data: entries = [], isLoading: loadingEntries } = useQuery({
    queryKey: ['encounter-entries', encounter?.id],
    queryFn: async () => {
      if (!encounter?.id) return [];

      const { data, error } = await supabase
        .from('encounter_entries')
        .select('*')
        .eq('encounter_id', encounter.id)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      return data as EncounterEntry[];
    },
    enabled: !!encounter?.id,
  });

  // Add entry mutation
  const addEntry = useMutation({
    mutationFn: async (creature: Creature) => {
      if (!encounter?.id) throw new Error('No active encounter');

      const existingCount = entries.filter(e => 
        e.custom_name?.startsWith(creature.name)
      ).length;

      const { data, error } = await supabase
        .from('encounter_entries')
        .insert({
          encounter_id: encounter.id,
          custom_name: existingCount > 0 
            ? `${creature.name} ${String.fromCharCode(65 + existingCount)}`
            : creature.name,
          initiative: 0,
          hp_current: creature.hp,
          hp_max: creature.maxHp,
          is_player: false,
          sort_order: entries.length,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['encounter-entries', encounter?.id] });
      toast.success('Criatura adicionada!');
      setAddDialogOpen(false);
      setSearchTerm('');
    },
    onError: (error: any) => {
      console.error('Error adding entry:', error);
      toast.error('Erro ao adicionar criatura.');
    },
  });

  // Add character to encounter
  const addCharacterEntry = useMutation({
    mutationFn: async (character: Character) => {
      if (!encounter?.id) throw new Error('No active encounter');

      // Check if character is already in encounter
      const existing = entries.find(e => e.character_id === character.id);
      if (existing) {
        throw new Error('Personagem já está no encontro');
      }

      const { data, error } = await supabase
        .from('encounter_entries')
        .insert({
          encounter_id: encounter.id,
          character_id: character.id,
          custom_name: character.name,
          initiative: 0,
          hp_current: character.hp_current || 10,
          hp_max: character.hp_max || 10,
          is_player: true,
          sort_order: entries.length,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['encounter-entries', encounter?.id] });
      toast.success('Personagem adicionado!');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Update entry mutation
  const updateEntry = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<EncounterEntry> }) => {
      const { error } = await supabase
        .from('encounter_entries')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['encounter-entries', encounter?.id] });
    },
  });

  // Remove entry mutation
  const removeEntry = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('encounter_entries')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['encounter-entries', encounter?.id] });
      toast.success('Entrada removida!');
    },
    onError: (error: any) => {
      console.error('Error removing entry:', error);
      toast.error('Erro ao remover entrada.');
    },
  });

  // Reorder entries mutation
  const reorderEntries = useMutation({
    mutationFn: async (newOrder: EncounterEntry[]) => {
      const updates = newOrder.map((entry, index) => 
        supabase
          .from('encounter_entries')
          .update({ sort_order: index })
          .eq('id', entry.id)
      );

      await Promise.all(updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['encounter-entries', encounter?.id] });
    },
  });

  // Get creatures for current system
  const systemCreatures = useMemo(() => {
    return creatureCatalog.filter(c => c.system === system);
  }, [system]);

  // Filtered creatures for search
  const filteredCreatures = useMemo(() => {
    if (!searchTerm) return systemCreatures.slice(0, 20);
    return systemCreatures.filter(c => 
      c.name.toLowerCase().includes(searchTerm.toLowerCase())
    ).slice(0, 20);
  }, [systemCreatures, searchTerm]);

  // Pool of available creatures (excluding excluded ones)
  const availablePool = useMemo(() => {
    return systemCreatures.filter(c => !excludedCreatures.includes(c.id));
  }, [systemCreatures, excludedCreatures]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = entries.findIndex(i => i.id === active.id);
      const newIndex = entries.findIndex(i => i.id === over.id);
      const newOrder = arrayMove(entries, oldIndex, newIndex);
      reorderEntries.mutate(newOrder);
    }
  };

  const handleInitiativeChange = (id: string, value: number) => {
    updateEntry.mutate({ id, updates: { initiative: value } });
  };

  const handleNameChange = (id: string, name: string) => {
    updateEntry.mutate({ id, updates: { custom_name: name } });
  };

  const handleSortByInitiative = () => {
    const sorted = [...entries].sort((a, b) => b.initiative - a.initiative);
    reorderEntries.mutate(sorted);
    toast.success('Ordenado por iniciativa!');
  };

  // Generate challenge suggestions
  const generateSuggestions = () => {
    if (availablePool.length === 0) {
      toast.error('Nenhuma criatura disponível no pool!');
      return;
    }

    const targetTotal = avgLevelRounded;
    const result: Creature[] = [];

    if (distributionMode === 'fixed') {
      const threatPerCreature = Math.max(1, Math.floor(targetTotal / creatureCount));
      
      for (let i = 0; i < creatureCount; i++) {
        const candidates = availablePool.filter(c => {
          const cr = typeof c.cr === 'number' ? c.cr : parseFloat(c.cr?.toString() || '0.25');
          return cr <= threatPerCreature + 1;
        });
        
        if (candidates.length > 0) {
          const picked = candidates[Math.floor(Math.random() * candidates.length)];
          result.push(picked);
        }
      }
    } else {
      let remainingThreat = targetTotal;
      let attempts = 0;
      
      while (remainingThreat > 0 && result.length < creatureCount && attempts < 100) {
        attempts++;
        const maxThreat = Math.min(remainingThreat, Math.ceil(targetTotal / creatureCount) + 1);
        
        const candidates = availablePool.filter(c => {
          const cr = typeof c.cr === 'number' ? c.cr : parseFloat(c.cr?.toString() || '0.25');
          return cr <= maxThreat && cr > 0;
        });
        
        if (candidates.length > 0) {
          const picked = candidates[Math.floor(Math.random() * candidates.length)];
          result.push(picked);
          const cr = typeof picked.cr === 'number' ? picked.cr : parseFloat(picked.cr?.toString() || '0.25');
          remainingThreat -= cr;
        }
      }
    }

    setSuggestions(result);
    toast.success(`${result.length} criaturas sugeridas!`);
  };

  const removeSuggestion = (index: number) => {
    setSuggestions(prev => prev.filter((_, i) => i !== index));
  };

  const addSuggestionsToEncounter = async () => {
    for (const creature of suggestions) {
      await addEntry.mutateAsync(creature);
    }
    setSuggestions([]);
    setIsAutoCompleteOpen(false);
  };

  const toggleExcludeCreature = (creatureId: string) => {
    setExcludedCreatures(prev => 
      prev.includes(creatureId) 
        ? prev.filter(id => id !== creatureId)
        : [...prev, creatureId]
    );
  };

  const isLoading = loadingEncounter || loadingEntries;

  return (
    <div className="space-y-6">
      {/* Initiative Tracker */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Rastreador de Iniciativa</CardTitle>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={handleSortByInitiative} disabled={entries.length === 0}>
              <ArrowUpDown className="h-4 w-4 mr-1" />Organizar
            </Button>
            <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-1" />Adicionar
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Adicionar ao Encontro</DialogTitle>
                </DialogHeader>
                
                {/* Character section */}
                {characters.length > 0 && (
                  <div className="mb-4">
                    <Label className="text-sm font-medium mb-2 block">Personagens dos Jogadores</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {characters.map(char => {
                        const isInEncounter = entries.some(e => e.character_id === char.id);
                        return (
                          <Button
                            key={char.id}
                            variant={isInEncounter ? 'secondary' : 'outline'}
                            size="sm"
                            className="justify-start"
                            disabled={isInEncounter || addCharacterEntry.isPending}
                            onClick={() => addCharacterEntry.mutate(char)}
                          >
                            {char.name}
                            {isInEncounter && <Badge variant="secondary" className="ml-2 text-xs">No encontro</Badge>}
                          </Button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Creature search */}
                <div>
                  <Label className="text-sm font-medium mb-2 block">Criaturas do Sistema</Label>
                  <Input
                    placeholder="Buscar criatura..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="mb-2"
                  />
                  <ScrollArea className="h-48 border rounded-md">
                    <div className="p-2 space-y-1">
                      {filteredCreatures.map(c => (
                        <Button
                          key={c.id}
                          variant="ghost"
                          size="sm"
                          className="w-full justify-between"
                          onClick={() => addEntry.mutate(c)}
                          disabled={addEntry.isPending}
                        >
                          <span>{c.name}</span>
                          <span className="text-muted-foreground text-xs">
                            CR {c.cr} | PV {c.hp}
                          </span>
                        </Button>
                      ))}
                      {filteredCreatures.length === 0 && (
                        <p className="text-center text-muted-foreground py-4">
                          Nenhuma criatura encontrada.
                        </p>
                      )}
                    </div>
                  </ScrollArea>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Arraste para reordenar ou clique em "Organizar" para ordenar por iniciativa. 
            Clique no nome de criaturas para renomear.
          </p>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={entries.map(e => e.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-2">
                  {entries.map(entry => {
                    const linked = creatureCatalog.find(c => c.name === entry.custom_name?.split(' ')[0]);
                    return (
                      <SortableEntry 
                        key={entry.id} 
                        entry={entry}
                        onInitiativeChange={handleInitiativeChange}
                        onNameChange={handleNameChange}
                        onViewCreature={(id) => setSelectedCreature(creatureCatalog.find(c => c.id === id) || null)}
                        onRemove={(id) => removeEntry.mutate(id)}
                        linkedCreature={linked}
                        characters={characters}
                      />
                    );
                  })}
                </div>
              </SortableContext>
            </DndContext>
          )}

          {!isLoading && entries.length === 0 && (
            <p className="text-center text-muted-foreground py-8">
              Nenhum encontro ativo. Use "Autocompletar Desafio" ou adicione criaturas manualmente.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Auto-Complete Challenge */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5" />
            Autocompletar Desafio
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Gere sugestões de criaturas baseadas no nível médio do grupo ({avgLevelRounded}).
          </p>

          <div className="grid md:grid-cols-3 gap-4 mb-4">
            <div>
              <Label className="text-sm">Quantidade de Criaturas</Label>
              <Input
                type="number"
                min={1}
                max={10}
                value={creatureCount}
                onChange={(e) => setCreatureCount(parseInt(e.target.value) || 1)}
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-sm">Modo de Distribuição</Label>
              <Select value={distributionMode} onValueChange={(v) => setDistributionMode(v as 'fixed' | 'random')}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fixed">Distribuição Fixa</SelectItem>
                  <SelectItem value="random">Distribuição Aleatória</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button onClick={generateSuggestions} className="w-full">
                <Dices className="h-4 w-4 mr-2" />
                Gerar Sugestões
              </Button>
            </div>
          </div>

          {/* Pool Management */}
          <Collapsible>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="mb-2">
                <ChevronRight className="h-4 w-4 mr-1 transition-transform data-[state=open]:rotate-90" />
                Gerenciar Pool de Criaturas ({availablePool.length} disponíveis)
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <ScrollArea className="h-48 border rounded-md p-2">
                <div className="space-y-1">
                  {systemCreatures.map(c => (
                    <div key={c.id} className="flex items-center gap-2 p-1">
                      <Checkbox
                        checked={!excludedCreatures.includes(c.id)}
                        onCheckedChange={() => toggleExcludeCreature(c.id)}
                      />
                      <span className={excludedCreatures.includes(c.id) ? 'line-through text-muted-foreground' : ''}>
                        {c.name} (CR {c.cr})
                      </span>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CollapsibleContent>
          </Collapsible>

          {/* Suggestions */}
          {suggestions.length > 0 && (
            <div className="mt-4 border rounded-md p-4 bg-muted/30">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold">Sugestões Geradas</h4>
                <Button size="sm" onClick={addSuggestionsToEncounter} disabled={addEntry.isPending}>
                  {addEntry.isPending ? (
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4 mr-1" />
                  )}
                  Adicionar ao Encontro
                </Button>
              </div>
              <div className="space-y-2">
                {suggestions.map((c, i) => (
                  <div key={`${c.id}-${i}`} className="flex items-center justify-between p-2 bg-card rounded border">
                    <div>
                      <span className="font-medium">{c.name}</span>
                      <span className="text-sm text-muted-foreground ml-2">
                        CR {c.cr} | PV {c.hp} | CA {c.ac}
                      </span>
                    </div>
                    <Button size="sm" variant="ghost" onClick={() => removeSuggestion(i)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                * Sugestões são temporárias. Só serão salvas ao clicar em "Adicionar ao Encontro".
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Creature Detail Modal */}
      <Dialog open={!!selectedCreature} onOpenChange={(open) => !open && setSelectedCreature(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          {selectedCreature && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <span className="text-2xl">👹</span>
                  {selectedCreature.name}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <p className="text-muted-foreground">{selectedCreature.description}</p>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-muted rounded">
                    <p className="text-2xl font-bold">{selectedCreature.hp}</p>
                    <p className="text-xs text-muted-foreground">Pontos de Vida</p>
                  </div>
                  <div className="text-center p-3 bg-muted rounded">
                    <p className="text-2xl font-bold">{selectedCreature.ac}</p>
                    <p className="text-xs text-muted-foreground">Classe de Armadura</p>
                  </div>
                  <div className="text-center p-3 bg-muted rounded">
                    <p className="text-2xl font-bold">{selectedCreature.cr}</p>
                    <p className="text-xs text-muted-foreground">Nível de Desafio</p>
                  </div>
                </div>

                {/* Actions */}
                {selectedCreature.actions.length > 0 && (
                  <Collapsible defaultOpen>
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" className="w-full justify-start">
                        <ChevronDown className="h-4 w-4 mr-2" />
                        Ações ({selectedCreature.actions.length})
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-2 mt-2">
                      {selectedCreature.actions.map(a => (
                        <div key={a.id} className="p-3 border rounded bg-card">
                          <p className="font-semibold">{a.name}</p>
                          <p className="text-sm text-muted-foreground">{a.description}</p>
                          {a.damage && <Badge className="mt-1">{a.damage}</Badge>}
                        </div>
                      ))}
                    </CollapsibleContent>
                  </Collapsible>
                )}

                {/* Reactions */}
                {selectedCreature.reactions && selectedCreature.reactions.length > 0 && (
                  <Collapsible>
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" className="w-full justify-start">
                        <ChevronDown className="h-4 w-4 mr-2" />
                        Reações ({selectedCreature.reactions.length})
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-2 mt-2">
                      {selectedCreature.reactions.map(r => (
                        <div key={r.id} className="p-3 border rounded bg-card">
                          <p className="font-semibold">{r.name}</p>
                          <p className="text-sm text-muted-foreground">{r.description}</p>
                        </div>
                      ))}
                    </CollapsibleContent>
                  </Collapsible>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
