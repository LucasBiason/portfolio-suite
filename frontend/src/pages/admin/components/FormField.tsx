import { FC, InputHTMLAttributes, TextareaHTMLAttributes } from 'react'

type BaseProps = {
  label: string
  hint?: string
  error?: string
}

type InputFieldProps = BaseProps &
  InputHTMLAttributes<HTMLInputElement> & {
    as?: 'input'
  }

type TextareaFieldProps = BaseProps &
  TextareaHTMLAttributes<HTMLTextAreaElement> & {
    as: 'textarea'
    rows?: number
  }

type FormFieldProps = InputFieldProps | TextareaFieldProps

const inputClass =
  'w-full bg-background border border-white/10 rounded-lg px-3 py-2 text-white text-sm font-body placeholder-grey-10 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors'

export const FormField: FC<FormFieldProps> = (props) => {
  const { label, hint, error, as, ...rest } = props

  const id = (rest as InputHTMLAttributes<HTMLInputElement>).id ?? label.toLowerCase().replace(/\s+/g, '-')

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-body text-grey-30 mb-1">
        {label}
        {(rest as InputHTMLAttributes<HTMLInputElement>).required && (
          <span className="text-red ml-1">*</span>
        )}
      </label>
      {as === 'textarea' ? (
        <textarea
          id={id}
          className={inputClass}
          rows={(rest as TextareaFieldProps).rows ?? 3}
          {...(rest as TextareaHTMLAttributes<HTMLTextAreaElement>)}
        />
      ) : (
        <input id={id} className={inputClass} {...(rest as InputHTMLAttributes<HTMLInputElement>)} />
      )}
      {hint && <p className="text-grey-10 text-xs font-body mt-1">{hint}</p>}
      {error && <p className="text-red text-xs font-body mt-1">{error}</p>}
    </div>
  )
}
