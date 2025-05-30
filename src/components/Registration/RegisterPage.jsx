import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { registerUser } from "../../store/slices/authSlice";
import styles from "./RegisterPage.module.css";
import clanHubLogo from "../../assets/images/Logo2.png";

// Импорт аватаров
import avatar1 from "../../assets/avatars/avatar1.png";
import avatar2 from "../../assets/avatars/avatar2.png";
import avatar3 from "../../assets/avatars/avatar3.png";
import avatar4 from "../../assets/avatars/avatar4.png";
import avatar5 from "../../assets/avatars/avatar5.png";
import avatar6 from "../../assets/avatars/avatar6.png";

const avatarOptions = [
  { id: "avatar1", image: avatar1 },
  { id: "avatar2", image: avatar2 },
  { id: "avatar3", image: avatar3 },
  { id: "avatar4", image: avatar4 },
  { id: "avatar5", image: avatar5 },
  { id: "avatar6", image: avatar6 },
];

const RegisterPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    username: "",
    age: "",
    avatar: "",
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);

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

  const handleAvatarSelect = (avatarId) => {
    setFormData((prev) => ({
      ...prev,
      avatar: avatarId,
    }));
    setShowAvatarModal(false);
    if (errors.avatar) {
      setErrors((prev) => ({ ...prev, avatar: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    } else if (formData.username.trim().length < 2) {
      newErrors.username = "Username should have at least 2 symbols";
    } else if (formData.username.trim().length > 15) {
      newErrors.username = "Username can't be more than 15 symbols";
    }

    if (!formData.age.trim()) {
      newErrors.age = "Age is required";
    } else {
      const ageValue = parseInt(formData.age);
      if (isNaN(ageValue) || ageValue < 5 || ageValue > 100) {
        newErrors.age = "Age must be between 5 and 100";
      }
    }

    if (!formData.avatar) {
      newErrors.avatar = "Please choose an avatar";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!formData.password.trim()) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    } else if (formData.password.length > 25) {
      newErrors.password = "Password must not exceed 25 characters";
    } else if (
      !/^[A-Za-z0-9!@#$%^&*()_+[\]{};':"\\|,.<>/?-]+$/.test(formData.password)
    ) {
      newErrors.password =
        "Only Latin letters, numbers and symbols are allowed";
    } else if (
      !/[a-z]/.test(formData.password) ||
      !/[A-Z]/.test(formData.password) ||
      !/[0-9]/.test(formData.password) ||
      !/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(formData.password)
    ) {
      newErrors.password =
        "Password must include uppercase, lowercase, number and special character";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      await dispatch(
        registerUser({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          age: formData.age,
          avatar: formData.avatar,
        })
      ).unwrap();

      navigate("/dashboard");
    } catch (error) {
      console.error("Registration error:", error);

      if (typeof error === "string" && error.includes("already exists")) {
        setErrors({
          submit: "User with this email already exists",
        });
      } else if (
        typeof error === "string" &&
        error.includes("Validation failed")
      ) {
        setErrors({
          submit: error,
        });
      } else {
        setErrors({
          submit: error || "Registration failed. Please try again.",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.registerContainer}>
      <div className={styles.content}>
        <div className={styles.logoContainer}>
          <img src={clanHubLogo} alt="ClanHub Logo" className={styles.logo} />
        </div>

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <div className={styles.inputGroup}>
            <input
              id="username-input"
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Username"
              className={styles.input}
              disabled={isLoading}
            />
            {errors.username && (
              <span className={styles.error}>{errors.username}</span>
            )}
          </div>

          <div className={styles.inputGroup}>
            <input
              id="age-input"
              type="number"
              name="age"
              value={formData.age}
              onChange={handleChange}
              placeholder="Age"
              className={styles.input}
              disabled={isLoading}
              min="1"
            />
            {errors.age && <span className={styles.error}>{errors.age}</span>}
          </div>

          <div className={styles.inputGroup}>
            <div
              id="avatar-selector"
              className={styles.input}
              onClick={() => setShowAvatarModal(true)}
              style={{
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              {formData.avatar ? (
                <>
                  <span>Avatar selected</span>
                  <div className={styles.avatarPreviewContainer}>
                    <img
                      src={
                        avatarOptions.find((a) => a.id === formData.avatar)
                          ?.image
                      }
                      alt="Selected Avatar"
                      className={styles.avatarPreview}
                    />
                  </div>
                </>
              ) : (
                "Choose your avatar..."
              )}
            </div>
            {errors.avatar && (
              <span className={styles.error}>{errors.avatar}</span>
            )}
          </div>

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

          {errors.submit && (
            <div className={styles.submitError}>{errors.submit}</div>
          )}

          <button
            id="register-submit-btn"
            type="submit"
            className={styles.submitButton}
            disabled={isLoading}
          >
            {isLoading ? "Creating..." : "Create Account"}
          </button>
        </form>

        <div className={styles.footerText}>
          <p>family planner</p>
        </div>
      </div>

      {/* Avatar modal */}
      {showAvatarModal && (
        <div className={styles.avatarModalOverlay}>
          <div className={styles.avatarModal}>
            <h3 className={styles.modalTitle}>Choose your avatar</h3>
            <div className={styles.avatarGrid}>
              {avatarOptions.map((avatar) => (
                <img
                  key={avatar.id}
                  src={avatar.image}
                  alt={avatar.id}
                  className={`${styles.avatarImage} ${
                    formData.avatar === avatar.id ? styles.selected : ""
                  }`}
                  onClick={() => handleAvatarSelect(avatar.id)}
                />
              ))}
            </div>
            <button
              id="avatar-cancel-btn"
              className={styles.cancelButton}
              onClick={() => setShowAvatarModal(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegisterPage;
