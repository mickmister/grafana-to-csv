import fetch from 'node-fetch';
require('dotenv').config();

import {makeReconnectAvgBody} from './grafana_queries';

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

// const notifier = require('node-notifier');

const notify = (message: string) => {
    // notifier.notify(message);
}

setTimeout(async () => {
    const numDays = 66;

    const directory = `./data/${outPrefix}`;
    await fs.mkdir(directory, {recursive: true});

    for (let dayNumber = numDays - 1; dayNumber > -1; dayNumber--) {
        // for (let dayNumber = 0; dayNumber < numDays; dayNumber++) {
        const res = await doRequest(dayNumber);

        const fname = `${directory}/${outPrefix}-${dayNumber}.json`;
        await fs.writeFile(fname, JSON.stringify(res, null, 2));
        const message = `Wrote ${fname}`;
        console.log(message);
        notify(message);

        await new Promise(r => setTimeout(r, 1000 * 10));
    }
});

const makeBody = makeReconnectAvgBody;

const outPrefix = 'reconnectAvg';

const doRequest = (dayNumber: number) => {
    const body = makeBody(dayNumber);

    incrementingRequestId++;
    const requestId = `Q${incrementingRequestId}`;

    const u = `https://grafana.internal.mattermost.com/api/ds/query?ds_type=prometheus&requestId=${requestId}`;

    return fetch(u, {
        method: 'POST',
        headers: {
            ...headers,
            cookie,
        },
        body: JSON.stringify(body),
    }).then(r => r.json());
}
