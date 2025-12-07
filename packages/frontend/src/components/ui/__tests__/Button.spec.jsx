import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { Button } from "../Button";

describe("Button Component Testing", () => {
  // Tes 1: Perilaku default (render sebagai <button> dan bisa diklik)
  it("should render as a button and handle click events", async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn(); // Membuat mock function

    render(<Button onClick={handleClick}>Klik Saya</Button>);

    // 1. Cari elemen berdasarkan perannya (role)
    const buttonElement = screen.getByRole("button", { name: /klik saya/i });

    // 2. Pastikan elemen ada di dokumen
    expect(buttonElement).toBeInTheDocument();

    // 3. Simulasikan klik
    await user.click(buttonElement);

    // 4. Pastikan fungsi onClick kita dipanggil
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  // Tes 2: Prop 'disabled'
  it("should be disabled when disabled prop is true", async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();

    render(
      <Button onClick={handleClick} disabled>
        Tidak bisa
      </Button>
    );

    const buttonElement = screen.getByRole("button", { name: /tidak bisa/i });

    // 1. Pastikan tombolnya benar-benar 'disabled'
    expect(buttonElement).toBeDisabled();

    // 2. (Opsional) userEvent cukup pintar, ia tidak akan meng-klik elemen disabled
    await user.click(buttonElement).catch(() => {}); // Tangkap error jika ada

    // 3. Pastikan onClick TIDAK dipanggil
    expect(handleClick).not.toHaveBeenCalled();
  });

  // Tes 3: Logika 'asChild' (Tes Paling Penting!)
  it("should render as a child component when asChild is true", () => {
    // Kita akan render Button sebagai link (<a>)
    render(
      <Button asChild>
        <a href="/">Pergi ke Beranda</a>
      </Button>
    );

    // 1. Pastikan TIDAK ADA <button> yang di-render
    // Kita gunakan 'queryByRole' karena 'getByRole' akan error jika tidak ketemu
    const buttonElement = screen.queryByRole("button");
    expect(buttonElement).not.toBeInTheDocument();

    // 2. Pastikan komponen anak (link <a>) yang di-render
    const linkElement = screen.getByRole("link", {
      name: /pergi ke beranda/i,
    });
    expect(linkElement).toBeInTheDocument();

    // 3. Pastikan prop dari anak (href) tetap ada
    expect(linkElement).toHaveAttribute("href", "/");
  });

  // Tes 4: (Opsional & Agak Rapuh) Menguji styling/props non-standar
  it("should pass down data attributes", () => {
    // Tes ini berguna jika Anda ingin menguji integrasi dengan styling atau test-id
    render(<Button data-testid="theme-toggle-button">Toggle Theme</Button>);

    const buttonElement = screen.getByTestId("theme-toggle-button");
    expect(buttonElement).toBeInTheDocument();
    expect(buttonElement).toHaveTextContent("Toggle Theme");
  });
});
