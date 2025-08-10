// Centralized theme configuration aligned with root-level theme.json

// Source (theme.json):
// background.color: #a6e5e5, pattern: geometric
// text.primary: #000000, text.secondary: #6c757d
// buttons.primary.background: #007bff, buttons.primary.text: #ffffff
// buttons.error.background: #f8d7da, buttons.error.text: #721c24
// header.background: #ffffff, header.text: #000000
// links.color: #007bff, links.hover: #0056b3
// alerts.error.background: #f8d7da, alerts.error.text: #721c24, alerts.error.border: #f5c6cb

export const colors = {
  primary: '#007bff',
  link: '#007bff',
  linkHover: '#0056b3',
  buttonText: '#ffffff',
  headerBg: '#ffffff',
  headerText: '#000000',
  textPrimary: '#000000',
  textSecondary: '#6c757d',
  errorText: '#721c24',
  errorBg: '#f8d7da',
  errorBorder: '#f5c6cb',
  // Optional convenience color used in some components with a fallback
  successText: '#28a745',
  successBg: '#d4edda',
};

export const background = {
  color: '#a6e5e5',
  pattern: 'geometric',
};

export const gradients = {
  // Keep key name used by the app while basing it on the theme background color
  tealBlue: 'linear-gradient(180deg, #ffffff 0%, #a6e5e5 100%)',
};

export default {
  colors,
  background,
  gradients,
};


