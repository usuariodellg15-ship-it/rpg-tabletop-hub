import { useParams, Link } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import { ArrowLeft, Heart, Plus, MessageSquare, Loader2, Wand2, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';

type Homebrew = Database['public']['Tables']['homebrews']['Row'];
type Profile = Database['public']['Tables']['profiles']['Row'];
type Campaign = Database['public']['Tables']['campaigns']['Row'];

export default function HomebrewDetailPage() {
  const { id: homebrewId } = useParams();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch homebrew
  const { data: homebrew, isLoading, error } = useQuery({
    queryKey: ['homebrew', homebrewId],
    queryFn: async () => {
      if (!homebrewId) throw new Error('Homebrew ID required');

      const { data, error } = await supabase
        .from('homebrews')
        .select('*')
        .eq('id', homebrewId)
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error('Homebrew not found');
      
      // Check access: must be public or owned by current user
      if (!data.is_public && data.creator_id !== user?.id) {
        throw new Error('Access denied');
      }
      
      return data as Homebrew;
    },
    enabled: !!homebrewId,
  });

  // Fetch author profile
  const { data: author } = useQuery({
    queryKey: ['profile', homebrew?.creator_id],
    queryFn: async () => {
      if (!homebrew?.creator_id) return null;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', homebrew.creator_id)
        .maybeSingle();

      if (error) throw error;
      return data as Profile | null;
    },
    enabled: !!homebrew?.creator_id,
  });

  // Fetch user's GM campaigns
  const { data: userGMCampaigns = [] } = useQuery({
    queryKey: ['gm-campaigns', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .eq('gm_id', user.id)
        .eq('is_active', true);

      if (error) throw error;
      return data as Campaign[];
    },
    enabled: !!user,
  });

  // Enable homebrew in campaign mutation
  const enableInCampaign = useMutation({
    mutationFn: async (campaignId: string) => {
      if (!homebrewId) throw new Error('Homebrew ID required');

      const { error } = await supabase
        .from('campaign_homebrews')
        .insert({
          campaign_id: campaignId,
          homebrew_id: homebrewId,
        });

      if (error) {
        if (error.code === '23505') {
          throw new Error('Homebrew já habilitada nesta campanha');
        }
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaign-homebrews'] });
      toast.success('Homebrew habilitada na campanha!');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const getSystemName = (system: string) => {
    switch (system) {
      case '5e': return 'D&D 5e (SRD)';
      case 'olho_da_morte': return 'Sistema Olho da Morte';
      case 'horror': return 'Horror Cósmico';
      default: return system;
    }
  };

  const getRarityLabel = (rarity: string | null) => {
    switch (rarity) {
      case 'comum': return 'Comum';
      case 'incomum': return 'Incomum';
      case 'raro': return 'Raro';
      case 'muito_raro': return 'Muito Raro';
      case 'lendario': return 'Lendário';
      case 'artefato': return 'Artefato';
      default: return rarity;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'item': return '📦 Item';
      case 'creature': return '🐉 Criatura';
      case 'spell': return '✨ Magia';
      case 'class': return '⚔️ Classe';
      case 'race': return '🧝 Raça';
      default: return type;
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <MainLayout>
        <div className="container py-8 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  // Error handling
  if (error || !homebrew) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const isAccessDenied = errorMessage.includes('Access denied');
    const isNotFound = errorMessage.includes('not found');
    
    return (
      <MainLayout>
        <div className="container py-8 max-w-4xl">
          <Link to="/homebrews">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />Voltar
            </Button>
          </Link>
          <Card className="text-center py-12">
            <CardContent>
              {isAccessDenied ? (
                <>
                  <Lock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h2 className="text-xl font-semibold mb-2">Acesso negado</h2>
                  <p className="text-muted-foreground">
                    Esta homebrew é privada e você não tem permissão para visualizá-la.
                  </p>
                </>
              ) : (
                <>
                  <Wand2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h2 className="text-xl font-semibold mb-2">
                    {isNotFound ? 'Homebrew não encontrada' : 'Erro ao carregar'}
                  </h2>
                  <p className="text-muted-foreground">
                    {isNotFound 
                      ? 'A homebrew solicitada não existe ou foi removida.'
                      : 'Ocorreu um erro ao tentar carregar a homebrew. Tente novamente.'}
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  const isOwner = user?.id === homebrew.creator_id;

  return (
    <MainLayout>
      <div className="container py-8 max-w-4xl">
        <Link to="/homebrews">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />Voltar
          </Button>
        </Link>
        
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary" className="capitalize">{getTypeLabel(homebrew.type)}</Badge>
                  {homebrew.rarity && (
                    <Badge variant="outline" className="capitalize">
                      {getRarityLabel(homebrew.rarity)}
                    </Badge>
                  )}
                  {!homebrew.is_public && (
                    <Badge variant="destructive">Privada</Badge>
                  )}
                </div>
                <h1 className="text-3xl font-heading font-bold">{homebrew.name}</h1>
                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                  {author && (
                    <Link to={`/users/${homebrew.creator_id}`} className="hover:underline">
                      por {author.name}
                    </Link>
                  )}
                </div>
              </div>
              <Badge 
                className={
                  homebrew.system === '5e' ? 'bg-amber-600' : 
                  homebrew.system === 'olho_da_morte' ? 'bg-orange-700' : 
                  'bg-purple-700'
                }
              >
                {getSystemName(homebrew.system)}
              </Badge>
            </div>

            <p className="text-muted-foreground mb-6">
              {homebrew.description || 'Sem descrição.'}
            </p>

            {/* Data/Stats section - if homebrew has custom data */}
            {homebrew.data && Object.keys(homebrew.data as object).length > 0 && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Estatísticas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(homebrew.data as Record<string, unknown>).map(([k, v]) => (
                      <div key={k}>
                        <span className="text-muted-foreground capitalize">{k}:</span>{' '}
                        <strong>{String(v)}</strong>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Comentários
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center py-4">
                  Nenhum comentário ainda.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <Button variant="outline" className="w-full gap-2">
              <Heart className="h-4 w-4" />
              Salvar nos Favoritos
            </Button>
            
            <Dialog>
              <DialogTrigger asChild>
                <Button className="w-full gap-2">
                  <Plus className="h-4 w-4" />
                  Habilitar na Campanha
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Escolha uma Campanha</DialogTitle>
                </DialogHeader>
                <div className="space-y-2">
                  {userGMCampaigns.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">
                      Você não é mestre de nenhuma campanha.
                    </p>
                  ) : (
                    userGMCampaigns.map(c => (
                      <Button 
                        key={c.id} 
                        variant="outline" 
                        className="w-full justify-start" 
                        onClick={() => enableInCampaign.mutate(c.id)}
                        disabled={enableInCampaign.isPending}
                      >
                        {c.name}
                      </Button>
                    ))
                  )}
                </div>
              </DialogContent>
            </Dialog>

            {isOwner && (
              <Link to={`/homebrews/${homebrewId}/edit`}>
                <Button variant="outline" className="w-full">
                  Editar Homebrew
                </Button>
              </Link>
            )}

            <Card>
              <CardContent className="pt-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tipo:</span>
                    <span className="capitalize">{homebrew.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Sistema:</span>
                    <span>{getSystemName(homebrew.system)}</span>
                  </div>
                  {homebrew.rarity && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Raridade:</span>
                      <span className="capitalize">{getRarityLabel(homebrew.rarity)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Criada em:</span>
                    <span>{new Date(homebrew.created_at).toLocaleDateString('pt-BR')}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
