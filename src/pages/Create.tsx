import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Calendar, Sparkles, ArrowLeft, ArrowRight, Heart, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { format, addMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { motion } from 'framer-motion';
import MediaUpload from '@/components/MediaUpload';
import SitePreview from '@/components/SitePreview';
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
});

type FormValues = z.infer<typeof formSchema> & { template?: 'site' | 'alternative' };

const Create = () => {
  const [step, setStep] = useState(1);
  const totalSteps = 5;
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
  const [selectedTemplate, setSelectedTemplate] = useState<'site' | 'alternative'>('site');
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema.extend({ template: z.string().optional() })),
    defaultValues: { coupleName: '', relationshipStartDate: null, message: '', spotifyLink: '', template: 'site' },
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
      template: values.template || 'site',
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
        template: siteData.template,
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
        body: JSON.stringify({ userId: user.id, customUrl, plan: selectedPlan, siteId, template: siteData.template }),
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

  const handleNext = async () => {
    const fieldsToValidate = {
      1: ['coupleName', 'relationshipStartDate'],
      2: ['message'],
      3: [],
      4: ['spotifyLink'],
      5: selectedPlan === 'premium' ? ['template'] : [],
    };

    const isValid = await form.trigger(fieldsToValidate[step] as any);
    if (!isValid && step !== 3) return;

    if (step === 3) {
      if (photos.length === 0) {
        toast({ title: 'Aviso', description: 'Por favor, adicione pelo menos uma foto.', variant: 'destructive' });
        return;
      }
      const planLimits = getPlanLimits();
      if (photos.length > planLimits.photos || videos.length > planLimits.videos) {
        toast({
          title: 'Limite Excedido',
          description: `Seu plano (${selectedPlan}) suporta até ${planLimits.photos} fotos e ${planLimits.videos} vídeos.`,
          variant: 'destructive',
        });
        return;
      }
    }

    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      form.handleSubmit(onPreview)();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleTemplateSelect = (template: 'site' | 'alternative') => {
    // Restrict selection to 'standard' only for now
    if (template === 'site') {
      setSelectedTemplate(template);
      form.setValue('template', template);
    }
  };

  const planLimits = getPlanLimits();

  // Novo Template Alternativo (Melhorado)
  const AlternativeTemplate = ({ formData, media, customUrl }: any) => {
    const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

    const handleNextPhoto = () => {
      setCurrentPhotoIndex((prev) => (prev + 1) % media.photos.length);
    };

    const handlePrevPhoto = () => {
      setCurrentPhotoIndex((prev) => (prev - 1 + media.photos.length) % media.photos.length);
    };

    return (
      <motion.div
        className="min-h-screen relative overflow-hidden bg-gradient-to-br from-pink-100 via-purple-200 to-blue-100 text-[#4A2C4A] font-sans"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        {/* Fundo com Corações Flutuantes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(5)].map((_, idx) => (
            <Heart
              key={idx}
              className={`absolute h-8 w-8 text-[#FF6666]/30 animate-float-${idx + 1}`}
              style={{
                top: `${Math.random() * 80 + 10}%`,
                left: `${Math.random() * 80 + 10}%`,
              }}
            />
          ))}
        </div>

        {/* Conteúdo Principal */}
        <div className="max-w-4xl mx-auto py-12 px-6 text-center">
          <motion.div
            className="mb-12"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-5xl font-serif text-[#A63A7C] font-bold tracking-wide">
              {formData.coupleName}
            </h2>
            <p className="text-lg md:text-xl text-[#7A4069] mt-2">
              {format(new Date(formData.relationshipStartDate), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </p>
          </motion.div>

          {/* Carrossel de Fotos */}
          <motion.div
            className="mb-12 relative max-w-3xl mx-auto"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h3 className="text-2xl font-medium text-[#A63A7C] mb-4">Nossas Memórias</h3>
            <div className="relative">
              <motion.img
                key={currentPhotoIndex}
                src={media.photos[currentPhotoIndex]}
                alt={`Foto ${currentPhotoIndex + 1}`}
                className="w-full h-80 object-cover rounded-lg shadow-lg border-4 border-[#FF9999]"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              />
              <button
                onClick={handlePrevPhoto}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-[#A63A7C] text-white p-2 rounded-full hover:bg-[#9B2C74]"
              >
                <ArrowLeft className="h-6 w-6" />
              </button>
              <button
                onClick={handleNextPhoto}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-[#A63A7C] text-white p-2 rounded-full hover:bg-[#9B2C74]"
              >
                <ArrowRight className="h-6 w-6" />
              </button>
            </div>
            <div className="flex justify-center gap-2 mt-4">
              {media.photos.map((_: any, index: number) => (
                <div
                  key={index}
                  className={`h-2 w-2 rounded-full ${
                    index === currentPhotoIndex ? 'bg-[#A63A7C]' : 'bg-[#E6C3D8]'
                  }`}
                />
              ))}
            </div>
          </motion.div>

          {/* Mensagem */}
          <motion.div
            className="mb-12 p-6 bg-white/80 rounded-lg shadow-lg border border-[#FF9999] max-w-2xl mx-auto"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <h3 className="text-2xl font-medium text-[#A63A7C] mb-4">Nossa Mensagem</h3>
            <p className="text-lg text-[#7A4069] italic">"{formData.message}"</p>
          </motion.div>

          {/* Vídeo */}
          {media.videos.length > 0 && (
            <motion.div
              className="mb-12 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <video
                src={media.videos[0]}
                controls
                className="w-full rounded-lg shadow-lg border-4 border-[#FF9999]"
              />
            </motion.div>
          )}

          {/* Spotify Link */}
          {media.spotifyLink && (
            <motion.div
              className="mb-12 max-w-md mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              <iframe
                src={`https://open.spotify.com/embed/track/${media.spotifyLink.split('track/')[1]?.split('?')[0]}`}
                width="100%"
                height="80"
                frameBorder="0"
                allowTransparency={true}
                allow="encrypted-media"
                className="rounded-lg shadow-md border border-[#FF9999]"
              />
            </motion.div>
          )}

          <p className="text-[#A63A7C] text-lg">
            URL: {`${window.location.origin}/${customUrl}`}
          </p>
        </div>
      </motion.div>
    );
  };

  return (
    <>
      <div
        className="min-h-screen  py-12 px-4 transition-all duration-300"
        style={{ backgroundAttachment: 'fixed' }}
      >
        <Navbar />
        <div className="max-w-4xl mx-auto ">

          <h1 className="text-4xl font-bold mb-6 mt-10 text-center text-[#A63A7C] drop-shadow-md">
            Crie seu Card de Amor
          </h1>

          {/* Seleção de Plano */}
          {/* Seleção de Plano */}
{/* Seleção de Plano */}
<div className="sticky top-0 z-10 backdrop-blur-sm p-6 rounded-lg shadow-lg mb-8 border border-[#FF9999]">
  <Tabs
    value={selectedPlan}
    onValueChange={(value) => setSelectedPlan(value as 'basic' | 'premium')}
    className="w-full"
  >
    <TabsList className="grid grid-cols-2 gap-2">
      <TabsTrigger
        value="basic"
        className="w-full text-center transition-all duration-300 text-lg py-3 px-4 rounded-md border border-[#FF9999] data-[state=active]:bg-[#F5E6F0] data-[state=active]:text-[#A63A7C]  data-[state=inactive]:text-[#7A4069] hover:bg-[#F5E6F0]/50"
      >
        Básico
      </TabsTrigger>
      <TabsTrigger
        value="premium"
        className="w-full text-center transition-all duration-300 text-lg py-3 px-4 rounded-md border border-[#FF9999] data-[state=active]:bg-[#F5E6F0] data-[state=active]:text-[#A63A7C]  data-[state=inactive]:text-[#7A4069] hover:bg-[#F5E6F0]/50"
      >
        Premium <Sparkles className="h-6 w-5 ml-2 text-[#FF9999]" />
      </TabsTrigger>
    </TabsList>
    <TabsContent value="basic" className="mt-4 text-[#4A2C4A]">
      <p className="text-lg">5 fotos, 1 vídeo, 1 música por <span className="font-bold">R$29,90</span>, válido por 6 meses.</p>
    </TabsContent>
    <TabsContent value="premium" className="mt-4 text-[#4A2C4A]">
      <p className="text-lg">8 fotos, 1 vídeo, 1 música por <span className="font-bold">R$49,90</span>, válido por 12 meses + Template Exclusivo!</p>
    </TabsContent>
  </Tabs>
</div>

          {/* Indicador de Progresso */}
          <div className="flex items-center justify-center mb-8">
            {Array.from({ length: totalSteps }, (_, index) => (
              <div key={index} className="flex items-center">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-medium border-2 ${
                    step >= index + 1
                      ? 'bg-[#A63A7C] text-white border-[#A63A7C]'
                      : 'bg-white text-[#7A4069] border-[#FF9999]'
                  } transition-all duration-300 shadow-md`}
                >
                  {index + 1}
                </div>
                {index < totalSteps - 1 && (
                  <div
                    className={`h-1 w-20 ${
                      step > index + 1 ? 'bg-[#A63A7C]' : 'bg-[#FF9999]'
                    } transition-all duration-300`}
                  />
                )}
              </div>
            ))}
          </div>

          <Form {...form}>
            <form className="space-y-8">
              {/* Etapa 1: Informações do Casal */}
              {step === 1 && (
                <motion.div
                  className="space-y-6 animate-fade-in bg-white/90 p-8 rounded-lg shadow-lg border border-[#FF9999]"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <h2 className="text-3xl font-semibold text-[#A63A7C] text-center">Informações do Casal</h2>
                  <p className="text-lg text-[#4A2C4A] text-center">Nos conte um pouco sobre vocês!</p>
                  <FormField
                    control={form.control}
                    name="coupleName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[#7A4069] text-lg">Nome do Casal</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Ex: João & Maria"
                            className="border-[#FF9999] focus:border-[#A63A7C] text-lg p-6"
                            {...field}
                          />
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
                        <FormLabel className="text-[#7A4069] text-lg">Data de Início do Relacionamento</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  'w-[300px] justify-start text-left font-normal border-[#FF9999] hover:bg-[#F5E6F0] text-lg p-6',
                                  !field.value && 'text-[#7A4069]'
                                )}
                              >
                                <Calendar className="mr-2 h-5 w-5 text-[#A63A7C]" />
                                {field.value ? (
                                  format(field.value, 'PPP', { locale: ptBR })
                                ) : (
                                  <span>Selecione a data</span>
                                )}
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0 bg-white border-[#FF9999]">
                            <CalendarComponent
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              initialFocus
                              className="text-[#7A4069]"
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </motion.div>
              )}

              {/* Etapa 2: Mensagem de Amor */}
              {step === 2 && (
                <motion.div
                  className="space-y-6 animate-fade-in bg-white/90 p-8 rounded-lg shadow-lg border border-[#FF9999]"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <h2 className="text-3xl font-semibold text-[#A63A7C] text-center">Mensagem de Amor</h2>
                  <p className="text-lg text-[#4A2C4A] text-center">Escreva uma mensagem especial para o seu amor.</p>
                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[#7A4069] text-lg">Mensagem de Amor</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Escreva uma mensagem especial..."
                            className="border-[#FF9999] focus:border-[#A63A7C] text-lg p-6"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription className="text-[#7A4069]">{field.value.length}/500</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </motion.div>
              )}

              {/* Etapa 3: Upload de Mídia */}
              {step === 3 && (
                <motion.div
                  className="space-y-6 animate-fade-in bg-white/90 p-8 rounded-lg shadow-lg border border-[#FF9999]"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <h2 className="text-3xl font-semibold text-[#A63A7C] text-center">Fotos e Vídeos</h2>
                  <p className="text-lg text-[#4A2C4A] text-center">Adicione fotos e vídeos para personalizar seu Card Digital.</p>
                  <MediaUpload
                    type="image"
                    maxFiles={planLimits.photos}
                    maxSize={5}
                    onFilesChange={setPhotos}
                    currentFiles={photos}
                    existingFiles={[]}
                    className="border-[#FF9999] focus:border-[#A63A7C]"
                  />
                  <MediaUpload
                    type="video"
                    maxFiles={planLimits.videos}
                    maxSize={30}
                    onFilesChange={setVideos}
                    currentFiles={videos}
                    existingFiles={[]}
                    className="border-[#FF9999] focus:border-[#A63A7C]"
                  />
                </motion.div>
              )}

              {/* Etapa 4: Link do Spotify */}
              {step === 4 && (
                <motion.div
                  className="space-y-6 animate-fade-in bg-white/90 p-8 rounded-lg shadow-lg border border-[#FF9999]"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <h2 className="text-3xl font-semibold text-[#A63A7C] text-center">Música Especial</h2>
                  <p className="text-lg text-[#4A2C4A] text-center">Adicione uma música do Spotify para tocar no seu site (opcional).</p>
                  <FormField
                    control={form.control}
                    name="spotifyLink"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[#7A4069] text-lg">Link do Spotify (Opcional)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Ex: https://open.spotify.com/track/..."
                            className="border-[#FF9999] focus:border-[#A63A7C] text-lg p-6"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription className="text-[#7A4069]">
                          Insira um link de uma música do Spotify para tocar no site.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </motion.div>
              )}

              {/* Etapa 5: Revisão e Visualização */}
              {step === 5 && (
                <motion.div
                  className="space-y-6 animate-fade-in bg-white/90 p-8 rounded-lg shadow-lg border border-[#FF9999]"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <h2 className="text-3xl font-semibold text-[#A63A7C] text-center">Revisão e Visualização</h2>
                  <p className="text-lg text-[#4A2C4A] text-center">Revise suas escolhas e visualize seu Card Digital!</p>
                  {selectedPlan === 'premium' && (
                    <div className="space-y-6">
                      <h3 className="text-2xl font-medium text-[#A63A7C]">Escolha seu Template</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Template Padrão */}
                        <motion.div
                          className={`p-6 rounded-lg border-2 ${
                            selectedTemplate === 'site'
                              ? 'border-[#A63A7C] bg-[#F5E6F0]'
                              : 'border-[#FF9999] bg-white'
                          } transition-all duration-300 cursor-pointer hover:shadow-xl`}
                          onClick={() => handleTemplateSelect('site')}
                          whileHover={{ scale: 1.02 }}
                        >
                          <h4 className="text-xl font-semibold text-[#A63A7C] mb-2">Template Padrão</h4>
                          <ul className="text-[#4A2C4A] list-disc list-inside">
                            <li>Layout simples e elegante</li>
                            <li>Exibição linear de fotos, vídeos e texto</li>
                            <li>Compatível com todos os planos</li>
                          </ul>
                        </motion.div>
                        {/* Template Alternativo (Marcado como em desenvolvimento) */}
                        <motion.div
                          className={`p-6 rounded-lg border-2 ${
                            selectedTemplate === 'alternative'
                              ? 'border-[#A63A7C] bg-[#F5E6F0]'
                              : 'border-[#FF9999] bg-white'
                          } transition-all duration-300 cursor-not-allowed opacity-50`}
                          whileHover={{ scale: 1.0 }} // Remove hover effect
                        >
                          <h4 className="text-xl font-semibold text-[#A63A7C] mb-2">Template Alternativo [X - Em Desenvolvimento]</h4>
                          <ul className="text-[#4A2C4A] list-disc list-inside">
                            <li>Carrossel interativo de fotos</li>
                            <li>Fundo romântico com animações</li>
                            <li>Exclusivo para usuários Premium</li>
                          </ul>
                          <p className="text-red-500 text-sm mt-2">Este template está em desenvolvimento e não está disponível no momento.</p>
                        </motion.div>
                      </div>
                    </div>
                  )}
                  <p className="text-[#4A2C4A] text-center text-lg">
                    {selectedPlan === 'basic'
                      ? 'Você está usando o template padrão.'
                      : `Template selecionado: ${selectedTemplate === 'site' ? 'Padrão' : 'Alternativo'}.`}
                  </p>
                </motion.div>
              )}

              {/* Navegação entre Etapas */}
              <div className="flex justify-between mt-8">
                {step > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleBack}
                    className="flex items-center gap-2 border-[#FF9999] text-[#A63A7C] hover:bg-[#F5E6F0] text-lg p-6"
                  >
                    <ArrowLeft className="h-5 w-5" />
                    Voltar
                  </Button>
                )}
                <Button
                  type="button"
                  onClick={handleNext}
                  className="flex items-center gap-2 ml-auto bg-[#A63A7C] hover:bg-[#9B2C74] text-white text-lg p-6"
                  disabled={isSubmitting}
                >
                  {step === totalSteps ? (
                    <>
                      {isSubmitting ? 'Carregando...' : 'Criar e Visualizar'}
                    </>
                  ) : (
                    <>
                      Próximo <ArrowRight className="h-5 w-5" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>

          {/* Modal de Autenticação */}
          <Dialog open={isAuthDialogOpen} onOpenChange={setIsAuthDialogOpen}>
            <DialogContent className="sm:max-w-md bg-white/90">
              <DialogHeader>
                <DialogTitle className="text-[#A63A7C]">{isLogin ? 'Faça Login' : 'Cadastre-se'}</DialogTitle>
                <DialogDescription className="text-[#4A2C4A]">
                  {isLogin ? 'Entre para criar seu Card Digital.' : 'Crie uma conta para começar.'}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  type="email"
                  placeholder="Email"
                  className="border-[#FF9999] focus:border-[#A63A7C] text-lg p-6"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Input
                  type="password"
                  placeholder="Senha"
                  className="border-[#FF9999] focus:border-[#A63A7C] text-lg p-6"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <DialogFooter className="flex flex-col gap-2">
                <Button
                  onClick={isLogin ? handleLogin : handleSignUp}
                  className="bg-[#A63A7C] hover:bg-[#9B2C74] text-white text-lg p-6"
                  disabled={authLoading}
                >
                  {authLoading ? 'Processando...' : isLogin ? 'Entrar' : 'Cadastrar'}
                </Button>
                <Button
                  variant="link"
                  className="text-[#7A4069] hover:text-[#A63A7C] text-lg"
                  onClick={() => setIsLogin(!isLogin)}
                  disabled={authLoading}
                >
                  {isLogin ? 'Ainda não tem conta? Cadastre-se' : 'Já tem conta? Faça login'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Modal de Prévia */}
          {siteData && (
            <Dialog open={isPreviewModalOpen} onOpenChange={setIsPreviewModalOpen}>
              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-white/90">
                <DialogHeader>
                  <DialogTitle className="text-[#A63A7C] text-2xl">Prévia do Seu Card Digital</DialogTitle>
                  <DialogDescription className="text-[#4A2C4A] text-lg">
                    Confira e personalize a URL antes de criar!
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-6">
                  <div className="border border-[#FF9999] rounded-lg p-4 bg-white" id="site-preview-container">
                    {siteData.template === 'alternative' ? (
                      <AlternativeTemplate
                        formData={siteData.formData}
                        media={siteData.media}
                        customUrl={customUrl}
                      />
                    ) : (
                      <SitePreview
                        formData={siteData.formData}
                        plan={siteData.plan}
                        media={siteData.media}
                        customUrl={customUrl}
                      />
                    )}
                  </div>
                  <p className="text-lg text-[#A63A7C] font-medium mb-4">
                    Quer um PDF personalizado do seu Card Digital?
                  </p>
                  <p className="text-[#4A2C4A] mb-4 text-lg">
                    Faça upgrade para o Premium e baixe seu PDF exclusivo com QR Code no Dashboard após o pagamento!
                  </p>
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium text-[#A63A7C]">Defina a URL (sem hífen - ):</h3>
                    <Input
                      value={customUrl}
                      onChange={(e) =>
                        setCustomUrl(
                          e.target.value.toLowerCase().replace(/[^\w\s]/g, '').replace(/\s+/g, '').trim()
                        )
                      }
                      placeholder="Ex: joaoemaria"
                      className="border-[#FF9999] focus:border-[#A63A7C] text-lg p-6"
                    />
                    <p className="text-lg text-[#7A4069]">
                      {`${window.location.origin}/${customUrl || '[sua-url]'}`}
                    </p>
                  </div>
                 
                </div>
                <DialogFooter className="flex gap-2">
                  <Button
                    variant="outline"
                    className="border-[#FF9999] text-[#A63A7C] hover:bg-[#F5E6F0] text-lg p-6"
                    onClick={() => setIsPreviewModalOpen(false)}
                  >
                    Voltar
                  </Button>
                  <Button
                    onClick={handleCheckout}
                    className="bg-[#A63A7C] hover:bg-[#9B2C74] text-white text-lg p-6"
                    disabled={isSubmitting || !customUrl}
                  >
                    {isSubmitting ? 'Processando...' : `Pagar e Criar (${PLANS[selectedPlan].price})`}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
        <Footer />
      </div>
    </>
  );
};

export default Create;
