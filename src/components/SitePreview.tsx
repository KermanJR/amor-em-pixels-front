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

const SitePreview = ({ formData, plan, media, customUrl }: SitePreviewProps) => {
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
    <div className="min-h-screen w-full overflow-y-auto font-sans bg-black">
  {/* Efeito de partículas sofisticado */}
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {[...Array(200)].map((_, idx) => (
      <div
        key={idx}
        className="absolute w-1 h-1 bg-white rounded-full animate-float"
        style={{
          top: `${Math.random() * 100}%`,
          left: `${Math.random() * 100}%`,
          animationDelay: `${Math.random() * 5}s`,
          animationDuration: `${Math.random() * 10 + 5}s`,
          opacity: `${Math.random() * 0.5 + 0.2}`,
        }}
      />
    ))}
  </div>

  {/* Gradiente premium */}
  <motion.div
    className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05)_0%,rgba(0,0,0,0)_70%]"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 2 }}
  />

  {/* Conteúdo principal */}
  <motion.div
    className="relative max-w-4xl mx-auto py-20 px-6 text-center text-white"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.8 }}
  >
    {/* Cabeçalho */}
    <motion.div
      className="mb-16 relative"
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.2 }}
    >
      <div className="absolute -top-12 left-1/2 -translate-x-1/2 h-16 w-16 bg-gradient-to-br from-gold-500 to-gold-700 rounded-full animate-pulse shadow-gold" />
      <h1 className="text-5xl md:text-6xl font-serif bg-gradient-to-br from-gold-400 to-gold-600 bg-clip-text font-medium tracking-wide">
        {formData.coupleName}
      </h1>
      <p className="text-xl md:text-2xl text-gray-300 mt-4 font-light">
        Desde {formattedSpecialDate}
      </p>
    </motion.div>

    {/* Tempo Juntos */}
    <motion.div
      className="mb-16 p-8 bg-gradient-to-br from-black via-gray-900 to-black rounded-xl shadow-2xl border border-gray-800 max-w-2xl mx-auto"
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.4 }}
    >
      <h2 className="text-2xl md:text-3xl text-gold-400 font-medium mb-6">Tempo Juntos</h2>
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
            className="p-4 bg-gray-800 rounded-lg text-center hover:bg-gray-700 transition-colors"
            whileHover={{ scale: 1.05 }}
          >
            <p className="text-2xl md:text-3xl font-semibold text-gold-400">{item.value}</p>
            <p className="text-sm text-gray-300">{item.label}</p>
          </motion.div>
        ))}
      </div>
    </motion.div>

    {/* Nossa Mensagem */}
    <motion.div
      className="mb-16 p-8 bg-gradient-to-br from-black via-gray-900 to-black rounded-xl shadow-2xl border border-gray-800 max-w-2xl mx-auto"
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.6 }}
    >
    
      <p className="text-xl text-gray-200 italic font-light">"{formData.message}"</p>
    </motion.div>

    {/* Galeria de Fotos */}
    <motion.div
      className="mb-16 max-w-3xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.8 }}
    >
      <h2 className="text-2xl md:text-3xl text-gold-400 font-medium mb-6">Nossas Memórias</h2>
      {/* Foto Principal */}
      <motion.img
        key={mainPhotoIndex}
        src={photos[mainPhotoIndex]}
        alt={`Foto principal ${mainPhotoIndex + 1}`}
        className="w-full h-auto max-h-96 object-cover rounded-xl shadow-2xl border border-gray-800 mb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      />
      {/* Miniaturas */}
      {photos.length > 1 && (
        <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
          {photos.map((photo, index) => (
            <motion.img
              key={index}
              src={photo}
              alt={`Miniatura ${index + 1}`}
              className={`w-full h-24 object-cover rounded-lg border cursor-pointer transition-all ${
                index === mainPhotoIndex ? 'border-gold-500 border-2' : 'border-gray-800'
              }`}
              onClick={() => handleThumbnailClick(index)}
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            />
          ))}
        </div>
      )}
    </motion.div>

    {/* Vídeo */}
    {videos.length > 0 && (
      <motion.div
        className="mb-16 max-w-2xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 1.0 }}
      >
        <video ref={videoRef} controls className="w-full rounded-xl shadow-2xl border border-gray-800">
          <source src={videos[0]} type="video/mp4" />
        </video>
      </motion.div>
    )}
  </motion.div>

  {/* Spotify ou Música */}
  {spotifyLink ? (
    <motion.div
      className="mb-16 max-w-md mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 1.2 }}
    >
      <iframe
        src={getSpotifyEmbedUrl(spotifyLink)}
        width="100%"
        height="80"
        frameBorder="0"
        allowTransparency={true}
        allow="encrypted-media"
        className="rounded-xl shadow-2xl border border-gray-800"
      />
    </motion.div>
  ) : musics.length > 0 && (
    <motion.div
      className="fixed bottom-8 right-8 z-50 flex items-center gap-3"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 1.2 }}
    >
      <motion.div
        className="bg-gradient-to-br from-black via-gray-900 to-black rounded-full shadow-2xl p-3 flex items-center gap-3 border border-gray-800"
        whileHover={{ scale: 1.05 }}
      >
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsPlaying(!isPlaying)}
          className="p-3 bg-gold-500 text-white rounded-full hover:bg-gold-600 transition-all"
        >
          {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
        </motion.button>
        <span className="text-sm text-gold-400">Nossa Música</span>
      </motion.div>
    </motion.div>
  )}
</div>
  );
};

export default SitePreview;
