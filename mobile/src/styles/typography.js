import { StyleSheet } from 'react-native';

export const typography = StyleSheet.create({
  // Font families
  text: {
    fontFamily: 'SF-Pro-Display-Regular',
  },
  heading: {
    fontFamily: 'SF-Pro-Display-Bold',
  },
  title: {
    fontFamily: 'SF-Pro-Display-Semibold',
  },
  caption: {
    fontFamily: 'SF-Pro-Display-Light',
  },
  
  // Font sizes
  h1: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  h2: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  h3: {
    fontSize: 24,
    fontWeight: '600',
  },
  h4: {
    fontSize: 20,
    fontWeight: '600',
  },
  body: {
    fontSize: 16,
    fontWeight: 'normal',
  },
  bodySmall: {
    fontSize: 14,
    fontWeight: 'normal',
  },
  caption: {
    fontSize: 12,
    fontWeight: 'normal',
  },
  
  // Colors
  colorWhite: {
    color: '#ffffff',
  },
  colorBlack: {
    color: '#000000',
  },
  colorPrimary: {
    color: '#0095f6',
  },
  colorSecondary: {
    color: '#667eea',
  },
  colorGray: {
    color: '#888888',
  },
  colorLightGray: {
    color: '#cccccc',
  },
  colorDarkGray: {
    color: '#333333',
  },
  colorError: {
    color: '#ff3b30',
  },
  colorSuccess: {
    color: '#00c853',
  },
  colorWarning: {
    color: '#ff9800',
  },
  
  // Text align
  textCenter: {
    textAlign: 'center',
  },
  textLeft: {
    textAlign: 'left',
  },
  textRight: {
    textAlign: 'right',
  },
  
  // Text decoration
  underline: {
    textDecorationLine: 'underline',
  },
  lineThrough: {
    textDecorationLine: 'line-through',
  },
  
  // Line height
  lineHeightSmall: {
    lineHeight: 20,
  },
  lineHeightMedium: {
    lineHeight: 24,
  },
  lineHeightLarge: {
    lineHeight: 28,
  },
  
  // Letter spacing
  letterSpacing: {
    letterSpacing: 0.5,
  },
  
  // Opacity
  opacityLight: {
    opacity: 0.7,
  },
  opacityLighter: {
    opacity: 0.5,
  },
});

// Combined styles
export const textStyles = {
  ...typography,
  header: {
    ...typography.h1,
    ...typography.colorWhite,
  },
  subHeader: {
    ...typography.h2,
    ...typography.colorGray,
  },
  errorText: {
    ...typography.bodySmall,
    ...typography.colorError,
  },
  successText: {
    ...typography.bodySmall,
    ...typography.colorSuccess,
  },
};
