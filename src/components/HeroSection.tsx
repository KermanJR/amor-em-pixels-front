import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Heart, ArrowRight, Star } from 'lucide-react';
import { motion } from 'framer-motion';

const HeroSection = () => {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="relative overflow-hidden pt-28 pb-20 lg:pt-36 lg:pb-28 bg-gradient-to-br from-white via-pink-50 to-purple-50">
      {/* Elementos decorativos sutis e premium */}
      <div className="absolute inset-0 -z-10">
        <motion.div
          className="absolute top-20 left-16 w-56 h-56 bg-gradient-to-r from-pink-100 to-purple-200 rounded-full mix-blend-overlay filter blur-3xl opacity-40"
          animate={{ scale: [1, 1.1, 1], opacity: [0.4, 0.5, 0.4] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-20 right-16 w-64 h-64 bg-gradient-to-r from-purple-100 to-blue-200 rounded-full mix-blend-overlay filter blur-3xl opacity-30"
          animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.4, 0.3] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        />
      </div>

      <div className="container px-6 mx-auto relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Conteúdo de Texto */}
          <motion.div
            className={cn(
              'max-w-lg space-y-8',
              loaded ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'
            )}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            {/* Badge Premium */}
            <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md">
              <Heart className="h-5 w-5 mr-2 animate-pulse" />
              <span className="text-sm font-semibold uppercase tracking-wider">Plano Premium - R$ 49,90</span>
            </div>

            {/* Título */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight text-gray-900">
              Crie um{' '}
              <span className="relative inline-block text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-700">
                Presente Digital Inesquecível
                <svg
                  className="absolute -bottom-2 left-0 w-full h-3"
                  viewBox="0 0 200 12"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M0 6C50 -2 150 -2 200 10"
                    stroke="url(#gradient)"
                    strokeWidth="4"
                    strokeLinecap="round"
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
            <p className="text-lg md:text-xl text-gray-600 font-medium leading-relaxed">
              Transforme suas memórias em um{' '}
              <span className="font-semibold text-pink-600">Card Digital Exclusivo</span> com fotos, vídeos e
              músicas. Em minutos, surpreenda quem você ama com um toque de elegância e emoção.
            </p>

            {/* Call-to-Action */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/criar">
                <Button
                  size="lg"
                  className="w-full sm:w-72 h-14 text-lg bg-gradient-to-r from-pink-600 to-purple-700 hover:from-pink-700 hover:to-purple-800 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  Criar Agora
                  <ArrowRight className="ml-3 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>

            {/* Benefícios */}
            <div className="flex flex-wrap gap-4 text-sm text-gray-500 font-medium">
              <div className="flex items-center">
                <Star className="h-4 w-4 text-yellow-400 mr-1 animate-twinkle" />
                <span>Feito em minutos</span>
              </div>
              <span className="text-gray-300">•</span>
              <span>Garantia de satisfação</span>
              <span className="text-gray-300">•</span>
              <span>Suporte 24/7</span>
            </div>
          </motion.div>

          {/* Imagem Principal */}
          <motion.div
            className={cn(
              'relative',
              loaded ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'
            )}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
          >
            <div className="relative z-10 bg-white p-6 rounded-2xl shadow-2xl max-w-md mx-auto transform hover:scale-105 transition-all duration-500">
              <div className="aspect-[3/4] rounded-xl overflow-hidden border border-gray-100">
                <img
                  src="https://images.pexels.com/photos/3512506/pexels-photo-3512506.png?auto=compress&cs=tinysrgb&w=1200"
                  alt="Casal celebrando amor"
                  className="object-cover w-full h-full transition-transform duration-700 hover:scale-110"
                />
              </div>
            </div>

            {/* Detalhes flutuantes */}
            <motion.div
              className="absolute top-0 -left-12 bg-white p-3 rounded-xl shadow-lg transform -rotate-6 hover:rotate-0 transition-all duration-500"
              whileHover={{ scale: 1.1, rotate: 0 }}
            >
              <div className="w-28 aspect-video rounded-lg overflow-hidden">
                <img
                  src="https://images.pexels.com/photos/1288245/pexels-photo-1288245.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
                  alt="Momento especial"
                  className="object-cover w-full h-full"
                />
              </div>
            </motion.div>

            <motion.div
              className="absolute -bottom-8 right-0 bg-gradient-to-r from-pink-500 to-purple-600 text-white p-4 rounded-xl shadow-lg transform rotate-6 hover:rotate-0 transition-all duration-500"
              whileHover={{ scale: 1.1, rotate: 0 }}
            >
              <div className="flex items-center space-x-2">
                <Heart className="h-5 w-5 animate-pulse" />
                <span className="text-base font-semibold">Feito com amor</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Estilos CSS */}
      <style jsx>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        .animate-twinkle {
          animation: twinkle 2s ease-in-out infinite;
        }
        .animate-pulse {
          animation: pulse 1.5s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
};

export default HeroSection;
