import { afterEach, expect, it, vi } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { PaperTurn } from "../src/reader/PaperTurn";
const fixture = vi.hoisted(() => ({
  instances: [] as Array<{
    pages: HTMLElement[];
    events: Record<string, (e: { data: unknown }) => void>;
    next: ReturnType<typeof vi.fn>;
    prev: ReturnType<typeof vi.fn>;
    destroy: ReturnType<typeof vi.fn>;
  }>,
}));
vi.mock("../src/vendor/page-flip", () => ({
  PageFlip: class {
    instance = {
      pages: [] as HTMLElement[],
      events: {} as Record<string, (e: { data: unknown }) => void>,
      next: vi.fn(),
      prev: vi.fn(),
      destroy: vi.fn(),
    };
    constructor() {
      fixture.instances.push(this.instance);
    }
    on(name: string, callback: (e: { data: unknown }) => void) {
      this.instance.events[name] = callback;
    }
    loadFromHTML(pages: HTMLElement[]) {
      this.instance.pages = pages;
      this.instance.events.init({ data: null });
    }
    flipNext(corner: string) {
      this.instance.next(corner);
    }
    flipPrev(corner: string) {
      this.instance.prev(corner);
    }
    destroy() {
      this.instance.destroy();
    }
  },
}));
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
for (const direction of [1, -1]) {
  it(`folds the correct side and disposes its isolated renderer (${direction})`, () => {
    Object.defineProperty(HTMLElement.prototype, "clientWidth", {
      configurable: true,
      get: () => 900,
    });
    Object.defineProperty(HTMLElement.prototype, "clientHeight", {
      configurable: true,
      get: () => 500,
    });
    const disconnect = vi.fn();
    vi.stubGlobal(
      "ResizeObserver",
      class {
        observe() {}
        disconnect = disconnect;
      },
    );
    const finish = vi.fn();
    const view = render(
      <PaperTurn
        direction={direction}
        spread
        front="old moving page"
        back="new reverse page"
        before="old stationary page"
        after="new stationary page"
        onFinish={finish}
      />,
    );
    const instance = fixture.instances.at(-1)!;
    expect(instance.pages.map((p) => p.textContent)).toEqual(
      direction > 0
        ? [
            "old stationary page",
            "old moving page",
            "new reverse page",
            "new stationary page",
          ]
        : [
            "new stationary page",
            "new reverse page",
            "old moving page",
            "old stationary page",
          ],
    );
    expect(direction > 0 ? instance.next : instance.prev).toHaveBeenCalledWith(
      "bottom",
    );
    instance.events.changeState({ data: "read" });
    expect(finish).not.toHaveBeenCalled();
    instance.events.changeState({ data: "flipping" });
    instance.events.changeState({ data: "read" });
    expect(finish).toHaveBeenCalledTimes(1);
    view.unmount();
    expect(disconnect).toHaveBeenCalled();
    expect(instance.destroy).toHaveBeenCalledOnce();
    instance.events.init({ data: null });
    instance.events.changeState({ data: "read" });
    expect(direction > 0 ? instance.next : instance.prev).toHaveBeenCalledTimes(
      1,
    );
    expect(finish).toHaveBeenCalledTimes(1);
  });
}
