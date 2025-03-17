import { useState, useEffect } from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

type PlanFeature = { feature: string; included: boolean };
type Plan = { name: string; price: string; description: string; features: PlanFeature[]; buttonText: string; popular?: boolean; linkTo: string };

const plans: Plan[] = [
  {
    name: 'Gratuito',
    price: 'R$ 0',
    description: 'Eternize seu amor com um site personalizado gratuito, com fotos, vídeos e músicas, para compartilhar por 6 meses.',
    features: [

      { feature: '2 fotos por site', included: true },
      { feature: '1 vídeo por site', included: true },
      { feature: '1 música por site', included: true },
      { feature: 'Link compartilhável', included: true },
      { feature: 'Validade de 3 meses', included: true },
      { feature: 'Suporte prioritário', included: false },
    ],
    buttonText: 'Começar Agora',
    linkTo: '/criar',
  },
  {
    name: 'Básico',
    price: 'R$ 25,90',
    description: 'Eternize seu amor com até 4 sites personalizados, mais fotos, vídeos e templates, por R$25,90, válidos por 6 meses.',
    features: [

      { feature: '5 fotos por site', included: true },
      { feature: '2 vídeos por site', included: true },
      { feature: '2 música por site', included: true },
      { feature: 'Link compartilhável', included: true },
      { feature: 'Validade de 6 meses', included: true },
      { feature: '8 fotos por site', included: false },
      { feature: '2 vídeos por site', included: false },
      { feature: '2 músicas por site', included: false },
      { feature: 'Campos extras (memórias, sonhos)', included: false },
      { feature: 'Suporte prioritário', included: false },
    ],
    buttonText: 'Escolher Básico',
    linkTo: '/criar?plan=basic',
  },
  {
    name: 'Premium',
    price: 'R$ 59,90',
    description: 'Eternize seu amor com até 11 sites personalizados, todos os recursos e suporte especial, por R$59,90, válidos por 6 meses.',
    features: [
      { feature: '10 fotos por site', included: true },
      { feature: '3 vídeos por site', included: true },
      { feature: '3 músicas por site', included: true },
      { feature: 'Todos os templates', included: true },
      { feature: 'Link compartilhável', included: true },
      { feature: 'Campos extras (memórias, sonhos)', included: true },
      { feature: 'Suporte prioritário', included: true },
      { feature: 'Validade de 6 meses', included: true },
    ],
    buttonText: 'Escolher Premium',
    popular: true,
    linkTo: '/criar?plan=premium',
  },
];

const PlanCard = ({ plan }: { plan: Plan }) => (
  <div className={`rounded-xl shadow-lg border ${plan.popular ? 'border-love-300 bg-white' : 'border-gray-200 bg-white'} p-6 sm:p-8`}>
    {plan.popular && (
      <div className="rounded-full bg-love-100 text-love-600 text-xs font-semibold uppercase tracking-wide py-1 px-3 inline-block mb-4">
        Mais Popular
      </div>
    )}
    <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
    <div className="mb-4">
      <span className="text-3xl font-bold">{plan.price}</span>
      {plan.price !== 'R$ 0' && <span className="text-gray-500 ml-1">pacote único</span>}
    </div>
    <p className="text-gray-600 mb-6">{plan.description}</p>
    <Button className={`w-full ${plan.popular ? 'bg-love-600 hover:bg-love-700' : ''}`} variant={plan.popular ? 'default' : 'outline'} asChild>
      <Link to={plan.linkTo}>{plan.buttonText}</Link>
    </Button>
    <div className="mt-8 space-y-4">
      {plan.features.map((feature, index) => (
        <div key={index} className="flex items-start">
          {feature.included ? (
            <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
          ) : (
            <XCircle className="h-5 w-5 text-gray-300 mt-0.5 mr-3 flex-shrink-0" />
          )}
          <span className={feature.included ? 'text-gray-700' : 'text-gray-400'}>{feature.feature}</span>
        </div>
      ))}
    </div>
  </div>
);

const Precos = () => {
  const [isPageLoaded, setIsPageLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsPageLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow pt-32 pb-20">
        <div className="container px-4 mx-auto">
          <div className={`max-w-5xl mx-auto transition-all duration-500 transform ${isPageLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <div className="text-center mb-16">
              <h1 className="text-3xl md:text-4xl font-bold mb-4">Escolha o Plano Ideal</h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Eternize momentos especiais com um site personalizado para o seu amor. Adicione fotos, vídeos, músicas e mensagens únicas para compartilhar com quem você ama.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {plans.map((plan, index) => <PlanCard key={index} plan={plan} />)}
            </div>
            <div className="mt-16 bg-gray-50 rounded-xl p-8 border border-gray-100">
              <h2 className="text-2xl font-bold mb-4 text-center">Perguntas Frequentes</h2>
              <div className="space-y-6 mt-8">
                <div>
                  <h3 className="font-semibold text-lg mb-2">O que significa "eternizar meu amor"?</h3>
                  <p className="text-gray-600">
                    Significa criar um site personalizado para você e seu amor, onde você pode adicionar fotos, vídeos, músicas e mensagens especiais. É uma forma única de preservar e compartilhar suas memórias mais preciosas com amigos e familiares através de um link exclusivo.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Como funciona o pagamento?</h3>
                  <p className="text-gray-600">
                    O plano Gratuito é sem custo. Os pacotes Básico (R$59,90) e Premium (R$99,90) são pagos uma única vez via cartão, PIX ou boleto.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Por quanto tempo os sites ficam disponíveis?</h3>
                  <p className="text-gray-600">
                    Gratuito: 6 meses. Básico: 6 Meses. Premium: 6 Meses. Após isso, renove por 50% do valor original.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Posso mudar de plano depois?</h3>
                  <p className="text-gray-600">
                    Sim, você pode adquirir um pacote superior a qualquer momento para eternizar mais momentos ou acessar mais recursos.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Precos;