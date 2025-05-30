import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../utils/axiosConfig";

export const registerUser = createAsyncThunk(
  "auth/signup",
  async (userData, { rejectWithValue }) => {
    console.log("Sending registration data:", userData);
    try {
      // Format data exactly according to the API requirements
      const requestData = {
        username: userData.username,
        email: userData.email,
        password: userData.password,
        age: parseInt(userData.age),
        avatarId: userData.avatar,
      };
      
     
      
      const response = await axios.post(`/api/auth/sign-up`, requestData);
      return response.data;
    } catch (error) {
      
      
      // Handle specific error types
      if (error.response) {
        // Server responded with a non-2xx status
        if (error.response.status === 409 || 
           (error.response.data && error.response.data.message && 
            error.response.data.message.includes("already exists"))) {
          return rejectWithValue("User with this email already exists");
        } 
        else if (error.response.status === 400) {
          // Handle validation errors
          if (error.response.data && error.response.data.errors) {
            // Format validation errors
            const errorMessages = Object.entries(error.response.data.errors)
              .map(([field, message]) => `${field}: ${message}`)
              .join(', ');
            return rejectWithValue(`Validation failed: ${errorMessages}`);
          }
          return rejectWithValue(error.response.data?.message || "Invalid registration data");
        }
        else {
          return rejectWithValue(error.response.data?.message || "Server error occurred");
        }
      }
      
      // Network errors or other issues
      return rejectWithValue("Connection error. Please try again later.");
    }
  }
);
export const loginUser = createAsyncThunk(
  "auth/signin",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`/api/auth/sign-in`, userData);

      // Make sure the response contains the expected data
      if (!response.data || !response.data.token || !response.data.user) {
        return rejectWithValue("invalid_response_format");
      }

      return response.data;
    } catch (error) {
      console.error("Login error:", error);
      
      if (error.response) {
        // Specifically handle the 400 Bad Request with "Invalid email or password"
        if (error.response.status === 400) {
          if (typeof error.response.data === 'string' && 
              error.response.data.includes("Invalid email or password")) {
            return rejectWithValue("invalid_credentials");
          }
          return rejectWithValue(error.response.data || "bad_request");
        } else if (error.response.status === 404) {
          return rejectWithValue("user_not_found");
        } else if (error.response.status === 401 || error.response.status === 403) {
          return rejectWithValue("invalid_credentials");
        } else {
          return rejectWithValue(error.response.data || "server_error");
        }
      } else if (error.request) {
        return rejectWithValue("server_unreachable");
      } else {
        return rejectWithValue("network_error");
      }
    }
  }
);

export const requestPasswordReset = createAsyncThunk(
  "auth/requestPasswordReset",
  async (email, { rejectWithValue }) => {
    try {
      const response = await axios.post("/api/auth/forgot-password", { email });
     
      return response.data;
    } catch (error) {
          return rejectWithValue({
        status: error.response?.status,
        message: error.response?.data?.message || error.message,
        
      });
    }
  }
);

export const verifyResetCode = createAsyncThunk(
  "auth/verifyResetCode",
  async ({ email, token }, { rejectWithValue }) => {
    try {
      // Make API call to verify the reset code
      const response = await axios.post(`/api/auth/verify-reset-code`, {
        email,
        token
      });
      
      return response.data;
    } catch (error) {
      // Handle different error responses
      if (error.response) {
        // Server responded with an error
        if (error.response.status === 400) {
          return rejectWithValue("invalid_token");
        } else if (error.response.status === 404) {
          return rejectWithValue("code_not_found");
        } else if (error.response.status === 410) {
          return rejectWithValue("code_expired");
        } else {
          return rejectWithValue(error.response.data?.message || "Server error occurred");
        }
      }
      
      // Network error or other issue
      return rejectWithValue("Failed to verify code. Please try again.");
    }
  }
);

export const resetPassword = createAsyncThunk(
  "auth/resetPassword",
  async (data, { rejectWithValue }) => {
    try {
      const response = await axios.post(`/api/auth/reset-password`, {
        token: data.token,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword,
        email: data.email
      });

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Failed to reset password"
      );
    }
  }
);

const loadUserFromStorage = () => {
  try {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");

    return {
      user: storedUser ? JSON.parse(storedUser) : null,
      token: storedToken || null,
    };
  } catch (error) {
    console.error("Failed to load user data from localStorage:", error);
    return { user: null, token: null };
  }
};

const savedState = loadUserFromStorage();
const initialState = {
  user: savedState.user,
  token: savedState.token,
  isLoading: false,
  error: null,
  passwordReset: {
    isLinkSent: false,
    isCodeVerified: false,
    isLoading: false,
    error: null,
    message: null,
  },
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      localStorage.removeItem("token");
    },
    clearError: (state) => {
      state.error = null;
    },
    clearPasswordResetState: (state) => {
      state.passwordReset = {
        isLinkSent: false,
        isCodeVerified: false,
        isLoading: false,
        error: null,
        message: null,
      };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        localStorage.setItem("token", action.payload.token);
        localStorage.setItem("user", JSON.stringify(action.payload.user));
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        localStorage.setItem("token", action.payload.token);

        localStorage.setItem("user", JSON.stringify(action.payload.user));
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Запит на скидання паролю
      .addCase(requestPasswordReset.pending, (state) => {
        state.passwordReset.isLoading = true;
        state.passwordReset.error = null;

        state.passwordReset.isLinkSent = false;
      })
      .addCase(requestPasswordReset.fulfilled, (state) => {
        state.passwordReset.isLoading = false;

        state.passwordReset.isLinkSent = true;
        state.passwordReset.message =
          "If your email is registered, a password reset code has been sent.";
      })
      .addCase(requestPasswordReset.rejected, (state, action) => {
        state.passwordReset.isLoading = false;
        state.passwordReset.isLinkSent = false;
        state.passwordReset.error = action.payload;
      })

      // Скидання паролю
      .addCase(resetPassword.pending, (state) => {
        state.passwordReset.isLoading = true;
        state.passwordReset.error = null;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.passwordReset.isLoading = false;
        state.passwordReset.isCodeVerified = true;
        state.passwordReset.message =
          "Your password has been reset successfully";
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.passwordReset.isLoading = false;

        // Handle ErrorResponseDto format
        if (action.payload && action.payload.error) {
          state.passwordReset.error = action.payload.error;
        } else {
          state.passwordReset.error =
            action.payload || "Failed to reset password";
        }
      })
      .addCase(verifyResetCode.pending, (state) => {
        state.passwordReset.isLoading = true;
        state.passwordReset.error = null;
      })
      .addCase(verifyResetCode.fulfilled, (state) => {
        state.passwordReset.isLoading = false;
        state.passwordReset.isCodeVerified = true;
      })
      .addCase(verifyResetCode.rejected, (state, action) => {
        state.passwordReset.isLoading = false;
        state.passwordReset.isCodeVerified = false;
        state.passwordReset.error = action.payload;
      })
  },
});
export const { logout, clearError, clearPasswordResetState } =
  authSlice.actions;
export default authSlice.reducer;
