'use client'

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  Separator,
  SidebarTrigger,
} from '@cognetcn/ui'
import { usePathname, useRouter } from 'next/navigation'

// TODO: Import this from your route helpers
// import { getBreadcrumbMenuItems } from '@/router/route-helpers'

// Temporary placeholder function - replace with actual implementation
const getBreadcrumbMenuItems = (pathname: string) => {
  // This is a placeholder - implement based on your route structure
  return []
}

export default function Header() {
  const pathname = usePathname()
  const router = useRouter()

  const getBreadcrumbs = () => {
    const breadcrumbItems = getBreadcrumbMenuItems(pathname)

    for (const item of breadcrumbItems) {
      // 정확한 경로 매칭
      if (item.to === pathname) {
        return [{ title: item.title, path: item.to }]
      }

      // 동적 라우트와 서브 아이템 처리
      if (item.items) {
        for (const subItem of item.items) {
          if (!subItem.to) continue

          // :noticeId와 :projectId 모두 처리
          const pathPattern = subItem.to
            .replace(/:noticeId/g, '[^/]+')
            .replace(/:projectId/g, '[^/]+')
          const regex = new RegExp(`^${pathPattern}$`)

          if (regex.test(pathname)) {
            return [
              { title: item.title, path: item.to },
              { title: subItem.title, path: subItem.to },
            ]
          }
        }
      }
    }

    return [
      { title: '메뉴', path: '#' },
      { title: '하위메뉴', path: '#' },
    ]
  }

  const breadcrumbs = getBreadcrumbs()

  const handleBreadcrumbClick = (e: React.MouseEvent, path: string | undefined) => {
    if (path && path !== '#') {
      e.preventDefault()
      router.push(path)
    }
  }

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
  )
}
