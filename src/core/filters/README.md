# filters

Here are some examples of files you might place inside the `filters` directory:

- **http-exception.filter.ts:** A filter to handle HTTP exceptions globally or at a module/controller level. This filter intercepts HTTP errors and transforms them into a standardized format for responses.

- **custom-exception.filter.ts:** A custom exception filter that extends Nest's built-in ExceptionFilter interface. This filter handles custom exceptions specific to your application's domain or business logic.

- **query-exception.filter.ts:** A filter to handle query exceptions. This filter intercepts query errors and transforms them into a standardized format for responses.

- **validation-exception.filter.ts:** A filter to handle validation errors. This filter intercepts validation errors and transforms them into a standardized format for responses.

- **authorization-exception.filter.ts:** A filter to handle authorization errors. This filter intercepts authorization errors and transforms them into a standardized format for responses.

- **logging.filter.ts:** A filter to log requests and responses. This filter intercepts incoming requests and outgoing responses and logs them for debugging or monitoring purposes.
