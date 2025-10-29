import { createTheme } from '@mui/material/styles'

const brandColors = {
  goldDark: '#C6A132', // hover
  blue1: '#5DB3FF', // gradient light
  blue2: '#257CFF', // gradient dark
  navy: '#2B4A73', // primary text
  creamBg: '#F5F7FB', // page background
  white: '#FFFFFF',
  black: '#111111',
}

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: brandColors.blue2,
      light: brandColors.blue1,
      contrastText: brandColors.white,
    },
    secondary: {
      main: brandColors.goldDark,
      contrastText: brandColors.black,
    },
    text: {
      primary: brandColors.navy,
    },
    background: {
      default: brandColors.creamBg,
      paper: brandColors.white,
    },
    brand: brandColors,
  },
  shape: { borderRadius: 12 },
})
