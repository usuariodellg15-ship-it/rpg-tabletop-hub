import { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { users, campaigns, homebrews, adminLogs } from '@/data/mockData';
import { Shield, Users, Scroll, Wand2, FileText, Search, Ban, CheckCircle, Trash2, AlertTriangle, ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';

export default function AdminPage() {
  const { user } = useAuth();
  const [searchUsers, setSearchUsers] = useState('');
  const [searchCampaigns, setSearchCampaigns] = useState('');
  const [searchHomebrews, setSearchHomebrews] = useState('');
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [isCheckingAdmin, setIsCheckingAdmin] = useState(true);

  // Server-side admin check using the is_admin() RPC function
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        setIsAdmin(false);
        setIsCheckingAdmin(false);
        return;
      }

      try {
        const { data, error } = await supabase.rpc('is_admin');
        
        if (error) {
          console.error('Error checking admin status:', error);
          setIsAdmin(false);
        } else {
          setIsAdmin(data === true);
        }
      } catch (err) {
        console.error('Error checking admin status:', err);
        setIsAdmin(false);
      } finally {
        setIsCheckingAdmin(false);
      }
    };

    checkAdminStatus();
  }, [user]);

  // Show loading state while checking admin status
  if (isCheckingAdmin) {
    return (
      <div className="min-h-screen bg-muted flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Redirect non-admin users (server-verified)
  if (!isAdmin) return <Navigate to="/campaigns" replace />;

  const filteredUsers = users.filter(u => u.name.toLowerCase().includes(searchUsers.toLowerCase()));
  const filteredCampaigns = campaigns.filter(c => c.name.toLowerCase().includes(searchCampaigns.toLowerCase()));
  const filteredHomebrews = homebrews.filter(h => h.name.toLowerCase().includes(searchHomebrews.toLowerCase()));

  const handleBan = (userId: string) => toast.success('Usuário banido.');
  const handleCloseCampaign = (id: string) => toast.success('Campanha fechada.');
  const handleRemoveHomebrew = (id: string) => toast.success('Homebrew removida.');

  return (
    <div className="min-h-screen bg-muted">
      {/* Admin Header */}
      <header className="bg-background border-b">
        <div className="container flex h-16 items-center gap-4">
          <Link to="/campaigns"><Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4 mr-2" />Sair</Button></Link>
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <span className="text-xl font-heading font-bold">Admin Console</span>
          </div>
        </div>
      </header>

      <div className="container py-8">
        <Tabs defaultValue="users">
          <TabsList className="mb-6">
            <TabsTrigger value="users"><Users className="h-4 w-4 mr-2" />Usuários</TabsTrigger>
            <TabsTrigger value="campaigns"><Scroll className="h-4 w-4 mr-2" />Campanhas</TabsTrigger>
            <TabsTrigger value="homebrews"><Wand2 className="h-4 w-4 mr-2" />Homebrews</TabsTrigger>
            <TabsTrigger value="logs"><FileText className="h-4 w-4 mr-2" />Logs</TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <Card><CardHeader><CardTitle>Gerenciar Usuários</CardTitle></CardHeader><CardContent>
              <div className="relative mb-4"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Buscar usuários..." value={searchUsers} onChange={e => setSearchUsers(e.target.value)} className="pl-10" /></div>
              <div className="space-y-2">
                {filteredUsers.map(u => (
                  <div key={u.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <img src={u.avatar} alt="" className="h-10 w-10 rounded-full" />
                      <div><p className="font-medium">{u.name}</p><p className="text-sm text-muted-foreground">{u.email}</p></div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="capitalize">{u.role}</Badge>
                      <Dialog><DialogTrigger asChild><Button size="sm" variant="destructive"><Ban className="h-4 w-4" /></Button></DialogTrigger>
                        <DialogContent><DialogHeader><DialogTitle>Banir Usuário</DialogTitle></DialogHeader>
                          <p>Tem certeza que deseja banir <strong>{u.name}</strong>?</p>
                          <DialogFooter><Button variant="outline">Cancelar</Button><Button variant="destructive" onClick={() => handleBan(u.id)}>Confirmar Ban</Button></DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent></Card>
          </TabsContent>

          <TabsContent value="campaigns">
            <Card><CardHeader><CardTitle>Gerenciar Campanhas</CardTitle></CardHeader><CardContent>
              <div className="relative mb-4"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Buscar campanhas..." value={searchCampaigns} onChange={e => setSearchCampaigns(e.target.value)} className="pl-10" /></div>
              <div className="space-y-2">
                {filteredCampaigns.map(c => (
                  <div key={c.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div><p className="font-medium">{c.name}</p><p className="text-sm text-muted-foreground">GM: {users.find(u => u.id === c.gmId)?.name}</p></div>
                    <div className="flex items-center gap-2">
                      <Badge variant={c.status === 'active' ? 'default' : 'secondary'}>{c.status}</Badge>
                      <Dialog><DialogTrigger asChild><Button size="sm" variant="outline">{c.status === 'active' ? 'Fechar' : 'Abrir'}</Button></DialogTrigger>
                        <DialogContent><DialogHeader><DialogTitle>Alterar Status</DialogTitle></DialogHeader>
                          <p>Tem certeza que deseja {c.status === 'active' ? 'fechar' : 'abrir'} <strong>{c.name}</strong>?</p>
                          <DialogFooter><Button variant="outline">Cancelar</Button><Button onClick={() => handleCloseCampaign(c.id)}>Confirmar</Button></DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent></Card>
          </TabsContent>

          <TabsContent value="homebrews">
            <Card><CardHeader><CardTitle>Gerenciar Homebrews</CardTitle></CardHeader><CardContent>
              <div className="relative mb-4"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Buscar homebrews..." value={searchHomebrews} onChange={e => setSearchHomebrews(e.target.value)} className="pl-10" /></div>
              <div className="space-y-2">
                {filteredHomebrews.map(h => (
                  <div key={h.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div><p className="font-medium">{h.name}</p><p className="text-sm text-muted-foreground">por {users.find(u => u.id === h.authorId)?.name}</p></div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{h.isPublic ? 'Pública' : 'Privada'}</Badge>
                      <Dialog><DialogTrigger asChild><Button size="sm" variant="destructive"><Trash2 className="h-4 w-4" /></Button></DialogTrigger>
                        <DialogContent><DialogHeader><DialogTitle>Remover Homebrew</DialogTitle></DialogHeader>
                          <p>Tem certeza que deseja remover <strong>{h.name}</strong>?</p>
                          <DialogFooter><Button variant="outline">Cancelar</Button><Button variant="destructive" onClick={() => handleRemoveHomebrew(h.id)}>Confirmar</Button></DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent></Card>
          </TabsContent>

          <TabsContent value="logs">
            <Card><CardHeader><CardTitle>Logs Administrativos</CardTitle></CardHeader><CardContent>
              <div className="space-y-2">
                {adminLogs.map(log => (
                  <div key={log.id} className="flex items-center gap-3 p-3 border rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-amber-500" />
                    <div className="flex-1"><p className="font-medium">{log.action.replace('_', ' ')}</p><p className="text-sm text-muted-foreground">{log.details}</p></div>
                    <span className="text-xs text-muted-foreground">{new Date(log.timestamp).toLocaleString('pt-BR')}</span>
                  </div>
                ))}
              </div>
            </CardContent></Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
