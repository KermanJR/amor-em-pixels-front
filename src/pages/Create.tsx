import { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Calendar, Heart, Loader2, Sparkles, Camera, Music, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { format, addMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import MediaUpload from '@/components/MediaUpload';
import SiteTemplate from '@/components/SiteTemplate';
import DarkSiteTemplate from '@/components/DarkSiteTemplate'; // Novo template
import { supabase } from '../supabaseClient';
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
  timeline: z.array(
    z.object({
      date: z.date({ required_error: 'Selecione a data do momento' }),
      title: z.string().min(3, 'O título deve ter pelo menos 3 caracteres').max(50),
      description: z.string().min(10, 'A descrição deve ter pelo menos 10 caracteres').max(200),
      photo: z.string().optional(),
    })
  ).optional(),
  spotifyLink: z.string().url('Insira um link válido do Spotify').optional().or(z.literal('')).refine(
    (val) => !val || val.includes('spotify.com'),
    'O link deve ser do Spotify'
  ),
  password: z.string().min(4, 'A senha deve ter pelo menos 4 caracteres').max(20),
  customUrl: z.string().min(3, 'A URL deve ter pelo menos 3 caracteres').max(50).regex(/^[a-z0-9]+$/, 'A URL deve conter apenas letras minúsculas e números, sem espaços ou caracteres especiais'),
  template: z.enum(['light', 'dark']), // Novo campo para o template
});

type FormValues = z.infer<typeof formSchema>;

const Create = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [photos, setPhotos] = useState<File[]>([]);
  const [timelinePhotos, setTimelinePhotos] = useState<File[]>([]);
  const [musics, setMusics] = useState<File[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<'basic' | 'premium'>('basic');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      coupleName: '',
      relationshipStartDate: null,
      message: '',
      timeline: [],
      spotifyLink: '',
      password: '',
      customUrl: '',
      template: 'light', // Valor padrão
    },
  });

  const watchedValues = form.watch(['coupleName', 'relationshipStartDate', 'message', 'timeline', 'spotifyLink', 'password', 'customUrl', 'template']);

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

  const previewData = useMemo(() => {
    const values = form.getValues();
    const mediaPreview = {
      photos: photos.map(file => URL.createObjectURL(file)),
      musics: musics.map(file => URL.createObjectURL(file)),
      spotifyLink: values.spotifyLink || '',
    };
    const timelineWithPhotos = values.timeline?.map((moment, index) => ({
      ...moment,
      photo: timelinePhotos[index] ? URL.createObjectURL(timelinePhotos[index]) : moment.photo,
    }));
    return {
      formData: { ...values, timeline: timelineWithPhotos },
      plan: selectedPlan,
      media: mediaPreview,
    };
  }, [photos, timelinePhotos, musics, selectedPlan, watchedValues]);

  useEffect(() => {
    return () => {
      previewData.media.photos.forEach(url => URL.revokeObjectURL(url));
      previewData.media.musics.forEach(url => URL.revokeObjectURL(url));
    };
  }, [previewData.media.photos, previewData.media.musics]);

  const handleNext = () => {
    const errors = form.formState.errors;
    const values = form.getValues();
    if (activeStep === 0 && !selectedPlan) {
      toast({ title: 'Erro', description: 'Selecione um plano.', variant: 'destructive' });
      return;
    }
    if (activeStep === 1 && !values.template) {
      toast({ title: 'Erro', description: 'Selecione um template.', variant: 'destructive' });
      return;
    }
    if (activeStep === 2 && (!values.coupleName || !values.relationshipStartDate || errors.coupleName || errors.relationshipStartDate)) {
      form.trigger(['coupleName', 'relationshipStartDate']);
      return;
    }
    if (activeStep === 3 && (!values.message || errors.message)) {
      form.trigger('message');
      return;
    }
    if (activeStep === 5 && (!values.password || errors.password || !values.customUrl || errors.customUrl)) {
      form.trigger(['password', 'customUrl']);
      return;
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

  const onSubmit = async (values: FormValues) => {
    if (!user) {
      setIsAuthDialogOpen(true);
      toast({ title: 'Aviso', description: 'Faça login para continuar.', variant: 'destructive' });
      return;
    }
    if (!checkUserLimits()) return;

    setIsSubmitting(true);
    const customUrl = values.customUrl.toLowerCase().trim();
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
      const musicUrls = await Promise.all(
        musics.map(async (file, index) => {
          const { data, error } = await supabase.storage
            .from('media')
            .upload(`${customUrl}/musics/music-${index}-${Date.now()}.${file.name.split('.').pop()}`, file);
          if (error) throw error;
          return supabase.storage.from('media').getPublicUrl(data.path).data.publicUrl;
        })
      );
      const timelinePhotoUrls = await Promise.all(
        timelinePhotos.map(async (file, index) => {
          if (!file) return undefined;
          const { data, error } = await supabase.storage
            .from('media')
            .upload(`${customUrl}/timeline/photo-${index}-${Date.now()}.${file.name.split('.').pop()}`, file);
          if (error) throw error;
          return supabase.storage.from('media').getPublicUrl(data.path).data.publicUrl;
        })
      );

      const timelineWithPhotos = values.timeline?.map((moment, index) => ({
        ...moment,
        date: moment.date.toISOString(),
        photo: timelinePhotoUrls[index],
      }));

      const expirationDate = addMonths(new Date(), PLANS[selectedPlan].durationMonths);
      const finalSiteData = {
        custom_url: customUrl,
        user_id: user.id,
        form_data: {
          ...values,
          relationshipStartDate: values.relationshipStartDate.toISOString(),
          timeline: timelineWithPhotos,
        },
        plan: selectedPlan,
        media: { photos: photoUrls, musics: musicUrls, spotifyLink: values.spotifyLink },
        created_at: new Date().toISOString(),
        expiration_date: expirationDate.toISOString(),
        status: 'pending',
        template_type: values.template, // Salvar o template selecionado
        password: values.password,
      };

      const { data, error } = await supabase.from('sites').insert([finalSiteData]).select('id').single();
      if (error) {
        if (error.code === '23505') {
          toast({ title: 'Erro', description: 'Esta URL já está em uso.', variant: 'destructive' });
          return;
        }
        throw error;
      }

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
      label: 'Linha do Tempo',
      content: (
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-800">Linha do Tempo do Relacionamento</h2>
          <FormField
            control={form.control}
            name="timeline"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700">Momentos Especiais (Opcional)</FormLabel>
                <div className="space-y-4">
                  {field.value?.map((moment, index) => (
                    <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="text-lg font-medium text-gray-800">Momento {index + 1}</h3>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            const newTimeline = [...field.value];
                            newTimeline.splice(index, 1);
                            field.onChange(newTimeline);
                            setTimelinePhotos((prev) => prev.filter((_, i) => i !== index));
                          }}
                        >
                          Remover
                        </Button>
                      </div>
                      <div className="space-y-4">
                        <FormField
                          control={form.control}
                          name={`timeline.${index}.date`}
                          render={({ field: dateField }) => (
                            <FormItem className="flex flex-col">
                              <FormLabel className="text-gray-700">Data do Momento</FormLabel>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button variant="outline" className={cn('w-full text-left border-gray-300', !dateField.value && 'text-gray-500')}>
                                      <Calendar className="mr-2 h-4 w-4 text-pink-500" />
                                      {dateField.value ? format(dateField.value, 'PPP', { locale: ptBR }) : 'Selecione a data'}
                                    </Button>
                                  </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                  <CalendarComponent mode="single" selected={dateField.value} onSelect={dateField.onChange} initialFocus />
                                </PopoverContent>
                              </Popover>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`timeline.${index}.title`}
                          render={({ field: titleField }) => (
                            <FormItem>
                              <FormLabel className="text-gray-700">Título</FormLabel>
                              <FormControl>
                                <Input placeholder="Ex: Primeiro Encontro" className="rounded-md border-gray-300 focus:ring-pink-400" {...titleField} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`timeline.${index}.description`}
                          render={({ field: descField }) => (
                            <FormItem>
                              <FormLabel className="text-gray-700">Descrição</FormLabel>
                              <FormControl>
                                <Textarea placeholder="Descreva o momento..." className="rounded-md border-gray-300 focus:ring-pink-400" {...descField} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div>
                          <FormLabel className="text-gray-700">Foto (Opcional)</FormLabel>
                          <MediaUpload
                            type="image"
                            maxFiles={1}
                            maxSize={5}
                            onFilesChange={(files) => {
                              setTimelinePhotos((prev) => {
                                const newPhotos = [...prev];
                                newPhotos[index] = files[0];
                                return newPhotos;
                              });
                            }}
                            currentFiles={timelinePhotos[index] ? [timelinePhotos[index]] : []}
                            existingFiles={moment.photo ? [moment.photo] : []}
                            onRemoveExisting={() => {
                              setTimelinePhotos((prev) => {
                                const newPhotos = [...prev];
                                newPhotos[index] = undefined;
                                return newPhotos;
                              });
                              const newTimeline = [...field.value];
                              newTimeline[index].photo = undefined;
                              field.onChange(newTimeline);
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => field.onChange([...(field.value || []), { date: null, title: '', description: '', photo: undefined }])}
                    className="w-full border-pink-500 text-pink-500 hover:bg-pink-50"
                  >
                    Adicionar Momento
                  </Button>
                </div>
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
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-800">Resumo do Seu Card</h2>
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
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
          <p className="text-sm text-gray-500">Confira os detalhes acima antes de finalizar!</p>
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
                        Processando...
                      </span>
                    ) : activeStep < steps.length - 1 ? (
                      'Próximo'
                    ) : (
                      `Pagar e Criar (${PLANS[selectedPlan].price})`
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
                previewData.formData.template === 'light' ? (
                  <SiteTemplate
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

      {/* Modal de Autenticação */}
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
            <Button onClick={isLogin ? handleLogin : handleSignUp} disabled={authLoading} className="w-full bg-pink-600 hover:bg-pink-700">
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
