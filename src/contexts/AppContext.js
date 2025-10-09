"use client";
import { createContext, useContext, useState, useCallback } from 'react';
import toast, { Toaster } from 'react-hot-toast';

const AppContext = createContext();

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export const useToast = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useToast must be used within an AppProvider');
  }
  return context.showToast;
};

export const useLoading = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useLoading must be used within an AppProvider');
  }
  return { isLoading: context.isLoading, setLoading: context.setLoading };
};

export const AppProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);

  const showToast = useCallback((message, type = 'success') => {
    switch (type) {
      case 'success':
        toast.success(message);
        break;
      case 'error':
        toast.error(message);
        break;
      case 'loading':
        toast.loading(message);
        break;
      case 'info':
        toast(message, { icon: 'ℹ️' });
        break;
      default:
        toast(message);
    }
  }, []);

  const setLoading = useCallback((loading) => {
    setIsLoading(loading);
  }, []);

  const value = {
    isLoading,
    setLoading,
    showToast,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1f2937',
            color: '#f9fafb',
            border: '1px solid #374151',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#f9fafb',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#f9fafb',
            },
          },
        }}
      />
    </AppContext.Provider>
  );
};
