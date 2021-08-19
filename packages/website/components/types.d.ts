import type { ReactChildren } from 'react'

export interface LayoutProps {
  callback?: boolean
  needsLoggedIn?: boolean
  redirectTo?: string
  redirectIfFound?: boolean
  title?: string
  description?: string
  pageBgColor?: string
  navBgColor?: string
  footerBgColor?: string
  data?: any
  highlightMessage?: string
}

export interface LayoutChildrenProps {
  isLoggedIn?: boolean
  data: any
}
