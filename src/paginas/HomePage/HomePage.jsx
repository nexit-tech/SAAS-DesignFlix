import React, { useState, useEffect } from 'react';
import Navbar from '../../componentes/Navbar/Navbar';
import HeroSection from './componentes/HeroSection/HeroSection';
import ContentCarousel from './componentes/ContentCarousel/ContentCarousel';
import Footer from '../../componentes/Footer/Footer';
import LoginRequiredModal from '../../componentes/LoginRequiredModal/LoginRequiredModal'; // ← IMPORTAR MODAL
import { supabase } from '../../supabaseClient';
import { trackPageView } from '../../utils/facebookPixel';
import { useNavigation } from '../../context/NavigationContext'; // ← IMPORTAR CONTEXTO
import styles from './HomePage.module.css';

const HomePage = () => {
  const { isLoggedIn } = useNavigation(); // ← PEGAR STATUS DE LOGIN
  const [newPrints, setNewPrints] = useState([]);
  const [bestsellers, setBestsellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false); // ← ESTADO DO MODAL

  // ===== DISPARA O PIXEL DE PAGEVIEW =====
  useEffect(() => {
    trackPageView();
  }, []);

  useEffect(() => {
    const fetchPrints = async () => {
      setLoading(true);

      const { data: recentData, error: recentError } = await supabase
        .from('products')
        .select('id, image_url, category')
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (recentError) console.error('Error fetching new prints:', recentError);
      else {
        const formattedData = recentData.map(p => ({ id: p.id, imageUrl: p.image_url, category: p.category }));
        setNewPrints(formattedData);
      }
      
      const { data: bestsellersData, error: bestsellersError } = await supabase
        .from('products')
        .select('id, image_url, category')
        .order('download_count', { ascending: false })
        .limit(10);

      if (bestsellersError) console.error('Error fetching bestsellers:', bestsellersError);
      else {
        const formattedData = bestsellersData.map(p => ({ id: p.id, imageUrl: p.image_url, category: p.category }));
        setBestsellers(formattedData);
      }
      
      setLoading(false);
    };

    fetchPrints();
  }, []);

  // ===== FUNÇÃO QUE LIDA COM O CLIQUE NO CARD =====
  const handleCardClick = (print) => {
    if (!isLoggedIn) {
      // Se não estiver logado, abre o modal
      setIsLoginModalOpen(true);
    } else {
      // Se estiver logado, pode adicionar lógica aqui (abrir modal de preview, etc)
      console.log('Usuário logado clicou em:', print);
      // Por enquanto, não faz nada - mas você pode adicionar um modal de preview depois
    }
  };

  return (
    <>
      {/* ===== MODAL DE LOGIN ===== */}
      <LoginRequiredModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)} 
      />

      <div className={styles.homePage}>
        <Navbar />
        <main>
          <HeroSection />
          {loading ? (
            <p style={{ textAlign: 'center', fontSize: '1.2rem', padding: '2rem' }}>
              Loading prints...
            </p>
          ) : (
            <>
              {/* ===== PASSA A FUNÇÃO handleCardClick PARA OS CARROSSÉIS ===== */}
              <ContentCarousel 
                title="New This Week" 
                prints={newPrints}
                onCardClick={handleCardClick}
              />
              <ContentCarousel 
                title="Bestsellers" 
                prints={bestsellers}
                onCardClick={handleCardClick}
              />
            </>
          )}
        </main>
        <Footer />
      </div>
    </>
  );
};

export default HomePage;