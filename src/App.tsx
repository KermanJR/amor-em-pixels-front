
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
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSiteData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          navigate('/criar'); // Redireciona para criar (onde o pop-up aparecerá)
          return;
        }

        const { data, error } = await supabase
          .from('sites')
          .select('*')
          .eq('custom_url', customUrl)
          .eq('user_id', user.id)
          .single();

        if (error || !data) {
          throw new Error('Acesso negado ou site não encontrado');
        }

        setSiteData({
          formData: {
            ...data.form_data,
            specialDate: new Date(data.form_data.specialDate),
          },
          templateType: data.template_type,
          plan: data.plan,
          media: data.media,
        });
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
          <Route path="/dashboard" element={<Dashboard/>} />,
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