import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { HeadProvider, Title } from 'react-head';
import Register from '../RegisterPage';
import RegisterForm from '@/components/auth/RegisterForm';

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
vi.mock('@/components/auth/RegisterForm', () => ({
  default: vi.fn(() => <div data-testid="mock-register-form">Mock Register Form</div>),
}));

// --- Test Suite ---

describe('Register Page Integration Test', () => {
  // Helper render function
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
    document.title = ''; // Reset document title
  });

  // Test 1: Check document title
  it('should set the document title correctly', () => {
    renderPage();
    expect(document.title).toBe('Register | Judi Guard');
  });

  // Test 2: Check rendered content
  it('should render the logo and the mock RegisterForm', () => {
    renderPage();

    // 1. Check for the logo image
    const logoImage = screen.getByAltText('Judi Guard Logo');
    expect(logoImage).toBeInTheDocument();
    expect(logoImage).toHaveAttribute('src', 'mock-logo-with-slogan.png');

    // 2. Check that the mock form component is rendered
    expect(screen.getByTestId('mock-register-form')).toBeInTheDocument();

    // 3. (Optional) Check the placeholder text from the mock
    expect(screen.getByText('Mock Register Form')).toBeInTheDocument();
  });
});
