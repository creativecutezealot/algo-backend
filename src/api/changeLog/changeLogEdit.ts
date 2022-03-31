import PermissionChecker from '../../services/user/permissionChecker';
import ApiResponseHandler from '../../api/apiResponseHandler';
import ChangeLogRepository from '../../database/repositories/changeLogRepository';
import Permissions from '../../security/permissions';

export default async (req, res, next) => {
  try {
    new PermissionChecker(req).validateHas(
      Permissions.values.changeLogEdit,
    );

    const payload = await ChangeLogRepository.updateLog(
      req.params.logId,
      req.body.data,
      req,
    );

    await ApiResponseHandler.success(req, res, payload);
  } catch (error) {
    await ApiResponseHandler.error(req, res, error);
  }
};
