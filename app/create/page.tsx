'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/ui/Header'
import StepIndicator from '@/components/ui/StepIndicator'
import Step1Form from '@/components/steps/Step1Form'
import Step2Cover from '@/components/steps/Step2Cover'
import Step3Stickers from '@/components/steps/Step3Stickers'
import Step4Final from '@/components/steps/Step4Final'

export default function CreatePage() {
  const router = useRouter()
  const [step, setStep] = useState(1)

  return (
    <div className="flex flex-col min-h-screen paper-texture">
      <Header />
      <main className="flex-1 flex flex-col items-center py-4 px-4">
        <StepIndicator current={step} />

        <div className="w-full max-w-2xl">
          {step === 1 && (
            <Step1Form
              onBack={() => router.push('/')}
              onNext={() => setStep(2)}
            />
          )}
          {step === 2 && (
            <Step2Cover
              onBack={() => setStep(1)}
              onNext={() => setStep(3)}
            />
          )}
          {step === 3 && (
            <Step3Stickers
              onBack={() => setStep(2)}
              onNext={() => setStep(4)}
            />
          )}
          {step === 4 && <Step4Final />}
        </div>
      </main>
    </div>
  )
}
