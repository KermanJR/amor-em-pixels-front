import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Heart, ArrowRight, Star, Flower } from 'lucide-react';
import { motion } from 'framer-motion';

const HeroSection = () => {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoaded(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="relative overflow-hidden pt-24 pb-16 lg:pt-32 lg:pb-24 bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
      {/* Elementos decorativos animados */}
      <div className="absolute inset-0 -z-10">
        <motion.div
          className="absolute top-10 left-10 w-40 h-40 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-50 animate-pulse"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.5 }}
          transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse' }}
        />
        <motion.div
          className="absolute top-1/3 right-10 w-48 h-48 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-50 animate-float"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 20, opacity: 0.5 }}
          transition={{ duration: 3, repeat: Infinity, repeatType: 'reverse' }}
          style={{ animationDelay: '1s' }}
        />
        <motion.div
          className="absolute bottom-10 left-20 w-36 h-36 bg-yellow-100 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-pulse"
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.4 }}
          transition={{ duration: 2.5, repeat: Infinity, repeatType: 'reverse' }}
          style={{ animationDelay: '2s' }}
        />
        <Flower className="absolute top-5 right-5 h-16 w-16 text-pink-400 animate-spin-slow opacity-20" />
        <Star className="absolute bottom-5 left-5 h-12 w-12 text-yellow-300 animate-twinkle opacity-30" />
      </div>

      <div className="container px-4 mx-auto relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Conteúdo de Texto */}
          <motion.div
            className={cn(
              "max-w-xl space-y-8 transition-all duration-1000",
              loaded ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0"
            )}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-pink-400 to-purple-500 text-white shadow-lg animate-pulse-slow">
              <Heart className="h-5 w-5 mr-2 text-white" />
              <span className="text-sm font-semibold uppercase tracking-wide">Oferta Especial - R$ 29,90 Plano Básico</span>
            </div>

            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold leading-tight text-gray-900">
              Surpreenda seu amor com um{' '}
              <span className="relative inline-block text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600">
                Presente Digital Único
                <svg
                  className="absolute -bottom-2 left-0 w-full h-2 -z-10"
                  viewBox="0 0 200 12"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M0 6C50 -2 150 -2 200 10" stroke="url(#gradient)" strokeWidth="4" strokeLinecap="round" />
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" style={{ stopColor: '#ff69b4' }} />
                      <stop offset="100%" style={{ stopColor: '#9370db' }} />
                    </linearGradient>
                  </defs>
                </svg>
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-700 font-medium">
              Crie um{' '}
              <span className="bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent font-bold hover:scale-105 transition-transform duration-300">
                Card Digital
              </span>{' '}
              personalizado em minutos com fotos, vídeos e músicas que vão emocionar seu amor para sempre!{' '}
              <span className="text-pink-500 font-bold">Não perca essa chance!</span>
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/criar">
                <Button
                  size="lg"
                  className="w-64 sm:w-80 h-14 px-10 py-4 text-lg bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  Começar
                  <ArrowRight className="ml-2 h-6 w-6 transition-transform duration-300 group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>

            <div className="flex items-center flex-wrap gap-4 text-sm text-gray-600">
              <div className="h-1 w-1 rounded-full bg-gray-400"></div>
              <div className="flex items-center">
                <Star className="h-4 w-4 text-yellow-300 mr-1 animate-twinkle" />
                <span>Criado em minutos</span>
              </div>
              <div className="h-1 w-1 rounded-full bg-gray-400"></div>
              <div>Sem cartão de crédito</div>
            </div>
          </motion.div>

          {/* Ilustração/Imagem */}
          <motion.div
            className={cn(
              "relative transition-all duration-1000 delay-300",
              loaded ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0"
            )}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
          >
            <div className="relative z-10 bg-white p-6 rounded-2xl shadow-2xl max-w-md mx-auto transform rotate-2 hover:rotate-0 hover:scale-105 transition-all duration-500">
              <div className="aspect-[3/4] rounded-lg overflow-hidden border-4 border-pink-100">
                <img
                  src="https://images.pexels.com/photos/3512506/pexels-photo-3512506.png?auto=compress&cs=tinysrgb&w=1200"
                  alt="Casal feliz"
                  className="object-cover w-full h-full transition-transform duration-700 hover:scale-110"
                />
              </div>
              <motion.div
                className="absolute -bottom-6 -right-6 bg-white shadow-lg rounded-lg p-3 transform -rotate-6 hover:rotate-0 transition-all duration-500"
                whileHover={{ scale: 1.1 }}
              >
                <div className="flex items-center space-x-2">
                  <Heart className="h-6 w-6 text-red-400 animate-pulse" />
                  <span className="text-lg font-bold text-pink-500">Te amo!</span>
                </div>
              </motion.div>
            </div>

            <motion.div
              className="absolute top-8 -left-8 bg-white p-3 rounded-lg shadow-lg transform -rotate-6 hover:rotate-0 transition-all duration-500 hover-lift z-0"
              whileHover={{ scale: 1.05 }}
            >
              <div className="w-32 aspect-video rounded overflow-hidden">
                <img
                  src="https://images.pexels.com/photos/1288245/pexels-photo-1288245.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
                  alt="Foto de casal"
                  className="object-cover w-full h-full"
                />
              </div>
            </motion.div>

            <motion.div
              className="absolute -bottom-12 left-12 bg-white p-3 rounded-lg shadow-lg transform rotate-12 hover:rotate-0 transition-all duration-500 hover-lift z-0"
              whileHover={{ scale: 1.05 }}
            >
              <div className="w-28 aspect-square rounded overflow-hidden">
                <img
                  src="https://images.pexels.com/photos/984935/pexels-photo-984935.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
                  alt="Casal na praia"
                  className="object-cover w-full h-full"
                />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
