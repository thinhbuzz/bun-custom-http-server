export function json(data: any, statusCode?: number, message?: string) {
  return Response.json({
    data,
    message: message || '',
    statusCode: statusCode || 200,
  });
}

export function text(data: string, statusCode?: number) {
  return new Response(data, { status: statusCode });
}
