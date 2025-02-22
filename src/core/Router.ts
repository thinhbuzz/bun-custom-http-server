import type { BunRequest, RouterTypes, Server } from 'bun';
import type { ParsedUrlQuery } from 'querystring';
import { parse } from 'querystring';
import { Struct, validate } from 'superstruct';
import { DataInvalidException } from '../exceptions/DataInvalidException.ts';
import { ForbiddenException } from '../exceptions/ForbiddenException.ts';

export async function checkCanAccess(
  request: Request,
  route: ParsedRoute,
  params: Map<string, string> | undefined,
): Promise<boolean> {
  if (route.accessValidators) {
    for (const accessValidator of route.accessValidators) {
      if (!await accessValidator(request, route, params)) {
        return false;
      }
    }
  }
  if (route.parent) {
    if (!await checkCanAccess(request, route.parent, params)) {
      return false;
    }
  }
  return true;
}

export function buildRouterContext(routerContext: RouteContext): RouteContext {
  return {
    ...routerContext,
    get query() {
      return parse(routerContext.request.url.split('?')[1]);
    },
  };
}

export interface PaginationParams {
  offset: number;
  limit: number;
}

export function parsePaginationParams(query?: ParsedUrlQuery): PaginationParams {
  const offset = Number(query?.offset) || 0;
  const limit = Number(query?.limit) || 10;
  return { offset: offset < 0 ? 0 : offset, limit: limit < 0 || limit > 3000 ? 10 : limit };
}

export interface ParsedRoute extends Route {
  parent?: Route;
}

export interface Route {
  path: string;
  handler?: (context: RouteContext) => Response | Promise<Response>;
  method?: HttpMethods;
  children?: Route[];
  schema?: Struct<any>;
  accessValidators?: ((
    request: Request,
    route: ParsedRoute,
    params: Map<string, string> | undefined,
  ) => boolean | Promise<boolean>)[];
}

export interface RouteContext<Body = any> {
  request: Request,
  server: Server,
  params: Map<string, string>,
  body?: Body,
  query?: ParsedUrlQuery,
}

export enum HttpMethods {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
  PATCH = 'PATCH',
  HEAD = 'HEAD',
  OPTIONS = 'OPTIONS',
}

export function wrapRoutes(
  routes: ParsedRoute[],
  prefix = '',
  parent?: ParsedRoute,
  output?: Record<string, Record<string, RouterTypes.RouteValue<string>>>,
): Record<string, Record<string, RouterTypes.RouteValue<string>>> {
  return routes.reduce((acc, route) => {
    const key = (prefix + route.path);
    if (parent) {
      route.parent = parent;
    }
    if (route.children?.length) {
      acc = wrapRoutes(route.children, key, route, acc);
    } else {
      if (!acc[key]) {
        acc[key] = {};
      }
      const method = (route.method || HttpMethods.GET) as string;
      acc[key][method] = createRouteWrapper(route) as any;
    }
    return acc;
  }, (output || {}) as Record<string, Record<string, RouterTypes.RouteValue<string>>>);
}

export function createRouteWrapper(route: Route) {
  return async function handleWrapper(request: BunRequest, server: Server) {
    const params = new Map<string, string>(Object.entries(request.params));
    if (!await checkCanAccess(request, route, params)) {
      throw new ForbiddenException();
    }
    if (route.schema) {
      const body = await request.json();
      const [error, validData] = validate(body, route.schema);
      if (error) {
        throw new DataInvalidException(error);
      }
      return route.handler!(buildRouterContext({ request, server, params: params!, body: validData }));
    }
    return route.handler!(buildRouterContext({ request, server, params: params! }));
  };

}
