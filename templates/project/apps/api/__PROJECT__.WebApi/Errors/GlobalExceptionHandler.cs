using System.Diagnostics;
using __PROJECT__.Application.Shared;
using Microsoft.AspNetCore.Diagnostics;

namespace __PROJECT__.WebApi.Errors;

internal sealed class GlobalExceptionHandler(ILogger<GlobalExceptionHandler> logger) : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(
        HttpContext httpContext,
        Exception exception,
        CancellationToken cancellationToken)
    {
        var traceId = Activity.Current?.TraceId.ToString() ?? httpContext.TraceIdentifier;
        if (exception is CommandValidationException validation)
        {
            await Results.Problem(
                statusCode: StatusCodes.Status400BadRequest,
                title: "Request validation failed.",
                extensions: new Dictionary<string, object?>
                {
                    ["code"] = "validation_failed",
                    ["traceId"] = traceId,
                    ["errors"] = validation.Errors,
                }).ExecuteAsync(httpContext);
            return true;
        }

        logger.LogError(exception, "Unhandled request failure with trace {TraceId}.", traceId);
        await Results.Problem(
            statusCode: StatusCodes.Status500InternalServerError,
            title: "An unexpected error occurred.",
            extensions: new Dictionary<string, object?>
            {
                ["code"] = "unexpected_error",
                ["traceId"] = traceId,
            }).ExecuteAsync(httpContext);
        return true;
    }
}

