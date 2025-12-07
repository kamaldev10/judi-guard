// src/pages/profile/__tests__/UserProfilePage.alternative.spec.jsx
import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

// Mock useRef globally before importing the component
let mockUseRefImplementation = vi.fn(() => ({ current: null }));

// Mock React.useRef before anything else
vi.mock("react", async () => {
  const actual = await vi.importActual("react");
  return {
    ...actual,
    useRef: (initialValue) => mockUseRefImplementation(initialValue),
  };
});

// Now import the component after mocking
import UserProfilePage from "../ProfilePage";

// Mock other dependencies
const mockUseLocation = vi.fn();
vi.mock("react-router-dom", () => ({
  MemoryRouter: ({ children }) => <div>{children}</div>,
  useLocation: () => mockUseLocation(),
}));

vi.mock("framer-motion", () => ({
  motion: { div: ({ children, ...props }) => <div {...props}>{children}</div> },
}));

vi.mock("lucide-react", () => ({
  AlertTriangle: () => <span data-testid="alert-icon">⚠️</span>,
}));

const mockUseProfilePresenter = vi.fn();
vi.mock("@/hooks/profile/useProfilePresenter", () => ({
  useProfilePresenter: () => mockUseProfilePresenter(),
}));

vi.mock("@/components/layout/PageLoader", () => ({
  default: () => <div data-testid="loader">Loading...</div>,
}));

vi.mock("@/pages/status/NotLogin", () => ({
  default: () => <div data-testid="login-prompt">Please login</div>,
}));

vi.mock("@/components/profile/ProfileHeader", () => ({
  ProfileHeader: () => <div data-testid="header">Header</div>,
}));

vi.mock("@/components/profile/ProfileConnection", () => ({
  ProfileConnection: () => <div data-testid="connection">Connection</div>,
}));

vi.mock("@/components/profile/ProfileSetting", () => ({
  ProfileSetting: () => <div data-testid="setting">Setting</div>,
}));

beforeAll(() => {
  // Mock scrollIntoView on all elements
  Element.prototype.scrollIntoView = vi.fn();
});

describe("UserProfilePage Alternative Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default mocks
    mockUseLocation.mockReturnValue({ pathname: "/profile" });
    mockUseProfilePresenter.mockReturnValue({
      user: { id: "1", name: "Test User" },
      isLoading: false,
      fetchError: null,
    });
    // Default useRef mock
    mockUseRefImplementation = vi.fn(() => ({ current: null }));
  });

  const renderComponent = () => {
    return render(
      <MemoryRouter>
        <UserProfilePage />
      </MemoryRouter>
    );
  };

  it("should render profile when user is logged in", () => {
    renderComponent();
    expect(screen.getByTestId("header")).toBeInTheDocument();
  });

  it("should handle scroll behavior with valid ref", () => {
    const scrollSpy = vi.spyOn(Element.prototype, "scrollIntoView");

    const mockScrollIntoView = vi.fn();
    mockUseRefImplementation = vi.fn(() => ({
      current: {
        scrollIntoView: mockScrollIntoView,
      },
    }));

    vi.useFakeTimers();
    renderComponent();

    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(scrollSpy).toHaveBeenCalledWith({ behavior: "smooth" });

    vi.useRealTimers();
  });

  it("should handle null ref gracefully", () => {
    mockUseRefImplementation = vi.fn(() => ({ current: null }));

    vi.useFakeTimers();

    expect(() => {
      renderComponent();
      act(() => {
        vi.advanceTimersByTime(150);
      });
    }).not.toThrow();

    vi.useRealTimers();
  });

  it("should handle ref without scrollIntoView method", () => {
    mockUseRefImplementation = vi.fn(() => ({
      current: {
        // Element exists but has no scrollIntoView method
        offsetHeight: 100,
        offsetWidth: 200,
      },
    }));

    vi.useFakeTimers();

    // This might throw, but we can test that the component handles it
    expect(() => {
      renderComponent();
      act(() => {
        vi.advanceTimersByTime(150);
      });
    }).not.toThrow();

    vi.useRealTimers();
  });
});
