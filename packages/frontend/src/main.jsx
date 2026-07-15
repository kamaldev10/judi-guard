import React from 'react';
import ReactDOM from 'react-dom/client';
import './style.css';
import App from '@/App';
import { BrowserRouter as Router } from 'react-router-dom';
import { ThemeProvider } from '@/shared/components/provider/ThemeProvider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const rootElement = document.getElementById('root');

if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <Router>
            <App />
          </Router>
        </ThemeProvider>
      </QueryClientProvider>
    </React.StrictMode>,
  );
} else {
  console.error('Root element with id "root" not found.');
}
