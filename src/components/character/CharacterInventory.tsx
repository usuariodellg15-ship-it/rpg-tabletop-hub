import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Package, Plus, Minus, Trash2, Loader2, Weight } from 'lucide-react';
import { toast } from 'sonner';
import { AddAllowedItemModal, AllowedItemData } from './AddAllowedItemModal';
import { getRarityLabel, getRarityColor, ItemRarity } from '@/data/mockItems';
import type { Database } from '@/integrations/supabase/types';

type SystemType = Database['public']['Enums']['system_type'];

interface InventoryItem {
  id: string;
  character_id: string;
  name: string;
  item_id: string | null;
  homebrew_id: string | null;
  quantity: number;
  weight: number | null;
  data: Record<string, unknown> | null;
}

interface CharacterInventoryProps {
  characterId: string;
  campaignId: string;
  system: SystemType;
  maxWeight: number;
  isEditable: boolean;
  onWeightChange?: (current: number) => void;
}

export function CharacterInventory({
  characterId,
  campaignId,
  system,
  maxWeight,
  isEditable,
  onWeightChange,
}: CharacterInventoryProps) {
  const queryClient = useQueryClient();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

  // Fetch inventory items
  const { data: items = [], isLoading } = useQuery({
    queryKey: ['character-inventory', characterId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('character_inventory')
        .select('*')
        .eq('character_id', characterId)
        .order('name');
      if (error) throw error;
      return data as InventoryItem[];
    },
  });

  // Calculate current weight
  const currentWeight = items.reduce((sum, item) => {
    return sum + (item.weight || 0) * item.quantity;
  }, 0);

  const weightPercentage = maxWeight > 0 ? Math.min((currentWeight / maxWeight) * 100, 100) : 0;
  const isOverweight = currentWeight > maxWeight;

  // Add item mutation
  const addMutation = useMutation({
    mutationFn: async ({ item, quantity }: { item: AllowedItemData; quantity: number }) => {
      // Check if item already exists
      const existing = items.find(i => 
        (item.source === 'system' && i.item_id === item.id) ||
        (item.source === 'homebrew' && i.homebrew_id === item.id)
      );

      if (existing) {
        // Update quantity
        const { error } = await supabase
          .from('character_inventory')
          .update({ quantity: existing.quantity + quantity })
          .eq('id', existing.id);
        if (error) throw error;
      } else {
        // Insert new item
        const { error } = await supabase
          .from('character_inventory')
          .insert({
            character_id: characterId,
            name: item.name,
            item_id: item.source === 'system' ? item.id : null,
            homebrew_id: item.source === 'homebrew' ? item.id : null,
            quantity,
            weight: item.weight,
            data: {
              description: item.description,
              rarity: item.rarity,
              type: item.type,
              damage: item.damage,
              damageType: item.damageType,
              healDice: item.healDice,
              acBonus: item.acBonus,
              effect: item.effect,
              properties: item.properties,
            },
          });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success('Item adicionado ao inventário!');
      queryClient.invalidateQueries({ queryKey: ['character-inventory', characterId] });
    },
    onError: () => {
      toast.error('Erro ao adicionar item.');
    },
  });

  // Update quantity mutation
  const updateQuantityMutation = useMutation({
    mutationFn: async ({ itemId, quantity }: { itemId: string; quantity: number }) => {
      if (quantity <= 0) {
        const { error } = await supabase
          .from('character_inventory')
          .delete()
          .eq('id', itemId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('character_inventory')
          .update({ quantity })
          .eq('id', itemId);
        if (error) throw error;
      }
    },
    onSuccess: (_, { quantity }) => {
      if (quantity <= 0) {
        toast.success('Item removido do inventário.');
        setSelectedItem(null);
      }
      queryClient.invalidateQueries({ queryKey: ['character-inventory', characterId] });
    },
    onError: () => {
      toast.error('Erro ao atualizar item.');
    },
  });

  const handleAddItem = useCallback((item: AllowedItemData, quantity: number) => {
    addMutation.mutate({ item, quantity });
  }, [addMutation]);

  const handleQuantityChange = useCallback((delta: number) => {
    if (!selectedItem) return;
    const newQty = selectedItem.quantity + delta;
    updateQuantityMutation.mutate({ itemId: selectedItem.id, quantity: newQty });
    if (newQty > 0) {
      setSelectedItem({ ...selectedItem, quantity: newQty });
    }
  }, [selectedItem, updateQuantityMutation]);

  const getItemRarity = (item: InventoryItem): ItemRarity | null => {
    return (item.data?.rarity as ItemRarity) || null;
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Inventário
          </CardTitle>
          {isEditable && (
            <Button size="sm" onClick={() => setIsAddOpen(true)}>
              <Plus className="h-4 w-4 mr-1" />
              Adicionar
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Weight Section */}
          <div className="p-3 bg-muted rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Weight className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Peso</span>
              </div>
              <span className={`text-sm font-medium ${isOverweight ? 'text-destructive' : ''}`}>
                {currentWeight.toFixed(1)} / {maxWeight} kg
              </span>
            </div>
            <Progress 
              value={weightPercentage} 
              className={`h-2 ${isOverweight ? '[&>div]:bg-destructive' : ''}`}
            />
            {isOverweight && (
              <p className="text-xs text-destructive mt-1">Sobrecarga!</p>
            )}
          </div>

          {/* Items List */}
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : items.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Inventário vazio.
            </p>
          ) : (
            <div className="space-y-2">
              {items.map(item => {
                const rarity = getItemRarity(item);
                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => setSelectedItem(item)}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{item.name}</span>
                        {rarity && (
                          <span className={`text-xs ${getRarityColor(rarity)}`}>
                            {getRarityLabel(rarity)}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {item.weight || 0}kg × {item.quantity} = {((item.weight || 0) * item.quantity).toFixed(1)}kg
                      </p>
                    </div>
                    <Badge variant="secondary">×{item.quantity}</Badge>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Item Modal */}
      <AddAllowedItemModal
        open={isAddOpen}
        onOpenChange={setIsAddOpen}
        campaignId={campaignId}
        system={system}
        onAdd={handleAddItem}
      />

      {/* Item Details Modal */}
      <Dialog open={!!selectedItem} onOpenChange={open => !open && setSelectedItem(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedItem?.name}</DialogTitle>
          </DialogHeader>
          
          {selectedItem && (
            <div className="space-y-4">
              {selectedItem.data?.description && (
                <p className="text-muted-foreground">
                  {selectedItem.data.description as string}
                </p>
              )}
              
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Peso:</span> {selectedItem.weight || 0}kg
                </div>
                <div>
                  <span className="text-muted-foreground">Quantidade:</span> {selectedItem.quantity}
                </div>
                {selectedItem.data?.damage && (
                  <div>
                    <span className="text-muted-foreground">Dano:</span> {selectedItem.data.damage as string}
                  </div>
                )}
                {selectedItem.data?.acBonus && (
                  <div>
                    <span className="text-muted-foreground">CA:</span> +{selectedItem.data.acBonus as number}
                  </div>
                )}
              </div>

              {isEditable && (
                <div className="flex items-center justify-center gap-4 py-2">
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={() => handleQuantityChange(-1)}
                    disabled={updateQuantityMutation.isPending}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="text-2xl font-bold w-12 text-center">
                    {selectedItem.quantity}
                  </span>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={() => handleQuantityChange(1)}
                    disabled={updateQuantityMutation.isPending}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            {isEditable && selectedItem && (
              <Button
                variant="destructive"
                onClick={() => updateQuantityMutation.mutate({ itemId: selectedItem.id, quantity: 0 })}
                disabled={updateQuantityMutation.isPending}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Remover
              </Button>
            )}
            <Button variant="outline" onClick={() => setSelectedItem(null)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
