import { describe, expect, it } from "vitest";
import { isOutdatedDeploymentError } from "./outdated-deployment";

describe("isOutdatedDeploymentError", () => {
  it("reconhece a ação do servidor que não existe mais", () => {
    expect(
      isOutdatedDeploymentError(
        new Error(
          'Server Action "40f151af0356" was not found on the server. Read more: https://nextjs.org/docs/messages/failed-to-find-server-action',
        ),
      ),
    ).toBe(true);
  });

  it("ignora os outros erros", () => {
    expect(isOutdatedDeploymentError(new Error("Falha de rede"))).toBe(false);
    expect(isOutdatedDeploymentError("Server Action")).toBe(false);
  });
});
