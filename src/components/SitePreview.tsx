import { useState, useEffect, useRef } from 'react';
import { format, differenceInYears, differenceInMonths, differenceInDays, differenceInHours, differenceInMinutes, differenceInSeconds } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Heart, Play, Pause, Download, Flower2 } from 'lucide-react';
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
  onDownloadPDF?: () => void;
}

const SitePreview = ({ formData, plan, media, customUrl = '', onDownloadPDF }: SitePreviewProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
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

  const handleNextPhoto = () => setCurrentPhotoIndex((prev) => (prev + 1) % photos.length);
  const handlePrevPhoto = () => setCurrentPhotoIndex((prev) => (prev - 1 + photos.length) % photos.length);

  return (
    <div className="relative min-h-screen w-full overflow-y-auto font-sans bg-gradient-to-br from-pink-50 via-rose-100 to-purple-100">
      {!spotifyLink && musics.length > 0 && <audio ref={audioRef} loop />}
      
      <motion.div
        className="relative z-10 max-w-4xl mx-auto py-20 px-6 text-center text-gray-800"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
      >
        {/* Header */}
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="mb-16"
        >
          <h1 className="text-5xl md:text-7xl font-[GreatVibes] text-rose-600 drop-shadow-md">
            {formData.coupleName}
          </h1>
          <p className="text-lg md:text-xl font-light text-rose-500 mt-4">
            {formattedSpecialDate}
          </p>
        </motion.div>

        {/* Time Together */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mb-16 bg-white/80 p-8 rounded-3xl shadow-lg max-w-3xl mx-auto border border-rose-200"
        >
          <h2 className="text-2xl md:text-3xl font-[GreatVibes] text-rose-600 mb-6">Nosso Tempo Juntos</h2>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
            {[
              { value: timeTogether.years, label: 'Anos' },
              { value: timeTogether.months, label: 'Meses' },
              { value: timeTogether.days, label: 'Dias' },
              { value: timeTogether.hours, label: 'Horas' },
              { value: timeTogether.minutes, label: 'Minutos' },
              { value: timeTogether.seconds, label: 'Segundos' },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                className="p-4 bg-rose-100/50 rounded-xl"
                whileHover={{ scale: 1.05, backgroundColor: '#ffe4e6' }}
                transition={{ duration: 0.2 }}
              >
                <p className="text-xl md:text-2xl font-semibold text-rose-600">{item.value}</p>
                <p className="text-sm text-rose-400">{item.label}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Message */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.9 }}
          className="mb-16 bg-white/80 p-8 rounded-3xl shadow-lg max-w-2xl mx-auto border border-rose-200"
        >
          <Heart className="h-8 w-8 md:h-10 md:w-10 text-rose-500 mx-auto mb-4 animate-pulse" />
          <p className="text-xl md:text-2xl font-[GreatVibes] text-rose-600 italic leading-relaxed">
            "{formData.message}"
          </p>
          <p className="mt-4 text-base md:text-lg font-light text-rose-500">
            — {formData.coupleName.split('&')[0].trim()}
          </p>
        </motion.div>

        {/* Photo Gallery */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="mb-16 max-w-3xl mx-auto relative"
        >
          <div className="relative">
            <motion.img
              key={currentPhotoIndex}
              src={photos[currentPhotoIndex]}
              alt={`Foto ${currentPhotoIndex + 1}`}
              className="w-full h-64 md:h-80 object-cover rounded-2xl shadow-md border border-rose-200"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            />
            {photos.length > 1 && (
              <>
                <button
                  onClick={handlePrevPhoto}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-rose-500/90 p-2 rounded-full text-white hover:bg-rose-600 transition-all"
                >
                  ◀
                </button>
                <button
                  onClick={handleNextPhoto}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-rose-500/90 p-2 rounded-full text-white hover:bg-rose-600 transition-all"
                >
                  ▶
                </button>
              </>
            )}
          </div>
        </motion.div>

        {/* Video */}
        {videos.length > 0 && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.5 }}
            className="mb-16 max-w-2xl mx-auto"
          >
            <video ref={videoRef} controls className="w-full rounded-2xl shadow-md border border-rose-200">
              <source src={videos[0]} type="video/mp4" />
            </video>
          </motion.div>
        )}

        {/* Music */}
        {spotifyLink ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.8 }}
            className="mb-16 max-w-md mx-auto"
          >
            <iframe
              src={getSpotifyEmbedUrl(spotifyLink)}
              width="100%"
              height="80"
              frameBorder="0"
              allowTransparency={true}
              allow="encrypted-media"
              className="rounded-lg shadow-md"
            />
          </motion.div>
        ) : musics.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.8 }}
            className="fixed bottom-8 right-8 z-50"
          >
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-3 bg-rose-500 text-white rounded-full shadow-lg hover:bg-rose-600 transition-all"
            >
              {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
            </motion.button>
          </motion.div>
        )}

        {/* Download PDF Button */}
        {onDownloadPDF && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 2.1 }}
            className="mb-12"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onDownloadPDF}
              className="px-6 py-3 bg-rose-500 text-white rounded-full font-sans text-base hover:bg-rose-600 transition-all shadow-lg flex items-center mx-auto"
            >
              <Download className="h-5 w-5 mr-2" /> Baixar Card
            </motion.button>
          </motion.div>
        )}

        {/* Decorative Elements */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <Flower2 className="absolute top-16 left-16 h-12 w-12 text-rose-400 animate-float" />
          <Heart className="absolute bottom-20 right-16 h-14 w-14 text-rose-400 animate-pulse" />
          <Flower2 className="absolute top-1/3 left-1/4 h-10 w-10 text-rose-400 animate-float-delay" />
        </div>
      </motion.div>
    </div>
  );
};

export default SitePreview;