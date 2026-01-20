import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import HomebrewFormFields, { HomebrewItemType, getItemTypeLabel } from '@/components/homebrew/HomebrewFormFields';
import { SystemType, getSystemName } from '@/data/mockData';

export default function CreateHomebrewPage() {
  const navigate = useNavigate();
  const [itemType, setItemType] = useState<HomebrewItemType>('misc');
  const [system, setSystem] = useState<SystemType>('5e');
  const [isPublic, setIsPublic] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({});

  const handleFormChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleTypeChange = (type: HomebrewItemType) => {
    setItemType(type);
    // Reset form data when type changes (keep only common fields)
    setFormData(prev => ({
      name: prev.name,
      description: prev.description,
      rarity: prev.rarity,
    }));
  };

  const handleCreate = () => {
    // Validate required fields
    if (!formData.name || !formData.description || !formData.rarity) {
      toast.error('Preencha todos os campos obrigatórios!');
      return;
    }
    toast.success('Homebrew criada com sucesso!');
    navigate('/homebrews');
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
                  <Label>Tipo de Item</Label>
                  <Select value={itemType} onValueChange={(v) => handleTypeChange(v as HomebrewItemType)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="scroll">📜 Pergaminho</SelectItem>
                      <SelectItem value="weapon">⚔️ Arma</SelectItem>
                      <SelectItem value="armor">🛡️ Armadura</SelectItem>
                      <SelectItem value="consumable">🧪 Consumível</SelectItem>
                      <SelectItem value="misc">📦 Item Geral</SelectItem>
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
                      <SelectItem value="autoral">{getSystemName('autoral')}</SelectItem>
                      <SelectItem value="horror">{getSystemName('horror')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Selected type indicator */}
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm">
                  <span className="font-medium">Tipo selecionado:</span>{' '}
                  <span className="text-primary">{getItemTypeLabel(itemType)}</span>
                  {' • '}
                  <span className="font-medium">Sistema:</span>{' '}
                  <span className="text-primary">{getSystemName(system)}</span>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Dynamic Form Fields */}
          <Card>
            <CardHeader>
              <CardTitle>Detalhes do {getItemTypeLabel(itemType)}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <HomebrewFormFields
                itemType={itemType}
                system={system}
                formData={formData}
                onChange={handleFormChange}
              />
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
                <Switch checked={isPublic} onCheckedChange={setIsPublic} />
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-4">
            <Button variant="outline" className="flex-1" onClick={() => navigate('/homebrews')}>
              Cancelar
            </Button>
            <Button className="flex-1" onClick={handleCreate}>
              Criar Homebrew
            </Button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
