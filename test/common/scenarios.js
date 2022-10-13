import { extnRootUrl, webRootUrl } from '../constants/urls';
import jsonConfig from '../../env.json' assert { type: "json" };

const scenarios = [
    // Only with extension
    'session_extn', 'basic_extn', 'oauth_extn',

    // Web using extension
    'session_extn_web', 'basic_extn_web', 'oauth_extn_web',

    // Web only without extension
    'basic_web', 'oauth_web'
];

export default function getScenario() {
    const env = getEnvConfig();
    const scenarioId = env.SCENARIO_ID.toLowerCase();

    if (!scenarios.includes(scenarioId)) {
        throw new Error('Unknown scenario id: ' + scenarioId);
    }

    const scenarioIdParts = scenarioId.split('_');
    const useWeb = scenarioIdParts.includes("web");

    const scenario = {
        scenarioId,
        useWeb,
        browserToTest: env.BROWSER_NAME,
        useExtn: scenarioIdParts.includes("extn"),
        extensionPath: env.EXTN_PATH,
        rootUrl: useWeb ? env.WEB_ROOT_URL : env.EXTN_ROOT_URL,
        authType: scenarioIdParts[0],
        jiraUrl: env.JIRA_URL,
        jiraUser: env.JIRA_USER,
        jiraPwd: env.JIRA_PASSWORD,
        jiraSecret: env.JIRA_SECRET_KEY,
    };

    return scenario;
};

function getEnvConfig() {
    const env = (key, def) => process.env[key] || def;

    const defaultConfig = {
        "SCENARIO_ID": "basic_extn_web",
        "BROWSER_NAME": "chrome",
        "WEB_ROOT_URL": webRootUrl,
        "EXTN_ROOT_URL": extnRootUrl["chrome"],
        "EXTN_PATH": "./extension",
        "JIRA_URL": "https://jira-ja.atlassian.net",
        ...jsonConfig
    };

    const browser = env("BROWSER_NAME", defaultConfig.BROWSER_NAME);

    return {
        ...defaultConfig,
        "SCENARIO_ID": env("SCENARIO_ID", defaultConfig.SCENARIO_ID),
        "BROWSER_NAME": browser,
        "WEB_ROOT_URL": env("WEB_ROOT_URL", defaultConfig.WEB_ROOT_URL),
        "EXTN_ROOT_URL": env("EXTN_ROOT_URL", extnRootUrl[browser]),
        "EXTN_PATH": env("EXTN_PATH", defaultConfig.EXTN_PATH),
        "JIRA_URL": env("JIRA_URL", defaultConfig.JIRA_URL),
        "JIRA_USER": env("JIRA_USER", defaultConfig.JIRA_USER),
        "JIRA_PASSWORD": env("JIRA_PASSWORD", defaultConfig.JIRA_PASSWORD),
        "JIRA_SECRET_KEY": env("JIRA_SECRET_KEY", defaultConfig.JIRA_SECRET_KEY)
    }
}