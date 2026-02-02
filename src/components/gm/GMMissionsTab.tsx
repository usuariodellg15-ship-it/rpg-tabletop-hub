import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Edit, Check, Target, CheckCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Simplified mission interface
interface Mission {
  id: string;
  campaignId: string;
  title: string;
  description: string;
  status: 'active' | 'completed';
  notes: string;
  objectives?: string[];
  rewards?: string;
  createdAt: string;
  completedAt?: string | null;
}

interface GMMissionsTabProps {
  campaignId: string;
  missions: Mission[];
  setMissions: React.Dispatch<React.SetStateAction<Mission[]>>;
}

export function GMMissionsTab({ campaignId }: GMMissionsTabProps) {
  const queryClient = useQueryClient();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingMission, setEditingMission] = useState<Mission | null>(null);
  const [missionTitle, setMissionTitle] = useState('');
  const [missionDesc, setMissionDesc] = useState('');
  const [missionObjectives, setMissionObjectives] = useState('');
  const [missionRewards, setMissionRewards] = useState('');
  const [viewTab, setViewTab] = useState('active');

  // Fetch missions from Supabase
  const { data: missions = [], isLoading } = useQuery({
    queryKey: ['gm-missions', campaignId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('missions')
        .select('*')
        .eq('campaign_id', campaignId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data.map(m => ({
        id: m.id,
        campaignId: m.campaign_id,
        title: m.title,
        description: m.description || '',
        status: m.status as 'active' | 'completed',
        notes: '',
        objectives: (m.objectives as string[]) || [],
        rewards: m.rewards || '',
        createdAt: m.created_at,
        completedAt: m.completed_at,
      })) as Mission[];
    },
    enabled: !!campaignId,
  });

  // Add mission mutation
  const addMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('missions')
        .insert({
          campaign_id: campaignId,
          title: missionTitle,
          description: missionDesc,
          objectives: missionObjectives.split('\n').filter(Boolean),
          rewards: missionRewards,
          status: 'active',
        });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Missão criada!');
      queryClient.invalidateQueries({ queryKey: ['gm-missions', campaignId] });
      setIsAddOpen(false);
      resetForm();
    },
    onError: () => {
      toast.error('Erro ao criar missão.');
    },
  });

  // Update mission mutation
  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!editingMission) return;
      const { error } = await supabase
        .from('missions')
        .update({
          title: missionTitle,
          description: missionDesc,
          objectives: missionObjectives.split('\n').filter(Boolean),
          rewards: missionRewards,
        })
        .eq('id', editingMission.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Missão atualizada!');
      queryClient.invalidateQueries({ queryKey: ['gm-missions', campaignId] });
      setEditingMission(null);
      resetForm();
    },
    onError: () => {
      toast.error('Erro ao atualizar missão.');
    },
  });

  // Complete mission mutation
  const completeMutation = useMutation({
    mutationFn: async (missionId: string) => {
      const { error } = await supabase
        .from('missions')
        .update({ 
          status: 'completed',
          completed_at: new Date().toISOString(),
        })
        .eq('id', missionId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Missão concluída! 🎉');
      queryClient.invalidateQueries({ queryKey: ['gm-missions', campaignId] });
      setEditingMission(null);
      resetForm();
    },
    onError: () => {
      toast.error('Erro ao concluir missão.');
    },
  });

  const resetForm = () => {
    setMissionTitle('');
    setMissionDesc('');
    setMissionObjectives('');
    setMissionRewards('');
  };

  const openEdit = (mission: Mission) => {
    setEditingMission(mission);
    setMissionTitle(mission.title);
    setMissionDesc(mission.description);
    setMissionObjectives(mission.objectives?.join('\n') || '');
    setMissionRewards(mission.rewards || '');
  };

  const activeMissions = missions.filter(m => m.status === 'active');
  const completedMissions = missions.filter(m => m.status === 'completed');

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
          <Target className="h-5 w-5" />
          Missões e Objetivos
        </h3>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Nova Missão
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nova Missão</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Título *</Label>
                <Input 
                  value={missionTitle} 
                  onChange={(e) => setMissionTitle(e.target.value)} 
                  placeholder="Ex: Encontrar o Artefato"
                />
              </div>
              <div>
                <Label>Descrição (opcional)</Label>
                <Textarea
                  value={missionDesc}
                  onChange={(e) => setMissionDesc(e.target.value)}
                  placeholder="Detalhes da missão..."
                />
              </div>
              <div>
                <Label>Objetivos (um por linha)</Label>
                <Textarea
                  value={missionObjectives}
                  onChange={(e) => setMissionObjectives(e.target.value)}
                  placeholder="Objetivo 1&#10;Objetivo 2&#10;Objetivo 3"
                />
              </div>
              <div>
                <Label>Recompensas (opcional)</Label>
                <Input 
                  value={missionRewards} 
                  onChange={(e) => setMissionRewards(e.target.value)} 
                  placeholder="Ex: 500 XP, Espada Mágica"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setIsAddOpen(false); resetForm(); }}>
                Cancelar
              </Button>
              <Button 
                onClick={() => addMutation.mutate()} 
                disabled={!missionTitle.trim() || addMutation.isPending}
              >
                {addMutation.isPending ? 'Criando...' : 'Criar Missão'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingMission} onOpenChange={(open) => !open && setEditingMission(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Missão</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Título *</Label>
              <Input 
                value={missionTitle} 
                onChange={(e) => setMissionTitle(e.target.value)} 
              />
            </div>
            <div>
              <Label>Descrição</Label>
              <Textarea
                value={missionDesc}
                onChange={(e) => setMissionDesc(e.target.value)}
              />
            </div>
            <div>
              <Label>Objetivos (um por linha)</Label>
              <Textarea
                value={missionObjectives}
                onChange={(e) => setMissionObjectives(e.target.value)}
              />
            </div>
            <div>
              <Label>Recompensas</Label>
              <Input 
                value={missionRewards} 
                onChange={(e) => setMissionRewards(e.target.value)} 
              />
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            {editingMission?.status === 'active' && (
              <Button 
                variant="outline" 
                className="text-green-600 border-green-600 hover:bg-green-50"
                onClick={() => editingMission && completeMutation.mutate(editingMission.id)}
                disabled={completeMutation.isPending}
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Concluir Missão
              </Button>
            )}
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => { setEditingMission(null); resetForm(); }}>
                Cancelar
              </Button>
              <Button onClick={() => updateMutation.mutate()} disabled={updateMutation.isPending}>
                {updateMutation.isPending ? 'Salvando...' : 'Salvar'}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Tabs for Active / Completed */}
      <Tabs value={viewTab} onValueChange={setViewTab}>
        <TabsList>
          <TabsTrigger value="active">
            Ativas ({activeMissions.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Concluídas ({completedMissions.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-4">
          {activeMissions.length > 0 ? (
            <div className="space-y-3">
              {activeMissions.map(m => (
                <Card key={m.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold">{m.title}</p>
                          <Badge variant="secondary">Em Andamento</Badge>
                        </div>
                        {m.description && (
                          <p className="text-sm text-muted-foreground mb-2">{m.description}</p>
                        )}
                        {m.objectives && m.objectives.length > 0 && (
                          <div className="text-sm mb-2">
                            <p className="text-xs text-muted-foreground mb-1">Objetivos:</p>
                            <ul className="list-disc list-inside">
                              {m.objectives.map((obj, i) => <li key={i}>{obj}</li>)}
                            </ul>
                          </div>
                        )}
                        {m.rewards && <p className="text-xs text-muted-foreground">🎁 {m.rewards}</p>}
                      </div>
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" onClick={() => openEdit(m)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="text-green-600"
                          onClick={() => completeMutation.mutate(m.id)}
                          disabled={completeMutation.isPending}
                        >
                          <Check className="h-4 w-4" />
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
                  Nenhuma missão ativa. Clique em "Nova Missão" para criar uma.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="completed" className="mt-4">
          {completedMissions.length > 0 ? (
            <div className="space-y-3">
              {completedMissions.map(m => (
                <Card key={m.id} className="opacity-70">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold line-through">{m.title}</p>
                          <Badge>Concluída</Badge>
                        </div>
                        {m.description && (
                          <p className="text-sm text-muted-foreground mb-2">{m.description}</p>
                        )}
                        {m.rewards && <p className="text-xs text-muted-foreground">🎁 {m.rewards}</p>}
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
                  Nenhuma missão concluída ainda.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
