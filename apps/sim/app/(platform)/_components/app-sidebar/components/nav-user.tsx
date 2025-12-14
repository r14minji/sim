'use client'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Icon,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@cognetcn/ui'
import {
  BookOpen,
  GalleryVerticalEnd,
  LogOut,
  LucideIcon,
  Settings,
  UserCircle,
} from 'lucide-react'
import Link from 'next/link'

// TODO: Implement keycloak integration
// import { useKeycloak } from '@/providers/authProvider'

interface MenuItem {
  icon: LucideIcon
  label: string
  href?: string
  onClick?: () => void
}

export function NavUser({
  user,
}: {
  user: {
    name: string | undefined
    email: string | undefined
    avatar: string | undefined
  }
}) {
  const { isMobile } = useSidebar()
  // TODO: Implement keycloak logout
  // const { logout } = useKeycloak()

  const logout = () => {
    // TODO: Implement logout functionality
    console.log('Logout clicked')
  }

  const menuItems: MenuItem[] = [
    {
      icon: UserCircle,
      label: '계정정보',
      href: '/me',
    },
    {
      icon: BookOpen,
      label: '사용방법',
      href: '#',
    },
  ]

  const bottomMenuItems: MenuItem[] = [
    {
      icon: LogOut,
      label: '로그아웃',
      onClick: () => {
        logout()
      },
    },
  ]

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size='lg'
              className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground cursor-pointer`'
            >
              <Icon
                icon={GalleryVerticalEnd}
                className='bg-[var(--sidebar-foreground)]'
                color='var(--sidebar-primary-foreground)'
                size={16}
              />
              <div className='grid flex-1 text-left text-sm leading-tight'>
                <span className='truncate font-semibold'>{user.name}</span>
                <span className='truncate text-xs'>{user.email}</span>
              </div>
              <Settings className='ml-auto size-4' />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className='w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg bg-white'
            side={isMobile ? 'bottom' : 'right'}
            align='end'
            sideOffset={4}
          >
            <DropdownMenuLabel className='p-0 font-normal'>
              <div className='flex items-center gap-2 px-1 py-1.5 text-left text-sm'>
                <Icon
                  icon={GalleryVerticalEnd}
                  className='bg-[var(--sidebar-foreground)]'
                  color='var(--sidebar-primary-foreground)'
                  size={16}
                />
                <div className='grid flex-1 text-left text-sm leading-tight'>
                  <span className='truncate font-semibold'>{user.name}</span>
                  <span className='truncate text-xs'>{user.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />

            <DropdownMenuGroup>
              {menuItems.map((item) => (
                <DropdownMenuItem key={item.label} asChild>
                  {item.href ? (
                    <Link href={item.href} className='flex items-center gap-2 w-full cursor-pointer'>
                      <item.icon className='mr-2 h-4 w-4' />
                      <span>{item.label}</span>
                    </Link>
                  ) : (
                    <button
                      className='flex items-center gap-2 w-full cursor-pointer'
                      onClick={item.onClick}
                    >
                      <item.icon className='mr-2 h-4 w-4' />
                      <span>{item.label}</span>
                    </button>
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
            <DropdownMenuSeparator />

            {bottomMenuItems.map((item) => (
              <DropdownMenuItem key={item.label} asChild>
                <button
                  className='flex items-center gap-2 w-full cursor-pointer'
                  onClick={item.onClick}
                >
                  <item.icon className='mr-2 h-4 w-4' />
                  <span>{item.label}</span>
                </button>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
