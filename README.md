## Grafana Scraper

This tool is used to perform Prometheus queries through Grafana's API, collecting data across multiple time frames. The output for each query is grouped into different CSV files, then exported into a Google Sheets spreadsheet for analysis.

## Configuration

In order to use the tool, we need to provide an authentication token for Grafana, and an API key for Google Sheets API if you would like to have a spreadsheet created by the tool.

You can copy `.env.sample` to `.env` and fill out the values.

### Grafana

In order to access Grafana's API, we need an API token, and some other information from Grafana. If you are signed into Grafana in your browser, you can retrieve all of this information from the HTTP request headers for a given Grafana query request. In your browser's dev tools, look for a request to the URL `api/ds/query` after performing a data query.

Then collect the following pieces of data from the request headers and put them into the `.env` file. The name of each HTTP request header is in a comment next to the associated environment variable. For example, the `GRAFANA_DATASOURCE_UID` env var should contain the header value for the `x-datasource-uid` header of your browser's network requests to Grafana.

```
GRAFANA_COOKIE= # Cookie
GRAFANA_DATASOURCE_UID= # x-datasource-uid
```

The `GRAFANA_NAMESPACE` environment variable is injected into the queries as shown in the query below. In the case of Mattermost's Grafana instance, this allows you to query individual namespaces set up in Grafana.

```sh
1000 * sum(increase(mattermost_api_time_sum{namespace=\"$NAMESPACE\"}[$__range])) by (handler)
```

### Google Sheets Configuration

Follow the instructions here to create a Google API service account and obtain an API key https://support.google.com/a/answer/7378726. Then supply the following values in the `.env` file:

```
GOOGLE_API_KEY=(API key)
GOOGLE_SPREADSHEET_NAME=(The name of the spreadsheet you want to create)
```

Then supply only one of the following to have the spreadsheet shared with you:

```
GOOGLE_USER_EMAIL=(Your work/personal Google email address)

GOOGLE_DOMAIN=(Your Google workspace domain, e.g. mattermost.com)
```

### Prometheus Queries

See [config.json](./config.json) for the example configuration. All queries to use are defined in this file. At the time of writing, there are 6 queries available by default:

- Database store methods - Average Time
- Database store methods - Total Time
- Database methods - Count
- API handlers - Average Time
- API handlers - Count
- API handlers - Total Time

Feel free to add/modify/delete queries from the `config.json` file for your own usage.

### Timeframe Configuration

There are some additional parameters available in `config.json`:

```json
    "runQueries": [],
    "jsonFolderName": "json-out",
    "csvFolderName": "csv-out",
    "totalNumberOfRequests": 12,
    "numberOfDaysPerRequest": 7,
    "offsetDays": 0
```

With the above configuration, the program starts up and outputs the following message:

> Fetching 84 days worth of Prometheus data. 12 requests each 7 days, with 6 kinds of Prometheus queries in each request.

Which means, we are gathering data at the rate of a week (7 days) at a time, and gathering data for the last 12 weeks. We are performing all configured 6 queries in each of these requests, resulting in 72 total Prometheus queries being run in the report.

Explanation of each field:

`runQueries` defines which queries to include in the report. Leaving this an empty array runs all of the queries. If we supply the value `[0, 3]`, then the reporter will use the 2 queries at index 0 and index 3 of the `queries` array. This allows you to run a subset of the queries without modifying the set queries.

`totalNumberOfRequests` Number of Grafana requests to run. Each request is for multiple queries in a single time frame.

`numberOfDaysPerRequest` Time frame size for each request

`offsetDays` Defines what end date to use for the report. Using 0 here results in "end the report today". Using 5 would result in "end the report 5 days in the past", which would then offset the beginning to be 5 days in the past of what it would have been before.

`jsonFolderName` defines in which folder the Grafana JSON responses should be stored. This folder will be prefixed with `data/`, i.e. `data/${jsonFolderName}`

`csvFolderName` defines in which folder the CSV output should be stored. This folder will be prefixed with `data/`, i.e. `data/${csvFolderName}`

## Usage

Install dependencies:

```sh
npm i
```

Run report:

```sh
npm start
```

---

Alternatively, you can run each step of the report separately for debugging:

Gather data from Grafana:

```sh
npm run fetch-data
```
Then check the `data/csv-out` folder for the generated CSV files

Create CSV report of the most recent data fetched from Grafana

```sh
npm run create-csv
```

Then check the `data/csv-out` folder for the generated CSV files

Create a new Google Sheets spreadsheet:

```sh
npm run create-spreadsheet
```
