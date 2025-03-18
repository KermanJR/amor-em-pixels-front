import { useState, useEffect } from 'react';
import { useForm, UseFormWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Calendar, Sparkles, Heart, Camera, Video, Music, Lock, Loader2, Copy } from 'lucide-react';
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
import MiniPreview from '@/components/MiniPreview';
import { supabase } from '../supabaseClient';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import QRCode from 'react-qr-code';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const PLANS = {
  basic: { photos: 5, videos: 1, musics: 1, durationMonths: 6, price: 'R$29,90' },
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
  password: z.string().min(4, { message: 'A senha deve ter pelo menos 4 caracteres' }).max(20, { message: 'A senha deve ter no máximo 20 caracteres' }),
});

type FormValues = z.infer<typeof formSchema>;

const Create = () => {
  const [photos, setPhotos] = useState<File[]>([]);
  const [videos, setVideos] = useState<File[]>([]);
  const [musics, setMusics] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'basic' | 'premium'>('basic');
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
    defaultValues: { coupleName: '', relationshipStartDate: null, message: '', spotifyLink: '', password: '' },
  });

  // Monitorar os valores do formulário em tempo real
  const watch = form.watch();

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

  const handleRemovePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRemoveVideo = (index: number) => {
    setVideos((prev) => prev.filter((_, i) => i !== index));
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
          const { data, error } = await supabase.storage
            .from('media')
            .upload(`${customUrl}/photos/photo-${index}-${Date.now()}.${file.name.split('.').pop()}`, file);
          if (error) throw error;
          return supabase.storage.from('media').getPublicUrl(data.path).data.publicUrl;
        })
      );
      const videoUrls = await Promise.all(
        videos.map(async (file, index) => {
          const { data, error } = await supabase.storage
            .from('media')
            .upload(`${customUrl}/videos/video-${index}-${Date.now()}.${file.name.split('.').pop()}`, file);
          if (error) throw error;
          return supabase.storage.from('media').getPublicUrl(data.path).data.publicUrl;
        })
      );
      const musicUrls = await Promise.all(
        musics.map(async (file, index) => {
          const { data, error } = await supabase.storage
            .from('media')
            .upload(`${customUrl}/musics/music-${index}-${Date.now()}.${file.name.split('.').pop()}`, file);
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
        password: siteData.formData.password,
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
      await new Promise(resolve => setTimeout(resolve, 1000));

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
      toast({ title: 'Erro', description: 'Falha ao iniciar o checkout. Tente novamente.', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({ title: 'Copiado!', description: `${label} copiado para a área de transferência.` });
    }).catch(() => {
      toast({ title: 'Erro', description: 'Falha ao copiar.', variant: 'destructive' });
    });
  };

  const planLimits = getPlanLimits();

  return (
    <>
      <div className="max-w-5xl mx-auto py-12 px-4">
        <Navbar />
        <h1 className="text-3xl font-bold mb-6 mt-10 text-center">Crie seu Card de amor</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
                  <p className="text-sm text-gray-600 mb-4">5 fotos, 1 vídeo, 1 música por R$29,90, válido por 6 meses.</p>
                </TabsContent>
                <TabsContent value="premium">
                  <p className="text-sm text-gray-600 mb-4">8 fotos, 1 vídeo, 1 música por R$49,90, válido por 12 meses.</p>
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
                onRemoveExisting={(index: number) => handleRemovePhoto(index)}
              />
              <MediaUpload
                type="video"
                maxFiles={planLimits.videos}
                maxSize={30}
                onFilesChange={setVideos}
                currentFiles={videos}
                existingFiles={[]}
                onRemoveExisting={(index: number) => handleRemoveVideo(index)}
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

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Senha para Acesso</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="Digite uma senha (mín. 4 caracteres)"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>Esta senha será necessária para acessar o site. Compartilhe-a com seu amor!</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Carregando...
                  </span>
                ) : (
                  'Criar e Visualizar'
                )}
              </Button>
            </form>
          </Form>

          {/* Pré-visualização Interativa */}
          <MiniPreview
            formData={watch}
            media={{
              photos,
              videos,
              musics,
              spotifyLink: watch.spotifyLink || '',
            }}
            plan={selectedPlan}
            customUrl={customUrl}
          />
        </div>

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
              <Button onClick={isLogin ? handleLogin : handleSignUp} disabled={authLoading} className="w-full">
                {authLoading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Processando...
                  </span>
                ) : isLogin ? (
                  'Entrar'
                ) : (
                  'Cadastrar'
                )}
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
                <DialogTitle>Prévia do Seu Card Digital</DialogTitle>
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
                  <h3 className="text-lg font-medium text-gray-800">O que acontece agora?</h3>
                  <p className="text-sm text-gray-600">
                    Siga os passos abaixo para finalizar a criação do seu Card Digital:
                  </p>
                  <ol className="list-decimal pl-5 text-sm text-gray-700 space-y-2">
                    <li>Confirme as informações do seu Card Digital abaixo.</li>
                    <li>Defina a URL personalizada para o seu site.</li>
                    <li>Clique em "Pagar e Criar" para realizar o pagamento.</li>
                    <li>
                      Após o pagamento, você receberá um e-mail com:
                      <ul className="list-disc pl-5 mt-1">
                        <li>O link de acesso ao seu Card Digital ({`${window.location.origin}/${customUrl || '[sua-url]'}`}).</li>
                        <li>A senha para acessar o Card Digital.</li>
                        {selectedPlan === 'premium' && (
                          <li>Um PDF personalizado com QR Code para download (exclusivo do plano Premium).</li>
                        )}
                      </ul>
                    </li>
                  </ol>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">Defina a URL (sem hífen - ):</h3>
                    <Input
                      value={customUrl}
                      onChange={(e) => setCustomUrl(e.target.value.toLowerCase().replace(/[^\w\s]/g, '').replace(/\s+/g, '').trim())}
                      placeholder="Ex: joaoemaria"
                    />
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-gray-600">{`${window.location.origin}/${customUrl || '[sua-url]'}`}</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopy(`${window.location.origin}/${customUrl}`, 'URL do Card')}
                        disabled={!customUrl}
                        aria-label="Copiar URL do Card Digital"
                        title="Copiar URL"
                      >
                        <Copy className="h-4 w-4 text-gray-500" />
                      </Button>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-gray-600">
                        Senha para acesso: {siteData.formData.password} (Compartilhe esta senha com seu amor!)
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopy(siteData.formData.password, 'Senha do Card')}
                        aria-label="Copiar senha do Card Digital"
                        title="Copiar senha"
                      >
                        <Copy className="h-4 w-4 text-gray-500" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-lg font-medium text-gray-800">Resumo do Seu Card:</h3>
                    <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
                      <li className="flex items-center gap-2">
                        <Heart className="h-4 w-4 text-love-500" />
                        <span><strong>Nome do Casal:</strong> {siteData.formData.coupleName}</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-love-500" />
                        <span><strong>Data de Início:</strong> {format(new Date(siteData.formData.relationshipStartDate), 'dd/MM/yyyy', { locale: ptBR })}</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Heart className="h-4 w-4 text-love-500" />
                        <span><strong>Mensagem:</strong> {siteData.formData.message.length > 50 ? siteData.formData.message.substring(0, 50) + '...' : siteData.formData.message}</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Camera className="h-4 w-4 text-love-500" />
                        <span><strong>Fotos:</strong> {photos.length} {photos.length === 1 ? 'foto' : 'fotos'}</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Video className="h-4 w-4 text-love-500" />
                        <span><strong>Vídeos:</strong> {videos.length} {videos.length === 1 ? 'vídeo' : 'vídeos'}</span>
                      </li>
                      {siteData.formData.spotifyLink ? (
                        <li className="flex items-center gap-2">
                          <Music className="h-4 w-4 text-love-500" />
                          <span><strong>Música do Spotify:</strong> Adicionada</span>
                        </li>
                      ) : (
                        <li className="flex items-center gap-2">
                          <Music className="h-4 w-4 text-love-500" />
                          <span><strong>Música do Spotify:</strong> Não adicionada</span>
                        </li>
                      )}
                      <li className="flex items-center gap-2">
                        <Lock className="h-4 w-4 text-love-500" />
                        <span><strong>Senha:</strong> {siteData.formData.password}</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
              <DialogFooter className="flex flex-col sm:flex-row gap-3 sticky bottom-0 bg-white pt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsPreviewModalOpen(false)}
                  className="w-full sm:w-auto"
                >
                  Voltar
                </Button>
                <Button
                  onClick={handleCheckout}
                  disabled={isSubmitting || !customUrl}
                  className="w-full sm:w-auto min-h-[40px] text-sm sm:text-base font-medium touch-manipulation focus:ring-2 focus:ring-love-500 focus:outline-none"
                  style={{ WebkitTapHighlightColor: 'transparent', zIndex: 10 }}
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Aguarde, você será redirecionado para o checkout...
                    </span>
                  ) : (
                    `Pagar e Criar (${PLANS[selectedPlan].price})`
                  )}
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
