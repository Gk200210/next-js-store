// postcss.config.js
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';

/** @type {import('postcss').AcceptedPlugin[]} */
export default {
  plugins: [tailwindcss, autoprefixer],
};