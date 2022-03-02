import OriginalNavbar from '@theme-original/Navbar'
import React, { useEffect } from 'react'

function Navbar (props) {
  // toggle visibility on scroll
  useEffect(() => {
    const doc = document.documentElement
    const w = window
    let prevScroll = w.scrollY || doc.scrollTop
    let curScroll
    let direction = 0
    let prevDirection = 0
    const offset = 100
    const header = document.querySelector('.navbar')
    const checkScroll = function () {
      /*
        ** Find the direction of scroll
        ** 0 - initial, 1 - up, 2 - down
        */
      curScroll = w.scrollY || doc.scrollTop
      if (curScroll > prevScroll) {
        // scrolled up
        direction = 2
      } else if (curScroll < prevScroll) {
        // scrolled down
        direction = 1
      }
      if (direction !== prevDirection) {
        toggleHeader(direction, curScroll)
      }
      if (curScroll < offset) {
        header.classList.remove('show-gradient')
      } else {
        header.classList.add('show-gradient')
      }
      prevScroll = curScroll
    }
    var toggleHeader = function (direction, curScroll) {
      if (direction === 2 && curScroll > offset) {
        header.classList.add('hide')
        prevDirection = direction
      } else if (direction === 1) {
        header.classList.remove('hide')
        if (curScroll > offset) {
          header.classList.add('show-gradient')
        }
        prevDirection = direction
      }
    }
    window.addEventListener('scroll', checkScroll)
  }, [])

  return (
    <OriginalNavbar {...props} />
  )
}

export default Navbar
