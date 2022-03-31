/**
 * This script is responsible for create the SQL tables.
 * Run it via `npm run db:create`.
 */
require('dotenv').config();
import bcrypt from 'bcrypt';
import models from '../models';
import { v4 as uuid } from 'uuid';

const BCRYPT_SALT_ROUNDS = 12
const database = models();
database
  .sequelize.sync()
  .then(() => {
    bcrypt.hash(
      process.env.SUPERADMIN_PASSWORD,
      BCRYPT_SALT_ROUNDS,
    ).then(hashedPassword => {
      database['user'].create({
        firstName: 'admin',
        email: process.env.SUPERADMIN_EMAIL,
        password: hashedPassword,
        emailVerified: true,
        active: true,
        superadmin: true,
      }).then(user => {
        database['tenant'].create({
          name: 'Superadmin workspace',
          url: uuid(),
          createdBySuperadmin: true,
        }).then(tenant => {
          database['tenantUser'].create({
            roles: ['superadmin'],
            tenantId: tenant.id,
            userId: user.id,
            status: 'active',
          }).then(() => {
            database['settings'].create({
              id: tenant.id,
              theme: 'default',
              tenantId: tenant.id,
              createdById: user.id,
              updatedById: user.id,
            }).then(() => {
              console.log('OK');
              process.exit();
            });
          });
        });
      });
    });
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
