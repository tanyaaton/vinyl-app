interface Props {
  current: number // 1–4
}

export default function StepIndicator({ current }: Props) {
  return (
    <div className="flex items-center justify-center gap-0 my-6">
      {[1, 2, 3, 4].map((step, i) => (
        <div key={step} className="flex items-center">
          <div
            className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-pixel transition-all ${
              step === current
                ? 'bg-gray-800 border-gray-800 text-white'
                : step < current
                ? 'bg-gray-400 border-gray-400 text-white'
                : 'bg-transparent border-gray-300 text-gray-400'
            }`}
          >
            {step}
          </div>
          {i < 3 && (
            <div className={`w-12 h-px ${step < current ? 'bg-gray-400' : 'bg-gray-300'}`} />
          )}
        </div>
      ))}
    </div>
  )
}
