import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, FileText, Clock } from 'lucide-react';
import { toast } from 'sonner';

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

const STORAGE_KEY = 'mesahub_gm_notes';

export function GMNotesTab({ campaignId, notes, setNotes }: GMNotesTabProps) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<GMNote | null>(null);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');

  // Load notes from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const allNotes: GMNote[] = JSON.parse(stored);
        const campaignNotes = allNotes.filter(n => n.campaignId === campaignId);
        setNotes(campaignNotes);
      } catch (e) {
        console.error('Failed to load notes from localStorage');
      }
    }
  }, [campaignId, setNotes]);

  // Save notes to localStorage whenever they change
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    let allNotes: GMNote[] = [];
    
    if (stored) {
      try {
        allNotes = JSON.parse(stored);
      } catch (e) {}
    }

    // Remove old notes for this campaign and add current ones
    allNotes = allNotes.filter(n => n.campaignId !== campaignId);
    allNotes = [...allNotes, ...notes];
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allNotes));
  }, [notes, campaignId]);

  const resetForm = () => {
    setNoteTitle('');
    setNoteContent('');
  };

  const handleAdd = () => {
    const newNote: GMNote = {
      id: `note-${Date.now()}`,
      campaignId,
      title: noteTitle || 'Nota sem título',
      content: noteContent,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setNotes(prev => [newNote, ...prev]);
    setIsAddOpen(false);
    resetForm();
    toast.success('Anotação criada!');
  };

  const handleEdit = () => {
    if (!editingNote) return;

    setNotes(prev => prev.map(n => 
      n.id === editingNote.id 
        ? { 
            ...n, 
            title: noteTitle || 'Nota sem título', 
            content: noteContent, 
            updatedAt: new Date().toISOString() 
          } 
        : n
    ));
    setEditingNote(null);
    resetForm();
    toast.success('Anotação atualizada!');
  };

  const handleDelete = (noteId: string) => {
    setNotes(prev => prev.filter(n => n.id !== noteId));
    toast.success('Anotação excluída!');
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
              <Button onClick={handleAdd}>
                Salvar
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
            <Button onClick={handleEdit}>
              Salvar Alterações
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
                      onClick={() => handleDelete(note.id)}
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
