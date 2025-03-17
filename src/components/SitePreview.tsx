import { useState, useEffect, useRef } from 'react';
import { format, differenceInYears, differenceInMonths, differenceInDays, differenceInHours, differenceInMinutes, differenceInSeconds } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Heart, Play, Pause } from 'lucide-react';
import { motion } from 'framer-motion';

interface SitePreviewProps {
  formData: {
    coupleName: string;
    specialDate: Date;
    relationshipStartDate: Date;
    message: string;
  };
  plan: 'free' | 'basic' | 'premium';
  media: {
    photos: string[];
    videos: string[];
    musics: string[];
    spotifyLink?: string;
  };
  customUrl?: string;
}

const SitePreview = ({ formData, plan, media, customUrl = '' }: SitePreviewProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [mainPhotoIndex, setMainPhotoIndex] = useState(0);
  const [timeTogether, setTimeTogether] = useState({
    years: 0,
    months: 0,
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const audioRef = useRef<HTMLAudioElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const photos = media.photos.length > 0 ? media.photos : [
    'https://images.unsplash.com/photo-1494774157365-9e04c6720e47?ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80',
  ];
  const videos = media.videos;
  const musics = media.musics;
  const spotifyLink = media.spotifyLink;

  const formattedSpecialDate = formData.relationshipStartDate
    ? format(new Date(formData.relationshipStartDate), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
    : '';

  useEffect(() => {
    const calculateTimeTogether = () => {
      const startDate = new Date(formData.relationshipStartDate);
      const now = new Date();
      const years = differenceInYears(now, startDate);
      const months = differenceInMonths(now, startDate) % 12;
      const days = differenceInDays(now, startDate) % 30;
      const hours = differenceInHours(now, startDate) % 24;
      const minutes = differenceInMinutes(now, startDate) % 60;
      const seconds = differenceInSeconds(now, startDate) % 60;
      setTimeTogether({ years, months, days, hours, minutes, seconds });
    };
    calculateTimeTogether();
    const interval = setInterval(calculateTimeTogether, 1000);
    return () => clearInterval(interval);
  }, [formData.relationshipStartDate]);

  useEffect(() => {
    if (!spotifyLink && musics.length > 0 && audioRef.current) {
      audioRef.current.src = musics[0];
      if (isPlaying) audioRef.current.play().catch(() => {});
      else audioRef.current.pause();
    }
  }, [musics, isPlaying, spotifyLink]);

  useEffect(() => {
    if (videoRef.current && !videos.length) videoRef.current.pause();
  }, [videos]);

  const getSpotifyEmbedUrl = (link: string) => {
    if (!link) return '';
    const trackId = link.split('track/')[1]?.split('?')[0];
    return trackId ? `https://open.spotify.com/embed/track/${trackId}` : '';
  };

  const handleThumbnailClick = (index: number) => {
    setMainPhotoIndex(index);
  };

  return (
    <div className="min-h-screen w-full overflow-y-auto font-sans bg-gradient-to-br from-wine-50 to-gold-50">
      <div className="relative">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_80%,rgba(139,69,19,0.1)_0%,transparent_70%)]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            transition={{ duration: 2 }}
          />
          {[...Array(3)].map((_, idx) => (
            <Heart
              key={idx}
              className={`absolute h-6 w-6 text-red-400/20 animate-float-${idx + 1}`}
              style={{
                top: `${Math.random() * 80 + 10}%`,
                left: `${Math.random() * 80 + 10}%`,
              }}
            />
          ))}
        </div>

        {!spotifyLink && musics.length > 0 && <audio ref={audioRef} loop />}
        
        <motion.div
          className="max-w-4xl mx-auto py-12 px-6 text-center text-gray-800"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            className="mb-12 relative"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Heart className="absolute -top-8 left-1/2 -translate-x-1/2 h-12 w-12 text-wine-600 animate-pulse" />
            <h1 className="text-4xl md:text-5xl font-serif text-wine-800 font-medium tracking-wide">
              {formData.coupleName}
            </h1>
            <p className="text-lg md:text-xl text-gold-600 mt-2 font-light">
              Início: {formattedSpecialDate}
            </p>
          </motion.div>

          <motion.div
            className="mb-12 p-6 bg-white rounded-lg shadow-lg border border-gold-100 max-w-2xl mx-auto"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <h2 className="text-xl md:text-2xl text-wine-800 font-medium mb-4">Tempo Juntos</h2>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
              {[
                { value: timeTogether.years, label: 'Anos' },
                { value: timeTogether.months, label: 'Meses' },
                { value: timeTogether.days, label: 'Dias' },
                { value: timeTogether.hours, label: 'Hrs' },
                { value: timeTogether.minutes, label: 'Min' },
                { value: timeTogether.seconds, label: 'Seg' },
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  className="p-2 bg-gold-50 rounded text-center hover:bg-gold-100 transition-colors"
                  whileHover={{ scale: 1.05 }}
                >
                  <p className="text-lg md:text-xl font-semibold text-wine-800">{item.value}</p>
                  <p className="text-xs text-gold-600">{item.label}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            className="mb-12 p-6 bg-white rounded-lg shadow-lg border border-gold-100 max-w-2xl mx-auto"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <h2 className="text-xl md:text-2xl text-wine-800 font-medium mb-4">Nossa Mensagem</h2>
            <p className="text-lg text-gray-700 italic">"{formData.message}"</p>
          </motion.div>

          {/* Galeria de Fotos */}
          <motion.div
            className="mb-12 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <h2 className="text-xl md:text-2xl text-wine-800 font-medium mb-4">Nossas Memórias</h2>
            {/* Foto Principal */}
            <motion.img
              key={mainPhotoIndex}
              src={photos[mainPhotoIndex]}
              alt={`Foto principal ${mainPhotoIndex + 1}`}
              className="w-full h-auto max-h-80 object-cover rounded-lg shadow-md border border-gold-200 mb-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            />
            {/* Miniaturas */}
            {photos.length > 1 && (
              <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                {photos.map((photo, index) => (
                  <motion.img
                    key={index}
                    src={photo}
                    alt={`Miniatura ${index + 1}`}
                    className={`w-full h-20 object-cover rounded-md border cursor-pointer ${
                      index === mainPhotoIndex ? 'border-wine-700 border-2' : 'border-gold-200'
                    }`}
                    onClick={() => handleThumbnailClick(index)}
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.2 }}
                  />
                ))}
              </div>
            )}
          </motion.div>

          {/* Resumo do Plano */}
          <motion.div
            className="mb-12 p-6 bg-white rounded-lg shadow-lg border border-gold-100 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.0 }}
          >
            <h2 className="text-xl md:text-2xl text-wine-800 font-medium mb-4">Resumo do Seu Plano</h2>
            {plan === 'basic' ? (
              <p className="text-lg text-gray-700">
                Com o <span className="font-semibold text-wine-800">Plano Básico</span>, você terá acesso ao seu site personalizado por <span className="font-semibold">6 meses</span>, incluindo até <span className="font-semibold">5 fotos</span>, <span className="font-semibold">1 vídeo</span> e <span className="font-semibold">1 música</span>.
              </p>
            ) : plan === 'premium' ? (
              <p className="text-lg text-gray-700">
                Com o <span className="font-semibold text-wine-800">Plano Premium</span>, você terá acesso ao seu site personalizado por <span className="font-semibold">12 meses</span>, incluindo até <span className="font-semibold">8 fotos</span>, <span className="font-semibold">1 vídeo</span> e <span className="font-semibold">1 música</span>. Além disso, você poderá <span className="font-semibold">baixar um card digital exclusivo com QR Code</span> para compartilhar com seu amor!
              </p>
            ) : (
              <p className="text-lg text-gray-700">
                Você está na versão gratuita, que inclui uma prévia limitada do site. Escolha um plano para personalizar e compartilhar seu site!
              </p>
            )}
          </motion.div>

          {/* Vídeo */}
          {videos.length > 0 && (
            <motion.div
              className="mb-12 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.2 }}
            >
              <video ref={videoRef} controls className="w-full rounded-lg shadow-md border border-gold-200">
                <source src={videos[0]} type="video/mp4" />
              </video>
            </motion.div>
          )}
        </motion.div>
      </div>

      {spotifyLink ? (
        <motion.div
          className="mb-12 max-w-md mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.4 }}
        >
          <iframe
            src={getSpotifyEmbedUrl(spotifyLink)}
            width="100%"
            height="80"
            frameBorder="0"
            allowTransparency={true}
            allow="encrypted-media"
            className="rounded-lg shadow-md border border-gold-200"
          />
        </motion.div>
      ) : musics.length > 0 && (
        <motion.div
          className="fixed bottom-8 right-8 z-50 flex items-center gap-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.4 }}
        >
          <motion.div
            className="bg-white rounded-full shadow-md p-2 flex items-center gap-2 border border-gold-200"
            whileHover={{ scale: 1.05 }}
          >
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-2 bg-wine-700 text-white rounded-full hover:bg-wine-800 transition-all"
            >
              {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
            </motion.button>
            <span className="text-sm text-wine-800">Nossa Música</span>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default SitePreview;
