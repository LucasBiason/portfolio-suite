/**
 * @file FormField.tsx
 * Polymorphic form field component that renders either an `<input>` or `<textarea>`.
 * Includes a label, optional hint text and an optional inline validation error message.
 */

import { FC, InputHTMLAttributes, TextareaHTMLAttributes } from 'react'

/** Shared props common to both input and textarea variants. */
type BaseProps = {
  label: string
  hint?: string
  error?: string
}

/** Props for the default input variant. */
type InputFieldProps = BaseProps &
  InputHTMLAttributes<HTMLInputElement> & {
    as?: 'input'
  }

/** Props for the textarea variant. */
type TextareaFieldProps = BaseProps &
  TextareaHTMLAttributes<HTMLTextAreaElement> & {
    as: 'textarea'
    rows?: number
  }

/** Union of all valid FormField prop shapes. */
type FormFieldProps = InputFieldProps | TextareaFieldProps

const inputClass =
  'w-full bg-background border border-white/10 rounded-lg px-3 py-2 text-white text-sm font-body placeholder-grey-10 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors'

/**
 * Renders a labelled form field that switches between `<input>` and `<textarea>` based on the `as` prop.
 * Automatically derives a DOM id from the label when none is provided.
 * Displays a required asterisk, optional hint and optional error message.
 */
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
