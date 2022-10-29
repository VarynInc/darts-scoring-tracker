// tailwind.config.js
module.exports = {
    content: ["./**/*.{html,js,css}"],
    theme: {
      extend: {
        backgroundImage: theme => ({
          'button-open': "url('./assets/empty.png')",
          'button-closed': "url('./assets/strike-3.png')",
          'button-strike-1': "url('./assets/strike-1.png')",
          'button-strike-2': "url('./assets/strike-2.png')"
        })
      }
    }
  }