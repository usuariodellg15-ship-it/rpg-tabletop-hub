import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { 
  Search, 
  Package, 
  Skull, 
  Wand2, 
  BookOpen,
  Loader2,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type Homebrew = Database['public']['Tables']['homebrews']['Row'];
type CampaignHomebrew = Database['public']['Tables']['campaign_homebrews']['Row'];
type SystemType = Database['public']['Enums']['system_type'];

interface GMHomebrewTabProps {
  campaignId: string;
  system: SystemType;
}

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'item': return <Package className="h-4 w-4" />;
    case 'creature': return <Skull className="h-4 w-4" />;
    case 'spell': return <Wand2 className="h-4 w-4" />;
    case 'class': return <BookOpen className="h-4 w-4" />;
    default: return <Package className="h-4 w-4" />;
  }
};

const getTypeName = (type: string) => {
  switch (type) {
    case 'item': return 'Item';
    case 'creature': return 'Criatura';
    case 'spell': return 'Magia';
    case 'class': return 'Classe';
    default: return type;
  }
};

const getRarityColor = (rarity: string | null) => {
  switch (rarity) {
    case 'comum': return 'bg-gray-500';
    case 'incomum': return 'bg-green-500';
    case 'raro': return 'bg-blue-500';
    case 'muito_raro': return 'bg-purple-500';
    case 'lendario': return 'bg-orange-500';
    case 'artefato': return 'bg-red-500';
    default: return 'bg-gray-500';
  }
};

export function GMHomebrewTab({ campaignId, system }: GMHomebrewTabProps) {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  // Fetch all available homebrews for this system
  const { data: allHomebrews = [], isLoading: loadingHomebrews } = useQuery({
    queryKey: ['homebrews', system],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('homebrews')
        .select('*')
        .eq('system', system)
        .eq('is_public', true)
        .order('name');
      if (error) throw error;
      return data as Homebrew[];
    },
  });

  // Fetch enabled homebrews for this campaign
  const { data: enabledHomebrews = [], isLoading: loadingEnabled } = useQuery({
    queryKey: ['campaign-homebrews', campaignId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('campaign_homebrews')
        .select('*')
        .eq('campaign_id', campaignId);
      if (error) throw error;
      return data as CampaignHomebrew[];
    },
  });

  // Enable homebrew mutation
  const enableMutation = useMutation({
    mutationFn: async (homebrewId: string) => {
      const { error } = await supabase
        .from('campaign_homebrews')
        .insert({
          campaign_id: campaignId,
          homebrew_id: homebrewId,
        });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Homebrew habilitado para esta campanha!');
      queryClient.invalidateQueries({ queryKey: ['campaign-homebrews', campaignId] });
    },
    onError: (error: any) => {
      console.error(error);
      toast.error('Erro ao habilitar homebrew.');
    },
  });

  // Disable homebrew mutation
  const disableMutation = useMutation({
    mutationFn: async (homebrewId: string) => {
      const { error } = await supabase
        .from('campaign_homebrews')
        .delete()
        .eq('campaign_id', campaignId)
        .eq('homebrew_id', homebrewId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Homebrew desabilitado para esta campanha.');
      queryClient.invalidateQueries({ queryKey: ['campaign-homebrews', campaignId] });
    },
    onError: () => {
      toast.error('Erro ao desabilitar homebrew.');
    },
  });

  const enabledIds = new Set(enabledHomebrews.map(h => h.homebrew_id));

  const toggleHomebrew = (homebrewId: string, currentlyEnabled: boolean) => {
    if (currentlyEnabled) {
      disableMutation.mutate(homebrewId);
    } else {
      enableMutation.mutate(homebrewId);
    }
  };

  // Filter homebrews
  const filteredHomebrews = allHomebrews.filter(h => {
    const matchesSearch = h.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (h.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || h.type === typeFilter;
    return matchesSearch && matchesType;
  });

  // Separate enabled and available
  const enabledList = filteredHomebrews.filter(h => enabledIds.has(h.id));
  const availableList = filteredHomebrews.filter(h => !enabledIds.has(h.id));

  const isLoading = loadingHomebrews || loadingEnabled;

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
          <Package className="h-5 w-5" />
          Homebrews da Campanha
        </h3>
      </div>

      <p className="text-sm text-muted-foreground">
        Habilite conteúdos homebrew para disponibilizá-los aos jogadores desta campanha.
      </p>

      {/* Search and Filter */}
      <div className="flex gap-2 flex-col sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar homebrews..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Tabs value={typeFilter} onValueChange={setTypeFilter} className="w-full sm:w-auto">
          <TabsList>
            <TabsTrigger value="all">Todos</TabsTrigger>
            <TabsTrigger value="item">Itens</TabsTrigger>
            <TabsTrigger value="creature">Criaturas</TabsTrigger>
            <TabsTrigger value="class">Classes</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Enabled Homebrews */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            Habilitados ({enabledList.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {enabledList.length > 0 ? (
            <div className="space-y-2">
              {enabledList.map(homebrew => (
                <div 
                  key={homebrew.id} 
                  className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-md bg-primary/10">
                      {getTypeIcon(homebrew.type)}
                    </div>
                    <div>
                      <p className="font-medium">{homebrew.name}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Badge variant="outline" className="text-xs">
                          {getTypeName(homebrew.type)}
                        </Badge>
                        {homebrew.rarity && (
                          <Badge className={`text-xs text-white ${getRarityColor(homebrew.rarity)}`}>
                            {homebrew.rarity}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <Switch
                    checked={true}
                    onCheckedChange={() => toggleHomebrew(homebrew.id, true)}
                    disabled={disableMutation.isPending}
                  />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              Nenhum homebrew habilitado ainda.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Available Homebrews */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <XCircle className="h-4 w-4 text-muted-foreground" />
            Disponíveis ({availableList.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {availableList.length > 0 ? (
            <div className="space-y-2">
              {availableList.map(homebrew => (
                <div 
                  key={homebrew.id} 
                  className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors opacity-70"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-md bg-muted">
                      {getTypeIcon(homebrew.type)}
                    </div>
                    <div>
                      <p className="font-medium">{homebrew.name}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Badge variant="outline" className="text-xs">
                          {getTypeName(homebrew.type)}
                        </Badge>
                        {homebrew.rarity && (
                          <Badge className={`text-xs text-white ${getRarityColor(homebrew.rarity)}`}>
                            {homebrew.rarity}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <Switch
                    checked={false}
                    onCheckedChange={() => toggleHomebrew(homebrew.id, false)}
                    disabled={enableMutation.isPending}
                  />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              {searchTerm || typeFilter !== 'all' 
                ? 'Nenhum homebrew encontrado com esses filtros.' 
                : 'Nenhum homebrew disponível para este sistema.'}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
