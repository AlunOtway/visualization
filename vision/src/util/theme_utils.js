const theme = {
  chalk: {
    backgroundColor: '#161522',
    titleColor: '#fff',
    switchIcon: 'qiehuan_dark.png',
    titleDecorate: 'header_border_dark.png'
  },
  vintage: {
    backgroundColor: '#f0f0f0',
    titleColor: '#000',
    switchIcon: 'qiehuan_light.png',
    titleDecorate: 'header_border_litght.png'
  }
}
export function getThemeObject (themeName) {
  return theme[themeName]
}
