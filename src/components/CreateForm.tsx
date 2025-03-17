import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Calendar, Sparkles } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import MediaUpload from './MediaUpload';
import TemplatePreview, { TemplateType } from './TemplatePreview';

const MAX_IMAGES_FREE = 3;
const MAX_VIDEOS_FREE = 1;
const MAX_MUSIC_FREE = 1;

const MAX_IMAGES_PREMIUM = 10;
const MAX_VIDEOS_PREMIUM = 3;
const MAX_MUSIC_PREMIUM = 3;

const formSchema = z.object({
  coupleName: z
    .string()
    .min(3, { message: 'Nome do casal deve ter pelo menos 3 caracteres' })
    .max(50, { message: 'Nome do casal não pode ter mais de 50 caracteres' }),
  specialDate: z.date({ required_error: 'Por favor, selecione uma data' }),
  message: z
    .string()
    .min(10, { message: 'Mensagem deve ter pelo menos 10 caracteres' })
    .max(500, { message: 'Mensagem não pode ter mais de 500 caracteres' }),
  favoriteMemory: z.string().max(300, { message: 'Memória favorita não pode ter mais de 300 caracteres' }).optional(),
  futureDreams: z.string().max(300, { message: 'Sonhos para o futuro não podem ter mais de 300 caracteres' }).optional(),
  songTitle: z.string().max(100, { message: 'Título da música não pode ter mais de 100 caracteres' }).optional(),
});

type FormValues = z.infer<typeof formSchema>;

const CreateForm = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType>('classic');
  const [photos, setPhotos] = useState<File[]>([]);
  const [videos, setVideos] = useState<File[]>([]);
  const [musics, setMusics] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'free' | 'premium'>('free');
  
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      coupleName: '',
      message: '',
      favoriteMemory: '',
      futureDreams: '',
      songTitle: '',
    },
  });
  
  const maxPhotos = selectedPlan === 'premium' ? MAX_IMAGES_PREMIUM : MAX_IMAGES_FREE;
  const maxVideos = selectedPlan === 'premium' ? MAX_VIDEOS_PREMIUM : MAX_VIDEOS_FREE;
  const maxMusic = selectedPlan === 'premium' ? MAX_MUSIC_PREMIUM : MAX_MUSIC_FREE;
  
  const onSubmit = (values: FormValues) => {
    setIsSubmitting(true);
    
    setTimeout(() => {
      navigate('/preview', { 
        state: {
          formData: values,
          templateType: selectedTemplate,
          plan: selectedPlan,
          media: {
            photos: photos.map(file => URL.createObjectURL(file)),
            videos: videos.map(file => URL.createObjectURL(file)),
            musics: musics.map(file => URL.createObjectURL(file)),
          }
        } 
      });
      
      setIsSubmitting(false);
    }, 1000);
  };
  
  return (
    <div className="max-w-3xl mx-auto ">
      {/* Plan Selection Tabs */}
      <div className="mb-8">
        <h3 className="text-base font-medium mb-3">Escolha seu plano</h3>
        <Tabs 
          defaultValue="free" 
          className="w-full" 
          onValueChange={(value) => setSelectedPlan(value as 'free' | 'premium')}
        >
          <TabsList className="grid grid-cols-2 mb-2">
        
            <TabsTrigger value="premium" className="relative">
              Premium
              <Sparkles className="h-3.5 w-3.5 ml-1.5 text-amber-500" />
            </TabsTrigger>
          </TabsList>
          
         
          
          <TabsContent value="premium" className="p-4 border rounded-lg bg-gradient-to-r from-amber-50 to-amber-100">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">
                  Plano Premium
                  <span className="ml-1.5 inline-block bg-gradient-to-r from-amber-500 to-yellow-500 text-white text-xs px-2 py-0.5 rounded-full">R$ 29,90</span>
                </h4>
                <p className="text-sm text-gray-700 mb-3">
                  Desbloqueie recursos exclusivos e personalizações avançadas.
                </p>
              </div>
            </div>
            <ul className="text-sm text-gray-700 space-y-1">
              <li className="flex items-start">
                <div className="flex-shrink-0 h-5 w-5 text-green-600 mr-1.5">
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span>Até {MAX_IMAGES_PREMIUM} fotos</span>
              </li>
              <li className="flex items-start">
                <div className="flex-shrink-0 h-5 w-5 text-green-600 mr-1.5">
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span>Até {MAX_VIDEOS_PREMIUM} vídeos</span>
              </li>
              <li className="flex items-start">
                <div className="flex-shrink-0 h-5 w-5 text-green-600 mr-1.5">
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span>Até {MAX_MUSIC_PREMIUM} músicas</span>
              </li>
              <li className="flex items-start">
                <div className="flex-shrink-0 h-5 w-5 text-green-600 mr-1.5">
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span>Todos os templates premium</span>
              </li>
              <li className="flex items-start">
                <div className="flex-shrink-0 h-5 w-5 text-green-600 mr-1.5">
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span>Animações exclusivas</span>
              </li>
              <li className="flex items-start">
                <div className="flex-shrink-0 h-5 w-5 text-green-600 mr-1.5">
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span>Sem marca d'água</span>
              </li>
            </ul>
          </TabsContent>
        </Tabs>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="coupleName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base">Nome do Casal</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Ex: João & Maria" 
                        {...field} 
                        className="h-12"
                      />
                    </FormControl>
                    <FormDescription>
                      Como vocês são conhecidos juntos.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="specialDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="text-base">Data Especial</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "h-12 w-full justify-start text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            <Calendar className="mr-2 h-4 w-4" />
                            {field.value ? (
                              format(field.value, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
                            ) : (
                              <span>Selecione uma data</span>
                            )}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <CalendarComponent
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormDescription>
                      Data do namoro, casamento ou momento especial.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base">Mensagem de Amor</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Escreva uma mensagem especial para seu amor..."
                      className="min-h-[120px] resize-y"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Máximo de 500 caracteres
                    <span className="ml-2 text-gray-500">
                      {field.value.length}/500
                    </span>
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Campos Premium */}
            {selectedPlan === 'premium' && (
              <div className="space-y-6 border-t pt-6">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <Sparkles className="h-5 w-5 text-amber-500 mr-2" />
                  Personalizações Premium
                </h3>

                <FormField
                  control={form.control}
                  name="favoriteMemory"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base">Memória Favorita</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Qual é a sua memória favorita com seu amor?"
                          className="min-h-[100px] resize-y"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Máximo de 300 caracteres ({field.value?.length || 0}/300)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="futureDreams"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base">Sonhos para o Futuro</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Quais são seus sonhos juntos?"
                          className="min-h-[100px] resize-y"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Máximo de 300 caracteres ({field.value?.length || 0}/300)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="songTitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base">Título da Música Especial</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Qual é a música que define vocês?"
                          className="h-12"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Máximo de 100 caracteres ({field.value?.length || 0}/100)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}
            
            <div className="space-y-8">
              <MediaUpload
                type="image"
                maxFiles={maxPhotos}
                maxSize={5}
                onFilesChange={setPhotos}
                currentFiles={photos}
                freeTier={selectedPlan === 'free'}
              />
              
              <MediaUpload
                type="video"
                maxFiles={maxVideos}
                maxSize={30}
                onFilesChange={setVideos}
                currentFiles={videos}
                freeTier={selectedPlan === 'free'}
              />
              
              <MediaUpload
                type="audio"
                maxFiles={maxMusic}
                maxSize={10}
                onFilesChange={setMusics}
                currentFiles={musics}
                freeTier={selectedPlan === 'free'}
              />
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-medium mb-2">Escolha o Template</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Selecione o estilo que melhor combina com a personalidade do casal.
                  {selectedPlan === 'free' && (
                    <span className="block mt-1 text-amber-600">
                      Apenas o template Clássico é gratuito. 
                      <button 
                        type="button" 
                        className="text-love-500 hover:underline ml-1"
                        onClick={() => setSelectedPlan('premium')}
                      >
                        Atualize para premium
                      </button> 
                      para desbloquear todos os templates!
                    </span>
                  )}
                </p>
              </div>
              
              <TemplatePreview
                selectedTemplate={selectedTemplate}
                onChange={(template) => {
                  if (selectedPlan === 'free' && template !== 'classic') {
                    toast({
                      title: "Template premium",
                      description: "Atualize para o plano premium para usar este template.",
                      variant: "destructive"
                    });
                    return;
                  }
                  setSelectedTemplate(template);
                }}
              />
            </div>
          </div>
          
          <div className="pt-4 border-t">
            <div className="flex flex-col sm:flex-row gap-4 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  toast({
                    title: "Rascunho salvo",
                    description: "Seu rascunho foi salvo com sucesso.",
                  });
                }}
              >
                Salvar Rascunho
              </Button>
              
              <Button 
                type="submit" 
                className="bg-love-600 hover:bg-love-700"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="mr-2">Processando</span>
                    <span className="flex space-x-1">
                      <span className="loading-dot"></span>
                      <span className="loading-dot"></span>
                      <span className="loading-dot"></span>
                    </span>
                  </>
                ) : (
                  'Visualizar Site'
                )}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default CreateForm;