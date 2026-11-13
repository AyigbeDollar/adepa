import {
  trace,
  SpanStatusCode,
  type Attributes,
  type Span,
} from "@opentelemetry/api";

/**
 * Small helpers for business-level tracing. They are safe no-ops when
 * OpenTelemetry is not registered (no HONEYCOMB_API_KEY).
 *
 * Never put customer PII (name, phone, email, address) in attributes.
 */
const tracer = trace.getTracer("adepa");

/** Run `fn` inside a child span; marks the span as an error if it throws. */
export async function withSpan<T>(
  name: string,
  attributes: Attributes,
  fn: (span: Span) => Promise<T>
): Promise<T> {
  return tracer.startActiveSpan(name, { attributes }, async (span) => {
    try {
      return await fn(span);
    } catch (err) {
      recordError(span, err, `${name}.failed`);
      throw err;
    } finally {
      span.end();
    }
  });
}

/** Add attributes to whatever span is active (e.g. the route-handler span). */
export function annotate(attributes: Attributes): void {
  trace.getActiveSpan()?.setAttributes(attributes);
}

/**
 * Mark the active span as failed with a stable, groupable slug
 * (e.g. "checkout.invalid_phone") so errors can be counted per cause.
 */
export function markError(slug: string, err?: unknown): void {
  const span = trace.getActiveSpan();
  if (span) recordError(span, err, slug);
}

function recordError(span: Span, err: unknown, slug: string): void {
  span.setAttributes({ error: true, "exception.slug": slug });
  if (err instanceof Error) {
    span.recordException(err);
    span.setStatus({ code: SpanStatusCode.ERROR, message: err.message });
  } else {
    span.setStatus({ code: SpanStatusCode.ERROR, message: slug });
  }
}
