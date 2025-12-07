import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import LoginButton from "../LoginButton";

describe("Login Button Component Testing", () => {
  it('should render the button with text "Masuk"', () => {
    render(<LoginButton />);

    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();

    const textElement = within(button).getByText("Masuk");
    expect(textElement).toBeInTheDocument();
  });

  it("should render the login SVG icon", () => {
    render(<LoginButton />);
    const button = screen.getByRole("button");

    const svg = button.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("should call the onClick handler when clicked", async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn(); // Buat mock function

    render(<LoginButton onClick={handleClick} />);

    const button = screen.getByRole("button");
    await user.click(button); // Simulasikan klik

    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
