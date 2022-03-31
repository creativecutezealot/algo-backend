import Error403 from '../../../errors/Error403';
import ApiResponseHandler from '../../apiResponseHandler';
import PermissionChecker from '../../../services/user/permissionChecker';
import Permissions from '../../../security/permissions';
import SuperadminService from '../../../services/superadminService';

export default async (req, res, next) => {
  try {
    if (!req.currentUser || !req.currentUser.id) {
      throw new Error403(req.language);
    }

    new PermissionChecker(req).validateHas(
      Permissions.values.tenantDestroySuperadmin,
    );

    // In the case of the Tenant, specific permissions like tenantDestroy and tenantEdit are
    // checked inside the service
    await new SuperadminService(req).destroyTenants(req.query.ids);

    const payload = true;

    await ApiResponseHandler.success(req, res, payload);
  } catch (error) {
    await ApiResponseHandler.error(req, res, error);
  }
};
