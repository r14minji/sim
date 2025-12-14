react에서의 PlatformLayout이야.

import { ReactNode } from 'react';

import { SidebarInset, SidebarProvider } from '@cognetcn/ui';
import { Outlet } from 'react-router-dom';

import { AppSidebar } from '@/components/AppSidebar';
import Header from '@/components/Header';

interface PlatformLayoutProps {
children?: ReactNode;
}

export default function PlatformLayout({ children }: PlatformLayoutProps) {
return (
<SidebarProvider>
<AppSidebar />
<SidebarInset>

<Header />
<div className='flex flex-1 flex-col gap-4 p-4 pt-0'>{children || <Outlet />}</div>
</SidebarInset>
</SidebarProvider>
);
}

여기서 우선은 appsidebar가 핵심이고 이 컴포넌트는

import { useEffect, useState } from 'react';

import {
Sidebar,
SidebarContent,
SidebarFooter,
SidebarHeader,
SidebarRail,
useSidebar,
} from '@cognetcn/ui';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';

import hoverLogo from '@/assets/images/hover_logo.png';
import plugnetLogo from '@/assets/images/plugnet_logo.png';
import plugnetLogoMini from '@/assets/images/plugnet_logo_mini.png';
import { cn } from '@/lib/tailwind/config';
import { getNavMenuItems } from '@/router/route-helpers';
import { useUserProfile } from '@/services/user';
import { setUserProfile } from '@/store/slices/userSlice';

import { NavMain } from './NavMain';
import { NavUser } from './NavUser';
import { SidebarTeamSelect } from './SidebarTeamSelect';

export function AppSidebar({ className, ...props }: React.ComponentProps<typeof Sidebar>) {
const { state } = useSidebar();
const dispatch = useDispatch();

const [isHovered, setIsHovered] = useState(false);

const { data: userProfileData } = useUserProfile();

useEffect(() => {
if (userProfileData?.data.data) {
dispatch(
setUserProfile({
storageId: userProfileData.data.data.storageId,
username: userProfileData.data.data.username,
name: userProfileData.data.data.name,
email: userProfileData.data.data.email,
authorities: userProfileData.data.data.authorities || [],
}),
);
}
}, [userProfileData?.data.data, dispatch]);

const data = {
user: {
name: userProfileData?.data.data.name,
email: userProfileData?.data.data.email,
avatar: userProfileData?.data.data.name ? userProfileData.data.data.name.charAt(0) : '',
},
navMain: getNavMenuItems(),
};

return (
<Sidebar
collapsible='icon'
className={cn('transition-all duration-300 bg-gray-50', className)}
{...props} >
<SidebarHeader
className={`flex justify-center items-center bg-gray-50 ${state === 'collapsed' ? 'p-2' : 'p-4'}`} >

<Link to='/'>
<img
src={state === 'collapsed' ? (isHovered ? hoverLogo : plugnetLogoMini) : plugnetLogo}
alt='logo'
style={{
              width: state === 'collapsed' ? '32px' : '120px',
              height: 'auto',
            }}
onMouseEnter={() => setIsHovered(true)}
onMouseLeave={() => setIsHovered(false)}
/>
</Link>
</SidebarHeader>
<SidebarContent className='bg-gray-50'>
<SidebarTeamSelect />
<NavMain items={data.navMain} />
</SidebarContent>
<SidebarFooter className='bg-gray-50'>
<NavUser user={data.user} />
</SidebarFooter>
<SidebarRail />
</Sidebar>
);
}

이와 같아.

컴포넌트 하나씩 이관할거라. 우선은 SidebarTeamSelect, NavUser 컴포넌트는 주석처리할거고

Logo로 사용된 이미지는 현재 sim에 있는 아무 이미지나 사용해도 괜찮아.

react-router-dom'

대신에 next/router를 사용해야하고

지금처럼 레이아웃인데 컴포넌트가 여러개로 나뉘어져있는경우 파일 관리를 어떻게 해야하는지도 궁금해. sim 구조에 맞게 제안해줘
NavMain.tsx

```
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
} from '@cognetcn/ui';
import { ChevronRight } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

import { MenuItem } from '@/constants/MENU';
import { useKeycloak } from '@/providers/authProvider';
import { hasAnyRole } from '@/utils/roles';

// 활성화된 메뉴 아이템의 스타일 상수
const ACTIVE_MENU_CLASS = 'bg-gray-200';

interface NavMainProps {
  items: MenuItem[];
}

const hasSubItems = (
  item: MenuItem,
): item is MenuItem & { items: NonNullable<MenuItem['items']> } => {
  return Boolean(item.items?.length);
};

// URL이 활성 상태인지 확인하는 함수 - 정확히 일치하는 경우만 활성화
const isActiveUrl = (itemPath: string | undefined, currentPath: string): boolean => {
  if (!itemPath) return false;
  return itemPath === currentPath;
};

interface MenuItemContentProps {
  icon?: React.ComponentType | null;
  title: string;
}

const MenuItemContent = ({ icon: Icon, title }: MenuItemContentProps) => (
  <>
    {Icon && <Icon />}
    <span>{title}</span>
  </>
);

interface ExpandedMenuItemProps {
  item: MenuItem;
  isActive: boolean;
}

const ExpandedMenuItem = ({ item, isActive }: ExpandedMenuItemProps) => {
  if (!hasSubItems(item)) {
    return (
      <SidebarMenuItem key={item.title}>
        <SidebarMenuButton asChild className={isActive ? ACTIVE_MENU_CLASS : ''}>
          {item.to ? (
            <Link to={item.to}>
              <MenuItemContent icon={item.icon} title={item.title} />
            </Link>
          ) : (
            <div>
              <MenuItemContent icon={item.icon} title={item.title} />
            </div>
          )}
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  }

  const isOpen = item.isActive;

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
              <Link to={item.items[0].to}>
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
              const isSubItemActive = subItem.to
                ? isActiveUrl(subItem.to, location.pathname)
                : false;

              return (
                <SidebarMenuSubItem key={subItem.title}>
                  <SidebarMenuSubButton
                    asChild
                    className={isSubItemActive ? ACTIVE_MENU_CLASS : ''}
                  >
                    {subItem.to ? (
                      <Link to={subItem.to}>
                        <span>{subItem.title}</span>
                      </Link>
                    ) : (
                      <span>{subItem.title}</span>
                    )}
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              );
            })}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  );
};

interface CollapsedMenuItemProps {
  item: MenuItem;
  isActive: boolean;
}

const CollapsedMenuItem = ({ item, isActive }: CollapsedMenuItemProps) => {
  if (!hasSubItems(item)) {
    return (
      <SidebarMenuItem key={item.title}>
        <SidebarMenuButton
          asChild
          tooltip={item.title}
          className={isActive ? ACTIVE_MENU_CLASS : ''}
        >
          {item.to ? (
            <Link to={item.to}>
              <MenuItemContent icon={item.icon} title={item.title} />
            </Link>
          ) : (
            <div>
              <MenuItemContent icon={item.icon} title={item.title} />
            </div>
          )}
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
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
            const isSubItemActive = subItem.to ? isActiveUrl(subItem.to, location.pathname) : false;

            return (
              <DropdownMenuItem
                key={subItem.title}
                asChild
                className={isSubItemActive ? ACTIVE_MENU_CLASS : ''}
              >
                {subItem.to ? (
                  <Link to={subItem.to} className='flex w-full items-center'>
                    <span>{subItem.title}</span>
                  </Link>
                ) : (
                  <span>{subItem.title}</span>
                )}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  );
};

export function NavMain({ items }: NavMainProps) {
  const { state } = useSidebar();
  const { keycloak } = useKeycloak();
  const location = useLocation();
  const isExpanded = state !== 'collapsed';

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Platform</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          if (item.roles?.length > 0 && !hasAnyRole(keycloak?.tokenParsed, item.roles)) {
            return null;
          }

          // 현재 메뉴가 활성화되었는지 확인
          // 정확히 일치하는 경우에만 활성화
          const isItemActive = item.to ? isActiveUrl(item.to, location.pathname) : false;

          return isExpanded ? (
            <ExpandedMenuItem key={item.title} item={item} isActive={isItemActive} />
          ) : (
            <CollapsedMenuItem key={item.title} item={item} isActive={isItemActive} />
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
```

NavUser.tsx

```
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
} from '@cognetcn/ui';
import {
  BookOpen,
  GalleryVerticalEnd,
  LogOut,
  LucideIcon,
  Settings,
  UserCircle,
} from 'lucide-react';
import { Link } from 'react-router-dom';

import { useKeycloak } from '@/providers/authProvider';

interface MenuItem {
  icon: LucideIcon;
  label: string;
  href?: string;
  onClick?: () => void;
}

export function NavUser({
  user,
}: {
  user: {
    name: string | undefined;
    email: string | undefined;
    avatar: string | undefined;
  };
}) {
  const { isMobile } = useSidebar();
  const { logout } = useKeycloak();

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
  ];

  const bottomMenuItems: MenuItem[] = [
    {
      icon: LogOut,
      label: '로그아웃',
      onClick: () => {
        logout();
      },
    },
  ];

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
                    <Link to={item.href} className='flex items-center gap-2 w-full cursor-pointer'>
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
  );
}

```

Header.tsx

```
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  Separator,
  SidebarTrigger,
} from '@cognetcn/ui';
import { useLocation, useNavigate } from 'react-router-dom';

import { getBreadcrumbMenuItems } from '@/router/route-helpers';

export default function Header() {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const getBreadcrumbs = () => {
    const breadcrumbItems = getBreadcrumbMenuItems(pathname);

    for (const item of breadcrumbItems) {
      // 정확한 경로 매칭
      if (item.to === pathname) {
        return [{ title: item.title, path: item.to }];
      }

      // 동적 라우트와 서브 아이템 처리
      if (item.items) {
        for (const subItem of item.items) {
          if (!subItem.to) continue;

          // :noticeId와 :projectId 모두 처리
          const pathPattern = subItem.to
            .replace(/:noticeId/g, '[^/]+')
            .replace(/:projectId/g, '[^/]+');
          const regex = new RegExp(`^${pathPattern}$`);

          if (regex.test(pathname)) {
            return [
              { title: item.title, path: item.to },
              { title: subItem.title, path: subItem.to },
            ];
          }
        }
      }
    }

    return [
      { title: '메뉴', path: '#' },
      { title: '하위메뉴', path: '#' },
    ];
  };

  const breadcrumbs = getBreadcrumbs();

  const handleBreadcrumbClick = (e: React.MouseEvent, path: string | undefined) => {
    if (path && path !== '#') {
      e.preventDefault();
      navigate(path);
    }
  };

  return (
    <header className='flex py-3 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12'>
      <div className='flex items-center gap-2 px-4'>
        <SidebarTrigger className='-ml-1' />
        <Separator orientation='vertical' className='mr-2 h-4' />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className='hidden md:block'>
              <BreadcrumbLink
                href='#'
                className={breadcrumbs.length === 1 ? 'font-bold text-foreground' : ''}
                onClick={(e) => handleBreadcrumbClick(e, breadcrumbs[0].path)}
              >
                {breadcrumbs[0].title}
              </BreadcrumbLink>
            </BreadcrumbItem>
            {breadcrumbs.length > 1 && (
              <>
                <BreadcrumbSeparator className='hidden md:block' />
                <BreadcrumbItem>
                  <BreadcrumbPage className='font-bold text-foreground'>
                    {breadcrumbs[1].title}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </>
            )}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <div className='ml-auto flex items-center space-x-4 px-4'></div>
    </header>
  );
}

```

SidebarTeamSelect.tsx

```
import { useEffect } from 'react';

import {
  Icon,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SidebarGroup,
  SidebarGroupLabel,
  useSidebar,
} from '@cognetcn/ui';
import { RectangleEllipsis } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';

import useLocalStorage from '@/hooks/useLocalStorage';
import type { Group } from '@/interfaces';
import { cn } from '@/lib';
import { UserService } from '@/services';
import { RootState } from '@/store';
import { saveGroup } from '@/store/slices/groupSlice';

export function SidebarTeamSelect() {
  const { state } = useSidebar();
  const dispatch = useDispatch();

  const [activeTeam, setActiveTeam] = useLocalStorage<Group | null>('user.team', null);
  const currentGroup = useSelector((state: RootState) => state.group.currentGroup);

  const { data: myGroups } = UserService.useUserGroups('me', {
    currentPage: 1,
    perPage: 100,
    sort: 'createDate,DESC',
  });

  const isScrollable = (myGroups?.data?.data?.length ?? 0) > 5;

  if (!currentGroup && activeTeam) {
    dispatch(saveGroup(activeTeam));
  }

  useEffect(() => {
    setActiveTeam(currentGroup);
  }, [currentGroup]);

  if (!myGroups?.data?.data) {
    return null;
  }

  return (
    <SidebarGroup
      className={cn('border-b border-b-sidebar-border', state === 'collapsed' && 'py-0')}
    >
      <SidebarGroupLabel>Team</SidebarGroupLabel>
      <Select
        value={activeTeam?.id}
        onValueChange={(value) => {
          const selected = myGroups.data.data.find((team: Group) => team.id === value);
          if (selected) dispatch(saveGroup(selected));
        }}
      >
        <SelectTrigger
          className={cn('w-full', state === 'collapsed' && 'p-0 border-none shadow-none')}
          hideDefaultIcon={state === 'collapsed'}
        >
          {state === 'collapsed' ? (
            <Icon
              icon={RectangleEllipsis}
              color='var(--sidebar-foreground)'
              className='cursor-pointer'
            />
          ) : (
            <SelectValue placeholder='팀을 선택하세요.' />
          )}
        </SelectTrigger>

        <SelectContent className={cn('bg-white', isScrollable && 'max-h-46 overflow-auto')}>
          {myGroups.data.data.map((team) => (
            <SelectItem key={team.id} value={team.id}>
              {team.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </SidebarGroup>
  );
}
```
