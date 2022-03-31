import PermissionChecker from '../../services/user/permissionChecker';
import ApiResponseHandler from '../../api/apiResponseHandler';
import ChangeLogRepository from '../../database/repositories/changeLogRepository';
import Permissions from '../../security/permissions';

export default async (req, res, next) => {
  try {
    new PermissionChecker(req).validateHas(
      Permissions.values.changeLogRead,
    );

    const payload = await ChangeLogRepository.findById(
      req.params.logId,
      req,
    );

    await ApiResponseHandler.success(req, res, payload);
  } catch (error) {
    await ApiResponseHandler.error(req, res, error);
  }
};
