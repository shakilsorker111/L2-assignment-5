export const getPaymentUrl = (
  response: any
): string | null => {
  const data = response?.data;

  if (!data) {
    return null;
  }

  return (
    data.paymentUrl ||
    data.checkoutUrl ||
    data.url ||
    null
  );
};