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
        // Filter NODE_IDs where PARTITION_GRAIN is NOT exactly "CHANNEL,DEPARTMENT,ENTITY,MONTH,REPORTING"
        const nodeIds = responseBody
            .filter(item => item.PARTITION_GRAIN !== "CHANNEL,DEPARTMENT,ENTITY,MONTH,REPORTING")
            .map(item => item.NODE_ID)
            .sort((nodeIdA, nodeIdB) => (nodeIdA < nodeIdB ? 1 : nodeIdA > nodeIdB ? -1 : 0));
        console.log('Filtered nodeIds (desc):', nodeIds);
        return {
            nodeIds,
            partitionGrains: responseBody
                .filter(item => item.PARTITION_GRAIN !== "CHANNEL,DEPARTMENT,ENTITY,MONTH,REPORTING")
                .map(item => item.PARTITION_GRAIN)
        };
    }

    static async getUfdmPartitionData1(request, isError = false) {
        //const endpointURL = `${process.env.uiAppBaseURL}api/validation/get-partition-data`;
        const endpointURL = `https://ibg-node-hub-service.qa.ibg.walmart.com/api/validation/get-partition-data`;
        const response = await request.get(endpointURL);
        let responseBody = await Utility.assertAndLog(response, isError);
        // Sort responseBody in descending order based on NODE_ID
        const sorted = responseBody.sort((nodeA, nodeB) => {
            if (nodeA.NODE_ID < nodeB.NODE_ID) return 1;
            if (nodeA.NODE_ID > nodeB.NODE_ID) return -1;
            return 0;
        });
        // Map all NODE_IDs from the sorted response
        const nodeIds = sorted.map(item => item.NODE_ID);
        console.log('nodeIds:', nodeIds);
        return {
            nodeIds,
            //partitionGrains: sorted.map(item => item.PARTITION_GRAIN)
        };
    }

    static async getdriverTreeNodes(request, isError = false) {
        //const endpointURL = `${process.env.uiAppBaseURL}api/nodes`;
        const endpointURL = `https://ibg-node-hub-service-qa.ibg-ufm.k8s.glb.us.walmart.net/api/nodes`;
        const response = await request.get(endpointURL);
        let responseBody = await Utility.assertAndLog(response, isError);
        // Return all node_id into an array and sort it in Descending order
        const nodeIds = responseBody
            .map(node => node.node_id)
            .sort((nodeIdA, nodeIdB) => (nodeIdA < nodeIdB ? 1 : nodeIdA > nodeIdB ? -1 : 0));
            console.log('driverTree nodeIds:', nodeIds);
        return nodeIds;
    }

    static getFirstNodeIdInUfdmNotInDriverTree(ufdmNodes: string[], driverTreeNodes: string[]): string | null {
        // Find the first node ID present in ufdmNodes but not in driverTreeNodes using strict equality (full string match)
        const nodeId = ufdmNodes.find(nodeId => !driverTreeNodes.some(driverId => driverId === nodeId));
        console.log('First nodeId in ufdmNodes not in driverTreeNodes:', nodeId);
        return nodeId ?? null;
    }

    static async getPartitionGrainForNodeId(ufdmNodeId, request, isError = false) {
        //const endpointURL = `${process.env.uiAppBaseURL}api/validation/get-partition-data`;
        const endpointURL = `https://ibg-node-hub-service-qa.ibg-ufm.k8s.glb.us.walmart.net/api/validation/get-partition-data`;
        const response = await request.get(endpointURL);
        let responseBody = await Utility.assertAndLog(response, isError);
        // Find the partition grain for the given nodeId
        const partitionGrain = responseBody.find(item => item.NODE_ID === ufdmNodeId)?.PARTITION_GRAIN;
        console.log('Partition grain for nodeId', ufdmNodeId, ':', partitionGrain);
        return partitionGrain;
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




