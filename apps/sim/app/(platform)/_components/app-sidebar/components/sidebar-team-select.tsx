'use client'

import { useEffect } from 'react'

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
} from '@cognetcn/ui'
import { RectangleEllipsis } from 'lucide-react'
// import { useDispatch, useSelector } from 'react-redux'

// TODO: Import utilities and services
// import useLocalStorage from '@/hooks/useLocalStorage'
// import type { Group } from '@/interfaces'
// import { cn } from '@/lib'
// import { UserService } from '@/services'
// import { RootState } from '@/store'
// import { saveGroup } from '@/store/slices/groupSlice'

// Temporary type definition
interface Group {
  id: string
  name: string
}

// Temporary cn utility
const cn = (...classes: (string | undefined | false)[]) => {
  return classes.filter(Boolean).join(' ')
}

export function SidebarTeamSelect() {
  const { state } = useSidebar()
  // TODO: Implement Redux
  // const dispatch = useDispatch()

  // TODO: Implement useLocalStorage hook
  // const [activeTeam, setActiveTeam] = useLocalStorage<Group | null>('user.team', null)
  // const currentGroup = useSelector((state: RootState) => state.group.currentGroup)

  // Temporary placeholder data
  const activeTeam: Group | null = null
  const currentGroup: Group | null = null

  // TODO: Implement user groups fetching
  // const { data: myGroups } = UserService.useUserGroups('me', {
  //   currentPage: 1,
  //   perPage: 100,
  //   sort: 'createDate,DESC',
  // })

  // Temporary placeholder data
  const myGroups = {
    data: {
      data: [] as Group[],
    },
  }

  const isScrollable = (myGroups?.data?.data?.length ?? 0) > 5

  // TODO: Uncomment when Redux is implemented
  // if (!currentGroup && activeTeam) {
  //   dispatch(saveGroup(activeTeam))
  // }

  // TODO: Uncomment when localStorage hook is implemented
  // useEffect(() => {
  //   setActiveTeam(currentGroup)
  // }, [currentGroup])

  if (!myGroups?.data?.data || myGroups.data.data.length === 0) {
    return null
  }

  return (
    <SidebarGroup
      className={cn('border-b border-b-sidebar-border', state === 'collapsed' && 'py-0')}
    >
      <SidebarGroupLabel>Team</SidebarGroupLabel>
      <Select
        value={activeTeam?.id}
        onValueChange={(value) => {
          // TODO: Implement team selection
          // const selected = myGroups.data.data.find((team: Group) => team.id === value)
          // if (selected) dispatch(saveGroup(selected))
          console.log('Team selected:', value)
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
  )
}
