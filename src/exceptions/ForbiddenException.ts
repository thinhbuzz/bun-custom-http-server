import { BaseHttpException } from './BaseHttpException.ts';

export class ForbiddenException extends BaseHttpException {
  statusCode = 403;

  constructor(message = 'Forbidden') {
    super(message);
  }
}
