export const AppConstants = {
  app: {
    name: 'CGP Customer API' as const,
    version: '1.0.0' as const,
    description:
      'OpenAPI Specification for CGP Customer API developed by Revinr' as const,
  },
  cloudflare: {
    mediaVariant: 'public' as const,
    mediaBaseUrl: 'https://imagedelivery.net' as const,
    apiBaseUrl: 'https://api.cloudflare.com/client/v4/accounts' as const,
  },
  stripe: {
    apiVersion: '2024-04-10' as const,
    apiBaseUrl: 'https://api.stripe.com/v1' as const,
    success_url: 'https://raw-bertie-wittyplex.koyeb.app/' as const,
    cancel_url: 'https://raw-bertie-wittyplex.koyeb.app/' as const,
  },

  mail: {
    recipient: 'mr.rousnay@gmail.com' as const,
  },
};
