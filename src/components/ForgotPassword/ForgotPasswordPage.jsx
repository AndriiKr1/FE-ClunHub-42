import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { requestPasswordReset, resetPassword, clearPasswordResetState, verifyResetCode } from "../../store/slices/authSlice";
import styles from "./ForgotPasswordPage.module.css";
import clanHubLogo from "../../assets/images/Logo2.png";

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isLoading, passwordReset } = useSelector((state) => state.auth);

  const [step, setStep] = useState("email"); // "email", "code", "password"
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [error, setError] = useState("");
  const [remainingTime, setRemainingTime] = useState(120);
  const [canResend, setCanResend] = useState(false);
  const [isCodeExpired, setIsCodeExpired] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const isSubmitting = isLoading || passwordReset.isLoading;

  const codeInputRefs = useRef([]);
  if (codeInputRefs.current.length !== 6) {
    codeInputRefs.current = Array(6).fill().map(() => React.createRef());
  }

  useEffect(() => {
    return () => {
      dispatch(clearPasswordResetState());
    };
  }, [dispatch]);

  useEffect(() => {
    let intervalId;
    if (step === "code" && remainingTime > 0) {
      intervalId = setInterval(() => {
        setRemainingTime((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            clearInterval(intervalId);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(intervalId);
  }, [step, remainingTime]);

  useEffect(() => {
    if (passwordReset.error) {
      if (passwordReset.error === "code_expired") {
        setIsCodeExpired(true);
        setError("The verification code has expired. Request a new code.");
      } else if (passwordReset.error === "invalid_token") {
        setError("The verification code you entered is incorrect.");
      } else {
        setError(passwordReset.error);
      }
    }
  }, [passwordReset.error]);

  useEffect(() => {
    if (step === "code") {
      setTimeout(() => {
        if (codeInputRefs.current[0].current) {
          codeInputRefs.current[0].current.focus();
        }
      }, 100);
    }
  }, [step]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleCodeChange = (index, e) => {
    const value = e.target.value;
    if (!/^\d*$/.test(value)) return;
    setCode((prevCode) => {
      const codeArray = prevCode.split("");
      codeArray[index] = value.slice(-1);
      return codeArray.join("");
    });
    setError("");
    if (value && index < 5) {
      codeInputRefs.current[index + 1].current.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !e.target.value && index > 0) {
      codeInputRefs.current[index - 1].current.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text");
    const digits = pastedData.replace(/\D/g, "").slice(0, 6).split("");
    if (digits.length) {
      const newCode = digits.concat(Array(6 - digits.length).fill("")).join("");
      setCode(newCode);
      const focusIndex = Math.min(digits.length, 5);
      codeInputRefs.current[focusIndex].current.focus();
    }
  };

  const handleResendLink = () => {
    if (!canResend && !isCodeExpired) return;
    setIsCodeExpired(false);
    setCanResend(false);
    setRemainingTime(120);
    setCode("");
    setError("");
    dispatch(requestPasswordReset(email));
  };

  const validatePassword = (password) => {
    if (!password) return "Password is required";
    if (password.length < 8) return "Password must be at least 8 characters";
    if (password.length > 25) return "Password must not exceed 25 characters";
    if (!/^[A-Za-z0-9!@#$%^&*()_+[\]{};':"\\|,.<>/?-]+$/.test(password)) {
      return "Only Latin letters, numbers and symbols are allowed";
    }
    if (
      !/[a-z]/.test(password) ||
      !/[A-Z]/.test(password) ||
      !/[0-9]/.test(password) ||
      !/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)
    ) {
      return "Password must include uppercase, lowercase, number and special character";
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
  
    if (step === "email") {
      // Email validation
      if (!email.trim()) {
        setError("Please enter an email address");
        return;
      }
  
      // Email validation regex
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        setError("Please enter a valid email address");
        return;
      }
  
      try {
        setSuccessMessage("");
       
        await dispatch(requestPasswordReset(email)).unwrap();
        setSuccessMessage("Reset code sent! Please check your email.");
        setTimeout(() => {
          setStep("code");
          setSuccessMessage("");
        }, 2000);

      } catch (error) {
        if (error.response?.status === 404) {
          setError("This email is not registered in our system.");
        } 
      }
    } else if (step === "code") {
      if (code.length !== 6) {
        setError("Please enter a valid 6-digit code");
        return;
      }

      // Verify the code with the server
      try {
        await dispatch(verifyResetCode({ email: email, token: code })).unwrap();
        
        // Only proceed to the next step if verification succeeded
        setStep("password");
      } catch (error) {
        // Handle specific error types
        if (error === "invalid_token") {
          setError("The verification code you entered is incorrect.");
        } else if (error === "code_expired") {
          setIsCodeExpired(true);
          setError("The verification code has expired. Please request a new code.");
        } else if (error === "code_not_found") {
          setError("Invalid verification code. Please check and try again.");
        } else {
          setError(error || "Failed to verify code. Please try again.");
        }
      }
    } else if (step === "password") {
      const passwordError = validatePassword(newPassword);
      if (passwordError) {
        setError(passwordError);
        return;
      }
      if (newPassword !== repeatPassword) {
        setError("Passwords do not match");
        return;
      }
      try {
        await dispatch(
          resetPassword({
            token: code,
            newPassword,
            confirmPassword: repeatPassword,
            email: email
          })
        ).unwrap();
        
        setSuccessMessage("Password successfully reset!");
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } catch (error) {
        // Handle password reset errors
        setError(error || "Failed to reset password");
      }
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.logoContainer}>
          <img src={clanHubLogo} alt="ClanHub Logo" className={styles.logo} />
        </div>
        <h2 className={styles.title}>
          {step === "email" ? "Recover password" : step === "code" ? "Enter the code from the email" : "Create a new password"}
        </h2>
        
        {successMessage && (
          <div className={styles.successMessage}>{successMessage}</div>
        )}
        
        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          {step === "email" && (
            <>
              <input
                id="email-input"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError("");
                }}
                placeholder="Enter your e-mail"
                className={styles.input}
                disabled={isSubmitting}
                noValidate
              />
              <p className={styles.infoText}>
                We'll send you a link with a password reset code that will be valid for 5 minutes
              </p>
            </>
          )}
          {step === "code" && (
            <>
              <div className={styles.codeInputContainer} onPaste={handlePaste}>
                {Array(6).fill().map((_, index) => (
                  <input
                    key={index}
                    ref={codeInputRefs.current[index]}
                    type="text"
                    maxLength={1}
                    className={styles.codeInputBox}
                    value={code[index] || ""}
                    onChange={(e) => handleCodeChange(index, e)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    disabled={isSubmitting}
                    inputMode="numeric"
                    autoComplete="one-time-code"
                  />
                ))}
              </div>
              <div className={styles.timerContainer}>
                {isCodeExpired ? (
                  <></>
                ) : remainingTime === 0 ? (
                  <span className={styles.timerText}>You can request a new link</span>
                ) : (
                  <span className={styles.timerText}>
                    Wait before resending: {formatTime(remainingTime)}
                  </span>
                )}
                {(canResend || isCodeExpired) && (
                  <button
                    id="resend-link-btn"
                    type="button"
                    onClick={handleResendLink}
                    className={styles.resendButton}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Sending..." : "Send a new code"}
                  </button>
                )}
              </div>
            </>
          )}
          {step === "password" && (
            <>
              <input
                id="new-password-input"
                type="password"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  setError("");
                }}
                placeholder="Create new password"
                className={styles.input}
                disabled={isSubmitting}
              />
              <input
                id="repeat-password-input"
                type="password"
                value={repeatPassword}
                onChange={(e) => {
                  setRepeatPassword(e.target.value);
                  setError("");
                }}
                placeholder="Repeat your new password"
                className={styles.input}
                disabled={isSubmitting}
              />
            </>
          )}
          {error && <span className={styles.error}>
  {typeof error === 'object' ? error.message || JSON.stringify(error) : error}
</span>}
          <button 
            id="submit-btn" 
            type="submit" 
            className={styles.submitButton} 
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : step === "email" ? "Send reset code" : "Next"}
          </button>
        </form>
        
        {/* Back to login link */}
        <div className={styles.backToLoginContainer}>
          <a 
            href="#" 
            onClick={(e) => {
              e.preventDefault();
              navigate("/login");
            }}
            className={styles.backToLoginLink}
          >
            Back to login
          </a>
        </div>
        
      </div>
      <div className={styles.footerText}>family planner</div>
    </div>
    
  );
};

export default ForgotPasswordPage;