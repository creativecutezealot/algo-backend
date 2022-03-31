import ApiResponseHandler from '../apiResponseHandler';
import AuthService from '../../services/auth/authService';

export default async (req, res, next) => {
  try {
    const redis = req.redis;
    const userTerm = JSON.stringify({
      email: req.body.email,
      password: req.body.password,
      address: req.body.address,
      invitattionToken: req.body.invitationToken,
      tenantId: req.body.tenantId
    });
    const data = await redis.get(userTerm);
    
    if (!data) {
      const payload = await AuthService.signin(
        req.body.email,
        req.body.password,
        req.body.address,
        req.body.invitationToken,
        req.body.tenantId,
        req,
      );
      await redis.setEx(userTerm, 600, JSON.stringify(payload))
      await ApiResponseHandler.success(req, res, payload);
    } else {
      await ApiResponseHandler.success(req, res, JSON.parse(data));
    }
  } catch (error) {
    await ApiResponseHandler.error(req, res, error);
  }
};
