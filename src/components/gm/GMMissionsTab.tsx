import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Edit, Check, Target, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Mission } from '@/data/mockData';

interface GMMissionsTabProps {
  campaignId: string;
  missions: Mission[];
  setMissions: React.Dispatch<React.SetStateAction<Mission[]>>;
}

const STORAGE_KEY = 'mesahub_missions';

export function GMMissionsTab({ campaignId, missions, setMissions }: GMMissionsTabProps) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingMission, setEditingMission] = useState<Mission | null>(null);
  const [missionTitle, setMissionTitle] = useState('');
  const [missionDesc, setMissionDesc] = useState('');
  const [missionObjectives, setMissionObjectives] = useState('');
  const [missionRewards, setMissionRewards] = useState('');
  const [viewTab, setViewTab] = useState('active');

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const allMissions: Mission[] = JSON.parse(stored);
        const campaignMissions = allMissions.filter(m => m.campaignId === campaignId);
        if (campaignMissions.length > 0) {
          setMissions(campaignMissions);
        }
      } catch (e) {
        console.error('Failed to load missions from localStorage');
      }
    }
  }, [campaignId, setMissions]);

  // Save to localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    let allMissions: Mission[] = [];
    
    if (stored) {
      try {
        allMissions = JSON.parse(stored);
      } catch (e) {}
    }

    allMissions = allMissions.filter(m => m.campaignId !== campaignId);
    allMissions = [...allMissions, ...missions];
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allMissions));
  }, [missions, campaignId]);

  const resetForm = () => {
    setMissionTitle('');
    setMissionDesc('');
    setMissionObjectives('');
    setMissionRewards('');
  };

  const handleAdd = () => {
    if (!missionTitle.trim()) {
      toast.error('O título é obrigatório');
      return;
    }

    const newMission: Mission = {
      id: `mission-${Date.now()}`,
      campaignId,
      title: missionTitle,
      description: missionDesc,
      status: 'active',
      notes: '',
      objectives: missionObjectives.split('\n').filter(Boolean),
      rewards: missionRewards,
      createdAt: new Date().toISOString(),
    };

    setMissions(prev => [newMission, ...prev]);
    setIsAddOpen(false);
    resetForm();
    toast.success('Missão criada!');
  };

  const handleEdit = () => {
    if (!editingMission) return;

    setMissions(prev => prev.map(m => 
      m.id === editingMission.id 
        ? { 
            ...m, 
            title: missionTitle, 
            description: missionDesc,
            objectives: missionObjectives.split('\n').filter(Boolean),
            rewards: missionRewards,
          } 
        : m
    ));
    setEditingMission(null);
    resetForm();
    toast.success('Missão atualizada!');
  };

  const handleComplete = (missionId: string) => {
    setMissions(prev => prev.map(m => 
      m.id === missionId ? { ...m, status: 'completed' as const } : m
    ));
    setEditingMission(null);
    resetForm();
    toast.success('Missão concluída! 🎉');
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
              <Button onClick={handleAdd}>
                Criar Missão
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
                onClick={() => editingMission && handleComplete(editingMission.id)}
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Concluir Missão
              </Button>
            )}
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => { setEditingMission(null); resetForm(); }}>
                Cancelar
              </Button>
              <Button onClick={handleEdit}>
                Salvar
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
                          onClick={() => handleComplete(m.id)}
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
