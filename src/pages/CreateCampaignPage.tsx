import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { useTheme } from '@/contexts/ThemeContext';
import { SystemType, getSystemName } from '@/data/mockData';
import { 
  ArrowLeft, 
  ArrowRight, 
  Upload, 
  Castle, 
  Crosshair,
  Wand2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

export default function CreateCampaignPage() {
  const navigate = useNavigate();
  const { setThemeBySystem, setTheme } = useTheme();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [system, setSystem] = useState<SystemType>('5e');
  const [coverPreview, setCoverPreview] = useState<string>('');

  const handleSystemChange = (value: SystemType) => {
    setSystem(value);
    setThemeBySystem(value);
  };

  const handleCreate = () => {
    if (!name.trim()) {
      toast.error('Por favor, insira um nome para a campanha.');
      return;
    }

    toast.success('Campanha criada com sucesso!');
    // In a real app, this would create the campaign
    navigate('/campaigns/campaign-1');
  };

  // Reset theme when leaving
  const handleBack = () => {
    setTheme('neutral');
    navigate('/campaigns');
  };

  return (
    <MainLayout>
      <div className="container py-8 max-w-3xl">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" onClick={handleBack} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <h1 className="text-3xl font-heading font-bold">Criar Campanha</h1>
          <p className="text-muted-foreground mt-1">
            Configure sua nova aventura e comece a mestre.
          </p>
        </div>

        <div className="space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>Informações Básicas</CardTitle>
              <CardDescription>
                Defina o nome e descrição da sua campanha.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome da Campanha *</Label>
                <Input
                  id="name"
                  placeholder="Ex: A Maldição do Dragão Negro"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  placeholder="Descreva brevemente a premissa da sua campanha..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* System Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Sistema de Jogo</CardTitle>
              <CardDescription>
                Escolha o sistema de regras. O tema visual mudará automaticamente.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup 
                value={system} 
                onValueChange={(v) => handleSystemChange(v as SystemType)}
                className="grid md:grid-cols-2 gap-4"
              >
                <Label
                  htmlFor="system-5e"
                  className={`cursor-pointer rounded-lg border-2 p-4 transition-all ${
                    system === '5e' 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <RadioGroupItem value="5e" id="system-5e" className="sr-only" />
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-lg bg-amber-100 flex items-center justify-center">
                      <Castle className="h-5 w-5 text-amber-700" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold">5e (SRD)</h4>
                      <p className="text-sm text-muted-foreground">
                        Fantasia clássica medieval. Ideal para aventuras heroicas.
                      </p>
                      <div className="mt-2 flex gap-1">
                        <span className="h-4 w-4 rounded-full bg-amber-600" />
                        <span className="h-4 w-4 rounded-full bg-amber-900" />
                        <span className="h-4 w-4 rounded-full bg-stone-400" />
                      </div>
                    </div>
                  </div>
                </Label>

                <Label
                  htmlFor="system-autoral"
                  className={`cursor-pointer rounded-lg border-2 p-4 transition-all ${
                    system === 'autoral' 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <RadioGroupItem value="autoral" id="system-autoral" className="sr-only" />
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-lg bg-orange-950 flex items-center justify-center">
                      <Crosshair className="h-5 w-5 text-orange-400" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold">Sistema Autoral</h4>
                      <p className="text-sm text-muted-foreground">
                        Velho Oeste dark. Para histórias sombrias e violentas.
                      </p>
                      <div className="mt-2 flex gap-1">
                        <span className="h-4 w-4 rounded-full bg-orange-800" />
                        <span className="h-4 w-4 rounded-full bg-red-900" />
                        <span className="h-4 w-4 rounded-full bg-stone-900" />
                      </div>
                    </div>
                  </div>
                </Label>
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Cover Image */}
          <Card>
            <CardHeader>
              <CardTitle>Imagem de Capa</CardTitle>
              <CardDescription>
                Adicione uma imagem que represente sua campanha (opcional).
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
                <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  Arraste uma imagem ou clique para selecionar
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  PNG, JPG até 5MB
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Preview */}
          <AnimatePresence mode="wait">
            <motion.div
              key={system}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className={system === '5e' ? 'card-ornate' : 'card-wanted'}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wand2 className="h-5 w-5" />
                    Prévia do Tema
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="rounded-lg bg-background/50 p-4">
                    <h3 className="font-heading text-xl font-bold mb-2">
                      {name || 'Nome da Campanha'}
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      {description || 'Descrição da campanha aparecerá aqui...'}
                    </p>
                    <div className="mt-4 flex items-center gap-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        system === '5e' 
                          ? 'bg-amber-100 text-amber-800' 
                          : 'bg-orange-950 text-orange-200'
                      }`}>
                        {getSystemName(system)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>

          {/* Actions */}
          <div className="flex justify-end gap-4">
            <Button variant="outline" onClick={handleBack}>
              Cancelar
            </Button>
            <Button onClick={handleCreate} className="gap-2">
              Criar Campanha
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
