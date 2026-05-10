'use client'

import { useState, useRef } from 'react'

type FormState = 'idle' | 'submitting' | 'success' | 'error'

export function RightOfReplyForm() {
  const [state, setState] = useState<FormState>('idle')
  const [errorMsg, setErrorMsg] = useState<string>('')
  const [charCount, setCharCount] = useState(0)
  const formRef = useRef<HTMLFormElement>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setState('submitting')
    setErrorMsg('')

    const form = e.currentTarget
    const data = {
      fullName: (form.elements.namedItem('fullName') as HTMLInputElement).value.trim(),
      email: (form.elements.namedItem('email') as HTMLInputElement).value.trim(),
      roleOrg: (form.elements.namedItem('roleOrg') as HTMLInputElement).value.trim(),
      articleUrl: (form.elements.namedItem('articleUrl') as HTMLInputElement).value.trim(),
      submission: (form.elements.namedItem('submission') as HTMLTextAreaElement).value.trim(),
    }

    try {
      const res = await fetch('/api/right-of-reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (res.status === 202) {
        setState('success')
        formRef.current?.reset()
        setCharCount(0)
      } else {
        const body = await res.json().catch(() => ({}))
        setErrorMsg(body.error || `Unexpected response (${res.status}). Please try again.`)
        setState('error')
      }
    } catch {
      setErrorMsg('Network error. Please check your connection and try again.')
      setState('error')
    }
  }

  const inputClass =
    'w-full bg-charcoal border border-rule px-4 py-3 font-sans text-sm text-paper placeholder:text-paper-dim ' +
    'focus:outline-none focus:border-amber/50 transition-colors'

  const labelClass = 'block font-mono text-[10px] uppercase tracking-widest text-amber mb-2'

  return (
    <form ref={formRef} onSubmit={handleSubmit} noValidate className="space-y-6">
      {/* Full name */}
      <div>
        <label htmlFor="fullName" className={labelClass}>
          Full name <span className="text-severity-critical">*</span>
        </label>
        <input
          id="fullName"
          name="fullName"
          type="text"
          required
          autoComplete="name"
          placeholder="Jane Smith"
          className={inputClass}
        />
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email" className={labelClass}>
          Email address <span className="text-severity-critical">*</span>
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="jane@example.com"
          className={inputClass}
        />
      </div>

      {/* Role / organisation */}
      <div>
        <label htmlFor="roleOrg" className={labelClass}>
          Role / organisation <span className="text-severity-critical">*</span>
        </label>
        <input
          id="roleOrg"
          name="roleOrg"
          type="text"
          required
          placeholder="Health & Safety Manager, Acme Ltd"
          className={inputClass}
        />
      </div>

      {/* Article URL */}
      <div>
        <label htmlFor="articleUrl" className={labelClass}>
          Article URL <span className="text-severity-critical">*</span>
        </label>
        <input
          id="articleUrl"
          name="articleUrl"
          type="url"
          required
          placeholder="https://safetynews.pro/articles/…"
          className={inputClass}
        />
        <p className="mt-1.5 font-mono text-[10px] text-paper-dim">
          Paste the full URL of the article you are responding to.
        </p>
      </div>

      {/* Submission text */}
      <div>
        <label htmlFor="submission" className={labelClass}>
          Your statement <span className="text-severity-critical">*</span>
        </label>
        <textarea
          id="submission"
          name="submission"
          required
          minLength={50}
          maxLength={2000}
          rows={10}
          placeholder="Set out your response here. Submissions must be between 50 and 2,000 characters."
          className={`${inputClass} resize-y`}
          onChange={(e) => setCharCount(e.target.value.length)}
        />
        <div className="mt-1.5 flex justify-between items-center">
          <p className="font-mono text-[10px] text-paper-dim">Min 50 · Max 2,000 characters</p>
          <p className={`font-mono text-[10px] ${charCount > 2000 ? 'text-severity-critical' : charCount < 50 && charCount > 0 ? 'text-severity-medium' : 'text-paper-dim'}`}>
            {charCount}/2000
          </p>
        </div>
      </div>

      {/* Error message */}
      {state === 'error' && errorMsg && (
        <div className="border border-severity-critical/40 bg-severity-critical/10 px-4 py-3">
          <p className="font-mono text-xs text-severity-critical">{errorMsg}</p>
        </div>
      )}

      {/* Success message */}
      {state === 'success' && (
        <div className="border border-amber/40 bg-amber/5 px-4 py-4">
          <p className="font-mono text-xs text-amber mb-1 uppercase tracking-wide">Submission received</p>
          <p className="font-sans text-sm text-paper-dim">
            Your statement has been logged and is queued for Governance Swarm review. You will
            receive an email acknowledgement within one working day.
          </p>
        </div>
      )}

      {/* Submit */}
      <div>
        <button
          type="submit"
          disabled={state === 'submitting'}
          className="border border-amber/50 bg-charcoal-50 px-6 py-3 font-mono text-xs uppercase tracking-widest text-amber hover:bg-amber/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {state === 'submitting' ? 'Submitting…' : 'Submit statement'}
        </button>
      </div>
    </form>
  )
}
