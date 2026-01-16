import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { useTheme } from '@/contexts/ThemeContext';
import { campaigns, characters, diceRolls, timelineEvents, missions, encounters, users, homebrews, enabledHomebrews, getEventIcon, getEventTypeName, EncounterCreature } from '@/data/mockData';
import { ArrowLeft, Shield, Users, Swords, Clock, Target, FileText, GripVertical, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { RollsSidebar } from '@/components/campaign/RollsSidebar';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

function SortableCreature({ creature }: { creature: EncounterCreature }) {
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
          PV: {creature.hp}/{creature.maxHp} | CA: {creature.ac} | Init: {creature.initiative}
        </div>
      </div>
      <Button size="sm" variant="outline">Atacar</Button>
    </div>
  );
}

export default function GMShieldPage() {
  const { id } = useParams();
  const { setThemeBySystem } = useTheme();
  const campaign = campaigns.find(c => c.id === id);
  const chars = characters.filter(c => c.campaignId === id);
  const rolls = diceRolls.filter(r => r.campaignId === id);
  const events = timelineEvents.filter(e => e.campaignId === id);
  const campaignMissions = missions.filter(m => m.campaignId === id);
  const encounter = encounters.find(e => e.campaignId === id && e.isActive);
  
  const [creatures, setCreatures] = useState<EncounterCreature[]>(encounter?.creatures || []);
  const [selectedEvent, setSelectedEvent] = useState<typeof events[0] | null>(null);
  
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

          <Tabs defaultValue="combat">
            <TabsList className="mb-4">
              <TabsTrigger value="overview">Painel</TabsTrigger>
              <TabsTrigger value="characters"><Users className="h-4 w-4 mr-1" />Personagens</TabsTrigger>
              <TabsTrigger value="combat"><Swords className="h-4 w-4 mr-1" />Combate</TabsTrigger>
              <TabsTrigger value="timeline"><Clock className="h-4 w-4 mr-1" />Timeline</TabsTrigger>
              <TabsTrigger value="missions"><Target className="h-4 w-4 mr-1" />Missões</TabsTrigger>
              <TabsTrigger value="notes"><FileText className="h-4 w-4 mr-1" />Notas</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <div className="grid md:grid-cols-3 gap-4">
                <Card><CardHeader><CardTitle>Personagens Críticos</CardTitle></CardHeader><CardContent>
                  {chars.filter(c => c.hp < c.maxHp * 0.3).map(c => (
                    <div key={c.id} className="flex justify-between py-2"><span>{c.name}</span><Badge variant="destructive">{c.hp}/{c.maxHp}</Badge></div>
                  ))}
                  {chars.filter(c => c.hp < c.maxHp * 0.3).length === 0 && <p className="text-muted-foreground text-sm">Todos saudáveis</p>}
                </CardContent></Card>
                <Card><CardHeader><CardTitle>Próximos Eventos</CardTitle></CardHeader><CardContent>
                  {events.slice(0, 3).map(e => <p key={e.id} className="py-1 text-sm">{getEventIcon(e.type)} {e.title}</p>)}
                </CardContent></Card>
                <Card><CardHeader><CardTitle>Missões Ativas</CardTitle></CardHeader><CardContent>
                  {campaignMissions.filter(m => m.status === 'active').slice(0, 3).map(m => <p key={m.id} className="py-1 text-sm">📜 {m.title}</p>)}
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
                      <Button size="sm" variant="outline">Editar</Button>
                    </div>
                  </CardContent></Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="combat">
              <Card><CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Rastreador de Iniciativa</CardTitle>
                <Button size="sm"><Plus className="h-4 w-4 mr-1" />Adicionar</Button>
              </CardHeader><CardContent>
                <p className="text-sm text-muted-foreground mb-4">Arraste para reordenar turnos</p>
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                  <SortableContext items={creatures.map(c => c.id)} strategy={verticalListSortingStrategy}>
                    <div className="space-y-2">
                      {creatures.map(creature => <SortableCreature key={creature.id} creature={creature} />)}
                    </div>
                  </SortableContext>
                </DndContext>
                {creatures.length === 0 && <p className="text-center text-muted-foreground py-8">Nenhum encontro ativo. Crie um encontro para começar.</p>}
              </CardContent></Card>
            </TabsContent>

            <TabsContent value="timeline">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Linha do Tempo</h3>
                <Button size="sm"><Plus className="h-4 w-4 mr-1" />Adicionar Evento</Button>
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
                      <div className="flex gap-2 mt-2">{event.tags.map(t => <Badge key={t} variant="secondary">{t}</Badge>)}</div>
                    </DialogContent>
                  </Dialog>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="missions">
              <div className="space-y-3">
                {campaignMissions.map(m => (
                  <Card key={m.id}><CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div><p className="font-semibold">{m.title}</p><p className="text-sm text-muted-foreground">{m.description}</p></div>
                      <Badge variant={m.status === 'completed' ? 'default' : 'secondary'}>{m.status === 'completed' ? 'Concluída' : 'Em Andamento'}</Badge>
                    </div>
                  </CardContent></Card>
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
