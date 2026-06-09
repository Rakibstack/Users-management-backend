import app from "./app";
import config from "./config/env";
import { initDB } from "./db";


const main = () => {
  initDB();
  app.listen(config.port, () => {
  console.log(`express server connected on  ${config.port}`);
});
}

main();

