import { useParams, Link } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
import { characters, campaigns, users } from '@/data/mockData';
import { ArrowLeft, Edit, Download, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';

export default function CharacterPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const char = characters.find(c => c.id === id);
  const campaign = campaigns.find(c => c.id === char?.campaignId);
  const owner = users.find(u => u.id === char?.userId);
  
  const isOwner = char?.userId === user?.id;
  const is5e = campaign?.system === '5e';

  if (!char) return <MainLayout><div className="container py-8">Personagem não encontrado.</div></MainLayout>;

  const attrs = is5e 
    ? [['FOR', char.strength], ['DES', char.dexterity], ['CON', char.constitution], ['INT', char.intelligence], ['SAB', char.wisdom], ['CAR', char.charisma]]
    : [['FOR', char.forca], ['AGI', char.agilidade], ['VIG', char.vigor], ['INT', char.intelecto], ['VON', char.vontade], ['PRE', char.presenca]];

  return (
    <MainLayout>
      <div className="container py-8 max-w-4xl">
        <Link to={`/campaigns/${char.campaignId}`}><Button variant="ghost" className="mb-4"><ArrowLeft className="h-4 w-4 mr-2" />Voltar à Campanha</Button></Link>
        
        {/* Header */}
        <div className="flex items-start gap-6 mb-6">
          <Avatar className="h-24 w-24"><AvatarImage src={char.portrait} /><AvatarFallback className="text-2xl">{char.name[0]}</AvatarFallback></Avatar>
          <div className="flex-1">
            <h1 className="text-3xl font-heading font-bold">{char.name}</h1>
            <p className="text-lg text-muted-foreground">{char.class} • Nível {char.level}</p>
            <p className="text-sm text-muted-foreground mt-1">Jogador: {owner?.name}</p>
            {char.lastEditedBy && <Badge variant="outline" className="mt-2 text-xs">Editado pelo GM</Badge>}
          </div>
          <div className="flex gap-2">
            {isOwner && <Button variant="outline"><Edit className="h-4 w-4 mr-2" />Editar</Button>}
            <Button variant="ghost"><Download className="h-4 w-4" /></Button>
            <Button variant="ghost"><History className="h-4 w-4" /></Button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Stats */}
          <Card><CardHeader><CardTitle>Status</CardTitle></CardHeader><CardContent>
            <div className="space-y-4">
              <div><p className="text-sm text-muted-foreground mb-1">Pontos de Vida</p><Progress value={(char.hp / char.maxHp) * 100} className="h-3" /><p className="text-right text-sm mt-1">{char.hp} / {char.maxHp}</p></div>
              <div className="flex justify-between"><span className="text-muted-foreground">{is5e ? 'CA' : 'Defesa'}</span><span className="text-2xl font-bold">{char.ac}</span></div>
              {char.conditions.length > 0 && <div><p className="text-sm text-muted-foreground mb-2">Condições</p><div className="flex gap-1 flex-wrap">{char.conditions.map(c => <Badge key={c} variant="secondary">{c}</Badge>)}</div></div>}
            </div>
          </CardContent></Card>

          {/* Attributes */}
          <Card><CardHeader><CardTitle>Atributos</CardTitle></CardHeader><CardContent>
            <div className="grid grid-cols-3 gap-3">
              {attrs.map(([name, val]) => (
                <div key={name} className="text-center p-2 bg-muted rounded-lg">
                  <p className="text-xs text-muted-foreground">{name}</p>
                  <p className="text-xl font-bold">{val}</p>
                  <p className="text-xs text-muted-foreground">+{Math.floor(((val as number) - 10) / 2)}</p>
                </div>
              ))}
            </div>
          </CardContent></Card>

          {/* Abilities */}
          <Card><CardHeader><CardTitle>Habilidades</CardTitle></CardHeader><CardContent className="space-y-3">
            {char.abilities.map(ab => (
              <div key={ab.id} className="p-2 bg-muted rounded">
                <div className="flex justify-between items-center"><span className="font-medium text-sm">{ab.name}</span>{ab.maxUses && <span className="text-xs">{ab.uses}/{ab.maxUses}</span>}</div>
                <p className="text-xs text-muted-foreground">{ab.description}</p>
              </div>
            ))}
          </CardContent></Card>
        </div>

        {/* Inventory */}
        <Card className="mt-6"><CardHeader><CardTitle>Inventário</CardTitle></CardHeader><CardContent>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
            {char.inventory.map(item => (
              <div key={item.id} className="p-3 border rounded-lg">
                <div className="flex justify-between"><span className="font-medium">{item.name}</span>{item.quantity > 1 && <Badge variant="secondary">x{item.quantity}</Badge>}</div>
                <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
              </div>
            ))}
          </div>
        </CardContent></Card>

        {/* Notes */}
        {char.notes && <Card className="mt-6"><CardHeader><CardTitle>Notas</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">{char.notes}</p></CardContent></Card>}
      </div>
    </MainLayout>
  );
}
