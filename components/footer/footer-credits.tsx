import { PlazaCredit } from './plaza-credit'

function CreatorCredit() {
  return (
    <div className="flex flex-col items-center gap-2">
      <span className="font-mono text-[11px] tracking-[0.1em] text-text-secondary">
        Criado por:
      </span>
      <span className="font-display text-[20px] font-semibold leading-[25px] tracking-[0.04em] text-text-primary">
        MC FERNANDES
      </span>
    </div>
  )
}

export function FooterCredits() {
  return (
    <div className="mb-5 flex flex-wrap items-start justify-center gap-x-12 gap-y-5">
      <PlazaCredit />
      <CreatorCredit />
    </div>
  )
}
