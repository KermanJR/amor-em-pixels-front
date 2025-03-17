import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { 
  Heart, 
  Image, 
  Music, 
  Link as LinkIcon, 
  CheckCircle, 
  Sparkles,
  Video, 
  Layout, 
  XCircle,
  CheckCircle2,
  Star,
  Flower,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';
import { Link } from 'react-router-dom';

const features = [
  {
    icon: Image,
    title: "Galeria de Memórias",
    description: "Adicione até 8 fotos para eternizar os melhores momentos do seu amor!",
  },
  {
    icon: Video,
    title: "Vídeos Emocionantes",
    description: "Inclua até 2 vídeos para reviver os instantes mais especiais!",
  },
  {
    icon: Music,
    title: "Trilha do Amor",
    description: "Escolha até 2 músicas que contam sua história de paixão!",
  },
  
  {
    icon: LinkIcon,
    title: "Link QRCODE",
    description: "Surpreenda com um link QRCODE único para compartilhar seu amor!",
  },
  {
    icon: Heart,
    title: "Presente Inesquecível",
    description: "Crie um presente que vai emocionar para sempre!",
  },
];

const FeatureCard = ({ feature, index }: { feature: typeof features[0], index: number }) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 50, scale: 0.9 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className={cn(
        
        "bg-gradient-to-br from-pink-100 via-purple-200 to-blue-100 group  rounded-xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border border-pink-200/30",
        "relative overflow-hidden backdrop-blur-sm cursor-pointer transform hover:-translate-y-2"
      )}
      whileHover={{ scale: 1.05, transition: { duration: 0.3 } }}
    >
      {/* Detalhe floral animado */}
      <motion.div
        className="absolute top-2 right-2"
        initial={{ opacity: 0, rotate: 0 }}
        animate={{ opacity: 0.3, rotate: 360 }}
        transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
      >
        <Flower className="h-6 w-6 text-pink-200/50 group-hover:text-pink-300 transition-colors duration-300" />
      </motion.div>
      <div className="flex flex-col items-center text-center space-y-4">
        <motion.div
          whileHover={{ scale: 1.2, rotate: 10, transition: { duration: 0.4 } }}
          className="p-4 rounded-full bg-gradient-to-br from-pink-100 to-purple-200/50 group-hover:bg-pink-100 transition-all duration-300"
        >
          <feature.icon className="h-10 w-10 text-pink-600 group-hover:text-purple-700 transition-colors duration-300" />
        </motion.div>
        <h3 className="text-xl font-serif text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-700">
          {feature.title}
        </h3>
        <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
          {feature.description}
        </p>
      </div>
    </motion.div>
  );
};

const plans: Plan[] = [

  {
    name: 'Básico',
    price: 'R$ 25,90',
    description: 'Mais amor e recursos por 6 meses!',
    features: [
      { feature: '5 fotos por Card Digital', included: true },
      { feature: '1 vídeos por Card Digital', included: true },
      { feature: '1 música por Card Digital', included: true },
      { feature: 'Link QRCODE compartilhável', included: true },
      { feature: 'Validade de 6 meses', included: true },
      { feature: 'Suporte prioritário', included: true },
      { feature: 'Gerar cartão romântico PDF', included: false },
      { feature: 'Campos extras (memórias, sonhos)', included: false },
      { feature: 'Suporte 24/7', included: false },
    ],
    buttonText: 'Escolher Básico',
    popular: false,
    linkTo: '/criar?plan=basic',
  },
  {
    name: 'Premium',
    price: 'R$ 49,90',
    description: 'O plano dos SONHOS para 12 meses de amor!',
    features: [
      { feature: '8 fotos por Card Digital', included: true },
      { feature: '1 vídeos por Card Digital', included: true },
      { feature: '1 músicas por Card Digital', included: true },
      { feature: 'Link QRCODE compartilhável', included: true },
      { feature: 'Campos extras (memórias, sonhos)', included: true },
      { feature: 'Suporte 24/7', included: true },
      { feature: 'Gerar cartão romântico PDF', included: true },
      { feature: 'Validade de 12 meses', included: true },
    ],
    buttonText: 'Escolher Premium',
    popular: true,
    linkTo: '/criar?plan=premium',
  },
];
type PlanFeature = { feature: string; included: boolean };
type Plan = { name: string; price: string; description: string; features: PlanFeature[]; buttonText: string; popular?: boolean; linkTo: string };

const PlanCard = ({ plan }: { plan: Plan }) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50, scale: 0.95 }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 50, scale: 0.95 }}
      transition={{ duration: 0.6 }}
      className={cn(
        "rounded-xl p-6 sm:p-8 shadow-lg border transition-all duration-300 relative overflow-hidden",
        plan.popular ? 'border-pink-600 bg-gradient-to-br from-pink-100 to-purple-200' : 'border-pink-200/30 bg-white hover:border-pink-300/50'
      )}
      whileHover={{ scale: 1.03, transition: { duration: 0.3 } }}
    >
      <Heart className="absolute top-3 right-3 h-6 w-6 text-pink-200/40 animate-pulse" />
      {plan.popular && (
        <motion.div
          className="rounded-full bg-gradient-to-r from-pink-600 to-purple-700 text-white text-sm font-bold uppercase tracking-wide py-1 px-4 inline-block mb-4 animate-pulse-slow"
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5, repeat: Infinity, repeatType: 'reverse' }}
        >
          Mais Popular
        </motion.div>
      )}
      <h3 className="text-2xl font-serif text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-700 mb-3">
        {plan.name}
      </h3>
      <div className="mb-4">
        <span className="text-3xl font-bold text-pink-600">{plan.price}</span>
        {plan.price !== 'R$ 0,00' && <span className="text-gray-600 ml-1 text-sm">/pacote único</span>}
      </div>
      <p className="text-gray-700 mb-6 text-sm sm:text-base leading-relaxed font-medium">
        {plan.description}
      </p>
      <Button
        className={cn(
          "w-full mb-6 text-sm sm:text-base py-3 rounded-lg shadow-md",
          plan.popular ? 'bg-gradient-to-r from-pink-600 to-purple-700 hover:from-pink-700 hover:to-purple-800 text-white' : 'bg-white border-2 border-pink-600 text-pink-600 hover:bg-pink-50 hover:text-purple-700'
        )}
        variant={plan.popular ? 'default' : 'outline'}
        asChild
      >
        <Link to={plan.linkTo}>{plan.buttonText}</Link>
      </Button>
      <div className="space-y-3 sm:space-y-4">
        {plan.features.map((feature, index) => (
          <div key={index} className="flex items-start">
            {feature.included ? (
              <CheckCircle2 className="h-5 w-5 text-pink-600 mt-0.5 mr-3 flex-shrink-0 animate-pulse-slow" />
            ) : (
              <XCircle className="h-5 w-5 text-gray-400 mt-0.5 mr-3 flex-shrink-0" />
            )}
            <span className={feature.included ? 'text-gray-700 font-medium' : 'text-gray-400 text-sm sm:text-base'}>
              {feature.feature}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

const Features = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 });

  return (
    <section
      ref={sectionRef}
      className="py-16 sm:py-24 relative overflow-hidden"
      style={{
        background: 'bg-gradient-to-br from-pink-100 via-purple-200 to-blue-100',
      }}
    >
      {/* Elementos decorativos animados */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <motion.div
          className="absolute top-10 left-10 animate-float"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.2, scale: 1 }}
          transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse' }}
        >
          <Flower className="h-12 w-12 text-pink-200" />
        </motion.div>
        <motion.div
          className="absolute bottom-10 right-10 animate-float-delay"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 0.2, y: 0 }}
          transition={{ duration: 2.5, repeat: Infinity, repeatType: 'reverse' }}
        >
          <Heart className="h-16 w-16 text-pink-600 animate-pulse" />
        </motion.div>
        <motion.div
          className="absolute top-1/2 left-1/4 transform -translate-y-1/2 animate-float"
          initial={{ opacity: 0, rotate: 0 }}
          animate={{ opacity: 0.2, rotate: 360 }}
          transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
        >
          <Star className="h-8 w-8 text-yellow-400" />
        </motion.div>
        <motion.div
          className="absolute top-1/3 right-1/4 animate-float-delay"
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 0.2, scale: 1 }}
          transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse' }}
        >
          <Heart className="h-10 w-10 text-purple-200 animate-pulse" />
        </motion.div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Seção de Título e Depoimento */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto text-center mb-12 sm:mb-16"
        >
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-serif text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-700 mb-4">
            Desperte Emoções com Nossos Recursos!
          </h2>
          <p className="text-lg md:text-xl text-gray-700 mb-6 font-medium">
            Crie um Card Digital único com fotos, vídeos e músicas que vão tocar o coração de quem você ama!{' '}
            <span className="text-pink-600 font-bold">Comece agora!</span>
          </p>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="bg-white/90 p-6 sm:p-8 rounded-xl shadow-lg border border-pink-200/30 max-w-2xl mx-auto relative"
          >
            <Flower className="absolute top-2 left-2 h-6 w-6 text-pink-200/40 animate-spin-slow" />
            <Flower className="absolute bottom-2 right-2 h-6 w-6 text-pink-200/40 animate-spin-slow" />
            <p className="text-gray-700 italic text-sm sm:text-base">
              "Meu Card Digital surpreendeu minha esposa! Ela chorou de alegria – o melhor presente ever!" – João, 32 anos
            </p>
            <div className="mt-2 flex items-center justify-center gap-2 text-pink-600">
              <Star className="h-4 w-4 fill-pink-600 animate-twinkle" />
              <Star className="h-4 w-4 fill-pink-600 animate-twinkle" />
              <Star className="h-4 w-4 fill-pink-600 animate-twinkle" />
              <Star className="h-4 w-4 fill-pink-600 animate-twinkle" />
              <Star className="h-4 w-4 fill-pink-600 animate-twinkle" />
            </div>
          </motion.div>
        </motion.div>

        {/* Seção de Recursos */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-16 sm:mb-20"
        >
          {features.map((feature, index) => (
            <FeatureCard key={index} feature={feature} index={index} />
          ))}
        </motion.div>

        {/* Seção de Planos */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-center mb-12 sm:mb-16"
        >
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-serif text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-700 mb-4">
            Escolha o Plano dos Seus Sonhos!
          </h2>
          <p className="text-lg md:text-xl text-gray-700 max-w-3xl mx-auto mb-8 font-medium">
            Selecione o plano perfeito e crie um presente mágico para impressionar HOJE!
          </p>
          <Button
            asChild
            className="bg-gradient-to-r from-pink-600 to-purple-700 hover:from-pink-700 hover:to-purple-800 text-white text-sm sm:text-base py-3 px-6 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
          >
            <Link to="/precos">Explorar Todos os Planos</Link>
          </Button>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          {plans.map((plan, index) => (
            <PlanCard key={index} plan={plan} />
          ))}
        </motion.div>
      </div>
    </section>
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

const animateTwinkle = `
  @keyframes twinkle {
    0%, 100% { opacity: 0.3; }
    50% { opacity: 1; }
  }
`;

const animateSpinSlow = `
  @keyframes spin-slow {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

const styles = `
  ${animateFloat}
  ${animateFloatDelay}
  ${animatePulse}
  ${animateTwinkle}
  ${animateSpinSlow}
  .animate-float { animation: float 3s ease-in-out infinite; }
  .animate-float-delay { animation: float-delay 3.5s ease-in-out infinite; }
  .animate-pulse { animation: pulse 2s ease-in-out infinite; }
  .animate-twinkle { animation: twinkle 2.5s ease-in-out infinite; }
  .animate-spin-slow { animation: spin-slow 6s linear infinite; }
  .hover-lift:hover { transform: translateY(-5px); }
`;

const styleSheet = document.createElement('style');
styleSheet.textContent = styles;
document.head.appendChild(styleSheet);

export default Features;
