import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { FileText } from 'lucide-react';

interface NotesSectionProps {
  notes: string;
  isEditable: boolean;
  onNotesChange?: (notes: string) => void;
}

export default function NotesSection({ notes, isEditable, onNotesChange }: NotesSectionProps) {
  const [localNotes, setLocalNotes] = useState(notes);

  const handleChange = useCallback((value: string) => {
    setLocalNotes(value);
    onNotesChange?.(value);
  }, [onNotesChange]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Notas do Personagem
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isEditable ? (
          <Textarea
            value={localNotes}
            onChange={e => handleChange(e.target.value)}
            placeholder="Escreva suas anotações aqui... (suporta **negrito** e *itálico*)"
            className="min-h-[120px] resize-y"
          />
        ) : (
          <div className="prose prose-sm dark:prose-invert max-w-none">
            {localNotes ? (
              <p className="whitespace-pre-wrap text-muted-foreground">{localNotes}</p>
            ) : (
              <p className="text-muted-foreground italic">Sem notas.</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
