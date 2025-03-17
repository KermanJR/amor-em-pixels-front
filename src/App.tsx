import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useParams, useNavigate } from "react-router-dom";
import Index from "./pages/Index";
import Precos from "./pages/Precos";
import Create from "./pages/Create";
import Preview from "./pages/Preview";
import NotFound from "./pages/NotFound";
import ComoFunciona from "./pages/ComoFunciona";
import Exemplos from "./pages/Exemplos";
import Termos from "./pages/Termos";
import Privacidade from "./pages/Privacidade";
import Cookies from "./pages/Cookies";
import SitePreview from "./components/SitePreview";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "./supabaseClient";
import EditSite from "./pages/EditSite";
import Dashboard from "./pages/Dashboard";

const PrivateSite = () => {
  const { customUrl } = useParams<{ customUrl: string }>();
  const [siteData, setSiteData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [enteredPassword, setEnteredPassword] = useState('');
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSiteData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          // Se não estiver logado, exibe o prompt de senha
          setShowPasswordPrompt(true);
          setIsLoading(false);
          return;
        }

        // Se estiver logado, verifica se é o criador
        const { data, error } = await supabase
          .from('sites')
          .select('*')
          .eq('custom_url', customUrl)
          .eq('user_id', user.id)
          .single();

        if (error || !data) {
          // Não é o criador, mas permite acesso via senha
          const { data: siteDataWithoutUser } = await supabase
            .from('sites')
            .select('*')
            .eq('custom_url', customUrl)
            .single();

          if (!siteDataWithoutUser) {
            throw new Error('Site não encontrado');
          }
          setSiteData({
            formData: {
              ...siteDataWithoutUser.form_data,
              relationshipStartDate: new Date(siteDataWithoutUser.form_data.relationshipStartDate),
            },
            templateType: siteDataWithoutUser.template_type,
            plan: siteDataWithoutUser.plan,
            media: siteDataWithoutUser.media,
          });
        } else {
          setSiteData({
            formData: {
              ...data.form_data,
              relationshipStartDate: new Date(data.form_data.relationshipStartDate),
            },
            templateType: data.template_type,
            plan: data.plan,
            media: data.media,
          });
        }
      } catch (error) {
        setAccessDenied(true);
        toast({
          title: "Erro",
          description: "Acesso negado ou site não encontrado.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchSiteData();
  }, [customUrl, toast, navigate]);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customUrl) return;

    const { data, error } = await supabase
      .from('sites')
      .select('password')
      .eq('custom_url', customUrl)
      .single();

    if (error || !data || data.password !== enteredPassword) {
      toast({
        title: "Erro",
        description: "Senha incorreta. Tente novamente.",
        variant: "destructive",
      });
      return;
    }

    const { data: siteData } = await supabase
      .from('sites')
      .select('*')
      .eq('custom_url', customUrl)
      .single();

    setSiteData({
      formData: {
        ...siteData.form_data,
        relationshipStartDate: new Date(siteData.form_data.relationshipStartDate),
      },
      templateType: siteData.template_type,
      plan: siteData.plan,
      media: siteData.media,
    });
    setShowPasswordPrompt(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Carregando...</p>
      </div>
    );
  }

  if (accessDenied || !siteData) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-4">
        <h1 className="text-2xl font-bold">Acesso Negado</h1>
        <p>Você não tem permissão para ver este site ou ele não existe.</p>
      </div>
    );
  }

  if (showPasswordPrompt) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-100 via-purple-200 to-blue-100">
        <motion.div
          className="bg-white p-8 rounded-lg shadow-lg border border-[#FF9999] w-full max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-2xl font-semibold text-[#A63A7C] text-center mb-4">Acesse seu Card de Amor</h2>
          <p className="text-[#4A2C4A] text-center mb-6">Digite a senha fornecida por seu amor para visualizar o site.</p>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <Input
              type="password"
              placeholder="Digite a senha"
              value={enteredPassword}
              onChange={(e) => setEnteredPassword(e.target.value)}
              className="border-[#FF9999] focus:border-[#A63A7C] text-lg p-6 w-full"
            />
            <Button
              type="submit"
              className="bg-[#A63A7C] hover:bg-[#9B2C74] text-white text-lg p-6 w-full"
              disabled={!enteredPassword}
            >
              Entrar
            </Button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <SitePreview
      formData={siteData.formData}
      plan={siteData.plan}
      media={siteData.media}
    />
  );
};

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/precos" element={<Precos />} />
          <Route path="/success" element={<Precos />} />
          <Route path="/create" element={<Create />} />
          <Route path="/criar" element={<Create />} />
          <Route path="/preview" element={<Preview />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/como-funciona" element={<ComoFunciona />} />
          <Route path="/exemplos" element={<Exemplos />} />
          <Route path="/termos" element={<Termos />} />
          <Route path="/privacidade" element={<Privacidade />} />
          <Route path="/editar-site/:siteId" element={<EditSite />} />
          <Route path="/cookies" element={<Cookies />} />
          <Route path="/:customUrl" element={<PrivateSite />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
