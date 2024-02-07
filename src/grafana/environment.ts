export const GRAFANA_COOKIE = process.env.GRAFANA_COOKIE!;
if (!GRAFANA_COOKIE) {
    console.log('Please provide a cookie via GRAFANA_COOKIE env var');
    process.exit(0);
}

export const GRAFANA_DASHBOARD_UID = process.env.GRAFANA_DASHBOARD_UID!;
if (!GRAFANA_DASHBOARD_UID) {
    console.log('Please provide a dashboard uid via GRAFANA_DASHBOARD_UID env var');
    process.exit(0);
}

export const GRAFANA_DATASOURCE_UID = process.env.GRAFANA_DATASOURCE_UID!;
if (!GRAFANA_DATASOURCE_UID) {
    console.log('Please provide a datasource uid via GRAFANA_DATASOURCE_UID env var');
    process.exit(0);
}

export const GRAFANA_DEVICE_ID = process.env.GRAFANA_DEVICE_ID!;
if (!GRAFANA_DEVICE_ID) {
    console.log('Please provide a Grafana device id via GRAFANA_DEVICE_ID env var');
    process.exit(0);
}

export const GRAFANA_NAMESPACE = process.env.GRAFANA_NAMESPACE!;
if (!GRAFANA_NAMESPACE) {
    console.log('Please provide a Grafana namespace via GRAFANA_NAMESPACE env var');
    process.exit(0);
}
