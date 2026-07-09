import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { HeadProvider, Title } from 'react-head';
import ForgotPasswordPage from '../ForgotPasswordPage';
import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm';

// --- 4. Mocking Dependencies ---

// Mock 'react-head' (Title component)
vi.mock('react-head', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    Title: ({ children }) => {
      // Set document title for testing
      document.title = children;
      return null;
    },
  };
});

// Mock the child component
vi.mock('@/components/auth/ForgotPasswordForm', () => ({
  default: vi.fn(() => (
    <div data-testid="mock-forgot-password-form">Mock Forgot Password Form</div>
  )),
}));

// --- Test Suite ---

describe('Forgot Password Page Integration Testing', () => {
  // Helper render
  const renderPage = () => {
    return render(
      <HeadProvider>
        <MemoryRouter>
          <ForgotPasswordPage />
        </MemoryRouter>
      </HeadProvider>,
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
    document.title = ''; // Reset document title
  });

  // Test 1: Check all rendered content
  it('should render the title, mock form, and login link', () => {
    renderPage();

    expect(document.title).toBe('Lupa Password | Judi Guard');

    expect(screen.getByTestId('mock-forgot-password-form')).toBeInTheDocument();

    const loginLink = screen.getByRole('link', { name: /login/i });
    expect(loginLink).toBeInTheDocument();
    expect(loginLink).toHaveAttribute('href', '/login');
  });
});
