// "Buy me a coffee": UPI payments go straight to the owner's bank account; nothing is stored here.
export const SUPPORT = {
  /** UPI ID (VPA) payments go to; the coffee button stays hidden while empty */
  upi: '',
  /** Name shown in the payer's UPI app */
  name: 'Vaibhav Dixit',
  /** Optional link for people outside India (Buy Me a Coffee, Ko-fi, PayPal…) */
  intl: '',
}

export const supportEnabled = () => Boolean(SUPPORT.upi)

export function upiLink(amount?: number) {
  const q = new URLSearchParams({ pa: SUPPORT.upi, pn: SUPPORT.name, cu: 'INR', tn: 'Coffee for Viewinter' })
  if (amount) q.set('am', amount.toFixed(2))
  return `upi://pay?${q.toString().replace(/\+/g, '%20')}`
}

export const openCoffee = () => window.dispatchEvent(new Event('viewinter:open-coffee'))
