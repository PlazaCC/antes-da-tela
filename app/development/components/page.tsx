'use client'

import { useState } from 'react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Navigation } from '@/components/ui/navigation'
import { Progress } from '@/components/ui/progress'
import { ReactionBar } from '@/components/ui/reaction-bar'
import { Skeleton } from '@/components/ui/skeleton'
import { StarRating } from '@/components/ui/star-rating'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Tag } from '@/components/ui/tag'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
{
  /* Showcase: Tag */
}
;<section className='grid gap-4'>
  <Card>
    <CardHeader>
      <CardTitle>Tag</CardTitle>
    </CardHeader>
    <CardContent className='flex gap-2 flex-wrap'>
      <Tag>Default</Tag>
      <Tag variant='success'>Success</Tag>
      <Tag variant='warning'>Warning</Tag>
      <Tag variant='error'>Error</Tag>
      <Tag variant='crítico'>Crítico</Tag>
      <Tag variant='importante'>Importante</Tag>
      <Tag variant='neutro'>Neutro</Tag>
      <Tag variant='publicado'>Publicado</Tag>
      <Tag variant='rascunho'>Rascunho</Tag>
      <Tag variant='privado'>Privado</Tag>
      <Tag variant='drama'>Drama</Tag>
      <Tag variant='thriller'>Thriller</Tag>
      <Tag variant='comédia'>Comédia</Tag>
      <Tag variant='type10'>Type10</Tag>
      <Tag variant='new'>New</Tag>
    </CardContent>
  </Card>
</section>

{
  /* Showcase: ReactionBar */
}
;<section className='grid gap-4'>
  <Card>
    <CardHeader>
      <CardTitle>ReactionBar</CardTitle>
    </CardHeader>
    <CardContent>
      <ReactionBar
        reactions={[
          { icon: '👍', label: 'Like', count: 12 },
          { icon: '⭐', label: 'Star', count: 5 },
          { icon: '🔥', label: 'Fire', count: 2 },
        ]}
      />
    </CardContent>
  </Card>
</section>

{
  /* Showcase: StarRating */
}
;<section className='grid gap-4'>
  <Card>
    <CardHeader>
      <CardTitle>StarRating</CardTitle>
    </CardHeader>
    <CardContent>
      <StarRating value={3} />
    </CardContent>
  </Card>
</section>

{
  /* Showcase: Navigation */
}
;<section className='grid gap-4'>
  <Card>
    <CardHeader>
      <CardTitle>Navigation</CardTitle>
    </CardHeader>
    <CardContent>
      <Navigation
        items={[
          { label: 'Home', active: true },
          { label: 'Explore' },
          { label: 'Profile', badge: <span className='bg-primary text-xs px-2 py-0.5 rounded'>3</span> },
        ]}
        orientation='horizontal'
      />
    </CardContent>
  </Card>
</section>

export default function DevelopmentComponentsPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [checked, setChecked] = useState(false)
  const [name, setName] = useState('')
  const [dropdownStatus, setDropdownStatus] = useState('None selected')

  return (
    <div className='grid gap-6'>
      <section className='grid gap-4'>
        <div className='flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between'>
          <div className='space-y-2'>
            <div className='flex items-center gap-3'>
              <h2 className='text-2xl font-semibold'>Component playground</h2>
              <Badge variant='secondary'>Interactive</Badge>
            </div>
            <p className='max-w-3xl text-sm text-muted-foreground'>
              Explore the app’s own shadcn-based components with live examples.
            </p>
          </div>
        </div>
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
              <p className='text-sm text-muted-foreground'>
                Current state: <span className='font-medium'>{name || 'No name'}</span>,{' '}
                <span className='font-medium'>{checked ? 'Agreed' : 'Not agreed'}</span>
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='dialog'>
          <Card>
            <CardHeader>
              <CardTitle>Dialog preview</CardTitle>
              <CardDescription>Open a client-side modal using the app’s dialog wrapper.</CardDescription>
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
                    This dialog is built with the app’s own `Dialog` wrapper and the Radix primitives underneath.
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

      {/* Showcase: Avatar, Progress, Tooltip, Switch, Skeleton */}
      <section className='grid gap-6'>
        <Card>
          <CardHeader>
            <CardTitle>Avatar</CardTitle>
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
            <CardTitle>Switch</CardTitle>
          </CardHeader>
          <CardContent className='flex gap-4 items-center'>
            <Switch />
            <Switch size='sm' />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Skeleton</CardTitle>
          </CardHeader>
          <CardContent className='flex gap-4 items-center'>
            <Skeleton className='h-8 w-32' />
            <Skeleton className='h-8 w-8 rounded-full' />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Tooltip</CardTitle>
          </CardHeader>
          <CardContent className='flex gap-4 items-center'>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button>Hover me</Button>
                </TooltipTrigger>
                <TooltipContent>Tooltip content</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
