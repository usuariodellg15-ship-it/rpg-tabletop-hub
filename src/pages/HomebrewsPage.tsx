import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import { Plus, Search, Star, Loader2, Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type Homebrew = Database['public']['Tables']['homebrews']['Row'];
type Profile = Database['public']['Tables']['profiles']['Row'];

export default function HomebrewsPage() {
  const { user } = useAuth();
  const { resetToNeutral } = useTheme();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [systemFilter, setSystemFilter] = useState('all');
  
  useEffect(() => {
    resetToNeutral();
  }, [resetToNeutral]);

  // Fetch public homebrews and user's own homebrews
  const { data: homebrews = [], isLoading } = useQuery({
    queryKey: ['homebrews', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('homebrews')
        .select('*')
        .or(`is_public.eq.true${user ? `,creator_id.eq.${user.id}` : ''}`);
      if (error) throw error;
      return data as Homebrew[];
    },
  });

  // Fetch creator profiles (uses safe_profiles view - no email)
  const { data: profiles = {} } = useQuery({
    queryKey: ['homebrew-creators'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('safe_profiles' as any)
        .select('user_id, name') as { data: { user_id: string; name: string }[] | null; error: any };
      if (error) throw error;
      
      const map: Record<string, string> = {};
      data?.forEach((p) => {
        map[p.user_id] = p.name;
      });
      return map;
    },
  });

  const filtered = homebrews.filter(h => {
    const matchesSearch = h.name.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === 'all' || h.type === typeFilter;
    const matchesSystem = systemFilter === 'all' || h.system === systemFilter;
    return matchesSearch && matchesType && matchesSystem;
  });

  const getSystemName = (system: string) => {
    switch (system) {
      case '5e': return 'D&D 5e (SRD)';
      case 'olho_da_morte': return 'Sistema Olho da Morte';
      case 'horror': return 'Horror Cósmico';
      default: return system;
    }
  };

  return (
    <MainLayout>
      <div className="container py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-heading font-bold">Homebrews</h1>
            <p className="text-muted-foreground">Explore e compartilhe criações da comunidade.</p>
          </div>
          <Link to="/homebrews/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Criar Homebrew
            </Button>
          </Link>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Buscar..." 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
              className="pl-10" 
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="item">Item</SelectItem>
              <SelectItem value="creature">Criatura</SelectItem>
              <SelectItem value="spell">Magia</SelectItem>
              <SelectItem value="class">Classe</SelectItem>
              <SelectItem value="race">Raça</SelectItem>
            </SelectContent>
          </Select>
          <Select value={systemFilter} onValueChange={setSystemFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Sistema" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="5e">D&D 5e (SRD)</SelectItem>
              <SelectItem value="olho_da_morte">Sistema Olho da Morte</SelectItem>
              <SelectItem value="horror">Horror Cósmico</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Wand2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhuma homebrew encontrada</h3>
              <p className="text-muted-foreground mb-4">
                {search || typeFilter !== 'all' || systemFilter !== 'all'
                  ? 'Tente ajustar os filtros de busca.'
                  : 'Seja o primeiro a criar uma homebrew!'}
              </p>
              <Link to="/homebrews/new">
                <Button>Criar Homebrew</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map(hb => (
              <Link key={hb.id} to={`/homebrews/${hb.id}`}>
                <Card className="h-full hover:shadow-lg transition-shadow">
                  <div className="h-32 overflow-hidden bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                    <Wand2 className="h-12 w-12 text-primary/30" />
                  </div>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <h3 className="font-heading font-semibold line-clamp-1">{hb.name}</h3>
                      <Badge variant="secondary" className="text-xs capitalize">{hb.type}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {hb.description || 'Sem descrição'}
                    </p>
                    <div className="flex gap-1 mt-2 flex-wrap">
                      <Badge variant="outline" className="text-xs">
                        {getSystemName(hb.system)}
                      </Badge>
                      {hb.rarity && (
                        <Badge variant="outline" className="text-xs capitalize">
                          {hb.rarity}
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="text-xs text-muted-foreground flex justify-between">
                    <span>{profiles[hb.creator_id] || 'Autor desconhecido'}</span>
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
