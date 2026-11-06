import { fireEvent, render, screen, cleanup } from "@testing-library/react";
import { afterEach, beforeAll, expect, it, vi } from "vitest";
import { Catalog } from "../src/components/Catalog";

beforeAll(() => {
  HTMLDialogElement.prototype.showModal = function () {
    this.open = true;
  };
  HTMLDialogElement.prototype.close = function () {
    this.open = false;
  };
});
afterEach(cleanup);
it("offers every story, filters, recovers from no results and opens the selected book", () => {
  vi.useFakeTimers();
  const open = vi.fn();
  render(<Catalog progress={{}} onClose={vi.fn()} onOpen={open} />);
  expect(screen.getAllByRole("button", { name: /^Read / })).toHaveLength(8);
  fireEvent.click(screen.getByRole("button", { name: "Mystery" }));
  expect(screen.getAllByRole("button", { name: /^Read / })).toHaveLength(2);
  fireEvent.change(
    screen.getByRole("textbox", { name: "Search book titles" }),
    { target: { value: "zzzz" } },
  );
  expect(screen.getByText("No stories found.")).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: "Show all stories" }));
  fireEvent.click(
    screen.getByRole("button", { name: "Read The Blue Envelope" }),
  );
  expect(open).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole("button", { name: "Open Book" }));
  expect(
    (screen.getByRole("button", { name: "Opening…" }) as HTMLButtonElement)
      .disabled,
  ).toBe(true);
  vi.advanceTimersByTime(2399);
  expect(open).not.toHaveBeenCalled();
  vi.advanceTimersByTime(1);
  expect(open.mock.calls[0][0].id).toBe("blue-envelope");
  vi.useRealTimers();
});
it("starts a shelf on its genre and returns focus after closing", () => {
  const previous = document.createElement("button");
  document.body.append(previous);
  previous.focus();
  const view = render(
    <Catalog genre="Comedy" progress={{}} onClose={vi.fn()} onOpen={vi.fn()} />,
  );
  expect(screen.getAllByRole("button", { name: /^Read / })).toHaveLength(2);
  view.unmount();
  expect(document.activeElement).toBe(previous);
  previous.remove();
});

it("puts a selected book back without opening it and cancels an interrupted opening", () => {
  vi.useFakeTimers();
  const open = vi.fn();
  const view = render(
    <Catalog genre="Comedy" progress={{}} onClose={vi.fn()} onOpen={open} />,
  );
  fireEvent.click(
    screen.getByRole("button", { name: "Read The Pigeon Committee" }),
  );
  expect(screen.getByRole("button", { name: "Open Book" })).toBe(
    document.activeElement,
  );
  fireEvent.click(screen.getByRole("button", { name: "Put back on shelf" }));
  expect(screen.queryByRole("button", { name: "Open Book" })).toBeNull();
  fireEvent.click(
    screen.getByRole("button", { name: "Read The Pigeon Committee" }),
  );
  fireEvent.click(screen.getByRole("button", { name: "Open Book" }));
  view.unmount();
  vi.runAllTimers();
  expect(open).not.toHaveBeenCalled();
  vi.useRealTimers();
});
it("opens immediately with reduced motion", () => {
  vi.useFakeTimers();
  const open = vi.fn();
  render(
    <Catalog
      genre="Comedy"
      reducedMotion
      progress={{}}
      onClose={vi.fn()}
      onOpen={open}
    />,
  );
  fireEvent.click(
    screen.getByRole("button", { name: "Read The Pigeon Committee" }),
  );
  fireEvent.click(screen.getByRole("button", { name: "Open Book" }));
  vi.advanceTimersByTime(0);
  expect(open).toHaveBeenCalledTimes(1);
  vi.useRealTimers();
});

it("cancels a book opening with Escape without opening it later", () => {
  vi.useFakeTimers();
  const open = vi.fn(),
    close = vi.fn();
  render(
    <Catalog genre="Comedy" progress={{}} onClose={close} onOpen={open} />,
  );
  fireEvent.click(
    screen.getByRole("button", { name: "Read The Pigeon Committee" }),
  );
  fireEvent.click(screen.getByRole("button", { name: "Open Book" }));
  fireEvent(
    screen.getByRole("dialog"),
    new Event("cancel", { bubbles: true, cancelable: true }),
  );
  vi.advanceTimersByTime(3000);
  expect(open).not.toHaveBeenCalled();
  expect(close).not.toHaveBeenCalled();
  expect(screen.queryByRole("button", { name: "Opening…" })).toBeNull();
  expect(screen.getAllByRole("button", { name: /^Read / })).toHaveLength(2);
  vi.useRealTimers();
});
