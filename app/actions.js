'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

// Onboarding completion (02-02 · UI-SPEC §13): setting cookies during Server
// Component render is illegal, so the Finish/Skip handlers in
// app/onboarding/page.js invoke this Server Action instead. Setting a cookie
// in an action makes Next re-render the current tree with the new value, so
// the redirect lands on a `/` that now renders Today. The cookie is a
// non-sensitive render preference (landing vs dashboard) for the caller's own
// browser — deliberately NOT httpOnly so the localStorage migration shim in
// components/Landing.js can also write it (both retire in Phase 3).
export async function completeOnboarding() {
  const cookieStore = await cookies()
  cookieStore.set('learnit_onboarded', '1', {
    path: '/',
    maxAge: 60 * 60 * 24 * 365, // 1 year
  })
  redirect('/')
}
