import { expect, Page, Locator } from '@playwright/test';
import { matchers } from 'playwright-expect';
import { TIMEOUT_SSDM_FE, TIMEOUT_FE_WAIT } from '../constants/timeout.json';
import { Utility } from "../../common/fixtures/utils";
import getNodeData from "../testdata/createnode.json";
import { env } from 'process';

// Extend Playwright's expect with custom matchers
expect.extend(matchers);

/**
 * Utility class to handle sign-in operations for the application.
 */
export class createNodeUtility {

    static async getUfdmPartitionData(request, isError = false) {
        //const endpointURL = `${process.env.uiAppBaseURL}api/validation/get-partition-data`;
        const endpointURL = `https://ibg-node-hub-service.qa.ibg.walmart.com/api/validation/get-partition-data`;
        const response = await request.get(endpointURL);
        let responseBody = await Utility.assertAndLog(response, isError);
        const first = responseBody[0];
        return {
            nodeId: first.NODE_ID,
            partitionGrain: first.PARTITION_GRAIN
        };
    }


    static async createNewNode(request, nodeId?: string, isError = false) {
        //const endpointURL = `${process.env.uiAppBaseURL}api/nodes`;
        const endpointURL = `https://ibg-node-hub-service-qa.ibg-ufm.k8s.glb.us.walmart.net/api/nodes`;
        let randomNodeDetail = getNodeData.node_id + await Utility.randomInt(1, 5000);
        if (nodeId) {
            getNodeData.node_id = nodeId;
        } else {
            getNodeData.node_id = randomNodeDetail;
        }
        getNodeData.node_name = randomNodeDetail;
        let nexusTokens = await Utility.getNexusFakeToken(`${process.env.ufmUser}`, request);
        const response = await request.post(endpointURL, {
            headers: {
                Authorization: nexusTokens,
            }, data: getNodeData
        });
        let responseBody = await Utility.assertAndLog(response, isError);
        return {
            nodeName: getNodeData.node_name,
            nodeKey: responseBody[0].node_key
        }
    }

    static async deleteCreatedNode(request, nodeKey, isError = false) {
        //const endpointURL = `${process.env.uiAppBaseURL}api/nodes/${nodeKey}`;
        const endpointURL = `https://ibg-node-hub-service-qa.ibg-ufm.k8s.glb.us.walmart.net/api/nodes/${nodeKey}`;
        let nexusTokens = await Utility.getNexusFakeToken(`${process.env.ufmUser}`, request);
        const response = await request.delete(endpointURL, {
            headers: {
                Authorization: nexusTokens,
            }
        });
        let responseBody = await Utility.assertAndLog(response, isError);
        expect(responseBody).toBe(true);
    }
}




