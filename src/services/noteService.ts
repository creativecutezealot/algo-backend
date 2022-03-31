import TenantRepository from '../database/repositories/tenantRepository';
import SequelizeRepository from '../database/repositories/sequelizeRepository';
import PermissionChecker from './user/permissionChecker';
import Permissions from '../security/permissions';
import { IServiceOptions } from './IServiceOptions';
import NotesRepository from '../database/repositories/notesRepository';

export default class NoteService {
  options: IServiceOptions;

  constructor(options) {
    this.options = options;
  }

  async create(data) {
    const transaction = await SequelizeRepository.createTransaction(
      this.options.database,
    );

    try {
      let record = await NotesRepository.create(data, {
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
      let record = await NotesRepository.edit(data, {
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
      let record = await NotesRepository.get(id, {
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
      let record = await NotesRepository.delete(id, {
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
