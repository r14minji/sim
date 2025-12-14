'use client'

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from '@cognetcn/ui'
import { ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

// TODO: Import from your constants
// import { MenuItem } from '@/constants/MENU'
// import { useKeycloak } from '@/providers/authProvider'
// import { hasAnyRole } from '@/utils/roles'

// Temporary type definition - replace with actual import
interface MenuItem {
  title: string
  to?: string
  icon?: React.ComponentType | null
  items?: MenuItem[]
  isActive?: boolean
  roles?: string[]
}

// 활성화된 메뉴 아이템의 스타일 상수
const ACTIVE_MENU_CLASS = 'bg-gray-200'

interface NavMainProps {
  items: MenuItem[]
}

const hasSubItems = (
  item: MenuItem,
): item is MenuItem & { items: NonNullable<MenuItem['items']> } => {
  return Boolean(item.items?.length)
}

// URL이 활성 상태인지 확인하는 함수 - 정확히 일치하는 경우만 활성화
const isActiveUrl = (itemPath: string | undefined, currentPath: string): boolean => {
  if (!itemPath) return false
  return itemPath === currentPath
}

interface MenuItemContentProps {
  icon?: React.ComponentType | null
  title: string
}

const MenuItemContent = ({ icon: Icon, title }: MenuItemContentProps) => (
  <>
    {Icon && <Icon />}
    <span>{title}</span>
  </>
)

interface ExpandedMenuItemProps {
  item: MenuItem
  isActive: boolean
  pathname: string
}

const ExpandedMenuItem = ({ item, isActive, pathname }: ExpandedMenuItemProps) => {
  if (!hasSubItems(item)) {
    return (
      <SidebarMenuItem key={item.title}>
        <SidebarMenuButton asChild className={isActive ? ACTIVE_MENU_CLASS : ''}>
          {item.to ? (
            <Link href={item.to}>
              <MenuItemContent icon={item.icon} title={item.title} />
            </Link>
          ) : (
            <div>
              <MenuItemContent icon={item.icon} title={item.title} />
            </div>
          )}
        </SidebarMenuButton>
      </SidebarMenuItem>
    )
  }

  const isOpen = item.isActive

  return (
    <Collapsible key={item.title} asChild defaultOpen={isOpen} className='group/collapsible'>
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton
            tooltip={item.title}
            asChild
            className={isActive ? ACTIVE_MENU_CLASS : ''}
          >
            {item.items[0]?.to ? (
              <Link href={item.items[0].to}>
                <MenuItemContent icon={item.icon} title={item.title} />
                <ChevronRight className='ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90' />
              </Link>
            ) : (
              <div>
                <MenuItemContent icon={item.icon} title={item.title} />
                <ChevronRight className='ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90' />
              </div>
            )}
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub>
            {item.items.map((subItem) => {
              const isSubItemActive = subItem.to ? isActiveUrl(subItem.to, pathname) : false

              return (
                <SidebarMenuSubItem key={subItem.title}>
                  <SidebarMenuSubButton asChild className={isSubItemActive ? ACTIVE_MENU_CLASS : ''}>
                    {subItem.to ? (
                      <Link href={subItem.to}>
                        <span>{subItem.title}</span>
                      </Link>
                    ) : (
                      <span>{subItem.title}</span>
                    )}
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              )
            })}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  )
}

interface CollapsedMenuItemProps {
  item: MenuItem
  isActive: boolean
  pathname: string
}

const CollapsedMenuItem = ({ item, isActive, pathname }: CollapsedMenuItemProps) => {
  if (!hasSubItems(item)) {
    return (
      <SidebarMenuItem key={item.title}>
        <SidebarMenuButton
          asChild
          tooltip={item.title}
          className={isActive ? ACTIVE_MENU_CLASS : ''}
        >
          {item.to ? (
            <Link href={item.to}>
              <MenuItemContent icon={item.icon} title={item.title} />
            </Link>
          ) : (
            <div>
              <MenuItemContent icon={item.icon} title={item.title} />
            </div>
          )}
        </SidebarMenuButton>
      </SidebarMenuItem>
    )
  }

  return (
    <SidebarMenuItem key={item.title}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <SidebarMenuButton tooltip={item.title} className={isActive ? ACTIVE_MENU_CLASS : ''}>
            <MenuItemContent icon={item.icon} title={item.title} />
          </SidebarMenuButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className='min-w-[200px] rounded-lg bg-white'
          side='right'
          align='start'
          sideOffset={4}
        >
          {item.items.map((subItem) => {
            const isSubItemActive = subItem.to ? isActiveUrl(subItem.to, pathname) : false

            return (
              <DropdownMenuItem
                key={subItem.title}
                asChild
                className={isSubItemActive ? ACTIVE_MENU_CLASS : ''}
              >
                {subItem.to ? (
                  <Link href={subItem.to} className='flex w-full items-center'>
                    <span>{subItem.title}</span>
                  </Link>
                ) : (
                  <span>{subItem.title}</span>
                )}
              </DropdownMenuItem>
            )
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  )
}

export function NavMain({ items }: NavMainProps) {
  const { state } = useSidebar()
  // TODO: Implement keycloak integration
  // const { keycloak } = useKeycloak()
  const pathname = usePathname()
  const isExpanded = state !== 'collapsed'

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Platform</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          // TODO: Uncomment when keycloak is implemented
          // if (item.roles?.length > 0 && !hasAnyRole(keycloak?.tokenParsed, item.roles)) {
          //   return null
          // }

          // 현재 메뉴가 활성화되었는지 확인
          // 정확히 일치하는 경우에만 활성화
          const isItemActive = item.to ? isActiveUrl(item.to, pathname) : false

          return isExpanded ? (
            <ExpandedMenuItem key={item.title} item={item} isActive={isItemActive} pathname={pathname} />
          ) : (
            <CollapsedMenuItem key={item.title} item={item} isActive={isItemActive} pathname={pathname} />
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}
