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
