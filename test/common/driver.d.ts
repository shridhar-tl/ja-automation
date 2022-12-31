import { ThenableWebDriver } from "selenium-webdriver";

export function getScope(): { driver: ThenableWebDriver, rootUrl: string, mapPath: function, scenario: IScenarioConfig }

interface IScenarioConfig {
    useWeb: boolean
    useExtn: boolean
    useCloud: boolean
    authType: 'session' | 'basic' | 'oauth'
    browserToTest: 'chrome' | 'firefox' | 'edge' | 'opera'
    extensionPath: string
    rootUrl: string
    webRootUrl: string
    jiraUrl: string
    jiraUser: string
    jiraPwd: string
    jiraSecret: string
}