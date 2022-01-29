export const addFloaterAnimations = () => {

  const initScrollMagic = async () => {
    if (typeof window !== undefined) {
      const ScrollMagic = (await import('scrollmagic')).default;
      const controller = new ScrollMagic.Controller();

      const floaters = {
        'intro_2-heading': [
          {
            id: "intro_2-cross",
            default: "translate(200%, -150%)",
            start: {
              scale: 1
            },
            end: {
              scale: 0.5
            }
          },
          {
            id: "intro_2-triangle",
            default: "translate(-150%, -50%)",
            start: {
              rotate: -90
            },
            end: {
              rotate: -135
            }
          }
        ]
      }

      const id = 'intro_2-heading'

      const scene = new ScrollMagic.Scene({triggerElement: "#" + id, duration: 800})
        .addTo(controller)
        .on('progress', function (e) {
          for (let i = 0; i < floaters[id].length; i++) {
            const floater = floaters[id][i];

            const scale = floater.start.scale && floater.end.scale
              ? `scale(${(floater.end.scale - floater.start.scale) * e.progress + floater.start.scale})` : ''
            const rotate = floater.start.rotate && floater.end.rotate
              ? `rotate(${(floater.end.rotate - floater.start.rotate) * e.progress + floater.start.rotate}deg)` : ''

            const el = document.getElementById(floater.id);
            el.style.transform = `${floater.default} ${scale} ${rotate}`;
          }
        });
    }
  };

  initScrollMagic();
}
