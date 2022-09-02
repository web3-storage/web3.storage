export const initFloaterAnimations = async scenes => {
  if (typeof window !== 'undefined') {
    const ScrollMagic = (await import('scrollmagic')).default;
    const controller = new ScrollMagic.Controller();
    const scrollMagicScenes = [];

    for (let i = 0; i < scenes.length; i++) {
      let scene = scenes[i];
      scrollMagicScenes[i] = new ScrollMagic.Scene({
        triggerElement: '#' + scene.trigger,
        triggerHook: 'onEnter',
        offset: scene.offset ? scene.offset : 0,
        duration: scene.duration,
      });
    }
    controller.addScene(scrollMagicScenes);

    const addSceneAnimation = i => {
      const len = scenes[i].floaters.length;
      for (let j = 0; j < len; j++) {
        const xi = scenes[i].floaters[j].start.x;
        const xf = scenes[i].floaters[j].end.x;
        const yi = scenes[i].floaters[j].start.y;
        const yf = scenes[i].floaters[j].end.y;
        const si = scenes[i].floaters[j].start.scale;
        const sf = scenes[i].floaters[j].end.scale;
        const ri = scenes[i].floaters[j].start.rotate;
        const rf = scenes[i].floaters[j].end.rotate;
        const transform = scenes[i].floaters[j].default ? scenes[i].floaters[j].default : '';
        const id = scenes[i].floaters[j].id;

        scrollMagicScenes[i].on('progress', e => {
          const element = document.getElementById(id);

          if (element && !window.matchMedia(`(max-width: 40rem)`).matches) {
            const t = e.progress;
            const x = xi && xf ? (xf - xi) * t + xi : 0;
            const y = yi && yf ? (yf - yi) * t + yi : 0;
            const translate = x && y ? `translate(${x}px, ${y}px)` : '';
            const scale = si && sf ? `scale(${(sf - si) * t + si})` : '';
            const rotate = ri && rf ? `rotate(${(rf - ri) * t + ri}deg)` : '';

            element.style.transform = `${transform} ${translate} ${scale} ${rotate}`;
          }
        });
      }
    };

    for (let i = 0; i < scenes.length; i++) {
      addSceneAnimation(i);
    }

    return controller;
  }
  return false;
};
