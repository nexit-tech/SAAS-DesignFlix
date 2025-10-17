import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './HeroSection.module.css';

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.heroContainer}>
      <div className={styles.heroOverlay}></div>
      <div className={styles.heroContent}>
        <h1>Unique Prints to Wear Your Passion.</h1>
        <p>Create, share, or buy exclusive designs from independent artists. Your next favorite t-shirt is here.</p>
        <div className={styles.ctaButtons}>
          <button 
            className={styles.primaryButton} 
            onClick={() => navigate('/signup')}
          >
            Create Free Account
          </button>
          
          <button 
            className={styles.secondaryButton}
            onClick={() => navigate('/collections')}
          >
            Browse Prints
          </button>

          {/* Novo botão que só aparece no mobile */}
          <button 
            className={`${styles.secondaryButton} ${styles.mobileOnly}`}
            onClick={() => navigate('/pricing')}
          >
            View Pricing
          </button>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;