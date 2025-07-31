import { Utility } from "../../common/fixtures/utils";

export class parentChildNodeUtility {

    static async getDriverTreeKey(request, isError = false) {
        const driverTreeEndpointURL = `${process.env.apiBaseURLSSDM}/api/driver-trees/`;
        let driverTreeResponse = await request.get(driverTreeEndpointURL);
        let responseBody = await Utility.assertAndLog(driverTreeResponse, isError);
        let driverTreeKey = responseBody[0].driver_tree_key;
        let driverTreeName = responseBody[0].driver_tree_name;
        return { driverTreeKey, driverTreeName };
    }

    static async getDriverTreeVersion(request, isError = false) {
        const { driverTreeKey, driverTreeName } = await this.getDriverTreeKey(request, isError);
        const driverTreeVersionEndpointURL = `${process.env.apiBaseURLSSDM}/api/driver-trees/${driverTreeKey}/versions`;
        let driverTreeVersionResponse = await request.get(driverTreeVersionEndpointURL);
        let versionResponseBody = await Utility.assertAndLog(driverTreeVersionResponse, isError);
        const activePublishedVersions = versionResponseBody.filter(
            (item: any) => item.is_active === true && item.is_published === true
        ).map((item: any) => item.driver_tree_version);
        const firstActivePublished = versionResponseBody.find(
            (item: any) => item.is_active === true && item.is_published === true
        );
        const dataSetSelected = firstActivePublished?.data_set_selection;
        console.log('Active & Published driver_tree_versions:', activePublishedVersions);
        return {
            driverTreeKey,
            driverTreeName,
            dataSetSelected,
            driverTreeVersion: activePublishedVersions[0]
        };
    }


    static async getCurrentDraftCreatedDate(request, isError = false) {
        const { driverTreeKey, driverTreeName } = await this.getDriverTreeKey(request, isError);
        const driverTreeVersionEndpointURL = `${process.env.apiBaseURLSSDM}/api/driver-trees/${driverTreeKey}/versions`;
        let driverTreeVersionResponse = await request.get(driverTreeVersionEndpointURL);
        let versionResponseBody = await Utility.assertAndLog(driverTreeVersionResponse, isError);
        const draftVersion = versionResponseBody.find(
            (item: any) => item.is_active === true && item.is_published === false
        );
        if (!draftVersion) {
            throw new Error("No draft version found (is_active=true, is_published=false)");
        }
        const activeDraft = versionResponseBody.find(
            (item: any) => item.is_active === true && item.is_published === false
        );
        const defaultdataSetForDraft = activeDraft?.data_set_selection;
        const createdDateRaw = draftVersion.created_date;
        // Convert "2025-07-30T09:21:03.710000" to "07/30/25"
        const dateObj = new Date(createdDateRaw);
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const day = String(dateObj.getDate()).padStart(2, '0');
        const year = String(dateObj.getFullYear()).slice(-2);
        const createdDateForDraft = `${month}/${day}/${year}`;
        console.log('Created Date for Draft:', createdDateForDraft);
        return {defaultdataSetForDraft, createdDateForDraft};
    }

    static async getNodeVariantResponse(request, isError = false) {
        const { driverTreeKey, driverTreeName, driverTreeVersion } = await this.getDriverTreeVersion(request, isError);
        let nodeVariantEndpointURL = `${process.env.apiBaseURLSSDM}/api/driver-trees/${driverTreeKey}/versions/${driverTreeVersion}/node-variant-relationships`;
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




