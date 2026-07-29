import type { ReactNode } from "react";

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { TopNav } from "@/components/layout/top-nav";
import type { SearchItem } from "@/types/search";

const pushMock = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

jest.mock("@clerk/nextjs", () => ({
  SignedIn: () => null,
  SignedOut: ({ children }: { children: ReactNode }) => <>{children}</>,
  SignInButton: ({ children }: { children: ReactNode }) => <>{children}</>,
  UserButton: () => <div>User</div>,
}));

const searchIndex: SearchItem[] = [
  { type: "driver", label: "Max Verstappen", sublabel: "Dutch", href: "/drivers/verstappen" },
  { type: "constructor", label: "Ferrari", sublabel: "Italian", href: "/constructors" },
  { type: "race", label: "Bahrain Grand Prix", sublabel: "Bahrain International Circuit · 2025", href: "/races/1" },
  { type: "page", label: "2025 Championship Standings", href: "/standings" },
];

describe("TopNav search", () => {
  beforeEach(() => {
    pushMock.mockClear();
  });

  it("shows no dropdown when the query is empty", () => {
    render(<TopNav searchIndex={searchIndex} />);
    expect(screen.queryByText("Max Verstappen")).not.toBeInTheDocument();
  });

  it("filters results as the user types, matching label or sublabel", async () => {
    const user = userEvent.setup();
    render(<TopNav searchIndex={searchIndex} />);

    await user.type(screen.getByPlaceholderText(/search drivers/i), "ferrari");

    expect(screen.getByText("Ferrari")).toBeInTheDocument();
    expect(screen.queryByText("Max Verstappen")).not.toBeInTheDocument();
  });

  it("matches on sublabel text too", async () => {
    const user = userEvent.setup();
    render(<TopNav searchIndex={searchIndex} />);

    await user.type(screen.getByPlaceholderText(/search drivers/i), "bahrain");

    // Matches both because "Bahrain" appears in the race's label AND sublabel
    expect(screen.getByText("Bahrain Grand Prix")).toBeInTheDocument();
  });

  it("shows a no-results message for an unmatched query", async () => {
    const user = userEvent.setup();
    render(<TopNav searchIndex={searchIndex} />);

    await user.type(screen.getByPlaceholderText(/search drivers/i), "zzz-nonexistent");

    expect(screen.getByText(/no results for/i)).toBeInTheDocument();
  });

  it("navigates to the result's href and clears the query when clicked", async () => {
    const user = userEvent.setup();
    render(<TopNav searchIndex={searchIndex} />);

    const input = screen.getByPlaceholderText(/search drivers/i);
    await user.type(input, "verstappen");
    await user.click(screen.getByText("Max Verstappen"));

    expect(pushMock).toHaveBeenCalledWith("/drivers/verstappen");
    expect(input).toHaveValue("");
  });

  it("caps results at 8 even with many matches", async () => {
    const manyItems: SearchItem[] = Array.from({ length: 20 }, (_, i) => ({
      type: "driver" as const,
      label: `Test Driver ${i}`,
      href: `/drivers/test-${i}`,
    }));
    const user = userEvent.setup();
    render(<TopNav searchIndex={manyItems} />);

    await user.type(screen.getByPlaceholderText(/search drivers/i), "Test Driver");

    expect(screen.getAllByText(/Test Driver \d+/)).toHaveLength(8);
  });
});
