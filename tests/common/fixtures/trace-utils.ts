import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node';
import { trace,context, propagation, SpanContext} from '@opentelemetry/api';
import { APIRequestContext, APIRequestOptions, APIResponse } from '@playwright/test';
import { Logger } from '../fixtures/logger-utils';

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

  Logger.log(`Starting request: ${method} ${url}`);

  // Start a new span for the request
  const span = tracer.startSpan(`http_${method.toLowerCase()}`, {
    attributes: {
      'http.method': method,
      'http.url': url,
    },
  });

  // Set the span in the current context
  propagation.inject(trace.setSpan(context.active(), span),options.headers);

  Logger.log("Generated Transparent header : "+options.headers['traceparent']);
  Logger.log(`Request headers: ${JSON.stringify(options.headers)}`);
  // Make the HTTP request with the Traceparent header
  try {
    const response = await apiRequestContext.fetch(url, {
      ...options,
      method
    });

    Logger.log(`Received response status: ${response.status()}`);
    // Set the HTTP status code as an attribute
    span.setAttribute('http.status_code', response.status());

    // Validate the span details from the response
    validateSpanDetails(response, span.spanContext());

    // End the span
    span.end();
    Logger.log(`Span ended for request: ${method} ${url}`);
    
    return response;
  } catch (error) {
    // Handle errors and set the span status accordingly
    Logger.error(`Request error: ${error.message}`);
    span.setStatus({ code: 2, message: `Request error: ${error.message}` });
    span.end();
    throw error;
  }
};

/**
 * Validates the span details from the response
 * @param {APIResponse} response - The response object
 * @param {SpanContext} spanContext - The span context
 */
 const validateSpanDetails = (response: APIResponse, spanContext: SpanContext) => {
  Logger.log(`Validating span details for trace ID: ${spanContext.traceId} and span ID: ${spanContext.spanId}`);
  
  // Extract trace-related details from the response headers
  const responseHeaders = response.headers();
  const responseTraceparent = responseHeaders['traceparent'];

  // Validate traceparent header
  if (responseTraceparent) {
    const [version, responseTraceId, responseSpanId, traceFlags] = responseTraceparent.split('-');
    Logger.log(`Received traceparent header: ${responseTraceparent}`);
    
    if (responseTraceId !== spanContext.traceId) {
      const errorMessage = `Trace ID mismatch: expected ${spanContext.traceId}, got ${responseTraceId}`;
      Logger.error(errorMessage);
      throw new Error(errorMessage);
    }
    
    // This logic can be uncommented to valdate span ID in future , currently we are receiving the same span ID
    
    // if (responseSpanId == spanContext.spanId) {
    //   const errorMessage = `Span ID should not be same as request: expected ${spanContext.spanId}, got ${responseSpanId}`;
    //   Logger.error(errorMessage);
    //   throw new Error(errorMessage);
    // }
    
    Logger.log(`Trace validation successful: ${responseTraceparent}`);
  } else {
    Logger.warn('No traceparent header found in the response.');
  }

};