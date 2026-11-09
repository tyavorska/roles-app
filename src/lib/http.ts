import { ZodError } from 'zod'

export class HttpError extends Error {
  constructor(
    public status: 400 | 401 | 403 | 404 | 409,
    public code: string,
    message = code,
  ) {
    super(message)
  }
}

const json = (status: number, code: string, message: string) =>
  Response.json({ error: { code, message } }, { status })

function isCrossOrigin(request: Request): boolean {
  if (request.method === 'GET' || request.method === 'HEAD') return false
  const origin = request.headers.get('origin')
  if (!origin) return false
  try {
    return new URL(origin).host !== request.headers.get('host')
  } catch {
    return true
  }
}

export function route<C>(
  handler: (request: Request, ctx: C) => Promise<Response>,
) {
  return async (request: Request, ctx: C): Promise<Response> => {
    if (isCrossOrigin(request))
      return json(403, 'bad_origin', 'Cross-origin request rejected')
    try {
      return await handler(request, ctx)
    } catch (error) {
      if (error instanceof HttpError)
        return json(error.status, error.code, error.message)
      if (error instanceof ZodError)
        return json(
          400,
          'invalid_input',
          error.issues[0]?.message ?? 'Invalid input',
        )
      if (error instanceof SyntaxError)
        return json(400, 'invalid_json', 'Request body is not valid JSON')
      console.error(error)
      return json(500, 'internal', 'Something went wrong')
    }
  }
}
