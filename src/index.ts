import { validate } from 'superstruct';
import { isDebug } from './constants.ts';
import { json } from './core/response-json.ts';
import { buildRouterContext, checkCanAccess, Router } from './core/Router.ts';
import { BaseHttpException } from './exceptions/BaseHttpException.ts';
import { DataInvalidException } from './exceptions/DataInvalidException.ts';
import { ForbiddenException } from './exceptions/ForbiddenException.ts';
import { RouteNotFoundException } from './exceptions/RouteNotFoundException.ts';
import { routes } from './routes/routes.ts';

const router = new Router(routes);
const server = Bun.serve({
  port: process.env.PORT || 8080,
  development: isDebug,
  reusePort: true,
  fetch: async (request, server) => {
    const url = new URL(request.url);
    const [route, params] = router.match(url.pathname, request.method);
    if (route?.handler) {
      if (!await checkCanAccess(request, route)) {
        throw new ForbiddenException();
      }
      if (route.schema) {
        const body = await request.json();
        const [error, validData] = validate(body, route.schema);
        if (error) {
          throw new DataInvalidException(error);
        }
        return route.handler(buildRouterContext({ request, server, params: params!, body: validData }));
      }
      return route.handler(buildRouterContext({ request, server, params: params! }));
    }
    throw new RouteNotFoundException();
  },
  error(error) {
    if (isDebug) {
      console.error(error);
    }
    if ((error as Error) instanceof BaseHttpException) {
      return json((error as BaseHttpException).data || null, (error as BaseHttpException).statusCode, error.message);
    }
    return json(null, 500, 'Internal server error');
  },
});
console.log(`Server running on port ${server.port}`);
