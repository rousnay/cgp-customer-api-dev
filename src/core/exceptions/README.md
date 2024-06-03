# exceptions

Here are some examples of files you might place inside the `exceptions` folder:

- **http-exception.filter.ts:** A filter to handle HTTP exceptions globally or at a module/controller level. This file would intercept HTTP errors and transform them into a standardized format for responses.
- **custom-exception.ts:** A custom exception class that extends Nest's built-in HttpException or implements the HttpExceptionFilter interface. This file would define custom exceptions specific to your application's domain or business logic.
- **query-exception.filter.ts:** A filter to handle query exceptions. This file would intercept query errors and transform them into a standardized format for responses.
- **validation-exception.filter.ts:** A filter to handle validation errors. This file would intercept validation errors and transform them into a standardized format for responses.
- **authorization-exception.filter.ts:** A filter to handle authorization errors. This file would intercept authorization errors and transform them into a standardized format for responses.
- **logging-exception.filter.ts:** A filter to log exceptions. This file would intercept exceptions and log them for debugging or monitoring purposes.
