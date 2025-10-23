import React, { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

// Componentes
import ScrollToTop from './componentes/ScrollToTop/ScrollToTop';

// Facebook Pixel
import { initFacebookPixel } from './utils/facebookPixel';

// Páginas
import HomePage from './paginas/HomePage/HomePage';
import LoginPage from './paginas/LoginPage/LoginPage';
import SignUpPage from './paginas/SignUpPage/SignUpPage';
import DashboardPage from './paginas/DashboardPage/DashboardPage';
import CollectionsPage from './paginas/CollectionsPage/CollectionsPage';
import CollectionDetailPage from './paginas/CollectionDetailPage/CollectionDetailPage';
import PricingPage from './paginas/PricingPage/PricingPage';
import ProfilePage from './paginas/ProfilePage/ProfilePage';
import PaymentPage from './paginas/PaymentPage/PaymentPage';
import PaymentSuccess from './paginas/PaymentSuccess/PaymentSuccess';
import ResetPasswordPage from './paginas/ResetPasswordPage/ResetPasswordPage';

import './App.css';
import { useNavigation } from './context/NavigationContext';

const pageVariants = {
  hidden: {
    opacity: 0,
    y: 20 
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.1, 0.25, 1.0] 
    }
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.1, 0.25, 1.0]
    }
  }
};

const PageWrapper = ({ children }) => (
  <motion.div
    variants={pageVariants}
    initial="hidden"
    animate="visible"
    exit="exit"
  >
    {children}
  </motion.div>
);

function App() {
  const { showOverlay } = useNavigation();
  const location = useLocation();

  // ===== INICIALIZA O FACEBOOK PIXEL UMA VEZ =====
  useEffect(() => {
    initFacebookPixel();
  }, []); // Roda apenas uma vez quando o App monta

  return (
    <div className="app-container">
      {showOverlay && <div className="app-overlay"></div>}
      
      <ScrollToTop />
      
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<PageWrapper><HomePage /></PageWrapper>} />
          <Route path="/login" element={<PageWrapper><LoginPage /></PageWrapper>} />
          <Route path="/signup" element={<PageWrapper><SignUpPage /></PageWrapper>} />
          <Route path="/dashboard" element={<PageWrapper><DashboardPage /></PageWrapper>} />
          <Route path="/collections" element={<PageWrapper><CollectionsPage /></PageWrapper>} />
          <Route path="/collection/:categoryName" element={<PageWrapper><CollectionDetailPage /></PageWrapper>} />
          <Route path="/pricing" element={<PageWrapper><PricingPage /></PageWrapper>} />
          <Route path="/profile" element={<PageWrapper><ProfilePage /></PageWrapper>} />
          <Route path="/payment" element={<PageWrapper><PaymentPage /></PageWrapper>} />
          <Route path="/reset-password" element={<PageWrapper><ResetPasswordPage /></PageWrapper>} />
          
          {/* ROTA DE SUCESSO SEM ANIMAÇÃO */}
          <Route path="/payment-success" element={<PaymentSuccess />} />
        </Routes>
      </AnimatePresence>
    </div>
  );
}

export default App;