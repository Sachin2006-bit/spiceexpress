import React, { useState, useEffect } from 'react'
import { Toaster } from './lib/toast'
import { getUserFromStorage, isAuthed as libIsAuthed } from './lib/auth'
import { motion as fmMotion } from 'framer-motion'
import { BrowserRouter, Route, Routes, NavLink, Navigate } from 'react-router-dom'
import './App.css'
import Analytics from './pages/Analytics'
import Customers from './pages/Customers'
import CustomerList from './pages/CustomerList'
import AddCustomer from './pages/AddCustomer'
import Invoices from './pages/Invoices'
import InvoiceDetailsPage from './pages/InvoiceDetailsPage'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import LRsPage from './pages/LRsPage'
import LRDetailsPage from './pages/LRDetailsPage'
import Sidebar from './components/Sidebar'
import Profile from './pages/Profile'
import CreateLR from './pages/CreateLR'
import MIS from './pages/MIS'
import Tracking from './pages/Tracking'
import LandingPage from './pages/LandingPage'
import RateMapping from './pages/RateMapping'
import { motion } from 'framer-motion'
import gsap from 'gsap'
import PageLayout from './PageLayout'

// use centralized isAuthed helper from lib/auth
const isAuthed = libIsAuthed;

function PrivateRoute({ children, roles }: { children: React.ReactElement, roles?: string[] }) {
  if (!isAuthed()) return <Navigate to="/login" replace />;
  const user = getUserFromStorage();
  if (roles && user && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }
  return children;
}

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sessionExpiredModal, setSessionExpiredModal] = useState<{ open: boolean; message?: string }>({ open: false });
  const [darkMode, setDarkMode] = useState(() => {
    // Persist dark mode preference in localStorage
    return localStorage.getItem('dark_mode') === 'true';
  });

  React.useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('dark_mode', darkMode ? 'true' : 'false');
  }, [darkMode]);

  // Global fetch wrapper: detect 401 / expired JWT and force logout
  useEffect(() => {
    const origFetch = window.fetch.bind(window);
    // Modal state managed in component; we will set this state when we detect expiry
    let triggered = false;
    (window as any).fetch = async (input: RequestInfo, init?: RequestInit) => {
      try {
        const res = await origFetch(input, init);
        if (res.status === 401 && !triggered) {
          triggered = true;
          // parse body for message
          let bodyText = '';
          try {
            const clone = res.clone();
            const json = await clone.json().catch(() => null);
            if (json) bodyText = (json.error || json.message || json.details || '').toString();
          } catch {}
          const low = (bodyText || '').toLowerCase();
          if (low.includes('jwt expired') || low.includes('invalid token') || low.includes('unauthorized') || bodyText === '') {
            // show modal then redirect (modal handled in component state)
            // dispatch a custom event so React can pick it up
            window.dispatchEvent(new CustomEvent('sessionExpired', { detail: { message: bodyText || 'Session expired' } }));
          }
        }
        return res;
      } catch (err) {
        throw err;
      }
    };
    return () => {
      (window as any).fetch = origFetch;
    };
  }, []);

  // Listen for sessionExpired custom event to open modal
  useEffect(() => {
    let timer: any = null;
    const handler = (e: any) => {
      const msg = e?.detail?.message || 'Session expired. Please login again.';
      setSessionExpiredModal({ open: true, message: msg });
      // auto-redirect after 5s
      timer = setTimeout(() => {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }, 5000);
    };
    window.addEventListener('sessionExpired', handler as EventListener);
    return () => {
      window.removeEventListener('sessionExpired', handler as EventListener);
      if (timer) clearTimeout(timer);
    };
  }, []);

  // Main app render
  return (
    <BrowserRouter>
      <Toaster position="top-center" richColors closeButton />
      <Routes>
        <Route
          path="*"
          element={
            <PageLayout
              isAuthed={isAuthed()}
              darkMode={darkMode}
              setDarkMode={setDarkMode}
              sidebarOpen={sidebarOpen}
              setSidebarOpen={setSidebarOpen}
              sessionExpiredModal={sessionExpiredModal}
              setSessionExpiredModal={setSessionExpiredModal}
            />
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App
