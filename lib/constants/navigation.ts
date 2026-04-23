import { LayoutDashboard, BookOpen, Star, Bell, Settings, UserCircle2, FileUpIcon } from 'lucide-react'

export const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', href: '/profile/dashboard', icon: LayoutDashboard, disabled: false, highlighted: false },
  { id: 'scripts', label: 'Meus roteiros', href: '/profile/scripts', icon: BookOpen, disabled: false, highlighted: false },
  { id: 'publish', label: 'Publicar roteiro', href: '/publish', icon: FileUpIcon, disabled: false, highlighted: true },
  { id: 'ratings', label: 'Avaliações', href: '#', icon: Star, disabled: true, highlighted: false },
  { id: 'settings', label: 'Configurações', href: '/profile/edit', icon: Settings, disabled: false, highlighted: false },
] as const

export const USER_MENU_ITEMS = (userId: string) => [
  { id: 'dashboard', label: 'Dashboard', href: '/profile/dashboard', icon: LayoutDashboard, highlighted: false },
  { id: 'scripts', label: 'Meus roteiros', href: '/profile/scripts', icon: BookOpen, highlighted: false },
  { id: 'publish', label: 'Publicar Roteiro', href: '/publish', icon: FileUpIcon, highlighted: true },
  { id: 'profile', label: 'Ver perfil', href: `/profile/${userId}`, icon: UserCircle2, highlighted: false },
  { id: 'notifications', label: 'Notificações', href: '#', icon: Bell, highlighted: false },
  { id: 'settings', label: 'Configurações', href: '/profile/edit', icon: Settings, highlighted: false },
] as const



