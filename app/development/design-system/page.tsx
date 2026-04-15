import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Info } from '@/components/ui/info'
import { NavBar } from '@/components/ui/nav-bar'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Design System | Development',
  description: 'Design system showcase and token reference for the Antes da Tela project.',
}

const colors = [
  { label: 'bg/base', value: '#0E0E0E' },
  { label: 'bg/surface', value: '#161616' },
  { label: 'bg/elevated', value: '#1E1E1E' },
  { label: 'border/subtle', value: '#252525' },
  { label: 'border/default', value: '#343434' },
  { label: 'text/primary', value: '#F0EDE6' },
  { label: 'text/secondary', value: '#B7B4B0' },
  { label: 'text/muted', value: '#6B6860' },
  { label: 'brand/accent', value: '#E85C2F' },
  { label: 'brand/lime', value: '#C8E87A' },
  { label: 'state/error', value: '#EF4545' },
  { label: 'state/success', value: '#3CBF7E' },
  { label: 'state/warning', value: '#F5C126' },
]

const typography = [
  { label: 'Display / Hero', value: '72px', description: 'DM Serif Display, 400, 1.06' },
  { label: 'Heading 1', value: '48px', description: 'DM Serif Display, 400, 1.08' },
  { label: 'Heading 2', value: '32px', description: 'DM Serif Display, 400, 1.13' },
  { label: 'Heading 3', value: '24px', description: 'Inter, 600, 1.25' },
  { label: 'Body Large', value: '18px', description: 'Inter, 400, 1.56' },
  { label: 'Body Default', value: '16px', description: 'Inter, 400, 1.5' },
  { label: 'Body Small', value: '13px', description: 'Inter, 400, 1.33' },
  { label: 'Label Mono', value: '13px', description: 'DM Mono, 400, 1.38' },
]

export default function DevelopmentDesignSystemPage() {
  return (
    <div className='grid gap-6'>
      <section className='grid gap-4'>
        <div className='flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between'>
          <div className='space-y-2'>
            <div className='flex items-center gap-3'>
              <h2 className='text-2xl font-semibold'>Design system reference</h2>
              <Badge variant='secondary'>Token library</Badge>
            </div>
            <p className='max-w-3xl text-sm text-muted-foreground'>
              Showcase the extracted Figma foundations, typography scales, color palette and component inventory for the
              development environment.
            </p>
          </div>
        </div>
      </section>

      <section className='grid gap-4 lg:grid-cols-[1.4fr_0.6fr]'>
        <Card className='overflow-hidden'>
          <CardHeader>
            <CardTitle>Color palette</CardTitle>
          </CardHeader>
          <CardContent className='grid gap-3'>
            <div className='grid gap-3 sm:grid-cols-2'>
              {colors.map((color) => (
                <div key={color.label} className='rounded-3xl overflow-hidden border border-border'>
                  <div className='h-20' style={{ backgroundColor: color.value }} />
                  <div className='space-y-1 p-4'>
                    <p className='font-semibold text-foreground'>{color.label}</p>
                    <p className='text-sm text-muted-foreground'>{color.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Typography</CardTitle>
          </CardHeader>
          <CardContent className='grid gap-4'>
            <div className='grid gap-3 sm:grid-cols-2'>
              {typography.map((token) => (
                <div key={token.label} className='rounded-3xl border border-border bg-background p-4'>
                  <p className='text-sm text-muted-foreground'>{token.label}</p>
                  <p className='mt-2 text-lg font-semibold text-foreground'>{token.value}</p>
                  <p className='text-sm text-secondary-foreground'>{token.description}</p>
                </div>
              ))}
            </div>
            <div className='rounded-3xl border border-border bg-surface p-6'>
              <p className='text-display-hero font-display text-primary'>Display / Hero — “Antes da Tela”</p>
              <p className='mt-4 text-heading-2 font-display text-foreground'>
                Heading 2 sample text for a section title.
              </p>
              <p className='mt-3 text-body-default text-secondary-foreground'>
                Body default is used for normal paragraph copy, with good readability and consistent spacing in dark
                mode layouts.
              </p>
              <p className='mt-3 text-label-mono-default font-mono text-text-secondary'>
                DM Mono label example — token names, metadata, cues.
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className='grid gap-4'>
        <Card>
          <CardHeader>
            <CardTitle>Design system inventory</CardTitle>
            <p className='text-sm text-muted-foreground'>Tokens + components identified from the Figma source file.</p>
          </CardHeader>
          <CardContent className='grid gap-3'>
            <div className='grid gap-2 sm:grid-cols-2'>
              {[
                'Button',
                'Tag',
                'Input',
                'Card',
                'ScriptCard',
                'NavBar',
                'Comment',
                'MetricCard',
                'Dropdown',
                'RadioBox',
                'DragZone',
                'Progress',
                'Info',
              ].map((component) => (
                <span
                  key={component}
                  className='inline-flex rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-muted-foreground'>
                  {component}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      <section className='grid gap-4'>
        <Card>
          <CardHeader>
            <CardTitle>Component previews</CardTitle>
            <p className='text-sm text-muted-foreground'>Live previews of the new NavBar and Info components.</p>
          </CardHeader>
          <CardContent className='grid gap-6'>
            <NavBar
              items={[
                { label: 'Home', active: true, href: '/' },
                { label: 'Scripts', href: '/scripts' },
                { label: 'Library', href: '/library' },
              ]}
            />
            <Info
              title='Design system guidance'
              description='Use dark surfaces, clear contrast, and the semantic accent color for primary actions. Keep the layout spacious and the navigation minimal.'
              badge='Guideline'
            />
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
