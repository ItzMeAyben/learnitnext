import { cookies } from 'next/headers'
import Landing from '../components/Landing.js'
import AppShell from '../components/AppShell.js'
import Today from '../components/Today.js'

// D-01 adaptive `/`: RENDER, never redirect — the Phase 1 cold-start flash
// (IN-06) dies here. Reading cookies() is legal in a Server Component and
// opts this route into dynamic rendering, so the server decides landing vs
// dashboard per request. Only `/` is adaptive; deep links render normally.
export default async function AdaptiveHome() {
  const cookieStore = await cookies()
  const onboarded = cookieStore.has('learnit_onboarded')

  if (!onboarded) return <Landing />
  return (
    <AppShell>
      <Today />
    </AppShell>
  )
}
