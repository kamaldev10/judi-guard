import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { HeadProvider } from 'react-head';
import Login from '../LoginPage';

// --- Mocking Dependencies ---

vi.mock('react-head', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    Title: ({ children }) => {
      document.title = children;
      return null;
    },
  };
});

vi.mock('@/assets/images', () => ({
  LogoWithSlogan: 'mock-logo-with-slogan.png',
}));

vi.mock('../../components/LoginForm.jsx', () => ({
  default: () => <div data-testid="mock-login-form">Mock Login Form</div>,
}));

describe('Login Page Integration Testing', () => {
  const renderPage = () => {
    return render(
      <HeadProvider>
        <MemoryRouter>
          <Login />
        </MemoryRouter>
      </HeadProvider>,
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
    document.title = '';
  });

  it('should set the document title correctly', () => {
    renderPage();
    expect(document.title).toBe('Login | Judi Guard');
  });

  it('should render the logo and the mock LoginForm', () => {
    renderPage();

    const logoImage = screen.getByAltText('Judi Guard Logo');
    expect(logoImage).toBeInTheDocument();
    expect(logoImage).toHaveAttribute('src', 'mock-logo-with-slogan.png');

    expect(screen.getByTestId('mock-login-form')).toBeInTheDocument();
    expect(screen.getByText('Mock Login Form')).toBeInTheDocument();
  });
});
