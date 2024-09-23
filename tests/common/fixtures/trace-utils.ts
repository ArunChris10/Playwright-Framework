import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node';
import { trace } from '@opentelemetry/api';
import { APIRequestContext, APIRequestOptions, APIResponse } from '@playwright/test';

// Initialize OpenTelemetry
const provider = new NodeTracerProvider();
provider.register();
const tracer = trace.getTracer('playwright-custom-tracer');

/**
 * Adds traceparent header and handles tracing for any HTTP method
 * @param {string} method - HTTP method (GET, POST, PUT, DELETE)
 * @param {string} url - The URL to request
 * @param {APIRequestOptions} options - Request options
 * @param {APIRequestContext} apiRequestContext - Playwright's API request context
 * @returns {Promise<APIResponse>} - The response object
 */
export const traceRequest = async (
  method: string,
  url: string,
  options: APIRequestOptions,
  apiRequestContext: APIRequestContext
): Promise<APIResponse> => {
  // Start a new span for the request
  const span = tracer.startSpan(`http_${method.toLowerCase()}`, {
    attributes: {
      'http.method': method,
      'http.url': url,
    },
  });

  // Set the span in the current context
 // const currentContext = setSpan(context.active(), span);

  // Generate Traceparent header in the format 00-<traceid>-<spanid>-01
  const traceId = span.spanContext().traceId;
  const spanId = span.spanContext().spanId;
  const traceparent = `00-${traceId}-${spanId}-01`;

  // Add the Traceparent header to the request
  const headers = {
    ...options.headers,
    'traceparent': traceparent
  };

  // Make the HTTP request with the Traceparent header
  try {
    const response = await apiRequestContext.fetch(url, {
      ...options,
      headers,
      method
    });

    // Set the HTTP status code as an attribute
    span.setAttribute('http.status_code', response.status());

    // End the span
    span.end();

    return response;
  } catch (error) {
    // Handle errors and set the span status accordingly
    span.setStatus({ code: 2, message: `Request error: ${error.message}` });
    span.end();
    throw error;
  }
};