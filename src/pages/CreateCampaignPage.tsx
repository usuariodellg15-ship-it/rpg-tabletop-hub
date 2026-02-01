import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import { 
  ArrowLeft, 
  ArrowRight, 
  Upload, 
  Castle, 
  Crosshair,
  Wand2,
  Skull,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

type SystemType = Database['public']['Enums']['system_type'];

export default function CreateCampaignPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { setThemeBySystem, resetToNeutral } = useTheme();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [system, setSystem] = useState<SystemType>('5e');
  const [isLoading, setIsLoading] = useState(false);

  const handleSystemChange = (value: string) => {
    const systemValue = value as SystemType;
    setSystem(systemValue);
    // Map DB system to theme
    const themeMap: Record<SystemType, string> = {
      '5e': '5e',
      'olho_da_morte': 'autoral',
      'horror': 'horror',
    };
    setThemeBySystem(themeMap[systemValue] as any);
  };

  const generateInviteCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  const handleCreate = async () => {
    if (!name.trim()) {
      toast.error('Por favor, insira um nome para a campanha.');
      return;
    }

    if (!user) {
      toast.error('Você precisa estar logado.');
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase
        .from('campaigns')
        .insert({
          name: name.trim(),
          description: description.trim() || null,
          system,
          gm_id: user.id,
          invite_code: generateInviteCode(),
          is_active: true,
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Campanha criada com sucesso!');
      navigate(`/campaigns/${data.id}`);
    } catch (error) {
      console.error('Error creating campaign:', error);
      toast.error('Erro ao criar campanha. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    resetToNeutral();
    navigate('/campaigns');
  };

  const getSystemName = (sys: SystemType) => {
    switch (sys) {
      case '5e': return 'D&D 5e (SRD)';
      case 'olho_da_morte': return 'Sistema Olho da Morte';
      case 'horror': return 'Horror Cósmico';
      default: return sys;
    }
  };

  const getCardClass = () => {
    switch (system) {
      case '5e': return 'card-ornate';
      case 'olho_da_morte': return 'card-wanted';
      case 'horror': return 'card-eldritch';
      default: return '';
    }
  };

  const getBadgeClass = () => {
    switch (system) {
      case '5e': return 'bg-amber-100 text-amber-800';
      case 'olho_da_morte': return 'bg-orange-950 text-orange-200';
      case 'horror': return 'bg-purple-900 text-emerald-200';
      default: return '';
    }
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
            Configure sua nova aventura e comece a mestrar.
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
                  disabled={isLoading}
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
                  disabled={isLoading}
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
                onValueChange={handleSystemChange}
                className="grid md:grid-cols-3 gap-4"
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
                      <h4 className="font-semibold">D&D 5e (SRD)</h4>
                      <p className="text-sm text-muted-foreground">
                        Fantasia clássica medieval.
                      </p>
                    </div>
                  </div>
                </Label>

                <Label
                  htmlFor="system-olho_da_morte"
                  className={`cursor-pointer rounded-lg border-2 p-4 transition-all ${
                    system === 'olho_da_morte' 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <RadioGroupItem value="olho_da_morte" id="system-olho_da_morte" className="sr-only" />
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-lg bg-orange-950 flex items-center justify-center">
                      <Crosshair className="h-5 w-5 text-orange-400" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold">Sistema Olho da Morte</h4>
                      <p className="text-sm text-muted-foreground">
                        Velho Oeste dark.
                      </p>
                    </div>
                  </div>
                </Label>

                <Label
                  htmlFor="system-horror"
                  className={`cursor-pointer rounded-lg border-2 p-4 transition-all ${
                    system === 'horror' 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <RadioGroupItem value="horror" id="system-horror" className="sr-only" />
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-lg bg-purple-950 flex items-center justify-center">
                      <Skull className="h-5 w-5 text-emerald-400" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold">Horror Cósmico</h4>
                      <p className="text-sm text-muted-foreground">
                        Investigação lovecraftiana.
                      </p>
                    </div>
                  </div>
                </Label>
              </RadioGroup>
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
              <Card className={getCardClass()}>
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
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getBadgeClass()}`}>
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
            <Button variant="outline" onClick={handleBack} disabled={isLoading}>
              Cancelar
            </Button>
            <Button onClick={handleCreate} className="gap-2" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Criando...
                </>
              ) : (
                <>
                  Criar Campanha
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
