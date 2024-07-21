const tailwindcss = require('tailwindcss');
const autoprefixer = require('autoprefixer');
const postcss_import = require('postcss-import');

module.exports = {
    plugins: [postcss_import, tailwindcss('./tailwind.config.cjs'), autoprefixer],
};
