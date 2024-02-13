export const GRAFANA_COOKIE = process.env.GRAFANA_COOKIE!;
if (!GRAFANA_COOKIE) {
    console.log('Please provide a cookie via GRAFANA_COOKIE env var');
    process.exit(0);
}

export const GRAFANA_DATASOURCE_UID = process.env.GRAFANA_DATASOURCE_UID!;
if (!GRAFANA_DATASOURCE_UID) {
    console.log('Please provide a datasource uid via GRAFANA_DATASOURCE_UID env var');
    process.exit(0);
}

export const GRAFANA_DATASOURCE_ID = process.env.GRAFANA_DATASOURCE_ID!;
if (!GRAFANA_DATASOURCE_ID) {
    console.log('Please provide a datasource id via GRAFANA_DATASOURCE_ID env var');
    process.exit(0);
}

export const GRAFANA_NAMESPACE = process.env.GRAFANA_NAMESPACE!;
if (!GRAFANA_NAMESPACE) {
    console.log('Please provide a Grafana namespace via GRAFANA_NAMESPACE env var');
    process.exit(0);
}
