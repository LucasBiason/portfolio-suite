import { useState, useCallback, memo } from 'react'
import { sendContactMessage } from '@/services/api'
import { useContact } from '@/hooks/useContact'
import type { ContactPayload } from '@/types'

const initialState: ContactPayload = {
  name: '',
  email: '',
  message: '',
}

export const ContactForm = memo(() => {
  const { contact, loading: contactLoading } = useContact()
  const [form, setForm] = useState<ContactPayload>(initialState)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [feedback, setFeedback] = useState<string | null>(null)

  const handleChange = useCallback(
    (field: keyof ContactPayload) =>
      (event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const value = event.currentTarget.value
        setForm((prev) => ({ ...prev, [field]: value }))
      },
    []
  )

  const handleSubmit = useCallback(async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)
    setFeedback(null)

    try {
      await sendContactMessage(form)
      setFeedback('Mensagem enviada com sucesso! Em breve retorno o contato.')
      setForm(initialState)
    } catch (error) {
      console.error(error)
      setFeedback('Não foi possível enviar a mensagem. Tente novamente em instantes.')
    } finally {
      setIsSubmitting(false)
    }
  }, [form])

  if (contactLoading || !contact) {
    return (
      <section id="contato" className="container py-16 md:py-20">
        <div className="text-center">
          <p className="font-body text-grey-20">Carregando informações de contato...</p>
        </div>
      </section>
    )
  }

  return (
    <section id="contato" className="container py-16 md:py-20">
      <h2 className="text-center font-header text-4xl font-semibold uppercase text-primary sm:text-5xl lg:text-6xl">
        {contact.title}
      </h2>
      <h3 className="pt-6 text-center font-header text-xl font-medium text-white sm:text-2xl lg:text-3xl">
        {contact.subtitle}
      </h3>
      <div className="mx-auto mt-6 max-w-2xl text-center font-body text-grey-20">{contact.description}</div>

      <form onSubmit={handleSubmit} className="mx-auto mt-12 max-w-3xl space-y-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <input
            type="text"
            value={form.name}
            onInput={handleChange('name')}
            required
            placeholder="Nome completo"
            className="w-full rounded border border-grey-50 bg-white px-4 py-3 font-body text-black shadow focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <input
            type="email"
            value={form.email}
            onInput={handleChange('email')}
            required
            placeholder="E-mail profissional"
            className="w-full rounded border border-grey-50 bg-white px-4 py-3 font-body text-black shadow focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <textarea
          value={form.message}
          onInput={handleChange('message')}
          required
          rows={6}
          placeholder="Descreva o projeto, integrações ou métricas que precisa acompanhar"
          className="w-full rounded border border-grey-50 bg-white px-4 py-3 font-body text-black shadow focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary"
        />
        {feedback && (
          <p className={`text-sm ${feedback.includes('sucesso') ? 'text-green' : 'text-red'}`}>
            {feedback}
          </p>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center justify-center gap-2 rounded-full bg-primary px-10 py-3 font-header text-sm font-bold uppercase text-white transition-colors hover:bg-primary-dark disabled:opacity-60"
        >
          {isSubmitting ? 'Enviando...' : 'Enviar mensagem'}
          <i className="bx bx-send text-xl" />
        </button>
      </form>

    </section>
  )
})

ContactForm.displayName = 'ContactForm'
