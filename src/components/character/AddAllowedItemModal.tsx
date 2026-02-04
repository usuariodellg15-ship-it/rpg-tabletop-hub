import { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, Package, Wand2, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { itemCatalog, getRarityLabel, getRarityColor, getItemTypeLabel, type CatalogItem, type ItemRarity, type ItemType } from '@/data/mockItems';
import type { Database } from '@/integrations/supabase/types';

type CampaignAllowedItem = Database['public']['Tables']['campaign_allowed_items']['Row'];
type Homebrew = Database['public']['Tables']['homebrews']['Row'];
type SystemType = Database['public']['Enums']['system_type'];

export interface AllowedItemData {
  id: string;
  name: string;
  description: string;
  weight: number;
  rarity?: string;
  type?: ItemType;
  source: 'system' | 'homebrew';
  // Item-specific fields
  damage?: string;
  damageType?: string;
  healDice?: string;
  acBonus?: number;
  effect?: string;
  properties?: string[];
}

interface AddAllowedItemModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaignId: string;
  system: SystemType;
  onAdd: (item: AllowedItemData, quantity: number) => void;
}

export function AddAllowedItemModal({
  open,
  onOpenChange,
  campaignId,
  system,
  onAdd,
}: AddAllowedItemModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [selectedItem, setSelectedItem] = useState<AllowedItemData | null>(null);
  const [quantity, setQuantity] = useState(1);

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
    enabled: open,
  });

  // Fetch homebrew items for the allowed list
  const homebrewIds = allowedItems
    .filter(a => a.item_type === 'homebrew')
    .map(a => a.item_id);

  const { data: homebrewItems = [], isLoading: loadingHomebrews } = useQuery({
    queryKey: ['homebrew-items-by-ids', homebrewIds],
    queryFn: async () => {
      if (homebrewIds.length === 0) return [];
      const { data, error } = await supabase
        .from('homebrews')
        .select('*')
        .in('id', homebrewIds);
      if (error) throw error;
      return data as Homebrew[];
    },
    enabled: open && homebrewIds.length > 0,
  });

  // Build the list of available items
  const availableItems = useMemo(() => {
    const items: AllowedItemData[] = [];
    const allowedSet = new Set(allowedItems.map(a => `${a.item_type}:${a.item_id}`));

    // System items that are allowed
    const systemItemIds = allowedItems
      .filter(a => a.item_type === 'system')
      .map(a => a.item_id);

    // Map system type for catalog filtering
    const catalogSystem = system === 'olho_da_morte' ? 'autoral' : system;

    itemCatalog
      .filter(item => item.system === catalogSystem && systemItemIds.includes(item.id))
      .forEach(item => {
        items.push({
          id: item.id,
          name: item.name,
          description: item.description,
          weight: item.weight,
          rarity: item.rarity,
          type: item.type,
          source: 'system',
          damage: item.damage,
          damageType: item.damageType,
          healDice: item.healDice,
          acBonus: item.acBonus,
          effect: item.effect,
          properties: item.properties,
        });
      });

    // Homebrew items that are allowed
    homebrewItems.forEach(hb => {
      const hbData = hb.data as Record<string, unknown> | null;
      items.push({
        id: hb.id,
        name: hb.name,
        description: hb.description || '',
        weight: (hbData?.weight as number) ?? 0,
        rarity: hb.rarity || undefined,
        source: 'homebrew',
        damage: hbData?.diceFormula as string | undefined,
        properties: (hbData?.properties as string[]) || [],
      });
    });

    return items;
  }, [allowedItems, homebrewItems, system]);

  // Filter items
  const filteredItems = useMemo(() => {
    return availableItems.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = typeFilter === 'all' || item.type === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [availableItems, searchQuery, typeFilter]);

  const handleAdd = () => {
    if (!selectedItem) return;
    onAdd(selectedItem, quantity);
    setSelectedItem(null);
    setQuantity(1);
    setSearchQuery('');
    onOpenChange(false);
  };

  const isLoading = loadingAllowed || loadingHomebrews;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Adicionar Item ao Inventário</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : availableItems.length === 0 ? (
          <div className="text-center py-8">
            <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              Nenhum item foi liberado pelo Mestre para esta campanha.
            </p>
          </div>
        ) : (
          <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
            {/* Search and Filters */}
            <div className="space-y-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar item..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os tipos</SelectItem>
                  <SelectItem value="weapon">Arma</SelectItem>
                  <SelectItem value="armor">Armadura</SelectItem>
                  <SelectItem value="consumable">Consumível</SelectItem>
                  <SelectItem value="scroll">Pergaminho</SelectItem>
                  <SelectItem value="misc">Item Geral</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Item List */}
            <div className="flex-1 overflow-y-auto space-y-2 min-h-0">
              {filteredItems.map(item => (
                <div
                  key={`${item.source}:${item.id}`}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedItem?.id === item.id && selectedItem?.source === item.source
                      ? 'border-primary bg-primary/5'
                      : 'hover:bg-muted/50'
                  }`}
                  onClick={() => setSelectedItem(item)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {item.source === 'homebrew' ? (
                        <Wand2 className="h-4 w-4 text-primary" />
                      ) : (
                        <Package className="h-4 w-4 text-muted-foreground" />
                      )}
                      <div>
                        <span className="font-medium">{item.name}</span>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          {item.type && <span>{getItemTypeLabel(item.type)}</span>}
                          {item.rarity && (
                            <>
                              <span>•</span>
                              <span className={getRarityColor(item.rarity as ItemRarity)}>
                                {getRarityLabel(item.rarity as ItemRarity)}
                              </span>
                            </>
                          )}
                          <span>•</span>
                          <span>{item.weight}kg</span>
                        </div>
                      </div>
                    </div>
                    <Badge variant={item.source === 'homebrew' ? 'secondary' : 'outline'} className="text-xs">
                      {item.source === 'homebrew' ? 'Homebrew' : 'Sistema'}
                    </Badge>
                  </div>
                </div>
              ))}
              {filteredItems.length === 0 && (
                <p className="text-center text-muted-foreground py-8">Nenhum item encontrado</p>
              )}
            </div>

            {/* Quantity Selection */}
            {selectedItem && (
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div>
                  <p className="font-medium">{selectedItem.name}</p>
                  <p className="text-xs text-muted-foreground">{selectedItem.weight}kg cada</p>
                </div>
                <div className="flex items-center gap-2">
                  <Label className="text-sm">Qtd:</Label>
                  <Input
                    type="number"
                    className="w-16 h-8 text-center"
                    min={1}
                    value={quantity}
                    onChange={e => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleAdd} disabled={!selectedItem || isLoading}>
            Adicionar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
