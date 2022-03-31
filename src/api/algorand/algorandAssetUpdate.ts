import PermissionChecker from '../../services/user/permissionChecker';
import ApiResponseHandler from '../apiResponseHandler';
import Permissions from '../../security/permissions';
import AlgorandService from '../../services/algorandService';

export default async (req, res, next) => {
  try {
    new PermissionChecker(req).validateHas(
      Permissions.values.assetUpdateSuperadmin,
    );
    const redis = req.redis;
    const algorandTerm = req.body.data.type === 1 ? JSON.stringify({
      getAlgoOverview: 'getAlgoOverview',
      type: req.body.data.type.toString(),
      currentTenant: req.currentTenant.id,
      currentUser: req.currentUser.id
    }) : JSON.stringify({
      getAlgoOverview: 'getAlgoOverview',
      type: req.body.data.type.toString()
    });
    await redis.del(algorandTerm);
    const payload = await new AlgorandService(req).updateAlgoAsset(
      req.params.assetId, req.body.data
    );
    await ApiResponseHandler.success(req, res, payload);
  } catch (error) {
    await ApiResponseHandler.error(req, res, error);
  }
};
