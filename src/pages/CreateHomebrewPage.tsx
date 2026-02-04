import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import { ArrowLeft, Loader2, ChevronRight, ChevronLeft, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

import { HomebrewTypeSelector } from '@/components/homebrew/HomebrewTypeSelector';
import { ItemForm, type ItemFormData } from '@/components/homebrew/ItemForm';
import { CreatureForm, type CreatureFormData } from '@/components/homebrew/CreatureForm';
import { ClassForm, type ClassFormData } from '@/components/homebrew/ClassForm';
import { HomebrewPreview } from '@/components/homebrew/HomebrewPreview';

type HomebrewType = Database['public']['Enums']['homebrew_type'];

type FormData = ItemFormData | CreatureFormData | ClassFormData;

export default function CreateHomebrewPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedType, setSelectedType] = useState<HomebrewType | null>(null);
  const [formData, setFormData] = useState<FormData | null>(null);

  const handleTypeSelect = (type: HomebrewType) => {
    setSelectedType(type);
    // Initialize form data with defaults
    if (type === 'item') {
      setFormData({
        name: '',
        description: '',
        system: '5e',
        rarity: 'comum',
        weight: null,
        properties: [],
        diceFormula: '',
        tags: [],
        isPublic: false,
      } as ItemFormData);
    } else if (type === 'creature') {
      setFormData({
        name: '',
        description: '',
        system: '5e',
        nd: null,
        ac: 10,
        hp: 10,
        speed: '9m',
        attributes: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
        resistances: [],
        immunities: [],
        actions: [],
        tags: [],
        isPublic: false,
      } as CreatureFormData);
    } else if (type === 'class') {
      setFormData({
        name: '',
        description: '',
        system: 'olho_da_morte',
        baseAbilities: [],
        specializations: [{ name: '', description: '', abilities: [] }],
        isPublic: false,
      } as ClassFormData);
    } else {
      // Spell/Race - use generic item form for now
      setFormData({
        name: '',
        description: '',
        system: '5e',
        rarity: 'comum',
        weight: null,
        properties: [],
        diceFormula: '',
        tags: [],
        isPublic: false,
      } as ItemFormData);
    }
    setStep(2);
  };

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
      setSelectedType(null);
      setFormData(null);
    } else if (step === 3) {
      setStep(2);
    }
  };

  const handleNext = () => {
    if (!formData || !formData.name.trim()) {
      toast.error('O nome é obrigatório.');
      return;
    }
    setStep(3);
  };

  const handleCreate = async () => {
    if (!user) {
      toast.error('Você precisa estar logado.');
      return;
    }

    if (!formData || !selectedType) {
      toast.error('Dados incompletos.');
      return;
    }

    if (!formData.name.trim()) {
      toast.error('O nome é obrigatório.');
      return;
    }

    setIsLoading(true);

    try {
      // Build the data object based on type
      let dataPayload: Record<string, unknown> = {};

      if (selectedType === 'item') {
        const itemData = formData as ItemFormData;
        dataPayload = {
          weight: itemData.weight,
          properties: itemData.properties,
          diceFormula: itemData.diceFormula,
          tags: itemData.tags,
        };
      } else if (selectedType === 'creature') {
        const creatureData = formData as CreatureFormData;
        dataPayload = {
          nd: creatureData.nd,
          ac: creatureData.ac,
          hp: creatureData.hp,
          speed: creatureData.speed,
          attributes: creatureData.attributes,
          resistances: creatureData.resistances,
          immunities: creatureData.immunities,
          actions: creatureData.actions,
          tags: creatureData.tags,
        };
      } else if (selectedType === 'class') {
        const classData = formData as ClassFormData;
        dataPayload = {
          baseAbilities: classData.baseAbilities,
          specializations: classData.specializations.filter(s => s.name.trim()),
        };
      }

      const insertPayload: Database['public']['Tables']['homebrews']['Insert'] = {
        creator_id: user.id,
        name: formData.name.trim(),
        description: formData.description?.trim() || null,
        type: selectedType,
        system: formData.system,
        rarity: 'rarity' in formData ? (formData as ItemFormData).rarity : null,
        is_public: formData.isPublic,
        data: dataPayload as Database['public']['Tables']['homebrews']['Insert']['data'],
      };

      const { data, error } = await supabase
        .from('homebrews')
        .insert([insertPayload])
        .select()
        .single();

      if (error) throw error;

      toast.success('Homebrew criada com sucesso!');
      navigate(`/homebrews/${data.id}`);
    } catch (error: any) {
      console.error('Error creating homebrew:', error);
      if (error.message?.includes('100 characters') || error.message?.includes('5000 characters')) {
        toast.error(error.message);
      } else {
        toast.error('Erro ao criar homebrew. Tente novamente.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getStepTitle = () => {
    switch (step) {
      case 1: return 'Escolha o Tipo';
      case 2: return `Criar ${selectedType === 'item' ? 'Item' : selectedType === 'creature' ? 'Criatura' : selectedType === 'class' ? 'Classe' : selectedType === 'spell' ? 'Magia' : 'Raça'}`;
      case 3: return 'Preview & Salvar';
    }
  };

  return (
    <MainLayout>
      <div className="container py-8 max-w-3xl">
        <Link to="/homebrews">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />Voltar
          </Button>
        </Link>

        {/* Header with steps */}
        <div className="mb-6">
          <h1 className="text-3xl font-heading font-bold mb-4">Criar Homebrew</h1>
          
          {/* Step indicator */}
          <div className="flex items-center gap-2">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    s < step
                      ? 'bg-primary text-primary-foreground'
                      : s === step
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {s < step ? <Check className="h-4 w-4" /> : s}
                </div>
                {s < 3 && (
                  <div className={`w-12 h-0.5 ${s < step ? 'bg-primary' : 'bg-muted'}`} />
                )}
              </div>
            ))}
            <span className="ml-4 text-muted-foreground">{getStepTitle()}</span>
          </div>
        </div>

        {/* Step 1: Type Selection */}
        {step === 1 && (
          <HomebrewTypeSelector onSelect={handleTypeSelect} />
        )}

        {/* Step 2: Form */}
        {step === 2 && selectedType && (
          <div className="space-y-6">
            {selectedType === 'item' && formData && (
              <ItemForm
                initialData={formData as ItemFormData}
                onChange={(data) => setFormData(data)}
              />
            )}
            {selectedType === 'creature' && formData && (
              <CreatureForm
                initialData={formData as CreatureFormData}
                onChange={(data) => setFormData(data)}
              />
            )}
            {selectedType === 'class' && formData && (
              <ClassForm
                initialData={formData as ClassFormData}
                onChange={(data) => setFormData(data)}
              />
            )}
            {(selectedType === 'spell' || selectedType === 'race') && formData && (
              <ItemForm
                initialData={formData as ItemFormData}
                onChange={(data) => setFormData(data)}
              />
            )}

            <div className="flex gap-4">
              <Button variant="outline" className="flex-1" onClick={handleBack}>
                <ChevronLeft className="h-4 w-4 mr-1" />Voltar
              </Button>
              <Button className="flex-1" onClick={handleNext}>
                Preview<ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Preview */}
        {step === 3 && selectedType && formData && (
          <div className="space-y-6">
            <HomebrewPreview type={selectedType} data={formData} />

            <div className="flex gap-4">
              <Button variant="outline" className="flex-1" onClick={handleBack} disabled={isLoading}>
                <ChevronLeft className="h-4 w-4 mr-1" />Voltar
              </Button>
              <Button className="flex-1" onClick={handleCreate} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Criando...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-1" />
                    Criar Homebrew
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
