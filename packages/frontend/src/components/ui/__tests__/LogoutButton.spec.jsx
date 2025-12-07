import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import LogoutButton from "../LogoutButton";

describe("Logout Button Component Testing", () => {
  it('should render the button with text "Keluar"', () => {
    render(<LogoutButton />);

    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();

    // Pastikan teks "Keluar" ada di dalam tombol
    const textElement = within(button).getByText("Keluar");
    expect(textElement).toBeInTheDocument();
  });

  it("should render the logout SVG icon", () => {
    render(<LogoutButton />);
    const button = screen.getByRole("button");

    const svg = button.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("should call the onClick handler when clicked", async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();

    render(<LogoutButton onClick={handleClick} />);

    const button = screen.getByRole("button");
    await user.click(button);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
