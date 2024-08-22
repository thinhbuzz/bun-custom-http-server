import { BaseHttpException } from './BaseHttpException.ts';

export class InternalServerErrorException extends BaseHttpException {
  statusCode = 500;

  constructor(message = 'Internal server error') {
    super(message);
    this.name = 'InternalServerErrorException';
  }
}
