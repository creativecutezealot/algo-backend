import PermissionChecker from '../../services/user/permissionChecker';
import ApiResponseHandler from '../apiResponseHandler';
import Permissions from '../../security/permissions';
import AlgorandService from '../../services/algorandService';

export default async (req, res, next) => {
  try {
    new PermissionChecker(req).validateHas(
      Permissions.values.algorandFavoriteToggle,
    );
    const redis = req.redis;
    const algorandTerm1 = req.body.data.type === 1 ? JSON.stringify({
      getAlgoOverview: 'getAlgoOverview',
      type: req.body.data.type.toString(),
      currentTenant: req.currentTenant.id,
      currentUser: req.currentUser.id
    }) : JSON.stringify({
      getAlgoOverview: 'getAlgoOverview',
      type: req.body.data.type.toString()
    });

    const algorandTerm2 = req.body.data.type === 1 ? JSON.stringify({
      getAlgoFavoriteList: 'getAlgoFavoriteList',
      type: req.body.data.type.toString(),
      currentTenant: req.currentTenant.id,
      currentUser: req.currentUser.id
    }) : JSON.stringify({
      getAlgoFavoriteList: 'getAlgoFavoriteList',
      type: req.body.data.type.toString()
    });

    const algorandTerm3 = req.body.data.type === 1 ? JSON.stringify({
      getAlgoAssetList: 'getAlgoAssetList',
      type: req.body.data.type.toString(),
      currentTenant: req.currentTenant.id,
      currentUser: req.currentUser.id
    }) : JSON.stringify({
      getAlgoAssetList: 'getAlgoAssetList',
      type: req.body.data.type.toString()
    });

    const keys = [algorandTerm1, algorandTerm2, algorandTerm3];
    await redis.del(keys);

    const payload = await new AlgorandService(req).putAlgoFavorite(
      req.params.assetId, req.body.data
    );
    await ApiResponseHandler.success(req, res, payload);
  } catch (error) {
    await ApiResponseHandler.error(req, res, error);
  }
};
