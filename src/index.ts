import { isDebug } from './constants.ts';
import { json } from './core/response.ts';
import { wrapRoutes } from './core/Router.ts';
import { BaseHttpException } from './exceptions/BaseHttpException.ts';
import { routes } from './routes/routes.ts';

const server = Bun.serve({
  port: process.env.PORT || 8080,
  development: isDebug,
  reusePort: true,
  routes: wrapRoutes(routes),
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
