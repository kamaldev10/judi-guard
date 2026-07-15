import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import PageLoader from '../PageLoader';

describe('Page Loader Component Testing', () => {
  // Render komponen sebelum setiap tes
  beforeEach(() => {
    render(<PageLoader />);
  });

  it('should render the container div with correct structure', () => {
    const divContainer = screen.getByTestId('page-loader-container');
    expect(divContainer).toBeInTheDocument();
  });

  it('should render the main SVG element', () => {
    // Cara paling mudah mencari SVG (tanpa title/role spesifik)
    // adalah dengan querySelector
    const svgElement = document.querySelector('svg.pl'); // Cari SVG dengan class 'pl'
    expect(svgElement).toBeInTheDocument();
  });

  it('should render the four circle elements inside the SVG', () => {
    // Cari SEMUA elemen 'circle' di dalam SVG
    const circleElements = document.querySelectorAll('svg.pl > circle');
    // Pastikan ada tepat 4 elemen circle
    expect(circleElements).toHaveLength(4);
  });

  it('should render circles with specific class names', () => {
    // Verifikasi keberadaan setiap circle berdasarkan class uniknya
    expect(document.querySelector('circle.pl__ring--a')).toBeInTheDocument();
    expect(document.querySelector('circle.pl__ring--b')).toBeInTheDocument();
    expect(document.querySelector('circle.pl__ring--c')).toBeInTheDocument();
    expect(document.querySelector('circle.pl__ring--d')).toBeInTheDocument();
  });
});
