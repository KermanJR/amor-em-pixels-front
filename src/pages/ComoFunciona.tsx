import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Play, XCircle } from 'lucide-react';

const ComoFunciona = () => {
  const [isPageLoaded, setIsPageLoaded] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsPageLoaded(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-32 pb-20">
        <div className="container px-4 mx-auto">
          <div 
            className={`max-w-5xl mx-auto transition-all duration-500 transform ${
              isPageLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
            }`}
          >
          
     
            <div className="mb-20">
              <h2 className="text-2xl font-bold text-center mb-10">Em apenas 4 passos simples</h2>
              
              <div className="grid md:grid-cols-4 gap-8">
                {[
                  {
                    step: 1,
                    title: "Crie sua conta",
                    description: "Registre-se gratuitamente e comece a criar seu presente digital personalizado."
                  },
                  {
                    step: 2,
                    title: "Personalize",
                    description: "Envie fotos, vídeos, textos especiais e escolha uma música que represente o casal."
                  },
                  {
                    step: 3,
                    title: "Escolha o Plano",
                    description: "Selecione entre os planos disponíveis até o momento."
                  },
                  {
                    step: 4,
                    title: "Compartilhe",
                    description: "Receba um link QRDOCE único e compartilhe com seu amor para criar um momento inesquecível."
                  }
                ].map((item) => (
                  <div key={item.step} className="text-center">
                    <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-love-100 text-love-600 text-2xl font-bold mb-4">
                      {item.step}
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                    <p className="text-gray-600">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
            
          
            <div className="mb-16">
              <h2 className="text-2xl font-bold text-center mb-10">O que você pode incluir</h2>
              
              <div className="grid md:grid-cols-3 gap-8">
                {[
                  {
                    title: "Fotos",
                    description: "Adicione suas fotos favoritas para recordar momentos especiais juntos."
                  },
                  {
                    title: "Vídeos",
                    description: "Compartilhe vídeos que contam sua história de amor ou momentos divertidos."
                  },
                  {
                    title: "Música",
                    description: "Escolha uma música especial para tocar enquanto seu amor navega pelo site."
                  },
                  {
                    title: "Mensagens",
                    description: "Escreva mensagens de amor que tocam o coração e expressam seus sentimentos."
                  },
                  {
                    title: "Datas especiais",
                    description: "Destaque datas importantes do relacionamento com contadores personalizados. (Em breve!)"
                  },
                  {
                    title: "Designs exclusivos",
                    description: "Escolha entre templates românticos ou modernos com animações especiais. (Em breve!)"
                  }
                ].map((item, index) => (
                  <div key={index} className="flex items-start">
                    {item.title === "Datas especiais" || item.title === "Designs exclusivos" ? (
                      <XCircle className="h-5 w-5 text-gray-400 mt-1 mr-3 flex-shrink-0" />
                    ) : (
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-1 mr-3 flex-shrink-0" />
                    )}
                    <div>
                      <h3 className="font-semibold mb-1">{item.title}</h3>
                      <p className="text-gray-600 text-sm">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* CTA */}
            <div className="text-center bg-gradient-to-r from-love-100 to-rose-100 rounded-xl p-10 mb-16">
              <h2 className="text-2xl font-bold mb-4">Pronto para criar seu presente digital?</h2>
              <p className="text-lg text-gray-700 mb-6">
                Comece agora mesmo e surpreenda seu amor com um gesto especial.
              </p>
              
              <Button 
                className="bg-love-600 hover:bg-love-700 text-white"
                size="lg"
                asChild
              >
                <Link to="/criar">
                  Criar Agora <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            
            {/* FAQ */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-center mb-10">Perguntas Frequentes</h2>
              
              <div className="space-y-6">
                {[
                  {
                    question: "Quanto tempo leva para criar um site personalizado?",
                    answer: "Em média, nossos usuários levam entre 15 e 30 minutos para criar um site completo, dependendo da quantidade de conteúdo que desejam adicionar."
                  },
                  {
                    question: "Preciso ter conhecimentos técnicos para criar?",
                    answer: "Não! Nossa plataforma foi desenvolvida para ser extremamente intuitiva. Se você sabe usar redes sociais, conseguirá criar um lindo presente digital."
                  },
                  {
                    question: "Por quanto tempo meu site ficará disponível?",
                    answer: `Os Cards Digitais ficam disponíveis de acordo com o plano escolhido a partir da data da compra. Para o plano básico, o site ficará disponível por 6 meses.
                    Para o plano Premium, o Card Digital ficará disponível por 1 ano.`
                  },
                  {
                    question: "Posso editar o site depois de criado?",
                    answer: "Sim! Você pode editar seu site a qualquer momento acessando sua conta e navegando até 'Dashboard'."
                  },
                  {
                    question: "Quais as vantagens do plano Premium?",
                    answer: "O plano Premium oferece mais uplods fotos e vídeos, seu Card Digital PDF para download e  suporte prioritário."
                  }
                ].map((item, index) => (
                  <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                    <h3 className="font-semibold text-lg mb-2">{item.question}</h3>
                    <p className="text-gray-600">{item.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ComoFunciona;
