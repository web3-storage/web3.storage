import clsx from 'clsx';
import Button from '../button'
import TextBlock from '../textblock'

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
 * @param {Object} props.block
*/

export default function Hero({block}) {
  return (
    <div className={ styles.container }>
      <div className={ styles.topSection }>

        <div className={ styles.artworkContainer }>
          <GradientBackground className={ styles.gradientBackground }/>
          <Grid3D className={ styles.grid3D }/>
          <Squiggle className={ clsx(styles.illustration, styles.squiggle) }/>
          <Corkscrew className={ clsx(styles.illustration, styles.corkscrew) }/>
          <Zigzag className={ clsx(styles.illustration, styles.zigzag) }/>
          <Helix className={ clsx(styles.illustration, styles.helixSmall) }/>
          <Coil className={ clsx(styles.illustration, styles.coil) }/>
          <Cross className={ clsx(styles.illustration, styles.cross) }/>
          <Triangle className={ clsx(styles.illustration, styles.triangle) }/>
        </div>

        <div>
          <div>
            <TextBlock block={block}/>
          </div>
        </div>

      </div>
    </div>
  )
}
