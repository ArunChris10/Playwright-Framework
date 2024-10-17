import { Page } from "@playwright/test";
import { UploadFunctionality } from './upload-button.page';
import { ValidateFunctionality } from './validate-functionality.page';
import { ComputeFunctionality } from './compute-functionality.page';
import { ReviewFunctionality } from './review-functionality.page';
import { DriversFunctionality } from './select-add-view-drivers-functionality.page';


export class SSDMPageFactory {
    

    private readonly page: Page;
    constructor(page: Page) {
      this.page = page;
    }
  
    uploadFile() {
        return new UploadFunctionality(this.page);
    }

    validateFile() {
      return new ValidateFunctionality(this.page);
  }

    computeFile(){
      return new ComputeFunctionality(this.page);
    }

    review(){
      return new ReviewFunctionality(this.page);
    }

    drivers(){
      return new DriversFunctionality(this.page);
    }

}