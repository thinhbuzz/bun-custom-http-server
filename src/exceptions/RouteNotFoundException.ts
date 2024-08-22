import { BaseHttpException } from './BaseHttpException.ts';

export class RouteNotFoundException extends BaseHttpException {
  statusCode = 404;

  constructor(message = 'Route not found') {
    super(message);
    this.name = 'RouteNotFoundException';
  }
}
