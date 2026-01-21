import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Search, Filter, ChevronDown, ChevronRight, Shield, Heart, Swords, Plus } from 'lucide-react';
import { SystemType } from '@/data/mockData';
import { creatures, Creature, CreatureAction } from '@/data/mockCreatures';

interface CreaturesTabProps {
  system: SystemType;
  onAddToInitiative?: (creature: Creature) => void;
}

function ActionCard({ action, isOpen, onToggle }: { action: CreatureAction; isOpen: boolean; onToggle: () => void }) {
  return (
    <Collapsible open={isOpen} onOpenChange={onToggle}>
      <CollapsibleTrigger className="w-full flex items-center justify-between p-2 hover:bg-muted rounded-lg transition-colors">
        <span className="font-medium text-sm">{action.name}</span>
        {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
      </CollapsibleTrigger>
      <CollapsibleContent className="px-2 pb-2">
        <p className="text-sm text-muted-foreground">{action.description}</p>
        {action.damage && (
          <p className="text-sm mt-1">
            <span className="text-muted-foreground">Dano:</span> <strong>{action.damage}</strong>
          </p>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
}

export default function CreaturesTab({ system, onAddToInitiative }: CreaturesTabProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [crFilter, setCrFilter] = useState('all');
  const [selectedCreature, setSelectedCreature] = useState<Creature | null>(null);
  const [openActions, setOpenActions] = useState<Record<string, boolean>>({});

  const systemCreatures = creatures.filter(c => c.system === system);
  
  const filteredCreatures = systemCreatures.filter(creature => {
    if (searchQuery && !creature.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (typeFilter !== 'all' && creature.type !== typeFilter) return false;
    if (crFilter !== 'all') {
      const crValue = typeof creature.cr === 'number' ? creature.cr : parseFloat(creature.cr?.toString() || '0');
      if (crFilter === 'low' && crValue > 2) return false;
      if (crFilter === 'medium' && (crValue <= 2 || crValue > 5)) return false;
      if (crFilter === 'high' && crValue <= 5) return false;
    }
    return true;
  });

  const types = [...new Set(systemCreatures.map(c => c.type))];

  const toggleAction = useCallback((actionId: string) => {
    setOpenActions(prev => ({ ...prev, [actionId]: !prev[actionId] }));
  }, []);

  const handleAddToInitiative = useCallback(() => {
    if (selectedCreature && onAddToInitiative) {
      onAddToInitiative(selectedCreature);
      setSelectedCreature(null);
    }
  }, [selectedCreature, onAddToInitiative]);

  return (
    <>
      <div className="space-y-4">
        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar criatura..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-40">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os tipos</SelectItem>
              {types.map(type => (
                <SelectItem key={type} value={type}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={crFilter} onValueChange={setCrFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Nível" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os níveis</SelectItem>
              <SelectItem value="low">Baixo (CR ≤2)</SelectItem>
              <SelectItem value="medium">Médio (CR 3-5)</SelectItem>
              <SelectItem value="high">Alto (CR &gt;5)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Creatures List */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredCreatures.map(creature => (
            <Card 
              key={creature.id} 
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setSelectedCreature(creature)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                    {creature.imageUrl ? (
                      <img src={creature.imageUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <Swords className="h-6 w-6 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{creature.name}</p>
                    <p className="text-xs text-muted-foreground">{creature.type}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs">
                      <span className="flex items-center gap-1">
                        <Heart className="h-3 w-3 text-red-500" />
                        {creature.hp}
                      </span>
                      <span className="flex items-center gap-1">
                        <Shield className="h-3 w-3 text-blue-500" />
                        {creature.ac}
                      </span>
                      {creature.cr && (
                        <Badge variant="outline" className="text-xs">
                          CR {creature.cr}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredCreatures.length === 0 && (
          <p className="text-center text-muted-foreground py-8">
            Nenhuma criatura encontrada para este sistema.
          </p>
        )}
      </div>

      {/* Creature Detail Modal */}
      <Dialog open={!!selectedCreature} onOpenChange={(open) => !open && setSelectedCreature(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedCreature && (
            <>
              <DialogHeader>
                <div className="flex items-start gap-4">
                  <div className="h-16 w-16 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                    {selectedCreature.imageUrl ? (
                      <img src={selectedCreature.imageUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <Swords className="h-8 w-8 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <DialogTitle className="text-2xl">{selectedCreature.name}</DialogTitle>
                    <p className="text-muted-foreground">{selectedCreature.type}</p>
                    {selectedCreature.cr && (
                      <Badge variant="secondary" className="mt-1">CR {selectedCreature.cr}</Badge>
                    )}
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-6">
                <p className="text-muted-foreground">{selectedCreature.description}</p>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-3 text-center">
                      <Heart className="h-5 w-5 mx-auto text-red-500 mb-1" />
                      <p className="text-2xl font-bold">{selectedCreature.hp}</p>
                      <p className="text-xs text-muted-foreground">Pontos de Vida</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-3 text-center">
                      <Shield className="h-5 w-5 mx-auto text-blue-500 mb-1" />
                      <p className="text-2xl font-bold">{selectedCreature.ac}</p>
                      <p className="text-xs text-muted-foreground">CA</p>
                    </CardContent>
                  </Card>
                  {selectedCreature.speed && (
                    <Card className="sm:col-span-2">
                      <CardContent className="p-3 text-center">
                        <p className="text-sm font-medium">Velocidade</p>
                        <p className="text-muted-foreground">{selectedCreature.speed}</p>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Attributes */}
                {(selectedCreature.str || selectedCreature.dex) && (
                  <div className="grid grid-cols-6 gap-2">
                    {[
                      { label: 'FOR', value: selectedCreature.str },
                      { label: 'DES', value: selectedCreature.dex },
                      { label: 'CON', value: selectedCreature.con },
                      { label: 'INT', value: selectedCreature.int },
                      { label: 'SAB', value: selectedCreature.wis },
                      { label: 'CAR', value: selectedCreature.cha },
                    ].map(attr => attr.value !== undefined && (
                      <div key={attr.label} className="text-center p-2 bg-muted rounded-lg">
                        <p className="text-xs text-muted-foreground">{attr.label}</p>
                        <p className="font-bold">{attr.value}</p>
                        <p className="text-xs text-muted-foreground">
                          ({attr.value >= 10 ? '+' : ''}{Math.floor((attr.value - 10) / 2)})
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Skills, Resistances, etc. */}
                <div className="grid sm:grid-cols-2 gap-4 text-sm">
                  {selectedCreature.skills && selectedCreature.skills.length > 0 && (
                    <div>
                      <p className="font-medium mb-1">Perícias</p>
                      <p className="text-muted-foreground">{selectedCreature.skills.join(', ')}</p>
                    </div>
                  )}
                  {selectedCreature.saves && selectedCreature.saves.length > 0 && (
                    <div>
                      <p className="font-medium mb-1">Salvaguardas</p>
                      <p className="text-muted-foreground">{selectedCreature.saves.join(', ')}</p>
                    </div>
                  )}
                  {selectedCreature.resistances && selectedCreature.resistances.length > 0 && (
                    <div>
                      <p className="font-medium mb-1">Resistências</p>
                      <div className="flex flex-wrap gap-1">
                        {selectedCreature.resistances.map(r => (
                          <Badge key={r} variant="outline" className="text-xs">{r}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {selectedCreature.immunities && selectedCreature.immunities.length > 0 && (
                    <div>
                      <p className="font-medium mb-1">Imunidades</p>
                      <div className="flex flex-wrap gap-1">
                        {selectedCreature.immunities.map(i => (
                          <Badge key={i} variant="secondary" className="text-xs">{i}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {selectedCreature.vulnerabilities && selectedCreature.vulnerabilities.length > 0 && (
                    <div>
                      <p className="font-medium mb-1">Vulnerabilidades</p>
                      <div className="flex flex-wrap gap-1">
                        {selectedCreature.vulnerabilities.map(v => (
                          <Badge key={v} variant="destructive" className="text-xs">{v}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {selectedCreature.senses && (
                    <div>
                      <p className="font-medium mb-1">Sentidos</p>
                      <p className="text-muted-foreground">{selectedCreature.senses}</p>
                    </div>
                  )}
                  {selectedCreature.languages && (
                    <div>
                      <p className="font-medium mb-1">Idiomas</p>
                      <p className="text-muted-foreground">{selectedCreature.languages}</p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                {selectedCreature.actions.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Ações</h4>
                    <div className="border rounded-lg divide-y">
                      {selectedCreature.actions.map(action => (
                        <ActionCard
                          key={action.id}
                          action={action}
                          isOpen={openActions[action.id] || false}
                          onToggle={() => toggleAction(action.id)}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Reactions */}
                {selectedCreature.reactions && selectedCreature.reactions.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Reações</h4>
                    <div className="border rounded-lg divide-y">
                      {selectedCreature.reactions.map(action => (
                        <ActionCard
                          key={action.id}
                          action={action}
                          isOpen={openActions[action.id] || false}
                          onToggle={() => toggleAction(action.id)}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Legendary Actions */}
                {selectedCreature.legendaryActions && selectedCreature.legendaryActions.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Ações Lendárias</h4>
                    <div className="border rounded-lg divide-y">
                      {selectedCreature.legendaryActions.map(action => (
                        <ActionCard
                          key={action.id}
                          action={action}
                          isOpen={openActions[action.id] || false}
                          onToggle={() => toggleAction(action.id)}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Add to Initiative Button */}
                {onAddToInitiative && (
                  <Button className="w-full" onClick={handleAddToInitiative}>
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar à Iniciativa
                  </Button>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

export { creatures, type Creature };
