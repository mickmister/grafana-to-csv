import fetch from 'node-fetch';
require('dotenv').config();

import {makeBodyFromQueries} from './grafana_queries';

import configFile from './config.json';

const config: Config = configFile;

const cookie = process.env.GRAFANA_COOKIE;
if (!cookie) {
    console.log('Please provide a cookie via GRAFANA_COOKIE env var');
    process.exit(0);
}

const dashboardUid = process.env.DASHBOARD_UID;
if (!dashboardUid) {
    console.log('Please provide a dashboard uid via DASHBOARD_UID env var');
    process.exit(0);
}

const datasourceUid = process.env.DATASOURCE_UID;
if (!datasourceUid) {
    console.log('Please provide a datasource uid via DATASOURCE_UID env var');
    process.exit(0);
}

const deviceId = process.env.GRAFANA_DEVICE_ID;
if (!deviceId) {
    console.log('Please provide a Grafana device id via GRAFANA_DEVICE_ID env var');
    process.exit(0);
}

const namespace = process.env.GRAFANA_NAMESPACE;
if (!namespace) {
    console.log('Please provide a Grafana namespace via GRAFANA_NAMESPACE env var');
    process.exit(0);
}

let incrementingRequestId = 100;

const headers = {
    "accept": "application/json, text/plain, */*",
    "accept-language": "en-US,en;q=0.9",
    "content-type": "application/json",
    "sec-ch-ua": "\"Chromium\";v=\"119\", \"Not?A_Brand\";v=\"24\"",
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": "\"macOS\"",
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-origin",
    "x-dashboard-uid": dashboardUid,
    "x-datasource-uid": datasourceUid,
    "x-grafana-device-id": deviceId,
    "x-grafana-org-id": "1",
    "x-panel-id": "2",
    "x-plugin-id": "prometheus"
};

import fs from 'fs/promises';
import {Config} from './types/config_types';

// const notifier = require('node-notifier');

const notify = (message: string) => {
    // notifier.notify(message);
}

setTimeout(async () => {
    const numQueries = config.totalNumberOfQueries;

    const iso = new Date().toISOString();
    const outPrefix = config.jsonFolderName;

    const directory = `./data/${outPrefix}/${iso}`;
    await fs.mkdir(directory, {recursive: true});

    const totalDays = numQueries * config.numberOfDaysPerQuery;
    console.log(`Fetching ${totalDays} days worth of Prometheus data. ${numQueries} sets of ${config.queries.length} queries, each ${config.numberOfDaysPerQuery} days`);

    for (let queryNumber = numQueries - 1; queryNumber > -1; queryNumber--) {
        console.log('');
        console.log(`Query ${numQueries - queryNumber} of ${numQueries}`);

        let res: object;
        try {
            res = await doRequest(queryNumber);
        } catch (e) {
            console.error(`Error performing request ${e}`);
            return;
        }

        if ('message' in res) {
            console.log(`Response from Grafana: ${res.message}`);
            return;
        }

        const fname = `${directory}/${outPrefix}-${queryNumber}.json`;
        await fs.writeFile(fname, JSON.stringify(res, null, 2));
        const message = `Wrote ${fname}`;
        console.log(message);
        // notify(message);

        if (queryNumber === 0) {
            return;
        }

        const secondsToWait = 5;
        console.log(`Waiting ${secondsToWait} seconds before next request`);
        await new Promise(r => setTimeout(r, 1000 * secondsToWait));
    }
});

const makeBody = (queryNumber: number) => {
    return makeBodyFromQueries(queryNumber, config.numberOfDaysPerQuery, config.queries, namespace);
}

const doRequest = async (dayNumber: number): Promise<object> => {
const body = makeBody(dayNumber);
    incrementingRequestId++;
    const requestId = `Q${incrementingRequestId}`;

    const u = `https://grafana.internal.mattermost.com/api/ds/query?ds_type=prometheus&requestId=${requestId}`;

    const from = new Date(parseInt(body.from));
    const to = new Date(parseInt(body.to));

    console.log('from', from.toISOString());
    console.log('to', to.toISOString());

    const time1 = new Date();
    const data = await fetch(u, {
        method: 'POST',
        headers: {
            ...headers,
            cookie,
        },
        body: JSON.stringify(body),
    }).then(r => r.json());

    const time2 = new Date();
    const ms = time2.getTime() - time1.getTime();
    console.log(`${ms}ms`);

    return data;
}
