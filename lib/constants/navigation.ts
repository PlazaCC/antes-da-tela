import { LayoutDashboard, BookOpen, Star, Bell, Settings, UserCircle2, FileUpIcon } from 'lucide-react'

export const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', href: '/profile/dashboard', icon: LayoutDashboard, disabled: false },
  { id: 'scripts', label: 'Meus roteiros', href: '/profile/scripts', icon: BookOpen, disabled: false },
  { id: 'ratings', label: 'Avaliações', href: '#', icon: Star, disabled: true },
  { id: 'notifications', label: 'Notificações', href: '#', icon: Bell, disabled: true },
  { id: 'settings', label: 'Configurações', href: '/profile/edit', icon: Settings, disabled: false },
] as const

export const USER_MENU_ITEMS = (userId: string) => [
  { id: 'dashboard', label: 'Dashboard', href: '/profile/dashboard', icon: LayoutDashboard },
  { id: 'scripts', label: 'Meus roteiros', href: '/profile/scripts', icon: BookOpen },
  { id: 'publish', label: 'Publicar Roteiro', href: '/publish', icon: FileUpIcon },
  { id: 'profile', label: 'Ver perfil', href: `/profile/${userId}`, icon: UserCircle2 },
  { id: 'settings', label: 'Configurações', href: '/profile/edit', icon: Settings },
] as const



