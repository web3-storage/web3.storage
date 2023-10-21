export const floaters = [
  {
    trigger: 'hero_header',
    duration: 1000,
    offset: 700,
    floaters: [
      {
        id: 'index_hero-squiggle',
        start: {
          rotate: -27,
          scale: 1,
          x: -1,
          y: 1,
        },
        end: {
          rotate: -5,
          scale: 1.2,
          x: -100,
          y: -5,
        },
      },
      {
        id: 'index_hero-corkscrew',
        start: {
          rotate: 115,
          scale: 1,
          x: 1,
          y: 1,
        },
        end: {
          rotate: 130,
          scale: 1.2,
          x: 100,
          y: 20,
        },
      },
      {
        id: 'index_hero-cross',
        start: {
          rotate: 1,
          scale: 1,
          x: 1,
          y: 1,
        },
        end: {
          rotate: -20,
          scale: 1.15,
          x: 50,
          y: 40,
        },
      },
      {
        id: 'index_hero-zigzag',
        start: {
          rotate: -185,
          scale: 1,
          x: -1,
          y: -1,
        },
        end: {
          rotate: -270,
          scale: 1.15,
          x: -40,
          y: 10,
        },
      },
      {
        id: 'index_hero-triangle',
        start: {
          scale: 1,
          rotate: -90,
        },
        end: {
          scale: 1.4,
          rotate: -120,
        },
      },
      {
        id: 'intro_1-coil',
        start: {
          rotate: 17,
          x: 1,
          y: 1,
        },
        end: {
          rotate: 2,
          x: -40,
          y: 32,
        },
      },
      {
        id: 'intro_1-cross',
        start: {
          rotate: -1,
          scale: 1,
          x: -1,
          y: 1,
        },
        end: {
          rotate: -30,
          scale: 1.15,
          x: -40,
          y: 45,
        },
      },
    ],
  },
  {
    trigger: 'intro_2-heading',
    duration: 1000,
    floaters: [
      {
        id: 'intro_2-cross',
        start: {
          scale: 1,
          rotate: -1,
          x: -1,
          y: 1,
        },
        end: {
          scale: 1.3,
          rotate: -30,
          x: -30,
          y: 20,
        },
      },
      {
        id: 'intro_2-triangle',
        start: {
          rotate: -90,
          x: 1,
          y: 1,
        },
        end: {
          rotate: -45,
          x: 80,
          y: 60,
        },
      },
    ],
  },
  {
    trigger: 'section_FAQ_info',
    duration: 1000,
    floaters: [
      {
        id: 'section_FAQ-squiggle',
        default: 'scaleX(-1)',
        start: {
          rotate: 18,
          x: 1,
          y: 1,
        },
        end: {
          rotate: 30,
          x: 25,
          y: 20,
        },
      },
    ],
  },
  {
    trigger: 'section_get-started',
    duration: 1200,
    floaters: [
      {
        id: 'section_get-started-cross',
        default: 'translate(50%, 100%) scaleX(-1)',
        start: {
          rotate: 1,
        },
        end: {
          rotate: 50,
        },
      },
    ],
  },
];
