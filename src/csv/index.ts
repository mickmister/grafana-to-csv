require('dotenv').config();

import {runJobCreateCsv} from '../csv/csv_creator';

setTimeout(async () => {
    await runJobCreateCsv();
});
