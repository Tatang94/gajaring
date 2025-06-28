import React from "react";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import { PasswordRegisterForm } from "../components/PasswordRegisterForm";
import styles from "./register.module.css";

const Register = () => {
  return (
    <>
      <Helmet>
        <title>Register - GAJARING</title>
      </Helmet>
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.header}>
            <h1 className={styles.title}>Join GAJARING</h1>
            <p className={styles.subtitle}>
              Create your account to start connecting with others
            </p>
          </div>
          
          <PasswordRegisterForm className={styles.form} />
          
          <div className={styles.footer}>
            <p>
              Already have an account?{" "}
              <Link to="/login" className={styles.link}>
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Register;