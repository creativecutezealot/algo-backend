import SequelizeRepository from './sequelizeRepository';
import AuditLogRepository from './auditLogRepository';
import FileRepository from './fileRepository';
import _get from 'lodash/get';
import { IRepositoryOptions } from './IRepositoryOptions';
import lodash from 'lodash';
import Error404 from '../../errors/Error404';
import { v4 as uuid } from 'uuid';

export default class PoolNotesRepository {
  static async create(data, options: IRepositoryOptions) {
    const currentUser =
      SequelizeRepository.getCurrentUser(options);
    const tenant =
      SequelizeRepository.getCurrentTenant(options);
    const transaction =
      SequelizeRepository.getTransaction(options);
    try {
      const record = await options.database.poolNote.create(
        {
          id: uuid(),
          ...lodash.pick(data, [
            'poolId',
            'title',
            'description',
          ]),
          tenantId: tenant.id,
        },
        {
          transaction,
        },
      );
      await this._createAuditLog(
        AuditLogRepository.CREATE,
        record,
        data,
        options,
      );

      return this.findByTanentId(record.poolId, options);
    } catch (err) {
      console.error(err);
      return err;
    }
  }

  static async edit(data, options: IRepositoryOptions) {
    const currentUser =
      SequelizeRepository.getCurrentUser(options);
    const tenant =
      SequelizeRepository.getCurrentTenant(options);
    const transaction =
      SequelizeRepository.getTransaction(options);

    try {
      let record = await options.database.poolNote.findOne({
        where: {
          id: data.id,
        },
        transaction,
      });

      if (!record) {
        throw new Error404();
      }

      record = await record.update(
        {
          ...lodash.pick(data, ['title', 'description']),
        },
        {
          transaction,
        },
      );

      await this._createAuditLog(
        AuditLogRepository.UPDATE,
        record,
        data,
        options,
      );

      return this.findByTanentId(record.poolId, options);
    } catch (err) {
      console.error(err);
      return err;
    }
  }

  static async delete(id, options: IRepositoryOptions) {
    const currentUser =
      SequelizeRepository.getCurrentUser(options);
    const tenant =
      SequelizeRepository.getCurrentTenant(options);
    const transaction =
      SequelizeRepository.getTransaction(options);

    try {
      let record = await options.database.poolNote.findOne({
        where: {
          id,
          tenantId: tenant.id,
        },
        transaction,
      });
      let poolId = record.poolId;

      if (!record) {
        throw new Error404();
      }

      await record.destroy({
        transaction,
      });

      await this._createAuditLog(
        AuditLogRepository.DELETE,
        record,
        record,
        options,
      );

      return this.findByTanentId(poolId, options);
    } catch (err) {
      console.error(err);
      return err;
    }
  }

  static async get(id, options: IRepositoryOptions) {
    const currentUser =
      SequelizeRepository.getCurrentUser(options);
    const transaction =
      SequelizeRepository.getTransaction(options);
    const tenant =
      SequelizeRepository.getCurrentTenant(options);
    try {
      let { rows, count } =
        await options.database.poolNote.findAndCountAll({
          where: {
            tenantId: tenant.id,
            poolId: id,
          },
          order: [['createdAt', 'DESC']],
          transaction:
            SequelizeRepository.getTransaction(options),
        });

      return { rows };
    } catch (err) {
      console.error(err);
      return err;
    }
  }

  static async _createAuditLog(
    action,
    record,
    data,
    options: IRepositoryOptions,
  ) {
    let values = {};

    if (data) {
      values = {
        ...record.get({ plain: true }),
        photos: data.photos,
      };
    }

    await AuditLogRepository.log(
      {
        entityName: 'product',
        entityId: record.id,
        action,
        values,
      },
      options,
    );
  }

  static async findByTanentId(
    poolId,
    options: IRepositoryOptions,
  ) {
    const transaction =
      SequelizeRepository.getTransaction(options);

    const currentUser =
      SequelizeRepository.getCurrentUser(options);
    const tenant =
      SequelizeRepository.getCurrentTenant(options);
    const records = await options.database.poolNote.findAll(
      {
        where: {
          poolId,
          tenantId: tenant.id,
        },
        order: [['createdAt', 'DESC']],
        transaction,
      },
    );

    if (!records) {
      throw new Error404();
    }

    return records;
  }

  static async findById(id, options: IRepositoryOptions) {
    const transaction =
      SequelizeRepository.getTransaction(options);

    const include = ['poolNote'];

    const currentUser =
      SequelizeRepository.getCurrentUser(options);

    const record = await options.database.product.findOne({
      where: {
        id,
        tenantId: currentUser.id,
      },
      include,
      transaction,
    });

    if (!record) {
      throw new Error404();
    }

    return record;
  }
}
