import { useParams, Link } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { users, homebrews, getSystemName } from '@/data/mockData';
import { ArrowLeft, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function UserProfilePage() {
  const { id } = useParams();
  const user = users.find(u => u.id === id);
  const userHomebrews = homebrews.filter(h => h.authorId === id && h.isPublic);

  if (!user) return <MainLayout><div className="container py-8">Usuário não encontrado.</div></MainLayout>;

  return (
    <MainLayout>
      <div className="container py-8 max-w-4xl">
        <Button variant="ghost" className="mb-4" onClick={() => window.history.back()}><ArrowLeft className="h-4 w-4 mr-2" />Voltar</Button>
        
        <div className="flex items-start gap-6 mb-8">
          <Avatar className="h-24 w-24"><AvatarImage src={user.avatar} /><AvatarFallback className="text-2xl">{user.name[0]}</AvatarFallback></Avatar>
          <div>
            <h1 className="text-3xl font-heading font-bold">{user.name}</h1>
            <p className="text-muted-foreground mt-2">{user.bio}</p>
            <p className="text-sm text-muted-foreground mt-2">Membro desde {new Date(user.createdAt).toLocaleDateString('pt-BR')}</p>
          </div>
        </div>

        <h2 className="text-xl font-heading font-semibold mb-4">Homebrews Públicas ({userHomebrews.length})</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {userHomebrews.map(hb => (
            <Link key={hb.id} to={`/homebrews/${hb.id}`}>
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-2"><h3 className="font-heading font-semibold">{hb.name}</h3></CardHeader>
                <CardContent className="pb-2"><p className="text-sm text-muted-foreground line-clamp-2">{hb.description}</p></CardContent>
                <CardFooter className="text-xs text-muted-foreground flex justify-between">
                  <Badge variant="secondary" className="capitalize">{hb.type}</Badge>
                  <span className="flex items-center gap-1"><Star className="h-3 w-3 fill-current text-amber-500" />{hb.rating.toFixed(1)}</span>
                </CardFooter>
              </Card>
            </Link>
          ))}
        </div>
        {userHomebrews.length === 0 && <p className="text-muted-foreground text-center py-8">Este usuário não possui homebrews públicas.</p>}
      </div>
    </MainLayout>
  );
}
