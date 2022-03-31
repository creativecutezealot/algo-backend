import TenantRepository from '../database/repositories/tenantRepository';
import SequelizeRepository from '../database/repositories/sequelizeRepository';
import PermissionChecker from './user/permissionChecker';
import Permissions from '../security/permissions';
import { IServiceOptions } from './IServiceOptions';
import PoolNotesRepository from '../database/repositories/poolNotesRepository';

export default class PoolNoteService {
  options: IServiceOptions;

  constructor(options) {
    this.options = options;
  }

  async create(data) {
    const transaction = await SequelizeRepository.createTransaction(
      this.options.database,
    );

    try {
      let record = await PoolNotesRepository.create(data, {
        ...this.options,
        transaction,
      });

      await SequelizeRepository.commitTransaction(
        transaction,
      );

      return record;
    } catch (error) {
      await SequelizeRepository.rollbackTransaction(
        transaction,
      );
      throw error;
    }
  }

  async edit(data) {
    const transaction = await SequelizeRepository.createTransaction(
      this.options.database,
    );

    try {
      let record = await PoolNotesRepository.edit(data, {
        ...this.options,
        transaction,
      });

      await SequelizeRepository.commitTransaction(
        transaction,
      );

      return record;
    } catch (error) {
      await SequelizeRepository.rollbackTransaction(
        transaction,
      );
      throw error;
    }
  }

  async getNotes(id) {
    const transaction = await SequelizeRepository.createTransaction(
      this.options.database,
    );

    try {
      let record = await PoolNotesRepository.get(id, {
        ...this.options,
        transaction,
      });

      await SequelizeRepository.commitTransaction(
        transaction,
      );

      return record;
    } catch (error) {
      await SequelizeRepository.rollbackTransaction(
        transaction,
      );
      throw error;
    }
  }

  async delete(id) {
    const transaction = await SequelizeRepository.createTransaction(
      this.options.database,
    );

    try {
      let record = await PoolNotesRepository.delete(id, {
        ...this.options,
        transaction,
      });

      await SequelizeRepository.commitTransaction(
        transaction,
      );

      return record;
    } catch (error) {
      await SequelizeRepository.rollbackTransaction(
        transaction,
      );
      throw error;
    }
  }
}
