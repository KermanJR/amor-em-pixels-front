
import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const Privacidade = () => {
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
            className={`max-w-4xl mx-auto transition-all duration-500 transform ${
              isPageLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
            }`}
          >
            <h1 className="text-3xl md:text-4xl font-bold mb-8">
              Política de Privacidade
            </h1>
            
            <div className="prose prose-lg max-w-none">
              <p className="lead">
                A Amor em Pixels está comprometida em proteger sua privacidade. Esta Política de Privacidade 
                explica como coletamos, usamos e protegemos suas informações pessoais.
              </p>
              
              <h2>1. Informações que Coletamos</h2>
              <p>
                Podemos coletar os seguintes tipos de informações pessoais:
              </p>
              <ul>
                <li>Informações de registro: nome, endereço de e-mail, senha</li>
                <li>Conteúdo do usuário: fotos, vídeos, textos e músicas que você carrega</li>
                <li>Informações de pagamento: quando você adquire nosso plano premium</li>
                <li>Informações de uso: como você interage com nossos serviços</li>
                <li>Informações do dispositivo: endereço IP, tipo de navegador, sistema operacional</li>
              </ul>
              
              <h2>2. Como Usamos Suas Informações</h2>
              <p>
                Usamos suas informações pessoais para:
              </p>
              <ul>
                <li>Fornecer, manter e melhorar nossos serviços</li>
                <li>Processar transações e enviar notificações relacionadas</li>
                <li>Enviar comunicações administrativas e de marketing</li>
                <li>Responder a suas perguntas e solicitações</li>
                <li>Monitorar e analisar tendências, uso e atividades</li>
                <li>Detectar, prevenir e resolver fraudes e problemas técnicos</li>
                <li>Personalizar sua experiência</li>
              </ul>
              
              <h2>3. Compartilhamento de Informações</h2>
              <p>
                Podemos compartilhar suas informações pessoais com:
              </p>
              <ul>
                <li>Fornecedores de serviços que nos ajudam a fornecer nossos serviços</li>
                <li>Parceiros de negócios com seu consentimento</li>
                <li>Autoridades legais quando exigido por lei</li>
              </ul>
              <p>
                Não vendemos suas informações pessoais a terceiros.
              </p>
              
              <h2>4. Segurança</h2>
              <p>
                Implementamos medidas de segurança técnicas, administrativas e físicas para proteger 
                suas informações pessoais contra acesso não autorizado, uso indevido ou divulgação.
              </p>
              
              <h2>5. Seus Direitos</h2>
              <p>
                Dependendo da sua localização, você pode ter direitos relacionados às suas informações 
                pessoais, como:
              </p>
              <ul>
                <li>Acessar e receber uma cópia de suas informações pessoais</li>
                <li>Corrigir informações imprecisas</li>
                <li>Excluir suas informações pessoais</li>
                <li>Retirar seu consentimento a qualquer momento</li>
                <li>Opor-se ao processamento de suas informações pessoais</li>
                <li>Solicitar a portabilidade de suas informações pessoais</li>
              </ul>
              
              <h2>6. Retenção de Dados</h2>
              <p>
                Mantemos suas informações pessoais pelo tempo necessário para fornecer nossos serviços 
                ou para outros fins essenciais, como cumprir obrigações legais, resolver disputas 
                e fazer cumprir nossos acordos.
              </p>
              
              <h2>7. Crianças</h2>
              <p>
                Nossos serviços não são destinados a crianças menores de 13 anos, e não coletamos 
                intencionalmente informações pessoais de crianças menores de 13 anos.
              </p>
              
              <h2>8. Alterações nesta Política</h2>
              <p>
                Podemos atualizar esta Política de Privacidade periodicamente. Se fizermos alterações 
                significativas, notificaremos você por e-mail ou por meio de um aviso em nosso site.
              </p>
              
              <h2>9. Contato</h2>
              <p>
                Se você tiver dúvidas sobre esta Política de Privacidade, entre em contato conosco em 
                privacidade@amorempixels.com.br.
              </p>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Privacidade;
