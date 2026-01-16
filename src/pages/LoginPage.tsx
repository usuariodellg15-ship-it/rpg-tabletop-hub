import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Wand2, User, Lock, Mail, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { users } from '@/data/mockData';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock login - just use the first user
    login('user-1');
    navigate('/campaigns');
  };

  const handleQuickLogin = (userId: string) => {
    login(userId);
    navigate('/campaigns');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground mb-4">
            <Wand2 className="h-8 w-8" />
          </div>
          <h1 className="text-3xl font-heading font-bold">MesaHub</h1>
          <p className="text-muted-foreground mt-2">Sua mesa de RPG online</p>
        </div>

        <Card>
          <Tabs defaultValue="login">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Entrar</TabsTrigger>
              <TabsTrigger value="register">Criar Conta</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin}>
                <CardHeader>
                  <CardTitle>Bem-vindo de volta!</CardTitle>
                  <CardDescription>
                    Entre com sua conta para acessar suas campanhas.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="seu@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Senha</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-4">
                  <Button type="submit" className="w-full gap-2">
                    Entrar
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                  
                  {/* Quick login for demo */}
                  <div className="w-full">
                    <p className="text-xs text-center text-muted-foreground mb-3">
                      Login rápido (demo)
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      {users.slice(0, 3).map((user) => (
                        <Button
                          key={user.id}
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleQuickLogin(user.id)}
                          className="flex flex-col h-auto py-2"
                        >
                          <img 
                            src={user.avatar} 
                            alt={user.name} 
                            className="h-8 w-8 rounded-full mb-1"
                          />
                          <span className="text-xs truncate w-full text-center">
                            {user.name.split(' ')[0]}
                          </span>
                          <span className="text-[10px] text-muted-foreground capitalize">
                            {user.role === 'gm' ? 'Mestre' : user.role}
                          </span>
                        </Button>
                      ))}
                    </div>
                  </div>
                </CardFooter>
              </form>
            </TabsContent>

            <TabsContent value="register">
              <form onSubmit={handleLogin}>
                <CardHeader>
                  <CardTitle>Criar uma conta</CardTitle>
                  <CardDescription>
                    Junte-se a milhares de jogadores e mestres.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="name"
                        type="text"
                        placeholder="Seu nome"
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="reg-email"
                        type="email"
                        placeholder="seu@email.com"
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-password">Senha</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="reg-password"
                        type="password"
                        placeholder="••••••••"
                        className="pl-10"
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full gap-2">
                    Criar Conta
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </CardFooter>
              </form>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}
