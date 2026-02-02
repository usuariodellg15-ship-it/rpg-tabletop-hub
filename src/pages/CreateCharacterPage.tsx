import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import { ArrowLeft, ArrowRight, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

type SystemType = Database['public']['Enums']['system_type'];

export default function CreateCharacterPage() {
  const { id: campaignId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [charClass, setCharClass] = useState('');
  const [attrs, setAttrs] = useState<Record<string, number>>({});
  const [hp, setHp] = useState(10);
  const [acOrSanity, setAcOrSanity] = useState(10);

  // Fetch campaign from Supabase
  const { data: campaign, isLoading: loadingCampaign, error: campaignError } = useQuery({
    queryKey: ['campaign', campaignId],
    queryFn: async () => {
      if (!campaignId) throw new Error('Campaign ID required');
      
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .eq('id', campaignId)
        .maybeSingle();
      
      if (error) throw error;
      if (!data) throw new Error('Campaign not found');
      return data;
    },
    enabled: !!campaignId,
  });

  // Check if user is a member
  const { data: membership } = useQuery({
    queryKey: ['membership', campaignId, user?.id],
    queryFn: async () => {
      if (!campaignId || !user) return null;
      
      const { data, error } = await supabase
        .from('campaign_memberships')
        .select('*')
        .eq('campaign_id', campaignId)
        .eq('user_id', user.id)
        .eq('status', 'approved')
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!campaignId && !!user,
  });

  // Create character mutation
  const createCharacter = useMutation({
    mutationFn: async () => {
      if (!user || !campaignId || !campaign) throw new Error('Missing required data');

      const { data, error } = await supabase
        .from('characters')
        .insert({
          campaign_id: campaignId,
          user_id: user.id,
          name: name.trim(),
          class: charClass.trim() || null,
          level: 1,
          attributes: attrs,
          hp_current: hp,
          hp_max: hp,
          ac: campaign.system === 'horror' ? 0 : acOrSanity,
          skills: campaign.system === 'horror' ? { sanity: acOrSanity, maxSanity: acOrSanity } : null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['characters', campaignId] });
      toast.success('Personagem criado com sucesso!');
      navigate(`/characters/${data.id}`);
    },
    onError: (error: any) => {
      console.error('Error creating character:', error);
      if (error.message?.includes('row-level security')) {
        toast.error('Sem permissão para criar personagem nesta campanha.');
      } else {
        toast.error('Erro ao criar personagem. Tente novamente.');
      }
    },
  });

  const is5e = campaign?.system === '5e';
  const isAutoral = campaign?.system === 'olho_da_morte';
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
    if (!name.trim()) {
      toast.error('O nome do personagem é obrigatório.');
      return;
    }
    createCharacter.mutate();
  };

  // Loading state
  if (loadingCampaign) {
    return (
      <MainLayout>
        <div className="container py-8 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  // Error handling
  if (campaignError || !campaign) {
    return (
      <MainLayout>
        <div className="container py-8 max-w-2xl">
          <Link to="/campaigns">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />Voltar
            </Button>
          </Link>
          <Card className="text-center py-12">
            <CardContent>
              <h2 className="text-xl font-semibold mb-2">Campanha não encontrada</h2>
              <p className="text-muted-foreground">
                A campanha não existe ou você não tem permissão para acessá-la.
              </p>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  // Check membership
  const isGM = campaign.gm_id === user?.id;
  const isMember = !!membership || isGM;

  if (!isMember) {
    return (
      <MainLayout>
        <div className="container py-8 max-w-2xl">
          <Link to={`/campaigns/${campaignId}`}>
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />Voltar
            </Button>
          </Link>
          <Card className="text-center py-12">
            <CardContent>
              <h2 className="text-xl font-semibold mb-2">Acesso negado</h2>
              <p className="text-muted-foreground">
                Você precisa ser um membro aprovado da campanha para criar um personagem.
              </p>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container py-8 max-w-2xl">
        <Link to={`/campaigns/${campaignId}`}>
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />Voltar
          </Button>
        </Link>
        <h1 className="text-3xl font-heading font-bold mb-2">Criar Personagem</h1>
        <p className="text-muted-foreground mb-6">Campanha: {campaign.name}</p>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-8">
          {[1, 2, 3].map(s => (
            <div key={s} className={`flex-1 h-2 rounded-full ${step >= s ? 'bg-primary' : 'bg-muted'}`} />
          ))}
        </div>

        {step === 1 && (
          <Card>
            <CardHeader><CardTitle>Passo 1: Identidade</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Nome do Personagem *</Label>
                <Input 
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                  placeholder={isHorror ? "Ex: Dr. Henry Armitage" : "Ex: Lyanna Raio de Prata"} 
                />
              </div>
              <div>
                <Label>Classe / Ocupação</Label>
                <Input 
                  value={charClass} 
                  onChange={e => setCharClass(e.target.value)} 
                  placeholder={getClassPlaceholder()} 
                />
              </div>
              <Button onClick={() => setStep(2)} className="w-full" disabled={!name.trim()}>
                Próximo<ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <Card>
            <CardHeader><CardTitle>Passo 2: Atributos</CardTitle></CardHeader>
            <CardContent className="space-y-4">
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
                <div>
                  <Label>Pontos de Vida</Label>
                  <Input 
                    type="number" 
                    value={hp}
                    onChange={e => setHp(+e.target.value)}
                  />
                </div>
                {isHorror ? (
                  <div>
                    <Label>Sanidade (SAN)</Label>
                    <Input 
                      type="number" 
                      value={acOrSanity}
                      onChange={e => setAcOrSanity(+e.target.value)}
                    />
                  </div>
                ) : (
                  <div>
                    <Label>{is5e ? 'Classe de Armadura' : 'Defesa'}</Label>
                    <Input 
                      type="number" 
                      value={acOrSanity}
                      onChange={e => setAcOrSanity(+e.target.value)}
                    />
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(1)} className="flex-1">Voltar</Button>
                <Button onClick={() => setStep(3)} className="flex-1">Próximo<ArrowRight className="h-4 w-4 ml-2" /></Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 3 && (
          <Card>
            <CardHeader><CardTitle>Passo 3: Resumo</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-xl font-heading font-bold">{name || 'Sem nome'}</p>
                <p className="text-muted-foreground">{charClass || 'Sem classe'}</p>
                <div className={`grid gap-2 mt-4 text-sm ${isHorror ? 'grid-cols-4' : 'grid-cols-3'}`}>
                  {Object.entries(attrs).map(([k, v]) => (
                    <div key={k}>
                      <span className="text-muted-foreground">{k}:</span> <strong>{v}</strong>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex gap-4 text-sm">
                  <span><span className="text-muted-foreground">PV:</span> <strong>{hp}</strong></span>
                  <span>
                    <span className="text-muted-foreground">{isHorror ? 'SAN' : (is5e ? 'CA' : 'Defesa')}:</span>{' '}
                    <strong>{acOrSanity}</strong>
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(2)} className="flex-1">Voltar</Button>
                <Button 
                  onClick={handleCreate} 
                  className="flex-1"
                  disabled={createCharacter.isPending}
                >
                  {createCharacter.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Criando...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Criar Personagem
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
}
