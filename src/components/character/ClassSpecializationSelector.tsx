import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, BookOpen, Star } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type SystemClass = Database['public']['Tables']['system_classes']['Row'];
type SystemSpecialization = Database['public']['Tables']['system_specializations']['Row'];
type SystemType = Database['public']['Enums']['system_type'];

interface ClassSpecializationSelectorProps {
  system: SystemType;
  selectedClassId: string | null;
  selectedSpecializationId: string | null;
  onClassChange: (classId: string | null, className: string | null) => void;
  onSpecializationChange: (specId: string | null, specName: string | null) => void;
  isEditable: boolean;
}

export function ClassSpecializationSelector({
  system,
  selectedClassId,
  selectedSpecializationId,
  onClassChange,
  onSpecializationChange,
  isEditable,
}: ClassSpecializationSelectorProps) {
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

  // Clear specialization if class changes and current spec doesn't belong to new class
  useEffect(() => {
    if (selectedClassId && selectedSpecializationId) {
      const specBelongsToClass = specializations.some(s => s.id === selectedSpecializationId);
      if (!loadingSpecs && specializations.length > 0 && !specBelongsToClass) {
        onSpecializationChange(null, null);
      }
    }
  }, [selectedClassId, specializations, selectedSpecializationId, loadingSpecs, onSpecializationChange]);

  const handleClassChange = (classId: string) => {
    if (classId === 'none') {
      onClassChange(null, null);
      onSpecializationChange(null, null);
    } else {
      const selectedClass = classes.find(c => c.id === classId);
      onClassChange(classId, selectedClass?.name || null);
      onSpecializationChange(null, null); // Reset specialization when class changes
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

  const selectedClass = classes.find(c => c.id === selectedClassId);
  const selectedSpec = specializations.find(s => s.id === selectedSpecializationId);

  if (loadingClasses) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (classes.length === 0) {
    return null; // No classes available for this system
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <BookOpen className="h-4 w-4" />
          Classe & Especialização
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Classe</Label>
            {isEditable ? (
              <Select
                value={selectedClassId || 'none'}
                onValueChange={handleClassChange}
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
            ) : (
              <p className="text-sm font-medium">
                {selectedClass?.name || 'Nenhuma'}
              </p>
            )}
            {selectedClass?.description && (
              <p className="text-xs text-muted-foreground">{selectedClass.description}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Especialização</Label>
            {isEditable ? (
              <Select
                value={selectedSpecializationId || 'none'}
                onValueChange={handleSpecChange}
                disabled={!selectedClassId || loadingSpecs}
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
            ) : (
              <p className="text-sm font-medium">
                {selectedSpec?.name || 'Nenhuma'}
              </p>
            )}
            {selectedSpec?.description && (
              <p className="text-xs text-muted-foreground">{selectedSpec.description}</p>
            )}
          </div>
        </div>

        {(selectedClass || selectedSpec) && (
          <div className="flex gap-2 flex-wrap">
            {selectedClass && (
              <Badge variant="outline" className="gap-1">
                <BookOpen className="h-3 w-3" />
                {selectedClass.name}
              </Badge>
            )}
            {selectedSpec && (
              <Badge variant="secondary" className="gap-1">
                <Star className="h-3 w-3" />
                {selectedSpec.name}
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
