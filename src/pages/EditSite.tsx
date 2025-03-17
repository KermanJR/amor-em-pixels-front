import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { format, addMonths, addYears } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import MediaUpload from '@/components/MediaUpload';
import SitePreview from '@/components/SitePreview';
import { supabase } from '../supabaseClient';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import QRCode from 'react-qr-code';
import jsPDF from 'jspdf';

const PLANS = {
  free: { sites: 1, photos: 3, videos: 1, musics: 1, durationMonths: 3 },
  basic: { sites: 3, photos: 5, videos: 2, musics: 1, durationMonths: 12 },
  premium: { sites: 10, photos: 10, videos: 3, musics: 3, durationMonths: 24 },
};

const formSchema = z.object({
  coupleName: z.string().min(3, { message: 'Nome do casal deve ter pelo menos 3 caracteres' }).max(50),
  specialDate: z.date().nullable().refine((val) => val !== null, {
    message: 'Por favor, selecione uma data',
  }),
  relationshipStartDate: z.date().nullable().refine((val) => val !== null, {
    message: 'Por favor, selecione a data de início do relacionamento',
  }),
  message: z.string().min(10, { message: 'Mensagem deve ter pelo menos 10 caracteres' }).max(500),
});

type FormValues = z.infer<typeof formSchema>;

const EditSite = () => {
  const { siteId } = useParams<{ siteId: string }>();
  const navigate = useNavigate();
  const [photos, setPhotos] = useState<File[]>([]);
  const [videos, setVideos] = useState<File[]>([]);
  const [musics, setMusics] = useState<File[]>([]);
  const [existingPhotos, setExistingPhotos] = useState<string[]>([]);
  const [existingVideos, setExistingVideos] = useState<string[]>([]);
  const [existingMusics, setExistingMusics] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'free' | 'basic' | 'premium'>('free');
  const [user, setUser] = useState<any>(null);
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [siteData, setSiteData] = useState<any>(null);
  const [customUrl, setCustomUrl] = useState<string>('');
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      coupleName: '',
      specialDate: null,
      relationshipStartDate: null,
      message: '',
    },
  });

  useEffect(() => {
    const checkUserAndLoadSite = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (!user) {
        setIsAuthDialogOpen(true);
        return;
      }

      const { data: site, error } = await supabase
        .from('sites')
        .select('*')
        .eq('id', siteId)
        .eq('user_id', user.id)
        .single();

      if (error || !site) {
        toast({ title: 'Erro', description: 'Site não encontrado.', variant: 'destructive' });
        navigate('/dashboard');
        return;
      }

      console.log('Site data from Supabase:', site);
      console.log('Special Date:', site.form_data.specialDate);
      console.log('Relationship Start Date:', site.form_data.relationshipStartDate);

      setSelectedPlan(site.plan);
      setCustomUrl(site.custom_url);
      setExistingPhotos(site.media.photos || []);
      setExistingVideos(site.media.videos || []);
      setExistingMusics(site.media.musics || []);

      const specialDate = site.form_data.specialDate
        ? new Date(site.form_data.specialDate)
        : null;
      const relationshipStartDate = site.form_data.relationshipStartDate
        ? new Date(site.form_data.relationshipStartDate)
        : null;

      const isValidSpecialDate = specialDate && !isNaN(specialDate.getTime());
      const isValidRelationshipStartDate = relationshipStartDate && !isNaN(relationshipStartDate.getTime());

      form.reset({
        coupleName: site.form_data.coupleName || '',
        specialDate: isValidSpecialDate ? specialDate : null,
        relationshipStartDate: isValidRelationshipStartDate ? relationshipStartDate : null,
        message: site.form_data.message || '',
      });
    };

    checkUserAndLoadSite();

    const { data: authListener } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
      if (!session?.user) setIsAuthDialogOpen(true);
    });

    return () => authListener.subscription.unsubscribe();
  }, [siteId, navigate, toast, form]);

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
      return;
    }

    const planLimits = getPlanLimits();
    const totalPhotos = photos.length + existingPhotos.length;
    const totalVideos = videos.length + existingVideos.length;
    const totalMusics = musics.length + existingMusics.length;

    if (totalPhotos > planLimits.photos || totalVideos > planLimits.videos || totalMusics > planLimits.musics) {
      toast({
        title: 'Limite Excedido',
        description: `Seu plano (${selectedPlan}) suporta até ${planLimits.photos} fotos, ${planLimits.videos} vídeos e ${planLimits.musics} músicas.`,
        variant: 'destructive',
      });
      return;
    }

    const previewData = {
      formData: { ...values },
      plan: selectedPlan,
      media: {
        photos: [...existingPhotos, ...photos.map(file => URL.createObjectURL(file))],
        videos: [...existingVideos, ...videos.map(file => URL.createObjectURL(file))],
        musics: [...existingMusics, ...musics.map(file => URL.createObjectURL(file))],
      },
    };

    setSiteData(previewData);
    setIsPreviewModalOpen(true);
  };

  const updateSite = async () => {
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

      const expirationDate = selectedPlan === 'free' ? addMonths(new Date(), PLANS.free.durationMonths) : selectedPlan === 'basic' ? addYears(new Date(), 1) : addYears(new Date(), 2);

      const specialDate = siteData.formData.specialDate instanceof Date && !isNaN(siteData.formData.specialDate.getTime())
        ? siteData.formData.specialDate.toISOString()
        : new Date().toISOString();
      const relationshipStartDate = siteData.formData.relationshipStartDate instanceof Date && !isNaN(siteData.formData.relationshipStartDate.getTime())
        ? siteData.formData.relationshipStartDate.toISOString()
        : new Date().toISOString();

      const updatedSiteData = {
        custom_url: customUrl,
        user_id: user.id,
        form_data: {
          ...siteData.formData,
          specialDate,
          relationshipStartDate,
        },
        plan: selectedPlan,
        media: {
          photos: [...existingPhotos, ...photoUrls],
          videos: [...existingVideos, ...videoUrls],
          musics: [...existingMusics, ...musicUrls],
        },
        expiration_date: expirationDate.toISOString(),
      };

      const { error } = await supabase
        .from('sites')
        .update(updatedSiteData)
        .eq('id', siteId);

      if (error) {
        if (error.code === '23505') {
          toast({ title: 'Erro', description: 'Esta URL já está em uso.', variant: 'destructive' });
          return;
        }
        throw error;
      }

      toast({ title: 'Sucesso', description: 'Site atualizado com sucesso!' });
      navigate('/dashboard');
    } catch (error) {
      toast({ title: 'Erro', description: 'Erro ao atualizar o site.', variant: 'destructive' });
      console.error('Error updating site:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveMedia = async (type: 'photos' | 'videos' | 'musics', url: string) => {
    setIsSubmitting(true);
    try {
      const path = url.split('/media/')[1];
      const { error: deleteError } = await supabase.storage.from('media').remove([path]);
      if (deleteError) throw deleteError;

      if (type === 'photos') {
        setExistingPhotos(existingPhotos.filter(photo => photo !== url));
      } else if (type === 'videos') {
        setExistingVideos(existingVideos.filter(video => video !== url));
      } else if (type === 'musics') {
        setExistingMusics(existingMusics.filter(music => music !== url));
      }

      toast({ title: 'Sucesso', description: 'Arquivo removido com sucesso!' });
    } catch (error) {
      toast({ title: 'Erro', description: 'Falha ao remover o arquivo.', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const generatePDF = async () => {
    const doc = new jsPDF();
    doc.text('Prévia do Site', 10, 10);
    doc.save(`${customUrl}-preview.pdf`);
  };

  const planLimits = getPlanLimits();

  return (
    <>
      <div className="max-w-3xl mx-auto py-12 px-4">
        <Navbar />
        <h1 className="text-3xl font-bold mb-6 mt-10 text-center">Editar seu site</h1>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onPreview)} className="space-y-8">
            <div className="text-sm text-gray-600 mb-4">
              Plano atual: {selectedPlan === 'free' ? 'Gratuito' : selectedPlan === 'basic' ? 'Básico' : 'Premium'}
            </div>

            <FormField
              control={form.control}
              name="coupleName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Casal</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: João & Maria" {...field} />
                    </FormControl>
                  <FormMessage/>
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
              existingFiles={existingPhotos}
              onRemoveExisting={(url) => handleRemoveMedia('photos', url)}
              freeTier={selectedPlan === 'free'}
            />
            <MediaUpload
              type="video"
              maxFiles={planLimits.videos}
              maxSize={30}
              onFilesChange={setVideos}
              currentFiles={videos}
              existingFiles={existingVideos}
              onRemoveExisting={(url) => handleRemoveMedia('videos', url)}
              freeTier={selectedPlan === 'free'}
            />
            <MediaUpload
              type="audio"
              maxFiles={planLimits.musics}
              maxSize={10}
              onFilesChange={setMusics}
              currentFiles={musics}
              existingFiles={existingMusics}
              onRemoveExisting={(url) => handleRemoveMedia('musics', url)}
              freeTier={selectedPlan === 'free'}
            />

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Carregando...' : 'Atualizar e Visualizar'}
            </Button>
          </form>
        </Form>

        <Dialog open={isAuthDialogOpen} onOpenChange={setIsAuthDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{isLogin ? 'Faça Login' : 'Cadastre-se'}</DialogTitle>
              <DialogDescription>{isLogin ? 'Entre para editar seu Card Digital.' : 'Crie uma conta para começar.'}</DialogDescription>
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
                <DialogDescription>Confira e personalize a URL antes de atualizar!</DialogDescription>
              </DialogHeader>
              <div className="space-y-6">
                <div className="border rounded-lg p-4 bg-gray-50">
                  <SitePreview
                    formData={siteData.formData}
                    plan={siteData.plan}
                    media={siteData.media}
                    onDownloadPDF={generatePDF}
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
                <Button variant="outline" onClick={() => setIsPreviewModalOpen(false)}>Voltar</Button>
                <Button onClick={updateSite} disabled={isSubmitting || !customUrl}>
                  {isSubmitting ? 'Atualizando...' : 'Salvar Alterações'}
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

export default EditSite;
