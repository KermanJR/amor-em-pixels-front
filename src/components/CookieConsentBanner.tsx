// components/CookieConsentBanner.tsx
import { useEffect, useState } from 'react';
import CookieConsent, { Cookies } from 'react-cookie-consent';
import { motion } from 'framer-motion';
import { Cookie } from 'lucide-react';

const CookieConsentBanner = () => {
  const [showReviewButton, setShowReviewButton] = useState(false);

  useEffect(() => {
    // Verifica se o cookie de consentimento já existe
    const consent = Cookies.get('user-consent');
    if (consent) {
      setShowReviewButton(true);
    }
  }, []);

  // Função para lidar com a aceitação de cookies
  const handleAccept = () => {
    console.log('Usuário aceitou os cookies');
    setShowReviewButton(true);
    // Aqui você pode ativar scripts de terceiros, como Google Analytics
  };

  // Função para lidar com a rejeição de cookies
  const handleDecline = () => {
    console.log('Usuário rejeitou os cookies');
    setShowReviewButton(true);
    // Aqui você pode desativar scripts de terceiros
  };

  // Função para revisar o consentimento (limpa o cookie e recarrega a página)
  const handleReviewConsent = () => {
    Cookies.remove('user-consent');
    window.location.reload();
  };

  return (
    <>
      {/* Banner de Consentimento */}
      <CookieConsent
        location="bottom"
        buttonText="Aceitar"
        declineButtonText="Rejeitar"
        cookieName="user-consent"
        style={{
          background: 'linear-gradient(to bottom, #1e3a8a, #172554)',
          color: '#ffffff',
          fontFamily: 'serif',
          padding: '1rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          zIndex: 1000,
        }}
        buttonStyle={{
          background: '#ffffff',
          color: '#1e3a8a',
          fontSize: '14px',
          padding: '10px 20px',
          borderRadius: '8px',
          fontWeight: 'bold',
        }}
        declineButtonStyle={{
          background: 'transparent',
          color: '#ffffff',
          fontSize: '14px',
          padding: '10px 20px',
          border: '1px solid #ffffff',
          borderRadius: '8px',
        }}
        expires={365} // O cookie de consentimento expira em 1 ano
        onAccept={handleAccept}
        onDecline={handleDecline}
        enableDeclineButton
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-3"
        >
          <Cookie className="h-6 w-6 text-white/70" />
          <span>
            Este site usa cookies para melhorar sua experiência. Ao continuar, você concorda com nossa{' '}
            <a href="/politica-de-privacidade" className="underline text-white hover:text-blue-200">
              Política de Privacidade
            </a>
            .
          </span>
        </motion.div>
      </CookieConsent>

      {/* Botão para Revisar Consentimento */}
      {showReviewButton && (
        <motion.button
          onClick={handleReviewConsent}
          className="fixed bottom-4 left-4 bg-blue-950/50 backdrop-blur-md rounded-full p-3 text-white border border-white/10 flex items-center gap-2"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          whileHover={{ scale: 1.05 }}
        >
          <Cookie className="h-5 w-5" />
          <span className="text-sm">Revisar Cookies</span>
        </motion.button>
      )}
    </>
  );
};

export default CookieConsentBanner;
