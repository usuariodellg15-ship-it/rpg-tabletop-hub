import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { 
  Dice6, 
  Shield, 
  Wand2, 
  Users, 
  Scroll, 
  Check, 
  Sparkles, 
  Swords,
  Eye,
  Skull,
  BookOpen,
  ArrowRight,
  Gamepad2,
  Zap,
  Globe,
  Package,
} from 'lucide-react';

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function HomePage() {
  const features = [
    {
      icon: <Users className="h-8 w-8" />,
      title: 'Campanhas Multi-Sistema',
      description: 'Suporte completo para D&D 5e (SRD), Sistema Olho da Morte e Horror Cósmico. Crie mesas de RPG com facilidade.',
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: 'Escudo do Mestre',
      description: 'Rastreador de iniciativa, log de rolagens, timeline de eventos e ferramentas completas para mestres.',
    },
    {
      icon: <Wand2 className="h-8 w-8" />,
      title: 'Homebrews',
      description: 'Crie itens, criaturas e classes personalizadas. Ative por campanha para controle total.',
    },
    {
      icon: <Scroll className="h-8 w-8" />,
      title: 'Fichas Digitais',
      description: 'Fichas com inventário, habilidades e atributos. Rolagens direto na ficha com bônus automáticos.',
    },
  ];

  const steps = [
    {
      number: '1',
      title: 'Crie uma Conta',
      description: 'Registre-se gratuitamente em segundos e acesse a plataforma.',
    },
    {
      number: '2',
      title: 'Crie ou Entre em uma Campanha',
      description: 'Seja mestre ou jogador. Use código de convite ou busque campanhas públicas.',
    },
    {
      number: '3',
      title: 'Monte sua Ficha',
      description: 'Crie seu personagem com atributos, perícias e inventário completo.',
    },
    {
      number: '4',
      title: 'Role os Dados!',
      description: 'Faça rolagens, gerencie combate e viva aventuras épicas com seu grupo.',
    },
  ];

  const systems = [
    {
      id: '5e',
      name: 'D&D 5e (SRD)',
      icon: <Swords className="h-12 w-12" />,
      description: 'O sistema de fantasia mais popular do mundo. Dragões, masmorras e heróis épicos.',
      gradient: 'from-red-500/20 to-orange-500/20',
      borderColor: 'border-red-500/30',
      iconColor: 'text-red-500',
      features: ['6 atributos clássicos', '18 perícias', 'Classes com especialização', 'Sistema de Classe de Armadura'],
    },
    {
      id: 'olho_da_morte',
      name: 'Sistema Olho da Morte',
      icon: <Eye className="h-12 w-12" />,
      description: 'Sistema autoral brasileiro focado em narrativa e combates táticos dinâmicos.',
      gradient: 'from-purple-500/20 to-indigo-500/20',
      borderColor: 'border-purple-500/30',
      iconColor: 'text-purple-500',
      features: ['Atributos customizados', 'Perícias específicas', 'Classes e especializações', 'Mecânicas únicas'],
    },
    {
      id: 'horror',
      name: 'Horror Cósmico',
      icon: <Skull className="h-12 w-12" />,
      description: 'Investigação e terror lovecraftiano. Sanidade frágil e horrores indescritíveis.',
      gradient: 'from-green-500/20 to-teal-500/20',
      borderColor: 'border-green-500/30',
      iconColor: 'text-green-500',
      features: ['8 atributos', 'Sistema de Sanidade', 'Rolagem percentual (d100)', 'Foco em investigação'],
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
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
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
      <section className="relative overflow-hidden py-24 md:py-36">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-primary/2 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
        <motion.div 
          className="container relative"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <div className="mx-auto max-w-4xl text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Badge variant="secondary" className="mb-6 px-4 py-1.5">
                <Sparkles className="mr-1 h-3 w-3" />
                Plataforma de RPG Online
              </Badge>
            </motion.div>
            <motion.h1 
              className="mb-6 text-4xl font-heading font-bold tracking-tight md:text-7xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Centralize sua mesa.
              <br />
              <span className="text-primary bg-gradient-to-r from-primary to-primary/70 bg-clip-text">Jogue melhor.</span>
            </motion.h1>
            <motion.p 
              className="mb-10 text-lg text-muted-foreground md:text-xl max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              DiceHub é a plataforma completa para mestres e jogadores de RPG. 
              Gerencie campanhas, crie personagens, role dados e viva aventuras épicas com seu grupo.
            </motion.p>
            <motion.div 
              className="flex flex-col gap-4 sm:flex-row sm:justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Link to="/login">
                <Button size="lg" className="w-full sm:w-auto gap-2 h-12 px-8">
                  <Dice6 className="h-5 w-5" />
                  Começar Agora
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* How it Works Section */}
      <section className="py-24 bg-muted/30">
        <div className="container">
          <motion.div 
            className="mx-auto max-w-2xl text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Badge variant="outline" className="mb-4">
              <Gamepad2 className="mr-1 h-3 w-3" />
              Simples e Rápido
            </Badge>
            <h2 className="text-3xl font-heading font-bold mb-4 md:text-4xl">Como Funciona</h2>
            <p className="text-muted-foreground text-lg">
              Em poucos passos você já está jogando com seu grupo.
            </p>
          </motion.div>
          <motion.div 
            className="grid gap-8 md:grid-cols-2 lg:grid-cols-4"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {steps.map((step, index) => (
              <motion.div
                key={index}
                className="relative"
                variants={fadeInUp}
              >
                <Card className="h-full relative overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                  <CardHeader>
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-xl">
                        {step.number}
                      </div>
                      <CardTitle className="text-lg">{step.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </CardContent>
                </Card>
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 w-8 text-muted-foreground">
                    <ArrowRight className="h-6 w-6" />
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24">
        <div className="container">
          <motion.div 
            className="mx-auto max-w-2xl text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Badge variant="outline" className="mb-4">
              <Zap className="mr-1 h-3 w-3" />
              Recursos
            </Badge>
            <h2 className="text-3xl font-heading font-bold mb-4 md:text-4xl">Tudo que você precisa</h2>
            <p className="text-muted-foreground text-lg">
              Ferramentas completas para mestres e jogadores em uma única plataforma.
            </p>
          </motion.div>
          <motion.div 
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {features.map((feature, index) => (
              <motion.div key={index} variants={fadeInUp}>
                <Card className="h-full relative overflow-hidden group hover:shadow-lg transition-all hover:-translate-y-1">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <CardHeader>
                    <div className="mb-2 text-primary">{feature.icon}</div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Systems Section */}
      <section className="py-24 bg-muted/30">
        <div className="container">
          <motion.div 
            className="mx-auto max-w-2xl text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Badge variant="outline" className="mb-4">
              <Globe className="mr-1 h-3 w-3" />
              Multi-Sistema
            </Badge>
            <h2 className="text-3xl font-heading font-bold mb-4 md:text-4xl">Sistemas Suportados</h2>
            <p className="text-muted-foreground text-lg">
              Escolha o sistema perfeito para sua aventura. Cada um com mecânicas e visual próprios.
            </p>
          </motion.div>
          <motion.div 
            className="grid gap-8 lg:grid-cols-3"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {systems.map((system, index) => (
              <motion.div key={system.id} variants={fadeInUp}>
                <Card className={`h-full relative overflow-hidden border-2 ${system.borderColor} hover:shadow-xl transition-all hover:-translate-y-2`}>
                  <div className={`absolute inset-0 bg-gradient-to-br ${system.gradient}`} />
                  <CardHeader className="relative">
                    <div className={`mb-4 ${system.iconColor}`}>
                      {system.icon}
                    </div>
                    <CardTitle className="text-2xl">{system.name}</CardTitle>
                    <CardDescription className="text-base">{system.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="relative">
                    <ul className="space-y-2">
                      {system.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center gap-2 text-sm">
                          <Check className={`h-4 w-4 ${system.iconColor} shrink-0`} />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Homebrew Section */}
      <section className="py-24">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <Badge variant="outline" className="mb-4">
                <Package className="mr-1 h-3 w-3" />
                Conteúdo Personalizado
              </Badge>
              <h2 className="text-3xl font-heading font-bold mb-6 md:text-4xl">
                Biblioteca de Homebrew
              </h2>
              <p className="text-muted-foreground text-lg mb-6">
                Crie e compartilhe itens, criaturas e classes personalizadas. 
                O mestre decide o que está disponível em cada campanha.
              </p>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary shrink-0">
                    <Check className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium">Itens Personalizados</p>
                    <p className="text-sm text-muted-foreground">Armas, armaduras, consumíveis e artefatos únicos.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary shrink-0">
                    <Check className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium">Criaturas e Monstros</p>
                    <p className="text-sm text-muted-foreground">Estatísticas completas para combate e encontros.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary shrink-0">
                    <Check className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium">Classes e Especializações</p>
                    <p className="text-sm text-muted-foreground">Habilidades por nível para criar classes únicas.</p>
                  </div>
                </li>
              </ul>
              <Link to="/login?signup=true">
                <Button className="gap-2">
                  <Wand2 className="h-4 w-4" />
                  Criar meu primeiro Homebrew
                </Button>
              </Link>
            </motion.div>
            <motion.div
              className="relative"
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="grid grid-cols-2 gap-4">
                <Card className="p-4 hover:shadow-lg transition-shadow">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-red-500/10">
                      <Swords className="h-5 w-5 text-red-500" />
                    </div>
                    <Badge className="bg-orange-500 text-white">Lendário</Badge>
                  </div>
                  <p className="font-semibold">Espada do Fogo Eterno</p>
                  <p className="text-xs text-muted-foreground">+3 de dano de fogo</p>
                </Card>
                <Card className="p-4 hover:shadow-lg transition-shadow">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-purple-500/10">
                      <Skull className="h-5 w-5 text-purple-500" />
                    </div>
                    <Badge variant="outline">ND 8</Badge>
                  </div>
                  <p className="font-semibold">Golem de Pedra</p>
                  <p className="text-xs text-muted-foreground">CA 17 • 178 PV</p>
                </Card>
                <Card className="p-4 hover:shadow-lg transition-shadow col-span-2">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-blue-500/10">
                      <BookOpen className="h-5 w-5 text-blue-500" />
                    </div>
                    <Badge className="bg-blue-500 text-white">Classe</Badge>
                  </div>
                  <p className="font-semibold">Caçador de Sombras</p>
                  <p className="text-xs text-muted-foreground">Especialização: Assassino das Trevas • 10 níveis</p>
                </Card>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 bg-muted/30">
        <div className="container">
          <motion.div 
            className="mx-auto max-w-2xl text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-heading font-bold mb-4 md:text-4xl">Planos</h2>
            <p className="text-muted-foreground text-lg">
              Escolha o plano ideal para sua jornada. Comece grátis, evolua quando quiser.
            </p>
          </motion.div>
          <motion.div 
            className="grid gap-8 md:grid-cols-2 max-w-4xl mx-auto"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {plans.map((plan, index) => (
              <motion.div key={index} variants={fadeInUp}>
                <Card 
                  className={`relative h-full ${plan.highlighted ? 'border-primary shadow-lg scale-105' : ''}`}
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
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-primary text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary-foreground/5 via-transparent to-transparent" />
        <motion.div 
          className="container relative text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <Dice6 className="h-16 w-16 mx-auto mb-6 opacity-80" />
          <h2 className="text-3xl font-heading font-bold mb-4 md:text-4xl">
            Pronto para começar sua aventura?
          </h2>
          <p className="mb-8 text-primary-foreground/80 max-w-xl mx-auto text-lg">
            Junte-se a milhares de jogadores e mestres que já usam o DiceHub para suas campanhas.
          </p>
          <Link to="/login?signup=true">
            <Button size="lg" variant="secondary" className="gap-2">
              <Sparkles className="h-5 w-5" />
              Criar Conta Grátis
            </Button>
          </Link>
        </motion.div>
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
