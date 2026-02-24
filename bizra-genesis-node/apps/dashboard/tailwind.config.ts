import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/**/*.{ts,tsx}',
  ],
  theme: {
  	extend: {
  		colors: {
  			bizra: {
  				gold: 'rgb(var(--bizra-gold) / <alpha-value>)',
  				'gold-light': 'rgb(var(--bizra-gold-light) / <alpha-value>)',
  				'gold-dark': 'rgb(var(--bizra-gold-dark) / <alpha-value>)',
  				black: 'rgb(var(--bizra-black) / <alpha-value>)',
  				dark: 'rgb(var(--bizra-dark) / <alpha-value>)',
  				surface: 'rgb(var(--bizra-surface) / <alpha-value>)',
  				border: 'rgb(var(--bizra-border) / <alpha-value>)',
  				teal: 'rgb(var(--bizra-teal) / <alpha-value>)',
  				'teal-dark': 'rgb(var(--bizra-teal-dark) / <alpha-value>)'
  			},
  			gold: {
  				'400': '#D4B875',
  				'500': '#C9A962',
  				'600': '#B08D45'
  			},
  			navy: {
  				'700': '#111F33',
  				'800': '#0A1628',
  				'900': '#050B14'
  			},
  			teal: {
  				'400': '#2A9D8F',
  				'500': '#21867A'
  			},
  			pat: {
  				'master-reasoner': 'rgb(var(--pat-master-reasoner) / <alpha-value>)',
  				'memory-architect': 'rgb(var(--pat-memory-architect) / <alpha-value>)',
  				'creative-synthesizer': 'rgb(var(--pat-creative-synthesizer) / <alpha-value>)',
  				'data-analyzer': 'rgb(var(--pat-data-analyzer) / <alpha-value>)',
  				communicator: 'rgb(var(--pat-communicator) / <alpha-value>)',
  				'execution-planner': 'rgb(var(--pat-execution-planner) / <alpha-value>)',
  				'ethics-guardian': 'rgb(var(--pat-ethics-guardian) / <alpha-value>)'
  			},
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		fontFamily: {
  			sans: [
  				'Inter',
  				'var(--font-arabic)',
  				'system-ui',
  				'sans-serif'
  			],
  			serif: [
  				'Playfair Display',
  				'Georgia',
  				'serif'
  			],
  			mono: [
  				'JetBrains Mono',
  				'Fira Code',
  				'monospace'
  			],
  			arabic: [
  				'var(--font-arabic)',
  				'Noto Sans Arabic',
  				'system-ui',
  				'sans-serif'
  			]
  		},
  		animation: {
  			'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
  			float: 'float 6s ease-in-out infinite',
  			glow: 'glow 2s ease-in-out infinite alternate',
  			'spin-slow': 'spin 20s linear infinite',
  			'pulse-glow': 'pulseGlow 4s ease-in-out infinite'
  		},
  		keyframes: {
  			float: {
  				'0%, 100%': {
  					transform: 'translateY(0px)'
  				},
  				'50%': {
  					transform: 'translateY(-10px)'
  				}
  			},
  			glow: {
  				'0%': {
  					boxShadow: '0 0 20px rgba(201, 169, 98, 0.3)'
  				},
  				'100%': {
  					boxShadow: '0 0 40px rgba(201, 169, 98, 0.6)'
  				}
  			},
  			pulseGlow: {
  				'0%, 100%': {
  					opacity: '0.6',
  					boxShadow: '0 0 20px rgba(201, 169, 98, 0.1)'
  				},
  				'50%': {
  					opacity: '1',
  					boxShadow: '0 0 40px rgba(201, 169, 98, 0.3)'
  				}
  			}
  		},
  		backdropBlur: {
  			xs: '2px'
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		}
  	}
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
