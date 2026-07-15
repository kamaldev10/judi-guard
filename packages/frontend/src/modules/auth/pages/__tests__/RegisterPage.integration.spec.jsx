import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { HeadProvider } from 'react-head';
import Register from '../RegisterPage';

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

vi.mock('../../components/RegisterForm.jsx', () => ({
  default: () => <div data-testid="mock-register-form">Mock Register Form</div>,
}));

describe('Register Page Integration Test', () => {
  const renderPage = () => {
    return render(
      <HeadProvider>
        <MemoryRouter>
          <Register />
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
    expect(document.title).toBe('Register | Judi Guard');
  });

  it('should render the logo and the mock RegisterForm', () => {
    renderPage();

    const logoImage = screen.getByAltText('Judi Guard Logo');
    expect(logoImage).toBeInTheDocument();
    expect(logoImage).toHaveAttribute('src', 'mock-logo-with-slogan.png');

    expect(screen.getByTestId('mock-register-form')).toBeInTheDocument();
    expect(screen.getByText('Mock Register Form')).toBeInTheDocument();
  });
});
