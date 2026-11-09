export class HttpError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message)
  }
}

export function errorResponse(error: unknown): Response {
  if (error instanceof HttpError) {
    return Response.json(
      { error: { code: error.code, message: error.message } },
      { status: error.status },
    )
  }
  console.error(error)
  return Response.json(
    { error: { code: 'internal', message: 'Something went wrong' } },
    { status: 500 },
  )
}
