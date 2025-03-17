
import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const Termos = () => {
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
              Termos de Uso
            </h1>
            
            <div className="prose prose-lg max-w-none">
              <p className="lead">
                Estes Termos de Uso ("Termos") regem o acesso e uso dos serviços oferecidos pela 
                Amor em Pixels ("nós", "nossos" ou "Plataforma").
              </p>
              
              <h2>1. Aceitação dos Termos</h2>
              <p>
                Ao acessar ou usar nossos serviços, você concorda com estes Termos. Se você não concordar 
                com qualquer parte destes Termos, não poderá acessar ou usar nossos serviços.
              </p>
              
              <h2>2. Descrição do Serviço</h2>
              <p>
                A Amor em Pixels oferece uma plataforma online que permite aos usuários criar sites 
                personalizados como presentes digitais. Oferecemos uma versão gratuita com funcionalidades 
                básicas e um plano premium com recursos avançados.
              </p>
              
              <h2>3. Contas e Registro</h2>
              <p>
                Para usar alguns de nossos serviços, você pode precisar criar uma conta. Você é responsável 
                por manter a confidencialidade de suas credenciais de conta e por todas as atividades que 
                ocorrem sob sua conta.
              </p>
              
              <h2>4. Conteúdo do Usuário</h2>
              <p>
                Você mantém todos os direitos sobre o conteúdo que envia, publica ou exibe em ou através de 
                nossos serviços, incluindo fotos, vídeos, textos e músicas ("Conteúdo do Usuário").
              </p>
              <p>
                Ao enviar Conteúdo do Usuário para nossos serviços, você nos concede uma licença mundial, 
                não exclusiva, isenta de royalties para usar, reproduzir, modificar, adaptar, publicar, 
                transmitir, exibir e distribuir tal conteúdo em qualquer mídia ou método de distribuição.
              </p>
              
              <h2>5. Uso Adequado</h2>
              <p>
                Você concorda em não usar nossos serviços para:
              </p>
              <ul>
                <li>Violar leis ou regulamentos aplicáveis</li>
                <li>Infringir direitos de propriedade intelectual</li>
                <li>Assediar, abusar ou prejudicar outras pessoas</li>
                <li>Distribuir conteúdo ilegal, ofensivo, difamatório ou fraudulento</li>
                <li>Interferir na segurança ou funcionamento de nossos serviços</li>
              </ul>
              
              <h2>6. Pagamentos e Reembolsos</h2>
              <p>
                Se você optar por assinar nosso plano premium, você concorda em pagar todas as taxas 
                associadas. Os preços estão sujeitos a alterações, mas notificaremos você antes de 
                qualquer alteração de preço.
              </p>
              <p>
                Podemos oferecer reembolsos a nosso critério, geralmente dentro de 7 dias após a compra 
                se o serviço não foi utilizado.
              </p>
              
              <h2>7. Disponibilidade do Site</h2>
              <p>
                Os sites personalizados criados através de nossa plataforma permanecerão disponíveis 
                por um período de 1 ano a partir da data de criação. Após esse período, o usuário poderá 
                optar por renovar o acesso mediante pagamento de uma taxa.
              </p>
              
              <h2>8. Limitação de Responsabilidade</h2>
              <p>
                Em nenhuma circunstância seremos responsáveis por quaisquer danos indiretos, incidentais, 
                especiais, punitivos ou consequentes resultantes do seu uso ou incapacidade de usar 
                nossos serviços.
              </p>
              
              <h2>9. Alterações nos Termos</h2>
              <p>
                Podemos modificar estes Termos periodicamente. Se fizermos alterações, forneceremos 
                um aviso, como a atualização da data na parte superior destes Termos.
              </p>
              
              <h2>10. Contato</h2>
              <p>
                Se você tiver alguma dúvida sobre estes Termos, entre em contato conosco em 
                contato@amorempixels.com.br.
              </p>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Termos;
