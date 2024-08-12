import { expect, test } from '../../common/fixtures/test-hook';
import testdatafile from '../testdata/tag-notification.json';
import { CdfUtility } from '../fixtures/cdf-utils';
import userData from '../../common/testdata/users.json';
import debug from 'debug';

test.describe("Verify that when a user is tagged in comment, a notification is sent", { tag: "@Smoke @tagNotification @ibg-service-scenario-financials @Regression" }, () => {

    test("Verify that notification is sent", async ({ request }) => {
        let postCommentResponse = await CdfUtility.postComment(request);
        expect(postCommentResponse).toBeOK();

        let getNotification = await CdfUtility.getNotification(request);
        expect(getNotification).toBeOK();

        let getNotificationRespone = await getNotification.json();

        let userDisplayName = userData.filter(obj => obj.userId === `${process.env.collaborationUser}`).map(map => map.displayName);
        
        let expectedMessage = `You have been tagged in a comment by ${userDisplayName}`;
        let latestNotificationMessage = getNotificationRespone.content[0].notificationMessage;
        let latestEntityId = JSON.parse(getNotificationRespone.content[0].notificationJson).entityId;

        debug.log("Expected message : ", expectedMessage);
        debug.log("Notification Entity Id : ", latestEntityId);

        expect(latestNotificationMessage).toContain(expectedMessage);
        expect(testdatafile.postCommentPayload.entityId).toEqual(latestEntityId);

    });

});