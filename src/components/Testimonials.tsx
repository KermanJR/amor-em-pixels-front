import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Star, Heart, Flower } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';
import { Link } from 'react-router-dom';

const testimonials = [
  {
    content: "Criei um site para nosso aniversário de namoro e minha namorada não conteve as lágrimas! Foi o presente mais especial que já dei na vida!",
    author: "Ricardo",
    relationship: "Namorando há 2 anos",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
  },
  {
    content: "Quer surpreender seu amor? Esse site é perfeito! Fiz em menos de 30 minutos com fotos, vídeos e nossa música. Meu marido amou e mostra para todos os amigos!",
    author: "Mariana",
    relationship: "Casada há 5 anos",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
  },
  {
    content: "Escolhi o plano Premium e não me arrependo! Sem marca d'água, com efeitos exclusivos e um design incrível. Meu noivo ficou encantado!",
    author: "Carlos",
    relationship: "Noivo",
    avatar: "https://randomuser.me/api/portraits/men/15.jpg",
  },
  {
    content: "Fiz um site para o aniversário do meu marido e foi um sucesso! A facilidade de criar e o resultado lindo me surpreenderam. Um presente que ele nunca vai esquecer!",
    author: "Juliana",
    relationship: "Casada há 1 ano",
    avatar: "https://randomuser.me/api/portraits/women/63.jpg",
  },
];

const TestimonialCard = ({ 
  testimonial, 
  index 
}: { 
  testimonial: typeof testimonials[0], 
  index: number 
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50, scale: 0.95 }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 50, scale: 0.95 }}
      transition={{ duration: 0.6, delay: index * 0.15 }}
      className={cn(
        "bg-white/95 rounded-2xl p-6 shadow-lg border border-[#f4a8b7]/30 hover:border-[#d46b82]/50",
        "hover:shadow-2xl transition-all duration-500 relative overflow-hidden transform hover:-translate-y-2"
      )}
      whileHover={{ scale: 1.03, transition: { duration: 0.3 } }}
    >
      {/* Elemento decorativo no canto */}
      <motion.div
        className="absolute top-2 right-2"
        initial={{ opacity: 0, rotate: 0 }}
        animate={{ opacity: 0.3, rotate: 360 }}
        transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
      >
        <Heart className="h-6 w-6 text-[#f4a8b7]/50 animate-pulse" />
      </motion.div>

      <div className="flex space-x-1 mb-4">
        {[...Array(5)].map((_, i) => (
          <Star key={i} className="h-5 w-5 fill-[#ffeb3b] text-[#ffeb3b] animate-twinkle" style={{ animationDelay: `${i * 0.2}s` }} />
        ))}
      </div>

      <p className="text-gray-700 mb-6 text-sm sm:text-base italic">
        "{testimonial.content}"
      </p>

      <div className="flex items-center">
        <div className="h-12 w-12 rounded-full overflow-hidden mr-4 border-2 border-[#f4a8b7]/50">
          <img
            src={testimonial.avatar}
            alt={testimonial.author}
            className="h-full w-full object-cover"
          />
        </div>

        <div>
          <h4 className="font-semibold text-[#d46b82]">{testimonial.author}</h4>
          <p className="text-sm text-gray-600">{testimonial.relationship}</p>
        </div>
      </div>
    </motion.div>
  );
};

const Testimonials = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 });

  return (
    <section
      ref={sectionRef}
      className="py-16 sm:py-24 relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #fff5f7 0%, #fef0f2 100%)',
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
          <Flower className="h-12 w-12 text-[#f4a8b7]" />
        </motion.div>
        <motion.div
          className="absolute bottom-10 right-10 animate-float-delay"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 0.2, y: 0 }}
          transition={{ duration: 2.5, repeat: Infinity, repeatType: 'reverse' }}
        >
          <Heart className="h-16 w-16 text-[#d46b82] animate-pulse" />
        </motion.div>
        <motion.div
          className="absolute top-1/2 left-1/4 transform -translate-y-1/2 animate-float"
          initial={{ opacity: 0, rotate: 0 }}
          animate={{ opacity: 0.2, rotate: 360 }}
          transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
        >
          <Star className="h-8 w-8 text-[#ffeb3b]" />
        </motion.div>
        <motion.div
          className="absolute top-1/3 right-1/4 animate-float-delay"
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 0.2, scale: 1 }}
          transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse' }}
        >
          <Heart className="h-10 w-10 text-[#f4a8b7] animate-pulse" />
        </motion.div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Título e Subtítulo */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8 }}
          className="max-w-3xl mx-auto text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-serif text-transparent bg-clip-text bg-gradient-to-r from-[#d46b82] to-[#c0586e] mb-6">
            Histórias de Amor que Inspiram!
          </h2>
          <p className="text-lg md:text-xl text-gray-700">
            Veja como nossos usuários emocionaram seus amores com presentes digitais únicos e inesquecíveis.
          </p>
        </motion.div>

        {/* Depoimentos */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {testimonials.map((testimonial, index) => (
            <TestimonialCard key={index} testimonial={testimonial} index={index} />
          ))}
        </motion.div>

        {/* CTA Final */}
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={isInView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 50, scale: 0.95 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-center py-10 bg-gradient-to-br from-[#fff5f7] to-[#ffe6ea] rounded-xl shadow-lg border border-[#f4a8b7]/30 relative"
        >
          <Heart className="absolute top-4 left-4 h-6 w-6 text-[#f4a8b7]/40 animate-pulse" />
          <Heart className="absolute bottom-4 right-4 h-6 w-6 text-[#f4a8b7]/40 animate-pulse" />
          <h3 className="text-3xl sm:text-4xl font-serif text-transparent bg-clip-text bg-gradient-to-r from-[#d46b82] to-[#c0586e] mb-4">
            Crie Sua Própria História!
          </h3>
          <p className="text-gray-700 mb-6 text-sm sm:text-base font-medium">
            Surpreenda quem você ama com um presente digital único e emocionante!
          </p>
          <Button
            asChild
            className="bg-gradient-to-r from-[#d46b82] to-[#c0586e] hover:from-[#c0586e] hover:to-[#a53c5a] text-white text-sm sm:text-base py-3 px-8 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
          >
            <Link to="/criar">Criar Meu Site Agora</Link>
          </Button>
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

const styles = `
  ${animateFloat}
  ${animateFloatDelay}
  ${animatePulse}
  ${animateTwinkle}
  .animate-float { animation: float 3s ease-in-out infinite; }
  .animate-float-delay { animation: float-delay 3.5s ease-in-out infinite; }
  .animate-pulse { animation: pulse 2s ease-in-out infinite; }
  .animate-twinkle { animation: twinkle 2.5s ease-in-out infinite; }
`;

const styleSheet = document.createElement('style');
styleSheet.textContent = styles;
document.head.appendChild(styleSheet);

export default Testimonials;