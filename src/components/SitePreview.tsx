import { useState, useEffect } from 'react';
import { format, differenceInYears, differenceInMonths, differenceInDays, differenceInHours, differenceInMinutes, differenceInSeconds } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Heart } from 'lucide-react';
import { motion } from 'framer-motion';

interface MiniPreviewProps {
  formData: {
    coupleName: string;
    relationshipStartDate: Date | null;
    message: string;
    spotifyLink?: string;
    password: string;
  };
  media: {
    photos: File[];
    videos: File[];
    musics: File[];
    spotifyLink?: string;
  };
  plan: 'basic' | 'premium';
  customUrl: string;
}

const MiniPreview = ({ formData, media, plan, customUrl }: MiniPreviewProps) => {
  const [timeTogether, setTimeTogether] = useState({
    years: 0,
    months: 0,
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const firstPhoto = media.photos.length > 0 ? URL.createObjectURL(media.photos[0]) : 'https://via.placeholder.com/300x200?text=Sem+Foto';
  const hasVideo = media.videos.length > 0;
  const hasMusic = media.musics.length > 0 || media.spotifyLink;

  useEffect(() => {
    const calculateTimeTogether = () => {
      if (!formData.relationshipStartDate) return;
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

  return (
    <div className="min-h-[400px] w-full max-w-[300px] mx-auto relative overflow-hidden bg-black rounded-lg shadow-lg">
      {/* Efeito de partículas simplificado */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(50)].map((_, idx) => (
          <div
            key={idx}
            className="absolute w-0.5 h-0.5 bg-white rounded-full animate-float"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${Math.random() * 10 + 5}s`,
              opacity: `${Math.random() * 0.3 + 0.1}`,
            }}
          />
        ))}
      </div>

      {/* Gradiente */}
      <motion.div
        className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05)_0%,rgba(0,0,0,0)_70%)]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2 }}
      />

      {/* Conteúdo principal */}
      <motion.div
        className="relative max-w-[300px] mx-auto py-6 px-4 text-center text-white"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        {/* Cabeçalho */}
        <motion.div
          className="mb-6"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h1 className="text-2xl font-serif bg-gradient-to-br from-gold-400 to-gold-600 bg-clip-text font-medium">
            {formData.coupleName || 'Nome do Casal'}
          </h1>
          <p className="text-sm text-gray-300 mt-2">
            Desde {formData.relationshipStartDate ? format(new Date(formData.relationshipStartDate), "dd 'de' MMMM 'de' yyyy", { locale: ptBR }) : 'Data não definida'}
          </p>
        </motion.div>

        {/* Tempo Juntos */}
        <motion.div
          className="mb-6 p-4 bg-gray-900 rounded-lg border border-gray-800"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <h2 className="text-lg text-gold-400 font-medium mb-4">Tempo Juntos</h2>
          <div className="grid grid-cols-3 gap-2 text-center">
            {[
              { value: timeTogether.years, label: 'Anos' },
              { value: timeTogether.months, label: 'Meses' },
              { value: timeTogether.days, label: 'Dias' },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                className="p-2 bg-gray-800 rounded"
                whileHover={{ scale: 1.05 }}
              >
                <p className="text-base font-semibold text-gold-400">{item.value}</p>
                <p className="text-xs text-gray-300">{item.label}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Mensagem */}
        <motion.div
          className="mb-6 p-4 bg-gray-900 rounded-lg border border-gray-800"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <p className="text-sm text-gray-200 italic line-clamp-3">
            "{formData.message || 'Escreva uma mensagem especial...'}"
          </p>
        </motion.div>

        {/* Foto Principal */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <img
            src={firstPhoto}
            alt="Prévia da primeira foto do casal"
            className="w-full h-32 object-cover rounded-lg border border-gray-800"
            loading="lazy"
          />
        </motion.div>

        {/* Indicadores de Mídia */}
        <div className="flex justify-center gap-2 text-sm text-gray-600">
          {hasVideo && <span className="text-white">Vídeo</span>}
          {hasMusic && <span className="text-white">Música</span>}
        </div>

        {/* URL e Senha */}
        {customUrl && (
          <p className="text-xs text-gray-400 mt-2">
            URL: {window.location.origin}/{customUrl}
          </p>
        )}
        {formData.password && (
          <p className="text-xs text-gray-400 mt-1">
            Senha: {formData.password}
          </p>
        )}
      </motion.div>
    </div>
  );
};

export default MiniPreview;
