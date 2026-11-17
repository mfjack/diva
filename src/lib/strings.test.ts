import { describe, expect, it } from "vitest";
import { emptyToNull, toFileSlug } from "./strings";

describe("emptyToNull", () => {
  it("turns blank text into null", () => {
    expect(emptyToNull("   ")).toBeNull();
    expect(emptyToNull(" Pix ")).toBe("Pix");
  });
});

describe("toFileSlug", () => {
  it("builds a safe file name without accents", () => {
    expect(toFileSlug("Luto e o modelo das tarefas de Worden!", "nota")).toBe(
      "luto-e-o-modelo-das-tarefas-de-worden",
    );
    expect(toFileSlug("Reflexão: vínculo", "nota")).toBe("reflexao-vinculo");
  });

  it("falls back when nothing is left", () => {
    expect(toFileSlug("???", "anotacao")).toBe("anotacao");
  });
});
