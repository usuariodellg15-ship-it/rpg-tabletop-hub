import { useEffect, useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { useTheme } from '@/contexts/ThemeContext';
import { 
  campaigns, 
  characters, 
  diceRolls, 
  timelineEvents, 
  missions as mockMissions, 
  encounters, 
  users, 
  getEventIcon, 
  getEventTypeName, 
  EncounterCreature,
  TimelineEvent,
  Mission,
  EventType,
  eventTypes,
} from '@/data/mockData';
import { 
  ArrowLeft, 
  Shield, 
  Users, 
  Swords, 
  Clock, 
  Target, 
  FileText, 
  Plus, 
  Edit, 
  LayoutDashboard,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RollsSidebar } from '@/components/campaign/RollsSidebar';
import { toast } from 'sonner';

// Import new tab components
import { GMDashboardTab, CombatStatEvent } from '@/components/gm/GMDashboardTab';
import { GMCombatTab } from '@/components/gm/GMCombatTab';
import { GMNotesTab, GMNote } from '@/components/gm/GMNotesTab';
import { GMMissionsTab } from '@/components/gm/GMMissionsTab';

const STAT_EVENTS_KEY = 'mesahub_stat_events';

// Generate initial mock stat events from existing combatStats
function generateInitialStatEvents(campaignId: string): CombatStatEvent[] {
  const chars = characters.filter(c => c.campaignId === campaignId);
  const events: CombatStatEvent[] = [];
  
  chars.forEach(char => {
    // Add some mock damage events
    for (let i = 0; i < 3; i++) {
      events.push({
        id: `stat-dmg-${char.id}-${i}`,
        campaignId,
        characterId: char.id,
        type: 'DAMAGE_DEALT',
        amount: Math.floor(Math.random() * 30) + 10,
        timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      });
    }
    // Add some mock healing events
    for (let i = 0; i < 2; i++) {
      events.push({
        id: `stat-heal-${char.id}-${i}`,
        campaignId,
        characterId: char.id,
        type: 'HEALING_DONE',
        amount: Math.floor(Math.random() * 20) + 5,
        timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      });
    }
    // Add some damage taken events
    for (let i = 0; i < 2; i++) {
      events.push({
        id: `stat-taken-${char.id}-${i}`,
        campaignId,
        characterId: char.id,
        type: 'DAMAGE_TAKEN',
        amount: Math.floor(Math.random() * 25) + 8,
        timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      });
    }
  });

  return events;
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
  const campaignMissionsData = mockMissions.filter(m => m.campaignId === id);
  const [missionsList, setMissionsList] = useState<Mission[]>(campaignMissionsData);
  const encounter = encounters.find(e => e.campaignId === id && e.isActive);
  
  const [creatures, setCreatures] = useState<EncounterCreature[]>(encounter?.creatures || []);
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [gmNotes, setGmNotes] = useState<GMNote[]>([]);
  
  // Stat events for dashboard
  const [statEvents, setStatEvents] = useState<CombatStatEvent[]>([]);
  
  // New event form state
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventDesc, setNewEventDesc] = useState('');
  const [newEventType, setNewEventType] = useState<EventType>('discovery');
  const [newEventTags, setNewEventTags] = useState('');
  const [newEventDate, setNewEventDate] = useState('');

  // Load stat events from localStorage
  useEffect(() => {
    if (!id) return;
    
    const stored = localStorage.getItem(STAT_EVENTS_KEY);
    if (stored) {
      try {
        const allEvents: CombatStatEvent[] = JSON.parse(stored);
        const campaignEvents = allEvents.filter(e => e.campaignId === id);
        if (campaignEvents.length > 0) {
          setStatEvents(campaignEvents);
        } else {
          // Generate initial mock data
          const initialEvents = generateInitialStatEvents(id);
          setStatEvents(initialEvents);
        }
      } catch (e) {
        const initialEvents = generateInitialStatEvents(id);
        setStatEvents(initialEvents);
      }
    } else {
      const initialEvents = generateInitialStatEvents(id);
      setStatEvents(initialEvents);
    }
  }, [id]);

  // Save stat events to localStorage
  useEffect(() => {
    if (!id || statEvents.length === 0) return;
    
    const stored = localStorage.getItem(STAT_EVENTS_KEY);
    let allEvents: CombatStatEvent[] = [];
    
    if (stored) {
      try {
        allEvents = JSON.parse(stored);
      } catch (e) {}
    }

    allEvents = allEvents.filter(e => e.campaignId !== id);
    allEvents = [...allEvents, ...statEvents];
    
    localStorage.setItem(STAT_EVENTS_KEY, JSON.stringify(allEvents));
  }, [statEvents, id]);

  useEffect(() => {
    if (campaign) setThemeBySystem(campaign.system);
  }, [campaign, setThemeBySystem]);

  // Calculate average level for combat tab
  const avgLevelRounded = useMemo(() => {
    if (chars.length === 0) return 1;
    return Math.round(chars.reduce((sum, c) => sum + c.level, 0) / chars.length);
  }, [chars]);

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

  // Get user name for character
  const getUserName = (userId: string) => {
    const user = users.find(u => u.id === userId);
    return user?.name || 'Desconhecido';
  };

  if (!campaign) return <MainLayout><div className="container py-8">Campanha não encontrada.</div></MainLayout>;

  return (
    <MainLayout>
      <div className="flex h-[calc(100vh-4rem)]">
        <div className="flex-1 overflow-auto p-6">
          <div className="flex items-center gap-4 mb-6">
            <Link to={`/campaigns/${id}`}>
              <Button variant="ghost">
                <ArrowLeft className="h-4 w-4 mr-2" />Voltar
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-heading font-bold flex items-center gap-2">
                <Shield className="h-6 w-6" />Escudo do Mestre
              </h1>
              <p className="text-muted-foreground">{campaign.name}</p>
            </div>
          </div>

          <Tabs defaultValue="overview">
            <TabsList className="mb-4 flex-wrap">
              <TabsTrigger value="overview">
                <LayoutDashboard className="h-4 w-4 mr-1" />Visão Geral
              </TabsTrigger>
              <TabsTrigger value="combat">
                <Swords className="h-4 w-4 mr-1" />Combate
              </TabsTrigger>
              <TabsTrigger value="timeline">
                <Clock className="h-4 w-4 mr-1" />Timeline
              </TabsTrigger>
              <TabsTrigger value="missions">
                <Target className="h-4 w-4 mr-1" />Missões
              </TabsTrigger>
              <TabsTrigger value="notes">
                <FileText className="h-4 w-4 mr-1" />Anotações
              </TabsTrigger>
              <TabsTrigger value="characters">
                <Users className="h-4 w-4 mr-1" />Personagens
              </TabsTrigger>
            </TabsList>

            {/* Visão Geral / Dashboard */}
            <TabsContent value="overview">
              <GMDashboardTab 
                characters={chars}
                missions={missionsList}
                statEvents={statEvents}
              />
            </TabsContent>

            {/* Combate */}
            <TabsContent value="combat">
              <GMCombatTab
                campaignId={id!}
                system={campaign.system}
                avgLevelRounded={avgLevelRounded}
                creatures={creatures}
                setCreatures={setCreatures}
                characters={chars}
              />
            </TabsContent>

            {/* Timeline */}
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
                      <div>
                        <Label>Título</Label>
                        <Input value={newEventTitle} onChange={e => setNewEventTitle(e.target.value)} placeholder="Ex: Batalha contra o Dragão" />
                      </div>
                      <div>
                        <Label>Descrição</Label>
                        <Textarea value={newEventDesc} onChange={e => setNewEventDesc(e.target.value)} placeholder="O que aconteceu..." />
                      </div>
                      <div>
                        <Label>Tipo</Label>
                        <Select value={newEventType} onValueChange={v => setNewEventType(v as EventType)}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {eventTypes.map(et => (
                              <SelectItem key={et.value} value={et.value}>
                                {getEventIcon(et.value)} {et.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Tags (separadas por vírgula)</Label>
                        <Input value={newEventTags} onChange={e => setNewEventTags(e.target.value)} placeholder="combate, épico, dragão" />
                      </div>
                      <div>
                        <Label>Data (opcional)</Label>
                        <Input type="date" value={newEventDate} onChange={e => setNewEventDate(e.target.value)} />
                      </div>
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

            {/* Missões */}
            <TabsContent value="missions">
              <GMMissionsTab 
                campaignId={id!}
                missions={missionsList}
                setMissions={setMissionsList}
              />
            </TabsContent>

            {/* Anotações do Mestre */}
            <TabsContent value="notes">
              <GMNotesTab 
                campaignId={id!}
                notes={gmNotes}
                setNotes={setGmNotes}
              />
            </TabsContent>

            {/* Personagens */}
            <TabsContent value="characters">
              <div className="space-y-3">
                {chars.map(c => (
                  <Card key={c.id}>
                    <CardContent className="flex items-center justify-between p-4">
                      <div>
                        <p className="font-semibold">{c.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {c.class} Nv.{c.level} • Controlado por: {getUserName(c.userId)}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <p className="text-xs text-muted-foreground">PV</p>
                          <p className="font-bold">{c.hp}/{c.maxHp}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-muted-foreground">CA</p>
                          <p className="font-bold">{c.ac}</p>
                        </div>
                        <Button size="sm" variant="outline" onClick={() => navigate(`/characters/${c.id}`)}>
                          <Edit className="h-4 w-4 mr-1" />Editar
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
        <RollsSidebar rolls={rolls} />
      </div>
    </MainLayout>
  );
}
