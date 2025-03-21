import { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Calendar, Heart, Loader2, Sparkles, Camera, Music, Lock, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { format, addMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import MediaUpload from '@/components/MediaUpload';
import SitePreview from '@/components/SitePreview';
import DarkSiteTemplate from '@/components/DarkSiteTemplate';
import { useToast } from '@/hooks/use-toast';
import { loadStripe } from '@stripe/stripe-js';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const PLANS = {
  basic: { photos: 5, musics: 1, durationMonths: 6, price: 'R$29,90' },
  premium: { photos: 8, musics: 1, durationMonths: 12, price: 'R$49,90' },
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
  customUrl: z.string().min(3, 'A URL deve ter pelo menos 3 caracteres').max(50).regex(/^[a-z0-9]+$/, 'A URL deve conter apenas letras minúsculas e números, sem espaços ou caracteres especiais'),
  template: z.enum(['light', 'dark']),
  email: z.string().email('Insira um e-mail válido').min(1, 'O e-mail é obrigatório'),
});

type FormValues = z.infer<typeof formSchema>;

const Create = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [photos, setPhotos] = useState<File[]>([]);
  const [musics, setMusics] = useState<File[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<'basic' | 'premium'>('basic');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCheckoutPopup, setShowCheckoutPopup] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      coupleName: '',
      relationshipStartDate: null,
      message: '',
      spotifyLink: '',
      password: '',
      customUrl: '',
      template: 'light',
      email: '',
    },
  });

  const watchedValues = form.watch(['coupleName', 'relationshipStartDate', 'message', 'spotifyLink', 'password', 'customUrl', 'template', 'email']);

  const previewData = useMemo(() => {
    const values = form.getValues();
    const mediaPreview = {
      photos: photos.map(file => URL.createObjectURL(file)),
      musics: musics.map(file => URL.createObjectURL(file)),
      spotifyLink: values.spotifyLink || '',
    };
    return {
      formData: { ...values },
      plan: selectedPlan,
      media: mediaPreview,
    };
  }, [photos, musics, selectedPlan, watchedValues]);

  useEffect(() => {
    return () => {
      previewData.media.photos.forEach(url => URL.revokeObjectURL(url));
      previewData.media.musics.forEach(url => URL.revokeObjectURL(url));
    };
  }, [previewData.media.photos, previewData.media.musics]);

  const handleNext = async () => {
    const values = form.getValues();
    if (activeStep === 0 && !selectedPlan) {
      toast({ title: 'Erro', description: 'Selecione um plano.', variant: 'destructive' });
      return;
    }
    if (activeStep === 1 && !values.template) {
      toast({ title: 'Erro', description: 'Selecione um template.', variant: 'destructive' });
      return;
    }
    if (activeStep === 2) {
      const isValid = await form.trigger(['coupleName', 'relationshipStartDate']);
      if (!isValid || !values.coupleName || !values.relationshipStartDate) {
        return;
      }
    }
    if (activeStep === 3) {
      const isValid = await form.trigger('message');
      if (!isValid || !values.message) {
        return;
      }
    }
    if (activeStep === 4) {
      const isValid = await form.trigger(['password', 'customUrl']);
      if (!isValid || !values.password || !values.customUrl) {
        return;
      }
    }
    if (activeStep === 5) {
      const isValid = await form.trigger('email');
      if (!isValid || !values.email) {
        return;
      }
    }
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => setActiveStep((prev) => prev - 1);

  const handleRemovePhoto = (index: number) => setPhotos((prev) => prev.filter((_, i) => i !== index));

  const checkUserLimits = () => {
    const planLimits = PLANS[selectedPlan];
    if (photos.length > planLimits.photos || musics.length > planLimits.musics) {
      toast({
        title: 'Limite Excedido',
        description: `Seu plano (${selectedPlan}) suporta até ${planLimits.photos} fotos e ${planLimits.musics} músicas.`,
        variant: 'destructive',
      });
      return false;
    }
    return true;
  };

  // Função para converter arquivos em base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const onSubmit = async (values: FormValues) => {
    const isValid = await form.trigger();
    if (!isValid) {
      toast({
        title: 'Erro',
        description: 'Por favor, corrija os erros no formulário antes de prosseguir.',
        variant: 'destructive',
      });
      return;
    }

    if (!checkUserLimits()) return;

    setIsSubmitting(true);
    setShowCheckoutPopup(true);

    try {
      // Converter fotos e músicas para base64
      const photoBase64 = await Promise.all(
        photos.map(async (file) => ({
          name: file.name,
          data: await fileToBase64(file),
        }))
      );

      const musicBase64 = await Promise.all(
        musics.map(async (file) => ({
          name: file.name,
          data: await fileToBase64(file),
        }))
      );

      const customUrl = values.customUrl.toLowerCase().trim();
      const expirationDate = addMonths(new Date(), PLANS[selectedPlan].durationMonths);
      const siteData = {
        custom_url: customUrl,
        user_id: null,
        form_data: {
          ...values,
          relationshipStartDate: values.relationshipStartDate.toISOString(),
        },
        plan: selectedPlan,
        media: {
          photos: photoBase64,
          musics: musicBase64,
          spotifyLink: values.spotifyLink,
        },
        created_at: new Date().toISOString(),
        expiration_date: expirationDate.toISOString(),
        status: 'pending',
        template_type: values.template,
        password: values.password,
        email: values.email,
      };

      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error('Stripe não foi inicializado corretamente.');
      }

      // Enviar os dados para o backend
      const response = await fetch('https://amor-em-pixels.onrender.com/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: null,
          customUrl,
          plan: selectedPlan,
          email: values.email,
          siteData, // Enviar todos os dados do site
        }),
      });

      if (!response.ok) {
        throw new Error(`Erro na requisição ao backend: ${response.status} ${response.statusText}`);
      }

      const { sessionId } = await response.json();
      if (!sessionId) {
        throw new Error('Nenhum sessionId retornado pelo backend.');
      }

      const { error: stripeError } = await stripe.redirectToCheckout({ sessionId });
      if (stripeError) {
        throw new Error(`Erro ao redirecionar para o checkout: ${stripeError.message}`);
      }
    } catch (error: any) {
      console.error('Erro no onSubmit:', error);
      toast({
        title: 'Erro',
        description: error.message || 'Falha ao criar o site. Tente novamente.',
        variant: 'destructive',
      });
      setShowCheckoutPopup(false);
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
            {Object.entries(PLANS).map(([plan, { photos, musics, price, durationMonths }]) => (
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
      label: 'Template',
      content: (
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-800">Escolha o Tema do Seu Card</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div
              className={cn(
                'p-6 rounded-xl border shadow-md cursor-pointer transition-all duration-300',
                form.getValues('template') === 'light' ? 'border-pink-500 bg-gradient-to-br from-pink-50 to-purple-100' : 'bg-white border-gray-200 hover:shadow-lg'
              )}
              onClick={() => form.setValue('template', 'light')}
              whileHover={{ scale: 1.02 }}
            >
              <h3 className="text-xl font-medium text-gray-900">Tema Claro</h3>
              <p className="text-sm text-gray-600 mt-2">Um design elegante com fundo claro e detalhes dourados.</p>
              <div className="mt-4 h-40 bg-gradient-to-b from-[#F5F5F0] to-[#FDF6E3] rounded-lg flex items-center justify-center">
                <span className="text-gray-500">Prévia do Tema Claro</span>
              </div>
            </motion.div>
            <motion.div
              className={cn(
                'p-6 rounded-xl border shadow-md cursor-pointer transition-all duration-300',
                form.getValues('template') === 'dark' ? 'border-pink-500 bg-gradient-to-br from-pink-50 to-purple-100' : 'bg-white border-gray-200 hover:shadow-lg'
              )}
              onClick={() => form.setValue('template', 'dark')}
              whileHover={{ scale: 1.02 }}
            >
              <h3 className="text-xl font-medium text-gray-900">Tema Escuro</h3>
              <p className="text-sm text-gray-600 mt-2">Um design sofisticado com fundo preto e detalhes dourados.</p>
              <div className="mt-4 h-40 bg-gradient-to-b from-[#1A1A1A] to-[#2C2C2C] rounded-lg flex items-center justify-center">
                <span className="text-gray-300">Prévia do Tema Escuro</span>
              </div>
            </motion.div>
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
      label: 'Segurança e URL',
      content: (
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-800">Segurança e URL Personalizada</h2>
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
          <FormField
            control={form.control}
            name="customUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700">URL Personalizada</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ex: joaoemaria"
                    className="rounded-md border-gray-300 focus:ring-pink-400"
                    {...field}
                    onChange={(e) => field.onChange(e.target.value.toLowerCase().replace(/[^\w\s]/g, '').replace(/\s+/g, '').trim())}
                  />
                </FormControl>
                <p className="text-sm text-gray-500">A URL será: {`${window.location.origin}/${field.value || '[sua-url]'}`}</p>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      ),
    },
    {
      label: 'Resumo',
      content: (
        <div className="space-y-6 relative">
          <div className="absolute inset-0 bg-gradient-to-br from-pink-50 to-purple-100 rounded-lg -z-10" />
          <h2 className="text-2xl font-semibold text-gray-800">Resumo do Seu Card</h2>
          <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
            <ul className="space-y-4 text-gray-700">
              <li className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-pink-500" />
                <span><strong>Nome do Casal:</strong> {form.getValues('coupleName') || 'Não informado'}</span>
              </li>
              <li className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-pink-500" />
                <span><strong>Data de Início:</strong> {form.getValues('relationshipStartDate') ? format(form.getValues('relationshipStartDate'), 'dd/MM/yyyy', { locale: ptBR }) : 'Não informada'}</span>
              </li>
              <li className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-pink-500" />
                <span><strong>Mensagem:</strong> {form.getValues('message')?.substring(0, 50) || 'Não informada'}{form.getValues('message')?.length > 50 ? '...' : ''}</span>
              </li>
              <li className="flex items-center gap-2">
                <Camera className="h-5 w-5 text-pink-500" />
                <span><strong>Fotos:</strong> {photos.length} de {PLANS[selectedPlan].photos}</span>
              </li>
              <li className="flex items-center gap-2">
                <Music className="h-5 w-5 text-pink-500" />
                <span><strong>Música do Spotify:</strong> {form.getValues('spotifyLink') ? 'Sim' : 'Não'}</span>
              </li>
              <li className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-pink-500" />
                <span><strong>Senha:</strong> {form.getValues('password') ? 'Definida' : 'Não definida'}</span>
              </li>
              <li className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-pink-500" />
                <span><strong>URL Personalizada:</strong> {`${window.location.origin}/${form.getValues('customUrl') || '[sua-url]'}`}</span>
              </li>
              <li className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-pink-500" />
                <span><strong>Plano:</strong> {selectedPlan === 'basic' ? 'Básico' : 'Premium'} ({PLANS[selectedPlan].price})</span>
              </li>
              <li className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-pink-500" />
                <span><strong>Tema:</strong> {form.getValues('template') === 'light' ? 'Claro' : 'Escuro'}</span>
              </li>
            </ul>
          </div>
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700">E-mail para Receber o Link</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      type="email"
                      placeholder="Digite seu e-mail"
                      className="pl-10 rounded-md border-gray-300 focus:ring-pink-400"
                      {...field}
                    />
                  </div>
                </FormControl>
                <p className="text-sm text-gray-500">Enviaremos o link do seu card digital para este e-mail.</p>
                <FormMessage />
              </FormItem>
            )}
          />
          <p className="text-sm text-gray-500">Confira os detalhes acima antes de finalizar!</p>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
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
          <motion.div
            className="bg-white p-6 md:p-8 rounded-2xl shadow-xl border border-gray-100"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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

                <motion.div
                  key={activeStep}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 30 }}
                  transition={{ duration: 0.5 }}
                >
                  {steps[activeStep].content}
                </motion.div>

                <div className="flex gap-4 mt-8">
                  {activeStep > 0 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleBack}
                      className="w-full border-pink-500 text-pink-500 hover:bg-pink-50"
                      disabled={isSubmitting}
                    >
                      Voltar
                    </Button>
                  )}
                  {activeStep < steps.length - 1 ? (
                    <Button
                      type="button"
                      onClick={handleNext}
                      disabled={isSubmitting}
                      className="w-full bg-pink-600 hover:bg-pink-700 text-white"
                    >
                      Próximo
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-pink-600 hover:bg-pink-700 text-white"
                    >
                      {isSubmitting ? (
                        <span className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Processando...
                        </span>
                      ) : (
                        `Pagar e Criar (${PLANS[selectedPlan].price})`
                      )}
                    </Button>
                  )}
                </div>
              </form>
            </Form>
          </motion.div>

          <motion.div
            className="bg-white p-6 md:p-8 rounded-2xl shadow-xl border border-gray-100 lg:sticky lg:top-20"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">Pré-visualização</h2>
            <div className="relative h-[500px] md:h-[600px] overflow-y-auto rounded-lg border border-gray-200 bg-gray-50">
              {previewData && previewData.formData.coupleName ? (
                previewData.formData.template === 'light' ? (
                  <SitePreview
                    formData={previewData.formData}
                    plan={previewData.plan}
                    media={previewData.media}
                    customUrl={previewData.formData.customUrl || previewData.formData.coupleName.toLowerCase().replace(/[^\w\s]/g, '').replace(/\s+/g, '').trim()}
                  />
                ) : (
                  <DarkSiteTemplate
                    formData={previewData.formData}
                    plan={previewData.plan}
                    media={previewData.media}
                    customUrl={previewData.formData.customUrl || previewData.formData.coupleName.toLowerCase().replace(/[^\w\s]/g, '').replace(/\s+/g, '').trim()}
                  />
                )
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

      <Dialog open={showCheckoutPopup} onOpenChange={setShowCheckoutPopup}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Redirecionando para o Checkout</DialogTitle>
            <DialogDescription>
              Aguarde, você está sendo redirecionado para a página de pagamento. Isso pode levar alguns segundos...
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center py-4">
            <Loader2 className="h-8 w-8 animate-spin text-pink-600" />
          </div>
        </DialogContent>
      </Dialog>

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
