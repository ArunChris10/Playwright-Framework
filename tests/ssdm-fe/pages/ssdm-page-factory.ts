import { Page } from "@playwright/test";
import { UploadFunctionality } from './upload-button.page';
import { ValidateFunctionality } from './validate-functionality.page';
import { ComputeFunctionality } from './compute-functionality.page';
import { ReviewFunctionality } from './review-functionality.page';
import { DriversFunctionality } from './select-add-view-drivers-functionality.page';
import { RemoveFunctionality } from './remove-driver-functionality.page';
import { FilterFunctionality } from "./Filter.page";
import { PickDatasetFunctionality } from "./pick-Dataset-functionality-page";
import { nodeEdgeGridFunctionality } from "./Node-edge-grid.page";
import { LockPublishFunctionality } from "./lock.publish.page";
import { NewPublishedNodeEdgeFunctionality } from "./new-published-NE-visibility.page";
import { ViewTimestampFunctionality } from "./actual-forecast-timestamp.page";
import { AsyncPublishFunctionality } from "./publish-async-process.page";


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

    removeDrivers(){
      return new RemoveFunctionality(this.page);
    }

    applyFilter(){
      return new FilterFunctionality(this.page);
    }

    pickDataset(){
      return new PickDatasetFunctionality(this.page);
    }

    nodeEdgeGrid(){
      return new nodeEdgeGridFunctionality(this.page);
    }

    lockPublish(){
      return new LockPublishFunctionality(this.page);    
    }

    newPublishedNE(){
      return new NewPublishedNodeEdgeFunctionality(this.page);
    }

    viewTimestamp(){
      return new ViewTimestampFunctionality(this.page);
    }

    asyncPublishProcess(){
      return new AsyncPublishFunctionality(this.page);
    }

}