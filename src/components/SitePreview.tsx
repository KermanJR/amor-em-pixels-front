import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Slider from 'react-slick'; // Para o carrossel de fotos
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { differenceInDays, differenceInMonths, differenceInYears, format } from 'date-fns';
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
    videos: string[];
    musics: string[];
    spotifyLink?: string;
  };
  customUrl?: string;
}

const SitePreview = ({ formData, plan, media, customUrl }: SiteTemplateProps) => {
  const { coupleName, relationshipStartDate, message } = formData;
  const { photos, spotifyLink } = media;

  // Calcular o tempo de relacionamento
  const calculateTimeTogether = () => {
    const startDate = new Date(relationshipStartDate);
    const now = new Date();
    const years = differenceInYears(now, startDate);
    const months = differenceInMonths(now, startDate) % 12;
    const days = differenceInDays(now, startDate) % 30; // Aproximação para dias
    let result = '';
    if (years > 0) result += `${years} ${years === 1 ? 'ano' : 'anos'}`;
    if (months > 0) result += `${result ? ', ' : ''}${months} ${months === 1 ? 'mês' : 'meses'}`;
    if (days > 0) result += `${result ? ' e ' : ''}${days} ${days === 1 ? 'dia' : 'dias'}`;
    return result ? `${result} juntos` : 'Primeiro dia juntos!';
  };

  // Configurações do carrossel
  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: true,
    autoplay: true,
    autoplaySpeed: 3000,
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-pink-50 flex flex-col items-center py-12 px-4">
      {/* Elementos Florais Decorativos */}
      <div className="absolute top-0 left-0 w-24 h-24 opacity-20">
        <svg viewBox="0 0 100 100" className="fill-current text-gray-300">
          <path d="M50 10 C70 10 90 30 90 50 C90 70 70 90 50 90 C30 90 10 70 10 50 C10 30 30 10 50 10 Z M50 20 C35 20 20 35 20 50 C20 65 35 80 50 80 C65 80 80 65 80 50 C80 35 65 20 50 20 Z" />
        </svg>
      </div>
      <div className="absolute bottom-0 right-0 w-24 h-24 opacity-20">
        <svg viewBox="0 0 100 100" className="fill-current text-gray-300">
          <path d="M50 10 C70 10 90 30 90 50 C90 70 70 90 50 90 C30 90 10 70 10 50 C10 30 30 10 50 10 Z M50 20 C35 20 20 35 20 50 C20 65 35 80 50 80 C65 80 80 65 80 50 C80 35 65 20 50 20 Z" />
        </svg>
      </div>

      {/* Nome do Casal */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-4xl md:text-5xl font-bold text-gray-900 text-center mb-4"
        style={{ fontFamily: "'Dancing Script', cursive" }}
      >
        {coupleName || 'Seu Amor'}
      </motion.h1>

      {/* Data de Início de Namoro */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="text-lg text-gray-600 mb-6 text-center"
        style={{ fontFamily: "'Poppins', sans-serif" }}
      >
        Desde {relationshipStartDate ? format(new Date(relationshipStartDate), 'dd.MM.yyyy', { locale: ptBR }) : 'Data não informada'}
      </motion.p>

      {/* Contador de Tempo */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="mb-8 bg-white border border-pink-200 rounded-full px-6 py-2 text-center"
      >
        <p className="text-md text-gray-700" style={{ fontFamily: "'Poppins', sans-serif" }}>
          {calculateTimeTogether()}
        </p>
      </motion.div>

      {/* Frase de Amor */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.6 }}
        className="text-lg text-gray-600 mb-12 text-center max-w-2xl mx-auto italic"
        style={{ fontFamily: "'Dancing Script', cursive" }}
      >
        "{message || 'Um amor para a eternidade.'}"
      </motion.p>

      {/* Galeria de Fotos */}
      {photos && photos.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mb-12 w-full max-w-2xl"
        >
          <h2 className="text-2xl font-semibold text-gray-800 text-center mb-4" style={{ fontFamily: "'Poppins', sans-serif" }}>
            Nossas Memórias
          </h2>
          <Slider {...sliderSettings}>
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
          transition={{ duration: 0.8, delay: 1.0 }}
          className="mb-12 w-full max-w-md"
        >
          <h2 className="text-2xl font-semibold text-gray-800 text-center mb-4" style={{ fontFamily: "'Poppins', sans-serif" }}>
            Nossa Música
          </h2>
          <iframe
            src={`https://open.spotify.com/embed/track/${spotifyLink.split('track/')[1]?.split('?')[0]}`}
            width="100%"
            height="80"
            frameBorder="0"
            allowTransparency="true"
            allow="encrypted-media"
            className="rounded-lg"
          />
        </motion.div>
      )}
    </div>
  );
};

export default SitePreview;
