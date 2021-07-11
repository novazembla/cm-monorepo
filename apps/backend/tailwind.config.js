const windmill = require('@windmill/react-ui/config')

/*
  Please note: 
    This are the Tailwind css settings.
    The Tailwind classes used by @Windmill/* are customized in /src/theme/index.js
*/
module.exports = windmill({
  purge: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      colors : {
        purple : {
          '50': '#fff5ff',
          '100': '#ffebfe',
          '200': '#ffd7fe',
          '300': '#ffbffd',
          '400': '#ff94fa',
          '500': '#ff61f9',
          '600': '#ff3af2',
          '700': '#ff2bd9',
          '800': '#ff21b5',
          '900': '#ff1d96',
        }
      }
    },
    boxShadow: {
      bottom: '0 0px 6px 0px rgba(0, 0, 0, 0.6)',
    },
  },
  variants: {
    extend: {},
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
});
