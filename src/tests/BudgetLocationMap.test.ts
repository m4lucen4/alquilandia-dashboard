import { describe, expect, it } from "vitest";
import { getMapPosition } from "@/components/budgets/budgetLocationMap.utils";

describe("getMapPosition", () => {
  it("converts valid API coordinates to map coordinates", () => {
    expect(
      getMapPosition({ latitude: "37.3044241", longitude: "-5.9738342" }),
    ).toEqual({ lat: 37.3044241, lng: -5.9738342 });
  });

  it("ignores legacy undefined coordinate values", () => {
    expect(
      getMapPosition({ latitude: "undefined", longitude: "-5.9738342" }),
    ).toBeNull();
  });

  it("ignores coordinates outside valid geographic bounds", () => {
    expect(getMapPosition({ latitude: "91", longitude: "-5" })).toBeNull();
  });
});
