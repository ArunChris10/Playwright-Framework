import { test } from "../../common/fixtures/test-hook";
import { UfmUtility } from "../fixtures/ufm-utils";

let lobName = [
  "optical",
  "rx",
  "merch",
  "ecommerce",
  "lmd",
  "e2e_delivery",
  "core_service",
  "fulfillment",
  "i&a",
  "connect",
  "marketing",
  "data_ventures",
  "operations",
  "real_estate",
  "fuel",
  "segment",
  "home_office",
];

lobName.forEach((lobName) => {
  test.describe(
    `Find input nodes for ${lobName}`,
    { tag: "@inputNodes" },
    () => {
      test.describe.configure({ timeout: 600_000, mode: "parallel" });

      test(`Find input nodes for ${lobName} scenario`, async ({ request }) => {
        let inputnodes: string[] = [];
        inputnodes = await UfmUtility.getInputNodelist(lobName, request);
        console.log(inputnodes);
      });
    }
  );
});
