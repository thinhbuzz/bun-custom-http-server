import type { Server } from 'bun';
import type { ParsedUrlQuery } from 'querystring';
import { parse } from 'querystring';
import { Struct } from 'superstruct';

export class Router {
  private readonly routes: ParsedRoute[];

  constructor(routes: Route[]) {
    this.routes = routes;
    compileRoutes(this.routes);
  }

  match(path: string, method: string): [ParsedRoute, Map<string, string>] | [] {
    if (path !== '/' && path.endsWith('/')) {
      path = path.slice(0, -1);
    }
    return matchRoutes(this.routes, path, method);
  }
}

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

function extractParams(paramNames: string[], match: RegExpMatchArray): Map<string, string> {
  return paramNames.reduce((acc, name, index) => {
    acc.set(name, match[index + 1]);
    return acc;
  }, new Map<string, string>());
}

function getRemainingPath(path: string, matchLength: number): string {
  const remainingPath = path.slice(matchLength) || '/';
  if (remainingPath === '/') {
    return remainingPath;
  }
  if (remainingPath.startsWith('/')) {
    return remainingPath;
  }
  return `/${remainingPath}`;
}

function matchRoutes(routes: ParsedRoute[], path: string, method: string): [ParsedRoute, Map<string, string>] | [] {
  for (const route of routes) {
    if (route.method !== HttpMethods.ANY && !route.children && (route.method || HttpMethods.GET) !== method) {
      continue;
    }

    const match = path.match(route.regex!);
    if (match) {
      const params = extractParams(route.paramNames!, match);
      if (route.children) {
        const remainingPath = getRemainingPath(path, match[0].length);
        const childMatch = matchRoutes(route.children, remainingPath, method);
        if (childMatch.length > 0) {
          return childMatch;
        }
      }

      if (!route.children || (route.children && match[0] === path)) {
        return [route, params];
      }
    }
  }
  return [];
}

function compileRoutes(routes: ParsedRoute[], parent?: Route): void {
  for (const route of routes) {
    route.parent = parent;
    const paramNames: string[] = [];
    route.regex = new RegExp(`^${route.path.replace(/:([^\/]+)/g, (_, key) => {
    paramNames.push(key);
    return '([^/]+)';
  })}(\/|$)`);
    route.paramNames = paramNames;

    if (route.children) {
      compileRoutes(route.children, route);
    }
  }
}

interface ParsedRoute extends Route {
  regex?: RegExp;
  paramNames?: string[];
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
  ANY = 'ANY',
}
