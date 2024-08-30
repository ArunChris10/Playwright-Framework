import { test as setup } from "../../common/fixtures/test-hook";
import { Utility } from "../../common/fixtures/utils";

//This method gets the fake token from IBG FakeToken URL used for IBG Homepage
setup(
  "getting token to authenticate CDF Apis",
  { tag: "@CDF , @IBG " },
  async ({ request }) => {
    await Utility.getNexusFakeToken(process.env.cdfUser + "", request);
  }
);

//This method gets the fake token from Nexus FakeToken URL used for UFM
setup(
  "Getting token authenticate UFM Apis",
  { tag: "@UFM , @IBG " },
  async ({ request }) => {
    await Utility.getNexusFakeToken(process.env.ufmUser + "", request);
    await Utility.setmappings(request);
  }
);
