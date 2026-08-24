import { describe, expect, it } from 'vitest'
import { parseSseBlock } from '../src/api/agent'

describe('SSE parser', () => {
  it('parses progressive delta events', () => {
    expect(parseSseBlock('event: delta\ndata: {"text":"Hello"}\n')).toEqual({ event: 'delta', payload: { text: 'Hello' } })
  })

  it('parses done and error events', () => {
    expect(parseSseBlock('event: done\ndata: {"answer":"Complete","sources":[]}')).toMatchObject({ event: 'done', payload: { answer: 'Complete' } })
    expect(parseSseBlock('event: error\ndata: {"detail":"Unavailable"}')).toEqual({ event: 'error', payload: { detail: 'Unavailable' } })
  })
})
