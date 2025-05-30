import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './WelcomePage.module.css';
import clanHubLogo from '../../assets/images/Logo2.png';

const WelcomePage = () => {
  const navigate = useNavigate();

  const handleCreatePlanner = () => {
    navigate('/register');
  };

  const handleExistingAccount = () => {
    navigate('/login');
  };

  return (
    <div className={styles.welcomeContainer}>
      <div className={styles.content}>
        {/* Logo */}
        <div className={styles.logoContainer}>
          <img src={clanHubLogo} alt="ClanHub Logo" className={styles.logo} />
        </div>

        {/* Action Buttons */}
        <div className={styles.actionsContainer}>
          <button 
            id="create-account-btn"
            className={`${styles.actionButton} ${styles.createPlannerButton}`}
            onClick={handleCreatePlanner}
          >
            I want to create my account
          </button>
          
          <button 
            id="login-btn"
            className={`${styles.actionButton} ${styles.loginButton}`}
            onClick={handleExistingAccount}
          >
            I already have my account
          </button>
        </div>

        {/* Footer Text */}
        <div className={styles.footerText}>
          <p>family planner</p>
          </div>
      </div>
    </div>
  );
};

export default WelcomePage;