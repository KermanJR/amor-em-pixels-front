import { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Heart, Edit, Share2, Download, Copy, Check, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SitePreview from '@/components/SitePreview';
import QRCode from 'qrcode';
import { pdf } from '@react-pdf/renderer';
import QrCodePdf from './QrCodePdf'; // Import the PDF template
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const Preview = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [isPageLoaded, setIsPageLoaded] = useState(false);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [isUrlDialogOpen, setIsUrlDialogOpen] = useState(false);
  const [customUrl, setCustomUrl] = useState('');
  const [urlAvailable, setUrlAvailable] = useState(true);
  const [isCopied, setIsCopied] = useState(false);
  const [customUrlError, setCustomUrlError] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);

  // Get the form data from location state
  const formData = location.state?.formData;
  const templateType = location.state?.templateType;
  const plan = location.state?.plan;
  const media = location.state?.media;

  // If no form data, redirect to create page
  useEffect(() => {
    if (!formData || !templateType || !media) {
      navigate('/criar', { replace: true });
      return;
    }

    // Set a default custom URL based on couple name
    if (formData.coupleName) {
      const defaultUrl = formData.coupleName
        .toLowerCase()
        .replace(/[^\w\s]/g, '')
        .replace(/\s+/g, '')
        .trim();
      setCustomUrl(defaultUrl);
    }

    // Add a small delay for animation purposes
    const timer = setTimeout(() => {
      setIsPageLoaded(true);
    }, 100);

    // Check for payment status
    const paymentStatus = searchParams.get('payment');
    if (paymentStatus === 'success') {
      toast({
        title: 'Pagamento Confirmado',
        description: 'Seu plano premium foi ativado com sucesso!',
      });
    } else if (paymentStatus === 'cancel') {
      toast({
        title: 'Pagamento Cancelado',
        description: 'Você cancelou o pagamento. Volte para ativar o plano premium.',
        variant: 'destructive',
      });
    }

    return () => clearTimeout(timer);
  }, [formData, templateType, media, navigate, searchParams, toast]);

  // Function to validate custom URL
  const validateCustomUrl = () => {
    if (!customUrl.trim()) {
      setCustomUrlError('Por favor, insira uma URL personalizada');
      return false;
    }

    if (!/^[a-zA-Z0-9-_]+$/.test(customUrl)) {
      setCustomUrlError('URL pode conter apenas letras, números, hífens e underlines');
      return false;
    }

    // In a real application, you would check if the URL is already taken
    // For now, we'll simulate this check
    const isTaken = false; // This would be an API call in a real app
    setUrlAvailable(!isTaken);

    if (isTaken) {
      setCustomUrlError('Este endereço já está sendo usado');
      return false;
    }

    setCustomUrlError('');
    return true;
  };

  // Function to generate QR code and PDF
  const generateQrCodeAndPdf = async () => {
    if (!customUrl) return;

    const siteUrl = `https://amor-em-pixels.com.br/${customUrl}`;
    try {
      // Generate QR code
      const qrCodeDataUrl = await QRCode.toDataURL(siteUrl);
      setQrCodeUrl(qrCodeDataUrl);

      // Format the special date
      const formattedDate = formData.specialDate
        ? format(new Date(formData.specialDate), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
        : '';

      // Generate PDF
      const pdfBlob = await pdf(
        <QrCodePdf
          coupleName={formData.coupleName}
          specialDate={formattedDate}
          message={formData.message}
          qrCodeUrl={qrCodeDataUrl}
        />
      ).toBlob();

      // Create a download link
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${formData.coupleName}-amor-em-pixels.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: 'PDF Gerado',
        description: 'Seu PDF com QR code foi baixado com sucesso!',
      });
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro ao gerar o PDF. Tente novamente.',
        variant: 'destructive',
      });
    }
  };

  // Function to save the custom URL and generate PDF
  const saveCustomUrl = () => {
    if (!validateCustomUrl()) return;

    // In a real app, you would save the custom URL to the database
    toast({
      title: 'URL personalizada salva',
      description: `Seu site agora está disponível em amor-em-pixels.com.br/${customUrl}`,
    });

    setIsUrlDialogOpen(false);

    // Generate and download the PDF
    generateQrCodeAndPdf();
  };

  // Function to copy the URL to clipboard
  const copyToClipboard = () => {
    const siteUrl = `https://amor-em-pixels.com.br/${customUrl}`;
    navigator.clipboard.writeText(siteUrl).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  // Function to handle sharing
  const shareLink = (platform: 'whatsapp' | 'facebook' | 'twitter' | 'email') => {
    const siteUrl = `https://amor-em-pixels.com.br/${customUrl}`;
    const message = `Criei um site especial para nós com Amor em Pixels! Confira: ${siteUrl}`;

    let shareUrl = '';

    switch (platform) {
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(siteUrl)}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}`;
        break;
      case 'email':
        shareUrl = `mailto:?subject=Um presente especial para você&body=${encodeURIComponent(message)}`;
        break;
    }

    window.open(shareUrl, '_blank');
  };

  if (!formData || !templateType || !media) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow pt-24 pb-20">
        <div className="container px-4 mx-auto">
          <div
            className={`max-w-5xl mx-auto transition-all duration-500 transform ${
              isPageLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
            }`}
          >
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
              <div>
                <Link
                  to="/criar"
                  className="inline-flex items-center text-gray-600 hover:text-love-500 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  <span>Voltar para edição</span>
                </Link>

                <h1 className="text-3xl md:text-4xl font-bold mt-4 mb-2 flex items-center">
                  Pré-visualização
                  <Heart className="h-5 w-5 ml-3 text-love-500" />
                </h1>

                <p className="text-gray-600 max-w-xl">
                  Veja como ficará seu site personalizado. Você pode voltar para fazer edições ou prosseguir para finalizar.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button
                  variant="outline"
                  className="border-love-200 text-love-600 hover:bg-love-50"
                  onClick={() => navigate('/criar', { state: { formData, templateType, plan, media } })}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  <span>Editar</span>
                </Button>

                <Button
                  variant="outline"
                  className="border-love-200 text-love-600 hover:bg-love-50"
                  onClick={() => setIsShareDialogOpen(true)}
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  <span>Compartilhar</span>
                </Button>

                <Button
                  className="bg-love-500 hover:bg-love-600"
                  onClick={() => setIsUrlDialogOpen(true)}
                >
                  <Globe className="h-4 w-4 mr-2" />
                  <span>Escolher URL</span>
                </Button>
              </div>
            </div>

            <div className="bg-white rounded-xl overflow-hidden border shadow-lg">
              <div className="p-3 bg-gray-50 border-b flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <div className="flex-1 max-w-md mx-auto">
                  <div className="bg-white rounded-md border border-gray-200 px-3 py-1 text-sm flex items-center">
                    <Globe className="h-3 w-3 mr-2 text-gray-400" />
                    <span className="text-gray-600 truncate">amor-em-pixels.com.br/{customUrl}</span>
                  </div>
                </div>
                <div className="w-16"></div>
              </div>

              <div className="border-b h-[calc(100vh-300px)] min-h-[500px] overflow-hidden">
                <SitePreview
                  formData={formData}
                
                  plan={plan}
                  media={media}
                />
              </div>
            </div>

            <div className="mt-8 text-center">
              <div className="max-w-2xl mx-auto">
                <h2 className="text-xl font-semibold mb-2">Sua criação está quase pronta!</h2>
                <p className="text-gray-600 mb-6">
                  Escolha uma URL personalizada para seu site e compartilhe com seu amor.
                  {plan === 'free' && media.photos.length >= 3 && media.videos.length >= 1 && (
                    <span className="block mt-2 text-amber-600">
                      Você atingiu o limite de mídias da versão gratuita. 
                      <a href="/precos" className="text-love-500 hover:underline ml-1">
                        Atualize para premium
                      </a> 
                      e adicione mais fotos, vídeos e músicas!
                    </span>
                  )}
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    variant="outline"
                    className="border-love-200 text-love-600 hover:bg-love-50"
                    onClick={() => navigate('/criar')}
                  >
                    Voltar e editar
                  </Button>

                  <Button
                    className="bg-love-500 hover:bg-love-600"
                    onClick={() => setIsUrlDialogOpen(true)}
                  >
                    Finalizar e Publicar
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Share Dialog */}
      <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Compartilhe seu site</DialogTitle>
            <DialogDescription>
              Envie o link do seu site para seu amor ou compartilhe nas redes sociais.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 space-y-4">
            <div className="flex items-center space-x-2">
              <Input
                value={`https://amor-em-pixels.com.br/${customUrl}`}
                readOnly
                className="flex-1"
              />
              <Button
                size="sm"
                variant="outline"
                onClick={copyToClipboard}
                className={isCopied ? "bg-green-50 text-green-600" : ""}
              >
                {isCopied ? (
                  <>
                    <Check className="h-4 w-4 mr-1" />
                    Copiado
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-1" />
                    Copiar
                  </>
                )}
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="bg-green-50 hover:bg-green-100 text-green-800 border-green-200"
                onClick={() => shareLink('whatsapp')}
              >
                WhatsApp
              </Button>

              <Button
                variant="outline"
                className="bg-blue-50 hover:bg-blue-100 text-blue-800 border-blue-200"
                onClick={() => shareLink('facebook')}
              >
                Facebook
              </Button>

              <Button
                variant="outline"
                className="bg-sky-50 hover:bg-sky-100 text-sky-800 border-sky-200"
                onClick={() => shareLink('twitter')}
              >
                Twitter
              </Button>

              <Button
                variant="outline"
                className="bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-200"
                onClick={() => shareLink('email')}
              >
                Email
              </Button>
            </div>
          </div>

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsShareDialogOpen(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Custom URL Dialog */}
      <Dialog open={isUrlDialogOpen} onOpenChange={setIsUrlDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Escolha uma URL personalizada</DialogTitle>
            <DialogDescription>
              Crie um endereço único para o site do seu amor.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 space-y-4">
            <div className="space-y-2">
              <div className="flex items-center">
                <span className="text-gray-500 mr-2">amor-em-pixels.com.br/</span>
                <Input
                  value={customUrl}
                  onChange={(e) => {
                    setCustomUrl(e.target.value);
                    setCustomUrlError('');
                  }}
                  placeholder="nome-do-casal"
                  className="flex-1"
                  onBlur={validateCustomUrl}
                />
              </div>

              {customUrlError && (
                <p className="text-sm text-red-500">{customUrlError}</p>
              )}

              {!customUrlError && customUrl && (
                <p className="text-sm text-green-500">
                  <Check className="h-3 w-3 inline mr-1" />
                  URL disponível
                </p>
              )}

              <p className="text-xs text-gray-500 mt-2">
                Use apenas letras, números, hífens e underlines. Sem espaços ou caracteres especiais.
              </p>
            </div>
          </div>

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsUrlDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              className="bg-love-500 hover:bg-love-600"
              onClick={saveCustomUrl}
              disabled={!!customUrlError || !customUrl}
            >
              Salvar URL e Gerar PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default Preview;