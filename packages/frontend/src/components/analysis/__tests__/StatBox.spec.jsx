import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import StatBox from "../StatBox";

describe("Stat Box Component Testing", () => {
  // Data default untuk tes
  const defaultProps = {
    label: "Total Analisis",
    value: "1,500",
  };

  // Tes 1: Render default
  it("should render label, value, and default color correctly", () => {
    render(<StatBox {...defaultProps} />);

    // Cari elemen label berdasarkan teksnya
    const labelElement = screen.getByText(defaultProps.label);
    expect(labelElement).toBeInTheDocument();
    // (Opsional) Cek tag elemen jika perlu
    expect(labelElement.tagName).toBe("P");

    // Cari elemen value berdasarkan teksnya
    const valueElement = screen.getByText(defaultProps.value);
    expect(valueElement).toBeInTheDocument();
    expect(valueElement.tagName).toBe("P");

    // Verifikasi class warna default pada elemen value
    expect(valueElement).toHaveClass("text-slate-800");
  });

  // Tes 2: Render dengan warna kustom
  it("should apply custom color class when provided", () => {
    const customColor = "text-green-600";
    render(<StatBox {...defaultProps} color={customColor} />);

    // Cari elemen value
    const valueElement = screen.getByText(defaultProps.value);

    // Verifikasi class warna kustom diterapkan
    expect(valueElement).toHaveClass(customColor);
    // Pastikan class default tidak ada (jika berbeda)
    expect(valueElement).not.toHaveClass("text-slate-800");
  });

  // Tes 3: Render dengan value berupa angka
  it("should render correctly when value is a number", () => {
    const numberValue = 99;
    render(<StatBox label="Persentase Akurasi" value={numberValue} />);

    // Cari elemen value (angka perlu dikonversi ke string untuk getByText)
    const valueElement = screen.getByText(String(numberValue));
    expect(valueElement).toBeInTheDocument();

    // Pastikan warna default tetap diterapkan jika tidak ada prop color
    expect(valueElement).toHaveClass("text-slate-800");
  });

  // Tes 4: (Opsional) Cek struktur container jika perlu
  it("should render within the correct container structure", () => {
    // Render komponen
    const { container } = render(<StatBox {...defaultProps} />);

    // Cari div container utama (misal berdasarkan class unik atau struktur)
    // Ini agak rapuh karena bergantung pada implementasi style,
    // tapi bisa berguna untuk memastikan struktur dasar
    const mainDiv = container.querySelector(
      ".bg-slate-50\\/70.border.rounded-xl"
    ); // Contoh query selector
    expect(mainDiv).toBeInTheDocument();

    // Pastikan label dan value ada di dalam container itu
    const labelElement = screen.getByText(defaultProps.label);
    const valueElement = screen.getByText(defaultProps.value);
    expect(mainDiv).toContainElement(labelElement);
    expect(mainDiv).toContainElement(valueElement);
  });
});
