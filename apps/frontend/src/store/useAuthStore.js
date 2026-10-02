import { create } from 'zustand';

// Safely restore persistent credentials from localStorage
const getInitialAuth = () => {
  try {
    const savedToken = localStorage.getItem('accessToken');
    const savedUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
    if (savedToken && savedUser) {
      return { token: savedToken, user: savedUser };
    }
  } catch (e) {}

  // Fallback demo user
  return {
    token: 'demo_jwt_token_eve_health_2026',
    user: {
      id: 'user_patient_sarah_01',
      email: 'patient@evehealth.com',
      firstName: 'Sarah',
      lastName: 'Jenkins',
      role: 'PATIENT',
    },
  };
};

const initial = getInitialAuth();

export const useAuthStore = create((set) => ({
  token: initial.token,
  user: initial.user,
  setAuth: (token, user) => {
    try {
      if (token) localStorage.setItem('accessToken', token);
      if (user) localStorage.setItem('currentUser', JSON.stringify(user));
    } catch (e) {}
    set({ token, user });
  },
  logout: () => {
    try {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('currentUser');
    } catch (e) {}
    set({ token: null, user: null });
  },
  switchDemoRole: (role) => {
    let user;
    if (role === 'PATIENT') {
      user = {
        id: 'user_patient_sarah_01',
        email: 'patient@evehealth.com',
        firstName: 'Sarah',
        lastName: 'Jenkins',
        role: 'PATIENT',
      };
    } else if (role === 'CENTER_ADMIN') {
      user = {
        id: 'user_centeradmin_marcus_02',
        email: 'centeradmin@evehealth.com',
        firstName: 'Dr. Marcus',
        lastName: 'Vance',
        role: 'CENTER_ADMIN',
      };
    } else {
      user = {
        id: 'user_admin_elena_03',
        email: 'admin@evehealth.com',
        firstName: 'Elena',
        lastName: 'Rostova',
        role: 'PLATFORM_ADMIN',
      };
    }
    try {
      localStorage.setItem('currentUser', JSON.stringify(user));
    } catch (e) {}
    set({ user });
  },
}));
