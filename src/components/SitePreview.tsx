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
    <div className="min-h-screen bg-gradient-to-b from-[#F5F5F0] to-[#FDF6E3] flex flex-col items-center py-16 px-4">
      {/* Textura Sutil de Fundo */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/paper-fibers.png")' }} />

      {/* Nome do Casal */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-5xl md:text-6xl font-serif text-gray-800 text-center mb-4"
        style={{ fontFamily: "'Playfair Display', serif" }}
      >
        {coupleName || 'Seu Amor'}
      </motion.h1>

      {/* Linha Decorativa Dourada */}
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: '100px' }}
        transition={{ duration: 1, delay: 0.2 }}
        className="h-px bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent mb-6"
      />

      {/* Data de Início de Namoro */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="text-lg text-gray-600 mb-8 text-center"
        style={{ fontFamily: "'Raleway', sans-serif" }}
      >
        Desde {relationshipStartDate ? format(new Date(relationshipStartDate), 'dd.MM.yyyy', { locale: ptBR }) : 'Data não informada'}
      </motion.p>

      {/* Contador de Tempo */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.6 }}
        className="mb-12 bg-white border border-gray-200 rounded-lg px-6 py-3 shadow-sm text-center"
      >
        <p className="text-md text-gray-700" style={{ fontFamily: "'Raleway', sans-serif" }}>
          {calculateTimeTogether()}
        </p>
      </motion.div>

      {/* Frase de Amor */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.8 }}
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
          transition={{ duration: 0.8, delay: 1.0 }}
          className="mb-16 w-full max-w-3xl"
        >
          <h2 className="text-2xl font-semibold text-gray-800 text-center mb-6" style={{ fontFamily: "'Raleway', sans-serif" }}>
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
          transition={{ duration: 0.8, delay: 1.2 }}
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
    </div>
  );
};

export default SitePreview;
