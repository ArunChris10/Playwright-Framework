import { Locator } from "@playwright/test";

export interface Buttons {
    download: Locator
    refresh: Locator
    clear: Locator
    settings: Locator
    back: Locator
    moreRefreshOptions: Locator
    refreshAll: Locator
}

export interface ScenarioSection {
    textbox: Locator
    checkboxes: Locator
}

interface ExcelButtons {
    newSheet: Locator
    deleteSheet: Locator
    ok: Locator
}

export interface ExcelUIElements {
    buttons: ExcelButtons
}