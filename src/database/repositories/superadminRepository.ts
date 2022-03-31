import Sequelize from 'sequelize';
import SequelizeRepository from '../../database/repositories/sequelizeRepository';
import AuditLogRepository from './auditLogRepository';
import SequelizeFilterUtils from '../../database/utils/sequelizeFilterUtils';
import { IRepositoryOptions } from './IRepositoryOptions';
import Error404 from '../../errors/Error404';
import { v4 as uuid } from 'uuid';
import lodash from 'lodash';
import Error400 from '../../errors/Error400';
import UserRepository from './userRepository';
import crypto from 'crypto';
import Error401 from '../../errors/Error401';
import { getConfig } from '../../config';
import _get from 'lodash/get';

const Op = Sequelize.Op;

export default class SuperadminRepository {
  static async fetchAllUsers(
    { filter, limit = 0, offset = 0, orderBy = '' },
    options: IRepositoryOptions,
  ) {
    const transaction = SequelizeRepository.getTransaction(
      options,
    );

    let whereAnd: Array<any> = [];
    let include: any = [];

    whereAnd.push({
      ['superadmin']: false,
    });

    if (filter) {
      if (filter.id) {
        whereAnd.push({
          ['id']: filter.id,
        });
      }

      if (filter.fullName) {
        whereAnd.push(
          SequelizeFilterUtils.ilikeIncludes(
            'user',
            'fullName',
            filter.fullName,
          ),
        );
      }

      if (filter.email) {
        whereAnd.push(
          SequelizeFilterUtils.ilikeIncludes(
            'user',
            'email',
            filter.email,
          ),
        );
      }

      if (filter.active !== null && filter.active !== '') {
        whereAnd.push({
          ['active']: filter.active
        });
      }
    }

    const where = { [Op.and]: whereAnd };

    let {
      rows,
      count,
    } = await options.database.user.findAndCountAll({
      where,
      include,
      limit: limit ? Number(limit) : undefined,
      offset: offset ? Number(offset) : undefined,
      order: orderBy
        ? [orderBy.split('_')]
        : [['email', 'ASC']],
      transaction,
    });

    return { rows, count };
  }

  static async updateUserStatus(
    id,
    options: IRepositoryOptions,
  ) {
    const transaction = SequelizeRepository.getTransaction(
      options
    );

    const user = await options.database.user.findByPk(id, {
      transaction,
    });

    const userStatus = user.active;

    await user.update(
      {
        active: !userStatus,
      },
      { transaction },
    );

    await AuditLogRepository.log(
      {
        entityName: 'user',
        entityId: id,
        action: AuditLogRepository.UPDATE,
        values: {
          id,
          active: !userStatus,
        },
      },
      options,
    );

    return user;
  }

  static async deleteUser(
    id,
    options: IRepositoryOptions,
  ) {
    const transaction = SequelizeRepository.getTransaction(
      options
    );

    const user = await options.database.user.findByPk(id, {
      transaction,
    });

    if (!user) {
      throw new Error404();
    }

    await user.destroy({
      transaction,
    });

    return user;
  }

  static async fetchAllTenants(
    { filter, limit = 0, offset = 0, orderBy = '' },
    options: IRepositoryOptions,
  ) {
    const transaction = SequelizeRepository.getTransaction(
      options,
    );

    let whereAnd: Array<any> = [];
    let include: any = [];

    whereAnd.push({
      ['createdBySuperadmin']: false,
    });

    if (filter) {
      if (filter.id) {
        whereAnd.push({
          ['id']: filter.id,
        });
      }

      if (filter.name) {
        whereAnd.push(
          SequelizeFilterUtils.ilikeIncludes(
            'tenant',
            'name',
            filter.name,
          ),
        );
      }
    }

    const where = { [Op.and]: whereAnd };

    let {
      rows,
      count,
    } = await options.database.tenant.findAndCountAll({
      where,
      include,
      limit: limit ? Number(limit) : undefined,
      offset: offset ? Number(offset) : undefined,
      order: orderBy
        ? [orderBy.split('_')]
        : [['name', 'ASC']],
      transaction,
    });

    return { rows, count };
  }

  static async findTenantById(id, options: IRepositoryOptions) {
    const transaction = SequelizeRepository.getTransaction(
      options,
    );

    const record = await options.database.tenant.findByPk(
      id,
      {
        transaction,
      },
    );

    return record;
  }

  static async destroyTenantById(id, options: IRepositoryOptions) {
    const transaction = SequelizeRepository.getTransaction(
      options,
    );

    const currentUser = SequelizeRepository.getCurrentUser(
      options,
    );

    let record = await options.database.tenant.findByPk(
      id,
      {
        transaction,
      },
    );

    if (!currentUser.superadmin) {
      throw new Error404();
    }

    await record.destroy({
      transaction,
    });

    await this._createTenantAuditLog(
      AuditLogRepository.DELETE,
      record,
      record,
      options,
    );
  }

  static async _createTenantAuditLog(
    action,
    record,
    data,
    options: IRepositoryOptions,
  ) {
    let values = {};

    if (data) {
      values = {
        ...record.get({ plain: true }),
      };
    }

    await AuditLogRepository.log(
      {
        entityName: 'tenant',
        entityId: record.id,
        action,
        values,
      },
      options,
    );
  }

  static async createUser(email, options: IRepositoryOptions) {
    const transaction = SequelizeRepository.getTransaction(
      options,
    );

    let user = await options.database.user.findOne({
      where: {
        [Op.and]: SequelizeFilterUtils.ilikeExact(
          'user',
          'email',
          email,
        ),
      },
      transaction,
    });

    if (!user) {
      user = await UserRepository.create(
        {
          email,
          active: true
        },
        {
          ...options,
          transaction,
        },
      );
    }

    return user;
  }

  static async createTenant(data, options: IRepositoryOptions) {
    const forbiddenTenantUrls = ['www'];
    
    const currentUser = SequelizeRepository.getCurrentUser(
      options,
    );

    const transaction = SequelizeRepository.getTransaction(
      options,
    );

    // URL is required,
    // in case of multi tenant without subdomain
    // set a random uuid
    data.url = data.url || uuid();

    const existsUrl = Boolean(
      await options.database.tenant.count({
        where: { url: data.url },
        transaction,
      }),
    );

    if (
      forbiddenTenantUrls.includes(data.url) ||
      existsUrl
    ) {
      throw new Error400(
        options.language,
        'tenant.url.exists',
      );
    }

    const record = await options.database.tenant.create(
      {
        ...lodash.pick(data, [
          'id',
          'name',
          'url',
          'importHash',
        ]),
        createdById: currentUser.id,
        updatedById: currentUser.id,
      },
      {
        transaction,
      },
    );

    await this._createTenantAuditLog(
      AuditLogRepository.CREATE,
      record,
      data,
      {
        ...options,
        currentTenant: record,
      },
    );

    return record;
  }

  static async createTenantUser(
    tenant,
    user,
    roles,
    options: IRepositoryOptions,
  ) {
    roles = roles || [];
    const transaction = SequelizeRepository.getTransaction(
      options,
    );

    const status = 'invited';

    const tenantUser = await options.database.tenantUser.create(
      {
        tenantId: tenant.id,
        userId: user.id,
        status,
        invitationToken: crypto
          .randomBytes(20)
          .toString('hex'),
        roles,
      },
      { transaction },
    );

    await AuditLogRepository.log(
      {
        entityName: 'user',
        entityId: user.id,
        action: AuditLogRepository.CREATE,
        values: {
          email: user.email,
          status,
          roles,
        },
      },
      options,
    );

    return tenantUser;
  }

  static async fetchAnalytics(
    options: IRepositoryOptions,
  ) {
    const transaction = SequelizeRepository.getTransaction(
      options,
    );

    let whereAnd: Array<any> = [];
    whereAnd.push({
      ['superadmin']: false,
    });

    let where = { [Op.and]: whereAnd };

    const userCount = await options.database.user.count({
      where,
      transaction,
    });

    whereAnd = [];
    whereAnd.push({
      ['createdBySuperadmin']: false,
    });

    where = { [Op.and]: whereAnd };

    const tenantCount = await options.database.tenant.count({
      where,
      transaction,
    });

    return { userCount, tenantCount };
  }

  static async cancelSubscription(
    tenantId,
    options: IRepositoryOptions,
  ) {
    const transaction = SequelizeRepository.getTransaction(
      options,
    );

    const tenant = await options.database.tenant.findByPk(
      tenantId,
      {
        transaction,
      },
    );

    if (!tenant) {
      throw new Error401();
    }

    const planSubscriptionId = tenant.planSubscriptionId;

    if (!getConfig().PLAN_STRIPE_SECRET_KEY) {
      throw new Error400(
        options.language,
        'tenant.stripeNotConfigured',
      );
    }

    const stripe = require('stripe')(
      getConfig().PLAN_STRIPE_SECRET_KEY,
    );

    await stripe.subscriptions.update(planSubscriptionId, {cancel_at_period_end: true});

    return true;
  }

  static async getSettings(
    options: IRepositoryOptions,
  ) {
    const transaction = SequelizeRepository.getTransaction(
      options,
    );

    const currentUser = SequelizeRepository.getCurrentUser(
      options,
    );

    const tenantUser = currentUser.tenants[0];
    if (!tenantUser) {
      throw new Error401();
    }

    const tenant = tenantUser.tenant;
    if (!tenant) {
      throw new Error401();
    }

    const settings = await options.database.settings.findByPk(
      tenant.id,
      {
        transaction,
      }
    );

    if (settings) {
      return {
        theme: settings.theme,
      };
    }
    
    return {
      theme: 'default',
    };
  }

  static async saveSettings(data, options: IRepositoryOptions) {
    const transaction = SequelizeRepository.getTransaction(
      options,
    );

    const currentUser = SequelizeRepository.getCurrentUser(
      options,
    );

    const tenantUser = currentUser.tenants[0];
    if (!tenantUser) {
      throw new Error401();
    }

    const tenant = tenantUser.tenant;
    if (!tenant) {
      throw new Error401();
    }

    const [
      settings,
    ] = await options.database.settings.findOrCreate({
      where: { id: tenant.id, createdById: currentUser.id },
      defaults: {
        ...data,
        id: tenant.id,
        tenantId: tenant.id,
        createdById: currentUser.id,
      },
      transaction,
    });

    await settings.update(data, {
      transaction,
    });

    await AuditLogRepository.log(
      {
        entityName: 'settings',
        entityId: settings.id,
        action: AuditLogRepository.UPDATE,
        values: data,
      },
      options,
    );

    return settings;
  }
}
