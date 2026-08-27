<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  Sparkles,
  Mail,
  Lock,
  User,
  ArrowRight,
} from 'lucide-vue-next'
import axios from 'axios'
import { useAuthStore } from '../stores/authStore.ts'
import { getMyProfile } from '../services/authService.ts'

const router = useRouter()
const authStore = useAuthStore()

const username = ref('')
const email = ref('')
const password = ref('')

const isLoading = ref(false)
const errorMessage = ref('')

const handleRegister = async () => {
  if (!username.value || !email.value || !password.value) {
    errorMessage.value = 'Please fill in all fields.'
    return
  }

  isLoading.value = true
  errorMessage.value = ''

  try {
    const result = await axios.post(
      'http://localhost:3000/auth/register',
      {
        username: username.value,
        email: email.value,
        password: password.value,
      }
    )

    authStore.setAccessToken(result.data.accessToken)
    const userdata = await getMyProfile()
    authStore.setUser(userdata)

    router.push('/')
  } catch (error: any) {
    errorMessage.value =
      error?.response?.data?.message ||
      'Registration failed. Please try again.'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="register-page">

    <!-- Background -->
    <div class="bg-orb bg-orb--1"></div>
    <div class="bg-orb bg-orb--2"></div>

    <div class="register-container">

      <!-- Logo -->
      <div class="logo-wrap">
        <div class="logo-icon">
          <Sparkles :size="24" />
        </div>

        <span class="logo-text">
          Sub<span class="logo-accent">AI</span>
        </span>
      </div>

      <!-- Card -->
      <div class="register-card">

        <!-- Header -->
        <div class="register-header">
          <h1 class="register-title">
            Create Account
          </h1>

          <p class="register-sub">
            Create your account to get started
          </p>
        </div>

        <!-- Form -->
        <form
          @submit.prevent="handleRegister"
          class="register-form"
        >

          <!-- Error -->
          <div
            v-if="errorMessage"
            class="error-alert"
          >
            {{ errorMessage }}
          </div>

          <!-- Username -->
          <div class="form-group">

            <label class="form-label">
              Username
            </label>

            <div class="input-wrap">

              <User
                :size="16"
                class="input-icon"
              />

              <input
                v-model="username"
                type="text"
                placeholder="smit"
                autocomplete="username"
                required
                class="form-input"
              />

            </div>

          </div>

          <!-- Email -->
          <div class="form-group">

            <label class="form-label">
              Email Address
            </label>

            <div class="input-wrap">

              <Mail
                :size="16"
                class="input-icon"
              />

              <input
                v-model="email"
                type="email"
                placeholder="smit@example.com"
                autocomplete="email"
                required
                class="form-input"
              />

            </div>

          </div>

          <!-- Password -->
          <div class="form-group">

            <label class="form-label">
              Password
            </label>

            <div class="input-wrap">

              <Lock
                :size="16"
                class="input-icon"
              />

              <input
                v-model="password"
                type="password"
                placeholder="••••••••"
                autocomplete="new-password"
                required
                class="form-input"
              />

            </div>

          </div>

          <!-- Button -->
          <button
            type="submit"
            class="btn btn--primary"
            :disabled="isLoading"
          >

            <span
              v-if="isLoading"
              class="spinner"
            ></span>

            <span
              v-else
              class="button-content"
            >
              Create Account
              <ArrowRight :size="16" />
            </span>

          </button>

        </form>

        <!-- Footer -->
        <div class="register-footer">

          <p>
            Already have an account?

            <button
              type="button"
              @click="router.push('/login')"
              class="signup-link"
            >
              Sign in
            </button>
          </p>

        </div>

      </div>

    </div>

  </div>
</template>

<style scoped>

.register-page {
  min-height: 100vh;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;

  background-color: var(--tertiary-color);

  position: relative;
  overflow: hidden;

  padding: 1.5rem;
}


/* =========================
   BACKGROUND ORBS
========================= */

.bg-orb {
  position: absolute;

  border-radius: 50%;

  filter: blur(100px);

  z-index: 0;

  opacity: 0.5;
}

.bg-orb--1 {
  width: 400px;
  height: 400px;

  background: rgba(139, 92, 246, 0.3);

  top: -100px;
  left: -100px;

  animation: floatOrb 8s ease-in-out infinite alternate;
}

.bg-orb--2 {
  width: 350px;
  height: 350px;

  background: rgba(6, 182, 212, 0.2);

  bottom: -50px;
  right: -100px;

  animation: floatOrb 10s ease-in-out infinite alternate-reverse;
}

@keyframes floatOrb {
  0% {
    transform: translate(0, 0) scale(1);
  }

  100% {
    transform: translate(30px, 50px) scale(1.1);
  }
}


/* =========================
   CONTAINER
========================= */

.register-container {
  width: 100%;
  max-width: 420px;

  position: relative;
  z-index: 10;

  display: flex;
  flex-direction: column;
  align-items: center;
}


/* =========================
   LOGO
========================= */

.logo-wrap {
  display: flex;
  align-items: center;

  gap: 12px;

  margin-bottom: 2rem;
}

.logo-icon {
  width: 48px;
  height: 48px;

  background: var(--team-gradient);

  border-radius: 12px;

  display: flex;
  align-items: center;
  justify-content: center;

  color: #fff;

  box-shadow: var(--shadow-glow);
}

.logo-text {
  font-size: 1.75rem;

  font-weight: 800;

  color: var(--text-primary);

  letter-spacing: -0.5px;
}

.logo-accent {
  background: var(--team-gradient);

  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;

  background-clip: text;
}


/* =========================
   CARD
========================= */

.register-card {
  width: 100%;

  background: rgba(24, 25, 36, 0.6);

  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);

  border: 1px solid var(--border-color);

  border-radius: 20px;

  padding: 2.5rem;

  box-shadow: var(--shadow-md);
}


/* =========================
   HEADER
========================= */

.register-header {
  text-align: center;

  margin-bottom: 2rem;
}

.register-title {
  font-size: 1.5rem;

  font-weight: 700;

  color: var(--text-primary);

  margin: 0 0 0.5rem;
}

.register-sub {
  font-size: 0.875rem;

  color: var(--text-muted);

  margin: 0;
}


/* =========================
   FORM
========================= */

.register-form {
  display: flex;

  flex-direction: column;

  gap: 1.25rem;
}


/* =========================
   ERROR
========================= */

.error-alert {
  background: rgba(239, 68, 68, 0.1);

  border: 1px solid rgba(239, 68, 68, 0.3);

  color: #ef4444;

  padding: 0.75rem 1rem;

  border-radius: 10px;

  font-size: 0.85rem;

  text-align: center;
}


/* =========================
   FORM GROUP
========================= */

.form-group {
  display: flex;

  flex-direction: column;

  gap: 0.5rem;
}

.form-label {
  font-size: 0.8rem;

  font-weight: 600;

  color: var(--text-primary);
}


/* =========================
   INPUT
========================= */

.input-wrap {
  position: relative;

  display: flex;

  align-items: center;
}

.input-icon {
  position: absolute;

  left: 1rem;

  color: var(--text-muted);

  z-index: 2;
}

.form-input {
  width: 100%;

  box-sizing: border-box;

  background: rgba(0, 0, 0, 0.2);

  border: 1px solid var(--border-color);

  border-radius: 12px;

  padding: 0.8rem 1rem 0.8rem 2.75rem;

  color: var(--text-primary);

  font-size: 0.95rem;

  outline: none;

  transition:
    border-color 0.2s,
    box-shadow 0.2s;
}

.form-input:focus {
  border-color: var(--primary-color);

  box-shadow:
    0 0 0 3px rgba(139, 92, 246, 0.15);
}

.form-input::placeholder {
  color: var(--text-muted);
}


/* =========================
   BUTTON
========================= */

.btn--primary {
  width: 100%;

  background: var(--team-gradient);

  color: white;

  border: none;

  border-radius: 12px;

  padding: 0.875rem;

  font-size: 1rem;

  font-weight: 700;

  cursor: pointer;

  display: flex;

  align-items: center;

  justify-content: center;

  gap: 8px;

  margin-top: 0.5rem;

  box-shadow:
    0 4px 15px rgba(139, 92, 246, 0.3);

  transition:
    transform 0.2s,
    box-shadow 0.2s;
}

.btn--primary:hover:not(:disabled) {
  transform: translateY(-2px);

  box-shadow:
    0 6px 20px rgba(139, 92, 246, 0.4);
}

.btn--primary:disabled {
  opacity: 0.7;

  cursor: not-allowed;
}


/* =========================
   BUTTON CONTENT
========================= */

.button-content {
  display: flex;

  align-items: center;

  justify-content: center;

  gap: 8px;
}


/* =========================
   SPINNER
========================= */

.spinner {
  width: 20px;
  height: 20px;

  border: 2px solid rgba(255, 255, 255, 0.3);

  border-radius: 50%;

  border-top-color: #fff;

  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}


/* =========================
   FOOTER
========================= */

.register-footer {
  margin-top: 1.5rem;

  text-align: center;

  font-size: 0.85rem;

  color: var(--text-muted);
}

.signup-link {
  background: none;

  border: none;

  padding: 0;

  color: var(--primary-color);

  text-decoration: none;

  font-weight: 600;

  margin-left: 4px;

  cursor: pointer;
}

.signup-link:hover {
  text-decoration: underline;
}


/* =========================
   MOBILE
========================= */

@media (max-width: 480px) {

  .register-page {
    padding: 1rem;
  }

  .register-card {
    padding: 1.5rem;
  }

  .logo-wrap {
    margin-bottom: 1.5rem;
  }

}

</style>