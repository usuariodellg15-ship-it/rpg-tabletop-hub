import { useState, useCallback, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import { ArrowLeft, Download, History, Loader2, User, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import HealthSection from '@/components/character/HealthSection';
import ACSection from '@/components/character/ACSection';
import AttributesSection from '@/components/character/AttributesSection';
import SkillsSection, { Skill, getSkillsForSystem } from '@/components/character/SkillsSection';
import { ClassSpecializationSelector } from '@/components/character/ClassSpecializationSelector';
import { LevelControl } from '@/components/character/LevelControl';
import { CustomRollsSection } from '@/components/character/CustomRollsSection';
import { AbilitiesSection } from '@/components/character/AbilitiesSection';
import { CharacterInventory } from '@/components/character/CharacterInventory';

type Character = Database['public']['Tables']['characters']['Row'];
type Campaign = Database['public']['Tables']['campaigns']['Row'];
type Profile = Database['public']['Tables']['profiles']['Row'];
type SystemType = Database['public']['Enums']['system_type'];

const toSafeString = (value: unknown, fallback = ''): string => {
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (value === null || value === undefined) return fallback;
  try {
    return JSON.stringify(value);
  } catch {
    return fallback;
  }
};

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

      const { data, error } = await (supabase
        .from('safe_profiles' as any)
        .select('*')
        .eq('user_id', character.user_id)
        .maybeSingle() as any) as { data: Profile | null; error: any };

      if (error) throw error;
      return data;
    },
    enabled: !!character?.user_id,
  });

  // Update character mutation
  const updateCharacter = useMutation({
    mutationFn: async (updates: Record<string, unknown>) => {
      if (!characterId) throw new Error('Character ID required');

      const { data, error } = await supabase
        .from('characters')
        .update(updates as any)
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
  const [level, setLevel] = useState(character?.level || 1);
  
  // Class & Specialization state
  const [selectedClassId, setSelectedClassId] = useState<string | null>(
    character?.class_id || null
  );
  const [selectedSpecId, setSelectedSpecId] = useState<string | null>(
    character?.specialization_id || null
  );
  
  // AC breakdown state
  const [acBase, setAcBase] = useState(10);
  const [acAttr, setAcAttr] = useState(character?.ac ? Math.max(0, (character.ac - 10)) : 0);
  const [acBonus, setAcBonus] = useState(0);

  // Update local state when character loads
  useEffect(() => {
    if (character) {
      setHp(character.hp_current || 0);
      setMaxHp(character.hp_max || 1);
      setLevel(character.level || 1);
      setSelectedClassId(character.class_id || null);
      setSelectedSpecId(character.specialization_id || null);
    }
  }, [character]);

  // Parse attributes from JSON - memoized to prevent recalculation
  const initialAttributes = useMemo(() => {
    if (!character) return [];
    const attrs = (character.attributes as Record<string, number>) || {};
    
    if (is5e) {
      return [
        { key: 'Força', label: 'FOR', value: Number(attrs['Força']) || 10 },
        { key: 'Destreza', label: 'DES', value: Number(attrs['Destreza']) || 10 },
        { key: 'Constituição', label: 'CON', value: Number(attrs['Constituição']) || 10 },
        { key: 'Inteligência', label: 'INT', value: Number(attrs['Inteligência']) || 10 },
        { key: 'Sabedoria', label: 'SAB', value: Number(attrs['Sabedoria']) || 10 },
        { key: 'Carisma', label: 'CAR', value: Number(attrs['Carisma']) || 10 },
      ];
    }
    if (isHorror) {
      return [
        { key: 'Força', label: 'FOR', value: Number(attrs['Força']) || 50 },
        { key: 'Destreza', label: 'DES', value: Number(attrs['Destreza']) || 50 },
        { key: 'Constituição', label: 'CON', value: Number(attrs['Constituição']) || 50 },
        { key: 'Inteligência', label: 'INT', value: Number(attrs['Inteligência']) || 50 },
        { key: 'Educação', label: 'EDU', value: Number(attrs['Educação']) || 50 },
        { key: 'Poder', label: 'POD', value: Number(attrs['Poder']) || 50 },
        { key: 'Aparência', label: 'APR', value: Number(attrs['Aparência']) || 50 },
        { key: 'Tamanho', label: 'TAM', value: Number(attrs['Tamanho']) || 50 },
      ];
    }
    // Olho da Morte
    return [
      { key: 'Força', label: 'FOR', value: Number(attrs['Força']) || 10 },
      { key: 'Destreza', label: 'DES', value: Number(attrs['Destreza']) || 10 },
      { key: 'Constituição', label: 'CON', value: Number(attrs['Constituição']) || 10 },
      { key: 'Inteligência', label: 'INT', value: Number(attrs['Inteligência']) || 10 },
      { key: 'Sabedoria', label: 'SAB', value: Number(attrs['Sabedoria']) || 10 },
      { key: 'Carisma', label: 'CAR', value: Number(attrs['Carisma']) || 10 },
    ];
  }, [character, is5e, isHorror]);

  const [attributes, setAttributes] = useState(initialAttributes);
  const [attributesInitialized, setAttributesInitialized] = useState(false);

  // Update attributes ONCE when character data first loads
  useEffect(() => {
    if (!attributesInitialized && initialAttributes.length > 0) {
      setAttributes(initialAttributes);
      setAttributesInitialized(true);
    }
  }, [initialAttributes, attributesInitialized]);

  // Skills computed from current attributes state
  const skills = useMemo((): Skill[] => {
    if (attributes.length === 0) return [];
    const baseSkills = getSkillsForSystem(system);
    const attrMap = new Map(attributes.map(a => [a.label, a.value]));
    
    return baseSkills.map(s => ({
      ...s,
      attributeValue: attrMap.get(s.attribute) || 10,
      isProficient: false,
      extraBonus: 0,
    }));
  }, [system, attributes]);

  // Skill customizations
  const [skillCustomizations, setSkillCustomizations] = useState<Record<string, { isProficient: boolean; extraBonus: number }>>({});

  // Merge base skills with customizations
  const mergedSkills = useMemo((): Skill[] => {
    return skills.map(s => ({
      ...s,
      isProficient: skillCustomizations[s.id]?.isProficient ?? false,
      extraBonus: skillCustomizations[s.id]?.extraBonus ?? 0,
    }));
  }, [skills, skillCustomizations]);

  const handleAttributeChange = useCallback((key: string, value: number) => {
    setAttributes(prev => prev.map(a => a.key === key ? { ...a, value } : a));
  }, []);

  const handleACChange = useCallback((base: number, attr: number, bonus: number) => {
    setAcBase(base);
    setAcAttr(attr);
    setAcBonus(bonus);
    const newAC = base + attr + bonus;
    updateCharacter.mutate({ ac: newAC });
  }, [updateCharacter]);

  const handleSkillChange = useCallback((skillId: string, field: keyof Skill, value: unknown) => {
    setSkillCustomizations(prev => ({
      ...prev,
      [skillId]: {
        isProficient: field === 'isProficient' ? Boolean(value) : (prev[skillId]?.isProficient ?? false),
        extraBonus: field === 'extraBonus' ? Number(value) : (prev[skillId]?.extraBonus ?? 0),
      }
    }));
  }, []);

  const handleSkillRoll = useCallback(async (skillName: string, formula: string, result: number) => {
    if (!character || !user) return;
    
    // Save to dice_rolls
    await supabase
      .from('dice_rolls')
      .insert({
        campaign_id: character.campaign_id,
        user_id: user.id,
        character_id: character.id,
        formula,
        result,
        details: skillName,
        roll_type: 'test',
      });
    
    queryClient.invalidateQueries({ queryKey: ['campaign-dice-rolls', character.campaign_id] });
  }, [character, user, queryClient]);

  // Sync HP changes to database
  const handleHpChange = useCallback((newHp: number) => {
    setHp(newHp);
    updateCharacter.mutate({ hp_current: newHp });
  }, [updateCharacter]);

  const handleMaxHpChange = useCallback((newMaxHp: number) => {
    setMaxHp(newMaxHp);
    updateCharacter.mutate({ hp_max: newMaxHp });
  }, [updateCharacter]);

  const handleLevelChange = useCallback((newLevel: number) => {
    setLevel(newLevel);
    updateCharacter.mutate({ level: newLevel });
    toast.success(`Nível atualizado para ${newLevel}!`);
  }, [updateCharacter]);

  const handleClassChange = useCallback((classId: string | null, className: string | null) => {
    setSelectedClassId(classId);
    updateCharacter.mutate({ 
      class_id: classId,
      class: className,
    });
  }, [updateCharacter]);

  const handleSpecChange = useCallback((specId: string | null, _specName: string | null) => {
    setSelectedSpecId(specId);
    updateCharacter.mutate({ 
      specialization_id: specId,
    });
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

  const ownerName = toSafeString(owner?.name, 'Desconhecido');
  const characterName = toSafeString(character.name, 'Sem nome');
  const characterClass = toSafeString(character.class, 'Sem classe');
  const characterNotes = toSafeString(character.notes, '');

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
            <AvatarFallback className="text-2xl">{characterName?.[0] || '?'}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h1 className="text-3xl font-heading font-bold">{characterName}</h1>
            <p className="text-lg text-muted-foreground">
              {characterClass || 'Sem classe'} • Nível {level}
            </p>
            <p className="text-sm text-muted-foreground mt-1">Jogador: {ownerName}</p>
          </div>
          <div className="flex flex-col gap-2 items-end">
            {isEditable && (
              <LevelControl
                level={level}
                onLevelChange={handleLevelChange}
                disabled={updateCharacter.isPending}
              />
            )}
            <div className="flex gap-2">
              <Button variant="ghost" size="icon"><Download className="h-4 w-4" /></Button>
              <Button variant="ghost" size="icon"><History className="h-4 w-4" /></Button>
            </div>
          </div>
        </div>

        <Tabs defaultValue="status" className="space-y-6">
          <TabsList>
            <TabsTrigger value="status">Status</TabsTrigger>
            <TabsTrigger value="skills">Perícias</TabsTrigger>
            <TabsTrigger value="abilities">Habilidades</TabsTrigger>
            <TabsTrigger value="inventory">Inventário</TabsTrigger>
            <TabsTrigger value="rolls">Dados</TabsTrigger>
          </TabsList>

          {/* Status Tab */}
          <TabsContent value="status" className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Health Section */}
              <HealthSection
                hp={hp}
                maxHp={maxHp}
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
                    <Progress value={(sanity / maxSanity) * 100} className="h-3 [&>div]:bg-primary" />
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

            {/* Class & Specialization */}
            {(isAutoral || is5e) && campaign && (
              <ClassSpecializationSelector
                system={system}
                selectedClassId={selectedClassId}
                selectedSpecializationId={selectedSpecId}
                onClassChange={handleClassChange}
                onSpecializationChange={handleSpecChange}
                isEditable={isEditable}
              />
            )}

            {/* Attributes Section */}
            <AttributesSection
              system={system}
              attributes={attributes}
              onAttributeChange={handleAttributeChange}
              isEditable={isEditable}
            />
          </TabsContent>

          {/* Skills Tab */}
          <TabsContent value="skills">
            <SkillsSection
              system={system}
              skills={mergedSkills}
              level={level}
              onSkillChange={handleSkillChange}
              onRoll={handleSkillRoll}
              isEditable={isEditable}
            />
          </TabsContent>

          {/* Abilities Tab */}
          <TabsContent value="abilities">
            <AbilitiesSection
              characterId={character.id}
              classId={selectedClassId}
              specializationId={selectedSpecId}
              level={level}
              isEditable={isEditable}
            />
          </TabsContent>

          {/* Inventory Tab */}
          <TabsContent value="inventory">
            <CharacterInventory
              characterId={character.id}
              campaignId={character.campaign_id}
              system={system}
              maxWeight={Number(character.weight_max) || 60}
              isEditable={isEditable}
            />

            {/* Notes */}
            {characterNotes && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Notas</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground whitespace-pre-wrap">{characterNotes}</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Custom Rolls Tab */}
          <TabsContent value="rolls">
            {user && (
              <CustomRollsSection
                characterId={character.id}
                campaignId={character.campaign_id}
                userId={user.id}
                isEditable={isOwner}
              />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
