import { test, expect } from "../../common/fixtures/test-hook"
import { CdfUtility } from "../fixtures/cdf-utils";

import departmentFilterTestData from "../testdata/department-filter.json"

import type { GetDemandScenarioForecastResponse, Department } from "../types/get-demand-scenario-forecast-response";

test.describe.configure({ mode: 'parallel' });
test.describe("Department Filter Testcases (API)", { tag: "@Regression @DemandOutput @DemandOutputDepartmentFilter"}, async () => {
    const { department: departmentsToTest  } = departmentFilterTestData;

    let demandId: string
    let response: GetDemandScenarioForecastResponse<Department>

    test.beforeAll(async ({ request }) => {
        demandId = await CdfUtility.createScenario(request)
        response =
            await CdfUtility
            .getDemandScenarioByIdWithMinimumDataPayload(request, demandId, departmentFilterTestData)
    })

    test.afterAll(async ({ request }) => {
        await CdfUtility.deleteScenario(request, demandId)
    })

    test("Verify user can filter data by departments", async () => {
        await test.step("Check that the response's forecast has the correct length with unique entries", () => {
            const responseDepartmentSet = new Set(response.forecast.map(f => f.department))
            expect(responseDepartmentSet.size).toBe(departmentsToTest.length);
        })

        await test.step("Check that the response contains only the selected departments", () => {
            for (const forecast of response.forecast) {
                expect(departmentsToTest.includes(forecast.department)).toBeTruthy()
            }
        })
    })

    test("Verify department order is sequential", async () => {
        let isSequential = true
        let prevDepartmentId = 0

        for (const forecast of response.forecast) {
            if (forecast.departmentId < prevDepartmentId) {
                isSequential = false
                break;
            }
        }

        expect(isSequential).toBe(true)
    })
})