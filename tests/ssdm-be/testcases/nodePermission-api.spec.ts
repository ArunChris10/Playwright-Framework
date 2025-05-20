import { expect, test } from "../../common/fixtures/test-hook";
import { NodeUtility } from "../fixtures/nodeUtilies";
import nodePermission from "../testdata/nodepermission.json";
import common from "../constants/common.json";

// Test suite for verifying Node Permission Data
test.describe("Verify Create/View/Edit Node Permission Data", { tag: "@Smoke @NodeCreateEdit @NodePermission @Regression @Fix" }, async () => {
  test.describe.configure({ timeout: 500_000, mode: "parallel" });

  // Variables to store test data
  let expectedResponse = "",
    driverTree = 0,
    driverTreeVersion = 0,
    nodeKey = 0,
    nodeVariantKey = 0,
    nodeKeyCreate=0,
    nodeVariantKeyCreate=0;

  // Setup before all tests
  test.beforeAll(async () => {
    // Load environment-specific configuration
    const envConfig = nodePermission[(process.env.envName ?? "")];
    const envConfigCommonData = common[(process.env.envName ?? "")];
    if (envConfig) {
      driverTree = envConfigCommonData.driver_tree_key;
      driverTreeVersion = envConfigCommonData.driver_tree_version;
      nodeKey = envConfig.node_key;
      nodeVariantKey = envConfig.node_variant_key;
      nodeKeyCreate = envConfig.node_key_create;
      nodeVariantKeyCreate = envConfig.node_variant_key_create;
      expectedResponse = envConfig.expectedResponse;
    }
  });

  // Test case: Verify with correct values
  test(`Verify view Node Permission Data with correct value of Driver Tree, Driver tree Version, Node Key and Node variant Key`, async ({
    request,
  }) => {
    // Make API call with correct values
    let response=await NodeUtility.getNodeDetails(
      driverTree,
      driverTreeVersion,
      nodeKey,
      nodeVariantKey,
      request,
      "Permissions",
      false
    );
    // Assert the response matches the expected data
    await expect.soft(response).toEqual(JSON.parse(expectedResponse));
  });

  // Test case: Verify with incorrect Node Variant Key
  test(`Verify view Node Permission Data with correct value of Driver Tree, Driver tree Version, Node Key but incorrect Node Variant Key`, async ({
    request,
  }) => {
    // Make API call with an incorrect Node Variant Key
    let response=await NodeUtility.getNodeDetails(
      driverTree,
      driverTreeVersion,
      nodeKey,
      nodeVariantKey+20, // Incorrect Node Variant Key
      request,
      "Permissions",
      true
    );
  });

  // Test case: Verify with incorrect Node Key
  test(`Verify view Node Permission Data with correct value of Driver Tree, Driver tree Version, Node Variant Key but incorrect Node Key`, async ({
    request,
  }) => {
    // Make API call with an incorrect Node Variant Key
    let response=await NodeUtility.getNodeDetails(
      driverTree,
      driverTreeVersion,
      nodeKey+20, // Incorrect Node Key
      nodeVariantKey,
      request,
      "Permissions",
      true
    );
  });

  // Test case: Verify with incorrect Driver Tree Version
  test(`Verify view Node Permission Data with correct value of Driver Tree, Node Key, Node Variant but incorrect Driver tree Version`, async ({
    request,
  }) => {
    // Make API call with an incorrect Driver Tree Version
    let response=await NodeUtility.getNodeDetails(
      driverTree,
      driverTreeVersion + 10, // Incorrect Driver Tree Version
      nodeKey,
      nodeVariantKey,
      request,
      "Permissions",
      true
    );

  });

  // Test case: Verify with incorrect Driver Tree
  test(`Verify view Node Permission Data with correct value of Driver tree Version, Node Variant and Node Key but incorrect Driver Tree`, async ({
    request,
  }) => {
    // Make API call with an incorrect Driver Tree
    let response = await NodeUtility.getNodeDetails(
      driverTree + 10, // Incorrect Driver Tree
      driverTreeVersion,
      nodeKey,
      nodeVariantKey,
      request,
      "Permissions",
      true
    );

  });
  test(`Verify create Node Permission Data with correct value of Driver Tree, Driver tree Version, Node Key and Node variant Key`,async ({
    request,
  }) => {
    // Make API call with correct values
    let response=await NodeUtility.createNodeDetails(
      driverTree,
      driverTreeVersion,
      nodeKeyCreate,
      nodeVariantKeyCreate,
      request,
      "Permissions",
      false
    );
  });

  test(`Verify create Node Permission Data with correct value of Driver Tree, Driver tree Version, Node Key but incorrect Node variant Key`,async ({
    request,
  }) => {
    // Make API call with correct values
    let response=await NodeUtility.createNodeDetails(
      driverTree,
      driverTreeVersion,
      nodeKeyCreate,
      nodeVariantKeyCreate*5,
      request,
      "Permissions",
      true
    );
  });

  test(`Verify create Node Permission Data with correct value of Driver Tree, Driver tree Version, Node variant Key but incorrect Node Key`,async ({
    request,
  }) => {
    // Make API call with correct values
    let response=await NodeUtility.createNodeDetails(
      driverTree,
      driverTreeVersion,
      nodeKeyCreate*5,
      nodeVariantKeyCreate,
      request,
      "Permissions",
      true
    );
  });

  test(`Verify create Node Permission Data with correct value of Driver Tree, Node Key and Node variant Key but incorrect Driver tree Version`,async ({
    request,
  }) => {
    // Make API call with correct values
    let response=await NodeUtility.createNodeDetails(
      driverTree,
      driverTreeVersion*5,
      nodeKeyCreate,
      nodeVariantKeyCreate,
      request,
      "Permissions",
      true
    );
  });

  test(`Verify create Node Permission Data with correct value of Driver tree Version, Node Key and Node variant Key but incorrect Driver Tree`,async ({
    request,
  }) => {
    // Make API call with correct values
    let response=await NodeUtility.createNodeDetails(
      driverTree*2,
      driverTreeVersion,
      nodeKeyCreate,
      nodeVariantKeyCreate,
      request,
      "Permissions",
      true
    );
  });

  test(`Verify delete Node Permission Data with correct value of Driver Tree, Driver tree Version, Node Key and Node variant Key`,async ({
    request,
  }) => {
    // Make API call with correct values
    let response=await NodeUtility.createNodeDetails(
      driverTree,
      driverTreeVersion,
      nodeKeyCreate,
      nodeVariantKeyCreate,
      request,
      "Permissions",
      false
    );

    let responseDelete=await NodeUtility.deleteNodeDetails(
      driverTree,
      driverTreeVersion,
      nodeKeyCreate,
      nodeVariantKeyCreate,
      request,
      "Permissions",
      false
    );
  });
  test(`Verify delete Node Permission Data with correct value of Driver Tree, Driver tree Version, Node Key but incorrect Node variant Key`,async ({
    request,
  }) => {
    // Make API call with correct values
    let response=await NodeUtility.createNodeDetails(
      driverTree,
      driverTreeVersion,
      nodeKeyCreate,
      nodeVariantKeyCreate,
      request,
      "Permissions",
      false
    );

    let responseDelete=await NodeUtility.deleteNodeDetails(
      driverTree,
      driverTreeVersion,
      nodeKeyCreate,
      nodeVariantKeyCreate-5,
      request,
      "Permissions",
      true,"IncorrectNodeVariantKey"
    );
  });


  test(`Verify delete Node Permission Data with correct value of Driver Tree, Driver tree Version, Node variant Key but incorrect Node  Key`,async ({
    request,
  }) => {
    // Make API call with correct values
    let response=await NodeUtility.createNodeDetails(
      driverTree,
      driverTreeVersion,
      nodeKeyCreate,
      nodeVariantKeyCreate,
      request,
      "Permissions",
      false
    );

    let responseDelete=await NodeUtility.deleteNodeDetails(
      driverTree,
      driverTreeVersion,
      nodeKeyCreate-5,
      nodeVariantKeyCreate,
      request,
      "Permissions",
      true,"IncorrectNodeKey"
    );
  });

  test(`Verify delete Node Permission Data with correct value of Driver Tree, Node Key, Node variant Key but incorrect Driver tree Version `,async ({
    request,
  }) => {
    // Make API call with correct values
    let response=await NodeUtility.createNodeDetails(
      driverTree,
      driverTreeVersion,
      nodeKeyCreate,
      nodeVariantKeyCreate,
      request,
      "Permissions",
      false
    );

    let responseDelete=await NodeUtility.deleteNodeDetails(
      driverTree,
      driverTreeVersion*2,
      nodeKeyCreate,
      nodeVariantKeyCreate,
      request,
      "Permissions",
      true,"IncorrectDriverTreeVersionKey"
    );
  });

  test(`Verify delete Node Permission Data with correct value of Driver Tree Version, Node Key, Node variant Key but incorrect Driver tree`,async ({
    request,
  }) => {
    // Make API call with correct values
    let response=await NodeUtility.createNodeDetails(
      driverTree,
      driverTreeVersion,
      nodeKeyCreate,
      nodeVariantKeyCreate,
      request,
      "Permissions",
      false
    );

    let responseDelete=await NodeUtility.deleteNodeDetails(
      driverTree*2,
      driverTreeVersion,
      nodeKeyCreate,
      nodeVariantKeyCreate,
      request,
      "Permissions",
      true,"IncorrectDriverTreeKey"
    );
  });

});


