/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-require-imports */
const path = require("node:path");
const { generateApi } = require("swagger-typescript-api");

require("dotenv").config();

generateApi({
  name: "backendApi.ts",
  output: path.resolve(process.cwd(), "./src/generated"),
  url: `${process.env.API_URL}/api-docs-json`,
}).catch((e) => {
  console.error(e);
  process.exit(1);
});
