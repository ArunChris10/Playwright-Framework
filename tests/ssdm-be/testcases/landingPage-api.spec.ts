import { expect, test } from "../../common/fixtures/test-hook";
import { GetNodeVariantforDriverTreeUtility } from "../fixtures/nodeVariantDetailsUtilities";
import common from "../constants/common.json";

// Test suite for verifying Node Meta Data
test.describe("Verify Node Variant Gets", { tag: "@Smoke @GetNodeVariantsForDriverTree @Regression" }, async () => {
  test.describe.configure({ timeout: 500_000, mode: "parallel" });

    let driverTree = 0,
    driverTreeVersion = 0,
    metadataRefreshid=0

  // Setup before all tests
  test.beforeAll(async () => {
    // Load environment-specific configuration
    const envConfig = common[(process.env.envName ?? "")];
    if (envConfig) {
      driverTree = envConfig.driver_tree_key;
      driverTreeVersion = envConfig.driver_tree_version;
      metadataRefreshid = envConfig.metadata_refresh_id
    }
  });

  // Test case: Verify with correct values
  test(`Verify Get All node variants with correct Driver Tree Key and correct Driver Tree Version Key`, async ({
    request,
  }) => {
    await GetNodeVariantforDriverTreeUtility.getNodeVariantsDetailsforDriverTreeKeyAndDriverTreeVersion(driverTree,driverTreeVersion,request,false);
  });


  // Test case: Verify with incorrect Driver Tree
  test(`Verify Get All node variants with incorrect Driver Tree Key and correct Driver Tree Version Key`, async ({
    request,
  }) => {
    await GetNodeVariantforDriverTreeUtility.getNodeVariantsDetailsforDriverTreeKeyAndDriverTreeVersion(driverTree*2,driverTreeVersion,request,true);
  });

   // Test case: Verify with incorrect Driver Tree Version Key
   test(`Verify Get All node variants with correct Driver Tree Key and incorrect Driver Tree Version Key`, async ({
    request,
  }) => {
    await GetNodeVariantforDriverTreeUtility.getNodeVariantsDetailsforDriverTreeKeyAndDriverTreeVersion(driverTree,driverTreeVersion*2,request,true);
  });

  // Test case: Verify with correct values
  test(`Verify Get Permissions for all node variants with correct Driver Tree Key and correct Driver Tree Version Key`, async ({
    request,
  }) => {
    await GetNodeVariantforDriverTreeUtility.getNodeVariantsDetailsforDriverTreeKeyAndDriverTreeVersion(driverTree,driverTreeVersion,request,false,"NodeVariantPermissions");
  });


  // Test case: Verify with incorrect driver tree
  test(`Verify Get Permissions for all node variants with incorrect Driver Tree Key and correct Driver Tree Version Key`, async ({
    request,
  }) => {
    await GetNodeVariantforDriverTreeUtility.getNodeVariantsDetailsforDriverTreeKeyAndDriverTreeVersion(driverTree*4,driverTreeVersion,request,true,"NodeVariantPermissions");
  });

   // Test case: Verify with incorrect driver tree version
   test(`Verify Get Permissions for all node variants with correct Driver Tree Key and incorrect Driver Tree Version Key`, async ({
    request,
  }) => {
    await GetNodeVariantforDriverTreeUtility.getNodeVariantsDetailsforDriverTreeKeyAndDriverTreeVersion(driverTree,driverTreeVersion*4,request,true,"NodeVariantPermissions");
  });

    // Test case: Verify with correct values
    test(`Verify Get Dimensions for all node variants with correct Driver Tree Key and correct Driver Tree Version Key`, async ({
      request,
    }) => {
      await GetNodeVariantforDriverTreeUtility.getNodeVariantsDetailsforDriverTreeKeyAndDriverTreeVersion(driverTree,driverTreeVersion,request,false,"NodeVariantDimensions");
    });

    // Test case: Verify with incorrect driver tree
  test(`Verify Get Dimensions for all node variants with incorrect Driver Tree Key and correct Driver Tree Version Key`, async ({
    request,
  }) => {
    await GetNodeVariantforDriverTreeUtility.getNodeVariantsDetailsforDriverTreeKeyAndDriverTreeVersion(driverTree*4,driverTreeVersion,request,true,"NodeVariantDimensions");
  });

   // Test case: Verify with incorrect driver tree version
   test(`Verify Get Dimensions for all node variants with correct Driver Tree Key and incorrect Driver Tree Version Key`, async ({
    request,
  }) => {
    await GetNodeVariantforDriverTreeUtility.getNodeVariantsDetailsforDriverTreeKeyAndDriverTreeVersion(driverTree,driverTreeVersion*4,request,true,"NodeVariantDimensions");
  });

      // Test case: Verify with correct values
      test(`Verify Get Composite Data for all node variants with correct Driver Tree Key and correct Driver Tree Version Key`, async ({
        request,
      }) => {
        await GetNodeVariantforDriverTreeUtility.getNodeVariantsDetailsforDriverTreeKeyAndDriverTreeVersion(driverTree,driverTreeVersion,request,false,"NodeVariantCompositeData");
      });
  
    
    // Test case: Verify with incorrect driver tree
    test(`Verify Get Composite Data for all node variants with incorrect Driver Tree Key and correct Driver Tree Version Key`, async ({
      request,
    }) => {
      await GetNodeVariantforDriverTreeUtility.getNodeVariantsDetailsforDriverTreeKeyAndDriverTreeVersion(driverTree*4,driverTreeVersion,request,true,"NodeVariantCompositeData");
    });
  
     // Test case: Verify with incorrect driver tree version
     test(`Verify Get Composite Data for all node variants with correct Driver Tree Key and incorrect Driver Tree Version Key`, async ({
      request,
    }) => {
      await GetNodeVariantforDriverTreeUtility.getNodeVariantsDetailsforDriverTreeKeyAndDriverTreeVersion(driverTree,driverTreeVersion*4,request,true,"NodeVariantCompositeData");
    });

    // Test case: Verify Get Driver Trees
    test(`Verify Get Driver Trees`, { tag: "@Smoke @GetDriverTreeDetails @Regression" }, async ({
      request,
    }) => {
      let response = await GetNodeVariantforDriverTreeUtility.getDriverTreeandDriverTreeVersion(0, false, request);
      await expect.soft(response[0].driver_tree_key).toEqual(driverTree);
    });

    // Test case: Verify Get Driver Tree version for correct Driver Key
    test(`Verify Get Driver Tree version for correct Driver Key`, { tag: "@Smoke  @GetDriverTreeDetails @Regression" }, async ({
      request,
    }) => {
      let response = await GetNodeVariantforDriverTreeUtility.getDriverTreeandDriverTreeVersion(driverTree, false, request);
      await expect.soft(response[0].driver_tree_version).toEqual(driverTreeVersion);
    });

    // Test case: Verify Get Driver Tree version for incorrect Driver Key
    test(`Verify Get Driver Tree version for incorrect Driver Key`, { tag: "@Smoke @GetDriverTreeDetails @Regression" }, async ({
      request,
    }) => {
      await GetNodeVariantforDriverTreeUtility.getDriverTreeandDriverTreeVersion(driverTree * 2, true, request);
    });
 
});
