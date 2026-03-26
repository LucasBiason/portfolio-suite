import typography from '@tailwindcss/typography'
import forms from '@tailwindcss/forms'
import aspectRatio from '@tailwindcss/aspect-ratio'

/**
 * Nord Theme Color Palette (used in Admin Panel)
 * https://www.nordtheme.com/docs/colors-and-palettes
 */
const nord = {
  0: '#2e3440',
  1: '#3b4252',
  2: '#434c5e',
  3: '#4c566a',
  4: '#d8dee9',
  5: '#e5e9f0',
  6: '#eceff4',
  7: '#8fbcbb',
  8: '#88c0d0',
  9: '#81a1c1',
  10: '#5e81ac',
  11: '#bf616a',
  12: '#d08770',
  13: '#ebcb8b',
  14: '#a3be8c',
  15: '#b48ead',
}

export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  safelist: ['active'],
  theme: {
    container: {
      center: true,
      padding: '1rem',
    },
    extend: {
      fontFamily: {
        header: ['Raleway', 'sans-serif'],
        body: ['Open Sans', 'sans-serif'],
      },
      screens: {
        xs: '375px',
      },
      colors: {
        transparent: 'transparent',

        // Portfolio public colors (original theme)
        // Dynamic theming via CSS custom properties applied by useTheme hook
        primary: '#0047AB',
        'primary-dark': '#002D6B',
        'primary-darker': '#001845',
        accent: '#30A0FF',
        'accent-soft': '#99C8FF',
        background: '#121417',
        secondary: '#121417',
        surface: '#1A1D22',
        white: '#ffffff',
        black: '#000000',
        'grey-10': '#6c6f73',
        'grey-20': '#8b9097',
        'grey-30': '#a4a8af',
        'grey-40': '#cbd0d8',
        'grey-50': '#e3e8f0',
        'hero-gradient-from': 'rgba(0, 71, 171, 0.92)',
        'hero-gradient-to': 'rgba(0, 45, 107, 0.95)',

        // Semantic colors (Aurora-inspired, work in both themes)
        red: nord[11],
        orange: nord[12],
        yellow: nord[13],
        green: nord[14],
        purple: nord[15],

        // Nord palette (for admin panel and direct access)
        nord,
      },
      spacing: {
        13: '3.25rem',
        15: '3.75rem',
        17: '4.25rem',
        18: '4.5rem',
        19: '4.75rem',
        42: '10.5rem',
        76: '19rem',
        84: '21rem',
        88: '22rem',
        92: '23rem',
        100: '25rem',
        104: '26rem',
        108: '27rem',
        112: '28rem',
        116: '29rem',
        120: '30rem',
        124: '31rem',
        128: '32rem',
        132: '33rem',
        136: '34rem',
        140: '35rem',
        144: '36rem',
        148: '37rem',
        152: '38rem',
        156: '39rem',
        160: '40rem',
        164: '41rem',
        168: '42rem',
        172: '43rem',
        176: '44rem',
        180: '45rem',
        184: '46rem',
        188: '47rem',
        190: '48rem',
        194: '49rem',
        200: '50rem',
        204: '51rem',
      },
      zIndex: {
        '-1': '-1',
        60: '60',
        70: '70',
      },
      inset: {
        '2/5': '40%',
      },
      boxShadow: {
        default: '0 10px 30px rgba(0, 24, 69, 0.25)',
        'md-alt': '0 15px 45px rgba(0, 45, 107, 0.25)',
      },
    },
  },
  plugins: [typography, forms, aspectRatio],
}
