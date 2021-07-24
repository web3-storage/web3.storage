import type { ReactChildren } from 'react'

export interface LayoutProps {
  callback?: boolean
  needsUser?: boolean
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
  user?: {
    issuer: string | null
    publicAddress: string | null
    email: string | null
  },
  data: any
}
