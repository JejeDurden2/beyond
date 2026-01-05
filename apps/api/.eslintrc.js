module.exports = {
  extends: [require.resolve('@beyond/config/eslint/nestjs')],
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
  },
  root: true,
};
