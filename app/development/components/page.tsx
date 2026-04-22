'use client'

import { useState } from 'react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Comment } from '@/components/comment/comment'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { DragZone } from '@/components/drag-zone/drag-zone'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Info } from '@/components/info/info'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { MetricCard } from '@/components/metric-card/metric-card'

import { Progress } from '@/components/ui/progress'
import { RadioBox } from '@/components/radio-box/radio-box'
import { ReactionBar } from '@/components/comments/reaction-bar'
import { ScriptCard } from '@/components/script-card/script-card'
import { Skeleton } from '@/components/ui/skeleton'
import { StarRating } from '@/components/star-rating/star-rating'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Tag } from '@/components/tag/tag'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

const DEMO_SCRIPTS = [
  { title: 'The Last Draft', author: 'Mariana Ramos', genre: 'Drama', rating: 4.5, pages: 128, status: 'publicado' as const },
  { title: 'Silêncio no Terceiro Ato', author: 'Pedro Alves', genre: 'Thriller', rating: 3.5, pages: 95, status: 'rascunho' as const },
  { title: 'Entre Cenas', author: 'Clara Vaz', genre: 'Comédia', rating: 5, pages: 112, status: 'publicado' as const },
]

export default function DevelopmentComponentsPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [checked, setChecked] = useState(false)
  const [name, setName] = useState('')
  const [dropdownStatus, setDropdownStatus] = useState('None selected')
  const [radioValue, setRadioValue] = useState('first')
  const [starValue, setStarValue] = useState(3.5)
  const [reactionSelected, setReactionSelected] = useState<number | undefined>(undefined)

  return (
    <div className='grid gap-8'>
      <section className='grid gap-4'>
        <div className='flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between'>
          <div className='space-y-2'>
            <div className='flex items-center gap-3'>
              <h2 className='text-2xl font-semibold'>Component playground</h2>
              <Badge variant='secondary'>Interactive</Badge>
            </div>
            <p className='max-w-3xl text-sm text-muted-foreground'>
              Explore the app&apos;s current component set and the new Figma-derived additions.
            </p>
          </div>
        </div>
      </section>

      {/* ScriptCard responsive grid — 1 col mobile → 3 col desktop */}
      <section className='grid gap-4'>
        <h3 className='text-lg font-semibold text-text-primary'>ScriptCard — responsive grid</h3>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
          {DEMO_SCRIPTS.map((script) => (
            <ScriptCard key={script.title} {...script} />
          ))}
        </div>
      </section>

      {/* Tag semantic variants */}
      <section className='grid gap-4'>
        <h3 className='text-lg font-semibold text-text-primary'>Tag — semantic variants</h3>
        <Card>
          <CardContent className='pt-6 flex flex-wrap gap-3'>
            <Tag variant='default'>Default</Tag>
            <Tag variant='success'>Success</Tag>
            <Tag variant='warning'>Warning</Tag>
            <Tag variant='error'>Error</Tag>
            <Tag variant='publicado'>Published</Tag>
            <Tag variant='rascunho'>Draft</Tag>
            <Tag variant='privado'>Private</Tag>
            <Tag variant='crítico'>Critical</Tag>
            <Tag variant='importante'>Important</Tag>
            <Tag variant='neutro'>Neutral</Tag>
            <Tag variant='drama'>Drama</Tag>
            <Tag variant='thriller'>Thriller</Tag>
            <Tag variant='comédia'>Comédia</Tag>
            <Tag variant='new'>New</Tag>
          </CardContent>
        </Card>
      </section>

      {/* StarRating interactive */}
      <section className='grid gap-4'>
        <h3 className='text-lg font-semibold text-text-primary'>StarRating — interactive with half-stars</h3>
        <Card>
          <CardContent className='pt-6 grid gap-6'>
            <div className='flex flex-col gap-2'>
              <p className='text-sm text-text-secondary'>Interactive (hover for half-stars)</p>
              <div className='flex items-center gap-3'>
                <StarRating value={starValue} onChange={setStarValue} allowHalf />
                <span className='font-mono text-label-mono-default text-text-muted'>{starValue.toFixed(1)}</span>
              </div>
            </div>
            <div className='flex flex-col gap-2'>
              <p className='text-sm text-text-secondary'>Read-only states</p>
              <div className='flex flex-col gap-2'>
                {[5, 4.5, 3, 1.5, 0].map((v) => (
                  <div key={v} className='flex items-center gap-3'>
                    <StarRating value={v} readOnly allowHalf />
                    <span className='font-mono text-label-mono-small text-text-muted'>{v.toFixed(1)}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* ReactionBar */}
      <section className='grid gap-4'>
        <h3 className='text-lg font-semibold text-text-primary'>ReactionBar — accessible</h3>
        <Card>
          <CardContent className='pt-6 grid gap-4'>
            <ReactionBar
              selected={reactionSelected}
              onSelect={setReactionSelected}
              reactions={[
                { icon: '👍', label: 'Like', count: 12 },
                { icon: '🔥', label: 'Fire', count: 8 },
                { icon: '💬', label: 'Comment', count: 3 },
                { icon: '⭐', label: 'Favorite', count: 5 },
              ]}
            />
            {reactionSelected !== undefined && (
              <p className='text-sm text-text-muted font-mono'>
                Selected: reaction #{reactionSelected}
              </p>
            )}
          </CardContent>
        </Card>
      </section>



      <Tabs defaultValue='buttons' className='grid gap-4'>
        <TabsList className='grid w-full grid-cols-2 gap-2 sm:grid-cols-4'>
          <TabsTrigger value='buttons'>Buttons</TabsTrigger>
          <TabsTrigger value='forms'>Forms</TabsTrigger>
          <TabsTrigger value='dialog'>Dialog</TabsTrigger>
          <TabsTrigger value='menu'>Dropdown</TabsTrigger>
        </TabsList>

        <TabsContent value='buttons'>
          <div className='grid gap-4 sm:grid-cols-2'>
            <Card>
              <CardHeader>
                <CardTitle>Button variants</CardTitle>
              </CardHeader>
              <CardContent className='grid gap-3'>
                <div className='flex flex-wrap items-center gap-3'>
                  <Button>Primary</Button>
                  <Button variant='secondary'>Secondary</Button>
                  <Button variant='outline'>Outline</Button>
                  <Button variant='ghost'>Ghost</Button>
                </div>
                <div className='flex flex-wrap items-center gap-3'>
                  <Button size='sm'>Small</Button>
                  <Button size='default'>Default</Button>
                  <Button size='lg'>Large</Button>
                  <Button variant='destructive'>Destructive</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Status badges</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='flex flex-wrap gap-2'>
                  <Badge>Default</Badge>
                  <Badge variant='secondary'>Secondary</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value='forms'>
          <Card>
            <CardHeader>
              <CardTitle>Form controls</CardTitle>
              <CardDescription>Use inputs and checkboxes together.</CardDescription>
            </CardHeader>
            <CardContent className='grid gap-4'>
              <div className='grid gap-2'>
                <Label htmlFor='demo-name'>Name</Label>
                <Input
                  id='demo-name'
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder='Enter your name'
                />
              </div>
              <div className='flex items-center gap-2'>
                <Checkbox id='demo-consent' checked={checked} onCheckedChange={(value) => setChecked(Boolean(value))} />
                <Label htmlFor='demo-consent'>Agree to terms</Label>
              </div>
              <div className='grid gap-3 sm:grid-cols-2'>
                <RadioBox
                  name='demo-radio'
                  label='Option one'
                  description='Preferred default flow.'
                  checked={radioValue === 'first'}
                  onChange={() => setRadioValue('first')}
                />
                <RadioBox
                  name='demo-radio'
                  label='Option two'
                  description='Alternative selection for users.'
                  checked={radioValue === 'second'}
                  onChange={() => setRadioValue('second')}
                />
              </div>
              <p className='text-sm text-muted-foreground'>
                Current state: <span className='font-medium'>{name || 'No name'}</span>,{' '}
                <span className='font-medium'>{checked ? 'Agreed' : 'Not agreed'}</span>,{' '}
                <span className='font-medium'>Selected: {radioValue}</span>
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='dialog'>
          <Card>
            <CardHeader>
              <CardTitle>Dialog preview</CardTitle>
              <CardDescription>Open a client-side modal using the app&apos;s dialog wrapper.</CardDescription>
            </CardHeader>
            <CardContent>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button>Open dialog</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Demo dialog</DialogTitle>
                  </DialogHeader>
                  <DialogDescription>
                    This dialog is built with the app&apos;s own `Dialog` wrapper and the Radix primitives underneath.
                  </DialogDescription>
                  <div className='mt-4 space-y-3 text-sm text-muted-foreground'>
                    <p>Try closing it with the button or outside click.</p>
                  </div>
                  <DialogFooter showCloseButton />
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='menu'>
          <Card>
            <CardHeader>
              <CardTitle>Dropdown menu</CardTitle>
              <CardDescription>Interactive menu example.</CardDescription>
            </CardHeader>
            <CardContent>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button>Open menu</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onSelect={() => setDropdownStatus('New file selected')}>New file</DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => setDropdownStatus('Copy selected')}>Copy</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={() => setDropdownStatus('Delete selected')}>Delete</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <p className='mt-4 text-sm text-muted-foreground'>Selection: {dropdownStatus}</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <section className='grid gap-6 lg:grid-cols-2'>
        <Card>
          <CardHeader>
            <CardTitle>Design system components</CardTitle>
            <CardDescription>New Figma-aligned patterns for the project.</CardDescription>
          </CardHeader>
          <CardContent className='grid gap-4'>
            <Info
              title='Design system guidance'
              description='Use dark surfaces, clear contrast, and the semantic accent color for primary actions. Keep the layout spacious and the navigation minimal.'
              badge='Guideline'
            />
            <MetricCard title='Conversion Rate' value='12.4%' variation='+3.2%' color='positive' />
            <MetricCard title='Refunds' value='1.8%' variation='-0.4%' color='negative' />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Interaction patterns</CardTitle>
          </CardHeader>
          <CardContent className='grid gap-4'>
            <DragZone />
            <Comment
              author='Noah Silva'
              content='Great first pass. The pacing feels strong and the second act twist is well-managed.'
              time='2h ago'
              reply='I agree. The resolution paragraph can be tightened.'
            />
          </CardContent>
        </Card>
      </section>

      <section className='grid gap-4 lg:grid-cols-3'>
        <Card>
          <CardHeader>
            <CardTitle>Avatar preview</CardTitle>
          </CardHeader>
          <CardContent className='flex gap-4 items-center'>
            <Avatar>
              <AvatarImage src='/avatar-demo.png' alt='Demo' />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            <Avatar size='sm'>
              <AvatarFallback>SM</AvatarFallback>
            </Avatar>
            <Avatar size='lg'>
              <AvatarFallback>LG</AvatarFallback>
            </Avatar>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Progress</CardTitle>
          </CardHeader>
          <CardContent className='flex flex-col gap-4'>
            <Progress value={30} />
            <Progress value={70} />
            <Progress value={100} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Utilities</CardTitle>
          </CardHeader>
          <CardContent className='grid gap-4'>
            <div className='flex flex-wrap items-center gap-3'>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button>Hover me</Button>
                  </TooltipTrigger>
                  <TooltipContent>Tooltip content</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <Switch />
              <Skeleton className='h-8 w-32' />
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
