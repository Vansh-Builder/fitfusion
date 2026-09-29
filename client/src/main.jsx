import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import './index.css';

// Contexts
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

// Route guards
import { ProtectedRoute, AdminRoute, PublicRoute } from './routes/Guards';

// Layout
import AppLayout from './components/layout/AppLayout';

// Pages — Public
import HomePage from './pages/HomePage';
import { LoginPage, RegisterPage, ForgotPasswordPage } from './pages/AuthPages';

// Pages — Onboarding
import WizardPage from './pages/WizardPage';

// Pages — Protected
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import ExercisesPage from './pages/ExercisesPage';
import WorkoutPlannerPage from './pages/WorkoutPlannerPage';
import MealPlannerPage from './pages/MealPlannerPage';
import UploadMealPage from './pages/UploadMealPage';
import WaterTrackerPage from './pages/WaterTrackerPage';
import SleepTrackerPage from './pages/SleepTrackerPage';
import HabitTrackerPage from './pages/HabitTrackerPage';
import ProgressPage from './pages/ProgressPage';
import { BMICalculatorPage, CalorieCalculatorPage } from './pages/CalculatorPages';
import CommunityPage from './pages/CommunityPage';
import ChallengesPage from './pages/ChallengesPage';
import BlogPage from './pages/BlogPage';
import AIAssistantPage from './pages/AIAssistantPage';

// Extra pages
import {
  HealthRecordsPage,
  MedicinesPage,
  AppointmentsPage,
  PantryPage,
  ShoppingListPage,
  FamilyHealthPage,
  RewardsPage,
  NutritionScorePage,
} from './pages/ExtraPages';

// Admin page
import AdminDashboardPage from './pages/AdminDashboardPage';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                borderRadius: '12px',
                fontFamily: 'Inter, system-ui, sans-serif',
                fontSize: '14px',
                fontWeight: 500,
              },
            }}
          />
          <Routes>
            {/* Public home */}
            <Route path="/" element={<HomePage />} />

            {/* Auth pages (redirect to /dashboard if already logged in) */}
            <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
            <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
            <Route path="/forgot-password" element={<PublicRoute><ForgotPasswordPage /></PublicRoute>} />

            {/* Onboarding wizard (protected but no app shell) */}
            <Route path="/wizard" element={<ProtectedRoute><WizardPage /></ProtectedRoute>} />

            {/* Main app with sidebar + navbar */}
            <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/profile" element={<ProfilePage />} />

              {/* Fitness */}
              <Route path="/exercises" element={<ExercisesPage />} />
              <Route path="/workout-planner" element={<WorkoutPlannerPage />} />
              <Route path="/progress" element={<ProgressPage />} />

              {/* Nutrition */}
              <Route path="/meal-planner" element={<MealPlannerPage />} />
              <Route path="/upload-meal" element={<UploadMealPage />} />
              <Route path="/nutrition-score" element={<NutritionScorePage />} />

              {/* Health Tracking */}
              <Route path="/water-tracker" element={<WaterTrackerPage />} />
              <Route path="/sleep-tracker" element={<SleepTrackerPage />} />
              <Route path="/habit-tracker" element={<HabitTrackerPage />} />
              <Route path="/bmi-calculator" element={<BMICalculatorPage />} />
              <Route path="/calorie-calculator" element={<CalorieCalculatorPage />} />

              {/* Community */}
              <Route path="/community" element={<CommunityPage />} />
              <Route path="/challenges" element={<ChallengesPage />} />
              <Route path="/blog" element={<BlogPage />} />
              <Route path="/ai-assistant" element={<AIAssistantPage />} />

              {/* Health Records */}
              <Route path="/health-records" element={<HealthRecordsPage />} />
              <Route path="/medicines" element={<MedicinesPage />} />
              <Route path="/appointments" element={<AppointmentsPage />} />

              {/* Smart Tools */}
              <Route path="/pantry" element={<PantryPage />} />
              <Route path="/shopping" element={<ShoppingListPage />} />
              <Route path="/family" element={<FamilyHealthPage />} />
              <Route path="/rewards" element={<RewardsPage />} />
            </Route>

            {/* Admin panel */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminRoute>
                    <AppLayout />
                  </AdminRoute>
                </ProtectedRoute>
              }
            >
              <Route index element={<AdminDashboardPage />} />
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>
);
