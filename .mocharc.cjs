const { SCENARIO_ID } = require('./env.json');
const scenarioId = process.env.SCENARIO_ID || SCENARIO_ID;

module.exports = {
    "node-option": [
        "experimental-specifier-resolution=node"
    ],
    "package": "./package.json",
    "files": [
        "test/**/*.spec.js"
    ],
    "recursive": true,
    "timeout": 30000,
    "noTimeouts": true,
    "debugBrk": true,
    "require": [
        "@babel/register",
        "regenerator-runtime/runtime",
        "mochawesome/register"
    ],
    "reporter": "mochawesome",
    "reporterOptions": [
        "reportDir=test_results,reportFilename=report_[datetime]_[status]_" + scenarioId + ",timestamp=yyyymmdd"
    ]
};