import "@testing-library/jest-dom";

/**
 * jsdom doesn't implement ResizeObserver, but Recharts' <ResponsiveContainer>
 * (used by every chart in this app) requires one to measure its parent
 * element. Without this polyfill, every chart-containing component would
 * throw "ResizeObserver is not defined" the moment it's rendered in a test.
 */
class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}
// @ts-expect-error - jsdom's global type doesn't know about this yet
global.ResizeObserver = ResizeObserverMock;

/**
 * jsdom also doesn't implement matchMedia. next-themes checks it when
 * `enableSystem` is used, and it's a common transitive check in UI
 * libraries generally, so it's polyfilled globally here rather than
 * per-test.
 */
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});
