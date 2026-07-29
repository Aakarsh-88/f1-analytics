import { act, renderHook, waitFor } from "@testing-library/react";

import { useSavedViews } from "@/hooks/use-saved-views";

describe("useSavedViews", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("returns an empty list when signed out (userId is null)", async () => {
    const { result } = renderHook(() => useSavedViews(null));
    await waitFor(() => expect(result.current.mounted).toBe(true));
    expect(result.current.views).toEqual([]);
  });

  it("saves a view and persists it to localStorage", async () => {
    const { result } = renderHook(() => useSavedViews("user_123"));
    await waitFor(() => expect(result.current.mounted).toBe(true));

    act(() => {
      result.current.saveView("Verstappen vs Norris", 2023, 2025);
    });

    expect(result.current.views).toHaveLength(1);
    expect(result.current.views[0]).toMatchObject({
      name: "Verstappen vs Norris",
      fromYear: 2023,
      toYear: 2025,
    });

    const raw = window.localStorage.getItem("f1-analytics:saved-views:user_123");
    expect(raw).not.toBeNull();
    expect(JSON.parse(raw!)).toHaveLength(1);
  });

  it("namespaces saved views per user ID", async () => {
    const { result: userA } = renderHook(() => useSavedViews("user_a"));
    await waitFor(() => expect(userA.current.mounted).toBe(true));
    act(() => userA.current.saveView("User A's view", 2021, 2022));

    const { result: userB } = renderHook(() => useSavedViews("user_b"));
    await waitFor(() => expect(userB.current.mounted).toBe(true));

    // user_b should never see user_a's saved views, even though both
    // hooks share the same underlying localStorage.
    expect(userB.current.views).toEqual([]);
  });

  it("deletes a view", async () => {
    const { result } = renderHook(() => useSavedViews("user_123"));
    await waitFor(() => expect(result.current.mounted).toBe(true));

    act(() => result.current.saveView("Temp view", 2021, 2022));
    const savedId = result.current.views[0]!.id;

    act(() => result.current.deleteView(savedId));

    expect(result.current.views).toEqual([]);
  });

  it("does not throw when saveView is called while signed out", async () => {
    const { result } = renderHook(() => useSavedViews(null));
    await waitFor(() => expect(result.current.mounted).toBe(true));

    act(() => result.current.saveView("Should be ignored", 2021, 2022));

    expect(result.current.views).toEqual([]);
  });
});
