import { text } from '../core/response.ts';
import { type Route } from '../core/Router.ts';

export const routes: Route[] = [
  {
    path: '/',
    handler: () => text('Hello, World!'),
  },
];
