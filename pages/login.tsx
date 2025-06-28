import React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { PasswordLoginForm } from '../components/PasswordLoginForm';
import styles from './login.module.css';

const Login: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Login - GAJARING</title>
        <meta name="description" content="Login to your GAJARING account." />
      </Helmet>
      <div className={styles.container}>
        <div className={styles.loginCard}>
          <div className={styles.header}>
            <h1 className={styles.logo}>GAJARING</h1>
            <h2 className={styles.title}>Welcome Back</h2>
            <p className={styles.subtitle}>
              Enter your credentials to access your account.
            </p>
          </div>

          <PasswordLoginForm className={styles.form} />

          <div className={styles.footer}>
            <p>
              Don't have an account?{' '}
              <Link to="/register" className={styles.link}>
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;