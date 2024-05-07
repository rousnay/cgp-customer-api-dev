const configPayment = () => ({
  STRIPE_CONFIG: {
    apiKey: process.env.STRIPE_API_KEY,
    webhookConfig: {
      requestBodyProperty: 'rawBody',
      stripeSecrets: {
        account: process.env.STRIPE_WEBHOOK_SECRET,
      },
    },
  },
});
export default configPayment;
