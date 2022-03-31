import PermissionChecker from '../../services/user/permissionChecker';
import ApiResponseHandler from '../apiResponseHandler';
import Permissions from '../../security/permissions';
import AlgorandService from '../../services/algorandService';

export default async (req, res, next) => {
  try {
    new PermissionChecker(req).validateHas(
      Permissions.values.algorandRead,
    );
    // const redis = req.redis;
    // const algorandTerm = JSON.stringify({
    //   getAlgoAsset: 'getAlgoAsset',
    //   currentTenant: req.currentTenant.id,
    //   currentUser: req.currentUser.id
    // })
    // const data = await redis.get(algorandTerm);
    // if (!data) {
      const payload = await new AlgorandService(req).getAlgoAsset(
        req.params.assetId,
        req.query,
      );
      // await redis.setEx(algorandTerm, 1200, JSON.stringify(payload));
      await ApiResponseHandler.success(req, res, payload);
    // } else {
    //   await ApiResponseHandler.success(req, res, JSON.parse(data));
    // }
  } catch (error) {
    await ApiResponseHandler.error(req, res, error);
  }
};
