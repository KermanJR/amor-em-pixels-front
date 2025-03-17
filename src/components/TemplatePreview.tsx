
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Sparkles, Check, Star, Heart, Music, Camera, Video, Calendar } from 'lucide-react';

export type TemplateType = 'classic' | 'modern' | 'elegant' | 'minimalist' | 'site';

interface TemplatePreviewProps {
  selectedTemplate: TemplateType;
  onChange: (template: TemplateType) => void;
  className?: string;
}

const TemplatePreview = ({
  selectedTemplate,
  onChange,
  className
}: TemplatePreviewProps) => {
  const [hoveredTemplate, setHoveredTemplate] = useState<TemplateType | null>(null);
  
  const templates = [
    {
      id: 'classic',
      name: 'Clássico Romântico',
      description: 'Design romântico com animações suaves e estilo emocional.',
      image: 'https://images.pexels.com/photos/31124078/pexels-photo-31124078.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      features: [
        'Fundo com tons pastéis',
        'Animação de fade-in para mídias',
        'Música automática ao abrir',
        'Botão de surpresa com efeito'
      ],
      isPremium: false
    },
    {
      id: 'modern',
      name: 'Moderno e Minimalista',
      description: 'Design clean e minimalista com interações elegantes.',
      image: 'https://images.pexels.com/photos/31090743/pexels-photo-31090743.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      features: [
        'Fundo branco com detalhes geométricos',
        'Rolagem interativa para mídias',
        'Controle de música opcional',
        'Efeito parallax nas imagens'
      ],
      isPremium: true
    },
    {
      id: 'elegant',
      name: 'Elegante e Sofisticado',
      description: 'Layout sofisticado com efeitos de transição elegantes e tipografia premium.',
      image: 'https://images.unsplash.com/photo-1537633552985-df8429e8048b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      features: [
        'Tipografia elegante e espaçada',
        'Transições de página suaves',
        'Galeria com zoom e lightbox',
        'Timeline interativa do relacionamento'
      ],
      isPremium: true
    },
    {
      id: 'minimalist',
      name: 'Minimalista Artístico',
      description: 'Design limpo e artístico com foco em tipografia e espaço negativo.',
      image: 'https://images.pexels.com/photos/31127885/pexels-photo-31127885/free-photo-of-casal-romantico-deitado-na-pastagem.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      features: [
        'Layout com amplo espaço negativo',
        'Foco em tipografia artística',
        'Transições sutis entre elementos',
        'Modo escuro automático'
      ],
      isPremium: true
    }
    ,  {
      id: 'site',
      name: 'Minimalista Artístico',
      description: 'Design limpo e artístico com foco em tipografia e espaço negativo.',
      image: 'https://images.pexels.com/photos/31127885/pexels-photo-31127885/free-photo-of-casal-romantico-deitado-na-pastagem.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      features: [
        'Layout com amplo espaço negativo',
        'Foco em tipografia artística',
        'Transições sutis entre elementos',
        'Modo escuro automático'
      ],
      isPremium: true
    }
  ];
  
  return (
    <div className={cn("space-y-6", className)}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {templates.map((template) => {
          const isSelected = selectedTemplate === template.id as TemplateType;
          const isHovered = hoveredTemplate === template.id as TemplateType;
          
          return (
            <div
              key={template.id}
              className={cn(
                "group relative rounded-xl overflow-hidden border-2 transition-all duration-300",
                isSelected ? "border-love-500 shadow-md" : "border-gray-200 hover:border-love-300",
                "cursor-pointer"
              )}
              onClick={() => onChange(template.id as TemplateType)}
              onMouseEnter={() => setHoveredTemplate(template.id as TemplateType)}
              onMouseLeave={() => setHoveredTemplate(null)}
            >
              {/* Selected indicator */}
              {isSelected && (
                <div className="absolute top-3 right-3 z-10 flex items-center justify-center h-6 w-6 rounded-full bg-love-500 text-white">
                  <Check className="h-4 w-4" />
                </div>
              )}
              
              {/* Template preview image */}
              <div className="aspect-[3/2] w-full overflow-hidden">
                <div className="relative w-full h-full">
                  <img
                    src={template.image}
                    alt={template.name}
                    className={cn(
                      "w-full h-full object-cover transition-transform duration-700",
                      (isHovered || isSelected) ? "scale-110" : "scale-105"
                    )}
                  />
                  
                  {/* Overlay */}
                  <div className={cn(
                    "absolute inset-0 bg-gradient-to-t from-black/70 to-transparent transition-opacity duration-300",
                    (isHovered || isSelected) ? "opacity-80" : "opacity-60"
                  )}>
                  </div>
                  
                  {/* Template name on image */}
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-white font-semibold text-xl mb-1">
                      {template.name}
                    </h3>
                    <p className="text-white/80 text-sm line-clamp-2">
                      {template.description}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Template features */}
              <div className="p-4 bg-white">
                <h4 className="font-medium text-gray-900 mb-2">Características:</h4>
                <ul className="space-y-1">
                  {template.features.map((feature, i) => (
                    <li key={i} className="flex items-start text-sm text-gray-600">
                      <div className="flex-shrink-0 h-5 w-5 text-love-500 mr-1.5">
                        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              {/* Selection button */}
              <div className={cn(
                "p-4 bg-gray-50 transition-colors duration-300",
                isSelected ? "bg-love-50" : ""
              )}>
                <Button
                  type="button"
                  variant={isSelected ? "default" : "outline"}
                  className={cn(
                    "w-full",
                    isSelected ? "bg-love-500 hover:bg-love-600" : "border-love-200 text-love-600 hover:bg-love-50"
                  )}
                  onClick={() => onChange(template.id as TemplateType)}
                >
                  {isSelected ? "Selecionado" : "Selecionar Template"}
                </Button>
              </div>
              
              {/* Premium badge */}
              {template.isPremium && (
                <div className="absolute top-3 left-3 z-10 flex items-center space-x-1 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 px-2.5 py-0.5 text-xs font-medium text-white">
                  <Sparkles className="h-3 w-3 mr-1" />
                  <span>Premium</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TemplatePreview;
