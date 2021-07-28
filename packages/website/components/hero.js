import Button from './button'

import Wave from '../illustrations/wave'
import CircleNoise from '../illustrations/circle-noise'
import SquiggleAndCircles from '../illustrations/squiggle-and-circles'
import HeroIllustration from '../illustrations/hero-illustration'
import HeroBackgroundLeft from '../illustrations/hero-background-left'
import HeroBackgroundRight from '../illustrations/hero-background-right'

export default function Hero() {
  /** @type {import('react').CSSProperties} */
  const style = { overflow: 'hidden', overflowX: 'clip', overflowY: 'visible'  }
  return (
    <div className="relative w-full z-0" style={style}>
      <div className="md:layout-margins" style={{ height: '40rem' }}>
        <div className="absolute top-0 right-0 left-0 bottom-0 flex items-center z-n1">
          <HeroIllustration className="absolute left-1/2 transform -translate-x-1/2 top-0 w-screen"/>
          <HeroBackgroundLeft className="absolute left-0 bottom-0 h-full"/>
          <HeroBackgroundRight className="absolute right-0 bottom-0 h-full "/>
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 bg-w3storage-red w-full h-full" style={{ maxWidth: 'calc(100vw - 200px)' }} />
          <SquiggleAndCircles className="absolute right-0 left-0 mx-auto animate-pulse" style={{ transform: 'translate3d(-43rem, -5rem, 0)', animationDelay: -1.1 }} />
          <Wave className="absolute right-0 left-0 mx-auto animate-pulse" style={{ transform: 'translate3d(-26rem, 14rem, 0)', height: 72, animationDelay: -1.3 }} />
          <CircleNoise className="absolute right-0 left-0 mx-auto animate-pulse" style={{ transform: 'translate3d(35rem, 7rem, 0)' }} />
        </div>

        <div className="mx-auto max-w-4xl text-center pt-6 md:pt-10">
          <hgroup className="text-w3storage-purple mb-16">
            <h1 className="mb-10">Decentralized Storage Made Simple</h1>
            <h2 className="typography-hero-subtitle mb-5">Build apps backed by Filecoin, no infrastructure required.</h2>
          </hgroup>
          <Button
            href="/login"
            id="getting-started"
            wrapperClassName="flex mx-auto w-48"
          >
            Get Started
          </Button>
        </div>
      </div>
    </div>
  )
}