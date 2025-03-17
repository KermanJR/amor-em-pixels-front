import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Heart, Flower, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const CallToAction = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 });

  return (
    <motion.section
      ref={sectionRef}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.8 }}
      className="py-16 sm:py-24 relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, pink-100, purple-200, blue-100)',
      }}
    >
      {/* Elementos decorativos animados */}
      <div className="absolute inset-0 -z-10">
        <motion.div
          className="absolute top-10 left-10 w-48 h-48 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-float"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.5 }}
          transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse' }}
        />
        <motion.div
          className="absolute bottom-10 right-10 w-48 h-48 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-float-delay"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 0.5 }}
          transition={{ duration: 2.5, repeat: Infinity, repeatType: 'reverse' }}
        />
        <motion.div
          className="absolute top-1/3 left-1/4 transform -translate-y-1/2"
          initial={{ opacity: 0, rotate: 0 }}
          animate={{ opacity: 0.3, rotate: 360 }}
          transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
        >
          <Heart className="h-12 w-12 text-pink-600 animate-pulse" />
        </motion.div>
        <motion.div
          className="absolute bottom-1/3 right-1/4"
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 0.3, scale: 1 }}
          transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse' }}
        >
          <Flower className="h-10 w-10 text-purple-200 animate-pulse" />
        </motion.div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          className="bg-white/90 border border-pink-200/30 rounded-3xl p-8 md:p-12 shadow-2xl hover:shadow-3xl transition-all duration-500"
          initial={{ scale: 0.95 }}
          animate={isInView ? { scale: 1 } : { scale: 0.95 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-serif text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-700 mb-6">
              Surpreenda seu amor HOJE!
            </h2>

            <p className="text-lg md:text-xl text-gray-700 mb-8 max-w-2xl mx-auto font-medium">
              Comece agora a criar um Card Digital único com fotos, vídeos e músicas que contam a história do seu amor!
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/criar">
                <Button
                  size="lg"
                  className="w-full sm:w-auto bg-gradient-to-r from-pink-600 to-purple-700 hover:from-pink-700 hover:to-purple-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 group transform hover:-translate-y-1"
                >
                  Criar meu Card Digital
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>

           
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
};

// Animações customizadas
const animateFloat = `
  @keyframes float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
  }
`;

const animateFloatDelay = `
  @keyframes float-delay {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-15px); }
  }
`;

const animatePulse = `
  @keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.1); }
  }
`;

const styles = `
  ${animateFloat}
  ${animateFloatDelay}
  ${animatePulse}
  .animate-float { animation: float 3s ease-in-out infinite; }
  .animate-float-delay { animation: float-delay 3.5s ease-in-out infinite; }
  .animate-pulse { animation: pulse 2s ease-in-out infinite; }
`;

const styleSheet = document.createElement('style');
styleSheet.textContent = styles;
document.head.appendChild(styleSheet);

export default CallToAction;
