import { describe, expect, it } from "vitest";
import { buildMeetingLinkMessage, resolveMeetingUrl } from "./meeting-link";

const PRACTICE_URL = "https://meet.google.com/sala-fixa";

describe("resolveMeetingUrl", () => {
  it("usa a sala do consultório nas sessões online sem link próprio", () => {
    expect(
      resolveMeetingUrl({ modality: "online", meetingUrl: null }, PRACTICE_URL),
    ).toBe(PRACTICE_URL);
  });

  it("prefere o link próprio da sessão", () => {
    expect(
      resolveMeetingUrl(
        { modality: "online", meetingUrl: "https://zoom.us/j/123" },
        PRACTICE_URL,
      ),
    ).toBe("https://zoom.us/j/123");
  });

  it("não tem sala nas sessões presenciais", () => {
    expect(
      resolveMeetingUrl(
        { modality: "in_person", meetingUrl: null },
        PRACTICE_URL,
      ),
    ).toBeNull();
  });
});

describe("buildMeetingLinkMessage", () => {
  it("leva o primeiro nome, a data, o horário e o link", () => {
    const message = buildMeetingLinkMessage(
      { patientName: "Ana Souza", startsAt: "2026-11-18T22:00:00.000Z" },
      PRACTICE_URL,
    );
    expect(message).toContain("Olá, Ana!");
    expect(message).toContain("quarta-feira, 18 de novembro, às 19:00");
    expect(message).toContain(PRACTICE_URL);
  });
});
