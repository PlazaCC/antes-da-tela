'use client'

import { LEGAL_TABS } from '@/content/legal/legal-tabs'
import Image from 'next/image'
import Link from 'next/link'

const LEGAL_LINKS = Object.values(LEGAL_TABS).map((tab) => ({
  label: tab.navLabel,
  href: `/legal/${tab.slug}`,
}))

const LINKS: { heading: string; items: { label: string; href: string }[] }[] = [
  {
    heading: 'Plataforma',
    items: [
      { label: 'Manifesto', href: '/#manifesto' },
      { label: 'A plataforma', href: '/#plataforma' },
      { label: 'Como funciona', href: '/#como-funciona' },
      { label: 'Roteiros', href: '/#roteiros' },
    ],
  },
  {
    heading: 'Legal',
    items: LEGAL_LINKS,
  },
]

export function LandingFooter() {
  return (
    <footer className="border-t border-[rgb(37,37,37)] bg-[rgb(10,10,10)] px-[clamp(24px,6vw,80px)] pb-8 pt-[clamp(48px,7vw,80px)]">
      <div className="mx-auto max-w-[1280px]">
        {/* main grid */}
        <div className="mb-12 grid gap-10 lg:grid-cols-[1.4fr_repeat(3,1fr)] lg:gap-12">
          {/* brand column */}
          <div>
            <div className="mb-3.5">
              <Image
                src="/assets/logo.svg"
                alt="Antes da Tela"
                className="w-100% h-auto max-w-full"
                width={196}
                height={24}
              />
            </div>
            <p className="m-0 mb-6 max-w-[260px] text-[13px] leading-[1.65] text-[rgb(107,104,96)]">
              Plataforma de publicação, leitura e descoberta de roteiros
              audiovisuais brasileiros.
            </p>
          </div>

          {/* link columns */}
          {LINKS.map((col) => (
            <div key={col.heading}>
              <span className="mb-4 block font-mono text-[10px] uppercase tracking-[0.16em] text-[rgb(107,104,96)]">
                {col.heading}
              </span>
              <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
                {col.items.map((item) => (
                  <li key={item.label}>
                    {item.href.startsWith('/') ? (
                      <Link
                        href={item.href}
                        className="text-[14px] text-[rgb(107,104,96)] no-underline transition-[color_0.2s_ease] hover:text-[hsl(var(--color-text-primary))]"
                      >
                        {item.label}
                      </Link>
                    ) : (
                      <a
                        href={item.href}
                        className="text-[14px] text-[rgb(107,104,96)] no-underline transition-[color_0.2s_ease] hover:text-[hsl(var(--color-text-primary))]"
                      >
                        {item.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* partnership */}
        <div className="mb-5 flex flex-col items-center gap-2">
          <span className="font-mono text-[11px] tracking-[0.1em] text-text-secondary">
            Desenvolvido por:
          </span>
          <a
            href="https://theplaza.cc/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-text-primary transition-opacity hover:opacity-80"
          >
            <svg
              width="80"
              viewBox="0 0 1312 249"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="h-[25px] w-auto"
            >
              <path
                d="M1098.77 0H1261.81C1273.9 0 1281.33 5.89987 1282.88 18.3396L1311.71 227.504C1313.56 241.177 1306.43 248.638 1293.11 248.638H1214.07C1201.66 248.638 1194.55 242.113 1193.61 229.361C1191.45 193.619 1188.34 183.677 1185.86 146.685C1184.93 133.949 1185.24 130.531 1180.29 130.531C1175.34 130.531 1175.64 133.949 1174.72 146.685C1172.24 183.677 1169.15 193.619 1166.97 229.361C1166.03 242.098 1158.9 248.638 1146.51 248.638H1067.47C1054.15 248.638 1047.02 241.177 1048.87 227.504L1077.7 18.3396C1079.25 5.89987 1086.68 0 1098.77 0Z"
                fill="currentColor"
              />
              <path
                d="M784.178 168.131V233.092C784.178 243.034 789.75 248.95 799.37 248.95H1014.47C1027.17 248.95 1034.3 241.801 1034.3 229.065V172.501C1034.3 159.765 1027.17 152.616 1014.47 152.616H945.359C935.444 152.616 933.576 145.468 942.261 140.801L1008.9 104.746C1018.19 99.7672 1021.91 91.3856 1021.91 80.8189V20.1969C1021.91 7.46069 1014.78 0.312162 1002.08 0.312162L804.024 0C791.322 0 784.193 7.14853 784.193 19.8848V76.4486C784.193 89.1849 791.322 96.3334 804.024 96.3334H857.647C867.562 96.3334 869.119 103.482 860.745 108.149L797.206 144.204C787.913 149.495 784.193 157.564 784.193 168.131H784.178Z"
                fill="currentColor"
              />
              <path
                d="M561.325 0H718.164C730.258 0 737.387 5.89987 739.24 18.3396L771.165 227.504C773.328 241.177 765.888 248.638 752.564 248.638H673.522C661.116 248.638 654.003 242.113 653.069 229.361L645.317 146.685C644.383 133.949 644.695 130.531 639.745 130.531C634.795 130.531 635.091 133.949 634.172 146.685L626.421 229.361C625.487 242.098 618.358 248.638 605.967 248.638H526.925C513.601 248.638 506.161 241.177 508.325 227.504L540.25 18.3396C542.102 5.89987 549.231 0 561.325 0Z"
                fill="currentColor"
              />
              <path
                d="M276.164 19.8848V228.737C276.164 241.473 283.293 248.622 295.995 248.622H472.353C485.054 248.622 492.183 241.473 492.183 228.737V172.173C492.183 159.437 485.054 152.289 472.353 152.289H399.521C393.326 152.289 389.606 148.558 389.606 142.346V19.8848C389.606 7.14856 382.477 3.57242e-05 369.776 3.57242e-05H296.01C283.309 3.57242e-05 276.18 7.14856 276.18 19.8848H276.164Z"
                fill="currentColor"
              />
              <path
                d="M110.967 112.831V97.5976C110.967 91.3856 114.687 87.6553 120.882 87.6553H147.842C165.82 87.6553 168.918 97.5977 168.918 102.577C168.918 109.101 168.918 122.774 147.842 122.774H120.882C114.687 122.774 110.967 119.043 110.967 112.831ZM0 19.9004V228.753C0 241.489 7.12903 248.638 19.8305 248.638H102.904C115.605 248.638 122.734 241.489 122.734 228.753V220.356C122.734 214.144 126.455 210.413 132.65 210.413H166.738C229.654 210.413 261.891 154.786 261.891 104.122C261.891 53.4578 229.359 0 166.754 0H19.8305C7.12903 0 0 7.14852 0 19.9004Z"
                fill="currentColor"
              />
            </svg>
          </a>
        </div>

        {/* bottom bar */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="font-mono text-[11px] tracking-[0.06em] text-[rgb(52,52,52)]">
            © 2026 Antes da Tela
          </span>
          <span className="font-mono text-[10px] tracking-[0.1em] text-[rgb(52,52,52)]">
            v 0.1 · em construção
          </span>
        </div>
      </div>
    </footer>
  )
}
