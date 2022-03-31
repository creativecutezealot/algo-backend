import Error400 from '../errors/Error400';
import SequelizeRepository from '../database/repositories/sequelizeRepository';
import { IServiceOptions } from './IServiceOptions';
import OrderRepository from '../database/repositories/orderRepository';
import CustomerRepository from '../database/repositories/customerRepository';
import ProductRepository from '../database/repositories/productRepository';
import UserRepository from '../database/repositories/userRepository';

export default class OrderService {
  options: IServiceOptions;

  constructor(options) {
    this.options = options;
  }

  async create(data) {
    const transaction = await SequelizeRepository.createTransaction(
      this.options.database,
    );

    try {
      data.customer = await CustomerRepository.filterIdInTenant(data.customer, { ...this.options, transaction });
      data.products = await ProductRepository.filterIdsInTenant(data.products, { ...this.options, transaction });
      data.employee = await UserRepository.filterIdInTenant(data.employee, { ...this.options, transaction });

      const record = await OrderRepository.create(data, {
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

      SequelizeRepository.handleUniqueFieldError(
        error,
        this.options.language,
        'order',
      );

      throw error;
    }
  }

  async update(id, data) {
    const transaction = await SequelizeRepository.createTransaction(
      this.options.database,
    );

    try {
      data.customer = await CustomerRepository.filterIdInTenant(data.customer, { ...this.options, transaction });
      data.products = await ProductRepository.filterIdsInTenant(data.products, { ...this.options, transaction });
      data.employee = await UserRepository.filterIdInTenant(data.employee, { ...this.options, transaction });

      const record = await OrderRepository.update(
        id,
        data,
        {
          ...this.options,
          transaction,
        },
      );

      await SequelizeRepository.commitTransaction(
        transaction,
      );

      return record;
    } catch (error) {
      await SequelizeRepository.rollbackTransaction(
        transaction,
      );

      SequelizeRepository.handleUniqueFieldError(
        error,
        this.options.language,
        'order',
      );

      throw error;
    }
  }

  async destroyAll(ids) {
    const transaction = await SequelizeRepository.createTransaction(
      this.options.database,
    );

    try {
      for (const id of ids) {
        await OrderRepository.destroy(id, {
          ...this.options,
          transaction,
        });
      }

      await SequelizeRepository.commitTransaction(
        transaction,
      );
    } catch (error) {
      await SequelizeRepository.rollbackTransaction(
        transaction,
      );
      throw error;
    }
  }

  async findById(id) {
    return OrderRepository.findById(id, this.options);
  }

  async findAllAutocomplete(search, limit) {
    return OrderRepository.findAllAutocomplete(
      search,
      limit,
      this.options,
    );
  }

  async findAndCountAll(args) {
    return OrderRepository.findAndCountAll(
      args,
      this.options,
    );
  }

  async import(data, importHash) {
    if (!importHash) {
      throw new Error400(
        this.options.language,
        'importer.errors.importHashRequired',
      );
    }

    if (await this._isImportHashExistent(importHash)) {
      throw new Error400(
        this.options.language,
        'importer.errors.importHashExistent',
      );
    }

    const dataToCreate = {
      ...data,
      importHash,
    };

    return this.create(dataToCreate);
  }

  async _isImportHashExistent(importHash) {
    const count = await OrderRepository.count(
      {
        importHash,
      },
      this.options,
    );

    return count > 0;
  }
}
