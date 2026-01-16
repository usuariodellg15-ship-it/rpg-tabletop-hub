import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { campaigns, getSystemName } from '@/data/mockData';
import { 
  ArrowLeft, 
  Search, 
  Key,
  Lock,
  Users,
  Clock,
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

export default function JoinCampaignPage() {
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [search, setSearch] = useState('');
  const [pendingCampaignId, setPendingCampaignId] = useState<string | null>(null);

  const publicCampaigns = campaigns.filter(c => c.isPublic && c.status === 'active');
  const filteredCampaigns = publicCampaigns.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const campaign = campaigns.find(c => c.code === code.toUpperCase());
    
    if (!campaign) {
      toast.error('Código de campanha não encontrado.');
      return;
    }

    if (campaign.status === 'closed') {
      toast.error('Esta campanha está fechada para novos jogadores.');
      return;
    }

    toast.success('Solicitação enviada! Aguardando aprovação do mestre.');
    setPendingCampaignId(campaign.id);
  };

  const handleRequestJoin = (campaignId: string) => {
    toast.success('Solicitação enviada! Aguardando aprovação do mestre.');
    setPendingCampaignId(campaignId);
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
                      placeholder="Ex: DRAGON23"
                      value={code}
                      onChange={(e) => setCode(e.target.value.toUpperCase())}
                      className="text-center text-xl tracking-widest font-mono"
                      maxLength={10}
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    Solicitar Entrada
                  </Button>
                </form>

                {pendingCampaignId && (
                  <div className="mt-6 p-4 rounded-lg bg-primary/5 border border-primary/20">
                    <div className="flex items-center gap-2 text-primary mb-2">
                      <Clock className="h-4 w-4" />
                      <span className="font-medium">Solicitação Pendente</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Sua solicitação foi enviada. O mestre da campanha precisa aprovar sua entrada.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="browse">
            <Card>
              <CardHeader>
                <CardTitle>Campanhas Públicas</CardTitle>
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

                <div className="space-y-3">
                  {filteredCampaigns.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      Nenhuma campanha pública encontrada.
                    </p>
                  ) : (
                    filteredCampaigns.map((campaign) => (
                      <div 
                        key={campaign.id}
                        className="flex items-center gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                      >
                        <img
                          src={campaign.coverImage}
                          alt={campaign.name}
                          className="h-16 w-24 rounded object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold truncate">{campaign.name}</h4>
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {campaign.description}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary" className="text-xs">
                              {getSystemName(campaign.system)}
                            </Badge>
                            {campaign.status === 'closed' && (
                              <Badge variant="destructive" className="text-xs gap-1">
                                <Lock className="h-3 w-3" />
                                Fechada
                              </Badge>
                            )}
                          </div>
                        </div>
                        {campaign.status === 'active' ? (
                          pendingCampaignId === campaign.id ? (
                            <Badge variant="outline" className="gap-1">
                              <Clock className="h-3 w-3" />
                              Pendente
                            </Badge>
                          ) : (
                            <Button 
                              size="sm" 
                              onClick={() => handleRequestJoin(campaign.id)}
                            >
                              Solicitar
                            </Button>
                          )
                        ) : (
                          <Button size="sm" variant="ghost" disabled>
                            <Lock className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
