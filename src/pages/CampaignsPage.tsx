import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
import { 
  campaigns, 
  campaignMembers, 
  users, 
  getSystemName,
  Campaign,
  CampaignMember 
} from '@/data/mockData';
import { 
  Plus, 
  LogIn, 
  Search, 
  Filter,
  Users,
  Calendar,
  Crown,
  Gamepad2
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

export default function CampaignsPage() {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [systemFilter, setSystemFilter] = useState<string>('all');

  const userCampaigns = useMemo(() => {
    if (!user) return [];
    
    const memberCampaigns = campaignMembers
      .filter(m => m.userId === user.id && m.status === 'approved')
      .map(m => {
        const campaign = campaigns.find(c => c.id === m.campaignId);
        return campaign ? { campaign, membership: m } : null;
      })
      .filter(Boolean) as { campaign: Campaign; membership: CampaignMember }[];

    return memberCampaigns.filter(({ campaign }) => {
      const matchesSearch = campaign.name.toLowerCase().includes(search.toLowerCase());
      const matchesSystem = systemFilter === 'all' || campaign.system === systemFilter;
      return matchesSearch && matchesSystem;
    });
  }, [user, search, systemFilter]);

  const getGmName = (gmId: string) => {
    return users.find(u => u.id === gmId)?.name || 'Desconhecido';
  };

  const getMemberCount = (campaignId: string) => {
    return campaignMembers.filter(m => m.campaignId === campaignId && m.status === 'approved').length;
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
              <SelectItem value="5e">5e (SRD)</SelectItem>
              <SelectItem value="autoral">Sistema Autoral</SelectItem>
              <SelectItem value="horror">Horror Cósmico</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Campaigns Grid */}
        {userCampaigns.length === 0 ? (
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
            {userCampaigns.map(({ campaign, membership }, index) => (
              <motion.div
                key={campaign.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link to={`/campaigns/${campaign.id}`}>
                  <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                    {/* Cover Image */}
                    <div className="relative h-40 overflow-hidden">
                      <img
                        src={campaign.coverImage}
                        alt={campaign.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      
                      {/* Status & System Badges */}
                      <div className="absolute top-3 left-3 flex gap-2">
                        <Badge 
                          variant={campaign.status === 'active' ? 'default' : 'secondary'}
                          className={campaign.system === '5e' ? 'badge-medieval' : campaign.system === 'autoral' ? 'badge-wildwest' : 'badge-cosmic'}
                        >
                          {getSystemName(campaign.system)}
                        </Badge>
                      </div>
                      <div className="absolute top-3 right-3">
                        <Badge variant={campaign.status === 'active' ? 'default' : 'destructive'}>
                          {campaign.status === 'active' ? 'Ativa' : 'Fechada'}
                        </Badge>
                      </div>

                      {/* Role Badge */}
                      <div className="absolute bottom-3 left-3">
                        <Badge variant="outline" className="bg-background/80 backdrop-blur-sm">
                          {membership.role === 'gm' ? (
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
                        {campaign.description}
                      </p>
                    </CardContent>

                    <CardFooter className="text-xs text-muted-foreground flex justify-between">
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {getMemberCount(campaign.id)} membros
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(campaign.lastActivity)}
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
