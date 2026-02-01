import { useState, useMemo } from 'react';
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
  Eye
} from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { toast } from 'sonner';
import { EncounterCreature, SystemType } from '@/data/mockData';
import { Creature, creatures as creatureCatalog } from '@/data/mockCreatures';

// Simplified character interface for combat tab
interface CombatCharacter {
  id: string;
  campaignId: string;
  userId: string;
  name: string;
  class: string;
  level: number;
  hp: number;
  maxHp: number;
  ac: number;
}

interface SortableCreatureProps {
  creature: EncounterCreature;
  onInitiativeChange: (id: string, value: number) => void;
  onNameChange: (id: string, name: string) => void;
  onViewCreature: (creatureId: string) => void;
  linkedCreature?: Creature;
  characters: CombatCharacter[];
}

function SortableCreature({ creature, onInitiativeChange, onNameChange, onViewCreature, linkedCreature, characters }: SortableCreatureProps) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: creature.id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(creature.name);

  const handleSaveName = () => {
    onNameChange(creature.id, editName);
    setIsEditing(false);
  };

  // Get player name if it's a player character
  const getPlayerName = () => {
    if (creature.isPlayer && creature.characterId) {
      const char = characters.find(c => c.id === creature.characterId);
      return char?.name || null;
    }
    return null;
  };

  const playerName = getPlayerName();

  return (
    <div ref={setNodeRef} style={style} className={`flex items-center gap-3 p-3 rounded-lg border ${creature.isPlayer ? 'bg-primary/5 border-primary/20' : 'bg-card'}`}>
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
              onClick={() => !creature.isPlayer && setIsEditing(true)}
            >
              {creature.name}
            </span>
          )}
          {creature.isPlayer && <Badge variant="secondary" className="text-xs">Jogador</Badge>}
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
          PV: {creature.hp}/{creature.maxHp} | CA: {creature.ac}
          {playerName && <span className="ml-2">• Controlado por: {playerName}</span>}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Label className="text-xs text-muted-foreground">Init:</Label>
        <Input 
          type="number" 
          className="w-16 h-8 text-center" 
          value={creature.initiative} 
          onChange={(e) => onInitiativeChange(creature.id, parseInt(e.target.value) || 0)}
        />
      </div>
      <Button size="sm" variant="outline">Atacar</Button>
    </div>
  );
}

interface GMCombatTabProps {
  campaignId: string;
  system: SystemType;
  avgLevelRounded: number;
  creatures: EncounterCreature[];
  setCreatures: React.Dispatch<React.SetStateAction<EncounterCreature[]>>;
  characters: CombatCharacter[];
}

export function GMCombatTab({ 
  campaignId, 
  system, 
  avgLevelRounded, 
  creatures, 
  setCreatures,
  characters
}: GMCombatTabProps) {
  const [isAutoCompleteOpen, setIsAutoCompleteOpen] = useState(false);
  const [creatureCount, setCreatureCount] = useState(1);
  const [distributionMode, setDistributionMode] = useState<'fixed' | 'random'>('fixed');
  const [excludedCreatures, setExcludedCreatures] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<Creature[]>([]);
  const [selectedCreature, setSelectedCreature] = useState<Creature | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor), 
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Get creatures for current system
  const systemCreatures = useMemo(() => {
    return creatureCatalog.filter(c => c.system === system);
  }, [system]);

  // Pool of available creatures (excluding excluded ones)
  const availablePool = useMemo(() => {
    return systemCreatures.filter(c => !excludedCreatures.includes(c.id));
  }, [systemCreatures, excludedCreatures]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setCreatures((items) => {
        const oldIndex = items.findIndex(i => i.id === active.id);
        const newIndex = items.findIndex(i => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleInitiativeChange = (id: string, value: number) => {
    setCreatures(prev => prev.map(c => c.id === id ? { ...c, initiative: value } : c));
  };

  const handleNameChange = (id: string, name: string) => {
    setCreatures(prev => prev.map(c => c.id === id ? { ...c, name } : c));
  };

  const handleSortByInitiative = () => {
    setCreatures(prev => [...prev].sort((a, b) => b.initiative - a.initiative));
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
      // Fixed distribution: divide total evenly
      const threatPerCreature = Math.max(1, Math.floor(targetTotal / creatureCount));
      
      for (let i = 0; i < creatureCount; i++) {
        // Find creature closest to target threat
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
      // Random distribution: random combinations that sum to total
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

  const addSuggestionsToEncounter = () => {
    const newCreatures: EncounterCreature[] = suggestions.map((c, index) => ({
      id: `ec-${Date.now()}-${index}`,
      name: `${c.name} ${String.fromCharCode(65 + index)}`,
      initiative: 0,
      hp: c.hp,
      maxHp: c.maxHp,
      ac: c.ac,
      conditions: [],
      isPlayer: false,
      linkedCreatureId: c.id,
    }));

    setCreatures(prev => [...prev, ...newCreatures]);
    setSuggestions([]);
    setIsAutoCompleteOpen(false);
    toast.success('Criaturas adicionadas ao encontro!');
  };

  const toggleExcludeCreature = (creatureId: string) => {
    setExcludedCreatures(prev => 
      prev.includes(creatureId) 
        ? prev.filter(id => id !== creatureId)
        : [...prev, creatureId]
    );
  };

  return (
    <div className="space-y-6">
      {/* Initiative Tracker */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Rastreador de Iniciativa</CardTitle>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={handleSortByInitiative}>
              <ArrowUpDown className="h-4 w-4 mr-1" />Organizar
            </Button>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1" />Adicionar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Arraste para reordenar ou clique em "Organizar" para ordenar por iniciativa. 
            Clique no nome de criaturas para renomear.
          </p>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={creatures.map(c => c.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-2">
                {creatures.map(creature => {
                  const linked = creatureCatalog.find(c => c.id === (creature as any).linkedCreatureId);
                  return (
                    <SortableCreature 
                      key={creature.id} 
                      creature={creature} 
                      onInitiativeChange={handleInitiativeChange}
                      onNameChange={handleNameChange}
                      onViewCreature={(id) => setSelectedCreature(creatureCatalog.find(c => c.id === id) || null)}
                      linkedCreature={linked}
                      characters={characters}
                    />
                  );
                })}
              </div>
            </SortableContext>
          </DndContext>
          {creatures.length === 0 && (
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
                <Button size="sm" onClick={addSuggestionsToEncounter}>
                  <Plus className="h-4 w-4 mr-1" />
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
