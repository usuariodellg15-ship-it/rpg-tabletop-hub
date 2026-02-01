import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dice6, Shield, Wand2, Users, Scroll, Check, Sparkles } from 'lucide-react';

export default function HomePage() {
  const features = [
    {
      icon: <Users className="h-8 w-8" />,
      title: 'Campanhas Multi-Sistema',
      description: 'Suporte para D&D 5e (SRD), Sistema Olho da Morte e Horror Cósmico. Crie e gerencie mesas de RPG com facilidade.',
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: 'Escudo do Mestre',
      description: 'Rastreador de iniciativa, log de rolagens, timeline de eventos e ferramentas completas para mestres.',
    },
    {
      icon: <Wand2 className="h-8 w-8" />,
      title: 'Homebrews',
      description: 'Crie itens, criaturas e magias personalizadas. Compartilhe com a comunidade ou mantenha privado.',
    },
    {
      icon: <Scroll className="h-8 w-8" />,
      title: 'Fichas Digitais',
      description: 'Fichas de personagem completas com inventário, habilidades, atributos e notas. Tudo sincronizado em tempo real.',
    },
  ];

  const plans = [
    {
      name: 'Free',
      price: 'R$ 0',
      description: 'Para jogadores casuais',
      features: [
        'Até 2 campanhas ativas',
        'Até 3 personagens por campanha',
        'Acesso ao Escudo do Mestre básico',
        'Criação de homebrews (até 5)',
        'Log de rolagens',
      ],
      cta: 'Começar Grátis',
      highlighted: false,
    },
    {
      name: 'Premium',
      price: 'R$ 19,90/mês',
      description: 'Para mestres dedicados',
      features: [
        'Campanhas ilimitadas',
        'Personagens ilimitados',
        'Escudo do Mestre completo',
        'Homebrews ilimitados',
        'Estatísticas avançadas de combate',
        'Timeline de campanha',
        'Prioridade no suporte',
        'Sem anúncios',
      ],
      cta: 'Assinar Premium',
      highlighted: true,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Dice6 className="h-5 w-5" />
            </div>
            <span className="text-xl font-heading font-bold">DiceHub</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/login">
              <Button variant="ghost">Entrar</Button>
            </Link>
            <Link to="/login?signup=true">
              <Button>Criar Conta</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 md:py-32">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
        <div className="container relative">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="secondary" className="mb-4">
              <Sparkles className="mr-1 h-3 w-3" />
              Plataforma de RPG Online
            </Badge>
            <h1 className="mb-6 text-4xl font-heading font-bold tracking-tight md:text-6xl">
              Centralize sua mesa.
              <br />
              <span className="text-primary">Jogue melhor.</span>
            </h1>
            <p className="mb-8 text-lg text-muted-foreground md:text-xl">
              DiceHub é a plataforma completa para mestres e jogadores de RPG. 
              Gerencie campanhas, crie personagens, role dados e viva aventuras épicas.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Link to="/login">
                <Button size="lg" className="w-full sm:w-auto gap-2">
                  <Dice6 className="h-5 w-5" />
                  Entrar / Login
                </Button>
              </Link>
              <Link to="/login?signup=true">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  Criar Conta Grátis
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/50">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center mb-12">
            <h2 className="text-3xl font-heading font-bold mb-4">Como Funciona</h2>
            <p className="text-muted-foreground">
              Tudo que você precisa para suas sessões de RPG em um só lugar.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <Card key={index} className="relative overflow-hidden">
                <CardHeader>
                  <div className="mb-2 text-primary">{feature.icon}</div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center mb-12">
            <h2 className="text-3xl font-heading font-bold mb-4">Planos</h2>
            <p className="text-muted-foreground">
              Escolha o plano ideal para sua jornada.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 max-w-4xl mx-auto">
            {plans.map((plan, index) => (
              <Card 
                key={index} 
                className={`relative ${plan.highlighted ? 'border-primary shadow-lg' : ''}`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary">Mais Popular</Badge>
                  </div>
                )}
                <CardHeader className="text-center pb-2">
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">{plan.price}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-primary shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link to="/login?signup=true">
                    <Button 
                      className="w-full" 
                      variant={plan.highlighted ? 'default' : 'outline'}
                    >
                      {plan.cta}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container text-center">
          <h2 className="text-3xl font-heading font-bold mb-4">
            Pronto para começar sua aventura?
          </h2>
          <p className="mb-8 text-primary-foreground/80 max-w-xl mx-auto">
            Junte-se a milhares de jogadores e mestres que já usam o DiceHub para suas campanhas.
          </p>
          <Link to="/login?signup=true">
            <Button size="lg" variant="secondary">
              Criar Conta Grátis
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="container">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Dice6 className="h-5 w-5 text-primary" />
              <span className="font-heading font-bold">DiceHub</span>
            </div>
            <div className="flex gap-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">Termos de Uso</a>
              <a href="#" className="hover:text-foreground transition-colors">Privacidade</a>
              <a href="#" className="hover:text-foreground transition-colors">Contato</a>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 DiceHub. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
