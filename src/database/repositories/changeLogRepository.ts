import SequelizeRepository from '../../database/repositories/sequelizeRepository';
import SequelizeFilterUtils from '../../database/utils/sequelizeFilterUtils';
import Sequelize from 'sequelize';
import Error404 from '../../errors/Error404';
import { IRepositoryOptions } from './IRepositoryOptions';

const Op = Sequelize.Op;

export default class ChangeLogRepository {

  static async createLog(data, options: IRepositoryOptions) {

    const transaction = SequelizeRepository.getTransaction(
      options,
    );

    const log = await options.database.changeLog.create(
      data,
      { transaction },
    );

    return log;
  }

  static async updateLog(id, data, options: IRepositoryOptions) {
    const transaction = SequelizeRepository.getTransaction(
      options,
    );

    const log = await options.database.changeLog.findByPk(id, {
      transaction,
    });

    await log.update(data, { transaction });

    return this.findById(id, options);

  }

  static async deleteLog(ids, options: IRepositoryOptions) {
    const transaction = SequelizeRepository.getTransaction(
      options,
    );

    await Promise.all(
      ids.map(async (id) => {
        let changeLog = await options.database.changeLog.findByPk(id, {
          transaction,
        });
        await changeLog.destroy({ transaction });
      })
    );
    return this.getLogs(options);
  }

  static async getLogs(options: IRepositoryOptions) {
    return options.database.changeLog.findAndCountAll({
      order: [['date', 'DESC']],
    });
  }

  static async findById(id, options: IRepositoryOptions) {
    const transaction = SequelizeRepository.getTransaction(
      options,
    );

    let record = await options.database.changeLog.findByPk(id, {
      transaction,
    });

    if (!record) {
      throw new Error404();
    }

    return record;
  }

}
