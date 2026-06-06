'use client'
import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Header from '@/components/ui/Header'
import StepIndicator from '@/components/ui/StepIndicator'
import SpotifyConnect from '@/components/steps/SpotifyConnect'
import Step1Form from '@/components/steps/Step1Form'
import Step2Cover from '@/components/steps/Step2Cover'
import Step3Stickers from '@/components/steps/Step3Stickers'
import Step4Final from '@/components/steps/Step4Final'

export default function CreatePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [step, setStep] = useState(1)

  // Honour ?step=N from the OAuth callback so the user lands back on Step 1
  // after Spotify authorization, not on whatever step they were on before.
  useEffect(() => {
    const s = parseInt(searchParams.get('step') ?? '', 10)
    if (s >= 1 && s <= 5) setStep(s)
  }, [searchParams])

  return (
    <div className="flex flex-col min-h-screen paper-texture overflow-x-hidden">
      <Header />
      <main className="flex-1 flex flex-col items-center py-4 px-4 sm:px-6">
        <StepIndicator current={step} />

        <div className="w-full max-w-2xl">
          {step === 1 && (
            <SpotifyConnect
              onBack={() => router.push('/')}
              onNext={() => setStep(2)}
            />
          )}
          {step === 2 && (
            <Step1Form
              onBack={() => setStep(1)}
              onNext={() => setStep(3)}
            />
          )}
          {step === 3 && (
            <Step2Cover
              onBack={() => setStep(2)}
              onNext={() => setStep(4)}
            />
          )}
          {step === 4 && (
            <Step3Stickers
              onBack={() => setStep(3)}
              onNext={() => setStep(5)}
            />
          )}
          {step === 5 && <Step4Final onBack={() => setStep(4)} />}
        </div>
      </main>
    </div>
  )
}
