export function formatINR(amount: number) {
  return `Rs. ${amount.toLocaleString("en-IN")}.00`;
}
