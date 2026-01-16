import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { homebrews, users, getSystemName } from '@/data/mockData';
import { Plus, Search, Filter, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function HomebrewsPage() {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [systemFilter, setSystemFilter] = useState('all');

  const publicHomebrews = homebrews.filter(h => h.isPublic);
  const filtered = publicHomebrews.filter(h => {
    const matchesSearch = h.name.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === 'all' || h.type === typeFilter;
    const matchesSystem = systemFilter === 'all' || h.system === systemFilter;
    return matchesSearch && matchesType && matchesSystem;
  });

  return (
    <MainLayout>
      <div className="container py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-heading font-bold">Homebrews</h1>
            <p className="text-muted-foreground">Explore e compartilhe criações da comunidade.</p>
          </div>
          <Link to="/homebrews/new"><Button><Plus className="h-4 w-4 mr-2" />Criar Homebrew</Button></Link>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Buscar..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" /></div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-40"><SelectValue placeholder="Tipo" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="item">Item</SelectItem>
              <SelectItem value="creature">Criatura</SelectItem>
              <SelectItem value="spell">Magia</SelectItem>
            </SelectContent>
          </Select>
          <Select value={systemFilter} onValueChange={setSystemFilter}>
            <SelectTrigger className="w-40"><SelectValue placeholder="Sistema" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="5e">5e (SRD)</SelectItem>
              <SelectItem value="autoral">Sistema Autoral</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(hb => (
            <Link key={hb.id} to={`/homebrews/${hb.id}`}>
              <Card className="h-full hover:shadow-lg transition-shadow">
                {hb.imageUrl && <div className="h-32 overflow-hidden"><img src={hb.imageUrl} alt="" className="w-full h-full object-cover" /></div>}
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <h3 className="font-heading font-semibold line-clamp-1">{hb.name}</h3>
                    <Badge variant="secondary" className="text-xs capitalize">{hb.type}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="pb-2">
                  <p className="text-sm text-muted-foreground line-clamp-2">{hb.description}</p>
                  <div className="flex gap-1 mt-2 flex-wrap">{hb.tags.slice(0, 3).map(t => <Badge key={t} variant="outline" className="text-xs">{t}</Badge>)}</div>
                </CardContent>
                <CardFooter className="text-xs text-muted-foreground flex justify-between">
                  <Link to={`/users/${hb.authorId}`} className="hover:underline" onClick={e => e.stopPropagation()}>{users.find(u => u.id === hb.authorId)?.name}</Link>
                  <span className="flex items-center gap-1"><Star className="h-3 w-3 fill-current text-amber-500" />{hb.rating.toFixed(1)}</span>
                </CardFooter>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </MainLayout>
  );
}
