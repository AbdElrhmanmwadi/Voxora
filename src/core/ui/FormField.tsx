import React, { useId } from 'react'
import { cn } from '../utils/cn'

type ChildProps = {
  id: string
  'aria-invalid'?: true
  'aria-describedby'?: string
}

type Props = {
  label: string
  hint?: React.ReactNode
  error?: string | null
  required?: boolean
  className?: string
  // Render-prop so the control gets a stable id and the right aria wiring
  // (aria-invalid + aria-describedby) without each caller repeating it.
  children: (props: ChildProps) => React.ReactNode
}

export default function FormField({ label, hint, error, required, className, children }: Props) {
  const id = useId()
  const errorId = `${id}-error`
  const hintId = `${id}-hint`
  const describedBy = error ? errorId : hint ? hintId : undefined

  return (
    <div className={cn('space-y-2', className)}>
      <label className="field-label" htmlFor={id}>
        {label}
        {required && <span className="ml-0.5 text-destructive">*</span>}
      </label>
      {children({ id, 'aria-invalid': error ? true : undefined, 'aria-describedby': describedBy })}
      {error ? (
        <p id={errorId} className="text-sm font-medium text-destructive">
          {error}
        </p>
      ) : hint ? (
        <p id={hintId} className="field-hint">
          {hint}
        </p>
      ) : null}
    </div>
  )
}
