import { useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { getSystemName } from '@/data/mockData';
import { User, Settings, Crown, Gamepad2, Eye, EyeOff, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type Campaign = Database['public']['Tables']['campaigns']['Row'];
type Homebrew = Database['public']['Tables']['homebrews']['Row'];
type Membership = Database['public']['Tables']['campaign_memberships']['Row'];

export default function ProfilePage() {
  const { user, profile, loading } = useAuth();
  const { resetToNeutral } = useTheme();
  
  useEffect(() => {
    resetToNeutral();
  }, [resetToNeutral]);

  // Fetch user's campaigns
  const { data: memberships = [] } = useQuery({
    queryKey: ['user-memberships', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('campaign_memberships')
        .select('*, campaigns(*)')
        .eq('user_id', user.id)
        .eq('status', 'approved');
      if (error) throw error;
      return data as (Membership & { campaigns: Campaign })[];
    },
    enabled: !!user,
  });

  // Fetch user's homebrews
  const { data: homebrews = [] } = useQuery({
    queryKey: ['user-homebrews', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('homebrews')
        .select('*')
        .eq('creator_id', user.id);
      if (error) throw error;
      return data as Homebrew[];
    },
    enabled: !!user,
  });

  // Fetch GM campaigns
  const { data: gmCampaigns = [] } = useQuery({
    queryKey: ['gm-campaigns', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .eq('gm_id', user.id);
      if (error) throw error;
      return data as Campaign[];
    },
    enabled: !!user,
  });

  if (loading || !user || !profile) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  const getSystemDisplayName = (system: string) => {
    switch (system) {
      case '5e': return 'D&D 5e (SRD)';
      case 'olho_da_morte': return 'Sistema Olho da Morte';
      case 'horror': return 'Horror Cósmico';
      default: return system;
    }
  };

  // Combine GM campaigns and player campaigns
  const allCampaigns = [
    ...gmCampaigns.map(c => ({ ...c, role: 'gm' as const })),
    ...memberships.map(m => ({ ...m.campaigns, role: 'player' as const })),
  ].filter((c, i, arr) => arr.findIndex(x => x.id === c.id) === i);

  return (
    <MainLayout>
      <div className="container py-8 max-w-4xl">
        <div className="flex items-start gap-6 mb-8">
          <Avatar className="h-24 w-24">
            <AvatarImage src={profile.avatar_url || undefined} />
            <AvatarFallback className="text-2xl">{profile.name[0]}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h1 className="text-3xl font-heading font-bold">{profile.name}</h1>
            <p className="text-muted-foreground">{profile.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline" className="capitalize">
                {profile.subscription_plan === 'premium' ? 'Premium' : 'Free'}
              </Badge>
              <span className="text-sm text-muted-foreground">
                Membro desde {new Date(profile.created_at).toLocaleDateString('pt-BR')}
              </span>
            </div>
          </div>
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />Configurações
          </Button>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Minhas Campanhas ({allCampaigns.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {allCampaigns.map(c => (
                <Link 
                  key={c.id} 
                  to={`/campaigns/${c.id}`} 
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors"
                >
                  <div className="h-12 w-16 rounded bg-muted flex items-center justify-center">
                    <User className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{c.name}</p>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {getSystemDisplayName(c.system)}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {c.role === 'gm' ? (
                          <><Crown className="h-3 w-3 mr-1" />Mestre</>
                        ) : (
                          <><Gamepad2 className="h-3 w-3 mr-1" />Jogador</>
                        )}
                      </Badge>
                    </div>
                  </div>
                </Link>
              ))}
              {allCampaigns.length === 0 && (
                <p className="text-muted-foreground text-center py-4">Nenhuma campanha.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Minhas Homebrews ({homebrews.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {homebrews.map(h => (
                <Link 
                  key={h.id} 
                  to={`/homebrews/${h.id}`} 
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors"
                >
                  <div>
                    <p className="font-medium">{h.name}</p>
                    <p className="text-sm text-muted-foreground capitalize">
                      {h.type} • {getSystemDisplayName(h.system)}
                    </p>
                  </div>
                  <Badge variant="outline">
                    {h.is_public ? (
                      <><Eye className="h-3 w-3 mr-1" />Pública</>
                    ) : (
                      <><EyeOff className="h-3 w-3 mr-1" />Privada</>
                    )}
                  </Badge>
                </Link>
              ))}
              {homebrews.length === 0 && (
                <p className="text-muted-foreground text-center py-4">Nenhuma homebrew.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
