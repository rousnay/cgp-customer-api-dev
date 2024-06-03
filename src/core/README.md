# core

Inside the `core` directory, you might find various files and subdirectories that encapsulate fundamental aspects of your application. Here are some common examples of what you might find inside the `core` directory:

- **config:** This subdirectory contains files related to application configuration, such as environment variables, database configurations, API keys, etc.

- **services:** This subdirectory contains singleton services or providers that are used across multiple modules. These services may include authentication services, logging services, caching services, etc.

- **interceptors:** This subdirectory contains interceptors that are applied globally or to specific routes to intercept and modify incoming requests or outgoing responses. Interceptors are often used for logging, error handling, or data transformation.

- **guards:** This subdirectory contains guards that are used to protect routes or endpoints by implementing authentication and authorization logic. Guards can enforce access control based on user roles, permissions, or other criteria.

- **enums:** This subdirectory contains enumerations that define a set of named constants. Enums are often used to represent a fixed set of values, such as status codes, roles, error codes, etc.

- **constants:** This subdirectory contains constant values that are used throughout the application. Constants can include default configurations, error messages, regular expressions, etc.

- **utils:** This subdirectory contains utility functions or helper classes that provide common functionalities used across the application. Utils may include functions for string manipulation, date formatting, validation, etc.

- **middlewares:** This subdirectory contains middleware functions that are applied globally or to specific routes to perform tasks such as authentication, logging, rate limiting, etc.

- **exceptions:** This subdirectory contains files related to handling exceptions and errors in the application. It may include custom exception filters, error handlers, or predefined exception classes.

- **decorators:** This subdirectory contains custom decorators that add metadata or behavior to classes, methods, or properties within the application. Decorators are often used for logging, authentication, validation, etc.
