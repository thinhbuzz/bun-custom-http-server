import { text } from '../core/response-json.ts';
import { type Route } from '../core/Router.ts';

export const routes: Route[] = [
  {
    path: '/',
    handler: () => text('Hello, World!'),
  },
];
