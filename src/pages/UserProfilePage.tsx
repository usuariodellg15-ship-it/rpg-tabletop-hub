import { useParams, Link } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import { ArrowLeft, Star, Loader2, User, Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

type Profile = Database['public']['Tables']['profiles']['Row'];
type Homebrew = Database['public']['Tables']['homebrews']['Row'];

export default function UserProfilePage() {
  const { id: userId } = useParams();
  const { user: currentUser } = useAuth();

  // Fetch user profile
  const { data: profile, isLoading: loadingProfile, error: profileError } = useQuery({
    queryKey: ['user-profile', userId],
    queryFn: async () => {
      if (!userId) throw new Error('User ID required');

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error('User not found');
      return data as Profile;
    },
    enabled: !!userId,
  });

  // Fetch user's public homebrews
  const { data: userHomebrews = [], isLoading: loadingHomebrews } = useQuery({
    queryKey: ['user-homebrews', userId],
    queryFn: async () => {
      if (!userId) return [];

      // Show public homebrews, or all homebrews if viewing own profile
      const isOwnProfile = currentUser?.id === userId;
      
      let query = supabase
        .from('homebrews')
        .select('*')
        .eq('creator_id', userId);

      if (!isOwnProfile) {
        query = query.eq('is_public', true);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Homebrew[];
    },
    enabled: !!userId,
  });

  const getSystemName = (system: string) => {
    switch (system) {
      case '5e': return 'D&D 5e (SRD)';
      case 'olho_da_morte': return 'Sistema Olho da Morte';
      case 'horror': return 'Horror Cósmico';
      default: return system;
    }
  };

  // Loading state
  if (loadingProfile) {
    return (
      <MainLayout>
        <div className="container py-8 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  // Error handling
  if (profileError || !profile) {
    const errorMessage = profileError instanceof Error ? profileError.message : 'Unknown error';
    const isNotFound = errorMessage.includes('not found');
    
    return (
      <MainLayout>
        <div className="container py-8 max-w-4xl">
          <Button variant="ghost" className="mb-4" onClick={() => window.history.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />Voltar
          </Button>
          <Card className="text-center py-12">
            <CardContent>
              <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold mb-2">
                {isNotFound ? 'Usuário não encontrado' : 'Erro ao carregar perfil'}
              </h2>
              <p className="text-muted-foreground">
                {isNotFound 
                  ? 'O usuário solicitado não existe ou foi removido.'
                  : 'Ocorreu um erro ao tentar carregar o perfil. Tente novamente.'}
              </p>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  const isOwnProfile = currentUser?.id === userId;

  return (
    <MainLayout>
      <div className="container py-8 max-w-4xl">
        <Button variant="ghost" className="mb-4" onClick={() => window.history.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />Voltar
        </Button>
        
        <div className="flex items-start gap-6 mb-8">
          <Avatar className="h-24 w-24">
            <AvatarImage src={profile.avatar_url || undefined} />
            <AvatarFallback className="text-2xl">{profile.name[0]}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-3xl font-heading font-bold">{profile.name}</h1>
            {isOwnProfile && (
              <Badge variant="secondary" className="mt-2">Seu perfil</Badge>
            )}
            <p className="text-sm text-muted-foreground mt-2">
              Membro desde {new Date(profile.created_at).toLocaleDateString('pt-BR')}
            </p>
          </div>
        </div>

        <h2 className="text-xl font-heading font-semibold mb-4">
          {isOwnProfile ? 'Suas Homebrews' : 'Homebrews Públicas'} ({userHomebrews.length})
        </h2>

        {loadingHomebrews ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : userHomebrews.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Wand2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {isOwnProfile 
                  ? 'Você ainda não criou nenhuma homebrew.'
                  : 'Este usuário não possui homebrews públicas.'}
              </p>
              {isOwnProfile && (
                <Link to="/homebrews/new" className="mt-4 inline-block">
                  <Button>Criar Homebrew</Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {userHomebrews.map(hb => (
              <Link key={hb.id} to={`/homebrews/${hb.id}`}>
                <Card className="hover:shadow-lg transition-shadow h-full">
                  <div className="h-24 overflow-hidden bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                    <Wand2 className="h-8 w-8 text-primary/30" />
                  </div>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-heading font-semibold line-clamp-1">{hb.name}</h3>
                      <Badge variant="secondary" className="text-xs capitalize shrink-0">{hb.type}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {hb.description || 'Sem descrição'}
                    </p>
                  </CardContent>
                  <CardFooter className="text-xs text-muted-foreground flex justify-between">
                    <Badge variant="outline" className="text-xs">
                      {getSystemName(hb.system)}
                    </Badge>
                    <Badge variant={hb.is_public ? 'default' : 'secondary'}>
                      {hb.is_public ? 'Pública' : 'Privada'}
                    </Badge>
                  </CardFooter>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
