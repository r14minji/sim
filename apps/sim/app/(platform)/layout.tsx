'use client'

import { SidebarInset, SidebarProvider } from '@cognetcn/ui'

import { AppSidebar } from './_components/app-sidebar/app-sidebar'
import Header from './_components/header/header'

export default function PlatformLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Header />
        <div className='flex flex-1 flex-col gap-4 p-4 pt-0'>{children}</div>
      </SidebarInset>
    </SidebarProvider>
  )
}
