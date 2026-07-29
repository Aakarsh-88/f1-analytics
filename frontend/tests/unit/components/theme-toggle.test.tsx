import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { ThemeToggle } from "@/components/layout/theme-toggle";

const setThemeMock = jest.fn();
let resolvedTheme = "dark";

jest.mock("next-themes", () => ({
  useTheme: () => ({
    resolvedTheme,
    setTheme: setThemeMock,
  }),
}));

describe("ThemeToggle", () => {
  beforeEach(() => {
    setThemeMock.mockClear();
    resolvedTheme = "dark";
  });

  it("reflects the current theme via aria-checked", () => {
    resolvedTheme = "dark";
    render(<ThemeToggle />);
    expect(screen.getByRole("switch")).toHaveAttribute("aria-checked", "true");
  });

  it("reflects light theme as unchecked", () => {
    resolvedTheme = "light";
    render(<ThemeToggle />);
    expect(screen.getByRole("switch")).toHaveAttribute("aria-checked", "false");
  });

  it("calls setTheme with the opposite theme when clicked", async () => {
    const user = userEvent.setup();
    resolvedTheme = "dark";
    render(<ThemeToggle />);

    await user.click(screen.getByRole("switch"));

    expect(setThemeMock).toHaveBeenCalledWith("light");
  });

  it("toggles from light to dark", async () => {
    const user = userEvent.setup();
    resolvedTheme = "light";
    render(<ThemeToggle />);

    await user.click(screen.getByRole("switch"));

    expect(setThemeMock).toHaveBeenCalledWith("dark");
  });
});
