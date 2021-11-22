import clsx from 'clsx';
import countly from '../../lib/countly'
import Button from '../button'

import Grid3D from '../../assets/illustrations/grid3D'
import GradientBackground from '../../assets/illustrations/gradient-background'
import Squiggle from '../../assets/illustrations/squiggle'
import Corkscrew from '../../assets/illustrations/corkscrew'
import Helix from '../../assets/illustrations/helix'
import Zigzag from '../../assets/illustrations/zigzag'
import Coil from '../../assets/illustrations/coil'
import Cross from '../../assets/illustrations/cross'
import Triangle from '../../assets/illustrations/triangle'

// @ts-ignore
import styles from './hero.module.css'

/**
 * @param {Object} props.headerContent
*/

export default function Hero({headerContent}) {
  return (
    <div className={ clsx("relative w-full z-0 flex", styles.container) }>
      <div className={ styles.topSection }>

        <div className={ styles.artworkContainer }>
          <GradientBackground className={ styles.gradientBackground }/>
          <Grid3D className={ styles.grid3D }/>
          <Squiggle className={ clsx("image-container", styles.illustration, styles.squiggle) }/>
          <Corkscrew className={ clsx(styles.illustration, styles.corkscrew) }/>
          <Zigzag className={ clsx(styles.illustration, styles.zigzag) }/>
          <Helix className={ clsx(styles.illustration, styles.helixSmall) }/>
          <Coil className={ clsx(styles.illustration, styles.coil) }/>
          <Cross className={ clsx(styles.illustration, styles.cross) }/>
          <Triangle className={ clsx(styles.illustration, styles.triangle) }/>
        </div>

        <div className="mx-auto max-w-4xl text-center pt-6 md:pt-20">
          <hgroup className="text-w3storage-purple mb-16 px-4">
            <h1 className="mb-10 text-4xl sm:text-5xl md:text-7xl">{ headerContent.columns[0].heading }</h1>
            <h2 className="space-grotesk text-xl sm:text-2xl typography-hero-subtitle mb-5">{ headerContent.columns[0].subheading }</h2>
          </hgroup>
          <Button
            href="/login"
            id="getting-started"
            wrapperClassName="flex mx-auto w-48"
            tracking={{ ui: countly.ui.HOME_HERO, action: "Get Started" }}>
            START STORING NOW
          </Button>
        </div>

      </div>
    </div>
  )
}
