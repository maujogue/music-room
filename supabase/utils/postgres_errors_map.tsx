type PgErrorMap = {
  message: string;
  status: number;
};

export const PG_ERRORS: Record<string, PgErrorMap> = {
  // Constraint violations
  "23505": { message: "This value is already taken.", status: 409 }, // Conflict
  "23503": { message: "Invalid reference to another resource.", status: 400 }, // Bad Request
  "23502": { message: "A required field is missing.", status: 400 },
  "23514": { message: "Invalid value for this field.", status: 400 },
  "23P01": { message: "Invalid combination of values.", status: 400 },

  // Transaction / Concurrency
  "40001": { message: "A database conflict occurred. Please try again.", status: 409 },
  "40P01": { message: "A database deadlock occurred. Please try again.", status: 503 }, // Service Unavailable

  // Access / Permissions
  "42501": { message: "You don't have permission to perform this action.", status: 403 }, // Forbidden
  "28P01": { message: "Authentication failed.", status: 401 }, // Unauthorized

  // Syntax / Invalid queries
  "42601": { message: "Invalid request.", status: 400 },
  "42703": { message: "Invalid Column.", status: 400 },
  "42P01": { message: "Invalid resource.", status: 400 },
  "42883": { message: "Invalid request.", status: 400 },

  // Invalid data
  "22P02": { message: "Invalid data format.", status: 400 },
  "22001": { message: "The value is too long.", status: 400 },
  "22007": { message: "Invalid date or time format.", status: 400 },
  "22003": { message: "Number is out of range.", status: 400 }
};

export function formatDbError(error: any): { message: string; status: number } {
  const formatError = PG_ERRORS[error.code] || {
    message: "An unexpected error occurred.",
    status: 500
  };

  let message = formatError.message;

  // Ajouter le message d'erreur original s'il existe
  if (error.message) {
    message += ` (${error.message})`;
  }

  // Try to enrich message with details if available
  if (error.details) {
    // Unique violation: Key (field)=(value) already exists
    const uniqueMatch = error.details.match(/Key \((.*?)\)=\((.*?)\)/);
    if (uniqueMatch) {
      const field = uniqueMatch[1];
      const value = uniqueMatch[2];
      return {
        message: `The field "${field}" with value "${value}" already exists.${error.message ? ` (${error.message})` : ''}`,
        status: formatError.status
      };
    }

    // Ajouter les détails à la fin du message s'ils n'ont pas été traités spécifiquement
    message += ` Details: ${error.details}`;
  }

  // Ajouter d'autres informations utiles si disponibles
  if (error.hint) {
    message += ` Hint: ${error.hint}`;
  }

  return {
    message,
    status: formatError.status
  };
}
