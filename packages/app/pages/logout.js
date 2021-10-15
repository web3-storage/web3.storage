import Router from 'next/router'
import { getMagic } from '../lib/magic.js'

export default function Logout() {
  await getMagic().user.logout()
  return Router.push('/')
}

