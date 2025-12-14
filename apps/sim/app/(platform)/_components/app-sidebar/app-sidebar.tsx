'use client'

import { useEffect, useState } from 'react'

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  useSidebar,
} from '@cognetcn/ui'
// import { useDispatch } from 'react-redux'
import Link from 'next/link'

// TODO: Import actual images
// import hoverLogo from '@/assets/images/hover_logo.png'
// import plugnetLogo from '@/assets/images/plugnet_logo.png'
// import plugnetLogoMini from '@/assets/images/plugnet_logo_mini.png'

// TODO: Import utilities
// import { cn } from '@/lib/tailwind/config'
// import { getNavMenuItems } from '@/router/route-helpers'
// import { useUserProfile } from '@/services/user'
// import { setUserProfile } from '@/store/slices/userSlice'

import { NavMain } from './components/nav-main'
// import { NavUser } from './components/nav-user'
// import { SidebarTeamSelect } from './components/sidebar-team-select'

// Temporary placeholder function - replace with actual implementation
const getNavMenuItems = () => {
  // This is a placeholder - implement based on your menu structure
  return []
}

const cn = (...classes: (string | undefined | false)[]) => {
  return classes.filter(Boolean).join(' ')
}

export function AppSidebar({ className, ...props }: React.ComponentProps<typeof Sidebar>) {
  const { state } = useSidebar()
  // const dispatch = useDispatch()

  const [isHovered, setIsHovered] = useState(false)

  // TODO: Implement user profile fetching
  // const { data: userProfileData } = useUserProfile()

  // Temporary placeholder data
  const userProfileData = {
    data: {
      data: {
        storageId: '',
        username: 'User',
        name: 'User Name',
        email: 'user@example.com',
        authorities: [],
      },
    },
  }

  // TODO: Uncomment when Redux is set up
  // useEffect(() => {
  //   if (userProfileData?.data.data) {
  //     dispatch(
  //       setUserProfile({
  //         storageId: userProfileData.data.data.storageId,
  //         username: userProfileData.data.data.username,
  //         name: userProfileData.data.data.name,
  //         email: userProfileData.data.data.email,
  //         authorities: userProfileData.data.data.authorities || [],
  //       }),
  //     )
  //   }
  // }, [userProfileData?.data.data, dispatch])

  const data = {
    user: {
      name: userProfileData?.data.data.name,
      email: userProfileData?.data.data.email,
      avatar: userProfileData?.data.data.name ? userProfileData.data.data.name.charAt(0) : '',
    },
    navMain: getNavMenuItems(),
  }

  return (
    <Sidebar
      collapsible='icon'
      className={cn('transition-all duration-300 bg-gray-50', className)}
      {...props}
    >
      <SidebarHeader
        className={`flex justify-center items-center bg-gray-50 ${state === 'collapsed' ? 'p-2' : 'p-4'}`}
      >
        <Link href='/'>
          {/* TODO: Replace with actual images */}
          <div
            className='flex items-center justify-center bg-gray-300 rounded'
            style={{
              width: state === 'collapsed' ? '32px' : '120px',
              height: state === 'collapsed' ? '32px' : '40px',
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            LOGO
          </div>
        </Link>
      </SidebarHeader>
      <SidebarContent className='bg-gray-50'>
        {/* TODO: Uncomment when implemented */}
        {/* <SidebarTeamSelect /> */}
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter className='bg-gray-50'>
        {/* TODO: Uncomment when implemented */}
        {/* <NavUser user={data.user} /> */}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
