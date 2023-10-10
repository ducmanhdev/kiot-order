/** @type {import('tailwindcss').Config} */
export default {
    content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}",],
    theme: {
        extend: {
            screens: {
                'lg': '1800px',
              },
            colors: {
                primary: 'var(--primary)',
                secondary: 'var(--secondary)',
                success: 'var(--success)',
                text: 'var(--text)',
                gray3: 'var(--gray-3)',
                gray4: 'var(--gray-4)',
                black: '#000',
                error: '#FF3333'
            },
        },
        fontSize: {
            xs: ".75rem",
            sm: ".875rem",
            base: "1rem",
            lg: "1.125rem",
            xl: "1.25rem",
            "2xl": "1.5rem",
            "3xl": "1.875rem",
            "4xl": "2.25rem",
            "5xl": "3rem",
            "6xl": "4rem",
            "7xl": "5rem",
            "12px": "12px",
            "14px": "14px",
            "16px": "16px",
            "18px": "18px",
            "20px": "20px",
            "22px": "22px",
            "24px": "24px",
            "26px": "26px",
            "28px": "28px",
            "32px": "32px",
            "36px": "36px",
            "38px": "38px",
            "40px": "40px",
            "42px": "42px",
            "46px": "46px",
            "50px": "50px",
            "60px": "60px",
        },
        screens: {
            'laptop': '1081px',
        }
    },
    daisyui: {
        themes: [
            {
                light: {
                    ...require("daisyui/src/theming/themes")["[data-theme=light]"],
                    'primary': '#C9202C',
                    'primary-content': '#fff',
                    'secondary': '#FF7731',
                    'secondary-content': '#fff',
                    'success': '#23B862',
                    'success-content': '#fff',
                    'base-content': '#1D1D1D',
                    'error-content': '#fff',
                    'placeholder': '#828282',
                    'error': '#FF3333'
                },
            },
        ],
    },
    plugins: [
        require('@tailwindcss/typography'),
        require('@tailwindcss/forms'),
        require("daisyui"),
    ],
}