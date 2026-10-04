import { DEFAULT_VOICE_ID, getVoiceSettings, saveVoiceSettings } from '../interview/voice'
import { useState } from 'react'
import { useTr } from '../i18n'
import { DEFAULT_MODEL, listModels, saveGeminiSettings, testConnection, useGemini } from '../gemini'

export function SettingsModal({ onClose }: { onClose: () => void }) {
  const tr = useTr()
  const { settings, status } = useGemini()
  const [apiKey, setApiKey] = useState(settings.apiKey)
  const [model, setModel] = useState(settings.model || DEFAULT_MODEL)
  const [show, setShow] = useState(false)
  const [models, setModels] = useState<string[]>([])
  const [testing, setTesting] = useState(false)
  const [modelMsg, setModelMsg] = useState('')
  const dirty = apiKey.trim() !== settings.apiKey || (model.trim() || DEFAULT_MODEL) !== settings.model

  const persist = () => saveGeminiSettings({ apiKey: apiKey.trim(), model: model.trim() || DEFAULT_MODEL })

  async function saveAndTest() {
    persist()
    if (!apiKey.trim()) return
    setTesting(true)
    await testConnection()
    setTesting(false)
  }

  async function loadModels() {
    if (!apiKey.trim()) return setModelMsg(tr('Pehle key daalo.', 'Add a key first.'))
    setModelMsg(tr('Load ho rahe hain…', 'Loading…'))
    try {
      const list = await listModels(apiKey.trim())
      setModels(list)
      setModelMsg(list.length ? '' : tr('Is key pe koi model nahi mila.', 'No models found for this key.'))
    } catch (e) {
      setModelMsg((e as Error).message)
    }
  }

  // Result shown only when it belongs to what is saved now
  const shown = !dirty && settings.apiKey ? status : null

  return (
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="settings-title">
        <div className="modal-head">
          <h2 id="settings-title">{tr('AI settings', 'AI settings')}</h2>
          <button className="icon-btn" onClick={onClose} aria-label={tr('Band karo', 'Close')}>
            ×
          </button>
        </div>
        <p className="muted small">
          {tr('Ek Gemini key, poori site ka AI: Ask AI, mock interview, quiz, resume aur agent labs.', 'One Gemini key powers all AI on the site: Ask AI, mock interviews, quiz, resume and agent labs.')}{' '}
          <a href="https://aistudio.google.com/apikey" target="_blank" rel="noreferrer">
            {tr('Free key lo', 'Get a free key')}
          </a>
        </p>

        <div className="form">
          <label htmlFor="gemini-key">API key</label>
          <div className="row">
            <input
              id="gemini-key"
              className="grow"
              type={show ? 'text' : 'password'}
              placeholder="AIza…"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              autoComplete="off"
              spellCheck={false}
            />
            <button className="btn" type="button" onClick={() => setShow((s) => !s)}>
              {show ? tr('Chhupao', 'Hide') : tr('Dikhao', 'Show')}
            </button>
          </div>

          <label htmlFor="gemini-model">Model</label>
          <div className="row">
            <input id="gemini-model" className="grow" list="gemini-models" value={model} onChange={(e) => setModel(e.target.value)} spellCheck={false} />
            <button className="btn" type="button" onClick={loadModels}>
              {tr('List', 'List')}
            </button>
          </div>
          <datalist id="gemini-models">
            {[DEFAULT_MODEL, ...models.filter((m) => m !== DEFAULT_MODEL)].map((m) => (
              <option key={m} value={m} />
            ))}
          </datalist>
          {models.length > 0 && (
            <div className="model-list">
              {[DEFAULT_MODEL, ...models.filter((m) => m !== DEFAULT_MODEL)].map((m) => (
                <button key={m} type="button" className={`chip ${m === model ? 'on' : ''}`} onClick={() => setModel(m)}>
                  {m}
                </button>
              ))}
            </div>
          )}
          {modelMsg && <p className="muted small">{modelMsg}</p>}
        </div>

        <div className={`conn ${testing ? 'testing' : shown?.state ?? 'none'}`} role="status">
          <span className="conn-dot" aria-hidden="true" />
          <span>
            {testing
              ? tr('Check ho raha hai…', 'Checking…')
              : !settings.apiKey && !apiKey
                ? tr('Key nahi hai. Labs offline demo pe chalenge.', 'No key yet. Labs run in offline demo mode.')
                : dirty
                  ? tr('Badlav save nahi hue.', 'Unsaved changes.')
                  : shown?.state === 'ok'
                    ? tr(`Connected · ${shown.model}`, `Connected · ${shown.model}`)
                    : shown?.state === 'error'
                      ? shown.message
                      : tr('Abhi test nahi hua.', 'Not tested yet.')}
          </span>
        </div>

        <div className="row end">
          {settings.apiKey && (
            <button
              className="btn"
              type="button"
              onClick={() => {
                setApiKey('')
                saveGeminiSettings({ apiKey: '', model: settings.model })
              }}
            >
              {tr('Key hatao', 'Remove key')}
            </button>
          )}
          <button className="btn primary" type="button" onClick={saveAndTest} disabled={testing || (!apiKey.trim() && !settings.apiKey)}>
            {dirty ? tr('Save & test', 'Save & test') : tr('Test connection', 'Test connection')}
          </button>
        </div>

        <VoiceSettingsBlock />
      </div>
    </div>
  )
}

/** Optional ElevenLabs key for a natural interviewer voice (mock interviews); the free browser voice is the default */
function VoiceSettingsBlock() {
  const tr = useTr()
  const [v, setV] = useState(getVoiceSettings)
  const [saved, setSaved] = useState(false)
  return (
    <details className="voice-settings">
      <summary>{tr('Mock interview voice (optional)', 'Mock interview voice (optional)')}</summary>
      <p className="muted small">
        {tr('Default me browser ki free awaaz use hoti hai. Zyada natural awaaz ke liye ElevenLabs ki free key daalo; ye sirf is browser me rehti hai.', 'By default the browser’s free voice is used. For a more natural voice add a free ElevenLabs key; it stays in this browser.')}{' '}
        <a href="https://elevenlabs.io/app/settings/api-keys" target="_blank" rel="noreferrer">
          {tr('Key yahan milegi', 'Get a key')}
        </a>
      </p>
      <input type="password" value={v.elevenKey} onChange={(e) => (setV({ ...v, elevenKey: e.target.value }), setSaved(false))} placeholder="ElevenLabs API key (sk_…)" aria-label="ElevenLabs API key" autoComplete="off" />
      <input value={v.voiceId} onChange={(e) => (setV({ ...v, voiceId: e.target.value }), setSaved(false))} placeholder={DEFAULT_VOICE_ID} aria-label="ElevenLabs voice id" />
      <div className="row end">
        <span className="muted small">{saved ? tr('Save ho gaya', 'Saved') : ''}</span>
        <button
          className="btn"
          type="button"
          onClick={() => {
            saveVoiceSettings({ elevenKey: v.elevenKey.trim(), voiceId: v.voiceId.trim() || DEFAULT_VOICE_ID })
            setSaved(true)
          }}
        >
          {tr('Voice save karo', 'Save voice')}
        </button>
      </div>
    </details>
  )
}
