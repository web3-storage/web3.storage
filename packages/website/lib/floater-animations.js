export const addFloaterAnimations = () => {

  const initScrollMagic = async () => {
    if (typeof window !== undefined) {
      const ScrollMagic = (await import('scrollmagic')).default;
      const controller = new ScrollMagic.Controller();

      const scene = new ScrollMagic.Scene({triggerElement: "#intro_2-heading", duration: 800})
        .addTo(controller)
        // .addIndicators() // add indicators (requires plugin)
        .on('update', function (e) {
          // console.log(e.target.controller().info("scrollDirection"));
        })
        .on('enter leave', function (e) {
          // console.log(e.type == "enter" ? "inside" : "outside");
        })
        .on('start end', function (e) {
          // console.log(e.type == "start" ? "top" : "bottom");
        })
        .on('progress', function (e) {
          const y = 1.0 / (1.0 + e.progress);
          const cross = document.getElementById('intro_2-cross');
          cross.style.transform = `translate(200%, -150%) scale(${y})`;
        });
    }
  };

  initScrollMagic();
}
