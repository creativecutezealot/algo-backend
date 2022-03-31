import AuthService from '../services/auth/authService';
import ApiResponseHandler from '../api/apiResponseHandler';
import Error401 from '../errors/Error401';
import Error403 from '../errors/Error403';

/**
 * Authenticates and fills the request with the user if it exists.
 * If no token is passed, it continues the request but without filling the currentUser.
 * If userAutoAuthenticatedEmailForTests exists and no token is passed, it fills with this user for tests.
 */
export async function authMiddleware(req, res, next) {
  const isTokenEmpty =
    (!req.headers.authorization ||
      !req.headers.authorization.startsWith('Bearer ')) &&
    !(req.cookies && req.cookies.__session);

  let idToken;
  if (isTokenEmpty) {
    if (req.url.includes('/auth')) {
      return next();
    } else {
      await ApiResponseHandler.error(
        req,
        res,
        new Error403(),
      );
      return;
    }
  }

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    // Read the ID Token from the Authorization header.
    idToken = req.headers.authorization.split('Bearer ')[1];
  } else if (req.cookies) {
    // Read the ID Token from cookie.
    idToken = req.cookies.__session;
  } else {
    await ApiResponseHandler.error(
      req,
      res,
      new Error403(),
    );
    return;
  }

  try {
    const currentUser: any = await AuthService.findByToken(
      idToken,
      req,
    );

    req.currentUser = currentUser;

    return next();
  } catch (error) {
    console.error(error);
    await ApiResponseHandler.error(
      req,
      res,
      new Error401(),
    );
  }
}
