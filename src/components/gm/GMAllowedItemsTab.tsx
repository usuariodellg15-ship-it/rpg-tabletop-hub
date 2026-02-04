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
  Loader2,
  CheckCircle,
  XCircle,
  Wand2,
} from 'lucide-react';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import { itemCatalog, type CatalogItem } from '@/data/mockItems';

type Homebrew = Database['public']['Tables']['homebrews']['Row'];
type CampaignAllowedItem = Database['public']['Tables']['campaign_allowed_items']['Row'];
type SystemType = Database['public']['Enums']['system_type'];

interface GMAllowedItemsTabProps {
  campaignId: string;
  system: SystemType;
}

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

export function GMAllowedItemsTab({ campaignId, system }: GMAllowedItemsTabProps) {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [sourceFilter, setSourceFilter] = useState<'all' | 'system' | 'homebrew'>('all');

  // Fetch allowed items for this campaign
  const { data: allowedItems = [], isLoading: loadingAllowed } = useQuery({
    queryKey: ['campaign-allowed-items', campaignId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('campaign_allowed_items')
        .select('*')
        .eq('campaign_id', campaignId);
      if (error) throw error;
      return data as CampaignAllowedItem[];
    },
  });

  // Fetch homebrew items (type = 'item') for this system
  const { data: homebrewItems = [], isLoading: loadingHomebrews } = useQuery({
    queryKey: ['homebrew-items', system],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('homebrews')
        .select('*')
        .eq('type', 'item')
        .eq('system', system)
        .eq('is_public', true)
        .order('name');
      if (error) throw error;
      return data as Homebrew[];
    },
  });

  // Enable item mutation
  const enableMutation = useMutation({
    mutationFn: async ({ itemType, itemId }: { itemType: 'system' | 'homebrew'; itemId: string }) => {
      const { error } = await supabase
        .from('campaign_allowed_items')
        .insert({
          campaign_id: campaignId,
          item_type: itemType,
          item_id: itemId,
        });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Item liberado para a campanha!');
      queryClient.invalidateQueries({ queryKey: ['campaign-allowed-items', campaignId] });
    },
    onError: (error: any) => {
      if (error.code === '23505') {
        toast.error('Este item já está liberado.');
      } else {
        toast.error('Erro ao liberar item.');
      }
    },
  });

  // Disable item mutation
  const disableMutation = useMutation({
    mutationFn: async ({ itemType, itemId }: { itemType: 'system' | 'homebrew'; itemId: string }) => {
      const { error } = await supabase
        .from('campaign_allowed_items')
        .delete()
        .eq('campaign_id', campaignId)
        .eq('item_type', itemType)
        .eq('item_id', itemId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Item removido da lista de liberados.');
      queryClient.invalidateQueries({ queryKey: ['campaign-allowed-items', campaignId] });
    },
    onError: () => {
      toast.error('Erro ao remover item.');
    },
  });

  // Create a set of allowed item keys for quick lookup
  const allowedSet = new Set(allowedItems.map(a => `${a.item_type}:${a.item_id}`));

  const isAllowed = (type: 'system' | 'homebrew', id: string) => allowedSet.has(`${type}:${id}`);

  const toggleItem = (type: 'system' | 'homebrew', id: string, currentlyEnabled: boolean) => {
    if (currentlyEnabled) {
      disableMutation.mutate({ itemType: type, itemId: id });
    } else {
      enableMutation.mutate({ itemType: type, itemId: id });
    }
  };

  // Get system items from catalog, mapping system types
  const systemItems = itemCatalog.filter(item => {
    // Map system: 'autoral' in catalog corresponds to 'olho_da_morte' enum
    if (system === 'olho_da_morte') {
      return item.system === 'autoral';
    }
    return item.system === system;
  });

  // Combine and filter all items
  const allItems: { id: string; name: string; description: string; rarity: string | null; type: 'system' | 'homebrew'; source: string }[] = [
    ...systemItems.map(item => ({
      id: item.id,
      name: item.name,
      description: item.description,
      rarity: item.rarity,
      type: 'system' as const,
      source: 'Sistema',
    })),
    ...homebrewItems.map(item => ({
      id: item.id,
      name: item.name,
      description: item.description || '',
      rarity: item.rarity,
      type: 'homebrew' as const,
      source: 'Homebrew',
    })),
  ];

  const filteredItems = allItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSource = sourceFilter === 'all' || item.type === sourceFilter;
    return matchesSearch && matchesSource;
  });

  // Separate enabled and available items
  const enabledItems = filteredItems.filter(item => isAllowed(item.type, item.id));
  const availableItems = filteredItems.filter(item => !isAllowed(item.type, item.id));

  const isLoading = loadingAllowed || loadingHomebrews;

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
          Itens Liberados
        </h3>
      </div>

      <p className="text-sm text-muted-foreground">
        Controle quais itens os jogadores podem adicionar aos seus inventários. 
        Apenas itens liberados aparecem para os jogadores.
      </p>

      {/* Search and Filter */}
      <div className="flex gap-2 flex-col sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar itens..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Tabs value={sourceFilter} onValueChange={(v) => setSourceFilter(v as typeof sourceFilter)} className="w-full sm:w-auto">
          <TabsList>
            <TabsTrigger value="all">Todos</TabsTrigger>
            <TabsTrigger value="system">Sistema</TabsTrigger>
            <TabsTrigger value="homebrew">Homebrew</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Enabled Items */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            Liberados ({enabledItems.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {enabledItems.length > 0 ? (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {enabledItems.map(item => (
                <div 
                  key={`${item.type}:${item.id}`} 
                  className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-md bg-primary/10">
                      {item.type === 'homebrew' ? <Wand2 className="h-4 w-4" /> : <Package className="h-4 w-4" />}
                    </div>
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Badge variant="outline" className="text-xs">
                          {item.source}
                        </Badge>
                        {item.rarity && (
                          <Badge className={`text-xs text-white ${getRarityColor(item.rarity)}`}>
                            {item.rarity}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <Switch
                    checked={true}
                    onCheckedChange={() => toggleItem(item.type, item.id, true)}
                    disabled={disableMutation.isPending}
                  />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              Nenhum item liberado ainda.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Available Items */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <XCircle className="h-4 w-4 text-muted-foreground" />
            Disponíveis ({availableItems.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {availableItems.length > 0 ? (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {availableItems.map(item => (
                <div 
                  key={`${item.type}:${item.id}`} 
                  className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors opacity-70"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-md bg-muted">
                      {item.type === 'homebrew' ? <Wand2 className="h-4 w-4" /> : <Package className="h-4 w-4" />}
                    </div>
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Badge variant="outline" className="text-xs">
                          {item.source}
                        </Badge>
                        {item.rarity && (
                          <Badge className={`text-xs text-white ${getRarityColor(item.rarity)}`}>
                            {item.rarity}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <Switch
                    checked={false}
                    onCheckedChange={() => toggleItem(item.type, item.id, false)}
                    disabled={enableMutation.isPending}
                  />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              {searchTerm || sourceFilter !== 'all' 
                ? 'Nenhum item encontrado com esses filtros.' 
                : 'Todos os itens já foram liberados.'}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
