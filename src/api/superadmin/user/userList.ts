import PermissionChecker from '../../../services/user/permissionChecker';
import ApiResponseHandler from '../../apiResponseHandler';
import Permissions from '../../../security/permissions';
import SuperadminService from '../../../services/superadminService';

export default async (req, res) => {
  try {
    new PermissionChecker(req).validateHas(
      Permissions.values.userReadSuperadmin,
    );

    const payload = await new SuperadminService(
      req
    ).fetchAllUsers(req.query);

    await ApiResponseHandler.success(req, res, payload);
  } catch (error) {
    await ApiResponseHandler.error(req, res, error);
  }
};
