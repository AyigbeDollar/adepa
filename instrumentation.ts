import { registerOTel, OTLPHttpProtoTraceExporter } from "@vercel/otel";

/**
 * OpenTelemetry → Honeycomb.
 *
 * Next.js calls register() once per server instance (Node and Edge). Its
 * built-in spans (route handlers, server actions, rendering, fetch) are
 * exported together with the custom spans in lib/telemetry.ts.
 *
 * Off unless HONEYCOMB_API_KEY is set, so demo mode and local dev send nothing.
 */
export function register() {
  const apiKey = process.env.HONEYCOMB_API_KEY;
  if (!apiKey) return;

  const endpoint = (
    process.env.HONEYCOMB_ENDPOINT ?? "https://api.honeycomb.io"
  ).replace(/\/$/, "");

  registerOTel({
    serviceName: process.env.OTEL_SERVICE_NAME ?? "adepa",
    attributes: {
      "deployment.environment":
        process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? "development",
      "service.version": process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? "local",
    },
    traceExporter: new OTLPHttpProtoTraceExporter({
      url: `${endpoint}/v1/traces`,
      headers: { "x-honeycomb-team": apiKey },
    }),
  });
}
