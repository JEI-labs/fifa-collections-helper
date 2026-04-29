import { NextResponse, type NextRequest } from "next/server";

export interface ApiControllerResponse<TBody> {
  body: TBody;
  status?: number;
  headers?: Record<string, string>;
}

// Tipo genérico do controller
export type NextContextRequest = { params: Promise<Record<string, string>> };

type Controller<TBody> = (
  req: NextRequest,
  context: NextContextRequest,
) => Promise<ApiControllerResponse<TBody>>;

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS, PATCH",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, X-Checkout-Token, X-Web-Locale",
};

export function handleApiRequest<TBody>(controller: Controller<TBody>) {
  return async (req: NextRequest, context: any) => {
    try {
      const response = await controller(req, context as NextContextRequest);

      return NextResponse.json(response.body, {
        status: response.status ?? 200,
        headers: {
          ...corsHeaders,
          ...(response.headers ?? {}),
        },
      });
    } catch (error: any) {
      console.error("API Error:", error, "Request:", req);
      return NextResponse.json(
        { message: (error as any).message },
        { status: 500, headers: corsHeaders },
      );
    }
  };
}
