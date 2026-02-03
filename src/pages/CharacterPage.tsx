import { useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import { ArrowLeft, Edit, Download, History, Dices, Loader2, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import HealthSection from '@/components/character/HealthSection';
import ACSection from '@/components/character/ACSection';
import AttributesSection from '@/components/character/AttributesSection';
import SkillsSection, { Skill, getSkillsForSystem } from '@/components/character/SkillsSection';

type Character = Database['public']['Tables']['characters']['Row'];
type Campaign = Database['public']['Tables']['campaigns']['Row'];
type Profile = Database['public']['Tables']['profiles']['Row'];
type SystemType = Database['public']['Enums']['system_type'];

export default function CharacterPage() {
  const { id: characterId } = useParams();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch character
  const { data: character, isLoading, error } = useQuery({
    queryKey: ['character', characterId],
    queryFn: async () => {
      if (!characterId) throw new Error('Character ID required');

      const { data, error } = await supabase
        .from('characters')
        .select('*')
        .eq('id', characterId)
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error('Character not found');
      return data as Character;
    },
    enabled: !!characterId,
  });

  // Fetch campaign
  const { data: campaign } = useQuery({
    queryKey: ['campaign', character?.campaign_id],
    queryFn: async () => {
      if (!character?.campaign_id) return null;

      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .eq('id', character.campaign_id)
        .maybeSingle();

      if (error) throw error;
      return data as Campaign | null;
    },
    enabled: !!character?.campaign_id,
  });

  // Fetch owner profile
  const { data: owner } = useQuery({
    queryKey: ['profile', character?.user_id],
    queryFn: async () => {
      if (!character?.user_id) return null;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', character.user_id)
        .maybeSingle();

      if (error) throw error;
      return data as Profile | null;
    },
    enabled: !!character?.user_id,
  });

  // Update character mutation
  const updateCharacter = useMutation({
    mutationFn: async (updates: Partial<Character>) => {
      if (!characterId) throw new Error('Character ID required');

      const { data, error } = await supabase
        .from('characters')
        .update(updates)
        .eq('id', characterId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['character', characterId] });
    },
    onError: (error: any) => {
      console.error('Error updating character:', error);
      toast.error('Erro ao atualizar personagem.');
    },
  });

  const isOwner = character?.user_id === user?.id;
  const isGM = campaign?.gm_id === user?.id;
  const isEditable = isOwner || isGM;
  const system: SystemType = campaign?.system || '5e';
  const is5e = system === '5e';
  const isHorror = system === 'horror';
  const isAutoral = system === 'olho_da_morte';

  // State for editable values
  const [hp, setHp] = useState(character?.hp_current || 0);
  const [maxHp, setMaxHp] = useState(character?.hp_max || 1);
  const [tempHp, setTempHp] = useState(0);
  
  // AC breakdown state
  const [acBase, setAcBase] = useState(10);
  const [acAttr, setAcAttr] = useState(character?.ac ? Math.max(0, (character.ac - 10)) : 0);
  const [acBonus, setAcBonus] = useState(0);

  // Parse attributes from JSON
  const getInitialAttributes = useCallback(() => {
    if (!character) return [];
    const attrs = (character.attributes as Record<string, number>) || {};
    
    if (is5e) {
      return [
        { key: 'Força', label: 'FOR', value: attrs['Força'] || 10 },
        { key: 'Destreza', label: 'DES', value: attrs['Destreza'] || 10 },
        { key: 'Constituição', label: 'CON', value: attrs['Constituição'] || 10 },
        { key: 'Inteligência', label: 'INT', value: attrs['Inteligência'] || 10 },
        { key: 'Sabedoria', label: 'SAB', value: attrs['Sabedoria'] || 10 },
        { key: 'Carisma', label: 'CAR', value: attrs['Carisma'] || 10 },
      ];
    }
    if (isHorror) {
      return [
        { key: 'Força', label: 'FOR', value: attrs['Força'] || 50 },
        { key: 'Destreza', label: 'DES', value: attrs['Destreza'] || 50 },
        { key: 'Constituição', label: 'CON', value: attrs['Constituição'] || 50 },
        { key: 'Inteligência', label: 'INT', value: attrs['Inteligência'] || 50 },
        { key: 'Educação', label: 'EDU', value: attrs['Educação'] || 50 },
        { key: 'Poder', label: 'POD', value: attrs['Poder'] || 50 },
        { key: 'Aparência', label: 'APR', value: attrs['Aparência'] || 50 },
        { key: 'Tamanho', label: 'TAM', value: attrs['Tamanho'] || 50 },
      ];
    }
    // Olho da Morte / Autoral system
    return [
      { key: 'Força', label: 'FOR', value: attrs['Força'] || 10 },
      { key: 'Agilidade', label: 'AGI', value: attrs['Agilidade'] || 10 },
      { key: 'Vigor', label: 'VIG', value: attrs['Vigor'] || 10 },
      { key: 'Intelecto', label: 'INT', value: attrs['Intelecto'] || 10 },
      { key: 'Vontade', label: 'VON', value: attrs['Vontade'] || 10 },
      { key: 'Presença', label: 'PRE', value: attrs['Presença'] || 10 },
    ];
  }, [character, is5e, isHorror, isAutoral]);

  const [attributes, setAttributes] = useState(getInitialAttributes());

  // Skills state
  const getInitialSkills = (): Skill[] => {
    const baseSkills = getSkillsForSystem(system);
    const attrMap = new Map(attributes.map(a => [a.label, a.value]));
    
    return baseSkills.map(s => ({
      ...s,
      attributeValue: attrMap.get(s.attribute) || 10,
      isProficient: false,
      extraBonus: 0,
    }));
  };

  const [skills, setSkills] = useState<Skill[]>(getInitialSkills());

  // Roll log state
  const [rollLog, setRollLog] = useState<{ skill: string; formula: string; result: number }[]>([]);

  const handleAttributeChange = useCallback((key: string, value: number) => {
    setAttributes(prev => prev.map(a => a.key === key ? { ...a, value } : a));
    setSkills(prev => prev.map(skill => {
      const attr = attributes.find(a => a.label === skill.attribute);
      if (attr && attr.key === key) {
        return { ...skill, attributeValue: value };
      }
      return skill;
    }));
  }, [attributes]);

  const handleACChange = useCallback((base: number, attr: number, bonus: number) => {
    setAcBase(base);
    setAcAttr(attr);
    setAcBonus(bonus);
    const newAC = base + attr + bonus;
    updateCharacter.mutate({ ac: newAC });
  }, [updateCharacter]);

  const handleSkillChange = useCallback((skillId: string, field: keyof Skill, value: any) => {
    setSkills(prev => prev.map(s => s.id === skillId ? { ...s, [field]: value } : s));
  }, []);

  const handleSkillRoll = useCallback((skillName: string, formula: string, result: number) => {
    setRollLog(prev => [{ skill: skillName, formula, result }, ...prev.slice(0, 9)]);
  }, []);

  // Sync HP changes to database
  const handleHpChange = useCallback((newHp: number) => {
    setHp(newHp);
    updateCharacter.mutate({ hp_current: newHp });
  }, [updateCharacter]);

  const handleMaxHpChange = useCallback((newMaxHp: number) => {
    setMaxHp(newMaxHp);
    updateCharacter.mutate({ hp_max: newMaxHp });
  }, [updateCharacter]);

  // Loading state
  if (isLoading) {
    return (
      <MainLayout>
        <div className="container py-8 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  // Error handling
  if (error || !character) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return (
      <MainLayout>
        <div className="container py-8 max-w-5xl">
          <Button variant="ghost" className="mb-4" onClick={() => window.history.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />Voltar
          </Button>
          <Card className="text-center py-12">
            <CardContent>
              <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold mb-2">Personagem não encontrado</h2>
              <p className="text-muted-foreground">
                O personagem solicitado não existe ou você não tem permissão para visualizá-lo.
              </p>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  // Get sanity from skills JSON
  const skills_data = (character.skills as Record<string, number>) || {};
  const sanity = skills_data.sanity || 50;
  const maxSanity = skills_data.maxSanity || 50;

  return (
    <MainLayout>
      <div className="container py-8 max-w-5xl">
        <Link to={`/campaigns/${character.campaign_id}`}>
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />Voltar à Campanha
          </Button>
        </Link>
        
        {/* Header */}
        <div className="flex items-start gap-6 mb-6">
          <Avatar className="h-24 w-24">
            <AvatarFallback className="text-2xl">{character.name[0]}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h1 className="text-3xl font-heading font-bold">{character.name}</h1>
            <p className="text-lg text-muted-foreground">
              {character.class || 'Sem classe'} • Nível {character.level || 1}
            </p>
            <p className="text-sm text-muted-foreground mt-1">Jogador: {owner?.name || 'Desconhecido'}</p>
          </div>
          <div className="flex gap-2">
            {isEditable && <Button variant="outline"><Edit className="h-4 w-4 mr-2" />Editar</Button>}
            <Button variant="ghost"><Download className="h-4 w-4" /></Button>
            <Button variant="ghost"><History className="h-4 w-4" /></Button>
          </div>
        </div>

        <Tabs defaultValue="status" className="space-y-6">
          <TabsList>
            <TabsTrigger value="status">Status</TabsTrigger>
            <TabsTrigger value="skills">Perícias</TabsTrigger>
            <TabsTrigger value="abilities">Habilidades</TabsTrigger>
            <TabsTrigger value="inventory">Inventário</TabsTrigger>
          </TabsList>

          {/* Status Tab */}
          <TabsContent value="status" className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Health Section */}
              <HealthSection
                hp={character.hp_current || hp}
                maxHp={character.hp_max || maxHp}
                tempHp={tempHp}
                onHpChange={handleHpChange}
                onMaxHpChange={handleMaxHpChange}
                onTempHpChange={setTempHp}
                isEditable={isEditable}
              />

              {/* Sanity for Horror */}
              {isHorror && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2">
                      👁 Sanidade
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Progress value={(sanity / maxSanity) * 100} className="h-3 [&>div]:bg-purple-500" />
                    <p className="text-right text-sm mt-2">{sanity} / {maxSanity}</p>
                  </CardContent>
                </Card>
              )}

              {/* AC Section - Not for Horror */}
              {!isHorror && (
                <ACSection
                  baseAC={acBase}
                  attrAC={acAttr}
                  bonusAC={acBonus}
                  onACChange={handleACChange}
                  isEditable={isEditable}
                  label={is5e ? 'Classe de Armadura' : 'Defesa'}
                />
              )}
            </div>

            {/* Attributes Section */}
            <AttributesSection
              system={system}
              attributes={attributes}
              onAttributeChange={handleAttributeChange}
              isEditable={isEditable}
            />

            {/* Quick Rolls - Only for owner */}
            {isOwner && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Dices className="h-5 w-5" />Rolagens Rápidas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {isHorror ? (
                      <>
                        <Button variant="outline" size="sm" onClick={() => {
                          const result = Math.floor(Math.random() * 100) + 1;
                          toast.success(`🎲 1d100: ${result}`);
                          handleSkillRoll('Teste', '1d100', result);
                        }}>1d100</Button>
                        <Button variant="outline" size="sm" onClick={() => {
                          const result = Math.floor(Math.random() * 6) + 1;
                          toast.success(`🎲 1d6: ${result}`);
                          handleSkillRoll('Dano', '1d6', result);
                        }}>1d6</Button>
                      </>
                    ) : (
                      <>
                        <Button variant="outline" size="sm" onClick={() => {
                          const result = Math.floor(Math.random() * 20) + 1;
                          toast.success(`🎲 1d20: ${result}`);
                          handleSkillRoll('Teste', '1d20', result);
                        }}>1d20</Button>
                        <Button variant="outline" size="sm" onClick={() => {
                          const result = Math.floor(Math.random() * 6) + 1 + Math.floor(Math.random() * 6) + 1;
                          toast.success(`🎲 2d6: ${result}`);
                          handleSkillRoll('Dano', '2d6', result);
                        }}>2d6</Button>
                      </>
                    )}
                  </div>

                  {/* Recent Rolls */}
                  {rollLog.length > 0 && (
                    <div className="border-t pt-4">
                      <p className="text-sm font-medium mb-2">Últimas Rolagens:</p>
                      <div className="space-y-1">
                        {rollLog.slice(0, 5).map((roll, i) => (
                          <div key={i} className="flex justify-between text-sm py-1 px-2 bg-muted rounded">
                            <span>{roll.skill}</span>
                            <span className="font-mono">{roll.formula} = <strong>{roll.result}</strong></span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Skills Tab */}
          <TabsContent value="skills">
            <SkillsSection
              system={system}
              skills={skills}
              level={character.level || 1}
              onSkillChange={handleSkillChange}
              onRoll={handleSkillRoll}
              isEditable={isEditable}
            />
          </TabsContent>

          {/* Abilities Tab */}
          <TabsContent value="abilities">
            <Card>
              <CardHeader>
                <CardTitle>Habilidades</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center py-8">
                  Nenhuma habilidade configurada ainda.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Inventory Tab */}
          <TabsContent value="inventory">
            <Card>
              <CardHeader>
                <CardTitle>Inventário</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center py-8">
                  Inventário vazio.
                </p>
              </CardContent>
            </Card>

            {/* Notes */}
            {character.notes && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Notas</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{character.notes}</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
