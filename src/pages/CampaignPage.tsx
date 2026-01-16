import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { CampaignLayout } from '@/components/campaign/CampaignLayout';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { campaigns, campaignMembers, characters, diceRolls, users, homebrews, enabledHomebrews, getSystemName } from '@/data/mockData';
import { Shield, Users, Scroll, Wand2, Eye, Crown, UserPlus, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';

export default function CampaignPage() {
  const { id } = useParams();
  const { setThemeBySystem } = useTheme();
  const { user } = useAuth();
  
  const campaign = campaigns.find(c => c.id === id);
  const members = campaignMembers.filter(m => m.campaignId === id);
  const chars = characters.filter(c => c.campaignId === id);
  const rolls = diceRolls.filter(r => r.campaignId === id);
  
  const isGM = members.find(m => m.userId === user?.id)?.role === 'gm';
  const pendingMembers = members.filter(m => m.status === 'pending');
  const approvedMembers = members.filter(m => m.status === 'approved');
  
  const campaignHomebrews = enabledHomebrews
    .filter(eh => eh.campaignId === id)
    .map(eh => homebrews.find(h => h.id === eh.homebrewId))
    .filter(Boolean);

  useEffect(() => {
    if (campaign) {
      setThemeBySystem(campaign.system);
    }
  }, [campaign, setThemeBySystem]);

  if (!campaign) {
    return <MainLayout><div className="container py-8">Campanha não encontrada.</div></MainLayout>;
  }

  return (
    <MainLayout>
      <CampaignLayout rolls={rolls}>
        <div className="p-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-heading font-bold">{campaign.name}</h1>
                <Badge className={campaign.system === '5e' ? 'badge-medieval' : 'badge-wildwest'}>
                  {getSystemName(campaign.system)}
                </Badge>
              </div>
              <p className="text-muted-foreground">{campaign.description}</p>
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
              <TabsTrigger value="homebrews"><Wand2 className="h-4 w-4 mr-2" />Homebrews</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader><CardTitle>Resumo</CardTitle></CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <p><strong>Status:</strong> {campaign.status === 'active' ? 'Ativa' : 'Fechada'}</p>
                    <p><strong>Membros:</strong> {approvedMembers.length}</p>
                    <p><strong>Personagens:</strong> {chars.length}</p>
                    <p><strong>Código:</strong> <code className="bg-muted px-2 py-1 rounded">{campaign.code}</code></p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader><CardTitle>Últimas Rolagens</CardTitle></CardHeader>
                  <CardContent>
                    {rolls.slice(-3).reverse().map(roll => (
                      <div key={roll.id} className="flex justify-between py-2 border-b last:border-0">
                        <span className="text-sm">{roll.formula}</span>
                        <span className="font-bold">{roll.result}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="members" className="mt-6">
              {isGM && pendingMembers.length > 0 && (
                <Card className="mb-6">
                  <CardHeader><CardTitle className="flex items-center gap-2"><UserPlus className="h-5 w-5" />Solicitações Pendentes</CardTitle></CardHeader>
                  <CardContent className="space-y-3">
                    {pendingMembers.map(m => {
                      const u = users.find(u => u.id === m.userId);
                      return (
                        <div key={m.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                          <div className="flex items-center gap-3">
                            <Avatar><AvatarImage src={u?.avatar} /><AvatarFallback>{u?.name[0]}</AvatarFallback></Avatar>
                            <span>{u?.name}</span>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline"><Check className="h-4 w-4" /></Button>
                            <Button size="sm" variant="destructive"><X className="h-4 w-4" /></Button>
                          </div>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              )}
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {approvedMembers.map(m => {
                  const u = users.find(u => u.id === m.userId);
                  return (
                    <Link key={m.id} to={`/users/${m.userId}`}>
                      <Card className="hover:shadow-md transition-shadow cursor-pointer">
                        <CardContent className="flex items-center gap-3 p-4">
                          <Avatar className="h-12 w-12"><AvatarImage src={u?.avatar} /><AvatarFallback>{u?.name[0]}</AvatarFallback></Avatar>
                          <div>
                            <p className="font-semibold">{u?.name}</p>
                            <Badge variant="outline">{m.role === 'gm' ? <><Crown className="h-3 w-3 mr-1" />Mestre</> : 'Jogador'}</Badge>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="characters" className="mt-6">
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {chars.map(char => (
                  <Link key={char.id} to={`/characters/${char.id}`}>
                    <Card className="hover:shadow-md transition-shadow">
                      <CardContent className="flex items-center gap-3 p-4">
                        <Avatar className="h-12 w-12"><AvatarImage src={char.portrait} /><AvatarFallback>{char.name[0]}</AvatarFallback></Avatar>
                        <div>
                          <p className="font-semibold">{char.name}</p>
                          <p className="text-sm text-muted-foreground">{char.class} • Nível {char.level}</p>
                          <p className="text-xs">PV: {char.hp}/{char.maxHp} | CA: {char.ac}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
              {!chars.find(c => c.userId === user?.id) && !isGM && (
                <Link to={`/campaigns/${id}/create-character`}>
                  <Button className="mt-4">Criar Ficha</Button>
                </Link>
              )}
            </TabsContent>

            <TabsContent value="homebrews" className="mt-6">
              <div className="space-y-3">
                {campaignHomebrews.map(hb => hb && (
                  <div key={hb.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-semibold">{hb.name}</p>
                      <p className="text-sm text-muted-foreground">{hb.type} • por {users.find(u => u.id === hb.authorId)?.name}</p>
                    </div>
                    {isGM && <Switch defaultChecked />}
                  </div>
                ))}
                {campaignHomebrews.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">Nenhuma homebrew habilitada.</p>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </CampaignLayout>
    </MainLayout>
  );
}
