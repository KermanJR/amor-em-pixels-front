// src/components/Navbar.tsx
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
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out py-4",
        isScrolled ? "bg-white/90 backdrop-blur-md shadow-sm" : "bg-transparent"
      )}
    >
      <div className="container mx-auto px-4 md:px-6 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2 text-2xl font-display font-semibold">
          <span className={cn("transition-colors duration-300", isScrolled ? "text-love-600" : "text-love-500")}>
            Amor em Pixels
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <Link to="/" className={cn("text-sm font-medium hover:text-love-500 transition-colors duration-200", location.pathname === "/" ? "text-love-500" : "text-foreground/90")}>
            Início
          </Link>
         
         
          

          {user ? (
            <div className="flex items-center space-x-4">
              <Link to="/dashboard" className={cn("text-sm font-medium hover:text-love-500 transition-colors duration-200", location.pathname === "/dashboard" ? "text-love-500" : "text-foreground/90")}>
                Dashboard
              </Link>
              <span className="text-sm text-foreground/90">
                Bem-vindo, {user.email.split('@')[0]}!
              </span>
              <Button variant="outline" className="text-love-600 hover:bg-love-50" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </div>
          ) : (
            <Link to="/criar">
              <Button variant="default" className="bg-love-500 hover:bg-love-600 text-white shadow-md hover:shadow-lg transition-all duration-300">
                Criar Site
              </Button>
            </Link>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden text-foreground p-2"
          aria-label={mobileMenuOpen ? "Fechar menu" : "Abrir menu"}
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-white pt-20">
          <div className="container mx-auto px-4 py-4 flex flex-col space-y-6">
            <Link to="/" className={cn("text-lg font-medium py-2 border-b border-gray-100", location.pathname === "/" ? "text-love-500" : "text-foreground")} onClick={() => setMobileMenuOpen(false)}>
              Início
            </Link>
            <Link to="/como-funciona" className={cn("text-lg font-medium py-2 border-b border-gray-100", location.pathname === "/como-funciona" ? "text-love-500" : "text-foreground")} onClick={() => setMobileMenuOpen(false)}>
              Como Funciona
            </Link>
            <Link to="/exemplos" className={cn("text-lg font-medium py-2 border-b border-gray-100", location.pathname === "/exemplos" ? "text-love-500" : "text-foreground")} onClick={() => setMobileMenuOpen(false)}>
              Exemplos
            </Link>
            <Link to="/precos" className={cn("text-lg font-medium py-2 border-b border-gray-100", location.pathname === "/precos" ? "text-love-500" : "text-foreground")} onClick={() => setMobileMenuOpen(false)}>
              Preços
            </Link>
            {user && (
              <Link to="/dashboard" className={cn("text-lg font-medium py-2 border-b border-gray-100", location.pathname === "/dashboard" ? "text-love-500" : "text-foreground")} onClick={() => setMobileMenuOpen(false)}>
                Dashboard
              </Link>
            )}

            {user ? (
              <>
                <div className="text-lg font-medium py-2 border-b border-gray-100 text-foreground">
                  Bem-vindo, {user.email.split('@')[0]}!
                </div>
                <Button variant="outline" className="w-full text-love-600 hover:bg-love-50" onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Sair
                </Button>
              </>
            ) : (
              <Link to="/criar" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="default" className="w-full bg-love-500 hover:bg-love-600 text-white shadow-md">
                  Criar Site
                </Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;