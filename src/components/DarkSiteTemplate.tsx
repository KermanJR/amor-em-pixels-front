import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { differenceInYears, differenceInMonths, differenceInDays, differenceInHours, differenceInMinutes, differenceInSeconds, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface DarkSiteTemplateProps {
  formData: {
    coupleName: string;
    relationshipStartDate: Date;
    message: string;
    timeline?: { date: Date; title: string; description: string; photo?: string }[];
  };
  plan: 'basic' | 'premium';
  media: {
    photos: string[];
    musics: string[];
    spotifyLink?: string;
  };
  customUrl?: string;
}

const DarkSiteTemplate = ({ formData, plan, media, customUrl }: DarkSiteTemplateProps) => {
  const { coupleName, relationshipStartDate, message, timeline } = formData;
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
    infinite: photos.length > 1,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: true,
    autoplay: photos.length > 1,
    autoplaySpeed: 3000,
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1A1A1A] to-[#2C2C2C] flex flex-col items-center py-16 px-4 relative overflow-hidden">
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

      {/* Linhas Douradas Transpassando */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent animate-line-left-right" />
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent animate-line-right-left" />
        <div className="absolute top-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent animate-line-left-right-delayed" />
        <div className="absolute bottom-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent animate-line-right-left-delayed" />
      </div>

      {/* Textura Sutil de Fundo */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/dark-mosaic.png")' }} />

      {/* Nome do Casal */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="text-5xl md:text-6xl font-serif text-white text-center mb-4"
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
        className="text-lg text-gray-300 mb-8 text-center"
        style={{ fontFamily: "'Raleway', sans-serif" }}
      >
        Desde {relationshipStartDate ? format(new Date(relationshipStartDate), 'dd.MM.yyyy', { locale: ptBR }) : 'Data não informada'}
      </motion.p>

      {/* Contador de Tempo */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.8 }}
        className="mb-12 p-6 bg-[#2C2C2C] border border-gray-700 rounded-lg shadow-sm max-w-lg mx-auto w-full"
      >
        <h2 className="text-xl text-white font-semibold mb-4" style={{ fontFamily: "'Raleway', sans-serif" }}>
          Tempo Juntos
        </h2>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-4 text-center">
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
              className="p-3 bg-[#3A3A3A] rounded-lg"
              whileHover={{ scale: 1.05 }}
            >
              <p className="text-lg font-semibold text-white" style={{ fontFamily: "'Raleway', sans-serif" }}>
                {item.value}
              </p>
              <p className="text-sm text-gray-400" style={{ fontFamily: "'Raleway', sans-serif" }}>
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
        className="text-xl text-gray-300 mb-16 text-center max-w-2xl mx-auto italic"
        style={{ fontFamily: "'Playfair Display', serif" }}
      >
        "{message || 'Um amor para a eternidade.'}"
      </motion.p>

      {/* Linha do Tempo */}
      {timeline && timeline.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="mb-16 w-full max-w-3xl relative"
        >
          <h2 className="text-2xl font-semibold text-white text-center mb-8" style={{ fontFamily: "'Raleway', sans-serif" }}>
            Nossa Linha do Tempo
          </h2>
          <div className="relative">
            {/* Linha Vertical Central */}
            <div className="absolute left-1/2 transform -translate-x-1/2 w-px h-full bg-[#D4AF37] opacity-30" />
            {timeline
              .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
              .map((moment, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 1.4 + index * 0.2 }}
                  className={`flex items-center mb-12 ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}
                >
                  {/* Conteúdo do Momento */}
                  <div className={`w-1/2 ${index % 2 === 0 ? 'pr-8 text-right' : 'pl-8 text-left'}`}>
                    <h3 className="text-lg font-semibold text-white" style={{ fontFamily: "'Raleway', sans-serif" }}>
                      {moment.title}
                    </h3>
                    <p className="text-sm text-gray-400 mb-2" style={{ fontFamily: "'Raleway', sans-serif" }}>
                      {format(new Date(moment.date), 'dd.MM.yyyy', { locale: ptBR })}
                    </p>
                    <p className="text-gray-300" style={{ fontFamily: "'Raleway', sans-serif" }}>
                      {moment.description}
                    </p>
                  </div>
                  {/* Círculo na Linha do Tempo */}
                  <div className="w-6 h-6 bg-[#D4AF37] rounded-full absolute left-1/2 transform -translate-x-1/2 z-10" />
                  {/* Foto (se houver) */}
                  <div className={`w-1/2 ${index % 2 === 0 ? 'pl-8' : 'pr-8'}`}>
                    {moment.photo && (
                      <img
                        src={moment.photo}
                        alt={moment.title}
                        className="w-full h-40 object-cover rounded-lg shadow-md"
                      />
                    )}
                  </div>
                </motion.div>
              ))}
          </div>
        </motion.div>
      )}

      {/* Galeria de Fotos */}
      {photos && photos.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.6 }}
          className="mb-16 w-full max-w-3xl"
        >
          <h2 className="text-2xl font-semibold text-white text-center mb-6" style={{ fontFamily: "'Raleway', sans-serif" }}>
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
          transition={{ duration: 0.8, delay: 1.8 }}
          className="mb-16 w-full max-w-md"
        >
          <h2 className="text-2xl font-semibold text-white text-center mb-6" style={{ fontFamily: "'Raleway', sans-serif" }}>
            Nossa Música
          </h2>
          <iframe
            src={`https://open.spotify.com/embed/track/${spotifyLink.split('track/')[1]?.split('?')[0]}`}
            width="100%"
            height="80"
            frameBorder="0"
            allowTransparency="true"
            allow="encrypted-media"
            className="rounded-lg shadow-sm border border-gray-700"
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
        @keyframes line-left-right {
          0% {
            transform: translateX(-100%);
          }
          50% {
            transform: translateX(100%);
          }
          100% {
            transform: translateX(-100%);
          }
        }
        @keyframes line-right-left {
          0% {
            transform: translateX(100%);
          }
          50% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        @keyframes line-left-right-delayed {
          0% {
            transform: translateX(-100%);
          }
          50% {
            transform: translateX(100%);
          }
          100% {
            transform: translateX(-100%);
          }
        }
        @keyframes line-right-left-delayed {
          0% {
            transform: translateX(100%);
          }
          50% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        .animate-line-left-right {
          animation: line-left-right 15s infinite linear;
        }
        .animate-line-right-left {
          animation: line-right-left 15s infinite linear;
        }
        .animate-line-left-right-delayed {
          animation: line-left-right-delayed 20s infinite linear;
          animation-delay: 5s;
        }
        .animate-line-right-left-delayed {
          animation: line-right-left-delayed 20s infinite linear;
          animation-delay: 5s;
        }
      `}</style>
    </div>
  );
};

export default DarkSiteTemplate;
