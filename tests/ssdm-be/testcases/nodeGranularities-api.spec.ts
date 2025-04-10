import { expect, test } from "../../common/fixtures/test-hook";
import { NodeUtility } from "../fixtures/nodeUtilies";
import nodeGranularities from "../testdata/nodegranularity.json";

// Test suite for verifying Node Granularity Data
test.describe("Verify view Node Granularity Data", { tag: "@Smoke @Node @Regression" }, async () => {
  test.describe.configure({ timeout: 500_000, mode: "serial" });

  // Variables to store test data
  let expectedResponse = "",
    driverTree = 0,
    driverTreeVersion = 0,
    nodeKey = 0,
    nodeVariantKey = 0;

  // Setup before all tests
  test.beforeAll(async () => {
    // Load environment-specific configuration
    const envConfig = nodeGranularities[(process.env.envName ?? "")];
    if (envConfig) {
      driverTree = envConfig.driver_tree_key;
      driverTreeVersion = envConfig.driver_tree_version;
      nodeKey = envConfig.node_key;
      nodeVariantKey = envConfig.node_variant_key;
      expectedResponse = envConfig.expectedResponse;
    }
  });

  // Test case: Verify with correct values
  test(`Verify view Node Granularity Data with correct value of Driver Tree, Driver tree Version, Node Key and Node variant Key`, async ({
    request,
  }) => {
    // Make API call with correct values
    let response = await NodeUtility.getNodeDetails(
      driverTree,
      driverTreeVersion,
      nodeKey,
      nodeVariantKey,
      request,
      "Granularity",
      false
    );
    // Assert the response matches the expected data
    await expect.soft(response).toEqual(JSON.parse(expectedResponse));
  });

  // Test case: Verify with incorrect Node Key
  test(`Verify view Node Granularity Data with correct value of Driver Tree, Driver tree Version, Node Variant Key but incorrect Node Key`, async ({
    request,
  }) => {
    // Make API call with incorrect Node Key
    let response = await NodeUtility.getNodeDetails(
      driverTree,
      driverTreeVersion,
      nodeKey+10, // Incorrect Node Key
      nodeVariantKey,
      request,
      "Granularity",
      true
    );
   
  });
  // Test case: Verify with incorrect Node Variant Key
  test(`Verify view Node Granularity Data with correct value of Driver Tree, Driver tree Version, Node Key but incorrect Node variant Key`, async ({
    request,
  }) => {
    // Make API call with an incorrect Node Variant Key
    let response = await NodeUtility.getNodeDetails(
      driverTree,
      driverTreeVersion,
      nodeKey,
      nodeVariantKey-10, // Incorrect Node Variant Key
      request,
      "Granularity",
      true
    );

  });

  // Test case: Verify with incorrect Driver tree Version
  test(`Verify view Node Granularity Data with correct value of Driver Tree, Node Key, Node Variant but incorrect Driver tree Version`, async ({
    request,
  }) => {
    // Make API call with an incorrect Driver Tree Version
    let response = await NodeUtility.getNodeDetails(
      driverTree,
      driverTreeVersion + 10, // Incorrect Driver Tree Version
      nodeKey,
      nodeVariantKey,
      request,
      "Granularity",
      true
    );

  });

  // Test case: Verify with incorrect Driver Tree
  test(`Verify view Node Granularity Data with correct value of Driver tree Version, Node Variant and Node Key but incorrect Driver Tree`, async ({
    request,
  }) => {
    // Make API call with an incorrect Driver Tree
    let response = await NodeUtility.getNodeDetails(
      driverTree + 2, // Incorrect Driver Tree
      driverTreeVersion,
      nodeKey,
      nodeVariantKey,
      request,
      "Granularity",
      true
    );

  });
});