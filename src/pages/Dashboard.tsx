import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { formatDistanceToNow, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Trash2, CreditCard, Eye, Edit, Plus, Calendar, Heart, Clock, Star, User, Download } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import QRCode from 'qrcode';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const PLANS = {
  basic: { name: 'Básico', color: 'bg-blue-200 text-blue-800', description: '6 meses de duração, R$59,90', sites: 1 },
  premium: { name: 'Premium', color: 'bg-amber-200 text-amber-800', description: '12 meses de duração, R$99,90', sites: 3 },
};

const Dashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [userPlan, setUserPlan] = useState<any>({ package_type: 'basic' });
  const [sites, setSites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchUserAndData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/criar');
        return;
      }
      setUser(user);

      const { data: planData } = await supabase
        .from('user_plans')
        .select('package_type, purchase_date')
        .eq('user_id', user.id)
        .single();
      setUserPlan(planData || { package_type: 'basic', purchase_date: null });

      const { data, error } = await supabase
        .from('sites')
        .select('*')
        .eq('user_id', user.id);

      if (error) {
        toast({ title: 'Erro', description: 'Falha ao carregar seus Cards Digitais', variant: 'destructive' });
      } else {
        setSites(data || []);
      }
      setLoading(false);
    };

    fetchUserAndData();
  }, [navigate, toast]);

  const deleteSite = async (siteId: string) => {
    try {
      const { error } = await supabase
        .from('sites')
        .delete()
        .eq('id', siteId);

      if (error) throw error;

      setSites(sites.filter(site => site.id !== siteId));
      toast({ title: 'Sucesso', description: 'Card Digital excluído com sucesso!' });
    } catch (error) {
      toast({ title: 'Erro', description: 'Falha ao excluir o Card Digital', variant: 'destructive' });
    }
  };

  const resumePayment = async (site: any) => {
    const stripe = await stripePromise;
    if (!stripe) return;

    try {
      const response = await fetch('https://amor-em-pixels.onrender.com/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, customUrl: site.custom_url, plan: site.plan, siteId: site.id }),
      });
      if (!response.ok) throw new Error('Falha ao criar sessão de checkout');
      const { sessionId } = await response.json();
      const { error } = await stripe.redirectToCheckout({ sessionId });
      if (error) throw error;
    } catch (error) {
      toast({ title: 'Erro', description: 'Falha ao retomar o pagamento.', variant: 'destructive' });
    }
  };

  const handleDownloadPDF = async (site: any) => {
    if (site.status !== 'active') {
      toast({ title: 'Erro', description: 'O pagamento deve ser concluído para baixar o PDF.', variant: 'destructive' });
      return;
    }

    try {
      const qrCodeUrl = await QRCode.toDataURL(`${window.location.origin}/${site.custom_url}`);

      const tempDiv = document.createElement('div');
      tempDiv.style.width = '210mm';
      tempDiv.style.padding = '20mm';
      tempDiv.style.background = '#FDF2F2';
      tempDiv.style.fontFamily = 'Arial, sans-serif';
      tempDiv.style.textAlign = 'center';

      tempDiv.innerHTML = `
        <h1 style="font-size: 36px; color: #872133; margin-bottom: 20px;">${site.form_data.coupleName}</h1>
        <p style="font-size: 18px; color: #6B1A28; margin-bottom: 20px;">${site.form_data.message}</p>
        <img src="${site.media.photos[0]}" style="max-width: 100%; height: auto; margin-bottom: 20px;" />
        <p style="font-size: 14px; color: #B8860B;">Início: ${format(new Date(site.form_data.relationshipStartDate), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</p>
        <img src="${qrCodeUrl}" style="width: 100px; height: 100px; margin-top: 20px;" />
        <p style="font-size: 12px; color: #6B1A28;">Escaneie para visitar nosso Card Digital</p>
      `;

      document.body.appendChild(tempDiv);
      const canvas = await html2canvas(tempDiv, { scale: 2, useCORS: true });
      document.body.removeChild(tempDiv);

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });
      const width = pdf.internal.pageSize.getWidth();
      const height = (canvas.height * width) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, width, height);
      pdf.save(`${site.form_data.coupleName.replace(/&/g, '').trim()}_card.pdf`);
      toast({ title: 'Sucesso', description: 'PDF baixado com sucesso!' });
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast({ title: 'Erro', description: 'Falha ao gerar o PDF.', variant: 'destructive' });
    }
  };

  const activeSites = sites.filter(site => site.status === 'active' && new Date(site.expiration_date) > new Date());
  const pendingSites = sites.filter(site => site.status === 'pending');
  const canceledSites = sites.filter(site => site.status === 'canceled' || (site.status === 'active' && new Date(site.expiration_date) <= new Date()));
  const planLimits = PLANS[userPlan.package_type];

  return (
    <>
      <Navbar />
      <div className="max-w-6xl mx-auto py-8 px-4 sm:py-12 sm:px-6 mt-10">
        {/* Cabeçalho do Dashboard */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-800">Bem-vindo ao seu Dashboard</h1>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">Gerencie seus Cards Digitais de amor e crie novas histórias.</p>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <Button
              onClick={() => navigate('/criar')}
              className="bg-love-500 hover:bg-love-600 text-white text-sm sm:text-base py-2 px-3 sm:px-4"
            >
              <Plus className="h-4 w-4 mr-2" />
              Novo Card Digital
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsProfileDialogOpen(true)}
              className="flex items-center gap-2 py-2 px-3 sm:px-4"
            >
              <Avatar className="h-6 w-6 sm:h-8 sm:w-8">
                <AvatarImage src={user?.user_metadata?.avatar_url} alt="Avatar do usuário" />
                <AvatarFallback>{user?.email?.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <span className="hidden sm:inline">{user?.email.split('@')[0]}</span>
            </Button>
          </div>
        </div>

        {/* Seção de Sites */}
        {loading ? (
          <p>Carregando...</p>
        ) : sites.length === 0 ? (
          <Card className="text-center py-10">
            <CardContent>
              <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-lg text-gray-600">Você ainda não criou nenhum Card Digital</p>
              <p className="text-sm text-gray-500">Comece agora e eternize suas memórias!</p>
              <Button
                onClick={() => navigate('/criar')}
                className="mt-4 bg-love-500 hover:bg-love-600 text-white text-sm sm:text-base py-2 px-4"
              >
                Criar Seu Primeiro Site
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Sites Ativos */}
            <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-gray-800">Cards Digitais Ativos</h2>
            {activeSites.length === 0 && (
              <p className="text-gray-600 text-sm sm:text-base">Nenhum Card Digital ativo no momento.</p>
            )}
            <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {activeSites.map(site => (
                <Card key={site.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="relative p-0">
                    <div className="h-32 sm:h-40 bg-gradient-to-r from-love-300 to-love-500 rounded-t-lg flex items-center justify-center text-white text-xl sm:text-2xl font-bold">
                      {site.form_data.coupleName.charAt(0)}
                    </div>
                    <Badge className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-green-500 text-white text-xs sm:text-sm">
                      Ativo
                    </Badge>
                  </CardHeader>
                  <CardContent className="p-4">
                    <CardTitle className="text-base sm:text-lg font-semibold truncate">{site.form_data.coupleName}</CardTitle>
                    <CardDescription className="text-gray-600 mt-1 text-xs sm:text-sm">
                      {site.plan.charAt(0).toUpperCase() + site.plan.slice(1)}
                    </CardDescription>
                    <div className="mt-2 sm:mt-3 space-y-1 sm:space-y-2 text-xs sm:text-sm">
                      <p className="text-gray-600 flex items-center gap-1 truncate">
                        <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                        <a
                          href={`/${site.custom_url}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline"
                        >
                          {window.location.origin}/{site.custom_url}
                        </a>
                      </p>
                      <p className="text-gray-600 flex items-center gap-1">
                        <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                        Criado: {format(new Date(site.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                      </p>
                      <p className="text-gray-600 flex items-center gap-1">
                        <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                        Expira: {formatDistanceToNow(new Date(site.expiration_date), { locale: ptBR, addSuffix: true })}
                      </p>
                    </div>
                    <Separator className="my-3 sm:my-4" />
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        onClick={() => navigate(`/editar-site/${site.id}`)}
                        className="flex-1 text-xs sm:text-sm py-2"
                      >
                        <Edit className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                        Editar
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => window.open(`/${site.custom_url}`, '_blank')}
                        className="flex-1 text-xs sm:text-sm py-2"
                      >
                        <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                        Visitar
                      </Button>
                      {site.plan === 'premium' && site.status === 'active' && (
                        <Button
                          variant="outline"
                          onClick={() => handleDownloadPDF(site)}
                          className="flex-1 text-xs sm:text-sm py-2"
                        >
                          <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                          Baixar PDF
                        </Button>
                      )}
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" className="flex-1 text-xs sm:text-sm py-2">
                            <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                            Excluir
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza de que deseja excluir o Card Digital "{site.form_data.coupleName}"? Esta ação não pode ser desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteSite(site.id)}>Excluir</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Sites Pendentes */}
            {pendingSites.length > 0 && (
              <>
                <h2 className="text-xl sm:text-2xl font-semibold mb-4 mt-6 sm:mt-8 text-gray-800">Cards Digitais Pendentes</h2>
                <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                  {pendingSites.map(site => (
                    <Card key={site.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader className="relative p-0">
                        <div className="h-32 sm:h-40 bg-gradient-to-r from-yellow-300 to-yellow-500 rounded-t-lg flex items-center justify-center text-white text-xl sm:text-2xl font-bold">
                          {site.form_data.coupleName.charAt(0)}
                        </div>
                        <Badge className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-yellow-500 text-white text-xs sm:text-sm">
                          Pendente
                        </Badge>
                      </CardHeader>
                      <CardContent className="p-4">
                        <CardTitle className="text-base sm:text-lg font-semibold truncate">{site.form_data.coupleName}</CardTitle>
                        <CardDescription className="text-gray-600 mt-1 text-xs sm:text-sm">
                          {site.plan.charAt(0).toUpperCase() + site.plan.slice(1)}
                        </CardDescription>
                        <div className="mt-2 sm:mt-3 space-y-1 sm:space-y-2 text-xs sm:text-sm">
                          <p className="text-gray-600 flex items-center gap-1 truncate">
                            <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                            {window.location.origin}/{site.custom_url}
                          </p>
                          <p className="text-gray-600 flex items-center gap-1">
                            <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                            Aguardando pagamento
                          </p>
                        </div>
                        <Separator className="my-3 sm:my-4" />
                        <div className="flex flex-wrap gap-2">
                          <Button
                            onClick={() => resumePayment(site)}
                            className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white text-xs sm:text-sm py-2"
                          >
                            <CreditCard className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                            Retomar Pagamento
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="destructive" className="flex-1 text-xs sm:text-sm py-2">
                                <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                                Excluir
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Tem certeza de que deseja excluir o Card Digital "{site.form_data.coupleName}"?
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => deleteSite(site.id)}>Excluir</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            )}

            {/* Sites Cancelados */}
            {canceledSites.length > 0 && (
              <>
                <h2 className="text-xl sm:text-2xl font-semibold mb-4 mt-6 sm:mt-8 text-gray-800">Cards Digitais Cancelados</h2>
                <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                  {canceledSites.map(site => (
                    <Card key={site.id} className="hover:shadow-lg transition-shadow opacity-75">
                      <CardHeader className="relative p-0">
                        <div className="h-32 sm:h-40 bg-gradient-to-r from-red-300 to-red-500 rounded-t-lg flex items-center justify-center text-white text-xl sm:text-2xl font-bold">
                          {site.form_data.coupleName.charAt(0)}
                        </div>
                        <Badge className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-red-500 text-white text-xs sm:text-sm">
                          Cancelado
                        </Badge>
                      </CardHeader>
                      <CardContent className="p-4">
                        <CardTitle className="text-base sm:text-lg font-semibold truncate">{site.form_data.coupleName}</CardTitle>
                        <CardDescription className="text-gray-600 mt-1 text-xs sm:text-sm">
                          {site.plan.charAt(0).toUpperCase() + site.plan.slice(1)}
                        </CardDescription>
                        <div className="mt-2 sm:mt-3 space-y-1 sm:space-y-2 text-xs sm:text-sm">
                          <p className="text-gray-600 flex items-center gap-1 truncate">
                            <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                            {window.location.origin}/{site.custom_url}
                          </p>
                          <p className="text-gray-600 flex items-center gap-1">
                            <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                            Expirou em: {format(new Date(site.expiration_date), 'dd/MM/yyyy', { locale: ptBR })}
                          </p>
                        </div>
                        <Separator className="my-3 sm:my-4" />
                        <div className="flex flex-wrap gap-2">
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="destructive" className="flex-1 text-xs sm:text-sm py-2">
                                <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                                Excluir
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Tem certeza de que deseja excluir o Card Digital cancelado "{site.form_data.coupleName}"?
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => deleteSite(site.id)}>Excluir</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>

      {/* Dialog de Perfil do Usuário */}
      <Dialog open={isProfileDialogOpen} onOpenChange={setIsProfileDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Perfil do Usuário</DialogTitle>
            <DialogDescription>Informações da sua conta</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-12 w-12 sm:h-16 sm:w-16">
                <AvatarImage src={user?.user_metadata?.avatar_url} alt="Avatar do usuário" />
                <AvatarFallback>{user?.email?.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-base sm:text-lg font-semibold">{user?.email}</p>
                <p className="text-xs sm:text-sm text-gray-600">
                  Usuário desde {user?.created_at ? format(new Date(user.created_at), 'dd/MM/yyyy', { locale: ptBR }) : 'N/A'}
                </p>
              </div>
            </div>
            <Separator />
            <div>
              <p className="text-xs sm:text-sm text-gray-600 flex items-center gap-1">
                <Star className="h-3 w-3 sm:h-4 sm:w-4" />
                Plano: <span className="font-semibold">{planLimits.name}</span>
              </p>
              <p className="text-xs sm:text-sm text-gray-600 flex items-center gap-1 mt-1">
                <User className="h-3 w-3 sm:h-4 sm:w-4" />
                ID: {user?.id}
              </p>
              <p className="text-xs sm:text-sm text-gray-600 flex items-center gap-1 mt-1">
                Total de Sites: <span className="font-semibold">{sites.length}</span>
              </p>
            </div>
          </div>
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setIsProfileDialogOpen(false)} className="w-full sm:w-auto">
              Fechar
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                await supabase.auth.signOut();
                navigate('/criar');
              }}
              className="w-full sm:w-auto"
            >
              Sair
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </>
  );
};

export default Dashboard;
