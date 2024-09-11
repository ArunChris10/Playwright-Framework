import { test, expect } from '../../common/fixtures/test-hook';
import manageSelectLayers from '../testdata/manage-select-layers.json';
import { LockUnlockUtility } from '../fixtures/lock-unlock-utils';
import { CdfUtility } from '../fixtures/cdf-utils';
import { ManageSelectLayersUtil } from '../fixtures/manage-select-layers-utils';
import { amount, baseChannelNames } from "../testdata/manage-select-layers.json";
import debug from 'debug';


test.describe("Verify user can manage and select layers", {
      tag: "@Regression @Smoke @ibg-service-scenario-financials @ManageSelectLayers",
    }, () => {
        let demandId, demandScenarioDetails;
        let baseLayer, layer1, layer2;
        let forecastVersion, forecastData;
        let baseChannelsForecastData;
  
        test.beforeAll(async ({ request }) => {
            demandId = await CdfUtility.createScenario(request);
            let response = await ManageSelectLayersUtil.getDemandScenarioLayers(
                request,
                demandId
            );
            
            baseLayer = response.layers[0];


            demandScenarioDetails = await ManageSelectLayersUtil.getDemandStackDetails(
                request,
                demandId,
            );

            forecastVersion = demandScenarioDetails?.forecastInfoDTO?.forecastInfo?.version;

            forecastData = await ManageSelectLayersUtil.getDemandScenarioForecast(
                request,
                demandId,
                forecastVersion,
                [baseLayer.layerId]
            );

            baseChannelsForecastData = ManageSelectLayersUtil.populateBaseChannelsData(forecastData.forecast);

            await LockUnlockUtility.lockDSSData(request, demandId);
            layer1 = await ManageSelectLayersUtil.createLayer(request, demandId, manageSelectLayers.payload_create_layer, forecastVersion, baseChannelsForecastData, amount);

            await LockUnlockUtility.lockDSSData(request, demandId);
            layer2 = await ManageSelectLayersUtil.createLayer(request, demandId, manageSelectLayers.payload_create_layer, forecastVersion, baseChannelsForecastData, amount*2);
        });
  
      test.afterAll(async ({ request }) => {
        await CdfUtility.deleteScenario(request, demandId);
      });
  
      test("Manage select layers", async ({ request }) => {
        await test.step(`Verify: User can select all layers`, async () => {
            let response, baseChannelsValues;
        
            response = await ManageSelectLayersUtil.getDemandScenarioForecast(
                request,
                demandId,
                forecastVersion,
                [layer2[0].layerId, layer1[0].layerId, baseLayer.layerId]
            );
    
            baseChannelsValues = ManageSelectLayersUtil.populateBaseChannelsData(response.forecast);
    
            expect(baseChannelsValues[baseChannelNames[0]].amount).toEqual(baseChannelsForecastData[baseChannelNames[0]].amount + (amount * 2));
            expect(baseChannelsValues[baseChannelNames[1]].amount).toEqual(baseChannelsForecastData[baseChannelNames[1]].amount - (amount * 2));
        });

        await test.step(`Verify: User can unselect all layers`, async () => {
            let response, baseChannelsValues;
        
            response = await ManageSelectLayersUtil.getDemandScenarioForecast(
                request,
                demandId,
                forecastVersion,
                [baseLayer.layerId]
            );
    
            baseChannelsValues = ManageSelectLayersUtil.populateBaseChannelsData(response.forecast);
    
            expect(baseChannelsValues[baseChannelNames[0]].amount).toEqual(baseChannelsForecastData[baseChannelNames[0]].amount);
            expect(baseChannelsValues[baseChannelNames[1]].amount).toEqual(baseChannelsForecastData[baseChannelNames[1]].amount);
        });

        await test.step(`Verify: User can unselect any of the layers`, async () => {
            let response, baseChannelsValues;
        
            response = await ManageSelectLayersUtil.getDemandScenarioForecast(
                request,
                demandId,
                forecastVersion,
                [layer2[0].layerId, baseLayer.layerId]
            );
    
            baseChannelsValues = ManageSelectLayersUtil.populateBaseChannelsData(response.forecast);
    
            expect(baseChannelsValues[baseChannelNames[0]].amount).toEqual(baseChannelsForecastData[baseChannelNames[0]].amount + amount);
            expect(baseChannelsValues[baseChannelNames[1]].amount).toEqual(baseChannelsForecastData[baseChannelNames[1]].amount - amount);
        });

      });
    }
);