// globalTeardown.ts
import { clearGlobalStoreFile } from '../apiutility/utils/commonUtil';

export default async function globalTeardown() {
  console.log('>> Global teardown started');
  clearGlobalStoreFile();
  console.log('>> Global teardown completed');
}
