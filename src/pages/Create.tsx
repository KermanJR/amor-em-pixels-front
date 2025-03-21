import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Calendar, Heart, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { format, addMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import MediaUpload from '@/components/MediaUpload';
import SitePreview from '@/components/SitePreview';
import { supabase } from '../supabaseClient';
import { useToast } from '@/hooks/use-toast';
import { loadStripe } from '@stripe/stripe-js';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const PLANS = {
  basic: { photos: 5, videos: 1, musics: 1, durationMonths: 6, price: 'R$29,90' },
  premium: { photos: 8, videos: 1, musics: 1, durationMonths: 12, price: 'R$49,90' },
};

const formSchema = z.object({
  coupleName: z.string().min(3, 'Nome do casal deve ter pelo menos 3 caracteres').max(50),
  relationshipStartDate: z.date({ required_error: 'Selecione a data de início' }),
  message: z.string().min(10, 'Mensagem deve ter pelo menos 10 caracteres').max(500),
  spotifyLink: z.string().url('Insira um link válido do Spotify').optional().or(z.literal('')).refine(
    (val) => !val || val.includes('spotify.com'),
    'O link deve ser do Spotify'
  ),
  password: z.string().min(4, 'A senha deve ter pelo menos 4 caracteres').max(20),
});

type FormValues = z.infer<typeof formSchema>;

const Create = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [photos, setPhotos] = useState<File[]>([]);
  const [videos, setVideos] = useState<File[]>([]);
  const [musics, setMusics] = useState<File[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<'basic' | 'premium'>('basic');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [previewData, setPreviewData] = useState<any>(null);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { coupleName: '', relationshipStartDate: null, message: '', spotifyLink: '', password: '' },
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

  useEffect(() => {
    const values = form.getValues();
    const mediaPreview = {
      photos: photos.map(file => URL.createObjectURL(file)),
      videos: videos.map(file => URL.createObjectURL(file)),
      musics: musics.map(file => URL.createObjectURL(file)),
      spotifyLink: values.spotifyLink || '',
    };
    setPreviewData({ formData: values, plan: selectedPlan, media: mediaPreview });
  }, [photos, videos, musics, selectedPlan, form.watch()]);

  const handleNext = () => {
    const errors = form.formState.errors;
    const values = form.getValues();
    if (activeStep === 0 && !selectedPlan) {
      toast({ title: 'Erro', description: 'Selecione um plano.', variant: 'destructive' });
      return;
    }
    if (activeStep === 1 && (!values.coupleName || !values.relationshipStartDate || errors.coupleName || errors.relationshipStartDate)) {
      form.trigger(['coupleName', 'relationshipStartDate']);
      return;
    }
    if (activeStep === 2 && (!values.message || errors.message)) {
      form.trigger('message');
      return;
    }
    if (activeStep === 3 && (!values.password || errors.password)) {
      form.trigger('password');
      return;
    }
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => setActiveStep((prev) => prev - 1);

  const handleRemovePhoto = (index: number) => setPhotos((prev) => prev.filter((_, i) => i !== index));
  const handleRemoveVideo = (index: number) => setVideos((prev) => prev.filter((_, i) => i !== index));

  const checkUserLimits = () => {
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

  const onSubmit = async (values: FormValues) => {
    if (!user) {
      toast({ title: 'Aviso', description: 'Faça login para continuar.', variant: 'destructive' });
      return;
    }
    if (!checkUserLimits()) return;

    setIsSubmitting(true);
    const customUrl = values.coupleName.toLowerCase().replace(/[^\w\s]/g, '').replace(/\s+/g, '').trim();
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
        form_data: { ...values, relationshipStartDate: values.relationshipStartDate.toISOString() },
        plan: selectedPlan,
        media: { photos: photoUrls, videos: videoUrls, musics: musicUrls, spotifyLink: values.spotifyLink },
        created_at: new Date().toISOString(),
        expiration_date: expirationDate.toISOString(),
        status: 'pending',
        template_type: 'site',
        password: values.password,
      };

      const { data, error } = await supabase.from('sites').insert([finalSiteData]).select('id').single();
      if (error) throw error;

      const stripe = await stripePromise;
      const response = await fetch('https://amor-em-pixels.onrender.com/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, customUrl, plan: selectedPlan, siteId: data.id }),
      });
      const { sessionId } = await response.json();
      stripe?.redirectToCheckout({ sessionId });
    } catch (error) {
      toast({ title: 'Erro', description: 'Falha ao criar o site.', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    {
      label: 'Plano',
      content: (
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-800">Escolha seu Plano</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(PLANS).map(([plan, { photos, videos, musics, price, durationMonths }]) => (
              <motion.div
                key={plan}
                className={cn(
                  'p-6 rounded-xl border shadow-md cursor-pointer transition-all duration-300',
                  selectedPlan === plan ? 'bg-gradient-to-br from-pink-50 to-purple-100 border-pink-500' : 'bg-white border-gray-200 hover:shadow-lg'
                )}
                onClick={() => setSelectedPlan(plan as 'basic' | 'premium')}
                whileHover={{ scale: 1.02 }}
              >
                <h3 className="text-xl font-medium text-gray-900 capitalize">{plan}</h3>
                <p className="text-3xl font-bold text-pink-600 mt-2">{price}</p>
                <ul className="text-sm text-gray-600 mt-4 space-y-2">
                  <li>{photos} Fotos</li>
                  <li>{videos} Vídeo</li>
                  <li>{musics} Música</li>
                  <li>{durationMonths} Meses de Duração</li>
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      ),
    },
    {
      label: 'Detalhes',
      content: (
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-800">Detalhes do Casal</h2>
          <FormField
            control={form.control}
            name="coupleName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700">Nome do Casal</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: João & Maria" className="rounded-md border-gray-300 focus:ring-pink-400" {...field} />
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
                <FormLabel className="text-gray-700">Data de Início</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button variant="outline" className={cn('w-full text-left border-gray-300', !field.value && 'text-gray-500')}>
                        <Calendar className="mr-2 h-4 w-4 text-pink-500" />
                        {field.value ? format(field.value, 'PPP', { locale: ptBR }) : 'Selecione a data'}
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
        </div>
      ),
    },
    {
      label: 'Mídia',
      content: (
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-800">Mensagem e Mídia</h2>
          <FormField
            control={form.control}
            name="message"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700">Mensagem de Amor</FormLabel>
                <FormControl>
                  <Textarea placeholder="Escreva algo especial..." className="rounded-md border-gray-300 focus:ring-pink-400" {...field} />
                </FormControl>
                <p className="text-sm text-gray-500">{field.value.length}/500</p>
                <FormMessage />
              </FormItem>
            )}
          />
          <MediaUpload
            type="image"
            maxFiles={PLANS[selectedPlan].photos}
            maxSize={5}
            onFilesChange={setPhotos}
            currentFiles={photos}
            existingFiles={[]}
            onRemoveExisting={handleRemovePhoto}
          />
          <MediaUpload
            type="video"
            maxFiles={PLANS[selectedPlan].videos}
            maxSize={30}
            onFilesChange={setVideos}
            currentFiles={videos}
            existingFiles={[]}
            onRemoveExisting={handleRemoveVideo}
          />
          <FormField
            control={form.control}
            name="spotifyLink"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700">Música do Spotify (Opcional)</FormLabel>
                <FormControl>
                  <Input placeholder="Cole o link do Spotify" className="rounded-md border-gray-300 focus:ring-pink-400" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      ),
    },
    {
      label: 'Senha',
      content: (
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-800">Segurança</h2>
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700">Senha de Acesso</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Crie uma senha (mín. 4 caracteres)"
                    className="rounded-md border-gray-300 focus:ring-pink-400"
                    {...field}
                  />
                </FormControl>
                <p className="text-sm text-gray-500">Proteja seu card com uma senha única.</p>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <Navbar />
      <main className="container mx-auto py-12 px-4 lg:px-8">
        <motion.h1
          className="text-4xl md:text-5xl font-bold text-center text-gray-900 mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          Crie seu Card Digital
        </motion.h1>
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Formulário */}
          <motion.div
            className="bg-white p-6 md:p-8 rounded-2xl shadow-xl border border-gray-100"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                {/* Stepper */}
                <div className="flex justify-between mb-8">
                  {steps.map((step, index) => (
                    <motion.div
                      key={index}
                      className={cn(
                        'flex-1 text-center',
                        index <= activeStep ? 'text-pink-600' : 'text-gray-400'
                      )}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                      <div
                        className={cn(
                          'w-8 h-8 mx-auto rounded-full flex items-center justify-center text-sm font-semibold mb-2',
                          index < activeStep ? 'bg-pink-500 text-white' : index === activeStep ? 'bg-pink-600 text-white' : 'bg-gray-200'
                        )}
                      >
                        {index + 1}
                      </div>
                      <span className="text-sm font-medium">{step.label}</span>
                    </motion.div>
                  ))}
                </div>

                {/* Conteúdo do Passo */}
                <motion.div
                  key={activeStep}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 30 }}
                  transition={{ duration: 0.5 }}
                >
                  {steps[activeStep].content}
                </motion.div>

                {/* Navegação */}
                <div className="flex gap-4 mt-8">
                  {activeStep > 0 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleBack}
                      className="w-full border-pink-500 text-pink-500 hover:bg-pink-50"
                    >
                      Voltar
                    </Button>
                  )}
                  <Button
                    type={activeStep === steps.length - 1 ? 'submit' : 'button'}
                    onClick={activeStep < steps.length - 1 ? handleNext : undefined}
                    disabled={isSubmitting}
                    className="w-full bg-pink-600 hover:bg-pink-700 text-white"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Criando...
                      </span>
                    ) : activeStep < steps.length - 1 ? (
                      'Próximo'
                    ) : (
                      `Criar (${PLANS[selectedPlan].price})`
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </motion.div>

          {/* Pré-visualização */}
          <motion.div
            className="bg-white p-6 md:p-8 rounded-2xl shadow-xl border border-gray-100 lg:sticky lg:top-20"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">Pré-visualização</h2>
            <div className="relative h-[500px] md:h-[600px] overflow-y-auto rounded-lg border border-gray-200 bg-gray-50">
              {previewData && previewData.formData.coupleName ? (
                <SitePreview
                  formData={previewData.formData}
                  plan={previewData.plan}
                  media={previewData.media}
                  customUrl={previewData.formData.coupleName.toLowerCase().replace(/[^\w\s]/g, '').replace(/\s+/g, '').trim()}
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500">
                  <Sparkles className="h-10 w-10 animate-twinkle mb-4" />
                  <p className="text-center text-lg">Preencha os campos para ver seu card!</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />

      {/* Estilos */}
      <style jsx>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
        .animate-twinkle {
          animation: twinkle 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default Create;
