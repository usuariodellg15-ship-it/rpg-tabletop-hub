import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, FileText, Clock, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface GMNote {
  id: string;
  campaignId: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

interface GMNotesTabProps {
  campaignId: string;
  notes: GMNote[];
  setNotes: React.Dispatch<React.SetStateAction<GMNote[]>>;
}

export function GMNotesTab({ campaignId }: GMNotesTabProps) {
  const queryClient = useQueryClient();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<GMNote | null>(null);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');

  // Fetch notes from Supabase
  const { data: notes = [], isLoading } = useQuery({
    queryKey: ['gm-notes', campaignId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gm_notes')
        .select('*')
        .eq('campaign_id', campaignId)
        .order('updated_at', { ascending: false });
      if (error) throw error;
      return data.map(n => ({
        id: n.id,
        campaignId: n.campaign_id,
        title: n.title || '',
        content: n.content,
        createdAt: n.created_at,
        updatedAt: n.updated_at,
      })) as GMNote[];
    },
    enabled: !!campaignId,
  });

  // Add note mutation
  const addMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('gm_notes')
        .insert({
          campaign_id: campaignId,
          title: noteTitle || 'Nota sem título',
          content: noteContent,
        });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Anotação criada!');
      queryClient.invalidateQueries({ queryKey: ['gm-notes', campaignId] });
      setIsAddOpen(false);
      resetForm();
    },
    onError: () => {
      toast.error('Erro ao criar anotação.');
    },
  });

  // Update note mutation
  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!editingNote) return;
      const { error } = await supabase
        .from('gm_notes')
        .update({
          title: noteTitle || 'Nota sem título',
          content: noteContent,
        })
        .eq('id', editingNote.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Anotação atualizada!');
      queryClient.invalidateQueries({ queryKey: ['gm-notes', campaignId] });
      setEditingNote(null);
      resetForm();
    },
    onError: () => {
      toast.error('Erro ao atualizar anotação.');
    },
  });

  // Delete note mutation
  const deleteMutation = useMutation({
    mutationFn: async (noteId: string) => {
      const { error } = await supabase
        .from('gm_notes')
        .delete()
        .eq('id', noteId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Anotação excluída!');
      queryClient.invalidateQueries({ queryKey: ['gm-notes', campaignId] });
    },
    onError: () => {
      toast.error('Erro ao excluir anotação.');
    },
  });

  const resetForm = () => {
    setNoteTitle('');
    setNoteContent('');
  };

  const openEdit = (note: GMNote) => {
    setEditingNote(note);
    setNoteTitle(note.title);
    setNoteContent(note.content);
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Anotações do Mestre
        </h3>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Nova Anotação
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nova Anotação</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Título (opcional)</Label>
                <Input 
                  value={noteTitle} 
                  onChange={(e) => setNoteTitle(e.target.value)} 
                  placeholder="Ex: Ideias para próxima sessão"
                />
              </div>
              <div>
                <Label>Conteúdo</Label>
                <Textarea
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  placeholder="Suas anotações aqui..."
                  className="min-h-[200px]"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setIsAddOpen(false); resetForm(); }}>
                Cancelar
              </Button>
              <Button onClick={() => addMutation.mutate()} disabled={addMutation.isPending}>
                {addMutation.isPending ? 'Salvando...' : 'Salvar'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingNote} onOpenChange={(open) => !open && setEditingNote(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Anotação</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Título (opcional)</Label>
              <Input 
                value={noteTitle} 
                onChange={(e) => setNoteTitle(e.target.value)} 
                placeholder="Ex: Ideias para próxima sessão"
              />
            </div>
            <div>
              <Label>Conteúdo</Label>
              <Textarea
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                placeholder="Suas anotações aqui..."
                className="min-h-[200px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setEditingNote(null); resetForm(); }}>
              Cancelar
            </Button>
            <Button onClick={() => updateMutation.mutate()} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Notes List */}
      {notes.length > 0 ? (
        <div className="space-y-3">
          {notes.map(note => (
            <Card key={note.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h4 className="font-semibold">{note.title}</h4>
                    <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap line-clamp-3">
                      {note.content}
                    </p>
                    <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      Atualizado: {formatDate(note.updatedAt)}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" onClick={() => openEdit(note)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="text-destructive hover:text-destructive"
                      onClick={() => deleteMutation.mutate(note.id)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-8">
            <p className="text-center text-muted-foreground">
              Nenhuma anotação ainda. Clique em "Nova Anotação" para começar.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
