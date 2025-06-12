import { Locator } from "@playwright/test";

export interface Buttons {
    download: Locator,
    refresh: Locator,
    clear: Locator,
}

export interface ScenarioSection {
    textbox: Locator;
    checkboxes: Locator;
}