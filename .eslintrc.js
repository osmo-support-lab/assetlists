// eslint-disable-next-line no-undef
module.exports = {
  extends: [
    'canonical',
  ],
  overrides: [
    {
      extends: [
        'canonical/node',
      ],
      files: '*.mjs',
    },
    {
      extends: [
        'canonical/typescript',
      ],
      files: '*.ts',
    },
    {
      extends: [
        'canonical/yaml',
      ],
      files: '*.yml, *.yaml',
    },
  ],
};
