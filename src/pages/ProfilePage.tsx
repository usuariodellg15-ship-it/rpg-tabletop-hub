import { useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { campaigns, campaignMembers, homebrews, getSystemName } from '@/data/mockData';
import { User, Settings, Crown, Gamepad2, Shield, Eye, EyeOff } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Link } from 'react-router-dom';

export default function ProfilePage() {
  const { user } = useAuth();
  const { resetToNeutral } = useTheme();
  
  useEffect(() => {
    resetToNeutral();
  }, [resetToNeutral]);
  if (!user) return null;

  const userMemberships = campaignMembers.filter(m => m.userId === user.id && m.status === 'approved');
  const userCampaigns = userMemberships.map(m => ({ ...campaigns.find(c => c.id === m.campaignId)!, role: m.role })).filter(c => c.id);
  const userHomebrews = homebrews.filter(h => h.authorId === user.id);

  return (
    <MainLayout>
      <div className="container py-8 max-w-4xl">
        <div className="flex items-start gap-6 mb-8">
          <Avatar className="h-24 w-24"><AvatarImage src={user.avatar} /><AvatarFallback className="text-2xl">{user.name[0]}</AvatarFallback></Avatar>
          <div className="flex-1">
            <h1 className="text-3xl font-heading font-bold">{user.name}</h1>
            <p className="text-muted-foreground">{user.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline" className="capitalize">{user.role === 'gm' ? 'Mestre' : user.role === 'admin' ? 'Administrador' : 'Jogador'}</Badge>
              <span className="text-sm text-muted-foreground">Membro desde {new Date(user.createdAt).toLocaleDateString('pt-BR')}</span>
            </div>
            <p className="mt-4 text-muted-foreground">{user.bio}</p>
          </div>
          <Button variant="outline"><Settings className="h-4 w-4 mr-2" />Configurações</Button>
        </div>

        {user.role === 'admin' && (
          <Link to="/admin"><Card className="mb-6 bg-primary/5 border-primary/20 cursor-pointer hover:bg-primary/10 transition-colors"><CardContent className="flex items-center gap-4 p-4">
            <Shield className="h-8 w-8 text-primary" />
            <div><p className="font-semibold">Admin Console</p><p className="text-sm text-muted-foreground">Gerenciar usuários, campanhas e homebrews</p></div>
          </CardContent></Card></Link>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          <Card><CardHeader><CardTitle>Minhas Campanhas ({userCampaigns.length})</CardTitle></CardHeader><CardContent className="space-y-3">
            {userCampaigns.map(c => (
              <Link key={c.id} to={`/campaigns/${c.id}`} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors">
                <img src={c.coverImage} alt="" className="h-12 w-16 rounded object-cover" />
                <div className="flex-1">
                  <p className="font-medium">{c.name}</p>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">{getSystemName(c.system)}</Badge>
                    <Badge variant="outline" className="text-xs">{c.role === 'gm' ? <><Crown className="h-3 w-3 mr-1" />Mestre</> : <><Gamepad2 className="h-3 w-3 mr-1" />Jogador</>}</Badge>
                  </div>
                </div>
              </Link>
            ))}
            {userCampaigns.length === 0 && <p className="text-muted-foreground text-center py-4">Nenhuma campanha.</p>}
          </CardContent></Card>

          <Card><CardHeader><CardTitle>Minhas Homebrews ({userHomebrews.length})</CardTitle></CardHeader><CardContent className="space-y-3">
            {userHomebrews.map(h => (
              <Link key={h.id} to={`/homebrews/${h.id}`} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors">
                <div>
                  <p className="font-medium">{h.name}</p>
                  <p className="text-sm text-muted-foreground capitalize">{h.type} • {getSystemName(h.system)}</p>
                </div>
                <Badge variant="outline">{h.isPublic ? <><Eye className="h-3 w-3 mr-1" />Pública</> : <><EyeOff className="h-3 w-3 mr-1" />Privada</>}</Badge>
              </Link>
            ))}
            {userHomebrews.length === 0 && <p className="text-muted-foreground text-center py-4">Nenhuma homebrew.</p>}
          </CardContent></Card>
        </div>
      </div>
    </MainLayout>
  );
}
