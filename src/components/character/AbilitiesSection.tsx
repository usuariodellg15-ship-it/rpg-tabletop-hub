import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sparkles, Plus, Search, Loader2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';

type SystemAbility = Database['public']['Tables']['system_abilities']['Row'];

interface CharacterAbility {
  id: string;
  character_id: string;
  ability_id: string | null;
  homebrew_id: string | null;
  custom_name: string | null;
  custom_description: string | null;
  level_acquired: number;
}

interface AbilitiesSectionProps {
  characterId: string;
  classId: string | null;
  specializationId: string | null;
  level: number;
  isEditable: boolean;
}

export function AbilitiesSection({
  characterId,
  classId,
  specializationId,
  level,
  isEditable,
}: AbilitiesSectionProps) {
  const queryClient = useQueryClient();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch character abilities
  const { data: characterAbilities = [], isLoading: loadingAbilities } = useQuery({
    queryKey: ['character-abilities', characterId],
    queryFn: async () => {
      const { data, error } = await (supabase
        .from('character_abilities' as any)
        .select('*')
        .eq('character_id', characterId)
        .order('level_acquired') as any);
      if (error) throw error;
      return (data || []) as CharacterAbility[];
    },
  });

  // Fetch available system abilities for class/specialization
  const { data: availableAbilities = [], isLoading: loadingAvailable } = useQuery({
    queryKey: ['available-abilities', classId, specializationId],
    queryFn: async () => {
      if (!classId) return [];
      
      let query = supabase
        .from('system_abilities')
        .select('*')
        .order('level_required');
      
      // Get class abilities OR specialization abilities
      if (specializationId) {
        query = query.or(`class_id.eq.${classId},specialization_id.eq.${specializationId}`);
      } else {
        query = query.eq('class_id', classId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as SystemAbility[];
    },
    enabled: !!classId,
  });

  // Get ability details for display
  const { data: abilityDetails = {} } = useQuery({
    queryKey: ['ability-details', characterAbilities.map(a => a.ability_id).filter(Boolean)],
    queryFn: async () => {
      const abilityIds = characterAbilities.map(a => a.ability_id).filter(Boolean) as string[];
      if (abilityIds.length === 0) return {};
      
      const { data, error } = await supabase
        .from('system_abilities')
        .select('*')
        .in('id', abilityIds);
      
      if (error) throw error;
      
      const map: Record<string, SystemAbility> = {};
      data?.forEach(a => { map[a.id] = a; });
      return map;
    },
    enabled: characterAbilities.some(a => a.ability_id),
  });

  // Add ability mutation
  const addMutation = useMutation({
    mutationFn: async (abilityId: string) => {
      const ability = availableAbilities.find(a => a.id === abilityId);
      const { error } = await (supabase
        .from('character_abilities' as any)
        .insert({
          character_id: characterId,
          ability_id: abilityId,
          level_acquired: ability?.level_required || level,
        }) as any);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Habilidade adicionada!');
      queryClient.invalidateQueries({ queryKey: ['character-abilities', characterId] });
      setIsAddOpen(false);
    },
    onError: () => {
      toast.error('Erro ao adicionar habilidade.');
    },
  });

  // Remove ability mutation
  const removeMutation = useMutation({
    mutationFn: async (abilityRecordId: string) => {
      const { error } = await (supabase
        .from('character_abilities' as any)
        .delete()
        .eq('id', abilityRecordId) as any);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Habilidade removida.');
      queryClient.invalidateQueries({ queryKey: ['character-abilities', characterId] });
    },
    onError: () => {
      toast.error('Erro ao remover habilidade.');
    },
  });

  // Filter available abilities that aren't already added
  const addedAbilityIds = new Set(characterAbilities.map(a => a.ability_id).filter(Boolean));
  const filteredAvailable = availableAbilities.filter(a => {
    if (addedAbilityIds.has(a.id)) return false;
    if (searchQuery && !a.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const getAbilityName = (ca: CharacterAbility) => {
    if (ca.custom_name) return ca.custom_name;
    if (ca.ability_id && abilityDetails[ca.ability_id]) {
      return abilityDetails[ca.ability_id].name;
    }
    return 'Habilidade';
  };

  const getAbilityDescription = (ca: CharacterAbility) => {
    if (ca.custom_description) return ca.custom_description;
    if (ca.ability_id && abilityDetails[ca.ability_id]) {
      return abilityDetails[ca.ability_id].description;
    }
    return null;
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          Habilidades
        </CardTitle>
        {isEditable && classId && (
          <Button size="sm" onClick={() => setIsAddOpen(true)}>
            <Plus className="h-4 w-4 mr-1" />
            Adicionar
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {loadingAbilities ? (
          <div className="flex justify-center py-4">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : characterAbilities.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              {classId 
                ? 'Nenhuma habilidade adicionada ainda.'
                : 'Selecione uma classe para ver habilidades disponíveis.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {characterAbilities.map(ca => (
              <div
                key={ca.id}
                className="p-3 border rounded-lg"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{getAbilityName(ca)}</span>
                      <Badge variant="outline" className="text-xs">
                        NV {ca.level_acquired}
                      </Badge>
                    </div>
                    {getAbilityDescription(ca) && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {getAbilityDescription(ca)}
                      </p>
                    )}
                  </div>
                  {isEditable && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => removeMutation.mutate(ca.id)}
                      disabled={removeMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {/* Add Ability Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="max-w-lg max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Adicionar Habilidade</DialogTitle>
          </DialogHeader>
          
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar habilidade..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <ScrollArea className="flex-1 min-h-0">
            {loadingAvailable ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : filteredAvailable.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                {searchQuery 
                  ? 'Nenhuma habilidade encontrada.'
                  : 'Nenhuma habilidade disponível para adicionar.'}
              </p>
            ) : (
              <div className="space-y-2">
                {filteredAvailable.map(ability => (
                  <div
                    key={ability.id}
                    className="p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => addMutation.mutate(ability.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{ability.name}</span>
                          <Badge variant="secondary" className="text-xs">
                            NV {ability.level_required}
                          </Badge>
                        </div>
                        {ability.description && (
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {ability.description}
                          </p>
                        )}
                      </div>
                      <Plus className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddOpen(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
