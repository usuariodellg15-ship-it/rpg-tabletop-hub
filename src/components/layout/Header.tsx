import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { 
  Scroll, 
  Wand2, 
  User, 
  LogOut, 
  Shield, 
  ChevronDown,
  Castle,
  Crosshair
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { users } from '@/data/mockData';

export function Header() {
  const location = useLocation();
  const { user, logout, switchUser } = useAuth();
  const { theme } = useTheme();

  const isActive = (path: string) => location.pathname.startsWith(path);

  const getThemeIcon = () => {
    switch (theme) {
      case 'medieval':
        return <Castle className="h-4 w-4 text-theme-gold" />;
      case 'wildwest':
        return <Crosshair className="h-4 w-4 text-theme-rust" />;
      default:
        return null;
    }
  };

  const getThemeBadge = () => {
    switch (theme) {
      case 'medieval':
        return <Badge variant="secondary" className="badge-medieval text-xs">Medieval</Badge>;
      case 'wildwest':
        return <Badge variant="secondary" className="badge-wildwest text-xs">Velho Oeste</Badge>;
      default:
        return null;
    }
  };

  if (!user) return null;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link to="/campaigns" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Wand2 className="h-5 w-5" />
          </div>
          <span className="text-xl font-heading font-bold">MesaHub</span>
          {getThemeIcon()}
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-1">
          <Link to="/campaigns">
            <Button 
              variant={isActive('/campaigns') ? 'secondary' : 'ghost'} 
              className="gap-2"
            >
              <Scroll className="h-4 w-4" />
              Campanhas
            </Button>
          </Link>
          <Link to="/homebrews">
            <Button 
              variant={isActive('/homebrews') ? 'secondary' : 'ghost'} 
              className="gap-2"
            >
              <Wand2 className="h-4 w-4" />
              Homebrews
            </Button>
          </Link>
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {getThemeBadge()}
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2 pl-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback>{user.name[0]}</AvatarFallback>
                </Avatar>
                <span className="hidden md:inline-block max-w-32 truncate">
                  {user.name}
                </span>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-2 py-1.5">
                <p className="text-sm font-medium">{user.name}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
                <Badge variant="outline" className="mt-1 text-xs capitalize">
                  {user.role === 'gm' ? 'Mestre' : user.role === 'admin' ? 'Admin' : 'Jogador'}
                </Badge>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/profile" className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  Meu Perfil
                </Link>
              </DropdownMenuItem>
              {user.role === 'admin' && (
                <DropdownMenuItem asChild>
                  <Link to="/admin" className="cursor-pointer">
                    <Shield className="mr-2 h-4 w-4" />
                    Admin Console
                  </Link>
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <div className="px-2 py-1.5">
                <p className="text-xs text-muted-foreground mb-2">Trocar usuário (demo)</p>
                {users.map((u) => (
                  <DropdownMenuItem 
                    key={u.id} 
                    onClick={() => switchUser(u.id)}
                    className="cursor-pointer"
                  >
                    <Avatar className="h-5 w-5 mr-2">
                      <AvatarImage src={u.avatar} alt={u.name} />
                      <AvatarFallback>{u.name[0]}</AvatarFallback>
                    </Avatar>
                    <span className="flex-1 truncate">{u.name}</span>
                    {u.id === user.id && (
                      <Badge variant="secondary" className="text-xs ml-2">Atual</Badge>
                    )}
                  </DropdownMenuItem>
                ))}
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={logout}
                className="cursor-pointer text-destructive focus:text-destructive"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
