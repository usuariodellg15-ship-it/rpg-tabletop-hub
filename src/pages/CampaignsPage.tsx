import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import { 
  Plus, 
  LogIn, 
  Search, 
  Filter,
  Users,
  Calendar,
  Crown,
  Gamepad2,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { motion } from 'framer-motion';

type Campaign = Database['public']['Tables']['campaigns']['Row'];
type Membership = Database['public']['Tables']['campaign_memberships']['Row'];
type Profile = Database['public']['Tables']['profiles']['Row'];

export default function CampaignsPage() {
  const { user } = useAuth();
  const { resetToNeutral } = useTheme();
  const [search, setSearch] = useState('');
  const [systemFilter, setSystemFilter] = useState<string>('all');

  useEffect(() => {
    resetToNeutral();
  }, [resetToNeutral]);

  // Fetch campaigns where user is GM
  const { data: gmCampaigns = [], isLoading: loadingGm } = useQuery({
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

  // Fetch campaigns where user is member
  const { data: memberCampaigns = [], isLoading: loadingMember } = useQuery({
    queryKey: ['member-campaigns', user?.id],
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

  // Fetch member counts
  const { data: memberCounts = {} } = useQuery({
    queryKey: ['campaign-member-counts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('campaign_memberships')
        .select('campaign_id')
        .eq('status', 'approved');
      if (error) throw error;
      
      const counts: Record<string, number> = {};
      data?.forEach(m => {
        counts[m.campaign_id] = (counts[m.campaign_id] || 0) + 1;
      });
      return counts;
    },
    enabled: !!user,
  });

  // Fetch GM profiles
  const { data: gmProfiles = {} } = useQuery({
    queryKey: ['gm-profiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, name');
      if (error) throw error;
      
      const profiles: Record<string, string> = {};
      data?.forEach(p => {
        profiles[p.user_id] = p.name;
      });
      return profiles;
    },
    enabled: !!user,
  });

  const isLoading = loadingGm || loadingMember;

  // Combine and dedupe campaigns
  const allCampaigns = [
    ...gmCampaigns.map(c => ({ campaign: c, role: 'gm' as const })),
    ...memberCampaigns
      .filter(m => m.campaigns && !gmCampaigns.find(gc => gc.id === m.campaign_id))
      .map(m => ({ campaign: m.campaigns, role: 'player' as const })),
  ].filter(({ campaign }) => {
    if (!campaign) return false;
    const matchesSearch = campaign.name.toLowerCase().includes(search.toLowerCase());
    const matchesSystem = systemFilter === 'all' || campaign.system === systemFilter;
    return matchesSearch && matchesSystem;
  });

  const getSystemName = (system: string) => {
    switch (system) {
      case '5e': return 'D&D 5e (SRD)';
      case 'olho_da_morte': return 'Sistema Olho da Morte';
      case 'horror': return 'Horror Cósmico';
      default: return system;
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <MainLayout>
      <div className="container py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-heading font-bold">Campanhas</h1>
            <p className="text-muted-foreground mt-1">
              Gerencie suas aventuras e participe de novas histórias.
            </p>
          </div>
          <div className="flex gap-2">
            <Link to="/campaigns/join">
              <Button variant="outline" className="gap-2">
                <LogIn className="h-4 w-4" />
                Entrar em Campanha
              </Button>
            </Link>
            <Link to="/campaigns/new">
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Criar Campanha
              </Button>
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar campanhas..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={systemFilter} onValueChange={setSystemFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Sistema" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Sistemas</SelectItem>
              <SelectItem value="5e">D&D 5e (SRD)</SelectItem>
              <SelectItem value="olho_da_morte">Sistema Olho da Morte</SelectItem>
              <SelectItem value="horror">Horror Cósmico</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : allCampaigns.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Gamepad2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhuma campanha encontrada</h3>
              <p className="text-muted-foreground mb-4">
                {search || systemFilter !== 'all' 
                  ? 'Tente ajustar os filtros de busca.'
                  : 'Crie uma nova campanha ou solicite entrada em uma existente.'}
              </p>
              <div className="flex gap-2 justify-center">
                <Link to="/campaigns/new">
                  <Button>Criar Campanha</Button>
                </Link>
                <Link to="/campaigns/join">
                  <Button variant="outline">Entrar em Campanha</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {allCampaigns.map(({ campaign, role }, index) => (
              <motion.div
                key={campaign.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link to={`/campaigns/${campaign.id}`}>
                  <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                    {/* Cover placeholder */}
                    <div className="relative h-40 overflow-hidden bg-gradient-to-br from-primary/20 to-primary/5">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Gamepad2 className="h-16 w-16 text-primary/30" />
                      </div>
                      
                      {/* Status & System Badges */}
                      <div className="absolute top-3 left-3 flex gap-2">
                        <Badge 
                          variant="default"
                          className={
                            campaign.system === '5e' ? 'bg-amber-600' : 
                            campaign.system === 'olho_da_morte' ? 'bg-orange-700' : 
                            'bg-purple-700'
                          }
                        >
                          {getSystemName(campaign.system)}
                        </Badge>
                      </div>
                      <div className="absolute top-3 right-3">
                        <Badge variant={campaign.is_active ? 'default' : 'destructive'}>
                          {campaign.is_active ? 'Ativa' : 'Fechada'}
                        </Badge>
                      </div>

                      {/* Role Badge */}
                      <div className="absolute bottom-3 left-3">
                        <Badge variant="outline" className="bg-background/80 backdrop-blur-sm">
                          {role === 'gm' ? (
                            <><Crown className="h-3 w-3 mr-1" /> Mestre</>
                          ) : (
                            <><Gamepad2 className="h-3 w-3 mr-1" /> Jogador</>
                          )}
                        </Badge>
                      </div>
                    </div>

                    <CardHeader className="pb-2">
                      <h3 className="font-heading font-semibold text-lg line-clamp-1 group-hover:text-primary transition-colors">
                        {campaign.name}
                      </h3>
                    </CardHeader>

                    <CardContent className="pb-2">
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {campaign.description || 'Sem descrição'}
                      </p>
                    </CardContent>

                    <CardFooter className="text-xs text-muted-foreground flex justify-between">
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {(memberCounts[campaign.id] || 0) + 1} membros
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(campaign.updated_at)}
                      </span>
                    </CardFooter>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
