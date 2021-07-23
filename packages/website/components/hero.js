import Button from './button'

import Wave from '../illustrations/wave'
import CircleNoise from '../illustrations/circle-noise'
import SquiggleAndCircles from '../illustrations/squiggle-and-circles'
import HeroIllustration from '../illustrations/hero-illustration'
import HeroBackgroundLeft from '../illustrations/hero-background-left'
import HeroBackgroundRight from '../illustrations/hero-background-right'

export default function Hero() {
  return (
    <div className="relative z-1" style={{ overflowX: 'clip' }}>
      <HeroIllustration className="absolute left-1/2 transform -translate-x-1/2 top-0" />
      <div className="layout-margins flex items-center" style={{ height: '47rem' }}>
        <div className="mx-auto max-w-4xl text-center z-10">
          <hgroup className="text-w3storage-purple mb-14">
            <h1 className="mb-14">Decentralized Storage Made Simple</h1>
            <h2 className="typography-hero-subtitle mb-5">Build on Filecoin, no infrastructure required.</h2>
          </hgroup>
          <Button
            href="/login"
            id="getting-started"
            wrapperClassName="flex mx-auto w-48"
          >
            Get Started
          </Button>
        </div>
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 flex justify-between w-full" style={{ minWidth: '1440px' }}>
          <HeroBackgroundLeft />
          <HeroBackgroundRight />
        </div>
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 bg-w3storage-red w-full" style={{ height: '47rem', maxWidth: 'calc(100vw - 140px - 140px)', minWidth: '1160px' }} />
        <SquiggleAndCircles className="absolute right-0 left-0 mx-auto" style={{ transform: 'translate3d(-38rem, -6rem, 0)' }} />
        <Wave className="absolute right-0 left-0 mx-auto" style={{ transform: 'translate3d(-26rem, 14rem, 0)' }} />
        <CircleNoise className="absolute right-0 left-0 mx-auto" style={{ transform: 'translate3d(35rem, 7rem, 0)' }} />
      </div>
    </div>
  )
}