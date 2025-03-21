import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Heart, Image, Video, Music, Link as LinkIcon, Sparkles, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';
import { Link } from 'react-router-dom';

const steps = [
  {
    step: 1,
    title: "Crie sua conta",
    description: "Registre-se gratuitamente e comece a criar seu presente digital personalizado.",
    icon: Sparkles,
  },
  {
    step: 2,
    title: "Personalize",
    description: "Envie fotos, vídeos, textos especiais e escolha uma música que represente o casal.",
    icon: Heart,
  },
  {
    step: 3,
    title: "Escolha o Plano",
    description: "Selecione entre os planos disponíveis até o momento.",
    icon: Star,
  },
  {
    step: 4,
    title: "Compartilhe",
    description: "Receba um link QRCode único e compartilhe com seu amor para criar um momento inesquecível.",
    icon: LinkIcon,
  },
];

const features = [
  { icon: Image, title: "Fotos", description: "Adicione suas fotos favoritas para recordar momentos especiais juntos." },
  { icon: Video, title: "Vídeos", description: "Compartilhe vídeos que contam sua história de amor ou momentos divertidos." },
  { icon: Music, title: "Música", description: "Escolha uma música especial para tocar enquanto seu amor navega pelo site." },
  { icon: Heart, title: "Mensagens", description: "Escreva mensagens de amor que tocam o coração e expressam seus sentimentos." },
  {
    icon: Star,
    title: "Datas Especiais",
    description: "Destaque datas importantes do relacionamento com contadores personalizados. (Em breve!)",
    comingSoon: true,
  },
  {
    icon: Sparkles,
    title: "Designs Exclusivos",
    description: "Escolha entre templates românticos ou modernos com animações especiais. (Em breve!)",
    comingSoon: true,
  },
];

const StepCard = ({ step, index }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 50, scale: 0.9 }}
      transition={{ duration: 0.6, delay: index * 0.2 }}
      className={cn(
        "relative bg-white p-6 rounded-2xl shadow-xl border border-pink-100/50 hover:shadow-2xl transition-all duration-300",
        "overflow-hidden backdrop-blur-sm transform hover:-translate-y-2"
      )}
      whileHover={{ scale: 1.05 }}
    >
      {/* Número do passo */}
      <div className="absolute top-4 left-4 w-12 h-12 flex items-center justify-center rounded-full bg-gradient-to-r from-pink-600 to-purple-700 text-white font-bold text-xl">
        {step.step}
      </div>
      {/* Ícone animado */}
      <motion.div
        className="absolute top-4 right-4"
        whileHover={{ scale: 1.2, rotate: 10 }}
        transition={{ duration: 0.3 }}
      >
        <step.icon className="h-8 w-8 text-pink-500 opacity-30 group-hover:opacity-70 transition-opacity duration-300" />
      </motion.div>
      <div className="mt-12 text-center space-y-4">
        <h3 className="text-2xl font-serif text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-800">
          {step.title}
        </h3>
        <p className="text-gray-600 text-base leading-relaxed">{step.description}</p>
      </div>
    </motion.div>
  );
};

const FeatureCard = ({ feature, index }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className={cn(
        "relative bg-gradient-to-br from-pink-50 to-purple-100 p-5 rounded-xl shadow-lg border border-pink-200/20",
        "group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1",
        feature.comingSoon && "opacity-70"
      )}
      whileHover={{ scale: 1.03 }}
    >
      {feature.comingSoon && (
        <span className="absolute top-2 right-2 text-xs font-semibold text-purple-600 bg-purple-100/80 px-2 py-1 rounded-full">
          Em Breve
        </span>
      )}
      <div className="flex items-center space-x-4">
        <motion.div
          className="p-3 rounded-full bg-white shadow-md"
          whileHover={{ scale: 1.1, rotate: 5 }}
        >
          <feature.icon className="h-6 w-6 text-pink-600 group-hover:text-purple-700 transition-colors duration-300" />
        </motion.div>
        <div>
          <h4 className="text-lg font-semibold text-gray-800">{feature.title}</h4>
          <p className="text-sm text-gray-600">{feature.description}</p>
        </div>
      </div>
    </motion.div>
  );
};

const Features = () => {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 });

  return (
    <section ref={sectionRef} className="py-20 lg:py-28 relative overflow-hidden">
      {/* Background com efeitos */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-white via-pink-50 to-purple-50">
        <motion.div
          className="absolute top-10 left-1/4 w-72 h-72 bg-gradient-to-r from-pink-200 to-purple-300 rounded-full mix-blend-overlay filter blur-3xl opacity-30"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3], x: [0, 20, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-20 right-1/3 w-96 h-96 bg-gradient-to-r from-purple-200 to-blue-300 rounded-full mix-blend-overlay filter blur-3xl opacity-20"
          animate={{ scale: [1, 1.15, 1], opacity: [0.2, 0.4, 0.2], y: [0, 30, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        />
        <svg className="absolute inset-0 w-full h-full opacity-10">
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
        </svg>
        <Sparkles className="absolute top-16 right-24 h-8 w-8 text-yellow-300 animate-twinkle opacity-40" />
      </div>

      <div className="container mx-auto px-6 lg:px-8 relative z-10">
        {/* Título */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-serif text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-800">
            Como Criar Seu Momento Mágico
          </h2>
          <p className="text-lg md:text-xl text-gray-700 mt-4 max-w-3xl mx-auto">
            Em apenas 4 passos, transforme suas memórias em um presente digital inesquecível.
          </p>
        </motion.div>

        {/* Passos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {steps.map((step, index) => (
            <StepCard key={step.step} step={step} index={index} />
          ))}
        </div>

        {/* O que você pode incluir */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-center mb-12"
        >
          <h3 className="text-3xl font-serif text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-800">
            O Que Você Pode Incluir
          </h3>
          <p className="text-lg text-gray-600 mt-2 max-w-2xl mx-auto">
            Personalize seu Card Digital com os elementos que tornam sua história única.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <FeatureCard key={index} feature={feature} index={index} />
          ))}
        </div>

        {/* Call-to-Action */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-center mt-16"
        >
          <Button
            asChild
            className="w-full sm:w-80 h-16 text-xl bg-gradient-to-r from-pink-600 to-purple-800 hover:from-pink-700 hover:to-purple-900 text-white font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
          >
            <Link to="/criar">Comece Agora</Link>
          </Button>
        </motion.div>
      </div>

      {/* Estilos */}
      <style jsx>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }
        @keyframes draw {
          0% { stroke-dashoffset: 2000; }
          100% { stroke-dashoffset: 0; }
        }
        .animate-twinkle {
          animation: twinkle 2s ease-in-out infinite;
        }
        .animate-draw {
          stroke-dasharray: 2000;
          stroke-dashoffset: 2000;
          animation: draw 10s linear infinite;
        }
      `}</style>
    </section>
  );
};

export default Features;
