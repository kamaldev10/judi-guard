import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { HeadProvider, Title } from 'react-head';
import Login from '../LoginPage';
import LoginForm from '@/components/auth/LoginForm';

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

// Mock the image asset
vi.mock('@/assets/images', () => ({
  LogoWithSlogan: 'mock-logo-with-slogan.png',
}));

// Mock the child component
vi.mock('@/components/auth/LoginForm', () => ({
  default: vi.fn(() => <div data-testid="mock-login-form">Mock Login Form</div>),
}));

// --- Test Suite ---

describe('Login Page Integration Testing', () => {
  // Helper render function
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
    document.title = ''; // Reset document title
  });

  // Test 1: Check document title
  it('should set the document title correctly', () => {
    renderPage();
    expect(document.title).toBe('Login | Judi Guard');
  });

  // Test 2: Check rendered content
  it('should render the logo and the mock LoginForm', () => {
    renderPage();

    // 1. Check for the logo image
    const logoImage = screen.getByAltText('Judi Guard Logo');
    expect(logoImage).toBeInTheDocument();
    expect(logoImage).toHaveAttribute('src', 'mock-logo-with-slogan.png');

    // 2. Check that the mock form component is rendered
    expect(screen.getByTestId('mock-login-form')).toBeInTheDocument();

    // 3. Check the placeholder text from the mock
    expect(screen.getByText('Mock Login Form')).toBeInTheDocument();
  });
});
