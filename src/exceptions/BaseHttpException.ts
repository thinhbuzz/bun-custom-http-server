export abstract class BaseHttpException<T = any> extends Error {
  abstract statusCode: number;
  data?: T;
}
