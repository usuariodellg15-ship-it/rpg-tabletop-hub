import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

type SystemType = Database['public']['Enums']['system_type'];
type HomebrewType = Database['public']['Enums']['homebrew_type'];

export default function CreateHomebrewPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<HomebrewType>('item');
  const [system, setSystem] = useState<SystemType>('5e');
  const [rarity, setRarity] = useState('comum');
  const [isPublic, setIsPublic] = useState(false);

  const getSystemName = (sys: SystemType) => {
    switch (sys) {
      case '5e': return 'D&D 5e (SRD)';
      case 'olho_da_morte': return 'Sistema Olho da Morte';
      case 'horror': return 'Horror Cósmico';
      default: return sys;
    }
  };

  const getTypeLabel = (t: HomebrewType) => {
    switch (t) {
      case 'item': return '📦 Item';
      case 'creature': return '🐉 Criatura';
      case 'spell': return '✨ Magia';
      case 'class': return '⚔️ Classe';
      case 'race': return '🧝 Raça';
      default: return t;
    }
  };

  const handleCreate = async () => {
    if (!name.trim()) {
      toast.error('O nome é obrigatório!');
      return;
    }

    if (!user) {
      toast.error('Você precisa estar logado.');
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase
        .from('homebrews')
        .insert({
          creator_id: user.id,
          name: name.trim(),
          description: description.trim() || null,
          type,
          system,
          rarity,
          is_public: isPublic,
          data: {},
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Homebrew criada com sucesso!');
      navigate(`/homebrews/${data.id}`);
    } catch (error) {
      console.error('Error creating homebrew:', error);
      toast.error('Erro ao criar homebrew. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="container py-8 max-w-2xl">
        <Link to="/homebrews">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />Voltar
          </Button>
        </Link>
        <h1 className="text-3xl font-heading font-bold mb-6">Criar Homebrew</h1>

        <div className="space-y-6">
          {/* Type & System Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Configuração</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Tipo</Label>
                  <Select value={type} onValueChange={(v) => setType(v as HomebrewType)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="item">📦 Item</SelectItem>
                      <SelectItem value="creature">🐉 Criatura</SelectItem>
                      <SelectItem value="spell">✨ Magia</SelectItem>
                      <SelectItem value="class">⚔️ Classe</SelectItem>
                      <SelectItem value="race">🧝 Raça</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Sistema</Label>
                  <Select value={system} onValueChange={(v) => setSystem(v as SystemType)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o sistema" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5e">{getSystemName('5e')}</SelectItem>
                      <SelectItem value="olho_da_morte">{getSystemName('olho_da_morte')}</SelectItem>
                      <SelectItem value="horror">{getSystemName('horror')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm">
                  <span className="font-medium">Tipo selecionado:</span>{' '}
                  <span className="text-primary">{getTypeLabel(type)}</span>
                  {' • '}
                  <span className="font-medium">Sistema:</span>{' '}
                  <span className="text-primary">{getSystemName(system)}</span>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Details */}
          <Card>
            <CardHeader>
              <CardTitle>Detalhes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome *</Label>
                <Input
                  id="name"
                  placeholder="Nome da homebrew"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  placeholder="Descreva sua homebrew..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label>Raridade</Label>
                <Select value={rarity} onValueChange={setRarity}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a raridade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="comum">Comum</SelectItem>
                    <SelectItem value="incomum">Incomum</SelectItem>
                    <SelectItem value="raro">Raro</SelectItem>
                    <SelectItem value="muito_raro">Muito Raro</SelectItem>
                    <SelectItem value="lendario">Lendário</SelectItem>
                    <SelectItem value="artefato">Artefato</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Visibility */}
          <Card>
            <CardHeader>
              <CardTitle>Visibilidade</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Pública</p>
                  <p className="text-sm text-muted-foreground">
                    Outros usuários poderão ver e usar esta homebrew.
                  </p>
                </div>
                <Switch 
                  checked={isPublic} 
                  onCheckedChange={setIsPublic}
                  disabled={isLoading}
                />
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-4">
            <Button 
              variant="outline" 
              className="flex-1" 
              onClick={() => navigate('/homebrews')}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button 
              className="flex-1" 
              onClick={handleCreate}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Criando...
                </>
              ) : (
                'Criar Homebrew'
              )}
            </Button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
