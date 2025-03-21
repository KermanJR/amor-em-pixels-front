import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Calendar, Heart, Camera, Video, Music, Lock, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Stepper, Step, StepLabel, StepContent } from '@mui/material'; // Usaremos Material-UI para o Stepper
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { format, addMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import MediaUpload from '@/components/MediaUpload';
import SitePreview from '@/components/SitePreview';
import { supabase } from '../supabaseClient';
import { useToast } from '@/hooks/use-toast';
import { loadStripe } from '@stripe/stripe-js';

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

  const handleNext = () => setActiveStep((prev) => prev + 1);
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
      label: 'Escolha seu Plano',
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Object.entries(PLANS).map(([plan, { photos, videos, musics, price, durationMonths }]) => (
              <motion.div
                key={plan}
                className={cn(
                  'p-6 rounded-2xl shadow-lg border cursor-pointer',
                  selectedPlan === plan ? 'bg-gradient-to-br from-pink-100 to-purple-200 border-pink-600' : 'bg-white border-pink-200/50 hover:border-pink-300'
                )}
                onClick={() => setSelectedPlan(plan as 'basic' | 'premium')}
                whileHover={{ scale: 1.03 }}
              >
                <h3 className="text-xl font-serif text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-700">
                  {plan === 'basic' ? 'Básico' : 'Premium'}
                </h3>
                <p className="text-2xl font-bold text-pink-600 mt-2">{price}</p>
                <p className="text-sm text-gray-600">{photos} fotos, {videos} vídeo, {musics} música - {durationMonths} meses</p>
              </motion.div>
            ))}
          </div>
        </div>
      ),
    },
    {
      label: 'Detalhes do Casal',
      content: (
        <div className="space-y-6">
          <FormField
            control={form.control}
            name="coupleName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-800">Nome do Casal</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: João & Maria" className="rounded-lg border-pink-200 focus:ring-pink-500" {...field} />
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
                <FormLabel className="text-gray-800">Data de Início</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn('w-full justify-start text-left border-pink-200', !field.value && 'text-gray-500')}
                      >
                        <Calendar className="mr-2 h-5 w-5 text-pink-600" />
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
      label: 'Mensagem e Mídia',
      content: (
        <div className="space-y-6">
          <FormField
            control={form.control}
            name="message"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-800">Mensagem de Amor</FormLabel>
                <FormControl>
                  <Textarea placeholder="Escreva algo especial..." className="rounded-lg border-pink-200 focus:ring-pink-500" {...field} />
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
                <FormLabel className="text-gray-800">Música do Spotify (Opcional)</FormLabel>
                <FormControl>
                  <Input placeholder="Cole o link do Spotify" className="rounded-lg border-pink-200 focus:ring-pink-500" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      ),
    },
    {
      label: 'Segurança',
      content: (
        <div className="space-y-6">
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-800">Senha de Acesso</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Crie uma senha (mín. 4 caracteres)"
                    className="rounded-lg border-pink-200 focus:ring-pink-500"
                    {...field}
                  />
                </FormControl>
                <p className="text-sm text-gray-500">Compartilhe essa senha com seu amor!</p>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-pink-50 to-purple-50 py-12 px-4 lg:px-8">
      <div className="container mx-auto grid lg:grid-cols-2 gap-12">
        {/* Formulário com Steps */}
        <motion.div
          className="bg-white p-8 rounded-3xl shadow-2xl border border-pink-100/50 max-w-lg mx-auto lg:sticky lg:top-8"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-3xl font-serif text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-800 mb-6 text-center">
            Crie Seu Card Digital
          </h1>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <Stepper activeStep={activeStep} orientation="vertical" className="w-full">
                {steps.map((step, index) => (
                  <Step key={index}>
                    <StepLabel>
                      <span className="text-lg font-semibold text-gray-800">{step.label}</span>
                    </StepLabel>
                    <StepContent>
                      {step.content}
                      <div className="flex gap-4 mt-6">
                        {activeStep > 0 && (
                          <Button
                            variant="outline"
                            onClick={handleBack}
                            className="w-full border-pink-600 text-pink-600 hover:bg-pink-50"
                          >
                            Voltar
                          </Button>
                        )}
                        {activeStep < steps.length - 1 ? (
                          <Button
                            onClick={handleNext}
                            className="w-full bg-gradient-to-r from-pink-600 to-purple-800 text-white hover:from-pink-700 hover:to-purple-900"
                          >
                            Próximo
                          </Button>
                        ) : (
                          <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-gradient-to-r from-pink-600 to-purple-800 text-white hover:from-pink-700 hover:to-purple-900"
                          >
                            {isSubmitting ? (
                              <span className="flex items-center gap-2">
                                <Loader2 className="h-5 w-5 animate-spin" />
                                Criando...
                              </span>
                            ) : (
                              `Criar (${PLANS[selectedPlan].price})`
                            )}
                          </Button>
                        )}
                      </div>
                    </StepContent>
                  </Step>
                ))}
              </Stepper>
            </form>
          </Form>
        </motion.div>

        {/* Pré-visualização */}
        <motion.div
          className="bg-white p-6 rounded-3xl shadow-2xl border border-pink-100/50 max-w-lg mx-auto"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <h2 className="text-2xl font-serif text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-800 mb-4 text-center">
            Veja Como Está Ficando
          </h2>
          <div className="relative h-[600px] overflow-y-auto rounded-xl border border-gray-200">
            {previewData && (
              <SitePreview
                formData={previewData.formData}
                plan={previewData.plan}
                media={previewData.media}
                customUrl={previewData.formData.coupleName.toLowerCase().replace(/[^\w\s]/g, '').replace(/\s+/g, '').trim()}
              />
            )}
            {!previewData && (
              <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                <Sparkles className="h-12 w-12 animate-twinkle" />
                <p className="ml-2 text-lg">Preencha os campos para ver a mágica acontecer!</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Estilos */}
      <style jsx>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.4; }
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
