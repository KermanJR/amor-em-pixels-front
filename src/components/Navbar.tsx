import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { supabase } from '../supabaseClient';
import { useToast } from '@/hooks/use-toast';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    fetchUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      setMobileMenuOpen(false);
      toast({ title: 'Sucesso', description: 'Você saiu da sua conta.' });
      navigate('/');
    } catch (error) {
      toast({ title: 'Erro', description: 'Falha ao fazer logout. Tente novamente.', variant: 'destructive' });
    }
  };

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out py-2 md:py-4',
        isScrolled ? 'bg-white/90 backdrop-blur-md shadow-sm' : 'bg-transparent'
      )}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2">
          <img
            src="public\Fashion-removebg-preview (2).png" // Substitua pelo caminho da sua logo
            alt="Logo"
            style={{width: '100px', height:'100px',transform: 'scale(1.5)'}}
            className="h-10 md:h-10 w-auto object-cover"
          />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link
            to="/"
            className={cn(
              'text-sm font-medium hover:text-love-500 transition-colors duration-200',
              location.pathname === '/' ? 'text-love-500' : 'text-foreground/90'
            )}
          >
            Início
          </Link>
          <Link
            to="/como-funciona"
            className={cn(
              'text-sm font-medium hover:text-love-500 transition-colors duration-200',
              location.pathname === '/como-funciona' ? 'text-love-500' : 'text-foreground/90'
            )}
          >
            Como Funciona
          </Link>

          
            <Link to="/criar">
              <Button
                variant="default"
                className="bg-love-500 hover:bg-love-600 text-white shadow-md hover:shadow-lg transition-all duration-300"
                size="sm"
              >
                Criar Card
              </Button>
            </Link>
          
        </nav>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden text-foreground p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-love-500"
          aria-label={mobileMenuOpen ? 'Fechar menu' : 'Abrir menu'}
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-white/95 backdrop-blur-md transition-opacity duration-300 ease-in-out">
          <div className="container mx-auto px-4 py-6 flex flex-col space-y-4">
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="self-end text-foreground p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-love-500"
            >
              <X className="h-6 w-6" />
            </button>
            <Link
              to="/"
              className={cn(
                'text-lg font-medium py-2 border-b border-gray-200',
                location.pathname === '/' ? 'text-love-500' : 'text-foreground'
              )}
              onClick={() => setMobileMenuOpen(false)}
            >
              Início
            </Link>
            <Link
              to="/como-funciona"
              className={cn(
                'text-lg font-medium py-2 border-b border-gray-200',
                location.pathname === '/como-funciona' ? 'text-love-500' : 'text-foreground'
              )}
              onClick={() => setMobileMenuOpen(false)}
            >
              Como Funciona
            </Link>
          
           
              <Link to="/criar" onClick={() => setMobileMenuOpen(false)}>
                <Button
                  variant="default"
                  className="w-full bg-love-500 hover:bg-love-600 text-white shadow-md mt-2"
                  size="sm"
                >
                  Criar Card
                </Button>
              </Link>
            
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
