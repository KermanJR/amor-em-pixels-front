
import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ExternalLink, Heart } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

type Example = {
  id: string;
  title: string;
  description: string;
  image: string;
  template: string;
  tags: string[];
};

const examples: Example[] = [
  {
    id: "aniversario-namoro",
    title: "1 Ano de Namoro",
    description: "Celebrando os momentos mais especiais do primeiro ano juntos com fotos, vídeos e uma timeline.",
    image: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b",
    template: "Clássico Romântico",
    tags: ["Aniversário", "Namoro", "Timeline"]
  },
  {
    id: "pedido-casamento",
    title: "Pedido de Casamento",
    description: "Um site surpreendente para pedir a pessoa amada em casamento com mensagens e momentos memoráveis.",
    image: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d",
    template: "Moderno e Minimalista",
    tags: ["Casamento", "Surpresa", "Especial"]
  },
  {
    id: "primeiro-encontro",
    title: "Nosso Primeiro Encontro",
    description: "Relembrando com carinho como tudo começou, desde o primeiro olhar até o primeiro beijo.",
    image: "https://images.unsplash.com/photo-1649972904349-6e44c42644a7",
    template: "Clássico Romântico",
    tags: ["Memórias", "Encontro", "Início"]
  },
  {
    id: "viagem-romantica",
    title: "Nossa Viagem Inesquecível",
    description: "Um álbum interativo da viagem que marcou o relacionamento, com mapas e momentos especiais.",
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475",
    template: "Moderno e Minimalista",
    tags: ["Viagem", "Aventura", "Galeria"]
  },
  {
    id: "dia-dos-namorados",
    title: "Dia dos Namorados Especial",
    description: "Presente virtual para celebrar o Dia dos Namorados com estilo e muito amor.",
    image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6",
    template: "Clássico Romântico",
    tags: ["Dia dos Namorados", "Presente", "Romântico"]
  },
  {
    id: "declaracao-amor",
    title: "Declaração de Amor",
    description: "Uma forma diferente de dizer 'Eu te amo' com um site repleto de sentimentos e memórias.",
    image: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b",
    template: "Moderno e Minimalista",
    tags: ["Declaração", "Romântico", "Surpresa"]
  }
];

const ExampleCard = ({ example }: { example: Example }) => {
  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-md group border-gray-200">
      <div className="relative aspect-video overflow-hidden">
        <img 
          src={example.image} 
          alt={example.title} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
          <div className="p-4 text-white">
            <p className="text-xs uppercase tracking-wider mb-1">{example.template}</p>
            <h3 className="font-bold text-xl">{example.title}</h3>
          </div>
        </div>
      </div>
      <CardContent className="p-4">
        <p className="text-gray-600 text-sm mb-3">{example.description}</p>
        <div className="flex flex-wrap gap-2 mb-4">
          {example.tags.map((tag) => (
            <span 
              key={tag} 
              className="bg-love-50 text-love-600 text-xs px-2 py-1 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
        <Button 
          variant="outline" 
          size="sm"
          className="w-full gap-2 border-love-200 text-love-600 hover:bg-love-50"
        >
          <ExternalLink className="h-4 w-4" />
          Ver Demonstração
        </Button>
      </CardContent>
    </Card>
  );
};

const Exemplos = () => {
  const [isPageLoaded, setIsPageLoaded] = useState(false);
  const [filteredExamples, setFilteredExamples] = useState<Example[]>(examples);
  const [activeFilter, setActiveFilter] = useState<string>("todos");
  
  useEffect(() => {
    // Add a small delay for animation purposes
    const timer = setTimeout(() => {
      setIsPageLoaded(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);
  
  const filterExamples = (filter: string) => {
    setActiveFilter(filter);
    
    if (filter === "todos") {
      setFilteredExamples(examples);
      return;
    }
    
    if (filter === "classico") {
      setFilteredExamples(examples.filter(ex => ex.template === "Clássico Romântico"));
      return;
    }
    
    if (filter === "moderno") {
      setFilteredExamples(examples.filter(ex => ex.template === "Moderno e Minimalista"));
      return;
    }
    
    // Filter by tags
    setFilteredExamples(examples.filter(ex => 
      ex.tags.some(tag => tag.toLowerCase() === filter.toLowerCase())
    ));
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-32 pb-20">
        <div className="container px-4 mx-auto">
          <div 
            className={`max-w-6xl mx-auto transition-all duration-500 transform ${
              isPageLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
            }`}
          >
            <div className="text-center mb-16">
              <h1 className="text-3xl md:text-4xl font-bold mb-4">
                Exemplos e Inspirações
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Explore alguns exemplos do que é possível criar com nossa plataforma 
                e inspire-se para o seu presente digital.
              </p>
            </div>
            
            {/* Filters */}
            <div className="flex flex-wrap gap-2 justify-center mb-10">
              {[
                { id: "todos", label: "Todos" },
                { id: "classico", label: "Clássico Romântico" },
                { id: "moderno", label: "Moderno e Minimalista" },
                { id: "aniversario", label: "Aniversário" },
                { id: "surpresa", label: "Surpresa" }
              ].map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => filterExamples(filter.id)}
                  className={`px-4 py-2 rounded-full text-sm transition-colors ${
                    activeFilter === filter.id 
                      ? 'bg-love-500 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
            
            {/* Examples Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
              {filteredExamples.map((example) => (
                <ExampleCard key={example.id} example={example} />
              ))}
            </div>
            
            {/* CTA */}
            <div className="text-center bg-love-50 rounded-xl p-8 md:p-12 mb-16">
              <Heart className="h-12 w-12 text-love-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-4">Inspirado para criar o seu?</h2>
              <p className="text-gray-700 mb-6 max-w-2xl mx-auto">
                Agora é sua vez de criar um presente digital único que 
                irá surpreender e emocionar quem você ama.
              </p>
              
              <Button 
                className="bg-love-600 hover:bg-love-700 text-white"
                size="lg"
                asChild
              >
                <Link to="/criar">
                  Crie o Seu Agora
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Exemplos;
