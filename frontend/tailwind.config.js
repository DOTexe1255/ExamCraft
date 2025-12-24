/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Institute Admin Theme (Purple/Indigo)
        institute: {
          50: '#f8fafc',
          100: '#f1f5f9',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
        },
        
        // Teacher Theme (Cyan/Blue)
        teacher: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          500: '#06b6d4',
          600: '#0891b2',
          700: '#0e7490',
          800: '#155e75',
          900: '#164e63',
        },
        
        // Student Theme (Emerald/Green)
        student: {
          50: '#f0fdf4',
          100: '#dcfce7',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
        },

        // Exam Status Colors
        status: {
          draft: '#f59e0b',     // Orange
          scheduled: '#3b82f6', // Blue
          active: '#10b981',    // Green
          completed: '#8b5cf6', // Purple
          cancelled: '#ef4444', // Red
        },

        // Dashboard Gradients (used in backgrounds)
        gradient: {
          institute: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
          teacher: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
          student: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        }
      },
      
      // Custom gradients for backgrounds
      backgroundImage: {
        'institute-bg': 'linear-gradient(135deg, #f8fafc 0%, #e0e7ff 100%)',
        'teacher-bg': 'linear-gradient(135deg, #f0fdfa 0%, #cffafe 100%)',
        'student-bg': 'linear-gradient(135deg, #f0fdf4 0%, #d1fae5 100%)',
      },

      // Custom shadows for dashboard cards
      boxShadow: {
        'dashboard': '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'dashboard-hover': '0 20px 40px -10px rgba(0, 0, 0, 0.15), 0 8px 12px -4px rgba(0, 0, 0, 0.1)',
      }
    },
  },
  plugins: [],
}
