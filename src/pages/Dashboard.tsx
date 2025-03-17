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
import { Trash2, CreditCard, Eye, Edit, Plus, Calendar, Heart, Clock, Star, User, Download, QrCode, Copy } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
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
  const [isPDFDialogOpen, setIsPDFDialogOpen] = useState(false);
  const [isQRCodeDialogOpen, setIsQRCodeDialogOpen] = useState(false);
  const [selectedSite, setSelectedSite] = useState<any>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>(BACKGROUND_COLORS[0].value);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
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

  const openQRCodeDialog = async (site: any) => {
    const qrCodeUrl = await QRCode.toDataURL(`${window.location.origin}/${site.custom_url}`);
    setQrCodeUrl(qrCodeUrl);
    setSelectedSite(site);
    setIsQRCodeDialogOpen(true);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({ title: 'Sucesso', description: 'Link copiado para a área de transferência!' });
    }).catch(() => {
      toast({ title: 'Erro', description: 'Falha ao copiar o link.', variant: 'destructive' });
    });
  };

  const openPDFDialog = (site: any) => {
    setSelectedSite(site);
    setSelectedPhoto(site.media.photos[0] || '');
    setSelectedColor(BACKGROUND_COLORS[0].value);
    setIsPDFDialogOpen(true);
  };

  const handleDownloadPDF = async () => {
    if (!selectedSite || selectedSite.status !== 'active') {
      toast({ title: 'Erro', description: 'O pagamento deve ser concluído para baixar o PDF.', variant: 'destructive' });
      return;
    }

    try {
      const templateUrl = '/template.pdf'; // Ajuste o caminho para o seu PDF
      const existingPdfBytes = await fetch(templateUrl).then(res => res.arrayBuffer());
      const pdfDoc = await PDFDocument.load(existingPdfBytes);

      const pages = pdfDoc.getPages();
      const firstPage = pages[0];
      const { width, height } = firstPage.getSize();

      const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

      let imgBytes = await fetch(selectedPhoto || 'https://via.placeholder.com/300x200?text=Sem+Foto').then(res => res.arrayBuffer());
      let img;
      if (selectedPhoto.endsWith('.png')) {
        img = await pdfDoc.embedPng(imgBytes);
      } else {
        img = await pdfDoc.embedJpg(imgBytes);
      }
      const imgWidth = 150;
      const imgHeight = (img.height * imgWidth) / img.width;
      firstPage.drawImage(img, {
        x: (width - imgWidth) / 2,
        y: height - 250,
        width: imgWidth,
        height: imgHeight,
      });

      const qrCodeUrl = await QRCode.toDataURL(`${window.location.origin}/${selectedSite.custom_url}`);
      const qrCodeBytes = await fetch(qrCodeUrl).then(res => res.arrayBuffer());
      const qrCodeImage = await pdfDoc.embedPng(qrCodeBytes);
      const qrSize = 50;
      firstPage.drawImage(qrCodeImage, {
        x: (width - qrSize) / 2,
        y: 30,
        width: qrSize,
        height: qrSize,
      });

      firstPage.drawText('Escaneie para visitar nosso Card Digital', {
        x: (width - helveticaFont.widthOfTextAtSize('Escaneie para visitar nosso Card Digital', 12)) / 2,
        y: 15,
        size: 12,
        font: helveticaFont,
        color: rgb(107 / 255, 26 / 255, 40 / 255),
      });

      const coupleName = selectedSite.form_data.coupleName;
      firstPage.drawText(coupleName, {
        x: (width - helveticaFont.widthOfTextAtSize(coupleName, 30)) / 2,
        y: height - 50,
        size: 30,
        font: helveticaFont,
        color: rgb(135 / 255, 33 / 255, 51 / 255),
      });

      const message = `"${selectedSite.form_data.message}"`;
      const messageLines = message.split('\n');
      let messageY = height - 80;
      for (const line of messageLines) {
        firstPage.drawText(line, {
          x: (width - helveticaFont.widthOfTextAtSize(line, 16)) / 2,
          y: messageY,
          size: 16,
          font: helveticaFont,
          color: rgb(107 / 255, 26 / 255, 40 / 255),
        });
        messageY -= 20;
      }

      const startDate = format(new Date(selectedSite.form_data.relationshipStartDate), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
      firstPage.drawText(`Início: ${startDate}`, {
        x: (width - helveticaFont.widthOfTextAtSize(`Início: ${startDate}`, 14)) / 2,
        y: height - 250 - imgHeight - 10,
        size: 14,
        font: helveticaFont,
        color: rgb(184 / 255, 134 / 255, 11 / 255),
      });

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${selectedSite.form_data.coupleName.replace(/&/g, '').trim()}_card.pdf`;
      link.click();
      URL.revokeObjectURL(url);

      toast({ title: 'Sucesso', description: 'PDF baixado com sucesso!' });
      setIsPDFDialogOpen(false);
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast({ title: 'Erro', description: 'Falha ao gerar o PDF.', variant: 'destructive' });
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
              {activeSites.map(site => (
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
                        <a href={`/${site.custom_url}`} target="_blank" rel="noopener noreferrer" className="underline">
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
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button
                        variant="outline"
                        onClick={() => navigate(`/editar-site/${site.id}`)}
                        className="flex-1 text-xs sm:text-sm py-1 sm:py-2"
                      >
                        <Edit className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                        Editar
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => window.open(`/${site.custom_url}`, '_blank')}
                        className="flex-1 text-xs sm:text-sm py-1 sm:py-2"
                      >
                        <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                        Visitar
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => openQRCodeDialog(site)}
                        className="flex-1 text-xs sm:text-sm py-1 sm:py-2"
                      >
                        <QrCode className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                        Ver QR Code
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => copyToClipboard(`${window.location.origin}/${site.custom_url}`)}
                        className="flex-1 text-xs sm:text-sm py-1 sm:py-2"
                      >
                        <Copy className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                        Copiar Link
                      </Button>
                      {site.plan === 'premium' && site.status === 'active' && (
                        <Button
                          variant="outline"
                          onClick={() => openPDFDialog(site)}
                          className="flex-1 text-xs sm:text-sm py-1 sm:py-2"
                        >
                          <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                          Baixar PDF
                        </Button>
                      )}
                    </div>
                    <p className="mt-2 text-xs sm:text-sm text-gray-600 italic flex items-center gap-1">
                      <Heart className="h-3 w-3 sm:h-4 sm:w-4 text-love-500" />
                      Compartilhe esse link com a pessoa que você ama e não esqueça de passar a senha: <strong>{site.form_data.password}</strong>
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Modal para QR Code */}
      <Dialog open={isQRCodeDialogOpen} onOpenChange={setIsQRCodeDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>QR Code do Seu Card</DialogTitle>
            <DialogDescription>
              Escaneie este QR Code ou compartilhe o link com a pessoa que você ama. Não esqueça de passar a senha: <strong>{selectedSite?.form_data.password}</strong>
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center my-4">
            {qrCodeUrl && <img src={qrCodeUrl} alt="QR Code" className="w-48 h-48" />}
          </div>
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setIsQRCodeDialogOpen(false)} className="w-full sm:w-auto">
              Fechar
            </Button>
            <Button
              onClick={() => copyToClipboard(`${window.location.origin}/${selectedSite?.custom_url}`)}
              className="w-full sm:w-auto"
            >
              <Copy className="h-4 w-4 mr-2" />
              Copiar Link
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal para Escolha de Foto e Cor */}
      <Dialog open={isPDFDialogOpen} onOpenChange={setIsPDFDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Personalizar seu PDF</DialogTitle>
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
            <Button variant="outline" onClick={() => setIsPDFDialogOpen(false)} className="w-full sm:w-auto">
              Cancelar
            </Button>
            <Button
              onClick={handleDownloadPDF}
              className="w-full sm:w-auto bg-red-500 hover:bg-red-600 text-white"
              disabled={!selectedPhoto}
            >
              Gerar PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </>
  );
};

export default Dashboard;
