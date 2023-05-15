module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}', './pages/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#F2F6FF',
          100: '#E0E9FF',
          200: '#D7E2FC',
          300: '#A1BCF7',
          400: '#4B80F2',
          500: '#0C52E8',
          600: '#0648D4',
          700: '#023EBF',
          800: '#0036AB',
          900: '#003096',
        },
        secondary: {
          50: '#DFE2E1',
          100: '#CACECD',
          200: '#A0A7A7',
          300: '#8B9194',
          400: '#767B80',
          500: '#61656C',
          600: '#55565F',
          700: '#494951',
          800: '#3E3C44',
          900: '#333036',
        },
        accent: {
          50: '#EBF7FF',
          100: '#DCF0FC',
          200: '#CFEAFA',
          300: '#C3E3F7',
          400: '#8CC7ED',
          500: '#58ACE3',
          600: '#4899CF',
          700: '#3A87BA',
          800: '#2D76A6',
          900: '#216591',
        },
        brand: {
          berry: '#0024A8',
          'berry-shade': '#001B7C',
          'berry-tint-1': '#2649CA',
          'berry-tint-2': '#64748B',
          indigo: '#0C52E8',
          'indigo-shade': '#023BB4',
          'indigo-tint-1': '#437CF8',
          'indigo-tint-2': '#74A0FF',
          heavenly: '#A7DCFE',
          'heavenly-shade': '#58ACE3',
          'heavenly-tint-1': '#C7E9FF',
          'heavenly-tint-2': '#E3F4FF',
          purple: '#A988F9',
          'purple-shade': '#7D53E2',
          'purple-tint-1': '#D1BEFF',
          'purple-tint-2': '#EBE2FF',
          sunlight: '#FFF6A5',
          'sunlight-shade': '#E8C95D',
          'sunlight-tint-1': '#FFFCDE',
          peachy: '#FBCCCF',
          'peachy-shade': '#E99298',
          'peachy-tint-1': '#FFEDEE',
          pistachio: '#D0FECF',
          'pistachio-shade': '#96E494',
          'pistachio-tint-1': '#EBFFEB',
        },
        alertRed: '#EF4444',
        royalBlue: '#0C52E8',
        successGreen: '#22C55E',
        turquoiseBlue: '#5EC6E8',
      },
      fontFamily: {
        mulish: ['Mulish', 'sans-serif'],
        eudoxus: ['Eudoxus', 'sans-serif'],
      },
      spacing: {
        128: '32rem',
        144: '36rem',
        160: '40rem',
        176: '44rem',
        192: '48rem',
        208: '52rem',
      },
    },
  },
  plugins: [],
};
