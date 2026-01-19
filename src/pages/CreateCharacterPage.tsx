import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { campaigns, SystemType } from '@/data/mockData';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

export default function CreateCharacterPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const campaign = campaigns.find(c => c.id === id);
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [charClass, setCharClass] = useState('');
  const [attrs, setAttrs] = useState<Record<string, number>>({});

  const is5e = campaign?.system === '5e';
  const isAutoral = campaign?.system === 'autoral';
  const isHorror = campaign?.system === 'horror';

  const getAttrNames = () => {
    if (is5e) return ['Força', 'Destreza', 'Constituição', 'Inteligência', 'Sabedoria', 'Carisma'];
    if (isAutoral) return ['Força', 'Agilidade', 'Vigor', 'Intelecto', 'Vontade', 'Presença'];
    if (isHorror) return ['Força', 'Destreza', 'Constituição', 'Inteligência', 'Educação', 'Poder', 'Aparência', 'Tamanho'];
    return [];
  };

  const attrNames = getAttrNames();

  const getClassPlaceholder = () => {
    if (is5e) return "Ex: Paladina, Mago, Ladino";
    if (isAutoral) return "Ex: Pistoleiro, Curandeira, Fora-da-Lei";
    if (isHorror) return "Ex: Professor, Jornalista, Detetive";
    return "Ex: Guerreiro";
  };

  const handleCreate = () => {
    toast.success('Personagem criado com sucesso!');
    navigate(`/campaigns/${id}`);
  };

  return (
    <MainLayout>
      <div className="container py-8 max-w-2xl">
        <Link to={`/campaigns/${id}`}><Button variant="ghost" className="mb-4"><ArrowLeft className="h-4 w-4 mr-2" />Voltar</Button></Link>
        <h1 className="text-3xl font-heading font-bold mb-2">Criar Personagem</h1>
        <p className="text-muted-foreground mb-6">Campanha: {campaign?.name}</p>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-8">
          {[1, 2, 3].map(s => (
            <div key={s} className={`flex-1 h-2 rounded-full ${step >= s ? 'bg-primary' : 'bg-muted'}`} />
          ))}
        </div>

        {step === 1 && (
          <Card><CardHeader><CardTitle>Passo 1: Identidade</CardTitle></CardHeader><CardContent className="space-y-4">
            <div><Label>Nome do Personagem</Label><Input value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Dr. Henry Armitage" /></div>
            <div><Label>Classe / Ocupação</Label><Input value={charClass} onChange={e => setCharClass(e.target.value)} placeholder={getClassPlaceholder()} /></div>
            <Button onClick={() => setStep(2)} className="w-full">Próximo<ArrowRight className="h-4 w-4 ml-2" /></Button>
          </CardContent></Card>
        )}

        {step === 2 && (
          <Card><CardHeader><CardTitle>Passo 2: Atributos</CardTitle></CardHeader><CardContent className="space-y-4">
            <div className={`grid gap-4 ${isHorror ? 'grid-cols-2 md:grid-cols-4' : 'grid-cols-2'}`}>
              {attrNames.map(attr => (
                <div key={attr}>
                  <Label>{attr}</Label>
                  <Input 
                    type="number" 
                    defaultValue={isHorror ? 50 : 10} 
                    min={isHorror ? 1 : 1} 
                    max={isHorror ? 99 : 20} 
                    onChange={e => setAttrs(prev => ({ ...prev, [attr]: +e.target.value }))} 
                  />
                </div>
              ))}
            </div>
            <div className={`grid gap-4 ${isHorror ? 'grid-cols-2' : 'grid-cols-2'}`}>
              <div><Label>Pontos de Vida</Label><Input type="number" defaultValue={isHorror ? 10 : 10} /></div>
              {isHorror ? (
                <div><Label>Sanidade (SAN)</Label><Input type="number" defaultValue={50} /></div>
              ) : (
                <div><Label>{is5e ? 'Classe de Armadura' : 'Defesa'}</Label><Input type="number" defaultValue={10} /></div>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(1)} className="flex-1">Voltar</Button>
              <Button onClick={() => setStep(3)} className="flex-1">Próximo<ArrowRight className="h-4 w-4 ml-2" /></Button>
            </div>
          </CardContent></Card>
        )}

        {step === 3 && (
          <Card><CardHeader><CardTitle>Passo 3: Resumo</CardTitle></CardHeader><CardContent className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-xl font-heading font-bold">{name || 'Sem nome'}</p>
              <p className="text-muted-foreground">{charClass || 'Sem classe'}</p>
              <div className={`grid gap-2 mt-4 text-sm ${isHorror ? 'grid-cols-4' : 'grid-cols-3'}`}>
                {Object.entries(attrs).map(([k, v]) => <div key={k}><span className="text-muted-foreground">{k}:</span> <strong>{v}</strong></div>)}
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(2)} className="flex-1">Voltar</Button>
              <Button onClick={handleCreate} className="flex-1"><Check className="h-4 w-4 mr-2" />Criar Personagem</Button>
            </div>
          </CardContent></Card>
        )}
      </div>
    </MainLayout>
  );
}
