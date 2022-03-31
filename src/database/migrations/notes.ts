/**
 * This script is responsible for create the SQL tables.
 * Run it via `npm run db:create`.
 */
require('dotenv').config();
import models from '../models';

const database = models();
database
  .sequelize.sync()
  .then(() => {
    console.log("Note Table was creaetd successfully...");
    process.exit();
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
