import { StructError } from 'superstruct';
import { BaseHttpException } from './BaseHttpException.ts';

export class DataInvalidException extends BaseHttpException<StructError> {
  statusCode = 400;

  constructor(public data: StructError, message = 'Data is not valid') {
    super(message);
  }
}
