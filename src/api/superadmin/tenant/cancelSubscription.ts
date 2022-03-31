import ApiResponseHandler from '../../apiResponseHandler';
import Error403 from '../../../errors/Error403';
import PermissionChecker from '../../../services/user/permissionChecker';
import Permissions from '../../../security/permissions';
import SuperadminService from '../../../services/superadminService';

export default async (req, res, next) => {
  try {
    if (!req.currentUser || !req.currentUser.id) {
      throw new Error403(req.language);
    }

    new PermissionChecker(req).validateHas(
      Permissions.values.subscriptionCancelSuperadmin,
    );

    const payload = await new SuperadminService(req).cancelSubscription(
      req.body.tenantId,
    );

    await ApiResponseHandler.success(req, res, payload);
  } catch (error) {
    await ApiResponseHandler.error(req, res, error);
  }
};
