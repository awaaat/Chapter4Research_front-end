/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'muted-gray': '#5b6b7a',
                'muted-green': '#4a9d6d',
            },
        },
    },
    plugins: [],
}