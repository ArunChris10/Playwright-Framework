import { Utility } from "../../common/fixtures/utils";

export class parentChildNodeUtility {

    static async getNodeVariantResponse(request, isError = false) {
        const driverTreeEndpointURL = `${process.env.apiBaseURLSSDM}/api/driver-trees/`;
        let driverTreeResponse = await request.get(driverTreeEndpointURL);
        let responseBody = await Utility.assertAndLog(driverTreeResponse, isError);
        let driverTreeKey = responseBody[0].driver_tree_key;
        const driverTreeVersionEndpointURL = `${process.env.apiBaseURLSSDM}/api/driver-trees/${driverTreeKey}/versions`;
        let driverTreeVersionResponse = await request.get(driverTreeVersionEndpointURL);
        let versionResponseBody = await Utility.assertAndLog(driverTreeVersionResponse, isError);
        const activePublishedVersions = versionResponseBody.filter(
            (item: any) => item.is_active === true && item.is_published === true
        ).map((item: any) => item.driver_tree_version);
        console.log('Active & Published driver_tree_versions:', activePublishedVersions);
        // once Publish is done, we can use the first active published version instead of versions/1
        let nodeVariantEndpointURL = `${process.env.apiBaseURLSSDM}/api/driver-trees/${driverTreeKey}/versions/1/node-variant-relationships`;
        let nodeVariantResponse = await request.get(nodeVariantEndpointURL);
        let nodeVariantResponseBody = await Utility.assertAndLog(nodeVariantResponse, isError);
        return nodeVariantResponseBody
    }

    static async getChildNodeForSelectedParent(nodeVariantResponse, parent: string, isError = false) {
        const childNodeNames = nodeVariantResponse
            .filter((item: any) => item.parentNodeNm === parent)
            .map((item: any) => item.childNodeNm);
        return childNodeNames;
    }

    static async getFirstChildNodeForSelectedParent(nodeVariantResponse, parent: string, isError = false) {
        const childNodeNames = nodeVariantResponse
            .filter((item: any) => item.parentNodeNm === parent)
            .map((item: any) => item.childNodeNm);
        if (childNodeNames.length > 0) {
            return childNodeNames[0];
        } else {
            throw new Error(`No child nodes found for parent: ${parent}`);
        }
    }
}




