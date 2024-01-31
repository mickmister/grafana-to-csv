## Grafana to CSV

Perform Prometheus queries through Grafana's API across multiple time frames, and export the data to CSV format for analysis in spreadsheets.

Copy `.env.sample` to `.env` and fill out the values. See the comments on https://github.com/mickmister/mm-grafana-scraper/pull/1 for more context.

See `config.json` for the example configuration https://github.com/mickmister/mm-grafana-scraper/blob/master/config.json

## Usage

Install dependencies:

```sh
npm i
```

Gather data from Grafana:

```sh
npm run fetch-data
```

Create CSV report of the most recent data fetched from Grafana

```sh
npm run create-csv
```

Then check the `data/csv-out` folder for the generated CSV files
