import React from 'react'

type Props = React.InputHTMLAttributes<HTMLInputElement>

export default function Input(props: Props) {
  return (
    <input
      {...props}
      className={`w-full px-3 py-2 rounded-md bg-[hsl(var(--card))] border border-white/8 text-[hsl(var(--card-foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] ${props.className ?? ''}`}
    />
  )
}
