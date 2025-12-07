import React from "react";
import { act, render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { HeadProvider, Title } from "react-head";
import AboutUs from "../AboutUs";

// --- 3. Mocking Dependencies ---

// Mock 'framer-motion' (components and hooks)

vi.mock("framer-motion", () => ({
  motion: {
    section: React.forwardRef(({ children, ...props }, ref) => (
      <section ref={ref} {...props}>
        {children}
      </section>
    )),
    div: React.forwardRef(({ children, ...props }, ref) => (
      <div ref={ref} {...props}>
        {children}
      </div>
    )),
    h1: React.forwardRef(({ children, ...props }, ref) => (
      <h1 ref={ref} {...props}>
        {children}
      </h1>
    )),
    h2: React.forwardRef(({ children, ...props }, ref) => (
      <h2 ref={ref} {...props}>
        {children}
      </h2>
    )),
    p: React.forwardRef(({ children, ...props }, ref) => (
      <p ref={ref} {...props}>
        {children}
      </p>
    )),
    li: React.forwardRef(({ children, ...props }, ref) => (
      <li ref={ref} {...props}>
        {children}
      </li>
    )),
    img: React.forwardRef(({ children, ...props }, ref) => (
      <img ref={ref} {...props}>
        {children}
      </img>
    )),
  },
  useScroll: vi.fn(() => ({ scrollYProgress: { get: () => 0 } })),
  // Mock useTransform to return a static value
  useTransform: vi.fn((val, from, to) => {
    if (to[0] === 0) return { value: 0 }; // For opacity
    if (to[0] === 0.95) return { value: 0.95 }; // For scale
    return to[0];
  }),
}));

// Mock 'react-head' (Title component)
vi.mock("react-head", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    // Mock the Title component to just render its children
    Title: ({ children }) => {
      // Set document title for testing
      document.title = children;
      return null; // Don't render anything in the test DOM
    },
  };
});

// Mock 'lucide-react' (if any are used, though not in this file)

// Mock image assets
vi.mock("@/assets/images", () => ({
  AboutFeatures: "mock-about-features.png",
}));

vi.mock("@/constants", () => ({
  membersData: [
    {
      id: 1,
      name: "Ferdian Sakti Sudrajat Akbar",
      cohortID: "MC209D5Y0290",
      university: "Universitas Hasyim Asy’ari Tebuireng Jombang",
      role: "Machine Learning",
      image: "mock-ferdian-image.png",
    },
    {
      id: 2,
      name: "Ali Musthafa Kamal",
      cohortID: "FC844D5Y0671",
      university: "Universitas Riau",
      role: "FrontEnd BackEnd",
      image: "mock-ali-image.png,",
    },
  ],
}));

// --- Test Suite ---

describe("About Us Page Integration Testing", () => {
  const mockMembersDataForTest = [
    {
      id: 1,
      name: "Ferdian Sakti Sudrajat Akbar",
      cohortID: "MC209D5Y0290",
      university: "Universitas Hasyim Asy’ari Tebuireng Jombang",
      role: "Machine Learning",
      image: "mock-ferdian-image.png",
    },
    {
      id: 2,
      name: "Ali Musthafa Kamal",
      cohortID: "FC844D5Y0671",
      university: "Universitas Riau",
      role: "FrontEnd BackEnd",
      image: "mock-ali-image.png,",
    },
  ];

  // Helper render
  const renderPage = (route = "/about-us") => {
    return render(
      <HeadProvider>
        <MemoryRouter initialEntries={[route]}>
          <AboutUs />
        </MemoryRouter>
      </HeadProvider>
    );
  };

  const mockConsoleError = vi.fn();
  const originalConsoleError = console.error;

  beforeEach(() => {
    vi.clearAllMocks();
    document.title = "";
    // Silence React errors about "act"
    console.error = mockConsoleError;
  });

  afterAll(() => {
    console.error = originalConsoleError;
  });

  // Test 1: Document Title
  it("should set the document title correctly", () => {
    renderPage();
    expect(document.title).toBe("Tentang Kami | Judi Guard");
  });

  // Test 2: Intro Section Content
  it("should render the intro section content", () => {
    renderPage();
    expect(
      screen.getByRole("heading", { level: 1, name: /judi guard/i })
    ).toBeInTheDocument();
    expect(
      screen.getByText(/aplikasi berbasis AI yang mampu mendeteksi/i)
    ).toBeInTheDocument();
  });

  // Test 3: Features Section Content
  it("should render the features section content", () => {
    renderPage();

    // Check heading
    expect(
      screen.getByRole("heading", { level: 2, name: /apa yang kami tawarkan/i })
    ).toBeInTheDocument();

    // Check illustration image
    const featureImage = screen.getByAltText(/fitur judi guard/i);
    expect(featureImage).toBeInTheDocument();
    expect(featureImage).toHaveAttribute("src", "mock-about-features.png");

    // Check for a few feature list items
    expect(
      screen.getByText(/Analisis Komentar Berbasis AI/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/Integrasi YouTube API/i)).toBeInTheDocument();
    expect(screen.getByText(/Dashboard Interaktif/i)).toBeInTheDocument();
  });

  // Test 4: Team Section Content
  it("should render the team section and all mock team members", () => {
    renderPage();

    // Check heading
    expect(
      screen.getByRole("heading", { level: 2, name: /tim kami/i })
    ).toBeInTheDocument();

    // Check that all mock members are rendered
    mockMembersDataForTest.forEach((member) => {
      expect(screen.getByText(member.name)).toBeInTheDocument();
      expect(screen.getByText(member.cohortID)).toBeInTheDocument();
      expect(screen.getByText(member.university)).toBeInTheDocument();
      expect(screen.getByText(member.role)).toBeInTheDocument();

      const memberImage = screen.getByAltText(member.name);
      expect(memberImage).toBeInTheDocument();
      expect(memberImage).toHaveAttribute("src", member.image);
    });

    // Check total number of members rendered
    const memberImages = screen.getAllByRole("img", {
      name: /(Ferdian Sakti Sudrajat Akbar|Ali Musthafa Kamal)/i,
    });
    expect(memberImages).toHaveLength(mockMembersDataForTest.length);
  });

  // Test 5: Scrolling behavior (useEffect)
  it("should attempt to scroll to intro-section", () => {
    // Mock scrollIntoView
    const mockScrollIntoView = vi.fn();
    window.HTMLElement.prototype.scrollIntoView = mockScrollIntoView;

    // Use fake timers to control setTimeout
    vi.useFakeTimers();

    renderPage("/about-us");

    // Advance the timer by 100ms
    act(() => {
      vi.advanceTimersByTime(100);
    });

    // Check if scrollIntoView was called
    expect(mockScrollIntoView).toHaveBeenCalledTimes(1);
    expect(mockScrollIntoView).toHaveBeenCalledWith({ behavior: "smooth" });

    // Clean up timer mock
    vi.useRealTimers();
  });
});
