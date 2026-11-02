'use client'

import { DoneStep } from '@/components/onboarding/done-step'
import { IntentStep } from '@/components/onboarding/intent-step'
import { InterpreterStep } from '@/components/onboarding/interpreter-step'
import { OnboardingShell } from '@/components/onboarding/onboarding-shell'
import { PreferencesStep } from '@/components/onboarding/preferences-step'
import { ProfileStep } from '@/components/onboarding/profile-step'
import { PublishStep } from '@/components/onboarding/publish-step'
import { LoadingState } from '@/components/shared/loading-state'
import type { UserIntent } from '@/lib/constants/preferences'
import { useOnboarding } from '@/lib/hooks/use-onboarding'
import { getOnboardingSteps, type OnboardingStep } from '@/lib/onboarding/steps'
import { useRouter } from 'next/navigation'
import posthog from 'posthog-js'
import { useEffect, useState } from 'react'

const COPY: Record<OnboardingStep, { title: string; description?: string }> = {
  intent: { title: 'Boas-vindas ao Antes da Tela!', description: 'O que você quer fazer por aqui? Pode escolher mais de uma opção.' },
  profile: { title: 'Conte um pouco sobre você', description: 'Tudo opcional — dá para editar depois no seu perfil.' },
  interpreter: { title: 'Cadastro de intérprete', description: 'Atores e narradores dão voz aos roteiros dos editais.' },
  preferences: { title: 'O que você gosta de ver?', description: 'Usamos isso para recomendar roteiros. Ajustável no seu perfil.' },
  publish: { title: 'Publique seu primeiro roteiro' },
  done: { title: 'Tudo pronto!', description: 'Alguns atalhos para começar:' },
}

interface OnboardingWizardProps {
  userId: string
  /** Where to go once the onboarding is done (already sanitized). */
  next: string
}

/** First-login onboarding (RFC-006 §1, wireframes O1–O6). */
export function OnboardingWizard({ userId, next }: OnboardingWizardProps) {
  const router = useRouter()
  const { state, isLoading, isSaving, saveIntents, complete } = useOnboarding()
  const [intents, setIntents] = useState<UserIntent[] | null>(null)
  const [stepIndex, setStepIndex] = useState(0)

  const selected = intents ?? state?.intents ?? []
  const steps = getOnboardingSteps(selected)
  const step = steps[stepIndex]

  useEffect(() => {
    posthog.capture('onboarding_step_viewed', { step })
  }, [step])

  if (isLoading) return <LoadingState label='onboarding' />

  const advance = async (skipped = false) => {
    posthog.capture(skipped ? 'onboarding_step_skipped' : 'onboarding_step_completed', { step })
    if (steps[stepIndex + 1] === 'done') await complete()
    setStepIndex((i) => i + 1)
  }

  const toggleIntent = (intent: UserIntent) =>
    setIntents(selected.includes(intent) ? selected.filter((i) => i !== intent) : [...selected, intent])

  const continueFromIntents = async () => {
    if (await saveIntents(selected)) void advance()
  }

  const publishNow = async () => {
    posthog.capture('onboarding_step_completed', { step })
    await complete()
    router.push('/publish')
  }

  const progressTotal = steps.length - 1 // "done" is not a step to fill in
  return (
    <OnboardingShell
      current={step === 'done' ? null : stepIndex + 1}
      total={progressTotal}
      title={COPY[step].title}
      description={COPY[step].description}
      onBack={stepIndex > 0 && step !== 'done' ? () => setStepIndex((i) => i - 1) : undefined}>
      {step === 'intent' && (
        <IntentStep selected={selected} onToggle={toggleIntent} onContinue={continueFromIntents} isSaving={isSaving} />
      )}
      {step === 'profile' && <ProfileStep userId={userId} onDone={() => advance()} onSkip={() => advance(true)} />}
      {step === 'interpreter' && <InterpreterStep onContinue={() => advance(true)} />}
      {step === 'preferences' && <PreferencesStep onDone={() => advance()} onSkip={() => advance(true)} />}
      {step === 'publish' && <PublishStep onPublish={publishNow} onSkip={() => advance(true)} disabled={isSaving} />}
      {step === 'done' && <DoneStep intents={selected} next={next} />}
    </OnboardingShell>
  )
}
