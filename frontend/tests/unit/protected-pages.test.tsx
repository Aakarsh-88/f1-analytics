import { getServerAuthUser, requireServerAuthUser } from "@/lib/auth/server";
import { render, screen } from "@testing-library/react";

const currentUserMock = jest.fn();
const redirectMock = jest.fn();

jest.mock("@clerk/nextjs/server", () => ({
  currentUser: () => currentUserMock(),
}));

// Real Next.js `redirect()` throws a special NEXT_REDIRECT error to halt
// rendering — mocking it as a silent no-op would let requireServerAuthUser()
// fall through to `return user` with `user` still null, which isn't what
// actually happens in production. Throwing here instead means the test
// exercises the same control-flow shape as the real function.
jest.mock("next/navigation", () => ({
  redirect: (path: string) => {
    redirectMock(path);
    throw new Error(`NEXT_REDIRECT:${path}`);
  },
}));

describe("getServerAuthUser", () => {
  beforeEach(() => {
    currentUserMock.mockReset();
  });

  it("returns null when there is no signed-in user", async () => {
    currentUserMock.mockResolvedValue(null);
    const user = await getServerAuthUser();
    expect(user).toBeNull();
  });

  it("maps Clerk's user object onto our AuthUser shape", async () => {
    currentUserMock.mockResolvedValue({
      id: "user_123",
      firstName: "Max",
      lastName: "Verstappen",
      imageUrl: "https://example.com/avatar.png",
      primaryEmailAddress: { emailAddress: "max@example.com" },
    });

    const user = await getServerAuthUser();

    expect(user).toEqual({
      id: "user_123",
      email: "max@example.com",
      firstName: "Max",
      lastName: "Verstappen",
      imageUrl: "https://example.com/avatar.png",
    });
  });

  it("maps a missing primary email to null rather than throwing", async () => {
    currentUserMock.mockResolvedValue({
      id: "user_123",
      firstName: "Max",
      lastName: null,
      imageUrl: null,
      primaryEmailAddress: null,
    });

    const user = await getServerAuthUser();

    expect(user?.email).toBeNull();
  });
});

describe("requireServerAuthUser", () => {
  beforeEach(() => {
    currentUserMock.mockReset();
    redirectMock.mockReset();
  });

  it("redirects to /sign-in when there is no signed-in user", async () => {
    currentUserMock.mockResolvedValue(null);

    await expect(requireServerAuthUser()).rejects.toThrow("NEXT_REDIRECT:/sign-in");

    expect(redirectMock).toHaveBeenCalledWith("/sign-in");
  });

  it("returns the mapped user without redirecting when signed in", async () => {
    currentUserMock.mockResolvedValue({
      id: "user_456",
      firstName: "Lando",
      lastName: "Norris",
      imageUrl: null,
      primaryEmailAddress: { emailAddress: "lando@example.com" },
    });

    const user = await requireServerAuthUser();

    expect(redirectMock).not.toHaveBeenCalled();
    expect(user.email).toBe("lando@example.com");
  });
});

describe("Settings page", () => {
  it("renders the settings page", async () => {
    const { default: SettingsPage } = await import(
      "@/app/(dashboard)/settings/page"
    );

    
    render(<SettingsPage />);

    expect(
      screen.getByRole("heading", { name: /settings/i })
    ).toBeInTheDocument();

    expect(screen.getByText(/appearance/i)).toBeInTheDocument();

    expect(screen.getByText(/about/i)).toBeInTheDocument();
  });
});

    