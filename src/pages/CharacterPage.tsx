import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
import { characters, campaigns, users, diceRolls } from '@/data/mockData';
import { ArrowLeft, Edit, Download, History, Dices } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function CharacterPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const char = characters.find(c => c.id === id);
  const campaign = campaigns.find(c => c.id === char?.campaignId);
  const owner = users.find(u => u.id === char?.userId);
  
  const isOwner = char?.userId === user?.id;
  const is5e = campaign?.system === '5e';
  const isHorror = campaign?.system === 'horror';
  const [bonus, setBonus] = useState(0);
  const [lastRoll, setLastRoll] = useState<{ formula: string; result: number } | null>(null);

  if (!char) return <MainLayout><div className="container py-8">Personagem não encontrado.</div></MainLayout>;

  const getAttrs = () => {
    if (is5e) return [['FOR', char.strength], ['DES', char.dexterity], ['CON', char.constitution], ['INT', char.intelligence], ['SAB', char.wisdom], ['CAR', char.charisma]];
    if (isHorror) return [['FOR', char.horrorStr], ['DES', char.horrorDex], ['CON', char.horrorCon], ['INT', char.horrorInt], ['EDU', char.horrorEdu], ['POD', char.horrorPow], ['APR', char.horrorApp], ['TAM', char.horrorSiz]];
    return [['FOR', char.forca], ['AGI', char.agilidade], ['VIG', char.vigor], ['INT', char.intelecto], ['VON', char.vontade], ['PRE', char.presenca]];
  };

  const attrs = getAttrs();

  const rollDice = (formula: string, attrValue?: number) => {
    const diceMatch = formula.match(/(\d+)d(\d+)/);
    if (!diceMatch) return;
    const [, count, sides] = diceMatch.map(Number);
    let total = 0;
    for (let i = 0; i < count; i++) {
      total += Math.floor(Math.random() * sides) + 1;
    }
    const mod = attrValue ? Math.floor((attrValue - 10) / 2) : 0;
    const finalResult = total + mod + bonus;
    setLastRoll({ formula: `${formula}${mod >= 0 ? '+' : ''}${mod}${bonus ? (bonus >= 0 ? '+' : '') + bonus : ''}`, result: finalResult });
    toast.success(`🎲 Resultado: ${finalResult}`);
  };

  const rollPercentile = () => {
    const result = Math.floor(Math.random() * 100) + 1;
    setLastRoll({ formula: '1d100', result });
    toast.success(`🎲 Resultado: ${result}`);
  };

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
              {isHorror && char.sanity !== undefined && (
                <div><p className="text-sm text-muted-foreground mb-1">Sanidade</p><Progress value={(char.sanity / (char.maxSanity || 100)) * 100} className="h-3 [&>div]:bg-purple-500" /><p className="text-right text-sm mt-1">{char.sanity} / {char.maxSanity}</p></div>
              )}
              {!isHorror && <div className="flex justify-between"><span className="text-muted-foreground">{is5e ? 'CA' : 'Defesa'}</span><span className="text-2xl font-bold">{char.ac}</span></div>}
              {char.conditions.length > 0 && <div><p className="text-sm text-muted-foreground mb-2">Condições</p><div className="flex gap-1 flex-wrap">{char.conditions.map(c => <Badge key={c} variant="secondary">{c}</Badge>)}</div></div>}
            </div>
          </CardContent></Card>

          {/* Attributes */}
          <Card><CardHeader><CardTitle>Atributos</CardTitle></CardHeader><CardContent>
            <div className={`grid gap-3 ${isHorror ? 'grid-cols-4' : 'grid-cols-3'}`}>
              {attrs.map(([name, val]) => (
                <div key={name} className="text-center p-2 bg-muted rounded-lg">
                  <p className="text-xs text-muted-foreground">{name}</p>
                  <p className="text-xl font-bold">{val}</p>
                  {!isHorror && <p className="text-xs text-muted-foreground">+{Math.floor(((val as number) - 10) / 2)}</p>}
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

        {/* Quick Rolls - Only for owner */}
        {isOwner && (
          <Card className="mt-6">
            <CardHeader><CardTitle className="flex items-center gap-2"><Dices className="h-5 w-5" />Rolagens Rápidas</CardTitle></CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <Label>Bônus:</Label>
                  <Input type="number" className="w-20" value={bonus} onChange={e => setBonus(parseInt(e.target.value) || 0)} />
                </div>
                {lastRoll && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">Última rolagem:</span>
                    <Badge variant="outline">{lastRoll.formula} = <strong>{lastRoll.result}</strong></Badge>
                  </div>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {isHorror ? (
                  <>
                    <Button variant="outline" size="sm" onClick={rollPercentile}>1d100 (Perícia)</Button>
                    <Button variant="outline" size="sm" onClick={() => rollDice('1d6')}>1d6 (Dano)</Button>
                    <Button variant="outline" size="sm" onClick={() => rollDice('1d10')}>1d10 (Sanidade)</Button>
                  </>
                ) : (
                  <>
                    <Button variant="outline" size="sm" onClick={() => rollDice('1d20', char.strength || char.forca)}>Ataque (FOR)</Button>
                    <Button variant="outline" size="sm" onClick={() => rollDice('1d20', char.dexterity || char.agilidade)}>Ataque (DES/AGI)</Button>
                    <Button variant="outline" size="sm" onClick={() => rollDice('1d20')}>Teste d20</Button>
                    <Button variant="outline" size="sm" onClick={() => rollDice('2d6')}>2d6</Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        )}

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
