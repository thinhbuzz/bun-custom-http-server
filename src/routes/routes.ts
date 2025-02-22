import { text } from '../core/response.ts';
import { HttpMethods, type Route } from '../core/Router.ts';

export const routes: Route[] = [
  {
    path: '/',
    handler: () => text('Hello, World!'),
  },
  {
    path: '/query',
    method: HttpMethods.POST,
    handler: () => text('Hello, World!'),
  },
  {
    path: '/:username',
    children: [
      {
        path: '/a',
        handler: (req) => text(`Hello from a! - ${req.params.get('username')}`),
      },
      {
        path: '/b',
        children: [
          {
            path: '/c',
            handler: () => text('Hello from b/c!'),
          },
        ],
      },
    ],
  },
];

