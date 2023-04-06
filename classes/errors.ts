import VError from 'verror';

export const GenericError = new VError({
  name: '::~Generic Error~::',
}, 'This is unexpected...');

export const FilePathError = new VError({
  name: '::~File Path Error~::',
}, 'An error in the file path has resulted in a failure.');

export const NoChainRegistry = new VError({
  name: '::~Chain Registry Error~::',
}, 'There is no chain registry... for some reason?');

export const NoIbcConnections = new VError({
  cause: NoChainRegistry,
  name: '::~IBC Connection Error~::',
}, 'The IBC Connections can not be fetched.');
