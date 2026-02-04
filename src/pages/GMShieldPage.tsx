import { useEffect, useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
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
  Loader2,
  AlertTriangle,
  Lock,
  Package,
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
import { toast } from 'sonner';

// Import tab components  
import { GMDashboardTab, CombatStatEvent } from '@/components/gm/GMDashboardTab';
import { GMCombatTab } from '@/components/gm/GMCombatTab';
import { GMNotesTab, GMNote } from '@/components/gm/GMNotesTab';
import { GMMissionsTab } from '@/components/gm/GMMissionsTab';
import { GMHomebrewTab } from '@/components/gm/GMHomebrewTab';
import { GMAllowedItemsTab } from '@/components/gm/GMAllowedItemsTab';
import { RollsSidebar } from '@/components/campaign/RollsSidebar';

// Types
type Campaign = Database['public']['Tables']['campaigns']['Row'];
type Character = Database['public']['Tables']['characters']['Row'];
type DiceRoll = Database['public']['Tables']['dice_rolls']['Row'];
type TimelineEvent = Database['public']['Tables']['timeline_events']['Row'];
type Mission = Database['public']['Tables']['missions']['Row'];
type Profile = Database['public']['Tables']['profiles']['Row'];
type CombatStatEventDB = Database['public']['Tables']['combat_stat_events']['Row'];

// Event types for timeline
const eventTypes = [
  { value: 'discovery', label: 'Descoberta' },
  { value: 'combat', label: 'Combate' },
  { value: 'npc', label: 'Encontro com NPC' },
  { value: 'milestone', label: 'Marco' },
  { value: 'rest', label: 'Descanso' },
  { value: 'travel', label: 'Viagem' },
] as const;

type EventType = typeof eventTypes[number]['value'];

function getEventIcon(type: string) {
  switch (type) {
    case 'discovery': return '🔍';
    case 'combat': return '⚔️';
    case 'npc': return '👤';
    case 'milestone': return '🏆';
    case 'rest': return '🏕️';
    case 'travel': return '🗺️';
    default: return '📌';
  }
}

function getEventTypeName(type: string) {
  return eventTypes.find(t => t.value === type)?.label || 'Evento';
}

export default function GMShieldPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { setThemeBySystem } = useTheme();
  const queryClient = useQueryClient();

  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventDesc, setNewEventDesc] = useState('');
  const [newEventType, setNewEventType] = useState<EventType>('discovery');
  const [newEventDate, setNewEventDate] = useState('');

  // Fetch campaign
  const { data: campaign, isLoading: loadingCampaign, error: campaignError } = useQuery({
    queryKey: ['campaign', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data as Campaign;
    },
    enabled: !!id && !!user,
  });

  // Check if current user is GM
  const isGM = campaign?.gm_id === user?.id;

  // Fetch characters
  const { data: characters = [] } = useQuery({
    queryKey: ['campaign-characters', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('characters')
        .select('*')
        .eq('campaign_id', id);
      if (error) throw error;
      return data as Character[];
    },
    enabled: !!id && isGM,
  });

  // Fetch dice rolls
  const { data: diceRolls = [] } = useQuery({
    queryKey: ['campaign-dice-rolls', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('dice_rolls')
        .select('*')
        .eq('campaign_id', id)
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return data as DiceRoll[];
    },
    enabled: !!id && isGM,
  });

  // Fetch timeline events
  const { data: timelineEvents = [] } = useQuery({
    queryKey: ['campaign-timeline', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('timeline_events')
        .select('*')
        .eq('campaign_id', id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as TimelineEvent[];
    },
    enabled: !!id && isGM,
  });

  // Fetch missions
  const { data: missions = [] } = useQuery({
    queryKey: ['campaign-missions', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('missions')
        .select('*')
        .eq('campaign_id', id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Mission[];
    },
    enabled: !!id && isGM,
  });

  // Fetch GM notes
  const { data: gmNotes = [] } = useQuery({
    queryKey: ['campaign-gm-notes', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gm_notes')
        .select('*')
        .eq('campaign_id', id)
        .order('updated_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!id && isGM,
  });

  // Fetch combat stat events
  const { data: statEventsDB = [] } = useQuery({
    queryKey: ['campaign-stat-events', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('combat_stat_events')
        .select('*')
        .eq('campaign_id', id);
      if (error) throw error;
      return data as CombatStatEventDB[];
    },
    enabled: !!id && isGM,
  });

  // Fetch profiles for character owners
  const { data: profiles = {} } = useQuery({
    queryKey: ['profiles-map'],
    queryFn: async () => {
      const { data, error } = await supabase.from('profiles').select('*');
      if (error) throw error;
      const map: Record<string, Profile> = {};
      data?.forEach(p => { map[p.user_id] = p; });
      return map;
    },
    enabled: !!user,
  });

  // Add timeline event mutation
  const addEventMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('timeline_events')
        .insert({
          campaign_id: id!,
          title: newEventTitle,
          description: newEventDesc,
          event_type: newEventType,
          event_date: newEventDate || new Date().toISOString().split('T')[0],
        });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Evento adicionado!');
      queryClient.invalidateQueries({ queryKey: ['campaign-timeline', id] });
      setIsAddEventOpen(false);
      setNewEventTitle('');
      setNewEventDesc('');
      setNewEventType('discovery');
      setNewEventDate('');
    },
    onError: () => {
      toast.error('Erro ao adicionar evento.');
    },
  });

  useEffect(() => {
    if (campaign) setThemeBySystem(campaign.system);
  }, [campaign, setThemeBySystem]);

  // Convert DB characters to the format expected by GMDashboardTab
  const charactersForDashboard = characters.map(c => ({
    id: c.id,
    campaignId: c.campaign_id,
    userId: c.user_id,
    name: c.name,
    class: c.class || 'Desconhecido',
    level: c.level || 1,
    hp: c.hp_current || 0,
    maxHp: c.hp_max || 10,
    ac: c.ac || 10,
    attributes: (c.attributes as any) || {},
    skills: (c.skills as any) || {},
    inventory: [],
    notes: c.notes || '',
  }));

  // Convert DB missions to expected format
  const missionsForTab = missions.map(m => ({
    id: m.id,
    campaignId: m.campaign_id,
    title: m.title,
    description: m.description || '',
    status: m.status as 'active' | 'completed',
    notes: '',
    objectives: (m.objectives as string[]) || [],
    rewards: m.rewards || '',
    createdAt: m.created_at,
    completedAt: m.completed_at,
  }));

  // Convert stat events for dashboard
  const statEventsForDashboard: CombatStatEvent[] = statEventsDB.map(e => ({
    id: e.id,
    campaignId: e.campaign_id,
    characterId: e.character_id,
    type: e.event_type as 'DAMAGE_DEALT' | 'DAMAGE_TAKEN' | 'HEALING_DONE' | 'OTHER',
    amount: e.amount,
    timestamp: e.created_at,
    relatedRollId: e.related_roll_id || undefined,
  }));

  // Convert GM notes for tab
  const gmNotesForTab: GMNote[] = gmNotes.map(n => ({
    id: n.id,
    campaignId: n.campaign_id,
    title: n.title || '',
    content: n.content,
    createdAt: n.created_at,
    updatedAt: n.updated_at,
  }));

  // Convert dice rolls for sidebar
  const rollsForSidebar = diceRolls.map(r => ({
    id: r.id,
    campaignId: r.campaign_id,
    userId: r.user_id,
    formula: r.formula,
    result: r.result,
    details: r.details || '',
    timestamp: r.created_at,
  }));

  // Calculate average level
  const avgLevelRounded = useMemo(() => {
    if (charactersForDashboard.length === 0) return 1;
    return Math.round(charactersForDashboard.reduce((sum, c) => sum + c.level, 0) / charactersForDashboard.length);
  }, [charactersForDashboard]);

  // Get user name for character
  const getUserName = (userId: string) => {
    return profiles[userId]?.name || 'Desconhecido';
  };

  // Loading state
  if (loadingCampaign) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  // Campaign not found
  if (campaignError || !campaign) {
    return (
      <MainLayout>
        <div className="container py-8 text-center">
          <AlertTriangle className="h-12 w-12 mx-auto text-destructive mb-4" />
          <h1 className="text-2xl font-bold mb-2">Campanha não encontrada</h1>
          <p className="text-muted-foreground mb-4">
            A campanha pode não existir ou você não tem permissão para acessá-la.
          </p>
          <Link to="/campaigns">
            <Button>Voltar às Campanhas</Button>
          </Link>
        </div>
      </MainLayout>
    );
  }

  // Not the GM
  if (!isGM) {
    return (
      <MainLayout>
        <div className="container py-8 text-center">
          <Lock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-2">Acesso Restrito</h1>
          <p className="text-muted-foreground mb-4">
            Apenas o Mestre da campanha pode acessar o Escudo do Mestre.
          </p>
          <Link to={`/campaigns/${id}`}>
            <Button>Voltar à Campanha</Button>
          </Link>
        </div>
      </MainLayout>
    );
  }

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
              <TabsTrigger value="homebrew">
                <Package className="h-4 w-4 mr-1" />Homebrew
              </TabsTrigger>
              <TabsTrigger value="allowed-items">
                <Package className="h-4 w-4 mr-1" />Itens
              </TabsTrigger>
            </TabsList>

            {/* Dashboard */}
            <TabsContent value="overview">
              <GMDashboardTab 
                characters={charactersForDashboard}
                missions={missionsForTab}
                statEvents={statEventsForDashboard}
              />
            </TabsContent>

            {/* Combat */}
            <TabsContent value="combat">
              <GMCombatTab
                campaignId={id!}
                system={campaign.system}
                avgLevelRounded={avgLevelRounded}
                characters={characters}
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
                        <Label>Data (opcional)</Label>
                        <Input type="date" value={newEventDate} onChange={e => setNewEventDate(e.target.value)} />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsAddEventOpen(false)}>Cancelar</Button>
                      <Button 
                        onClick={() => addEventMutation.mutate()} 
                        disabled={!newEventTitle || addEventMutation.isPending}
                      >
                        {addEventMutation.isPending ? 'Salvando...' : 'Salvar'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
              <div className="relative border-l-2 border-primary/30 pl-6 space-y-6">
                {timelineEvents.length === 0 ? (
                  <p className="text-muted-foreground py-8 text-center">Nenhum evento na timeline ainda.</p>
                ) : (
                  timelineEvents.map(event => (
                    <Dialog key={event.id}>
                      <DialogTrigger asChild>
                        <div className="relative cursor-pointer group">
                          <div className="absolute -left-[31px] h-4 w-4 rounded-full bg-primary border-2 border-background" />
                          <Card className="hover:shadow-md transition-shadow">
                            <CardContent className="p-4">
                              <div className="flex items-center gap-2">
                                <span className="text-xl">{getEventIcon(event.event_type || 'event')}</span>
                                <div>
                                  <p className="font-semibold">{event.title}</p>
                                  <p className="text-xs text-muted-foreground">{event.event_date} • {getEventTypeName(event.event_type || 'event')}</p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader><DialogTitle>{getEventIcon(event.event_type || 'event')} {event.title}</DialogTitle></DialogHeader>
                        <p className="text-muted-foreground">{event.description}</p>
                        <p className="text-sm text-muted-foreground">{event.event_date}</p>
                      </DialogContent>
                    </Dialog>
                  ))
                )}
              </div>
            </TabsContent>

            {/* Missions */}
            <TabsContent value="missions">
              <GMMissionsTab 
                campaignId={id!}
                missions={missionsForTab}
                setMissions={() => {}}
              />
            </TabsContent>

            {/* Notes */}
            <TabsContent value="notes">
              <GMNotesTab 
                campaignId={id!}
                notes={gmNotesForTab}
                setNotes={() => {}}
              />
            </TabsContent>

            {/* Characters */}
            <TabsContent value="characters">
              <div className="space-y-3">
                {charactersForDashboard.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">Nenhum personagem criado ainda.</p>
                ) : (
                  charactersForDashboard.map(c => (
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
                  ))
                )}
              </div>
            </TabsContent>

            {/* Homebrew */}
            <TabsContent value="homebrew">
              <GMHomebrewTab 
                campaignId={id!}
                system={campaign.system}
              />
            </TabsContent>

            {/* Allowed Items */}
            <TabsContent value="allowed-items">
              <GMAllowedItemsTab 
                campaignId={id!}
                system={campaign.system}
              />
            </TabsContent>
          </Tabs>
        </div>
        <RollsSidebar rolls={rollsForSidebar} />
      </div>
    </MainLayout>
  );
}
