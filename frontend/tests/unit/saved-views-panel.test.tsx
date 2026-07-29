import type { ReactNode } from "react";

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { SavedViewsPanel } from "@/components/analytics/saved-views-panel";

// Mocking OUR OWN `@/lib/auth` barrel (not `@clerk/nextjs` directly) is
// the point of that abstraction layer from Milestone 6 — this test
// exercises SavedViewsPanel's real integration with the auth module's
// public contract, without needing to know anything about Clerk's
// internals.
let mockIsSignedIn = true;
const mockUseAuthUser = jest.fn();

jest.mock("@/lib/auth", () => ({
  SignedIn: ({ children }: { children: ReactNode }) => (mockIsSignedIn ? <>{children}</> : null),
  SignedOut: ({ children }: { children: ReactNode }) => (mockIsSignedIn ? null : <>{children}</>),
  useAuthUser: () => mockUseAuthUser(),
}));

describe("SavedViewsPanel", () => {
  beforeEach(() => {
    window.localStorage.clear();
    mockIsSignedIn = true;
    mockUseAuthUser.mockReturnValue({
      user: { id: "user_test", firstName: "Max", email: "max@example.com", lastName: null, imageUrl: null },
      isLoaded: true,
      isSignedIn: true,
      signOut: jest.fn(),
    });
  });

  it("shows a sign-in prompt when signed out", () => {
    mockIsSignedIn = false;
    mockUseAuthUser.mockReturnValue({
      user: null,
      isLoaded: true,
      isSignedIn: false,
      signOut: jest.fn(),
    });

    render(<SavedViewsPanel fromYear={2021} toYear={2025} onLoadView={jest.fn()} />);

    expect(screen.getByText(/sign in to save/i)).toBeInTheDocument();
  });

  it("shows the save form when signed in", async () => {
    render(<SavedViewsPanel fromYear={2021} toYear={2025} onLoadView={jest.fn()} />);

    await screen.findByText("No saved views yet — pick a season range above and save it.");
    expect(screen.getByRole("button", { name: /save 2021–2025/i })).toBeInTheDocument();
  });

  it("saves a new view and lists it", async () => {
    const user = userEvent.setup();
    render(<SavedViewsPanel fromYear={2022} toYear={2024} onLoadView={jest.fn()} />);

    await screen.findByPlaceholderText(/2022–2024 rivalry/i);
    await user.type(screen.getByPlaceholderText(/2022–2024 rivalry/i), "My Rivalry View");
    await user.click(screen.getByRole("button", { name: /save 2022–2024/i }));

    expect(await screen.findByText("My Rivalry View")).toBeInTheDocument();
  });

  it("calls onLoadView with the saved view's range when clicked", async () => {
    const user = userEvent.setup();
    const onLoadView = jest.fn();
    render(<SavedViewsPanel fromYear={2022} toYear={2024} onLoadView={onLoadView} />);

    await screen.findByPlaceholderText(/rivalry/i);
    await user.type(screen.getByPlaceholderText(/rivalry/i), "Saved One");
    await user.click(screen.getByRole("button", { name: /save 2022–2024/i }));

    await user.click(await screen.findByText("Saved One"));

    expect(onLoadView).toHaveBeenCalledWith(2022, 2024);
  });

  it("deletes a saved view", async () => {
    const user = userEvent.setup();
    render(<SavedViewsPanel fromYear={2021} toYear={2023} onLoadView={jest.fn()} />);

    await screen.findByPlaceholderText(/rivalry/i);
    await user.type(screen.getByPlaceholderText(/rivalry/i), "To Delete");
    await user.click(screen.getByRole("button", { name: /save 2021–2023/i }));
    await screen.findByText("To Delete");

    await user.click(screen.getByRole("button", { name: /delete saved view "to delete"/i }));

    expect(screen.queryByText("To Delete")).not.toBeInTheDocument();
  });
});
