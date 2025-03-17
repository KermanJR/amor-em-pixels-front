// src/pages/Success.tsx
import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '../supabaseClient';
import { Button } from '@/components/ui/button';

const Success = () => {
  const [searchParams] = useSearchParams();
  const [isCreating, setIsCreating] = useState(false);
  const [siteUrl, setSiteUrl] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const { photos, videos, musics, siteData, selectedTemplate, customUrl } = JSON.parse(localStorage.getItem('siteData') || '{}');

  const createSite = async () => {
    if (!customUrl || !siteData) {
      toast({
        title: 'Erro',
        description: 'Dados do site não encontrados. Tente criar novamente.',
        variant: 'destructive',
      });
      navigate('/create');
      return;
    }

    setIsCreating(true);
    try {
      const photoUrls = await Promise.all(
        photos.map(async (file: File, index: number) => {
          const { data, error } = await supabase.storage
            .from('media')
            .upload(`${customUrl}/photos/photo-${index}-${Date.now()}.${file.name.split('.').pop()}`, file, {
              cacheControl: '3600',
              upsert: false,
            });
          if (error) throw error;
          return supabase.storage.from('media').getPublicUrl(data.path).data.publicUrl;
        })
      );

      const videoUrls = await Promise.all(
        videos.map(async (file: File, index: number) => {
          const { data, error } = await supabase.storage
            .from('media')
            .upload(`${customUrl}/videos/video-${index}-${Date.now()}.${file.name.split('.').pop()}`, file, {
              cacheControl: '3600',
              upsert: false,
            });
          if (error) throw error;
          return supabase.storage.from('media').getPublicUrl(data.path).data.publicUrl;
        })
      );

      const musicUrls = await Promise.all(
        musics.map(async (file: File, index: number) => {
          const { data, error } = await supabase.storage
            .from('media')
            .upload(`${customUrl}/musics/music-${index}-${Date.now()}.${file.name.split('.').pop()}`, file, {
              cacheControl: '3600',
              upsert: false,
            });
          if (error) throw error;
          return supabase.storage.from('media').getPublicUrl(data.path).data.publicUrl;
        })
      );

      const finalSiteData = {
        custom_url: customUrl,
        user_id: (await supabase.auth.getUser()).data.user?.id,
        form_data: {
          coupleName: siteData.formData.coupleName,
          specialDate: siteData.formData.specialDate.toISOString(),
          message: siteData.formData.message,
          favoriteMemory: siteData.formData.favoriteMemory || '',
          futureDreams: siteData.formData.futureDreams || '',
          songTitle: siteData.formData.songTitle || '',
        },
        template_type: selectedTemplate,
        plan: 'premium',
        media: {
          photos: photoUrls,
          videos: videoUrls,
          musics: musicUrls,
        },
      };

      const { error } = await supabase.from('sites').insert([finalSiteData]);
      if (error) {
        if (error.code === '23505') {
          throw new Error('Esta URL já está em uso. Escolha outra.');
        }
        throw error;
      }

      const finalUrl = `${window.location.origin}/${customUrl}`;
      setSiteUrl(finalUrl);
      toast({
        title: 'Sucesso',
        description: 'Seu site foi criado com sucesso!',
      });
      localStorage.removeItem('siteData'); // Limpa os dados temporários
    } catch (error) {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao criar o site após pagamento.',
        variant: 'destructive',
      });
      console.error(error);
    } finally {
      setIsCreating(false);
    }
  };

  useEffect(() => {
    const customUrlFromParams = searchParams.get('custom_url');
    if (customUrlFromParams && !isCreating) {
      createSite();
    }
  }, [searchParams]);

  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-6">Pagamento Concluído!</h1>
      {isCreating ? (
        <p>Criando seu site, por favor aguarde...</p>
      ) : siteUrl ? (
        <div className="space-y-4">
          <p>Seu site foi criado com sucesso!</p>
          <p>
            Acesse em:{' '}
            <a href={siteUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
              {siteUrl}
            </a>
          </p>
          <div className="flex gap-4">
            <Button onClick={() => window.open(siteUrl, '_blank')}>
              Visitar Site
            </Button>
            <Button variant="outline" onClick={() => navigate('/create')}>
              Criar Outro
            </Button>
          </div>
        </div>
      ) : (
        <p>Ocorreu um erro. Tente novamente.</p>
      )}
    </div>
  );
};

export default Success;