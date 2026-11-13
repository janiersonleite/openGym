// @vitest-environment happy-dom
// A cardio exercise's page offers its plans with no workout going (components/CardioPlansSheet.jsx),
// a strength exercise's page does not.
import React, { act } from 'react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { createRoot } from 'react-dom/client'
import { exOr } from './lib/exercises.js'
import { DEF, useStore } from './store/useStore.js'
import { useUI } from './store/useUI.js'
import { exerciseDetailSheet } from './sheets.jsx'

const TREADMILL = '2259'   // walking on treadmill
const BENCH = '0576'       // a rep exercise
const mounted = []

function renderTop() {
  const sheet = useUI.getState().sheets.at(-1)
  const host = document.createElement('div')
  document.body.appendChild(host)
  const root = createRoot(host)
  mounted.push(root)
  act(() => root.render(sheet.render(() => useUI.getState().closeSheet(sheet.id))))
  return host
}
const button = (host, text) => [...host.querySelectorAll('button')].find(b => b.textContent.trim() === text)

beforeEach(() => {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true
  useUI.setState({ sheets: [], toastMsg: '' })
  useStore.setState({ S: structuredClone(DEF), user: null })
  document.body.innerHTML = ''
})
afterEach(() => { act(() => { mounted.splice(0).forEach(root => root.unmount()) }) })

describe('Cardio plans on the exercise page', () => {
  it('a cardio exercise offers them, and the button opens the plans with no workout going', () => {
    exerciseDetailSheet(exOr(TREADMILL))
    const page = renderTop()
    const open = button(page, 'Cardio plans')
    expect(open).toBeTruthy()
    expect(useStore.getState().S.active).toBeFalsy()
    act(() => open.click())
    const plans = renderTop()
    expect(plans.textContent).toContain('Cardio plans')
    expect(plans.textContent).toContain('No plans yet')
    // Nothing to save from: there are no rows. A plan can still be written.
    expect(button(plans, 'Save these sets as a plan')).toBeUndefined()
    expect(button(plans, 'New plan')).toBeTruthy()
  })

  it('a plan written there has the treadmill grade, and shows its total at once', () => {
    exerciseDetailSheet(exOr(TREADMILL))
    const page = renderTop()
    act(() => button(page, 'Cardio plans').click())
    const plans = renderTop()
    act(() => button(plans, 'New plan').click())
    expect(plans.textContent).toContain('Incline (%)')
    expect(plans.querySelector('.cardio-plan-total').textContent).toBe('Segments: 1 · 5 min')
  })

  it('a rep exercise does not offer them', () => {
    exerciseDetailSheet(exOr(BENCH))
    expect(button(renderTop(), 'Cardio plans')).toBeUndefined()
  })
})
