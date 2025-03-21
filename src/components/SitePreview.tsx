import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { differenceInYears, differenceInMonths, differenceInDays, differenceInHours, differenceInMinutes, differenceInSeconds, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface SiteTemplateProps {
  formData: {
    coupleName: string;
    relationshipStartDate: Date;
    message: string;
  };
  plan: 'basic' | 'premium';
  media: {
    photos: string[];
    musics: string[];
    spotifyLink?: string;
  };
  customUrl?: string;
}

const SitePreview = ({ formData, plan, media, customUrl }: SiteTemplateProps) => {
  const { coupleName, relationshipStartDate, message } = formData;
  const { photos, spotifyLink } = media;

  const [timeTogether, setTimeTogether] = useState({
    years: 0,
    months: 0,
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  // Calcular o tempo de relacionamento (contador detalhado)
  useEffect(() => {
    const calculateTimeTogether = () => {
      const startDate = new Date(relationshipStartDate);
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
  }, [relationshipStartDate]);

  // Configurações do carrossel
  const sliderSettings = {
    dots: true,
    infinite: photos.length > 1, // Evita loop infinito com uma única foto
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: true,
    autoplay: photos.length > 1, // Autoplay só se houver mais de uma foto
    autoplaySpeed: 3000,
  };

  // Gerar monograma com as iniciais do casal
  const getInitials = () => {
    const names = coupleName.split('&').map(name => name.trim());
    const initials = names.map(name => name.charAt(0).toUpperCase()).join('');
    return initials;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F5F5F0] to-[#FDF6E3] flex flex-col items-center py-16 px-4 relative overflow-hidden">
      {/* Partículas Douradas Sutil */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(50)].map((_, idx) => (
          <div
            key={idx}
            className="absolute w-1 h-1 bg-[#D4AF37] rounded-full animate-float"
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

      {/* Textura Sutil de Fundo */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/paper-fibers.png")' }} />

      {/* Monograma com Iniciais do Casal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 0.2, scale: 1 }}
        transition={{ duration: 1 }}
        className="absolute top-8 left-1/2 transform -translate-x-1/2"
      >
        <div className="w-24 h-24 rounded-full border-2 border-[#D4AF37] flex items-center justify-center text-[#D4AF37] text-3xl font-serif">
          {getInitials()}
        </div>
      </motion.div>

      {/* Nome do Casal */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="text-5xl md:text-6xl font-serif text-gray-800 text-center mb-4 mt-24"
        style={{ fontFamily: "'Playfair Display', serif" }}
      >
        {coupleName || 'Seu Amor'}
      </motion.h1>

      {/* Linha Decorativa Dourada */}
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: '120px' }}
        transition={{ duration: 1, delay: 0.4 }}
        className="h-px bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent mb-6"
      />

      {/* Data de Início de Namoro */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.6 }}
        className="text-lg text-gray-600 mb-8 text-center"
        style={{ fontFamily: "'Raleway', sans-serif" }}
      >
        Desde {relationshipStartDate ? format(new Date(relationshipStartDate), 'dd.MM.yyyy', { locale: ptBR }) : 'Data não informada'}
      </motion.p>

      {/* Contador de Tempo */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.8 }}
        className="mb-12 p-6 bg-white border border-gray-200 rounded-lg shadow-sm max-w-md mx-auto"
      >
        <h2 className="text-xl text-gray-800 font-semibold mb-4" style={{ fontFamily: "'Raleway', sans-serif" }}>
          Tempo Juntos
        </h2>
        <div className="grid grid-cols-3 gap-4 text-center">
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
              className="p-2 bg-gray-50 rounded-lg"
              whileHover={{ scale: 1.05 }}
            >
              <p className="text-lg font-semibold text-gray-800" style={{ fontFamily: "'Raleway', sans-serif" }}>
                {item.value}
              </p>
              <p className="text-sm text-gray-600" style={{ fontFamily: "'Raleway', sans-serif" }}>
                {item.label}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Frase de Amor */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1.0 }}
        className="text-xl text-gray-600 mb-16 text-center max-w-2xl mx-auto italic"
        style={{ fontFamily: "'Playfair Display', serif" }}
      >
        "{message || 'Um amor para a eternidade.'}"
      </motion.p>

      {/* Galeria de Fotos */}
      {photos && photos.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="mb-16 w-full max-w-3xl"
        >
          <h2 className="text-2xl font-semibold text-gray-800 text-center mb-6" style={{ fontFamily: "'Raleway', sans-serif" }}>
            Nossas Memórias
          </h2>
          <Slider {...sliderSettings} key={photos.length}>
            {photos.map((photo, index) => (
              <div key={index} className="px-2">
                <img
                  src={photo}
                  alt={`Foto ${index + 1}`}
                  className="w-full rounded-lg shadow-md object-cover"
                  style={{ aspectRatio: '4/3' }}
                />
              </div>
            ))}
          </Slider>
        </motion.div>
      )}

      {/* Player do Spotify */}
      {spotifyLink && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.4 }}
          className="mb-16 w-full max-w-md"
        >
          <h2 className="text-2xl font-semibold text-gray-800 text-center mb-6" style={{ fontFamily: "'Raleway', sans-serif" }}>
            Nossa Música
          </h2>
          <iframe
            src={`https://open.spotify.com/embed/track/${spotifyLink.split('track/')[1]?.split('?')[0]}`}
            width="100%"
            height="80"
            frameBorder="0"
            allowTransparency="true"
            allow="encrypted-media"
            className="rounded-lg shadow-sm border border-gray-200"
          />
        </motion.div>
      )}

      {/* Estilos */}
      <style jsx>{`
        @keyframes float {
          0% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-20px);
          }
          100% {
            transform: translateY(0);
          }
        }
        .animate-float {
          animation: float infinite;
        }
      `}</style>
    </div>
  );
};

export default SitePreview;
