/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                dark: {
                    900: '#121212',
                    800: '#1e1e1e',
                    700: '#2c2c2c',
                },
                primary: {
                    500: '#4ade80', // Approximate green from screenshot
                    600: '#22c55e',
                }
            },
        },
    },
    plugins: [],
}
