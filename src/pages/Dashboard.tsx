import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { formatDistanceToNow, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Trash2, CreditCard, Eye, Edit, Plus, Calendar, Heart, Clock, Star, User, Download, Share2, Mail, Twitter, Facebook, Whatsapp } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import QRCode from 'qrcode';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const PLANS = {
  basic: { name: 'Básico', color: 'bg-blue-200 text-blue-800', description: '6 meses de duração, R$59,90', sites: 1 },
  premium: { name: 'Premium', color: 'bg-amber-200 text-amber-800', description: '12 meses de duração, R$99,90', sites: 3 },
};

const BACKGROUND_COLORS = [
  { name: 'Rosa Claro', value: '#FDF2F2' },
  { name: 'Bege Romântico', value: '#FFF5E1' },
  { name: 'Lavanda Suave', value: '#F3E5F5' },
  { name: 'Azul Sereno', value: '#E3F2FD' },
];

const Dashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [userPlan, setUserPlan] = useState<any>({ package_type: 'basic' });
  const [sites, setSites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
  const [isHTMLDialogOpen, setIsHTMLDialogOpen] = useState(false);
  const [selectedSite, setSelectedSite] = useState<any>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>(BACKGROUND_COLORS[0].value);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Função para gerar links de compartilhamento
  const generateShareLink = (siteUrl: string, platform: string) => {
    const encodedUrl = encodeURIComponent(siteUrl);
    const text = encodeURIComponent(`Confira nosso Card Digital de Amor! ${siteUrl}`);
    switch (platform) {
      case 'whatsapp':
        return `https://api.whatsapp.com/send?text=${text}`;
      case 'email':
        return `mailto:?subject=Card Digital de Amor&body=${text}`;
      case 'twitter':
        return `https://twitter.com/intent/tweet?text=${text}`;
      case 'facebook':
        return `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
      default:
        return siteUrl;
    }
  };

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

  const openHTMLDialog = (site: any) => {
    setSelectedSite(site);
    setSelectedPhoto(site.media.photos[0] || '');
    setSelectedColor(BACKGROUND_COLORS[0].value);
    setIsHTMLDialogOpen(true);
  };

  const handleDownloadHTML = async () => {
    if (!selectedSite || selectedSite.status !== 'active') {
      toast({ title: 'Erro', description: 'O pagamento deve ser concluído para gerar o template.', variant: 'destructive' });
      return;
    }
  
    try {
      const qrCodeUrl = await QRCode.toDataURL(`${window.location.origin}/${selectedSite.custom_url}`);
  
      const htmlContent = `
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Card Digital Premium - ${selectedSite.form_data.coupleName}</title>
          <style>
            body {
              background-color: ${selectedColor};
              font-family: 'Georgia', serif;
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
              margin: 0;
            }
            .card {
              background-color: white;
              border-radius: 24px;
              box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
              width: 90%;
              max-width: 600px;
              padding: 32px;
              text-align: center;
              position: relative;
              overflow: hidden;
            }
            .card::before {
              content: '';
              position: absolute;
              top: -50px;
              left: -50px;
              width: 200px;
              height: 200px;
              background: radial-gradient(circle, rgba(255, 215, 0, 0.2) 0%, transparent 70%);
              z-index: 0;
            }
            .card::after {
              content: '';
              position: absolute;
              bottom: -50px;
              right: -50px;
              width: 200px;
              height: 200px;
              background: radial-gradient(circle, rgba(255, 215, 0, 0.2) 0%, transparent 70%);
              z-index: 0;
            }
            .card img.photo {
              width: 100%;
              max-height: 300px;
              object-fit: cover;
              border-radius: 16px;
              margin-bottom: 24px;
              position: relative;
              z-index: 1;
            }
            .card h1 {
              font-size: 32px;
              color: #872133;
              margin-bottom: 16px;
              font-weight: bold;
              position: relative;
              z-index: 1;
            }
            .card p.message {
              font-size: 18px;
              color: #6B1A28;
              font-style: italic;
              margin-bottom: 24px;
              position: relative;
              z-index: 1;
            }
            .card .details {
              display: flex;
              justify-content: space-between;
              margin-bottom: 24px;
              position: relative;
              z-index: 1;
              text-align: center;
            }
            .card .details p {
              font-size: 16px;
              color: #555;
              margin: 0 auto;
              text-align: center;
            }
            .card .qr-code {
              margin-top: 24px;
              position: relative;
              z-index: 1;
            }
            .card .qr-code img {
              width: 100px;
              height: 100px;
              margin-bottom: 8px;
            }
            .card .qr-code p {
              font-size: 14px;
              color: #555;
            }
            @media print {
              body {
                background-color: white;
              }
              .card {
                box-shadow: none;
                border: 1px solid #ddd;
              }
            }
          </style>
        </head>
        <body>
          <div class="card">
            <img class="photo" src="${selectedPhoto}" alt="Foto do Casal" />
            <h1>${selectedSite.form_data.coupleName}</h1>
            <p class="message">"${selectedSite.form_data.message}"</p>
            <div class="details">
              <p>Início: ${format(new Date(selectedSite.form_data.relationshipStartDate), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</p>
            </div>
            <div class="qr-code">
              <img src="${qrCodeUrl}" alt="QR Code" />
              <p>Escaneie para visitar nosso Card Digital</p>
            </div>
          </div>
        </body>
        </html>
      `;
  
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${selectedSite.form_data.coupleName.replace(/&/g, '').trim()}_card.html`;
      link.click();
      URL.revokeObjectURL(url);
  
      toast({ title: 'Sucesso', description: 'Template HTML premium gerado com sucesso!' });
      setIsHTMLDialogOpen(false);
    } catch (error) {
      console.error('Erro ao gerar HTML:', error);
      toast({ title: 'Erro', description: 'Falha ao gerar o template HTML.', variant: 'destructive' });
    }
  };

  const activeSites = sites.filter(site => site.status === 'active' && new Date(site.expiration_date) > new Date());

  return (
    <>
      <Navbar />
      <div className="max-w-6xl mx-auto py-8 px-4 sm:py-12 sm:px-6 mt-10">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-800">Bem-vindo ao seu Dashboard</h1>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">Gerencie seus Cards Digitais de amor.</p>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <Button onClick={() => navigate('/criar')} className="bg-love-500 hover:bg-love-600 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Novo Card Digital
            </Button>
            <Button variant="outline" onClick={() => setIsProfileDialogOpen(true)} className="flex items-center gap-2">
              <Avatar className="h-6 w-6 sm:h-8 sm:w-8">
                <AvatarImage src={user?.user_metadata?.avatar_url} />
                <AvatarFallback>{user?.email?.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <span className="hidden sm:inline">{user?.email?.split('@')[0]}</span>
            </Button>
          </div>
        </div>

        {loading ? (
          <p>Carregando...</p>
        ) : (
          <>
            <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-gray-800">Cards Digitais Ativos</h2>
            <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {activeSites.map(site => {
                const siteUrl = `${window.location.origin}/${site.custom_url}`;
                return (
                  <Card key={site.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="relative p-0">
                      <img
                        src={site.media.photos[0] || 'https://via.placeholder.com/300x120?text=Sem+Foto'}
                        alt={`Foto de ${site.form_data.coupleName}`}
                        className="h-32 sm:h-40 w-full object-cover rounded-t-lg"
                      />
                      <Badge className="absolute top-3 right-3 bg-green-500 text-white text-xs sm:text-sm">
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
                          <a href={siteUrl} target="_blank" rel="noopener noreferrer" className="underline">
                            {siteUrl}
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
                          onClick={() => window.open(siteUrl, '_blank')}
                          className="flex-1 text-xs sm:text-sm py-2"
                        >
                          <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                          Visitar
                        </Button>
                        {site.plan === 'premium' && site.status === 'active' && (
                          <Button
                            variant="outline"
                            onClick={() => openHTMLDialog(site)}
                            className="flex-1 text-xs sm:text-sm py-2"
                          >
                            <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                            Baixar Card Digital
                          </Button>
                        )}
                        {/* Botões de Compartilhamento */}
                        <div className="flex flex-wrap gap-2">
                          <Button
                            variant="outline"
                            onClick={() => window.open(generateShareLink(siteUrl, 'whatsapp'), '_blank')}
                            className="flex-1 text-xs sm:text-sm py-2 bg-green-500 hover:bg-green-600 text-white"
                          >
                            <Whatsapp className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                            WhatsApp
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => window.open(generateShareLink(siteUrl, 'email'), '_blank')}
                            className="flex-1 text-xs sm:text-sm py-2 bg-blue-500 hover:bg-blue-600 text-white"
                          >
                            <Mail className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                            E-mail
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => window.open(generateShareLink(siteUrl, 'twitter'), '_blank')}
                            className="flex-1 text-xs sm:text-sm py-2 bg-sky-500 hover:bg-sky-600 text-white"
                          >
                            <Twitter className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                            Twitter
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => window.open(generateShareLink(siteUrl, 'facebook'), '_blank')}
                            className="flex-1 text-xs sm:text-sm py-2 bg-blue-700 hover:bg-blue-800 text-white"
                          >
                            <Facebook className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                            Facebook
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Modal para Escolha de Foto e Cor */}
      <Dialog open={isHTMLDialogOpen} onOpenChange={setIsHTMLDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Personalizar seu Template HTML</DialogTitle>
            <DialogDescription>Escolha uma foto e a cor de fundo.</DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold mb-2">Escolha uma Foto</h3>
              {selectedSite && selectedSite.media.photos.length > 0 ? (
                <div className="grid grid-cols-3 gap-2">
                  {selectedSite.media.photos.map((photo: string, index: number) => (
                    <img
                      key={index}
                      src={photo}
                      alt={`Foto ${index + 1}`}
                      className={`w-full h-24 object-cover rounded-md cursor-pointer border-2 ${
                        selectedPhoto === photo ? 'border-red-500' : 'border-gray-200'
                      }`}
                      onClick={() => setSelectedPhoto(photo)}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">Nenhuma foto disponível.</p>
              )}
            </div>

            <div>
              <h3 className="text-sm font-semibold mb-2">Escolha a Cor de Fundo</h3>
              <div className="grid grid-cols-4 gap-2">
                {BACKGROUND_COLORS.map((color) => (
                  <div
                    key={color.value}
                    className={`w-10 h-10 rounded-full cursor-pointer border-2 ${
                      selectedColor === color.value ? 'border-red-500' : 'border-gray-200'
                    }`}
                    style={{ backgroundColor: color.value }}
                    onClick={() => setSelectedColor(color.value)}
                  />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setIsHTMLDialogOpen(false)} className="w-full sm:w-auto">
              Cancelar
            </Button>
            <Button
              onClick={handleDownloadHTML}
              className="w-full sm:w-auto bg-red-500 hover:bg-red-600 text-white"
              disabled={!selectedPhoto}
            >
              Gerar HTML
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </>
  );
};

export default Dashboard;
