using System.Net;
using System.Text.Json;
using API.Errors;

namespace API.Middleware
{
    public class ExceptionMiddleware
    {
        private readonly RequestDelegate _next; // This field stores the next middleware in the pipeline to be called.
        private readonly ILogger<ExceptionMiddleware> _logger; // Used for logging messages, warnings, and errors.
        private readonly IHostEnvironment _env; // Provides information about the current environment (Development, Production, etc.).

        public ExceptionMiddleware(RequestDelegate next, ILogger<ExceptionMiddleware> logger, IHostEnvironment env)
        {
            _next = next;
            _logger = logger;
            _env = env;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                // Asynchronously call the next middleware in the pipeline
                await _next(context); 
            }
            catch (Exception ex)
            {
                // Log the exception details
                _logger.LogError(ex, ex.Message);

                // Set the response content type to JSON
                context.Response.ContentType = "application/json";

                // Set the HTTP status code to 500 (Internal Server Error)
                context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;

                // Create an error response object based on the environment
                var response = _env.IsDevelopment()
                    ? new ApiExceptions(context.Response.StatusCode, ex.Message, ex.StackTrace?.ToString()) 
                    : new ApiExceptions(context.Response.StatusCode, ex.Message, "Internal Server Error");

                // Set JSON serialization options to use camelCase for property names
                var options = new JsonSerializerOptions{PropertyNamingPolicy = JsonNamingPolicy.CamelCase};

                // Serialize the error response object to a JSON string
                var json = JsonSerializer.Serialize(response, options);

                // Write the JSON string to the response body
                await context.Response.WriteAsync(json);
            }
        }
    }
}