
import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const Cookies = () => {
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
              Política de Cookies
            </h1>
            
            <div className="prose prose-lg max-w-none">
              <p className="lead">
                Esta Política de Cookies explica como a Amor em Pixels e nossos parceiros usam cookies e 
                tecnologias semelhantes para reconhecê-lo quando você visita nosso site.
              </p>
              
              <h2>1. O que são Cookies?</h2>
              <p>
                Cookies são pequenos arquivos de texto que são armazenados no seu navegador ou no disco 
                rígido do seu computador quando você visita um site. Os cookies são amplamente utilizados 
                para fazer os sites funcionarem de maneira mais eficiente, bem como fornecer informações 
                aos proprietários do site.
              </p>
              
              <h2>2. Como Usamos Cookies</h2>
              <p>
                Usamos cookies por várias razões, detalhadas abaixo. Infelizmente, na maioria dos casos, 
                não existem opções padrão do setor para desativar cookies sem desativar completamente a 
                funcionalidade e os recursos que eles adicionam ao site. É recomendável que você deixe 
                todos os cookies se não tiver certeza se precisa deles ou não, caso sejam usados para 
                fornecer um serviço que você utiliza.
              </p>
              
              <h2>3. Os Cookies que Definimos</h2>
              
              <h3>Cookies relacionados à conta</h3>
              <p>
                Se você criar uma conta conosco, usaremos cookies para o gerenciamento do processo de 
                inscrição e administração geral. Esses cookies geralmente serão excluídos quando você 
                sair do sistema, porém, em alguns casos, eles poderão permanecer posteriormente para 
                lembrar as preferências do seu site ao sair.
              </p>
              
              <h3>Cookies relacionados a login</h3>
              <p>
                Utilizamos cookies quando você está logado, para que possamos lembrar dessa ação. Isso 
                evita que você precise fazer login sempre que visitar uma nova página. Esses cookies são 
                normalmente removidos ou limpos quando você efetua logout para garantir que você possa 
                acessar apenas a recursos e áreas restritas ao efetuar login.
              </p>
              
              <h3>Cookies relacionados a formulários</h3>
              <p>
                Quando você envia dados por meio de um formulário como os encontrados nas páginas de 
                criação de sites, os cookies podem ser configurados para lembrar os detalhes do usuário 
                para correspondência futura.
              </p>
              
              <h3>Cookies de preferências do site</h3>
              <p>
                Para proporcionar uma ótima experiência neste site, fornecemos a funcionalidade para 
                definir suas preferências de como esse site é executado quando você o usa. Para lembrar 
                suas preferências, precisamos definir cookies para que essas informações possam ser 
                chamadas sempre que você interagir com uma página for afetada por suas preferências.
              </p>
              
              <h2>4. Cookies de Terceiros</h2>
              <p>
                Em alguns casos especiais, também usamos cookies fornecidos por terceiros confiáveis. 
                A seção a seguir detalha quais cookies de terceiros você pode encontrar através deste site.
              </p>
              <ul>
                <li>
                  Este site usa o Google Analytics, que é uma das soluções de análise mais difundidas 
                  e confiáveis ​​da Web, para nos ajudar a entender como você usa o site e como podemos 
                  melhorar sua experiência. Esses cookies podem rastrear itens como quanto tempo você 
                  gasta no site e as páginas visitadas, para que possamos continuar produzindo conteúdo 
                  atraente.
                </li>
                <li>
                  Também usamos cookies de mídia social para permitir que você compartilhe conteúdo 
                  diretamente em plataformas de mídia social. Esses cookies provavelmente rastrearão 
                  seu navegador em outros sites e criarão um perfil de seus interesses.
                </li>
              </ul>
              
              <h2>5. Gerenciando Cookies</h2>
              <p>
                Você pode controlar e/ou excluir cookies como quiser. Você pode excluir todos os cookies 
                que já estão no seu computador e pode configurar a maioria dos navegadores para impedir 
                que eles sejam colocados. Se você fizer isso, precisará definir manualmente algumas 
                preferências sempre que visitar um site e alguns serviços e funcionalidades podem não 
                funcionar.
              </p>
              
              <h2>6. Mais Informações</h2>
              <p>
                Esperamos que tenha esclarecido as coisas para você. Como foi mencionado anteriormente, 
                se há algo que você não tem certeza se precisa ou não, geralmente é mais seguro deixar 
                os cookies ativados, caso interaja com um dos recursos que você usa em nosso site.
              </p>
              <p>
                Se você ainda tiver dúvidas sobre o uso de cookies, entre em contato conosco em 
                cookies@amorempixels.com.br.
              </p>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Cookies;
