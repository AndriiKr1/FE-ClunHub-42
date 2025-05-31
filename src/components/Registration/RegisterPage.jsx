import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { registerUser } from "../../store/slices/authSlice";
import styles from "./RegisterPage.module.css";
import clanHubLogo from "../../assets/images/Logo2.png";

import avatar1 from "../../assets/avatars/avatar1.png";
import avatar2 from "../../assets/avatars/avatar2.png";
import avatar3 from "../../assets/avatars/avatar3.png";
import avatar4 from "../../assets/avatars/avatar4.png";
import avatar5 from "../../assets/avatars/avatar5.png";
import avatar6 from "../../assets/avatars/avatar6.png";

import Family from "../../assets/images/Family.png";
import User from "../../assets/images/User.png";

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
    inviteCode: "",
    username: "",
    age: "",
    avatar: "",
    role: "",
    email: "",
    password: "",
  });

  const userRoles = [
    "Father",
    "Mother",
    "Daughter",
    "Son",
    "Grandma",
    "Grandpa",
  ];

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showUserRoles, setShowUserRoles] = useState(false);

  const [showCreateFamilyModal, setShowCreateFamilyModal] = useState(false);
  const [familyName, setFamilyName] = useState("");
  const [inviteCode, setInviteCode] = useState("");

  function generateInviteCode(length = 6) {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < length; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;

    let processedValue = value;

    if (name === "inviteCode") {
      processedValue = value.toUpperCase();
    }

    setFormData((prev) => ({
      ...prev,
      [name]: processedValue,
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

  const handleAdminSelect = () => {
    setFormData((prev) => ({
      ...prev,
      role: "admin",
      userRole: "",
    }));
    setShowRoleModal(false);
    setShowCreateFamilyModal(true);
  };

  const handleUserRoleSelect = (role) => {
    setFormData((prev) => ({
      ...prev,
      role: "user",
      userRole: role,
    }));
    setShowRoleModal(false);
    setShowUserRoles(false);
    if (errors.role) setErrors((prev) => ({ ...prev, role: "" }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (
      formData.role === "user" &&
      formData.inviteCode &&
      formData.inviteCode.trim()
    ) {
      if (formData.inviteCode.trim().length < 4) {
        newErrors.inviteCode = "Invite code must be at least 4 characters";
      } else if (formData.inviteCode.trim().length > 10) {
        newErrors.inviteCode = "Invite code cannot exceed 10 characters";
      } else if (!/^[A-Z0-9]+$/.test(formData.inviteCode.trim())) {
        newErrors.inviteCode =
          "Invite code can only contain uppercase letters and numbers";
      }
    }

    if (formData.role === "admin" && (!familyName || !familyName.trim())) {
      newErrors.familyName = "Family name is required for admin";
    } else if (
      formData.role === "admin" &&
      familyName &&
      familyName.trim().length > 30
    ) {
      newErrors.familyName = "Family name cannot exceed 30 characters";
    }

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

    if (!formData.role) {
      newErrors.role = "Please select a role";
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
      let registrationData = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        age: formData.age,
        avatar: formData.avatar,
        role: formData.role,
      };

      if (formData.role === "admin") {
        registrationData = {
          ...registrationData,
          familyName: familyName,
          generateInviteCode: true,
        };
      } else if (formData.role === "user" && formData.inviteCode.trim()) {
        registrationData = {
          ...registrationData,
          inviteCode: formData.inviteCode.trim(),
        };
      }

      await dispatch(registerUser(registrationData)).unwrap();
      navigate("/dashboard");
    } catch (error) {
      console.error("Registration error:", error);

      if (typeof error === "string" && error.includes("already exists")) {
        setErrors({
          submit: "User with this email already exists",
        });
      } else if (
        typeof error === "string" &&
        error.includes("Invalid invite code")
      ) {
        setErrors({
          submit: "Invalid invite code. Please check and try again.",
        });
      } else if (
        typeof error === "string" &&
        error.includes("Invite code expired")
      ) {
        setErrors({
          submit: "Invite code has expired. Please request a new one.",
        });
      } else if (
        typeof error === "string" &&
        error.includes("Family name required")
      ) {
        setErrors({
          submit: "Family name is required for admin registration.",
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
          {formData.role === "user" && (
            <div className={styles.inputGroup}>
              <input
                id="invite-code-input"
                type="text"
                name="inviteCode"
                value={formData.inviteCode}
                onChange={handleChange}
                placeholder="invite code"
                className={styles.input}
                disabled={isLoading}
                maxLength={10}
                style={{ textTransform: "uppercase" }}
              />
              {errors.inviteCode && (
                <span className={styles.error}>{errors.inviteCode}</span>
              )}
            </div>
          )}

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
            >
              {formData.avatar ? (
                <div className={styles.avatarDisplayWrapper}>
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
                </div>
              ) : (
                "Choose your avatar..."
              )}
            </div>
            {errors.avatar && (
              <span className={styles.error}>{errors.avatar}</span>
            )}
          </div>

          <div className={styles.inputGroup}>
            <div
              className={styles.input}
              onClick={() => setShowRoleModal(true)}
            >
              {formData.role === "admin"
                ? "Admin"
                : formData.role === "user" && formData.userRole
                ? `${formData.userRole}`
                : "Choose your role..."}
            </div>
            {errors.role && <span className={styles.error}>{errors.role}</span>}
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

      {showRoleModal && (
        <div className={styles.roleModalOverlay}>
          <div className={styles.roleModal}>
            <h3 className={styles.modalTitle}>Choose your role</h3>
            <button className={styles.adminButton} onClick={handleAdminSelect}>
              <img src={Family} alt="Admin" className={styles.roleIconAdmin} />
              Create Family (Admin)
            </button>

            <div style={{ position: "relative", width: "100%" }}>
              <button
                className={styles.userButton}
                onClick={() => setShowUserRoles((prev) => !prev)}
              >
                <img src={User} alt="User" className={styles.roleIconUser} />
                Join Family (User)
                <span>▼</span>
              </button>
              {showUserRoles && (
                <div className={styles.userRolesDropdown}>
                  {userRoles.map((role) => (
                    <div
                      key={role}
                      className={styles.userRoleOption}
                      onClick={() => handleUserRoleSelect(role)}
                    >
                      {role}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button
              id="role-cancel-btn"
              className={styles.cancelButtonRole}
              onClick={() => {
                setShowRoleModal(false);
                setShowUserRoles(false);
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {showCreateFamilyModal && (
        <div className={styles.roleModalOverlay}>
          <div className={styles.roleModal}>
            <h3 className={styles.modalTitle}>Create Family</h3>
            <input
              className={`${styles.familyInput} ${
                errors.familyName ? styles.error : ""
              }`}
              type="text"
              placeholder="Create Family Name"
              value={familyName}
              onChange={(e) => {
                setFamilyName(e.target.value);
                if (errors.familyName) {
                  setErrors((prev) => ({ ...prev, familyName: "" }));
                }
              }}
              maxLength={30}
            />
            {errors.familyName && (
              <span className={styles.error}>{errors.familyName}</span>
            )}
            <button
              className={styles.inviteButton}
              onClick={() => setInviteCode(generateInviteCode())}
            >
              Create invite code
            </button>
            {inviteCode && (
              <div className={styles.inviteCodeGroup}>
                <div className={styles.inviteCode}>{inviteCode}</div>
                <button
                  className={styles.copyButton}
                  onClick={() => navigator.clipboard.writeText(inviteCode)}
                >
                  Copy
                </button>
              </div>
            )}
            <button
              className={styles.okButton}
              onClick={() => setShowCreateFamilyModal(false)}
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegisterPage;
