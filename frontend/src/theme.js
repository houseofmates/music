// mandatory theme system - vibecode compliance
export const theme = {
  colors: {
    background: '#050505',
    primary: '#f6b012',
    text: '#ffffff',
    textSecondary: 'rgba(255, 255, 255, 0.7)',
    textTertiary: 'rgba(255, 255, 255, 0.4)',
    surface: '#1a1a1a',
    surfaceHover: '#2a2a2a',
    border: '#333333',
    error: '#ff4444',
    success: '#44ff44',
    warning: '#ffaa44'
  },
  
  typography: {
    fontFamily: 'Varela Round, sans-serif',
    fontSize: {
      xs: '12px',
      sm: '14px',
      base: '16px',
      lg: '18px',
      xl: '24px',
      '2xl': '32px',
      '3xl': '40px'
    },
    fontWeight: {
      normal: 'normal',
      medium: '500',
      semibold: '600',
      bold: 'bold'
    },
    lineHeight: {
      tight: '1.25',
      normal: '1.5',
      relaxed: '1.75'
    }
  },
  
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '20px',
    '2xl': '24px',
    '3xl': '32px',
    '4xl': '40px'
  },
  
  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    full: '50%'
  },
  
  shadows: {
    sm: '0 1px 2px rgba(0, 0, 0, 0.3)',
    md: '0 4px 6px rgba(0, 0, 0, 0.4)',
    lg: '0 10px 15px rgba(0, 0, 0, 0.5)',
    xl: '0 20px 25px rgba(0, 0, 0, 0.6)'
  },
  
  transitions: {
    fast: '150ms ease',
    normal: '250ms ease',
    slow: '350ms ease'
  },
  
  // Touch targets for mobile (44px+)
  touchTarget: {
    min: '44px',
    comfortable: '48px',
    large: '52px'
  }
};

// Global styles injection
export const injectGlobalStyles = () => {
  if (typeof document === 'undefined') return;
  
  const styleId = 'music-app-global-theme';
  
  // Remove existing styles if present
  const existing = document.getElementById(styleId);
  if (existing) existing.remove();
  
  const style = document.createElement('style');
  style.id = styleId;
  style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Varela+Round&display=swap');
    
    * {
      box-sizing: border-box;
    }
    
    body {
      font-family: ${theme.typography.fontFamily};
      background-color: ${theme.colors.background};
      color: ${theme.colors.text};
      margin: 0;
      padding: 0;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      text-rendering: optimizeLegibility;
    }
    
    /* Force all text to lowercase */
    * {
      text-transform: lowercase !important;
    }
    
    /* Preserve case for code, URLs, and acronyms */
    code, pre, .preserve-case, a[href], acronym, abbr {
      text-transform: none !important;
    }
    
    /* Button styles */
    button {
      font-family: ${theme.typography.fontFamily};
      min-height: ${theme.touchTarget.min};
      padding: ${theme.spacing.md} ${theme.spacing.lg};
      background: transparent;
      border: 1px solid ${theme.colors.border};
      border-radius: ${theme.borderRadius.md};
      color: ${theme.colors.text};
      font-size: ${theme.typography.fontSize.sm};
      cursor: pointer;
      transition: all ${theme.transitions.normal};
      outline: none;
    }
    
    button:hover {
      background: ${theme.colors.surfaceHover};
      border-color: ${theme.colors.primary};
    }
    
    button:focus {
      border-color: ${theme.colors.primary};
      box-shadow: 0 0 0 2px rgba(246, 176, 18, 0.2);
    }
    
    button:active {
      transform: translateY(1px);
    }
    
    button.primary {
      background: ${theme.colors.primary};
      color: ${theme.colors.background};
      border-color: ${theme.colors.primary};
    }
    
    button.primary:hover {
      background: #f7c447;
      border-color: #f7c447;
    }
    
    button.danger {
      border-color: ${theme.colors.error};
      color: ${theme.colors.error};
    }
    
    button.danger:hover {
      background: rgba(255, 68, 68, 0.1);
    }
    
    /* Input styles */
    input, textarea, select {
      font-family: ${theme.typography.fontFamily};
      background: ${theme.colors.surface};
      border: 1px solid ${theme.colors.border};
      border-radius: ${theme.borderRadius.md};
      color: ${theme.colors.text};
      font-size: ${theme.typography.fontSize.sm};
      padding: ${theme.spacing.md};
      min-height: ${theme.touchTarget.min};
      transition: all ${theme.transitions.normal};
      outline: none;
    }
    
    input:focus, textarea:focus, select:focus {
      border-color: ${theme.colors.primary};
      box-shadow: 0 0 0 2px rgba(246, 176, 18, 0.2);
    }
    
    /* Link styles */
    a {
      color: ${theme.colors.primary};
      text-decoration: none;
      transition: all ${theme.transitions.normal};
    }
    
    a:hover {
      text-decoration: underline;
    }
    
    /* Scrollbar styles */
    ::-webkit-scrollbar {
      width: 8px;
      height: 8px;
    }
    
    ::-webkit-scrollbar-track {
      background: ${theme.colors.surface};
    }
    
    ::-webkit-scrollbar-thumb {
      background: ${theme.colors.border};
      border-radius: ${theme.borderRadius.full};
    }
    
    ::-webkit-scrollbar-thumb:hover {
      background: ${theme.colors.textTertiary};
    }
    
    /* Selection styles */
    ::selection {
      background: ${theme.colors.primary};
      color: ${theme.colors.background};
    }
    
    /* Focus styles for accessibility */
    :focus-visible {
      outline: 2px solid ${theme.colors.primary};
      outline-offset: 2px;
    }
    
    /* Mobile optimizations */
    @media (max-width: 768px) {
      button {
        min-height: ${theme.touchTarget.comfortable};
        padding: ${theme.spacing.lg} ${theme.spacing.xl};
        font-size: ${theme.typography.fontSize.base};
      }
      
      input, textarea, select {
        min-height: ${theme.touchTarget.comfortable};
        font-size: ${theme.typography.fontSize.base};
      }
    }
    
    /* Dark mode overrides (always dark) */
    @media (prefers-color-scheme: light) {
      body {
        background: ${theme.colors.background} !important;
        color: ${theme.colors.text} !important;
      }
    }
    
    /* Reduce motion for accessibility */
    @media (prefers-reduced-motion: reduce) {
      * {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
      }
    }
    
    /* High contrast mode */
    @media (prefers-contrast: high) {
      button {
        border-width: 2px;
      }
      
      input, textarea, select {
        border-width: 2px;
      }
    }
  `;
  
  document.head.appendChild(style);
};

// Utility function to apply theme to components
export const themed = (componentStyles) => {
  return Object.keys(componentStyles).reduce((acc, key) => {
    const value = componentStyles[key];
    if (typeof value === 'string' && value.startsWith('$')) {
      // Replace theme variables (e.g., $primary) with actual values
      const themePath = value.slice(1).split('.');
      let themeValue = theme;
      for (const path of themePath) {
        themeValue = themeValue?.[path];
      }
      acc[key] = themeValue || value;
    } else {
      acc[key] = value;
    }
    return acc;
  }, {});
};

export default theme;
