import { useEffect, useState } from 'react'
import QRCode from 'qrcode'
import { useTr } from '../i18n'
import { track } from '../analytics'
import { SUPPORT, upiLink } from '../support'
import { Icon } from './Icon'

const AMOUNTS = [49, 99, 199, 499]
const isMobile = () => /android|iphone|ipad|ipod/i.test(navigator.userAgent)

export function CoffeeModal({ onClose }: { onClose: () => void }) {
  const tr = useTr()
  const [amount, setAmount] = useState(99)
  const [custom, setCustom] = useState('')
  const [qr, setQr] = useState('')
  const [copied, setCopied] = useState(false)
  const value = custom ? Math.min(100000, Math.max(1, Math.round(Number(custom) || 0))) : amount
  const link = upiLink(value)

  useEffect(() => track('coffee_open'), [])
  useEffect(() => {
    QRCode.toDataURL(link, { margin: 1, width: 440, errorCorrectionLevel: 'M', color: { dark: '#000000', light: '#ffffff' } })
      .then(setQr)
      .catch(() => setQr(''))
  }, [link])
  useEffect(() => {
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', esc)
    return () => window.removeEventListener('keydown', esc)
  }, [onClose])

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(SUPPORT.upi)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1600)
    } catch {
      /* clipboard blocked: the id is visible to copy by hand */
    }
  }

  return (
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal coffee" role="dialog" aria-modal="true" aria-labelledby="coffee-title">
        <div className="modal-head">
          <h2 id="coffee-title">
            <Icon name="cup" size={20} /> {tr('Ek coffee pilao', 'Buy me a coffee')}
          </h2>
          <button className="icon-btn" onClick={onClose} aria-label={tr('Band karo', 'Close')}>
            <Icon name="close" />
          </button>
        </div>
        <p className="muted small">
          {tr(
            'Viewinter free hai aur free rahega. Agar isse madad mili, to ek coffee se support karo. Paisa seedha UPI se jaata hai.',
            'Viewinter is free and stays free. If it helped you, support it with a coffee. The money goes straight to me over UPI.',
          )}
        </p>

        <div className="coffee-amounts" role="radiogroup" aria-label={tr('Amount', 'Amount')}>
          {AMOUNTS.map((a) => (
            <button
              key={a}
              type="button"
              role="radio"
              aria-checked={!custom && amount === a}
              className={!custom && amount === a ? 'on' : ''}
              onClick={() => {
                setCustom('')
                setAmount(a)
              }}
            >
              ₹{a}
            </button>
          ))}
          <label className={`coffee-custom ${custom ? 'on' : ''}`}>
            ₹
            <input inputMode="numeric" placeholder={tr('Apna', 'Other')} value={custom} onChange={(e) => setCustom(e.target.value.replace(/\D/g, '').slice(0, 6))} aria-label={tr('Apna amount', 'Custom amount')} />
          </label>
        </div>

        <div className="coffee-qr">
          {qr ? <img src={qr} alt={tr(`₹${value} ke liye UPI QR`, `UPI QR code for ₹${value}`)} width={220} height={220} /> : <span className="muted small">QR…</span>}
          <span className="muted small">{tr('Kisi bhi UPI app se scan karo: GPay, PhonePe, Paytm, BHIM', 'Scan with any UPI app: GPay, PhonePe, Paytm, BHIM')}</span>
        </div>

        {isMobile() && (
          <a className="btn primary wide" href={link} onClick={() => track('coffee_upi_app', { amount: value })}>
            {tr(`₹${value} UPI app se bhejo`, `Pay ₹${value} with a UPI app`)}
          </a>
        )}

        <div className="coffee-id">
          <span className="muted small">UPI ID</span>
          <code className="mono">{SUPPORT.upi}</code>
          <button className="btn small" onClick={copy}>
            {copied ? tr('Copy ho gaya', 'Copied') : tr('Copy', 'Copy')}
          </button>
        </div>

        {SUPPORT.intl && (
          <a className="btn wide" href={SUPPORT.intl} target="_blank" rel="noreferrer" onClick={() => track('coffee_intl')}>
            {tr('India ke bahar se? Card / PayPal', 'Outside India? Pay by card / PayPal')} <Icon name="arrow" size={14} />
          </a>
        )}
        <p className="muted small coffee-thanks">{tr('Shukriya! Har coffee se naye features aate hain.', 'Thank you. Every coffee turns into new features.')}</p>
      </div>
    </div>
  )
}
