import React from 'react';
import { useNavigate } from 'react-router-dom'; // ← IMPORTAR
import Modal from '../Modal/Modal';
import styles from './LoginRequiredModal.module.css';

const LoginRequiredModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate(); // ← ADICIONAR

  const handleGoToLogin = () => {
    onClose(); // Fecha o modal
    navigate('/login'); // ← NAVEGA PARA O LOGIN
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className={styles.modalContent}>
        <h3>Login Required</h3>
        <p>You must be logged in to download prints.</p>
        <button 
          className={styles.loginButton} 
          onClick={handleGoToLogin}
        >
          Go to Sign In
        </button>
      </div>
    </Modal>
  );
};

export default LoginRequiredModal;