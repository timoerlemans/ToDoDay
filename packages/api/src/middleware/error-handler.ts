import type { FastifyError, FastifyReply, FastifyRequest } from 'fastify';

export interface ApiError extends Error {
  statusCode?: number;
  code?: string;
}

export function errorHandler(
  error: FastifyError,
  _request: FastifyRequest,
  reply: FastifyReply
): void {
  const statusCode = error.statusCode ?? 500;
  const message = statusCode === 500 ? 'Internal Server Error' : error.message;

  reply.status(statusCode).send({
    error: {
      message,
      code: error.code,
      statusCode,
    },
  });
}

export function createError(message: string, statusCode: number, code?: string): ApiError {
  const error: ApiError = new Error(message);
  error.statusCode = statusCode;
  error.code = code;
  return error;
}

export const HttpError = {
  badRequest: (message: string) => createError(message, 400, 'BAD_REQUEST'),
  unauthorized: (message: string = 'Unauthorized') => createError(message, 401, 'UNAUTHORIZED'),
  forbidden: (message: string = 'Forbidden') => createError(message, 403, 'FORBIDDEN'),
  notFound: (message: string = 'Not found') => createError(message, 404, 'NOT_FOUND'),
  conflict: (message: string) => createError(message, 409, 'CONFLICT'),
  internal: (message: string = 'Internal server error') => createError(message, 500, 'INTERNAL'),
};
