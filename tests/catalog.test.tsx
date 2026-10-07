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
  expect(open.mock.calls[0][0].id).toBe("blue-envelope");
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
