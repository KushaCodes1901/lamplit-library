import {
  fireEvent,
  render,
  screen,
  cleanup,
  waitFor,
} from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { Game } from "../src/components/Game";
import type { SceneBridge } from "../src/game/LibraryScene";
const mock = vi.hoisted(() => ({
  bridge: null as SceneBridge | null,
  stop: vi.fn(),
  sleep: vi.fn(),
  wake: vi.fn(),
  destroy: vi.fn(),
}));
vi.mock("../src/game/LibraryScene", () => ({
  createLibrary: (_parent: unknown, bridge: SceneBridge) => {
    mock.bridge = bridge;
    bridge.ready(true);
    return {
      game: {
        scale: { resize: vi.fn() },
        destroy: mock.destroy,
        loop: { sleep: mock.sleep, wake: mock.wake },
      },
      scene: { stop: mock.stop, approach: vi.fn(), interact: vi.fn() },
    };
  },
}));
vi.stubGlobal(
  "ResizeObserver",
  class {
    observe() {}
    disconnect() {}
  },
);
afterEach(cleanup);
it("releases touch input on cancellation, lost capture, blur and panel opening", async () => {
  const props = {
    paused: false,
    suspended: false,
    reducedMotion: false,
    onOpen: vi.fn(),
    onReady: vi.fn(),
  };
  const view = render(<Game {...props} />);
  await waitFor(() => expect(mock.bridge).not.toBeNull());
  const up = screen.getByRole("button", { name: "Move up" });
  up.setPointerCapture = vi.fn();
  fireEvent.pointerDown(up, { pointerId: 1 });
  expect(mock.bridge!.direction.y).toBe(-1);
  fireEvent.pointerCancel(up, { pointerId: 1 });
  expect(mock.bridge!.direction.y).toBe(0);
  fireEvent.pointerDown(up, { pointerId: 2 });
  fireEvent.lostPointerCapture(up, { pointerId: 2 });
  expect(mock.bridge!.direction.y).toBe(0);
  fireEvent.pointerDown(up, { pointerId: 3 });
  fireEvent(window, new Event("blur"));
  expect(mock.bridge!.direction.y).toBe(0);
  fireEvent.pointerDown(up, { pointerId: 4 });
  view.rerender(<Game {...props} paused suspended />);
  expect(mock.bridge!.paused).toBe(true);
  expect(mock.stop).toHaveBeenCalled();
  expect(mock.sleep).toHaveBeenCalled();
});
