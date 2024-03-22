import { test as setup, expect } from '../../common/fixtures/test-hook'
import { Utility } from '../../common/fixtures/utils';

//This method gets the fake token from IBG FakeToken URL used for IBG Homepage
setup('getting token to authenticate @CDF Apis', async ({ request }) => {
     await Utility.getIBGFakeToken(process.env.cdfUser+"",request);
});

//This method gets the fake token from Nexus FakeToken URL used for UFM 
setup('Getting token authenticate @UFM Apis', async ({ request }) => {
    await Utility.getNexusFakeToken(process.env.ufmUser+"",request);
});
