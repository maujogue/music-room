// Utilitaire pour retry automatique avec backoff exponentiel
export interface RetryOptions {
  maxAttempts?: number;
  delay?: number;
  backoffMultiplier?: number;
  maxDelay?: number;
}

export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {},
): Promise<T> {
  const {
    maxAttempts = 3,
    delay = 1000,
    backoffMultiplier = 2,
    maxDelay = 10000,
  } = options;

  let lastError: Error;
  let currentDelay = delay;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      console.warn(`Attempt ${attempt}/${maxAttempts} failed:`, {
        error: lastError.message,
        nextDelay: attempt < maxAttempts ? currentDelay : "none",
      });

      if (attempt === maxAttempts) {
        break; // Ne pas attendre après le dernier essai
      }

      // Attendre avant le prochain essai
      await new Promise((resolve) => setTimeout(resolve, currentDelay));

      // Augmenter le délai avec backoff exponentiel
      currentDelay = Math.min(currentDelay * backoffMultiplier, maxDelay);
    }
  }

  // Si tous les essais ont échoué, relancer la dernière erreur
  throw lastError!;
}

// Wrapper spécialisé pour les opérations Supabase
export async function retrySupabaseOperation<T>(
  operation: () => Promise<{ data: T; error: any }>,
  operationName: string,
  options?: RetryOptions,
): Promise<T> {
  return retryWithBackoff(async () => {
    const { data, error } = await operation();

    if (error) {
      console.error(`${operationName} failed:`, error);
      throw new Error(`${operationName}: ${error.message || "Unknown error"}`);
    }

    return data;
  }, options);
}

// Types d'erreur pour différents cas
export class WebSocketError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = "WebSocketError";
  }
}

export class DatabaseError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = "DatabaseError";
  }
}

export class AuthenticationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthenticationError";
  }
}
