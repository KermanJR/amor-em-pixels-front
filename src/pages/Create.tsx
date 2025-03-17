import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Calendar, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { format, addMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import MediaUpload from '@/components/MediaUpload';
import SitePreview from '@/components/SitePreview';
import { supabase } from '../supabaseClient';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import QRCode from 'react-qr-code';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const PLANS = {
  basic: { photos: 5, videos: 1, musics: 1, durationMonths: 6, price: 'R$25,90' },
  premium: { photos: 8, videos: 1, musics: 1, durationMonths: 12, price: 'R$49,90' },
};

const formSchema = z.object({
  coupleName: z.string().min(3, { message: 'Nome do casal deve ter pelo menos 3 caracteres' }).max(50),
  relationshipStartDate: z.date({ required_error: 'Por favor, selecione a data de início do relacionamento' }),
  message: z.string().min(10, { message: 'Mensagem deve ter pelo menos 10 caracteres' }).max(500),
  spotifyLink: z.string().url({ message: 'Insira um link válido do Spotify' }).optional().or(z.literal('')).refine(
    (val) => !val || val.includes('spotify.com'),
    { message: 'O link deve ser do Spotify' }
  ),
});

type FormValues = z.infer<typeof formSchema>;

const Create = () => {
  const [photos, setPhotos] = useState<File[]>([]);
  const [videos, setVideos] = useState<File[]>([]);
  const [musics, setMusics] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'basic' | 'premium'>('basic'); // Padrão agora é 'basic'
  const [user, setUser] = useState<any>(null);
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [siteData, setSiteData] = useState<any>(null);
  const [customUrl, setCustomUrl] = useState<string>('');
  const [siteId, setSiteId] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { coupleName: '', relationshipStartDate: null, message: '', spotifyLink: '' },
  });

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    checkUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });

    return () => authListener.subscription.unsubscribe();
  }, []);

  const checkUserLimits = async () => {
    if (!user) return false;
    const planLimits = PLANS[selectedPlan];
    if (photos.length > planLimits.photos || videos.length > planLimits.videos || musics.length > planLimits.musics) {
      toast({
        title: 'Limite Excedido',
        description: `Seu plano (${selectedPlan}) suporta até ${planLimits.photos} fotos, ${planLimits.videos} vídeos e ${planLimits.musics} músicas.`,
        variant: 'destructive',
      });
      return false;
    }
    return true;
  };

  const getPlanLimits = () => PLANS[selectedPlan];

  const handleLogin = async () => {
    setAuthLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      setIsAuthDialogOpen(false);
      toast({ title: 'Sucesso', description: 'Login realizado com sucesso!' });
    } catch (error) {
      toast({ title: 'Erro', description: 'Falha no login.', variant: 'destructive' });
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignUp = async () => {
    setAuthLoading(true);
    try {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
      toast({ title: 'Sucesso', description: 'Cadastro realizado! Verifique seu e-mail.' });
      setIsLogin(true);
    } catch (error) {
      toast({ title: 'Erro', description: 'Falha no cadastro.', variant: 'destructive' });
    } finally {
      setAuthLoading(false);
    }
  };

  const onPreview = async (values: FormValues) => {
    if (!user) {
      setIsAuthDialogOpen(true);
      toast({ title: 'Aviso', description: 'Você precisa estar logado para criar o site. Faça login ou cadastre-se.', variant: 'destructive' });
      return;
    }

    const canCreate = await checkUserLimits();
    if (!canCreate) return;

    const previewData = {
      formData: { ...values },
      plan: selectedPlan,
      media: {
        photos: photos.map(file => URL.createObjectURL(file)),
        videos: videos.map(file => URL.createObjectURL(file)),
        musics: musics.map(file => URL.createObjectURL(file)),
        spotifyLink: values.spotifyLink || '',
      },
    };

    setSiteData(previewData);
    setCustomUrl(values.coupleName.toLowerCase().replace(/[^\w\s]/g, '').replace(/\s+/g, '').trim());
    setIsPreviewModalOpen(true);
  };

  const createSite = async (status: 'pending' | 'active' = 'pending') => {
    setIsSubmitting(true);
    try {
      const photoUrls = await Promise.all(
        photos.map(async (file, index) => {
          const { data, error } = await supabase.storage.from('media').upload(`${customUrl}/photos/photo-${index}-${Date.now()}.${file.name.split('.').pop()}`, file);
          if (error) throw error;
          return supabase.storage.from('media').getPublicUrl(data.path).data.publicUrl;
        })
      );
      const videoUrls = await Promise.all(
        videos.map(async (file, index) => {
          const { data, error } = await supabase.storage.from('media').upload(`${customUrl}/videos/video-${index}-${Date.now()}.${file.name.split('.').pop()}`, file);
          if (error) throw error;
          return supabase.storage.from('media').getPublicUrl(data.path).data.publicUrl;
        })
      );
      const musicUrls = await Promise.all(
        musics.map(async (file, index) => {
          const { data, error } = await supabase.storage.from('media').upload(`${customUrl}/musics/music-${index}-${Date.now()}.${file.name.split('.').pop()}`, file);
          if (error) throw error;
          return supabase.storage.from('media').getPublicUrl(data.path).data.publicUrl;
        })
      );

      const expirationDate = addMonths(new Date(), PLANS[selectedPlan].durationMonths);

      const finalSiteData = {
        custom_url: customUrl,
        user_id: user.id,
        form_data: { ...siteData.formData, relationshipStartDate: siteData.formData.relationshipStartDate.toISOString() },
        plan: selectedPlan,
        media: { photos: photoUrls, videos: videoUrls, musics: musicUrls, spotifyLink: siteData.media.spotifyLink },
        created_at: new Date().toISOString(),
        expiration_date: expirationDate.toISOString(),
        status,
        template_type: 'site',
      };

      const { data, error } = await supabase.from('sites').insert([finalSiteData]).select('id').single();
      if (error) {
        if (error.code === '23505') {
          toast({ title: 'Erro', description: 'Esta URL já está em uso.', variant: 'destructive' });
          return null;
        }
        throw error;
      }

      toast({ title: 'Sucesso', description: status === 'active' ? 'Seu site foi criado com sucesso!' : 'Site criado como pendente. Complete o pagamento!' });
      setSiteId(data.id);
      return data.id;
    } catch (error) {
      toast({ title: 'Erro', description: 'Erro ao criar o site.', variant: 'destructive' });
      return null;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCheckout = async () => {
    const stripe = await stripePromise;
    if (!stripe || !siteData) return;

    const siteId = await createSite('pending');
    if (!siteId) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('https://amor-em-pixels.onrender.com/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, customUrl, plan: selectedPlan, siteId }),
      });
      if (!response.ok) throw new Error('Falha ao criar sessão de checkout');
      const { sessionId } = await response.json();
      const { error } = await stripe.redirectToCheckout({ sessionId });
      if (error) throw error;
    } catch (error) {
      toast({ title: 'Erro', description: 'Falha ao iniciar o checkout.', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  /*const generatePDF = async () => {
    if (!siteData || !siteId) {
      toast({ title: 'Erro', description: 'Crie o site antes de baixar o PDF.', variant: 'destructive' });
      return;
    }

    const { data: site, error } = await supabase.from('sites').select('status').eq('id', siteId).single();
    if (error) {
      toast({ title: 'Erro', description: 'Erro ao verificar o status do site.', variant: 'destructive' });
      return;
    }
    if (site.status !== 'active') {
      toast({ title: 'Acesso Negado', description: 'Complete o pagamento para baixar o PDF.', variant: 'destructive' });
      return;
    }

    try {
      const sitePreviewElement = document.querySelector('.border.rounded-lg.p-4.bg-gray-50');
      if (!sitePreviewElement) {
        toast({ title: 'Erro', description: 'Não foi possível encontrar o conteúdo do site para gerar o PDF.', variant: 'destructive' });
        return;
      }

      const canvas = await html2canvas(sitePreviewElement, {
        scale: 2,
        useCORS: true,
      });
      const imgData = canvas.toDataURL('image/png');

      const doc = new jsPDF({
        format: 'a5',
        unit: 'mm',
      });
      const imgWidth = 148;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      doc.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);

      doc.save(`card-${customUrl}.pdf`);
      toast({ title: 'Sucesso', description: 'PDF baixado com sucesso!' });
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast({ title: 'Erro', description: 'Falha ao gerar o PDF.', variant: 'destructive' });
    }
  };*/

  const planLimits = getPlanLimits();

  return (
    <>
      <div className="max-w-3xl mx-auto py-12 px-4">
        <Navbar />
        <h1 className="text-3xl font-bold mb-6 mt-10 text-center">Crie seu Card de amor</h1>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onPreview)} className="space-y-8">
            <Tabs defaultValue="basic" onValueChange={(value) => setSelectedPlan(value as 'basic' | 'premium')}>
              <TabsList className="grid grid-cols-2 mb-4">
                <TabsTrigger value="basic">Básico</TabsTrigger>
                <TabsTrigger value="premium">
                  Premium <Sparkles className="h-4 w-4 ml-1 text-amber-500" />
                </TabsTrigger>
              </TabsList>
              <TabsContent value="basic">
                <p className="text-sm text-gray-600 mb-4">5 fotos, 1 vídeo, 1 música por R$59,90, válido por 6 meses.</p>
              </TabsContent>
              <TabsContent value="premium">
                <p className="text-sm text-gray-600 mb-4">8 fotos, 1 vídeo, 1 música por R$99,90, válido por 12 meses.</p>
              </TabsContent>
            </Tabs>

            <FormField
              control={form.control}
              name="coupleName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Casal</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: João & Maria" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="relationshipStartDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Data de Início do Relacionamento</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn('w-[240px] justify-start text-left font-normal', !field.value && 'text-muted-foreground')}
                        >
                          <Calendar className="mr-2 h-4 w-4" />
                          {field.value ? format(field.value, 'PPP', { locale: ptBR }) : <span>Selecione a data</span>}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <CalendarComponent mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mensagem de Amor</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Escreva uma mensagem especial..." {...field} />
                  </FormControl>
                  <FormDescription>{field.value.length}/500</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <MediaUpload
              type="image"
              maxFiles={planLimits.photos}
              maxSize={5}
              onFilesChange={setPhotos}
              currentFiles={photos}
              existingFiles={[]}
            />
            <MediaUpload
              type="video"
              maxFiles={planLimits.videos}
              maxSize={30}
              onFilesChange={setVideos}
              currentFiles={videos}
              existingFiles={[]}
            />

            <FormField
              control={form.control}
              name="spotifyLink"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Link do Spotify (Opcional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: https://open.spotify.com/track/..."
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>Insira um link de uma música do Spotify para tocar no site.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Carregando...' : 'Criar e Visualizar'}
            </Button>
          </form>
        </Form>

        <Dialog open={isAuthDialogOpen} onOpenChange={setIsAuthDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{isLogin ? 'Faça Login' : 'Cadastre-se'}</DialogTitle>
              <DialogDescription>{isLogin ? 'Entre para criar seu Card Digital.' : 'Crie uma conta para começar.'}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
              <Input type="password" placeholder="Senha" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <DialogFooter className="flex flex-col gap-2">
              <Button onClick={isLogin ? handleLogin : handleSignUp} disabled={authLoading}>
                {authLoading ? 'Processando...' : isLogin ? 'Entrar' : 'Cadastrar'}
              </Button>
              <Button variant="link" onClick={() => setIsLogin(!isLogin)} disabled={authLoading}>
                {isLogin ? 'Ainda não tem conta? Cadastre-se' : 'Já tem conta? Faça login'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {siteData && (
          <Dialog open={isPreviewModalOpen} onOpenChange={setIsPreviewModalOpen}>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Prévia do Seu Site</DialogTitle>
                <DialogDescription>Confira e personalize a URL antes de criar!</DialogDescription>
              </DialogHeader>
              <div className="space-y-6">
                <div className="border rounded-lg p-4 bg-gray-50" id="site-preview-container">
                  <SitePreview
                    formData={siteData.formData}
                    plan={siteData.plan}
                    media={siteData.media}
                    customUrl={customUrl}
                 
                  />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Defina a URL (sem hífen - ):</h3>
                  <Input
                    value={customUrl}
                    onChange={(e) => setCustomUrl(e.target.value.toLowerCase().replace(/[^\w\s]/g, '').replace(/\s+/g, '').trim())}
                    placeholder="Ex: joaoemaria"
                  />
                  <p className="text-sm text-gray-600">{`${window.location.origin}/${customUrl || '[sua-url]'}`}</p>
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">QR Code</h3>
                  <div className="flex justify-center">
                    <QRCode id="qr-code" value={`${window.location.origin}/${customUrl || 'exemplo'}`} size={128} level="H" />
                  </div>
                </div>
              </div>
              <DialogFooter className="flex gap-2">
                <Button variant="outline" onClick={() => setIsPreviewModalOpen(false)}>
                  Voltar
                </Button>
                <Button onClick={handleCheckout} disabled={isSubmitting || !customUrl}>
                  {isSubmitting ? 'Processando...' : `Pagar e Criar (${PLANS[selectedPlan].price})`}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
      <Footer />
    </>
  );
};

export default Create;
