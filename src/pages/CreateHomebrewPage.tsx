import { MainLayout } from '@/components/layout/MainLayout';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export default function CreateHomebrewPage() {
  const navigate = useNavigate();

  const handleCreate = () => {
    toast.success('Homebrew criada com sucesso!');
    navigate('/homebrews');
  };

  return (
    <MainLayout>
      <div className="container py-8 max-w-2xl">
        <Link to="/homebrews"><Button variant="ghost" className="mb-4"><ArrowLeft className="h-4 w-4 mr-2" />Voltar</Button></Link>
        <h1 className="text-3xl font-heading font-bold mb-6">Criar Homebrew</h1>

        <div className="space-y-6">
          <Card><CardHeader><CardTitle>Informações Básicas</CardTitle></CardHeader><CardContent className="space-y-4">
            <div><Label>Nome</Label><Input placeholder="Nome da homebrew" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Tipo</Label><Select><SelectTrigger><SelectValue placeholder="Tipo" /></SelectTrigger><SelectContent><SelectItem value="item">Item</SelectItem><SelectItem value="creature">Criatura</SelectItem><SelectItem value="spell">Magia</SelectItem></SelectContent></Select></div>
              <div><Label>Sistema</Label><Select><SelectTrigger><SelectValue placeholder="Sistema" /></SelectTrigger><SelectContent><SelectItem value="5e">5e (SRD)</SelectItem><SelectItem value="autoral">Sistema Autoral</SelectItem></SelectContent></Select></div>
            </div>
            <div><Label>Descrição</Label><Textarea placeholder="Descreva sua criação..." rows={4} /></div>
            <div><Label>Tags (separadas por vírgula)</Label><Input placeholder="arma, raro, mágico" /></div>
          </CardContent></Card>

          <Card><CardHeader><CardTitle>Estatísticas</CardTitle></CardHeader><CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">Os campos variam conforme o tipo selecionado.</p>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Campo 1</Label><Input placeholder="Valor" /></div>
              <div><Label>Campo 2</Label><Input placeholder="Valor" /></div>
            </div>
          </CardContent></Card>

          <Card><CardHeader><CardTitle>Visibilidade</CardTitle></CardHeader><CardContent>
            <div className="flex items-center justify-between">
              <div><p className="font-medium">Pública</p><p className="text-sm text-muted-foreground">Outros usuários poderão ver e usar esta homebrew.</p></div>
              <Switch />
            </div>
          </CardContent></Card>

          <div className="flex gap-4">
            <Button variant="outline" className="flex-1" onClick={() => navigate('/homebrews')}>Cancelar</Button>
            <Button className="flex-1" onClick={handleCreate}>Criar Homebrew</Button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
