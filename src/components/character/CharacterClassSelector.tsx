import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type SystemType = Database['public']['Enums']['system_type'];
type SystemClass = Database['public']['Tables']['system_classes']['Row'];
type SystemSpecialization = Database['public']['Tables']['system_specializations']['Row'];

interface CharacterClassSelectorProps {
  system: SystemType;
  selectedClassId: string | null;
  selectedSpecializationId: string | null;
  onClassChange: (classId: string | null, className: string | null) => void;
  onSpecializationChange: (specId: string | null, specName: string | null) => void;
  disabled?: boolean;
}

export function CharacterClassSelector({
  system,
  selectedClassId,
  selectedSpecializationId,
  onClassChange,
  onSpecializationChange,
  disabled = false,
}: CharacterClassSelectorProps) {
  // Fetch system classes
  const { data: classes = [], isLoading: loadingClasses } = useQuery({
    queryKey: ['system-classes', system],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('system_classes')
        .select('*')
        .eq('system', system)
        .order('name');
      if (error) throw error;
      return data as SystemClass[];
    },
  });

  // Fetch specializations for selected class
  const { data: specializations = [], isLoading: loadingSpecs } = useQuery({
    queryKey: ['system-specializations', selectedClassId],
    queryFn: async () => {
      if (!selectedClassId) return [];
      const { data, error } = await supabase
        .from('system_specializations')
        .select('*')
        .eq('class_id', selectedClassId)
        .order('name');
      if (error) throw error;
      return data as SystemSpecialization[];
    },
    enabled: !!selectedClassId,
  });

  const handleClassChange = (classId: string) => {
    if (classId === 'none') {
      onClassChange(null, null);
      onSpecializationChange(null, null);
    } else {
      const selectedClass = classes.find(c => c.id === classId);
      onClassChange(classId, selectedClass?.name || null);
      onSpecializationChange(null, null);
    }
  };

  const handleSpecChange = (specId: string) => {
    if (specId === 'none') {
      onSpecializationChange(null, null);
    } else {
      const selectedSpec = specializations.find(s => s.id === specId);
      onSpecializationChange(specId, selectedSpec?.name || null);
    }
  };

  if (loadingClasses) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm">Carregando classes...</span>
      </div>
    );
  }

  // If no classes for this system, show nothing
  if (classes.length === 0) {
    return null;
  }

  return (
    <div className="grid sm:grid-cols-2 gap-4">
      <div>
        <Label>Classe</Label>
        <Select
          value={selectedClassId || 'none'}
          onValueChange={handleClassChange}
          disabled={disabled}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione uma classe" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Nenhuma</SelectItem>
            {classes.map(c => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Especialização</Label>
        <Select
          value={selectedSpecializationId || 'none'}
          onValueChange={handleSpecChange}
          disabled={disabled || !selectedClassId || loadingSpecs}
        >
          <SelectTrigger>
            <SelectValue placeholder={selectedClassId ? 'Selecione' : 'Escolha uma classe primeiro'} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Nenhuma</SelectItem>
            {specializations.map(s => (
              <SelectItem key={s.id} value={s.id}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
