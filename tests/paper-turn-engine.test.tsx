import { afterEach, expect, it, vi } from "vitest";
import { act, cleanup, render } from "@testing-library/react";
import { PaperTurn } from "../src/reader/PaperTurn";

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

for (const spread of [false, true]) {
  for (const direction of [1, -1]) {
    it(`completes a real ${spread ? "desktop" : "mobile"} ${direction > 0 ? "next" : "previous"} fold`, () => {
      vi.useFakeTimers();
      const width = spread ? 900 : 360;
      for (const property of ["clientWidth", "offsetWidth"] as const)
        vi.spyOn(HTMLElement.prototype, property, "get").mockReturnValue(width);
      for (const property of ["clientHeight", "offsetHeight"] as const)
        vi.spyOn(HTMLElement.prototype, property, "get").mockReturnValue(560);
      vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) =>
        setTimeout(() => callback(performance.now()), 16),
      );
      vi.stubGlobal("ResizeObserver", class {
        observe() {}
        disconnect() {}
      });
      const finish = vi.fn();
      const view = render(
        <PaperTurn direction={direction} spread={spread}
          front="Current page" back="Destination page"
          before="Current stationary page" after="Destination stationary page"
          onFinish={finish} />,
      );
      act(() => vi.advanceTimersByTime(250));
      expect(finish).not.toHaveBeenCalled();
      // Real geometry must produce a clipped, moving sheet, not merely wait
      // for the Reader's fallback timer to reveal the destination text.
      expect(view.container.querySelector('[style*="clip-path: polygon"]')).not.toBeNull();
      act(() => vi.advanceTimersByTime(900));
      expect(finish).toHaveBeenCalledOnce();
      view.unmount();
      act(() => vi.advanceTimersByTime(100));
      expect(finish).toHaveBeenCalledOnce();
    });
  }
}
