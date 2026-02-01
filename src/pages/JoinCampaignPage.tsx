import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import { 
  ArrowLeft, 
  Search, 
  Key,
  Lock,
  Users,
  Clock,
  Loader2,
  Gamepad2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

type Campaign = Database['public']['Tables']['campaigns']['Row'];
type Membership = Database['public']['Tables']['campaign_memberships']['Row'];

export default function JoinCampaignPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [code, setCode] = useState('');
  const [search, setSearch] = useState('');

  // Fetch public campaigns
  const { data: publicCampaigns = [], isLoading: loadingCampaigns } = useQuery({
    queryKey: ['public-campaigns'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .eq('is_active', true);
      if (error) throw error;
      return data as Campaign[];
    },
  });

  // Fetch user's memberships to check pending status
  const { data: myMemberships = [] } = useQuery({
    queryKey: ['my-memberships', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('campaign_memberships')
        .select('*')
        .eq('user_id', user.id);
      if (error) throw error;
      return data as Membership[];
    },
    enabled: !!user,
  });

  // Request join mutation
  const requestJoinMutation = useMutation({
    mutationFn: async (campaignId: string) => {
      if (!user) throw new Error('Not authenticated');
      
      const { error } = await supabase
        .from('campaign_memberships')
        .insert({
          campaign_id: campaignId,
          user_id: user.id,
          status: 'pending',
          role: 'player',
        });
      
      if (error) {
        if (error.code === '23505') {
          throw new Error('Você já solicitou entrada nesta campanha');
        }
        throw error;
      }
    },
    onSuccess: () => {
      toast.success('Solicitação enviada! Aguardando aprovação do mestre.');
      queryClient.invalidateQueries({ queryKey: ['my-memberships'] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const filteredCampaigns = publicCampaigns.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) &&
    c.gm_id !== user?.id // Don't show user's own campaigns
  );

  const getMembershipStatus = (campaignId: string) => {
    const membership = myMemberships.find(m => m.campaign_id === campaignId);
    return membership?.status;
  };

  const getSystemName = (system: string) => {
    switch (system) {
      case '5e': return 'D&D 5e (SRD)';
      case 'olho_da_morte': return 'Sistema Olho da Morte';
      case 'horror': return 'Horror Cósmico';
      default: return system;
    }
  };

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!code.trim()) {
      toast.error('Digite um código de campanha');
      return;
    }

    // Find campaign by code
    const { data: campaign, error } = await supabase
      .from('campaigns')
      .select('*')
      .eq('invite_code', code.toUpperCase())
      .single();
    
    if (error || !campaign) {
      toast.error('Código de campanha não encontrado.');
      return;
    }

    if (!campaign.is_active) {
      toast.error('Esta campanha está fechada para novos jogadores.');
      return;
    }

    if (campaign.gm_id === user?.id) {
      toast.error('Você é o mestre desta campanha!');
      return;
    }

    const existingMembership = getMembershipStatus(campaign.id);
    if (existingMembership) {
      toast.error(existingMembership === 'pending' 
        ? 'Você já tem uma solicitação pendente para esta campanha.' 
        : 'Você já é membro desta campanha.');
      return;
    }

    requestJoinMutation.mutate(campaign.id);
  };

  const handleRequestJoin = (campaignId: string) => {
    requestJoinMutation.mutate(campaignId);
  };

  return (
    <MainLayout>
      <div className="container py-8 max-w-3xl">
        {/* Header */}
        <div className="mb-8">
          <Link to="/campaigns">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </Link>
          <h1 className="text-3xl font-heading font-bold">Entrar em Campanha</h1>
          <p className="text-muted-foreground mt-1">
            Use um código ou encontre campanhas públicas.
          </p>
        </div>

        <Tabs defaultValue="code">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="code" className="gap-2">
              <Key className="h-4 w-4" />
              Código
            </TabsTrigger>
            <TabsTrigger value="browse" className="gap-2">
              <Search className="h-4 w-4" />
              Buscar
            </TabsTrigger>
          </TabsList>

          <TabsContent value="code">
            <Card>
              <CardHeader>
                <CardTitle>Entrar com Código</CardTitle>
                <CardDescription>
                  Digite o código fornecido pelo mestre da campanha.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCodeSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="code">Código da Campanha</Label>
                    <Input
                      id="code"
                      placeholder="Ex: ABCD1234"
                      value={code}
                      onChange={(e) => setCode(e.target.value.toUpperCase())}
                      className="text-center text-xl tracking-widest font-mono"
                      maxLength={10}
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={requestJoinMutation.isPending}
                  >
                    {requestJoinMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      'Solicitar Entrada'
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="browse">
            <Card>
              <CardHeader>
                <CardTitle>Campanhas Disponíveis</CardTitle>
                <CardDescription>
                  Encontre campanhas abertas para novos jogadores.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar campanhas..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {loadingCampaigns ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : filteredCampaigns.length === 0 ? (
                  <div className="text-center py-8">
                    <Gamepad2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">
                      Nenhuma campanha encontrada.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredCampaigns.map((campaign) => {
                      const status = getMembershipStatus(campaign.id);
                      
                      return (
                        <div 
                          key={campaign.id}
                          className="flex items-center gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                        >
                          <div className="h-16 w-24 rounded bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                            <Gamepad2 className="h-8 w-8 text-primary/30" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold truncate">{campaign.name}</h4>
                            <p className="text-sm text-muted-foreground line-clamp-1">
                              {campaign.description || 'Sem descrição'}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="secondary" className="text-xs">
                                {getSystemName(campaign.system)}
                              </Badge>
                            </div>
                          </div>
                          {status === 'pending' ? (
                            <Badge variant="outline" className="gap-1">
                              <Clock className="h-3 w-3" />
                              Pendente
                            </Badge>
                          ) : status === 'approved' ? (
                            <Link to={`/campaigns/${campaign.id}`}>
                              <Button size="sm" variant="outline">
                                Acessar
                              </Button>
                            </Link>
                          ) : (
                            <Button 
                              size="sm" 
                              onClick={() => handleRequestJoin(campaign.id)}
                              disabled={requestJoinMutation.isPending}
                            >
                              {requestJoinMutation.isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                'Solicitar'
                              )}
                            </Button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
