import { afterEach, beforeAll, expect, it, vi } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { Reader } from "../src/reader/Reader";
import { books } from "../src/data/books";
import { defaultSettings } from "../src/lib/storage";
let width = 1000;
beforeAll(() => {
  HTMLDialogElement.prototype.showModal = function () {
    this.open = true;
  };
  HTMLDialogElement.prototype.close = function () {
    this.open = false;
  };
  Object.defineProperty(document, "fonts", {
    configurable: true,
    value: { load: () => Promise.resolve([]) },
  });
  Object.defineProperty(HTMLElement.prototype, "clientWidth", {
    configurable: true,
    get() {
      return width;
    },
  });
  Object.defineProperty(HTMLElement.prototype, "clientHeight", {
    configurable: true,
    get() {
      return 300;
    },
  });
  Object.defineProperty(HTMLElement.prototype, "scrollHeight", {
    configurable: true,
    get() {
      return Math.ceil((this.textContent?.length ?? 0) / 70) * 30;
    },
  });
  vi.stubGlobal(
    "ResizeObserver",
    class {
      constructor(private callback: () => void) {}
      observe() {
        this.callback();
      }
      disconnect() {}
    },
  );
});
afterEach(cleanup);
function reader(reducedMotion = false) {
  return render(
    <Reader
      book={books[0]}
      settings={defaultSettings}
      storageOk
      reducedMotion={reducedMotion}
      onSettings={vi.fn()}
      onProgress={vi.fn()}
      onClose={vi.fn()}
    />,
  );
}
for (const [label, size, pageCount] of [
  ["desktop", 1000, 2],
  ["phone", 390, 1],
] as const) {
  it(`turns ${label} pages without losing text anchors or accepting repeated turns`, async () => {
    width = size;
    const view = reader();
    await waitFor(() =>
      expect(screen.getAllByRole("article")).toHaveLength(pageCount),
    );
    const first = view.container.querySelector(".reader")!;
    expect(first.getAttribute("data-anchor")).toBe("0");
    fireEvent.click(screen.getByRole("button", { name: "Next page" }));
    const anchor = first.getAttribute("data-anchor");
    expect(Number(anchor)).toBeGreaterThan(0);
    if (pageCount === 2) {
      expect(
        screen
          .getAllByRole("article")[0]
          .querySelector("[data-word]")
          ?.getAttribute("data-word"),
      ).toBe("0");
    }
    const leaf = view.container.querySelector(".turning-leaf")!;
    expect(leaf.getAttribute("aria-hidden")).toBe("true");
    expect(leaf.querySelector("[data-word]")).toBeNull();
    fireEvent.keyDown(first, { key: "ArrowRight" });
    expect(first.getAttribute("data-anchor")).toBe(anchor);
    await waitFor(
      () => expect(view.container.querySelector(".turning-leaf")).toBeNull(),
      { timeout: 1900 },
    );
    expect(
      screen
        .getAllByRole("article")[0]
        .querySelector("[data-word]")
        ?.getAttribute("data-word"),
    ).toBe(anchor);
    fireEvent.click(screen.getByRole("button", { name: "Previous page" }));
    expect(first.getAttribute("data-anchor")).toBe("0");
  });
}
it("skips rotating leaves when reduced motion is enabled", async () => {
  width = 1000;
  const view = reader(true);
  await waitFor(() => expect(screen.getAllByRole("article")).toHaveLength(2));
  fireEvent.click(screen.getByRole("button", { name: "Next page" }));
  expect(
    Number(
      view.container.querySelector(".reader")!.getAttribute("data-anchor"),
    ),
  ).toBeGreaterThan(0);
  expect(view.container.querySelector(".turning-leaf")).toBeNull();
});
