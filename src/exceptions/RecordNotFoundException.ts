import { BaseHttpException } from './BaseHttpException.ts';

export class RecordNotFoundException extends BaseHttpException {
  statusCode = 404;

  constructor(message = 'Record not found') {
    super(message);
    this.name = 'RecordNotFoundException';
  }
}
