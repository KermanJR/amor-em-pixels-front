import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { CheckCircle, Sparkles, Heart } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useToast } from '@/hooks/use-toast';

const Confirmation = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  const success = searchParams.get('success') === 'true';
  const siteId = searchParams.get('siteId');

  useEffect(() => {
    if (success) {
      toast({
        title: 'Pagamento Confirmado! 💕',
        description: 'Seu card digital foi criado com sucesso. Você receberá o link por e-mail.',
      });
    } else {
      toast({
        title: 'Pagamento Cancelado',
        description: 'O pagamento foi cancelado. Você pode tentar novamente.',
        variant: 'destructive',
      });
    }
  }, [success, toast]);

  const handleCreateNewCard = () => {
    navigate('/criar');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 via-purple-50 to-blue-50 relative overflow-hidden">
      <Navbar />
      {/* Aumentar o padding-top para dar mais espaço abaixo da navbar */}
      <main className="container mx-auto pt-24 pb-16 px-4 lg:px-8 flex flex-col items-center justify-center relative z-10">
        {/* Partículas Animadas */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(30)].map((_, idx) => (
            <motion.div
              key={idx}
              className="absolute w-2 h-2 bg-gradient-to-r from-pink-300 to-purple-400 rounded-full"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                opacity: Math.random() * 0.5 + 0.2,
              }}
              animate={{
                y: [0, -20, 0],
                opacity: [0.2, 0.5, 0.2],
              }}
              transition={{
                duration: Math.random() * 5 + 5,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>

        {/* Linhas Decorativas Sutil */}
        <div className="absolute inset-0 pointer-events-none">
          <svg className="w-full h-full opacity-10">
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
        </div>

        {/* Conteúdo Principal */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="text-center bg-white p-8 rounded-2xl shadow-xl max-w-lg w-full relative overflow-hidden"
        >
          {/* Elementos Decorativos no Fundo do Card */}
          <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-r from-pink-200 to-purple-300 rounded-full filter blur-3xl opacity-20 -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-r from-purple-200 to-blue-300 rounded-full filter blur-3xl opacity-20 translate-x-1/2 translate-y-1/2" />

          {success ? (
            <>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              </motion.div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 font-serif">
                Pagamento Confirmado! 💕
              </h1>
              <p className="text-lg text-gray-600 mb-6 font-sans leading-relaxed">
                Seu card digital foi criado com sucesso. Você receberá o link e a senha no e-mail informado.
              </p>
              <motion.div
                className="flex justify-center mb-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <Heart className="h-6 w-6 text-pink-500 animate-pulse mr-2" />
                <span className="text-sm text-gray-500 italic">Feito com amor por Amor em Pixels</span>
              </motion.div>
            </>
          ) : (
            <>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Sparkles className="h-16 w-16 text-red-500 mx-auto mb-4" />
              </motion.div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 font-serif">
                Pagamento Cancelado
              </h1>
              <p className="text-lg text-gray-600 mb-6 font-sans leading-relaxed">
                O pagamento foi cancelado. Você pode tentar novamente criando um novo card.
              </p>
              <motion.div
                className="flex justify-center mb-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <Heart className="h-6 w-6 text-pink-500 animate-pulse mr-2" />
                <span className="text-sm text-gray-500 italic">Tente novamente com Amor em Pixels</span>
              </motion.div>
            </>
          )}

          {/* Botão de Ação */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <Button
              onClick={handleCreateNewCard}
              className="bg-gradient-to-r from-pink-600 to-purple-800 hover:from-pink-700 hover:to-purple-900 text-white px-8 py-3 rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              Criar Novo Card Digital
              <Sparkles className="ml-2 h-5 w-5 animate-twinkle" />
            </Button>
          </motion.div>
        </motion.div>
      </main>
      <Footer />

      {/* Estilos */}
      <style jsx>{`
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
        .animate-twinkle {
          animation: twinkle 2s ease-in-out infinite;
        }
        .animate-pulse {
          animation: pulse 1.5s ease-in-out infinite;
        }
        /* Ajustes para responsividade */
        @media (max-width: 640px) {
          h1 {
            font-size: 2.5rem;
          }
          p {
            font-size: 1rem;
          }
          .container {
            padding-left: 1rem;
            padding-right: 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default Confirmation;
