import { getServerAuthUser, requireServerAuthUser } from "@/lib/auth/server";

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

describe("Settings page (protected route)", () => {
  beforeEach(() => {
    currentUserMock.mockReset();
    redirectMock.mockReset();
  });

  it("renders the signed-in user's email when authenticated", async () => {
    currentUserMock.mockResolvedValue({
      id: "user_789",
      firstName: "Charles",
      lastName: "Leclerc",
      imageUrl: null,
      primaryEmailAddress: { emailAddress: "charles@example.com" },
    });

    // Server Components are just async functions outside Next's real
    // rendering pipeline — calling and awaiting it directly, then
    // rendering the resolved JSX, is the standard way to unit test one.
    const { default: SettingsPage } = await import("@/app/(dashboard)/settings/page");
    const { render, screen } = await import("@testing-library/react");

    render(await SettingsPage());

    expect(screen.getByText(/signed in as charles@example.com/i)).toBeInTheDocument();
    expect(redirectMock).not.toHaveBeenCalled();
  });

  it("attempts to redirect to /sign-in when rendered while signed out", async () => {
    currentUserMock.mockResolvedValue(null);

    const { default: SettingsPage } = await import("@/app/(dashboard)/settings/page");

    await expect(SettingsPage()).rejects.toThrow("NEXT_REDIRECT:/sign-in");
    expect(redirectMock).toHaveBeenCalledWith("/sign-in");
  });
});
