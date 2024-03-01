import { test as setup, expect } from '../../common/fixtures/test-hook'
import { Utility } from '../../common/fixtures/utils';

setup('authenticate', async ({ request }) => {
    process.env.token = await Utility.getNexusFakeToken('s0g0fhn', request);
});
