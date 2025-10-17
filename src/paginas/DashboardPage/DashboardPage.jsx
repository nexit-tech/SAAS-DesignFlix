import React, { useState, useEffect } from 'react';
import Navbar from '../../componentes/Navbar/Navbar';
import Footer from '../../componentes/Footer/Footer';
import ContentCarousel from '../HomePage/componentes/ContentCarousel/ContentCarousel';
import PrintCard from '../../componentes/PrintCard/PrintCard';
import Modal from '../../componentes/Modal/Modal';
import LoginRequiredModal from '../../componentes/LoginRequiredModal/LoginRequiredModal';
import SubscriptionRequiredModal from '../../componentes/SubscriptionRequiredModal/SubscriptionRequiredModal';
import { useNavigation } from '../../context/NavigationContext';
import { supabase } from '../../supabaseClient';
import styles from './DashboardPage.module.css';

const DashboardPage = () => {
  const { user, profile, isSearching, searchQuery } = useNavigation();
  const userName = profile?.full_name?.split(' ')[0] || "User";

  const [newPrints, setNewPrints] = useState([]);
  const [bestsellers, setBestsellers] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estados para os modais
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPrint, setCurrentPrint] = useState(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);

  const formatPrintData = (p) => ({ 
    id: p.id,
    imageUrl: p.image_url, 
    category: p.category 
  });

  useEffect(() => {
    const fetchPrints = async () => {
      setLoading(true);

      const { data: recentData, error: recentError } = await supabase
        .from('products')
        .select('id, image_url, category')
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (recentError) console.error('Error fetching new prints:', recentError);
      else setNewPrints(recentData.map(formatPrintData));
      
      const { data: bestsellersData, error: bestsellersError } = await supabase
        .from('products')
        .select('id, image_url, category')
        .order('download_count', { ascending: false })
        .limit(10);

      if (bestsellersError) console.error('Error fetching bestsellers:', bestsellersError);
      else setBestsellers(bestsellersData.map(formatPrintData));
      
      setLoading(false);
    };

    if (!isSearching) {
        fetchPrints();
    }
  }, [isSearching]);

  useEffect(() => {
    const searchPrints = async () => {
      if (isSearching && searchQuery.length > 0) {
        setLoading(true);
        const { data, error } = await supabase
          .from('products')
          .select('id, image_url, category')
          .ilike('category', `%${searchQuery}%`);
        
        if (error) console.error('Error searching prints:', error);
        else setSearchResults(data.map(formatPrintData));
        setLoading(false);
      } else if (!searchQuery.length) {
        setSearchResults([]);
      }
    };

    const debounceSearch = setTimeout(() => {
      searchPrints();
    }, 300);

    return () => clearTimeout(debounceSearch);

  }, [searchQuery, isSearching]);

  // Função para forçar o download
  const forceDownload = async (print) => {
    try {
      await supabase.rpc('increment_downloads', { product_id_to_update: print.id });
      const response = await fetch(print.imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `DesignFlix_${print.category}_${print.id.substring(0, 8)}.png`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
      alert('Could not download the image. Please try again.');
    }
  };

  // Função quando clica no card
  const handleCardClick = async (print) => {
    if (!user) {
      setIsLoginModalOpen(true);
      return;
    }
    
    const { data: latestProfile, error } = await supabase
      .from('profiles')
      .select('is_subscribed')
      .eq('id', user.id)
      .single();

    if (error || !latestProfile?.is_subscribed) {
      setIsSubscriptionModalOpen(true);
      return;
    }
    
    setCurrentPrint(print);
    setIsModalOpen(true);
  };

  const handleDownloadClick = (print) => {
    forceDownload(print);
  };

  return (
    <>
      {/* Modal de preview do print */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        {currentPrint && (
          <div className={styles.modalContent}>
            <img 
              src={currentPrint.imageUrl} 
              alt={currentPrint.category} 
              className={styles.modalImage}
            />
            <h3>{currentPrint.category}</h3>
            <p>ID: {currentPrint.id}</p>
            <button
              onClick={() => handleDownloadClick(currentPrint)}
              className={styles.downloadButton}
            >
              Download
            </button>
          </div>
        )}
      </Modal>

      <LoginRequiredModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)} 
      />
      
      <SubscriptionRequiredModal
        isOpen={isSubscriptionModalOpen}
        onClose={() => setIsSubscriptionModalOpen(false)}
      />

      <div className={styles.dashboardPage}>
        <Navbar />
        <main className={styles.mainContent}>
          {isSearching ? (
            <section className={styles.resultsSection}>
              <h2>Results for "{searchQuery}"</h2>
              {loading ? <p>Loading...</p> : (
                searchResults.length > 0 ? (
                  <div className={styles.searchResultsGrid}>
                    {searchResults.map((print) => (
                      <div key={print.id} onClick={() => handleCardClick(print)}>
                        <PrintCard
                          imageUrl={print.imageUrl}
                          category={print.category}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p>No prints found matching your search.</p>
                )
              )}
            </section>
          ) : (
            <>
              <header className={styles.dashboardHeader}>
                <h1>Welcome back, {userName}!</h1>
                <p>Explore the full catalog of exclusive prints.</p>
              </header>
              {loading ? <p style={{ padding: '0 3rem' }}>Loading content...</p> : (
                <>
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
            </>
          )}
        </main>
        <Footer />
      </div>
    </>
  );
};

export default DashboardPage;