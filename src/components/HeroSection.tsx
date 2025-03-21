import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Heart, ArrowRight, Star, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import SitePreview from './SitePreview'; // Importe o componente SitePreview

const HeroSection = () => {
  const [loaded, setLoaded] = useState(false);
  const [hovered, setHovered] = useState<'light' | 'dark' | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Dados fictícios para os templates claro e escuro
  const mockDataLight = {
    formData: {
      coupleName: 'Ana & João',
      relationshipStartDate: new Date('2020-01-01'),
      message: 'Um amor para a eternidade.',
    },
    plan: 'premium',
    media: {
      photos: [
        'https://images.pexels.com/photos/3512506/pexels-photo-3512506.png?auto=compress&cs=tinysrgb&w=1200',
      ],
      musics: [],
      spotifyLink: 'https://open.spotify.com/track/4uUG5tS1BAXw0qD37FGe1S',
    },
    customUrl: 'ana-e-joao',
    theme: 'light',
  };

  const mockDataDark = {
    formData: {
      coupleName: 'Lara & Pedro',
      relationshipStartDate: new Date('2019-06-15'),
      message: 'Juntos para sempre.',
    },
    plan: 'premium',
    media: {
      photos: [
        'https://images.pexels.com/photos/1288245/pexels-photo-1288245.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      ],
      musics: [],
      spotifyLink: 'https://open.spotify.com/track/4uUG5tS1BAXw0qD37FGe1S',
    },
    customUrl: 'lara-e-pedro',
    theme: 'dark', // Garantindo que o tema seja 'dark'
  };

  return (
    <section className="relative overflow-hidden pt-32 pb-24 lg:pt-40 lg:pb-32">
      {/* Background com efeitos visuais */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
        {/* Camada de partículas animadas */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute top-10 left-1/4 w-72 h-72 bg-gradient-to-r from-pink-200 to-purple-300 rounded-full mix-blend-overlay filter blur-3xl opacity-30"
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3], x: [0, 20, 0], y: [0, -30, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute bottom-20 right-1/3 w-96 h-96 bg-gradient-to-r from-purple-200 to-blue-300 rounded-full mix-blend-overlay filter blur-3xl opacity-20"
            animate={{ scale: [1, 1.15, 1], opacity: [0.2, 0.4, 0.2], x: [0, -25, 0], y: [0, 40, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          />
          <motion.div
            className="absolute top-1/3 left-10 w-48 h-48 bg-gradient-to-r from-yellow-100 to-pink-200 rounded-full mix-blend-overlay filter blur-2xl opacity-25"
            animate={{ scale: [1, 1.1, 1], opacity: [0.25, 0.35, 0.25], rotate: [0, 10, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          />
        </div>

        {/* Linhas sutis de decoração */}
        <svg className="absolute inset-0 w-full h-full opacity-10" fill="none">
          <defs>
            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#ec4899' }} />
              <stop offset="100%" style={{ stopColor: '#8b5cf6' }} />
            </linearGradient>
          </defs>
          <path
            d="M-100,0 Q200,300 500,200 T1000,400"
            stroke="url(#lineGradient)"
            strokeWidth="2"
            className="animate-draw"
          />
          <path
            d="M1200,800 Q900,500 600,600 T0,400"
            stroke="url(#lineGradient)"
            strokeWidth="2"
            className="animate-draw-reverse"
          />
        </svg>

        {/* Partículas brilhantes */}
        <Sparkles className="absolute top-10 right-20 h-8 w-8 text-yellow-300 animate-twinkle opacity-50" />
        <Sparkles className="absolute bottom-16 left-1/4 h-6 w-6 text-pink-400 animate-twinkle opacity-40" />
      </div>

      <div className="container px-6 mx-auto relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Conteúdo de Texto */}
          <motion.div
            className={cn(
              'max-w-xl space-y-8',
              loaded ? 'translate-y-0 opacity-100' : 'translate-y-16 opacity-0'
            )}
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: 'easeOut' }}
          >
            {/* Badge Premium */}
            <motion.div
              className="inline-flex items-center px-5 py-2 rounded-full bg-gradient-to-r from-pink-600 to-purple-700 text-white shadow-lg"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            >
              <Heart className="h-5 w-5 mr-2 animate-pulse" />
              <span className="text-sm font-semibold uppercase tracking-widest">Exclusivo - R$ 59,90</span>
            </motion.div>

            {/* Título */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold leading-tight text-gray-900">
              Encante com um{' '}
              <span className="relative inline-block text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-800">
                Presente Digital Memorável
                <svg
                  className="absolute -bottom-3 left-0 w-full h-4"
                  viewBox="0 0 200 12"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M0 6C50 -2 150 -2 200 10"
                    stroke="url(#gradient)"
                    strokeWidth="5"
                    strokeLinecap="round"
                    className="animate-draw"
                  />
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" style={{ stopColor: '#ec4899' }} />
                      <stop offset="100%" style={{ stopColor: '#8b5cf6' }} />
                    </linearGradient>
                  </defs>
                </svg>
              </span>
            </h1>

            {/* Subtítulo */}
            <p className="text-lg md:text-xl text-gray-700 font-medium leading-relaxed">
              Crie um{' '}
              <span className="font-semibold text-pink-600">Card Digital Único</span> com fotos, vídeos e músicas
              que capturam seus momentos mais especiais. Em poucos passos, entregue uma experiência emocionante e
              sofisticada.
            </p>

            {/* Call-to-Action */}
            <div className="flex flex-col sm:flex-row gap-6">
              <Link to="/criar">
                <Button
                  size="lg"
                  className="w-full sm:w-80 h-16 text-xl bg-gradient-to-r from-pink-600 to-purple-800 hover:from-pink-700 hover:to-purple-900 text-white font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
                >
                  Criar Minha Obra-Prima
                  <ArrowRight className="ml-3 h-6 w-6 transition-transform duration-300 group-hover:translate-x-2" />
                </Button>
              </Link>
            </div>

            {/* Benefícios com ícones */}
            <div className="flex flex-wrap gap-6 text-sm text-gray-600 font-medium">
              <div className="flex items-center">
                <Star className="h-5 w-5 text-yellow-400 mr-2 animate-twinkle" />
                <span>Rápido e Fácil</span>
              </div>
              <div className="flex items-center">
                <Heart className="h-5 w-5 text-pink-500 mr-2 animate-pulse" />
                <span>100% Personalizado</span>
              </div>
              <div className="flex items-center">
                <Sparkles className="h-5 w-5 text-purple-500 mr-2 animate-twinkle" />
                <span>Qualidade Premium</span>
              </div>
            </div>
          </motion.div>

          {/* Composição Visual com Templates Claro e Escuro */}
          <motion.div
            className={cn(
              'relative max-w-md mx-auto',
              loaded ? 'translate-y-0 opacity-100' : 'translate-y-16 opacity-0'
            )}
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2, ease: 'easeOut' }}
          >
            {/* Mockup de Trás (Template Escuro) */}
            <motion.div
              className="absolute top-0 left-0 w-full bg-white p-6 rounded-3xl shadow-2xl transform rotate-6 translate-x-8 translate-y-8"
              style={{ zIndex: hovered === 'dark' ? 20 : 10 }}
              onMouseEnter={() => setHovered('dark')}
              onMouseLeave={() => setHovered(null)}
              animate={{
                rotate: hovered === 'dark' ? 0 : 6,
                translateX: hovered === 'dark' ? 0 : 32,
                translateY: hovered === 'dark' ? 0 : 32,
                scale: hovered === 'dark' ? 1.05 : 1,
              }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            >
              <div className="aspect-[3/4] rounded-xl overflow-hidden border-2 border-purple-100">
                <div className="w-full h-full overflow-y-auto">
                  <SitePreview {...mockDataDark} />
                </div>
              </div>
              {/* Etiqueta "Escuro" */}
              <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 bg-white text-gray-800 px-4 py-1 rounded-full shadow-md text-sm font-semibold">
                Tema Escuro
              </div>
            </motion.div>

            {/* Mockup Principal (Template Claro) */}
            <motion.div
              className="relative bg-white p-6 rounded-3xl shadow-2xl transform -rotate-6"
              style={{ zIndex: hovered === 'light' ? 20 : 15 }}
              onMouseEnter={() => setHovered('light')}
              onMouseLeave={() => setHovered(null)}
              animate={{
                rotate: hovered === 'light' ? 0 : -6,
                scale: hovered === 'light' ? 1.05 : 1,
              }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            >
              <div className="aspect-[3/4] rounded-xl overflow-hidden border-2 border-purple-100">
                <div className="w-full h-full overflow-y-auto">
                  <SitePreview {...mockDataLight} />
                </div>
              </div>
              {/* Selo de qualidade */}
              <motion.div
                className="absolute -top-4 -right-4 bg-gradient-to-r from-yellow-400 to-pink-500 text-white p-3 rounded-full shadow-lg"
                whileHover={{ scale: 1.1 }}
              >
                <Star className="h-6 w-6 animate-twinkle" />
              </motion.div>
              {/* Etiqueta "Claro" */}
              <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 bg-white text-gray-800 px-4 py-1 rounded-full shadow-md text-sm font-semibold">
                Tema Claro
              </div>
            </motion.div>

            {/* Detalhe de fundo */}
            <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-gradient-to-tr from-pink-200 to-purple-300 rounded-full filter blur-3xl opacity-20" />
          </motion.div>
        </div>
      </div>

      {/* Estilos CSS */}
      <style jsx>{`
        @keyframes twinkle {
          0%,
          100% {
            opacity: 0.5;
          }
          50% {
            opacity: 1;
          }
        }
        @keyframes pulse {
          0%,
          100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }
        @keyframes draw {
          0% {
            stroke-dashoffset: 2000;
          }
          100% {
            stroke-dashoffset: 0;
          }
        }
        @keyframes draw-reverse {
          0% {
            stroke-dashoffset: 0;
          }
          100% {
            stroke-dashoffset: 2000;
          }
        }
        .animate-twinkle {
          animation: twinkle 2s ease-in-out infinite;
        }
        .animate-pulse {
          animation: pulse 1.5s ease-in-out infinite;
        }
        .animate-draw {
          stroke-dasharray: 2000;
          stroke-dashoffset: 2000;
          animation: draw 10s linear infinite;
        }
        .animate-draw-reverse {
          stroke-dasharray: 2000;
          stroke-dashoffset: 0;
          animation: draw-reverse 10s linear infinite;
        }
        /* Ajustes para o preview dentro do mockup */
        .aspect-[3/4] > div {
          transform: scale(0.35); /* Ajustado para melhor visualização */
          transform-origin: top center;
        }
        .aspect-[3/4] .min-h-screen {
          min-height: auto; /* Remove a altura mínima para caber no mockup */
        }
        /* Garantir que o conteúdo do mockup não quebre */
        .aspect-[3/4] {
          position: relative;
          overflow: hidden;
        }
        .aspect-[3/4] > div {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
        }
        /* Forçar o tema escuro no segundo mockup */
        .dark-theme {
          background: linear-gradient(to bottom, #2D1B2A, #4B2E39) !important;
        }
        .dark-theme * {
          color: #e5e7eb !important; /* Cor do texto para tema escuro */
        }
        .dark-theme .bg-white {
          background-color: #3A2333 !important; /* Ajuste do fundo do card no tema escuro */
        }
      `}</style>
    </section>
  );
};

export default HeroSection;
