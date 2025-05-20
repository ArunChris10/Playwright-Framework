import { expect, test } from "../../common/fixtures/test-hook";
import { NodeUtility } from "../fixtures/nodeUtilies";
import compositedata from "../testdata/nodecomposite.json";

import common from "../constants/common.json";


// Test suite for verifying Node Meta Data
test.describe("Verify Create/Edit Node Variant using Composite API ", { tag: "@Smoke  @NodeVariantCreateEditComposite @Regression" }, async () => {
  test.describe.configure({ timeout: 500_000, mode: "serial" });

  // Variables to store test data
  let expectedResponse = "",
    driverTree = 0,
    driverTreeVersion = 0,
    nodeKey = 0,
    nodeVariantKey = 0,
    nodeKeyCreate=0;

  // Setup before all tests
  test.beforeAll(async () => {
    // Load environment-specific configuration
    const envConfig = compositedata[(process.env.envName ?? "")];
    const envConfigCommonData = common[(process.env.envName ?? "")];
    if (envConfig) {
      driverTree = envConfigCommonData.driver_tree_key;
      driverTreeVersion = envConfigCommonData.driver_tree_version;
      nodeKey = envConfig.node_key;
    }
  });

  // Test case: Verify with correct values
  test(`Verify Create Node Variant using composite API with correct value of Driver Tree, Driver tree Version, Node Key and Node variant Key`, async ({
    request,
  }) => {
    // Make API call with correct values
    let response = await NodeUtility.createEditCompositeNodeVaraiant(
      driverTree,
      driverTreeVersion,
      nodeKey,
      nodeVariantKey,
      false,
      false,
      "",
      false,
      false,
      request
    );
    
    
  });

  test(`Verify Edit Node Variant using composite API with correct value of Driver Tree, Driver tree Version, Node Key and Node variant Key`, async ({
    request,
  }) => {
    // Make API call with correct values
    let response = await NodeUtility.createEditCompositeNodeVaraiant(
      driverTree,
      driverTreeVersion,
      nodeKey,
      nodeVariantKey,
      false,
      false,
      "",
      false,
      false,
      request
    );
    response = await NodeUtility.createEditCompositeNodeVaraiant(
      driverTree,
      driverTreeVersion,
      nodeKey,
      parseInt(response[0].node_variant_key,10),
      true,
      false,
      "",
      false,
      false,
      request
    );
    
  });

  test(`Verify Edit Node Variant using composite API with correct value of Driver Tree, Driver tree Version, Node Key and Node variant Key and update with a valid lob id`, async ({
    request,
  }) => {
    // Make API call with correct values
    let response = await NodeUtility.createEditCompositeNodeVaraiant(
      driverTree,
      driverTreeVersion,
      nodeKey,
      nodeVariantKey,
      false,
      false,
      "",
      false,
      false,
      request
    );
    response = await NodeUtility.createEditCompositeNodeVaraiant(
      driverTree,
      driverTreeVersion,
      nodeKey,
      parseInt(response[0].node_variant_key,10),
      true,
      false,
      "",
      true,
      false,
      request
    );
    
  });

  test(`Verify Edit Node Variant using composite API with correct value of Driver Tree, Driver tree Version, Node Key and Node variant Key and update with a valid dim val id`, async ({
    request,
  }) => {
    // Make API call with correct values
    let response = await NodeUtility.createEditCompositeNodeVaraiant(
      driverTree,
      driverTreeVersion,
      nodeKey,
      nodeVariantKey,
      false,
      false,
      "",
      false,
      false,
      request
    );
    response = await NodeUtility.createEditCompositeNodeVaraiant(
      driverTree,
      driverTreeVersion,
      nodeKey,
      parseInt(response[0].node_variant_key,10),
      true,
      false,
      "",
      false,
      true,
      request
    );
    
  });

  test(`Verify Create Node Variant using composite API with correct value of Driver Tree, Driver tree Version but incorrect Node Key`, async ({
    request,
  }) => {
    // Make API call with correct values
      await NodeUtility.createEditCompositeNodeVaraiant(
      driverTree,
      driverTreeVersion,
      nodeKey*2,
      nodeVariantKey,
      false,
      true,
      "IncorrectNodeKey",
      false,
      false,
      request
    );
    
    
  });

  test(`Verify Create Node Variant using composite API with correct value of Driver Tree, Node Key but incorrect Driver tree Version `, async ({
    request,
  }) => {
    // Make API call with correct values
      await NodeUtility.createEditCompositeNodeVaraiant(
      driverTree,
      driverTreeVersion*2,
      nodeKey,
      nodeVariantKey,
      false,
      true,
      "IncorrectDriverTreeVersionKey",
      false,
      false,
      request
    );
    
    
  });

    test(`Verify Create Node Variant using composite API with correct value of Driver Tree Version, Node Key but incorrect Driver tree`, async ({
    request,
  }) => {
    // Make API call with correct values
      await NodeUtility.createEditCompositeNodeVaraiant(
      driverTree*2,
      driverTreeVersion,
      nodeKey,
      nodeVariantKey,
      false,
      true,
      "IncorrectDriverTreeKey",
      false,
      false,
      request
    );
    
    
  });


  test(`Verify Edit Node Variant using composite API with correct value of Driver Tree, Driver tree Version, Node Key but incorrect Node variant Key`, async ({
    request,
  }) => {
    // Make API call with correct values
    let response = await NodeUtility.createEditCompositeNodeVaraiant(
      driverTree,
      driverTreeVersion,
      nodeKey,
      nodeVariantKey,
      false,
      false,
      "",
      false,
      false,
      request
    );
    response = await NodeUtility.createEditCompositeNodeVaraiant(
      driverTree,
      driverTreeVersion,
      nodeKey,
      parseInt(response[0].node_variant_key,10)-1000,
      true,
      true,
      "IncorrectNodeVariantKey",
      false,
      false,
      request
    );
    
  });


  test(`Verify Edit Node Variant using composite API with correct value of Driver Tree, Driver tree Version, Node variant Key but incorrect Node Key`, async ({
    request,
  }) => {
    // Make API call with correct values
    let response = await NodeUtility.createEditCompositeNodeVaraiant(
      driverTree,
      driverTreeVersion,
      nodeKey,
      nodeVariantKey,
      false,
      false,
      "",
      false,
      false,
      request
    );
    response = await NodeUtility.createEditCompositeNodeVaraiant(
      driverTree,
      driverTreeVersion,
      nodeKey-10,
      parseInt(response[0].node_variant_key,10),
      true,
      true,
      "IncorrectNodeKey",
      false,
      false,
      request
    );
    
  });


    test(`Verify Edit Node Variant using composite API with correct value of Driver Tree,Node Key, Node variant Key but incorrect Driver tree Version`, async ({
    request,
  }) => {
    // Make API call with correct values
    let response = await NodeUtility.createEditCompositeNodeVaraiant(
      driverTree,
      driverTreeVersion,
      nodeKey,
      nodeVariantKey,
      false,
      false,
      "",
      false,
      false,
      request
    );
    response = await NodeUtility.createEditCompositeNodeVaraiant(
      driverTree,
      driverTreeVersion*2,
      nodeKey,
      parseInt(response[0].node_variant_key,10),
      true,
      true,
      "IncorrectDriverTreeVersionKey",
      false,
      false,
      request
    );
    
  });

      test(`Verify Edit Node Variant using composite API with correct value of Driver Tree Version,Node Key, Node variant Key but incorrect Driver tree`, async ({
    request,
  }) => {
    // Make API call with correct values
    let response = await NodeUtility.createEditCompositeNodeVaraiant(
      driverTree,
      driverTreeVersion,
      nodeKey,
      nodeVariantKey,
      false,
      false,
      "",
      false,
      false,
      request
    );
    response = await NodeUtility.createEditCompositeNodeVaraiant(
      driverTree*2,
      driverTreeVersion,
      nodeKey,
      parseInt(response[0].node_variant_key,10),
      true,
      true,
      "IncorrectDriverTreeKey",
      false,
      false,
      request
    );
    
  });

    test(`Verify Edit Node Variant using composite API with correct value of Driver Tree, Driver tree Version, Node Key and Node variant Key and update with a invalid dim val id`, async ({
    request,
  }) => {
    // Make API call with correct values
    let response = await NodeUtility.createEditCompositeNodeVaraiant(
      driverTree,
      driverTreeVersion,
      nodeKey,
      nodeVariantKey,
      false,
      false,
      "",
      false,
      false,
      request
    );
    response = await NodeUtility.createEditCompositeNodeVaraiant(
      driverTree,
      driverTreeVersion,
      nodeKey,
      parseInt(response[0].node_variant_key,10),
      true,
      true,
      "IncorrectDimValId",
      false,
      true,
      request
    );
    
  });

      test(`Verify Edit Node Variant using composite API with correct value of Driver Tree, Driver tree Version, Node Key and Node variant Key and update with a invalid lob id`, async ({
    request,
  }) => {
    // Make API call with correct values
    let response = await NodeUtility.createEditCompositeNodeVaraiant(
      driverTree,
      driverTreeVersion,
      nodeKey,
      nodeVariantKey,
      false,
      false,
      "",
      false,
      false,
      request
    );
    response = await NodeUtility.createEditCompositeNodeVaraiant(
      driverTree,
      driverTreeVersion,
      nodeKey,
      parseInt(response[0].node_variant_key,10),
      true,
      true,
      "IncorrectLobId",
      true,
      false,
      request
    );
    
  });

});