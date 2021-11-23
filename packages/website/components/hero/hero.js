import clsx from 'clsx';
import countly from '../../lib/countly'
import Button from '../button'

import { ReactComponent as Wave } from 'Illustrations/wave.svg'
import { ReactComponent as CircleNoise } from 'Illustrations/circle-noise.svg'
import { ReactComponent as SquiggleAndCircles } from 'Illustrations/squiggle-and-circles.svg'
import { ReactComponent as HeroIllustration } from 'Illustrations/hero-illustration.svg'
import { ReactComponent as HeroBackgroundLeft } from 'Illustrations/hero-background-left.svg'
import { ReactComponent as HeroBackgroundRight } from 'Illustrations/hero-background-right.svg'
// @ts-ignore
import styles from './hero.module.css'

export default function Hero() {
  return (
    <div className={ clsx("relative w-full z-0 flex", styles.container )}>
      <div className={ clsx("md:layout-margins", styles.topSection) }>
        <div className="absolute top-0 right-0 left-0 bottom-0 flex items-center z-n1 pointer-events-none">
          <HeroIllustration className={clsx("absolute left-1/2 transform -translate-x-1/2 top-0 w-screen hidden sm:block", styles.illustration)} />
          <HeroBackgroundLeft className="absolute left-0 bottom-0 h-full"/>
          <HeroBackgroundRight className="absolute right-0 bottom-0 h-full "/>
          <div className={clsx("absolute top-0 left-1/2 transform -translate-x-1/2 bg-w3storage-red w-full h-full", styles.background) }/>
          <SquiggleAndCircles className="absolute right-0 left-0 mx-auto hidden sm:block" style={{ transform: 'translate3d(-43rem, -5rem, 0)', animationDelay: -1.1 }} />
          <Wave className="absolute right-0 left-0 mx-auto hidden sm:block" style={{ transform: 'translate3d(-26rem, 14rem, 0)', height: 72, animationDelay: -1.3 }} />
          <CircleNoise className="absolute right-0 left-0 mx-auto hidden sm:block" style={{ transform: 'translate3d(35rem, 7rem, 0)' }} />
        </div>

        <div className="mx-auto max-w-4xl text-center pt-6 md:pt-20">
          <hgroup className="text-w3storage-purple mb-16 px-4">
            <h1 className="mb-10 text-4xl sm:text-5xl md:text-7xl">Decentralized Storage Made Simple</h1>
            <h2 className="space-grotesk text-xl sm:text-2xl typography-hero-subtitle mb-5">Build apps backed by Filecoin, no infrastructure required.</h2>
          </hgroup>
          <Button
            href="/login"
            id="getting-started"
            wrapperClassName="flex mx-auto w-48"
            tracking={{ ui: countly.ui.HOME_HERO, action: "Get Started" }}
          >
            Get Started
          </Button>
        </div>
      </div>
    </div>
  )
}