import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { CampaignLayout } from '@/components/campaign/CampaignLayout';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import { Shield, Users, Scroll, Wand2, Eye, Crown, UserPlus, Check, X, Loader2, Copy, Gamepad2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';

type Campaign = Database['public']['Tables']['campaigns']['Row'];
type Membership = Database['public']['Tables']['campaign_memberships']['Row'];
type Character = Database['public']['Tables']['characters']['Row'];
type DiceRoll = Database['public']['Tables']['dice_rolls']['Row'];
import type { SafeProfile } from '@/types/safe-profile';
type Profile = SafeProfile;

export default function CampaignPage() {
  const { id } = useParams();
  const { setThemeBySystem } = useTheme();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  // Fetch campaign
  const { data: campaign, isLoading: loadingCampaign } = useQuery({
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
    enabled: !!id,
  });

  // Fetch memberships
  const { data: memberships = [] } = useQuery({
    queryKey: ['campaign-memberships', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('campaign_memberships')
        .select('*')
        .eq('campaign_id', id);
      if (error) throw error;
      return data as Membership[];
    },
    enabled: !!id,
  });

  // Fetch profiles for members (uses safe_profiles view - no email)
  const { data: profiles = {} } = useQuery({
    queryKey: ['member-profiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('safe_profiles' as any)
        .select('*') as { data: SafeProfile[] | null; error: any };
      if (error) throw error;
      
      const map: Record<string, Profile> = {};
      data?.forEach((p: SafeProfile) => {
        map[p.user_id] = p;
      });
      return map;
    },
  });

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
    enabled: !!id,
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
    enabled: !!id,
  });

  // Approve/Reject membership mutation
  const membershipMutation = useMutation({
    mutationFn: async ({ membershipId, status }: { membershipId: string; status: 'approved' | 'rejected' }) => {
      const { error } = await supabase
        .from('campaign_memberships')
        .update({ 
          status, 
          responded_at: new Date().toISOString() 
        })
        .eq('id', membershipId);
      if (error) throw error;
    },
    onSuccess: (_, { status }) => {
      toast.success(status === 'approved' ? 'Jogador aprovado!' : 'Solicitação rejeitada.');
      queryClient.invalidateQueries({ queryKey: ['campaign-memberships', id] });
    },
    onError: () => {
      toast.error('Erro ao processar solicitação.');
    },
  });

  useEffect(() => {
    if (campaign) {
      setThemeBySystem(campaign.system);
    }
  }, [campaign, setThemeBySystem]);

  const isGM = campaign?.gm_id === user?.id;
  const pendingMembers = memberships.filter(m => m.status === 'pending');
  // Filter out the GM from approved members to avoid duplication (GM is shown separately)
  const approvedMembers = memberships.filter(m => m.status === 'approved' && m.user_id !== campaign?.gm_id);
  const hasCharacter = characters.some(c => c.user_id === user?.id);

  const getSystemName = (system: string) => {
    switch (system) {
      case '5e': return 'D&D 5e (SRD)';
      case 'olho_da_morte': return 'Sistema Olho da Morte';
      case 'horror': return 'Horror Cósmico';
      default: return system;
    }
  };

  const getSystemBadgeClass = (system: string) => {
    switch (system) {
      case '5e': return 'badge-medieval';
      case 'olho_da_morte': return 'badge-wildwest';
      case 'horror': return 'badge-cosmic';
      default: return '';
    }
  };

  const copyInviteCode = () => {
    if (campaign?.invite_code) {
      navigator.clipboard.writeText(campaign.invite_code);
      toast.success('Código copiado!');
    }
  };

  // Transform dice rolls for the sidebar
  const rollsForSidebar = diceRolls.map(r => ({
    id: r.id,
    campaignId: r.campaign_id,
    userId: r.user_id,
    formula: r.formula,
    result: r.result,
    details: r.details || '',
    timestamp: r.created_at,
  }));

  if (loadingCampaign) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  if (!campaign) {
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

  return (
    <MainLayout>
      <CampaignLayout rolls={rollsForSidebar}>
        <div className="p-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-heading font-bold">{campaign.name}</h1>
                <Badge className={getSystemBadgeClass(campaign.system)}>
                  {getSystemName(campaign.system)}
                </Badge>
              </div>
              <p className="text-muted-foreground">{campaign.description || 'Sem descrição'}</p>
            </div>
            {isGM && (
              <Link to={`/campaigns/${id}/gm`}>
                <Button className="gap-2">
                  <Shield className="h-4 w-4" />
                  Escudo do Mestre
                </Button>
              </Link>
            )}
          </div>

          {/* Tabs */}
          <Tabs defaultValue="overview">
            <TabsList>
              <TabsTrigger value="overview"><Eye className="h-4 w-4 mr-2" />Visão Geral</TabsTrigger>
              <TabsTrigger value="members"><Users className="h-4 w-4 mr-2" />Membros</TabsTrigger>
              <TabsTrigger value="characters"><Scroll className="h-4 w-4 mr-2" />Personagens</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader><CardTitle>Resumo</CardTitle></CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <p><strong>Status:</strong> {campaign.is_active ? 'Ativa' : 'Fechada'}</p>
                    <p><strong>Membros:</strong> {approvedMembers.length + 1}</p>
                    <p><strong>Personagens:</strong> {characters.length}</p>
                    <div className="flex items-center gap-2">
                      <strong>Código:</strong>
                      <code className="bg-muted px-2 py-1 rounded">{campaign.invite_code}</code>
                      <Button size="sm" variant="ghost" onClick={copyInviteCode}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader><CardTitle>Últimas Rolagens</CardTitle></CardHeader>
                  <CardContent>
                    {diceRolls.length === 0 ? (
                      <p className="text-muted-foreground text-center py-4">Nenhuma rolagem ainda.</p>
                    ) : (
                      diceRolls.slice(0, 5).map(roll => (
                        <div key={roll.id} className="flex justify-between py-2 border-b last:border-0">
                          <span className="text-sm">{roll.formula}</span>
                          <span className="font-bold">{roll.result}</span>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="members" className="mt-6">
              {isGM && pendingMembers.length > 0 && (
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <UserPlus className="h-5 w-5" />
                      Solicitações Pendentes ({pendingMembers.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {pendingMembers.map(m => {
                      const profile = profiles[m.user_id];
                      return (
                        <div key={m.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src={profile?.avatar_url || undefined} />
                              <AvatarFallback>{profile?.name?.[0] || '?'}</AvatarFallback>
                            </Avatar>
                            <span>{profile?.name || 'Usuário'}</span>
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => membershipMutation.mutate({ membershipId: m.id, status: 'approved' })}
                              disabled={membershipMutation.isPending}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="destructive"
                              onClick={() => membershipMutation.mutate({ membershipId: m.id, status: 'rejected' })}
                              disabled={membershipMutation.isPending}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              )}

              {/* GM Card */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <Link to={`/users/${campaign.gm_id}`}>
                  <Card className="hover:shadow-md transition-shadow cursor-pointer border-primary/50">
                    <CardContent className="flex items-center gap-3 p-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={profiles[campaign.gm_id]?.avatar_url || undefined} />
                        <AvatarFallback>{profiles[campaign.gm_id]?.name?.[0] || 'M'}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">{profiles[campaign.gm_id]?.name || 'Mestre'}</p>
                        <Badge variant="outline">
                          <Crown className="h-3 w-3 mr-1" />Mestre
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </Link>

                {approvedMembers.map(m => {
                  const profile = profiles[m.user_id];
                  return (
                    <Link key={m.id} to={`/users/${m.user_id}`}>
                      <Card className="hover:shadow-md transition-shadow cursor-pointer">
                        <CardContent className="flex items-center gap-3 p-4">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={profile?.avatar_url || undefined} />
                            <AvatarFallback>{profile?.name?.[0] || '?'}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold">{profile?.name || 'Jogador'}</p>
                            <Badge variant="outline">
                              <Gamepad2 className="h-3 w-3 mr-1" />Jogador
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="characters" className="mt-6">
              {characters.length === 0 ? (
                <Card className="text-center py-8">
                  <CardContent>
                    <Scroll className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground mb-4">Nenhum personagem criado ainda.</p>
                    {!isGM && !hasCharacter && (
                      <Link to={`/campaigns/${id}/create-character`}>
                        <Button>Criar Minha Ficha</Button>
                      </Link>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {characters.map(char => {
                    const playerProfile = profiles[char.user_id];
                    return (
                      <Link key={char.id} to={`/characters/${char.id}`}>
                        <Card className="hover:shadow-md transition-shadow">
                          <CardContent className="p-4">
                            <div className="flex items-center gap-3 mb-2">
                              <Avatar className="h-12 w-12">
                                <AvatarFallback>{char.name[0]}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-semibold">{char.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  {char.class || 'Classe'} • Nível {char.level || 1}
                                </p>
                              </div>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>PV: {char.hp_current}/{char.hp_max}</span>
                              <span>CA: {char.ac}</span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">
                              Controlado por: {playerProfile?.name || 'Jogador'}
                            </p>
                          </CardContent>
                        </Card>
                      </Link>
                    );
                  })}
                </div>
              )}
              {!isGM && !hasCharacter && characters.length > 0 && (
                <Link to={`/campaigns/${id}/create-character`}>
                  <Button className="mt-4">Criar Minha Ficha</Button>
                </Link>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </CampaignLayout>
    </MainLayout>
  );
}
