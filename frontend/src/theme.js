import { createTheme } from '@mui/material/styles';

// Custom color palette
const colors = {
  primary: {
    main: '#1976d2',
    light: '#42a5f5',
    dark: '#1565c0',
    contrastText: '#ffffff',
  },
  secondary: {
    main: '#dc004e',
    light: '#ff5983',
    dark: '#9a0036',
    contrastText: '#ffffff',
  },
  success: {
    main: '#2e7d32',
    light: '#4caf50',
    dark: '#1b5e20',
    contrastText: '#ffffff',
  },
  warning: {
    main: '#ed6c02',
    light: '#ff9800',
    dark: '#e65100',
    contrastText: '#ffffff',
  },
  error: {
    main: '#d32f2f',
    light: '#ef5350',
    dark: '#c62828',
    contrastText: '#ffffff',
  },
  info: {
    main: '#0288d1',
    light: '#03a9f4',
    dark: '#01579b',
    contrastText: '#ffffff',
  },
  grey: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#eeeeee',
    300: '#e0e0e0',
    400: '#bdbdbd',
    500: '#9e9e9e',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
  },
  background: {
    default: '#f5f5f5',
    paper: '#ffffff',
  },
  text: {
    primary: 'rgba(0, 0, 0, 0.87)',
    secondary: 'rgba(0, 0, 0, 0.6)',
    disabled: 'rgba(0, 0, 0, 0.38)',
  },
  divider: 'rgba(0, 0, 0, 0.12)',
};

// Create MUI theme
export const theme = createTheme({
  palette: {
    primary: colors.primary,
    secondary: colors.secondary,
    success: colors.success,
    warning: colors.warning,
    error: colors.error,
    info: colors.info,
    grey: colors.grey,
    background: colors.background,
    text: colors.text,
    divider: colors.divider,
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 300,
      lineHeight: 1.2,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 300,
      lineHeight: 1.3,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 400,
      lineHeight: 1.4,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 400,
      lineHeight: 1.4,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 400,
      lineHeight: 1.4,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 500,
      lineHeight: 1.4,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.5,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.43,
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 8,
  },
  spacing: 8,
  shadows: [
    'none',
    '0px 2px 1px -1px rgba(0,0,0,0.2),0px 1px 1px 0px rgba(0,0,0,0.14),0px 1px 3px 0px rgba(0,0,0,0.12)',
    '0px 3px 1px -2px rgba(0,0,0,0.2),0px 2px 2px 0px rgba(0,0,0,0.14),0px 1px 5px 0px rgba(0,0,0,0.12)',
    '0px 3px 3px -2px rgba(0,0,0,0.2),0px 3px 4px 0px rgba(0,0,0,0.14),0px 1px 8px 0px rgba(0,0,0,0.12)',
    '0px 2px 4px -1px rgba(0,0,0,0.2),0px 4px 5px 0px rgba(0,0,0,0.14),0px 1px 10px 0px rgba(0,0,0,0.12)',
    '0px 3px 5px -1px rgba(0,0,0,0.2),0px 5px 8px 0px rgba(0,0,0,0.14),0px 1px 14px 0px rgba(0,0,0,0.12)',
    '0px 3px 5px -1px rgba(0,0,0,0.2),0px 6px 10px 0px rgba(0,0,0,0.14),0px 1px 18px 0px rgba(0,0,0,0.12)',
    '0px 4px 5px -2px rgba(0,0,0,0.2),0px 7px 10px 1px rgba(0,0,0,0.14),0px 2px 16px 1px rgba(0,0,0,0.12)',
    '0px 5px 5px -3px rgba(0,0,0,0.2),0px 8px 10px 1px rgba(0,0,0,0.14),0px 3px 14px 2px rgba(0,0,0,0.12)',
    '0px 5px 6px -3px rgba(0,0,0,0.2),0px 9px 12px 1px rgba(0,0,0,0.14),0px 3px 16px 2px rgba(0,0,0,0.12)',
    '0px 6px 6px -3px rgba(0,0,0,0.2),0px 10px 14px 1px rgba(0,0,0,0.14),0px 4px 18px 3px rgba(0,0,0,0.12)',
    '0px 6px 7px -4px rgba(0,0,0,0.2),0px 11px 15px 1px rgba(0,0,0,0.14),0px 4px 20px 3px rgba(0,0,0,0.12)',
    '0px 7px 8px -4px rgba(0,0,0,0.2),0px 12px 17px 2px rgba(0,0,0,0.14),0px 5px 22px 4px rgba(0,0,0,0.12)',
    '0px 7px 8px -4px rgba(0,0,0,0.2),0px 13px 19px 2px rgba(0,0,0,0.14),0px 5px 24px 4px rgba(0,0,0,0.12)',
    '0px 7px 9px -4px rgba(0,0,0,0.2),0px 14px 21px 2px rgba(0,0,0,0.14),0px 5px 26px 4px rgba(0,0,0,0.12)',
    '0px 8px 9px -5px rgba(0,0,0,0.2),0px 15px 22px 2px rgba(0,0,0,0.14),0px 6px 28px 5px rgba(0,0,0,0.12)',
    '0px 8px 10px -5px rgba(0,0,0,0.2),0px 16px 24px 2px rgba(0,0,0,0.14),0px 6px 30px 5px rgba(0,0,0,0.12)',
    '0px 8px 11px -5px rgba(0,0,0,0.2),0px 17px 26px 2px rgba(0,0,0,0.14),0px 6px 32px 5px rgba(0,0,0,0.12)',
    '0px 9px 11px -5px rgba(0,0,0,0.2),0px 18px 28px 2px rgba(0,0,0,0.14),0px 7px 34px 6px rgba(0,0,0,0.12)',
    '0px 9px 12px -6px rgba(0,0,0,0.2),0px 19px 29px 2px rgba(0,0,0,0.14),0px 7px 36px 6px rgba(0,0,0,0.12)',
    '0px 10px 13px -6px rgba(0,0,0,0.2),0px 20px 31px 3px rgba(0,0,0,0.14),0px 8px 38px 7px rgba(0,0,0,0.12)',
    '0px 10px 13px -6px rgba(0,0,0,0.2),0px 21px 33px 3px rgba(0,0,0,0.14),0px 8px 40px 7px rgba(0,0,0,0.12)',
    '0px 10px 14px -6px rgba(0,0,0,0.2),0px 22px 35px 3px rgba(0,0,0,0.14),0px 8px 42px 7px rgba(0,0,0,0.12)',
    '0px 11px 14px -7px rgba(0,0,0,0.2),0px 23px 36px 3px rgba(0,0,0,0.14),0px 9px 44px 8px rgba(0,0,0,0.12)',
    '0px 11px 15px -7px rgba(0,0,0,0.2),0px 24px 38px 3px rgba(0,0,0,0.14),0px 9px 46px 8px rgba(0,0,0,0.12)',
    '0px 12px 16px -8px rgba(0,0,0,0.2),0px 25px 40px 3px rgba(0,0,0,0.14),0px 10px 48px 9px rgba(0,0,0,0.12)',
    '0px 12px 17px -8px rgba(0,0,0,0.2),0px 26px 42px 4px rgba(0,0,0,0.14),0px 10px 50px 9px rgba(0,0,0,0.12)',
    '0px 13px 18px -8px rgba(0,0,0,0.2),0px 27px 44px 4px rgba(0,0,0,0.14),0px 11px 52px 10px rgba(0,0,0,0.12)',
    '0px 13px 19px -9px rgba(0,0,0,0.2),0px 28px 46px 4px rgba(0,0,0,0.14),0px 11px 54px 10px rgba(0,0,0,0.12)',
    '0px 14px 19px -9px rgba(0,0,0,0.2),0px 29px 48px 4px rgba(0,0,0,0.14),0px 12px 56px 11px rgba(0,0,0,0.12)',
    '0px 14px 20px -9px rgba(0,0,0,0.2),0px 30px 50px 4px rgba(0,0,0,0.14),0px 12px 58px 11px rgba(0,0,0,0.12)',
    '0px 15px 21px -10px rgba(0,0,0,0.2),0px 31px 52px 4px rgba(0,0,0,0.14),0px 13px 60px 12px rgba(0,0,0,0.12)',
    '0px 15px 22px -10px rgba(0,0,0,0.2),0px 32px 54px 4px rgba(0,0,0,0.14),0px 13px 62px 12px rgba(0,0,0,0.12)',
    '0px 16px 23px -11px rgba(0,0,0,0.2),0px 33px 56px 4px rgba(0,0,0,0.14),0px 14px 64px 13px rgba(0,0,0,0.12)',
    '0px 16px 24px -11px rgba(0,0,0,0.2),0px 34px 58px 4px rgba(0,0,0,0.14),0px 14px 66px 13px rgba(0,0,0,0.12)',
    '0px 17px 25px -12px rgba(0,0,0,0.2),0px 35px 60px 4px rgba(0,0,0,0.14),0px 15px 68px 14px rgba(0,0,0,0.12)',
    '0px 17px 26px -12px rgba(0,0,0,0.2),0px 36px 62px 4px rgba(0,0,0,0.14),0px 15px 70px 14px rgba(0,0,0,0.12)',
    '0px 18px 27px -13px rgba(0,0,0,0.2),0px 37px 64px 4px rgba(0,0,0,0.14),0px 16px 72px 15px rgba(0,0,0,0.12)',
    '0px 18px 28px -13px rgba(0,0,0,0.2),0px 38px 66px 4px rgba(0,0,0,0.14),0px 16px 74px 15px rgba(0,0,0,0.12)',
    '0px 19px 29px -14px rgba(0,0,0,0.2),0px 39px 68px 4px rgba(0,0,0,0.14),0px 17px 76px 16px rgba(0,0,0,0.12)',
    '0px 19px 30px -14px rgba(0,0,0,0.2),0px 40px 70px 4px rgba(0,0,0,0.14),0px 17px 78px 16px rgba(0,0,0,0.12)',
    '0px 20px 31px -15px rgba(0,0,0,0.2),0px 41px 72px 4px rgba(0,0,0,0.14),0px 18px 80px 17px rgba(0,0,0,0.12)',
    '0px 20px 32px -15px rgba(0,0,0,0.2),0px 42px 74px 4px rgba(0,0,0,0.14),0px 18px 82px 17px rgba(0,0,0,0.12)',
    '0px 21px 33px -16px rgba(0,0,0,0.2),0px 43px 76px 4px rgba(0,0,0,0.14),0px 19px 84px 18px rgba(0,0,0,0.12)',
    '0px 21px 34px -16px rgba(0,0,0,0.2),0px 44px 78px 4px rgba(0,0,0,0.14),0px 19px 86px 18px rgba(0,0,0,0.12)',
    '0px 22px 35px -17px rgba(0,0,0,0.2),0px 45px 80px 4px rgba(0,0,0,0.14),0px 20px 88px 19px rgba(0,0,0,0.12)',
    '0px 22px 36px -17px rgba(0,0,0,0.2),0px 46px 82px 4px rgba(0,0,0,0.14),0px 20px 90px 19px rgba(0,0,0,0.12)',
    '0px 23px 37px -18px rgba(0,0,0,0.2),0px 47px 84px 4px rgba(0,0,0,0.14),0px 21px 92px 20px rgba(0,0,0,0.12)',
    '0px 23px 38px -18px rgba(0,0,0,0.2),0px 48px 86px 4px rgba(0,0,0,0.14),0px 21px 94px 20px rgba(0,0,0,0.12)',
    '0px 24px 39px -19px rgba(0,0,0,0.2),0px 49px 88px 4px rgba(0,0,0,0.14),0px 22px 96px 21px rgba(0,0,0,0.12)',
    '0px 24px 40px -19px rgba(0,0,0,0.2),0px 50px 90px 4px rgba(0,0,0,0.14),0px 22px 98px 21px rgba(0,0,0,0.12)',
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 500,
          padding: '8px 16px',
        },
        contained: {
          boxShadow: '0px 2px 4px rgba(0,0,0,0.1)',
          '&:hover': {
            boxShadow: '0px 4px 8px rgba(0,0,0,0.15)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0px 2px 8px rgba(0,0,0,0.1)',
          '&:hover': {
            boxShadow: '0px 4px 16px rgba(0,0,0,0.15)',
            transform: 'translateY(-2px)',
            transition: 'all 0.3s ease',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
        elevation1: {
          boxShadow: '0px 2px 8px rgba(0,0,0,0.1)',
        },
        elevation2: {
          boxShadow: '0px 4px 16px rgba(0,0,0,0.15)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 16,
        },
      },
    },
  },
});

// Export colors for backward compatibility
export { colors };


