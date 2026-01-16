import { useParams, Link } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { homebrews, users, campaigns, campaignMembers, getSystemName } from '@/data/mockData';
import { ArrowLeft, Star, Heart, Plus, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export default function HomebrewDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const hb = homebrews.find(h => h.id === id);
  const author = users.find(u => u.id === hb?.authorId);
  
  const userGMCampaigns = campaigns.filter(c => campaignMembers.find(m => m.campaignId === c.id && m.userId === user?.id && m.role === 'gm'));

  if (!hb) return <MainLayout><div className="container py-8">Homebrew não encontrada.</div></MainLayout>;

  const handleEnable = (campaignId: string) => {
    toast.success('Homebrew habilitada na campanha!');
  };

  return (
    <MainLayout>
      <div className="container py-8 max-w-4xl">
        <Link to="/homebrews"><Button variant="ghost" className="mb-4"><ArrowLeft className="h-4 w-4 mr-2" />Voltar</Button></Link>
        
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <div className="flex items-start justify-between mb-4">
              <div>
                <Badge variant="secondary" className="mb-2 capitalize">{hb.type}</Badge>
                <h1 className="text-3xl font-heading font-bold">{hb.name}</h1>
                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                  <Link to={`/users/${hb.authorId}`} className="hover:underline">por {author?.name}</Link>
                  <span className="flex items-center gap-1"><Star className="h-4 w-4 fill-current text-amber-500" />{hb.rating.toFixed(1)} ({hb.ratingCount})</span>
                </div>
              </div>
              <Badge className={hb.system === '5e' ? 'badge-medieval' : 'badge-wildwest'}>{getSystemName(hb.system)}</Badge>
            </div>

            <p className="text-muted-foreground mb-6">{hb.description}</p>

            <Card className="mb-6"><CardHeader><CardTitle>Estatísticas</CardTitle></CardHeader><CardContent>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(hb.stats).map(([k, v]) => <div key={k}><span className="text-muted-foreground capitalize">{k}:</span> <strong>{v}</strong></div>)}
              </div>
            </CardContent></Card>

            <div className="flex gap-2 flex-wrap">{hb.tags.map(t => <Badge key={t} variant="outline">{t}</Badge>)}</div>

            <Card className="mt-6"><CardHeader><CardTitle className="flex items-center gap-2"><MessageSquare className="h-5 w-5" />Comentários</CardTitle></CardHeader><CardContent>
              <p className="text-muted-foreground text-center py-4">Nenhum comentário ainda.</p>
            </CardContent></Card>
          </div>

          <div className="space-y-4">
            <Button variant="outline" className="w-full gap-2"><Heart className="h-4 w-4" />Salvar nos Favoritos</Button>
            
            <Dialog>
              <DialogTrigger asChild><Button className="w-full gap-2"><Plus className="h-4 w-4" />Habilitar na Campanha</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Escolha uma Campanha</DialogTitle></DialogHeader>
                <div className="space-y-2">
                  {userGMCampaigns.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">Você não é mestre de nenhuma campanha.</p>
                  ) : (
                    userGMCampaigns.map(c => (
                      <Button key={c.id} variant="outline" className="w-full justify-start" onClick={() => handleEnable(c.id)}>{c.name}</Button>
                    ))
                  )}
                </div>
              </DialogContent>
            </Dialog>

            {hb.imageUrl && <img src={hb.imageUrl} alt="" className="w-full rounded-lg" />}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
