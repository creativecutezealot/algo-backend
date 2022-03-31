import PermissionChecker from '../../services/user/permissionChecker';
import ApiResponseHandler from '../apiResponseHandler';
import Permissions from '../../security/permissions';
import AlgorandService from '../../services/algorandService';

export default async (req, res, next) => {
  try {
    const payload = await new AlgorandService(req).getLastUpdatedTime();

    await ApiResponseHandler.success(req, res, payload);
  } catch (error) {
    await ApiResponseHandler.error(req, res, error);
  }
};
