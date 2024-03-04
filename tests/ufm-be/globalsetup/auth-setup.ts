import { test as setup, expect } from '../../common/fixtures/test-hook'
import { Utility } from '../../common/fixtures/utils';

setup('authenticate', async ({ request }) => {
     await Utility.getNexusFakeToken(process.env.ufmUser,request);
});



