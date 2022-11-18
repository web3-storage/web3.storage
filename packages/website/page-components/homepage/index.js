import { useEffect } from 'react';

import Scroll2Top from '../../components/scroll2top/scroll2top.js';
import { initFloaterAnimations } from '../../lib/floater-animations.js';
import { floaters } from './constants';
import HeroSection from './hero';
import IntroSection from './intro';
import WhySection from './why';
import FaqSection from './faq';
import GettingStartedSection from './gettingStarted';
import TestimonialsSection from './testimonials';
import ExploreSection from './explore';

export default function Home() {
  useEffect(() => {
    let pageFloaters = {};
    initFloaterAnimations(floaters).then(result => {
      pageFloaters = result;
    });
    return () => {
      if (pageFloaters.hasOwnProperty('destroy')) {
        pageFloaters.destroy();
      }
    };
  }, []);

  return (
    <>
      <main className="page page-index">
        <HeroSection />
        <IntroSection />
        <WhySection />
        <FaqSection />
        <GettingStartedSection />
        <TestimonialsSection />
        <ExploreSection />
      </main>

      <Scroll2Top />
    </>
  );
}
