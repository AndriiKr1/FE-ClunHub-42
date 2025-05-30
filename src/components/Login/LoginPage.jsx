import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { loginUser } from "../../store/slices/authSlice";
import styles from "./LoginPage.module.css";
import clanHubLogo from "../../assets/images/Logo2.png";

const LoginPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!formData.password.trim()) {
      newErrors.password = "Password required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!validateForm()) {
      return;
    }
  
    setIsLoading(true);
    setErrors({});
  
    try {
      const result = await dispatch(loginUser(formData)).unwrap();
      
      // Only navigate if the login was successful and we have a token
      if (result && result.token) {
        navigate("/dashboard");
      } else {
        // This should theoretically never happen, but just in case
        setErrors({
          submit: "An unexpected error occurred. Please try again."
        });
      }
    } catch (error) {  
      console.error("Login error:", error);
      
      // Handle various error types
      if (error === "user_not_found") {
        setErrors({
          submit: "User not found. Please check your email."
        });
      } else if (error === "invalid_credentials" || 
                (typeof error === 'string' && error.includes("Invalid email or password"))) {
        setErrors({
          submit: "Incorrect email or password. Please try again."
        });
      } else if (error === "server_unreachable" || 
                (typeof error === 'string' && error.includes("server"))) {
        setErrors({
          submit: "Server is temporarily unavailable. Please try again later."
        });
      } else {
        setErrors({
          submit: "Login failed. Please check your credentials and try again."
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = (e) => {
    e.preventDefault(); 
    navigate("/forgot-password"); 
  };



  return (
    <div className={styles.loginContainer}>
      <div className={styles.content}>
        {/* Logo */}
        <div className={styles.logoContainer}>
          <img src={clanHubLogo} alt="ClanHub Logo" className={styles.logo} />
        </div>

        {/* Login Form */}
        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <div className={styles.inputGroup}>
            <input
              id="email-input"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="E-mail"
              className={styles.input}
              disabled={isLoading}
            />
            {errors.email && (
              <span className={styles.error}>{errors.email}</span>
            )}
          </div>

          <div className={styles.inputGroup}>
            <input
              id="password-input"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Password"
              className={styles.input}
              disabled={isLoading}
            />
            {errors.password && (
              <span className={styles.error}>{errors.password}</span>
            )}
          </div>
          {/* Forgot Password */}
          <div className={styles.forgotPasswordContainer}>
            <a
              id="forgot-password-link"
              href="#"
              className={styles.forgotPassword}
              onClick={handleForgotPassword}
            >
              I forgot my password
            </a>
          </div>

          {errors.submit && (
            <div className={styles.submitError}>{errors.submit}</div>
          )}

          <button
            id="login-btn"
            type="submit"
            className={styles.submitButton}
            disabled={isLoading}
          >
            {isLoading ? "Log in..." : "Log in"}
          </button>
        </form>

      

        {/* Footer Text */}
        <div className={styles.footerText}>
          <p>family planner</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
