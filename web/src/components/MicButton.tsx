// Speak instead of typing: what you say shows up in the box live; a pause sends it.
// Tapping the mic again stops without sending, so the text can be edited first.
import { useRef } from 'react'
import { canListen, useListener } from '../interview/voice'
import { useTr } from '../i18n'
import { Icon } from './Icon'

/** Live dictation for a text box. `onText` gets the words heard so far (to show in the box), `onSend` the final text. */
export function useDictation(onSend: (text: string) => void) {
  // Stopped by hand → keep the text in the box instead of sending it
  const sendOnEnd = useRef(true)
  const keep = useRef<(text: string) => void>(() => {})
  const listener = useListener((text) => {
    if (sendOnEnd.current) onSend(text)
    else keep.current(text)
    sendOnEnd.current = true
    listener.stop()
  }, 'en-IN')
  return {
    ...listener,
    supported: canListen(),
    /** Stop listening and leave what was heard in the box */
    stopAndKeep(setInput: (text: string) => void) {
      sendOnEnd.current = false
      keep.current = setInput
      listener.stop()
    },
  }
}

export function MicButton({ listening, disabled, onStart, onStop }: { listening: boolean; disabled?: boolean; onStart: () => void; onStop: () => void }) {
  const tr = useTr()
  return (
    <button
      type="button"
      className={`mic-btn ${listening ? 'on' : ''}`}
      onClick={listening ? onStop : onStart}
      disabled={disabled && !listening}
      aria-pressed={listening}
      aria-label={listening ? tr('Sunna band karo (text box me rahega)', 'Stop listening (keeps the text)') : tr('Bolke poochho', 'Ask by voice')}
      title={listening ? tr('Ruk jao to apne aap bhej dega. Yahan dabao to bina bheje rukega.', 'Pause and it sends by itself. Tap here to stop without sending.') : tr('Bolke poochho', 'Ask by voice')}
    >
      <Icon name="mic" size={16} />
      {listening && <span className="mic-pulse" aria-hidden="true" />}
    </button>
  )
}
