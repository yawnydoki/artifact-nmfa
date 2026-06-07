export default {
  locales: ['eng', 'tag', 'jap', 'chi', 'kor'],
  output: 'src/locales/$LOCALE.json',
  input: ['src/**/*.{js,jsx}'],
  keepRemoved: true, 
  createOldCatalogs: false,
  keySeparator: false,
  namespaceSeparator: false,
};