import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Package, Plus, Minus, Dices, Search, Filter, Weight } from 'lucide-react';
import { toast } from 'sonner';
import { SystemType } from '@/data/mockData';
import { itemCatalog, CatalogItem, getRarityLabel, getRarityColor, getItemTypeLabel, ItemRarity, ItemType } from '@/data/mockItems';

export interface InventoryItem {
  id: string;
  catalogId?: string;
  name: string;
  description: string;
  quantity: number;
  weight: number;
  type?: ItemType;
  rarity?: ItemRarity;
  damage?: string;
  damageType?: string;
  healDice?: string;
  acBonus?: number;
  effect?: string;
  properties?: string[];
}

interface InventorySectionProps {
  items: InventoryItem[];
  maxWeight: number;
  currentWeight: number;
  system: SystemType;
  isEditable: boolean;
  onItemsChange?: (items: InventoryItem[]) => void;
  onWeightChange?: (max: number, current: number) => void;
  onRoll?: (itemName: string, formula: string, result: number) => void;
  title?: string;
  emptyMessage?: string;
}

export default function InventorySection({
  items,
  maxWeight,
  currentWeight,
  system,
  isEditable,
  onItemsChange,
  onWeightChange,
  onRoll,
  title = 'Inventário',
  emptyMessage = 'Inventário vazio'
}: InventorySectionProps) {
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [rarityFilter, setRarityFilter] = useState<string>('all');
  const [addQuantity, setAddQuantity] = useState(1);
  const [selectedCatalogItem, setSelectedCatalogItem] = useState<CatalogItem | null>(null);
  
  const [editMaxWeight, setEditMaxWeight] = useState(maxWeight);
  const [editCurrentWeight, setEditCurrentWeight] = useState(currentWeight);

  const weightPercentage = maxWeight > 0 ? Math.min((currentWeight / maxWeight) * 100, 100) : 0;
  const isOverweight = currentWeight > maxWeight;

  const filteredCatalog = itemCatalog.filter(item => {
    if (item.system !== system) return false;
    if (searchQuery && !item.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (typeFilter !== 'all' && item.type !== typeFilter) return false;
    if (rarityFilter !== 'all' && item.rarity !== rarityFilter) return false;
    return true;
  });

  const handleQuantityChange = useCallback((delta: number) => {
    if (!selectedItem || !onItemsChange) return;
    const newQty = Math.max(0, selectedItem.quantity + delta);
    
    if (newQty === 0) {
      onItemsChange(items.filter(i => i.id !== selectedItem.id));
      setSelectedItem(null);
      toast.success('Item removido do inventário');
    } else {
      const updatedItems = items.map(i => 
        i.id === selectedItem.id ? { ...i, quantity: newQty } : i
      );
      onItemsChange(updatedItems);
      setSelectedItem({ ...selectedItem, quantity: newQty });
    }
  }, [selectedItem, items, onItemsChange]);

  const handleRollItem = useCallback(() => {
    if (!selectedItem || !onRoll) return;
    
    const diceFormula = selectedItem.damage || selectedItem.healDice;
    if (!diceFormula) return;

    // Parse dice formula like "2d6" or "1d8+3"
    const match = diceFormula.match(/(\d+)d(\d+)(?:\+(\d+))?/);
    if (!match) return;

    const numDice = parseInt(match[1]);
    const dieSize = parseInt(match[2]);
    const bonus = match[3] ? parseInt(match[3]) : 0;

    let total = bonus;
    const rolls: number[] = [];
    for (let i = 0; i < numDice; i++) {
      const roll = Math.floor(Math.random() * dieSize) + 1;
      rolls.push(roll);
      total += roll;
    }

    const rollDetails = `${rolls.join('+')}${bonus ? `+${bonus}` : ''} = ${total}`;
    toast.success(`🎲 ${selectedItem.name}: ${diceFormula} → ${rollDetails}`);
    onRoll(selectedItem.name, diceFormula, total);
  }, [selectedItem, onRoll]);

  const handleAddItem = useCallback(() => {
    if (!selectedCatalogItem || !onItemsChange) return;

    const newItem: InventoryItem = {
      id: `inv-${Date.now()}`,
      catalogId: selectedCatalogItem.id,
      name: selectedCatalogItem.name,
      description: selectedCatalogItem.description,
      quantity: addQuantity,
      weight: selectedCatalogItem.weight,
      type: selectedCatalogItem.type,
      rarity: selectedCatalogItem.rarity,
      damage: selectedCatalogItem.damage,
      damageType: selectedCatalogItem.damageType,
      healDice: selectedCatalogItem.healDice,
      acBonus: selectedCatalogItem.acBonus,
      effect: selectedCatalogItem.effect,
      properties: selectedCatalogItem.properties,
    };

    // Check if item already exists
    const existingIndex = items.findIndex(i => i.catalogId === selectedCatalogItem.id);
    if (existingIndex >= 0) {
      const updatedItems = [...items];
      updatedItems[existingIndex].quantity += addQuantity;
      onItemsChange(updatedItems);
    } else {
      onItemsChange([...items, newItem]);
    }

    toast.success(`${selectedCatalogItem.name} x${addQuantity} adicionado ao inventário`);
    setIsAddModalOpen(false);
    setSelectedCatalogItem(null);
    setAddQuantity(1);
    setSearchQuery('');
  }, [selectedCatalogItem, addQuantity, items, onItemsChange]);

  const handleWeightSave = useCallback(() => {
    if (onWeightChange) {
      onWeightChange(editMaxWeight, editCurrentWeight);
    }
  }, [editMaxWeight, editCurrentWeight, onWeightChange]);

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            {title}
          </CardTitle>
          {isEditable && (
            <Button size="sm" onClick={() => setIsAddModalOpen(true)}>
              <Plus className="h-4 w-4 mr-1" />Adicionar Item
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Weight Section */}
          <div className="p-4 bg-muted rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Weight className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Peso</span>
              </div>
              <div className="flex items-center gap-2">
                {isEditable ? (
                  <>
                    <Input
                      type="number"
                      className="w-16 h-7 text-center text-sm"
                      value={editCurrentWeight}
                      onChange={e => setEditCurrentWeight(parseFloat(e.target.value) || 0)}
                      onBlur={handleWeightSave}
                    />
                    <span className="text-sm">/</span>
                    <Input
                      type="number"
                      className="w-16 h-7 text-center text-sm"
                      value={editMaxWeight}
                      onChange={e => setEditMaxWeight(parseFloat(e.target.value) || 0)}
                      onBlur={handleWeightSave}
                    />
                    <span className="text-sm">kg</span>
                  </>
                ) : (
                  <span className={`text-sm font-medium ${isOverweight ? 'text-destructive' : ''}`}>
                    {currentWeight.toFixed(1)} / {maxWeight} kg
                  </span>
                )}
              </div>
            </div>
            <Progress 
              value={weightPercentage} 
              className={`h-2 ${isOverweight ? '[&>div]:bg-destructive' : ''}`}
            />
            {isOverweight && (
              <p className="text-xs text-destructive mt-1">Sobrecarga! Movimento reduzido.</p>
            )}
          </div>

          {/* Items List */}
          {items.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">{emptyMessage}</p>
          ) : (
            <div className="grid gap-2">
              {items.map(item => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => setSelectedItem(item)}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{item.name}</span>
                      {item.rarity && (
                        <span className={`text-xs ${getRarityColor(item.rarity)}`}>
                          {getRarityLabel(item.rarity)}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {item.weight}kg × {item.quantity} = {(item.weight * item.quantity).toFixed(1)}kg
                    </p>
                  </div>
                  <Badge variant="secondary">×{item.quantity}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Item Details Modal */}
      <Dialog open={!!selectedItem} onOpenChange={(open) => !open && setSelectedItem(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedItem?.name}
              {selectedItem?.rarity && (
                <span className={`text-sm ${getRarityColor(selectedItem.rarity)}`}>
                  ({getRarityLabel(selectedItem.rarity)})
                </span>
              )}
            </DialogTitle>
          </DialogHeader>
          
          {selectedItem && (
            <div className="space-y-4">
              <p className="text-muted-foreground">{selectedItem.description}</p>
              
              {/* Item Stats */}
              <div className="grid grid-cols-2 gap-2 text-sm">
                {selectedItem.type && (
                  <div><span className="text-muted-foreground">Tipo:</span> {getItemTypeLabel(selectedItem.type)}</div>
                )}
                <div><span className="text-muted-foreground">Peso:</span> {selectedItem.weight}kg</div>
                {selectedItem.damage && (
                  <div><span className="text-muted-foreground">Dano:</span> {selectedItem.damage}</div>
                )}
                {selectedItem.damageType && (
                  <div><span className="text-muted-foreground">Tipo de Dano:</span> {selectedItem.damageType}</div>
                )}
                {selectedItem.healDice && (
                  <div><span className="text-muted-foreground">Cura:</span> {selectedItem.healDice}</div>
                )}
                {selectedItem.acBonus && (
                  <div><span className="text-muted-foreground">CA:</span> +{selectedItem.acBonus}</div>
                )}
                {selectedItem.effect && (
                  <div className="col-span-2"><span className="text-muted-foreground">Efeito:</span> {selectedItem.effect}</div>
                )}
              </div>

              {selectedItem.properties && selectedItem.properties.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {selectedItem.properties.map(prop => (
                    <Badge key={prop} variant="outline" className="text-xs">{prop}</Badge>
                  ))}
                </div>
              )}

              {/* Quantity Controls */}
              {isEditable && (
                <div className="flex items-center justify-center gap-4 py-2">
                  <Button variant="outline" size="icon" onClick={() => handleQuantityChange(-1)}>
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="text-2xl font-bold w-12 text-center">{selectedItem.quantity}</span>
                  <Button variant="outline" size="icon" onClick={() => handleQuantityChange(1)}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              )}

              {/* Roll Button */}
              {(selectedItem.damage || selectedItem.healDice) && onRoll && (
                <Button className="w-full" onClick={handleRollItem}>
                  <Dices className="h-4 w-4 mr-2" />
                  Rolar {selectedItem.damage || selectedItem.healDice}
                </Button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Item Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Adicionar Item ao Inventário</DialogTitle>
          </DialogHeader>
          
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
              <div className="flex gap-2">
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="flex-1">
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
                <Select value={rarityFilter} onValueChange={setRarityFilter}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Raridade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas raridades</SelectItem>
                    <SelectItem value="common">Comum</SelectItem>
                    <SelectItem value="uncommon">Incomum</SelectItem>
                    <SelectItem value="rare">Raro</SelectItem>
                    <SelectItem value="very_rare">Muito Raro</SelectItem>
                    <SelectItem value="legendary">Lendário</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Item List */}
            <div className="flex-1 overflow-y-auto space-y-2 min-h-0">
              {filteredCatalog.map(item => (
                <div
                  key={item.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedCatalogItem?.id === item.id 
                      ? 'border-primary bg-primary/5' 
                      : 'hover:bg-muted/50'
                  }`}
                  onClick={() => setSelectedCatalogItem(item)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-medium">{item.name}</span>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{getItemTypeLabel(item.type)}</span>
                        <span>•</span>
                        <span className={getRarityColor(item.rarity)}>{getRarityLabel(item.rarity)}</span>
                        <span>•</span>
                        <span>{item.weight}kg</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {filteredCatalog.length === 0 && (
                <p className="text-center text-muted-foreground py-8">Nenhum item encontrado</p>
              )}
            </div>

            {/* Quantity Selection */}
            {selectedCatalogItem && (
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div>
                  <p className="font-medium">{selectedCatalogItem.name}</p>
                  <p className="text-xs text-muted-foreground">{selectedCatalogItem.weight}kg cada</p>
                </div>
                <div className="flex items-center gap-2">
                  <Label className="text-sm">Qtd:</Label>
                  <Input
                    type="number"
                    className="w-16 h-8 text-center"
                    min={1}
                    value={addQuantity}
                    onChange={e => setAddQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  />
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleAddItem} disabled={!selectedCatalogItem}>
              Adicionar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
