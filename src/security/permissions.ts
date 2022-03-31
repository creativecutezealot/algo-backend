import Roles from './roles';
import Plans from './plans';
import Storage from './storage';

const storage = Storage.values;
const roles = Roles.values;
const plans = Plans.values;

class Permissions {
  static get values() {
    return {
      tenantEdit: {
        id: 'tenantEdit',
        allowedRoles: [roles.admin],
        allowedPlans: [
          plans.free,
          plans.growth,
          plans.enterprise,
        ],
      },
      tenantDestroy: {
        id: 'tenantDestroy',
        allowedRoles: [roles.admin],
        allowedPlans: [
          plans.free,
          plans.growth,
          plans.enterprise,
        ],
      },
      planEdit: {
        id: 'planEdit',
        allowedRoles: [roles.admin],
        allowedPlans: [
          plans.free,
          plans.growth,
          plans.enterprise,
        ],
      },
      planRead: {
        id: 'planRead',
        allowedRoles: [roles.admin],
        allowedPlans: [
          plans.free,
          plans.growth,
          plans.enterprise,
        ],
      },
      userEdit: {
        id: 'userEdit',
        allowedRoles: [roles.admin],
        allowedPlans: [
          plans.free,
          plans.growth,
          plans.enterprise,
        ],
      },
      userDestroy: {
        id: 'userDestroy',
        allowedRoles: [roles.admin],
        allowedPlans: [
          plans.free,
          plans.growth,
          plans.enterprise,
        ],
      },
      userCreate: {
        id: 'userCreate',
        allowedRoles: [roles.admin],
        allowedPlans: [
          plans.free,
          plans.growth,
          plans.enterprise,
        ],
      },
      userImport: {
        id: 'userImport',
        allowedRoles: [roles.admin],
        allowedPlans: [
          plans.free,
          plans.growth,
          plans.enterprise,
        ],
      },
      userRead: {
        id: 'userRead',
        allowedRoles: [roles.admin],
        allowedPlans: [
          plans.free,
          plans.growth,
          plans.enterprise,
        ],
      },
      userAutocomplete: {
        id: 'userAutocomplete',
        allowedRoles: [roles.admin, roles.custom],
        allowedPlans: [
          plans.free,
          plans.growth,
          plans.enterprise,
        ],
      },
      auditLogRead: {
        id: 'auditLogRead',
        allowedRoles: [roles.admin],
        allowedPlans: [
          plans.free,
          plans.growth,
          plans.enterprise,
        ],
      },
      settingsEdit: {
        id: 'settingsEdit',
        allowedRoles: [roles.admin],
        allowedPlans: [
          plans.free,
          plans.growth,
          plans.enterprise,
        ],
        allowedStorage: [
          storage.settingsBackgroundImages,
          storage.settingsLogos,
        ],
      },
      customerImport: {
        id: 'customerImport',
        allowedRoles: [roles.admin],
        allowedPlans: [plans.free, plans.growth, plans.enterprise],
      },
      customerCreate: {
        id: 'customerCreate',
        allowedRoles: [roles.admin],
        allowedPlans: [plans.free, plans.growth, plans.enterprise],
        allowedStorage: [

        ],
      },
      customerEdit: {
        id: 'customerEdit',
        allowedRoles: [roles.admin],
        allowedPlans: [plans.free, plans.growth, plans.enterprise],
        allowedStorage: [

        ],
      },
      customerDestroy: {
        id: 'customerDestroy',
        allowedRoles: [roles.admin],
        allowedPlans: [plans.free, plans.growth, plans.enterprise],
        allowedStorage: [

        ],
      },
      customerRead: {
        id: 'customerRead',
        allowedRoles: [roles.admin, roles.custom],
        allowedPlans: [plans.free, plans.growth, plans.enterprise],
      },
      customerAutocomplete: {
        id: 'customerAutocomplete',
        allowedRoles: [roles.admin, roles.custom],
        allowedPlans: [plans.free, plans.growth, plans.enterprise],
      },

      productImport: {
        id: 'productImport',
        allowedRoles: [roles.admin],
        allowedPlans: [plans.free, plans.growth, plans.enterprise],
      },
      productCreate: {
        id: 'productCreate',
        allowedRoles: [roles.admin],
        allowedPlans: [plans.free, plans.growth, plans.enterprise],
        allowedStorage: [
          storage.productPhotos,
        ],
      },
      productEdit: {
        id: 'productEdit',
        allowedRoles: [roles.admin],
        allowedPlans: [plans.free, plans.growth, plans.enterprise],
        allowedStorage: [
          storage.productPhotos,
        ],
      },
      productDestroy: {
        id: 'productDestroy',
        allowedRoles: [roles.admin],
        allowedPlans: [plans.free, plans.growth, plans.enterprise],
        allowedStorage: [
          storage.productPhotos,
        ],
      },
      productRead: {
        id: 'productRead',
        allowedRoles: [roles.admin, roles.custom],
        allowedPlans: [plans.free, plans.growth, plans.enterprise],
      },
      productAutocomplete: {
        id: 'productAutocomplete',
        allowedRoles: [roles.admin, roles.custom],
        allowedPlans: [plans.free, plans.growth, plans.enterprise],
      },

      orderImport: {
        id: 'orderImport',
        allowedRoles: [roles.admin],
        allowedPlans: [plans.free, plans.growth, plans.enterprise],
      },
      orderCreate: {
        id: 'orderCreate',
        allowedRoles: [roles.admin],
        allowedPlans: [plans.free, plans.growth, plans.enterprise],
        allowedStorage: [
          storage.orderAttachments,
        ],
      },
      orderEdit: {
        id: 'orderEdit',
        allowedRoles: [roles.admin],
        allowedPlans: [plans.free, plans.growth, plans.enterprise],
        allowedStorage: [
          storage.orderAttachments,
        ],
      },
      orderDestroy: {
        id: 'orderDestroy',
        allowedRoles: [roles.admin],
        allowedPlans: [plans.free, plans.growth, plans.enterprise],
        allowedStorage: [
          storage.orderAttachments,
        ],
      },
      orderRead: {
        id: 'orderRead',
        allowedRoles: [roles.admin, roles.custom],
        allowedPlans: [plans.free, plans.growth, plans.enterprise],
      },
      orderAutocomplete: {
        id: 'orderAutocomplete',
        allowedRoles: [roles.admin, roles.custom],
        allowedPlans: [plans.free, plans.growth, plans.enterprise],
      },
      algorandRead: {
        id: 'algorandRead',
        allowedRoles: [roles.admin, roles.custom, roles.beta, roles.superadmin],
        allowedPlans: [plans.free, plans.growth, plans.enterprise],
      },
      algorandFavoriteToggle: {
        id: 'algorandFavoriteToggle',
        allowedRoles: [roles.admin, roles.custom, roles.superadmin],
        allowedPlans: [plans.free, plans.growth, plans.enterprise],
      },
      algorandSetShowcase: {
        id: 'algorandSetShowcase',
        allowedRoles: [roles.admin, roles.custom, roles.superadmin],
        allowedPlans: [plans.free, plans.growth, plans.enterprise],
      },
      userReadSuperadmin: {
        id: 'userReadSuperadmin',
        allowedRoles: [roles.superadmin],
        allowedPlans: [],
      },
      userUpdateSuperadmin: {
        id: 'userUpdateSuperadmin',
        allowedRoles: [roles.superadmin],
        allowedPlans: [],
      },

      tenantReadSuperadmin: {
        id: 'tenantReadSuperadmin',
        allowedRoles: [roles.superadmin],
        allowedPlans: [],
      },
      tenantCreateSuperadmin: {
        id: 'tenantCreateSuperadmin',
        allowedRoles: [roles.superadmin],
        allowedPlans: [],
      },
      tenantDestroySuperadmin: {
        id: 'tenantDestroySuperadmin',
        allowedRoles: [roles.superadmin],
        allowedPlans: [],
      },
      analyticsFetchSuperadmin: {
        id: 'analyticsFetchSuperadmin',
        allowedRoles: [roles.superadmin],
        allowedPlans: [],
      },
      subscriptionCancelSuperadmin: {
        id: 'subscriptionCancelSuperadmin',
        allowedRoles: [roles.superadmin],
        allowedPlans: [],
      },
      settingsReadSuperadmin: {
        id: 'settingsReadSuperadmin',
        allowedRoles: [roles.superadmin],
        allowedPlans: [],
      },
      settingsEditSuperadmin: {
        id: 'settingsEditSuperadmin',
        allowedRoles: [roles.superadmin],
        allowedPlans: [],
      },
      assetUpdateSuperadmin: {
        id: 'assetUpdateSuperadmin',
        allowedRoles: [roles.superadmin],
        allowedPlans: [],
      },
      changeLogRead: {
        id : 'changeLogRead',
        allowedRoles: [roles.superadmin, roles.admin, roles.custom],
        allowedPlans: [plans.free, plans.growth, plans.enterprise]
      },
      changeLogEdit: {
        id : 'changeLogEdit',
        allowedRoles: [roles.superadmin],
        allowedPlans: []
      },
    };
  }

  static get asArray() {
    return Object.keys(this.values).map((value) => {
      return this.values[value];
    });
  }
}

export default Permissions;
