import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { CheckCircle, Sparkles } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useToast } from '@/hooks/use-toast';

const Confirmation = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  const success = searchParams.get('success') === 'true';
  const siteId = searchParams.get('siteId');

  useEffect(() => {
    if (success) {
      toast({
        title: 'Pagamento Confirmado!',
        description: 'Seu card digital foi criado com sucesso. Você receberá o link por e-mail.',
      });
    } else {
      toast({
        title: 'Pagamento Cancelado',
        description: 'O pagamento foi cancelado. Você pode tentar novamente.',
        variant: 'destructive',
      });
    }
  }, [success, toast]);

  const handleCreateNewCard = () => {
    navigate('/criar');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <Navbar />
      <main className="container mx-auto py-12 px-4 lg:px-8 flex flex-col items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          {success ? (
            <>
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Pagamento Confirmado!
              </h1>
              <p className="text-lg text-gray-600 mb-6">
                Seu card digital foi criado com sucesso. Você receberá o link e a senha no e-mail informado.
              </p>
            </>
          ) : (
            <>
              <Sparkles className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Pagamento Cancelado
              </h1>
              <p className="text-lg text-gray-600 mb-6">
                O pagamento foi cancelado. Você pode tentar novamente criando um novo card.
              </p>
            </>
          )}
          <Button
            onClick={handleCreateNewCard}
            className="bg-pink-600 hover:bg-pink-700 text-white px-6 py-3 rounded-md"
          >
            Criar Novo Card Digital
          </Button>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

export default Confirmation;
