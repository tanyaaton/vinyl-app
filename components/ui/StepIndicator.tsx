interface Props {
  current: number // 1–5
}

const LABELS = ['playlist', 'details', 'cover', 'stickers', 'share']

export default function StepIndicator({ current }: Props) {
  return (
    <div className="flex items-start justify-center gap-0 my-6">
      {LABELS.map((label, idx) => {
        const step = idx + 1
        const isCurrent = step === current
        const isDone = step < current
        return (
          <div key={step} className="flex items-start">
            <div className="flex flex-col items-center">
              <div
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 flex items-center justify-center text-xs font-jacquarda transition-all ${
                  isCurrent
                    ? 'bg-gray-800 border-gray-800 text-white'
                    : isDone
                    ? 'bg-gray-400 border-gray-400 text-white'
                    : 'bg-transparent border-gray-300 text-gray-400'
                }`}
              >
                {step}
              </div>
              <span
                className={`hidden sm:block font-jacquarda text-[10px] mt-1 tracking-wider ${
                  isCurrent ? 'text-gray-800' : isDone ? 'text-gray-500' : 'text-gray-400'
                }`}
              >
                {label}
              </span>
            </div>
            {step < LABELS.length && (
              <div
                className={`w-6 sm:w-10 h-px mt-3 sm:mt-4 ${
                  isDone ? 'bg-gray-400' : 'bg-gray-300'
                }`}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
