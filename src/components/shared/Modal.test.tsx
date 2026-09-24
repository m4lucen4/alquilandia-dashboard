import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Modal } from "./Modal";

describe("Modal", () => {
  it("keeps its default layout without viewport scroll containment", () => {
    render(
      <Modal title="Default modal" onAccept={() => undefined}>
        Default content
      </Modal>,
    );

    expect(screen.getByRole("dialog")).not.toHaveClass("max-h-[calc(100dvh-2rem)]");
    expect(screen.getByText("Default content").parentElement).not.toHaveClass("overflow-y-auto");
  });

  it("opts into a focusable viewport-bounded content scroller", () => {
    render(
      <Modal title="Scrollable modal" onAccept={() => undefined} viewportScrollable>
        Scrollable content
      </Modal>,
    );

    const content = screen.getByLabelText("Contenido desplazable del modal");

    expect(screen.getByRole("dialog")).toHaveClass("max-h-[calc(100dvh-2rem)]", "flex", "flex-col");
    expect(content).toHaveClass("min-h-0", "overflow-y-auto");
    expect(content).toHaveAttribute("tabindex", "0");
  });
});
