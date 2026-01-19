import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { useTheme } from '@/contexts/ThemeContext';
import { 
  campaigns, 
  characters, 
  diceRolls, 
  timelineEvents, 
  missions, 
  encounters, 
  users, 
  getEventIcon, 
  getEventTypeName, 
  EncounterCreature,
  TimelineEvent,
  Mission,
  EventType,
  eventTypes,
  combatStats
} from '@/data/mockData';
import { 
  ArrowLeft, 
  Shield, 
  Users, 
  Swords, 
  Clock, 
  Target, 
  FileText, 
  GripVertical, 
  Plus, 
  Edit, 
  Check,
  ArrowUpDown,
  TrendingUp,
  Heart,
  Skull,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RollsSidebar } from '@/components/campaign/RollsSidebar';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { toast } from 'sonner';

interface SortableCreatureProps {
  creature: EncounterCreature;
  onInitiativeChange: (id: string, value: number) => void;
}

function SortableCreature({ creature, onInitiativeChange }: SortableCreatureProps) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: creature.id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  
  return (
    <div ref={setNodeRef} style={style} className={`flex items-center gap-3 p-3 rounded-lg border ${creature.isPlayer ? 'bg-primary/5 border-primary/20' : 'bg-card'}`}>
      <button {...attributes} {...listeners} className="cursor-grab"><GripVertical className="h-4 w-4 text-muted-foreground" /></button>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="font-semibold">{creature.name}</span>
          {creature.isPlayer && <Badge variant="secondary" className="text-xs">Jogador</Badge>}
        </div>
        <div className="text-sm text-muted-foreground">
          PV: {creature.hp}/{creature.maxHp} | CA: {creature.ac}
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

export default function GMShieldPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { setThemeBySystem } = useTheme();
  const campaign = campaigns.find(c => c.id === id);
  const chars = characters.filter(c => c.campaignId === id);
  const rolls = diceRolls.filter(r => r.campaignId === id);
  const campaignEvents = timelineEvents.filter(e => e.campaignId === id);
  const [events, setEvents] = useState<TimelineEvent[]>(campaignEvents);
  const campaignMissionsData = missions.filter(m => m.campaignId === id);
  const [missionsList, setMissionsList] = useState<Mission[]>(campaignMissionsData);
  const encounter = encounters.find(e => e.campaignId === id && e.isActive);
  
  const [creatures, setCreatures] = useState<EncounterCreature[]>(encounter?.creatures || []);
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null);
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [isAddMissionOpen, setIsAddMissionOpen] = useState(false);
  const [editingMission, setEditingMission] = useState<Mission | null>(null);
  
  // New event form state
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventDesc, setNewEventDesc] = useState('');
  const [newEventType, setNewEventType] = useState<EventType>('discovery');
  const [newEventTags, setNewEventTags] = useState('');
  const [newEventDate, setNewEventDate] = useState('');
  
  // New mission form state
  const [newMissionTitle, setNewMissionTitle] = useState('');
  const [newMissionDesc, setNewMissionDesc] = useState('');
  const [newMissionObjectives, setNewMissionObjectives] = useState('');
  const [newMissionRewards, setNewMissionRewards] = useState('');
  
  const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));

  useEffect(() => {
    if (campaign) setThemeBySystem(campaign.system);
  }, [campaign, setThemeBySystem]);

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

  const handleSortByInitiative = () => {
    setCreatures(prev => [...prev].sort((a, b) => b.initiative - a.initiative));
    toast.success('Ordenado por iniciativa!');
  };

  const handleAddEvent = () => {
    const newEvent: TimelineEvent = {
      id: `event-${Date.now()}`,
      campaignId: id!,
      title: newEventTitle,
      description: newEventDesc,
      type: newEventType,
      tags: newEventTags.split(',').map(t => t.trim()).filter(Boolean),
      date: newEventDate || new Date().toISOString().split('T')[0],
      attachments: [],
    };
    setEvents(prev => [newEvent, ...prev]);
    setIsAddEventOpen(false);
    setNewEventTitle('');
    setNewEventDesc('');
    setNewEventType('discovery');
    setNewEventTags('');
    setNewEventDate('');
    toast.success('Evento adicionado!');
  };

  const handleAddMission = () => {
    const newMission: Mission = {
      id: `mission-${Date.now()}`,
      campaignId: id!,
      title: newMissionTitle,
      description: newMissionDesc,
      status: 'active',
      notes: '',
      objectives: newMissionObjectives.split('\n').filter(Boolean),
      rewards: newMissionRewards,
      createdAt: new Date().toISOString(),
    };
    setMissionsList(prev => [newMission, ...prev]);
    setIsAddMissionOpen(false);
    resetMissionForm();
    toast.success('Missão adicionada!');
  };

  const handleEditMission = () => {
    if (!editingMission) return;
    setMissionsList(prev => prev.map(m => 
      m.id === editingMission.id 
        ? { 
            ...editingMission, 
            title: newMissionTitle, 
            description: newMissionDesc,
            objectives: newMissionObjectives.split('\n').filter(Boolean),
            rewards: newMissionRewards,
          } 
        : m
    ));
    setEditingMission(null);
    resetMissionForm();
    toast.success('Missão atualizada!');
  };

  const handleCompleteMission = () => {
    if (!editingMission) return;
    setMissionsList(prev => prev.map(m => 
      m.id === editingMission.id ? { ...m, status: 'completed' as const } : m
    ));
    setEditingMission(null);
    resetMissionForm();
    toast.success('Missão concluída!');
  };

  const resetMissionForm = () => {
    setNewMissionTitle('');
    setNewMissionDesc('');
    setNewMissionObjectives('');
    setNewMissionRewards('');
  };

  const openEditMission = (mission: Mission) => {
    setEditingMission(mission);
    setNewMissionTitle(mission.title);
    setNewMissionDesc(mission.description);
    setNewMissionObjectives(mission.objectives?.join('\n') || '');
    setNewMissionRewards(mission.rewards || '');
  };

  // Calculate dashboard metrics
  const avgLevel = chars.length > 0 ? Math.round(chars.reduce((sum, c) => sum + c.level, 0) / chars.length) : 0;
  
  const charStats = chars.map(c => ({
    char: c,
    stats: combatStats[c.id] || { damageDealt: 0, damageReceived: 0, healingDone: 0, oddsDealt: 0 }
  }));
  
  const avgDamage = charStats.length > 0 
    ? Math.round(charStats.reduce((sum, c) => sum + c.stats.damageDealt, 0) / charStats.length) 
    : 0;
  
  const topDamageDealer = charStats.sort((a, b) => b.stats.damageDealt - a.stats.damageDealt)[0];
  const topHealer = charStats.sort((a, b) => b.stats.healingDone - a.stats.healingDone)[0];
  const mostDamageReceived = charStats.sort((a, b) => b.stats.damageReceived - a.stats.damageReceived)[0];

  if (!campaign) return <MainLayout><div className="container py-8">Campanha não encontrada.</div></MainLayout>;

  return (
    <MainLayout>
      <div className="flex h-[calc(100vh-4rem)]">
        <div className="flex-1 overflow-auto p-6">
          <div className="flex items-center gap-4 mb-6">
            <Link to={`/campaigns/${id}`}><Button variant="ghost"><ArrowLeft className="h-4 w-4 mr-2" />Voltar</Button></Link>
            <div>
              <h1 className="text-2xl font-heading font-bold flex items-center gap-2"><Shield className="h-6 w-6" />Escudo do Mestre</h1>
              <p className="text-muted-foreground">{campaign.name}</p>
            </div>
          </div>

          <Tabs defaultValue="overview">
            <TabsList className="mb-4">
              <TabsTrigger value="overview">Painel</TabsTrigger>
              <TabsTrigger value="characters"><Users className="h-4 w-4 mr-1" />Personagens</TabsTrigger>
              <TabsTrigger value="combat"><Swords className="h-4 w-4 mr-1" />Combate</TabsTrigger>
              <TabsTrigger value="timeline"><Clock className="h-4 w-4 mr-1" />Timeline</TabsTrigger>
              <TabsTrigger value="missions"><Target className="h-4 w-4 mr-1" />Missões</TabsTrigger>
              <TabsTrigger value="notes"><FileText className="h-4 w-4 mr-1" />Notas</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <div className="grid md:grid-cols-3 gap-4 mb-6">
                <Card>
                  <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Nível Médio</CardTitle></CardHeader>
                  <CardContent><p className="text-3xl font-bold">{avgLevel}</p></CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Dano Médio/Jogador</CardTitle></CardHeader>
                  <CardContent><p className="text-3xl font-bold">{avgDamage}</p></CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Missões Ativas</CardTitle></CardHeader>
                  <CardContent><p className="text-3xl font-bold">{missionsList.filter(m => m.status === 'active').length}</p></CardContent>
                </Card>
              </div>

              <h3 className="font-heading font-semibold mb-3">Destaques do Grupo</h3>
              <div className="grid md:grid-cols-3 gap-4 mb-6">
                <Card className="border-orange-500/30">
                  <CardContent className="flex items-center gap-3 p-4">
                    <div className="h-10 w-10 rounded-full bg-orange-500/20 flex items-center justify-center">
                      <Zap className="h-5 w-5 text-orange-500" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Mais Dano Causado</p>
                      <p className="font-semibold">{topDamageDealer?.char.name || '-'}</p>
                      <p className="text-sm text-muted-foreground">{topDamageDealer?.stats.damageDealt || 0} de dano</p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-green-500/30">
                  <CardContent className="flex items-center gap-3 p-4">
                    <div className="h-10 w-10 rounded-full bg-green-500/20 flex items-center justify-center">
                      <Heart className="h-5 w-5 text-green-500" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Mais Cura</p>
                      <p className="font-semibold">{topHealer?.char.name || '-'}</p>
                      <p className="text-sm text-muted-foreground">{topHealer?.stats.healingDone || 0} curado</p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-red-500/30">
                  <CardContent className="flex items-center gap-3 p-4">
                    <div className="h-10 w-10 rounded-full bg-red-500/20 flex items-center justify-center">
                      <Skull className="h-5 w-5 text-red-500" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Mais Dano Recebido</p>
                      <p className="font-semibold">{mostDamageReceived?.char.name || '-'}</p>
                      <p className="text-sm text-muted-foreground">{mostDamageReceived?.stats.damageReceived || 0} recebido</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <Card><CardHeader><CardTitle>Personagens Críticos</CardTitle></CardHeader><CardContent>
                  {chars.filter(c => c.hp < c.maxHp * 0.3).map(c => (
                    <div key={c.id} className="flex justify-between py-2"><span>{c.name}</span><Badge variant="destructive">{c.hp}/{c.maxHp}</Badge></div>
                  ))}
                  {chars.filter(c => c.hp < c.maxHp * 0.3).length === 0 && <p className="text-muted-foreground text-sm">Todos saudáveis</p>}
                </CardContent></Card>
                <Card><CardHeader><CardTitle>Próximos Eventos</CardTitle></CardHeader><CardContent>
                  {events.slice(0, 3).map(e => <p key={e.id} className="py-1 text-sm">{getEventIcon(e.type)} {e.title}</p>)}
                </CardContent></Card>
              </div>
            </TabsContent>

            <TabsContent value="characters">
              <div className="space-y-3">
                {chars.map(c => (
                  <Card key={c.id}><CardContent className="flex items-center justify-between p-4">
                    <div><p className="font-semibold">{c.name}</p><p className="text-sm text-muted-foreground">{c.class} Nv.{c.level}</p></div>
                    <div className="flex items-center gap-4">
                      <div className="text-center"><p className="text-xs text-muted-foreground">PV</p><p className="font-bold">{c.hp}/{c.maxHp}</p></div>
                      <div className="text-center"><p className="text-xs text-muted-foreground">CA</p><p className="font-bold">{c.ac}</p></div>
                      <Button size="sm" variant="outline" onClick={() => navigate(`/characters/${c.id}`)}>
                        <Edit className="h-4 w-4 mr-1" />Editar
                      </Button>
                    </div>
                  </CardContent></Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="combat">
              <Card><CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Rastreador de Iniciativa</CardTitle>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={handleSortByInitiative}>
                    <ArrowUpDown className="h-4 w-4 mr-1" />Organizar
                  </Button>
                  <Button size="sm"><Plus className="h-4 w-4 mr-1" />Adicionar</Button>
                </div>
              </CardHeader><CardContent>
                <p className="text-sm text-muted-foreground mb-4">Arraste para reordenar ou clique em "Organizar" para ordenar por iniciativa</p>
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                  <SortableContext items={creatures.map(c => c.id)} strategy={verticalListSortingStrategy}>
                    <div className="space-y-2">
                      {creatures.map(creature => (
                        <SortableCreature 
                          key={creature.id} 
                          creature={creature} 
                          onInitiativeChange={handleInitiativeChange}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
                {creatures.length === 0 && <p className="text-center text-muted-foreground py-8">Nenhum encontro ativo. Crie um encontro para começar.</p>}
              </CardContent></Card>
            </TabsContent>

            <TabsContent value="timeline">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Linha do Tempo</h3>
                <Dialog open={isAddEventOpen} onOpenChange={setIsAddEventOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm"><Plus className="h-4 w-4 mr-1" />Adicionar Evento</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader><DialogTitle>Novo Evento</DialogTitle></DialogHeader>
                    <div className="space-y-4">
                      <div><Label>Título</Label><Input value={newEventTitle} onChange={e => setNewEventTitle(e.target.value)} placeholder="Ex: Batalha contra o Dragão" /></div>
                      <div><Label>Descrição</Label><Textarea value={newEventDesc} onChange={e => setNewEventDesc(e.target.value)} placeholder="O que aconteceu..." /></div>
                      <div><Label>Tipo</Label>
                        <Select value={newEventType} onValueChange={v => setNewEventType(v as EventType)}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {eventTypes.map(et => <SelectItem key={et.value} value={et.value}>{getEventIcon(et.value)} {et.label}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div><Label>Tags (separadas por vírgula)</Label><Input value={newEventTags} onChange={e => setNewEventTags(e.target.value)} placeholder="combate, épico, dragão" /></div>
                      <div><Label>Data (opcional)</Label><Input type="date" value={newEventDate} onChange={e => setNewEventDate(e.target.value)} /></div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsAddEventOpen(false)}>Cancelar</Button>
                      <Button onClick={handleAddEvent} disabled={!newEventTitle}>Salvar</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
              <div className="relative border-l-2 border-primary/30 pl-6 space-y-6">
                {events.map(event => (
                  <Dialog key={event.id}>
                    <DialogTrigger asChild>
                      <div className="relative cursor-pointer group">
                        <div className="absolute -left-[31px] h-4 w-4 rounded-full bg-primary border-2 border-background" />
                        <Card className="hover:shadow-md transition-shadow">
                          <CardContent className="p-4">
                            <div className="flex items-center gap-2">
                              <span className="text-xl">{getEventIcon(event.type)}</span>
                              <div>
                                <p className="font-semibold">{event.title}</p>
                                <p className="text-xs text-muted-foreground">{event.date} • {getEventTypeName(event.type)}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader><DialogTitle>{getEventIcon(event.type)} {event.title}</DialogTitle></DialogHeader>
                      <p className="text-muted-foreground">{event.description}</p>
                      <p className="text-sm text-muted-foreground">{event.date}</p>
                      <div className="flex gap-2 mt-2">{event.tags.map(t => <Badge key={t} variant="secondary">{t}</Badge>)}</div>
                    </DialogContent>
                  </Dialog>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="missions">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Missões e Objetivos</h3>
                <Dialog open={isAddMissionOpen} onOpenChange={setIsAddMissionOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm"><Plus className="h-4 w-4 mr-1" />Adicionar Missão</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader><DialogTitle>Nova Missão</DialogTitle></DialogHeader>
                    <div className="space-y-4">
                      <div><Label>Nome</Label><Input value={newMissionTitle} onChange={e => setNewMissionTitle(e.target.value)} placeholder="Ex: Encontrar o Artefato" /></div>
                      <div><Label>Descrição</Label><Textarea value={newMissionDesc} onChange={e => setNewMissionDesc(e.target.value)} placeholder="Detalhes da missão..." /></div>
                      <div><Label>Objetivos (um por linha)</Label><Textarea value={newMissionObjectives} onChange={e => setNewMissionObjectives(e.target.value)} placeholder="Objetivo 1&#10;Objetivo 2&#10;Objetivo 3" /></div>
                      <div><Label>Recompensas</Label><Input value={newMissionRewards} onChange={e => setNewMissionRewards(e.target.value)} placeholder="Ex: 500 XP, Espada Mágica" /></div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsAddMissionOpen(false)}>Cancelar</Button>
                      <Button onClick={handleAddMission} disabled={!newMissionTitle}>Salvar</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
              
              <Dialog open={!!editingMission} onOpenChange={(open) => !open && setEditingMission(null)}>
                <DialogContent>
                  <DialogHeader><DialogTitle>Editar Missão</DialogTitle></DialogHeader>
                  <div className="space-y-4">
                    <div><Label>Nome</Label><Input value={newMissionTitle} onChange={e => setNewMissionTitle(e.target.value)} /></div>
                    <div><Label>Descrição</Label><Textarea value={newMissionDesc} onChange={e => setNewMissionDesc(e.target.value)} /></div>
                    <div><Label>Objetivos (um por linha)</Label><Textarea value={newMissionObjectives} onChange={e => setNewMissionObjectives(e.target.value)} /></div>
                    <div><Label>Recompensas</Label><Input value={newMissionRewards} onChange={e => setNewMissionRewards(e.target.value)} /></div>
                  </div>
                  <DialogFooter className="flex-col sm:flex-row gap-2">
                    <Button variant="outline" className="text-green-600 border-green-600 hover:bg-green-50" onClick={handleCompleteMission}>
                      <Check className="h-4 w-4 mr-1" />Concluir Missão
                    </Button>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => setEditingMission(null)}>Cancelar</Button>
                      <Button onClick={handleEditMission}>Salvar</Button>
                    </div>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              
              <div className="space-y-3">
                {missionsList.map(m => (
                  <Card key={m.id} className={m.status === 'completed' ? 'opacity-60' : ''}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className={`font-semibold ${m.status === 'completed' ? 'line-through' : ''}`}>{m.title}</p>
                            <Badge variant={m.status === 'completed' ? 'default' : 'secondary'}>
                              {m.status === 'completed' ? 'Concluída' : 'Em Andamento'}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{m.description}</p>
                          {m.objectives && m.objectives.length > 0 && (
                            <div className="text-sm mb-2">
                              <p className="text-xs text-muted-foreground mb-1">Objetivos:</p>
                              <ul className="list-disc list-inside">
                                {m.objectives.map((obj, i) => <li key={i}>{obj}</li>)}
                              </ul>
                            </div>
                          )}
                          {m.rewards && <p className="text-xs text-muted-foreground">🎁 {m.rewards}</p>}
                        </div>
                        {m.status !== 'completed' && (
                          <Button size="sm" variant="ghost" onClick={() => openEditMission(m)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="notes">
              <Card><CardContent className="p-4"><textarea className="w-full h-64 bg-transparent resize-none focus:outline-none" placeholder="Suas anotações de mestre..." /></CardContent></Card>
            </TabsContent>
          </Tabs>
        </div>
        <RollsSidebar rolls={rolls} />
      </div>
    </MainLayout>
  );
}
