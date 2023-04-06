import * as cErrors from './classes';
import {
  type Counterparty,
  type IbcChain,
} from './types';
import {
  AdditionalInformation,
  Asset,
  Assetlist,
  Chain,
  Trace,
  TraceType,
} from './types';
import * as fs from 'node:fs';
import * as path from 'node:path';

const ENV_VARS = {
  CHAIN_ID: process.env.CHAIN_ID,
  CHAIN_NAME: process.env.CHAIN_NAME,
};

const fileNames = {
  assetlistJSON: 'assetlist.json',
  chainJSON: 'chain.json',
  zoneJSON: '.zone.json',
};

const urlRoots = {
  bscScan: 'https://bscscan.com/token/',
  coinLandingPage: 'https://www.coinlanding.page/post/',
  etherScan: 'https://etherscan.io/token/',
  ftmScan: 'https://ftmscan.com/token/',
  moonScan: 'https://moonscan.io/token/',
  polygonScan: 'https://polygonscan.com/token/',
  sinfoniaRoot: 'https://app.sinfonia.zone/fantokens/',
  snowTrace: 'https://snowtrace.io/token/',
};

const filePath = path;

class Constants {
  public readonly chainRegistryRoot: string;

  public readonly localChainName: string;

  public readonly projectRoot: string;

  public readonly zoneSubdirectory: string;

  public readonly ibcFolderName: string;

  public readonly zoneAssetlistFileName: string;

  public constructor () {
    this.chainRegistryRoot = filePath.join(this.projectRoot + '/chain-registry');
    this.projectRoot = filePath.join(__dirname);
    this.localChainName = '';
    this.ibcFolderName = '/_IBC';
    this.zoneSubdirectory = filePath.join(this.projectRoot + '/' + ENV_VARS.CHAIN_ID);
  }
}

// Establish the Constants constructor
const constant = new Constants();

/**
 * Retrieves the `<chain_name>.zone.json`.
 *
 * @throws {Error} If there is an error reading or parsing the asset list file.
 */
const getZoneAssetlist: object = (): object => {
  const readFile = fs.readFileSync(constant.projectRoot + constant.zoneSubdirectory + fileNames.zoneJSON);
  try {
    return JSON.parse(readFile.toString());
  } catch {
    const errorName = `${cErrors.FilePathError.name}`;
    const errorMessage = `${cErrors.FilePathError.message}`;
    return {
      errorName,
      // eslint-disable-next-line canonical/sort-keys
      errorMessage,
    };
  }
};

/**
 * Finds and returns a registered asset with matching base denomination in the specified chain's asset list.
 *
 * @function copyRegisteredAsset
 * @returns {Object|undefined} Returns an object representing a registered asset if found, otherwise undefined.
 * @throws Will throw an error if there is an issue reading or parsing the JSON file.
 */
const copyRegisteredAsset = (chain_name: string, base_denom: string): types.Asset | { errorMessage: string, errorName: string, } => {
  const readFile = fs.readFileSync(constant.chainRegistryRoot + chain_name + fileNames.assetlistJSON);
  try {
    const chainRegistryChainAssetlist = JSON.parse(readFile.toString());
    return chainRegistryChainAssetlist.assets.find((registeredAsset: types.Asset) => {
      return registeredAsset.base === base_denom;
    });
  } catch {
    const errorName = `${cErrors.NoChainRegistry.name}`;
    const errorMessage = `${cErrors.NoChainRegistry.message}`;
    return {
      errorName,
      // eslint-disable-next-line canonical/sort-keys
      errorMessage,
    };
  }
};

/**
 * Retrieves IBC connections from a JSON file.
 *
 * @function getIbcConnections
 * @throws Will throw an error if there is an issue reading or parsing the JSON file.
 */
const getIbcConnections = (ibcFileName: string) => {
  const readFile = fs.readFileSync(constant.chainRegistryRoot + constant.ibcFolderName + ibcFileName);
  try {
    return JSON.parse(readFile.toString());
  } catch {
    const errorName = `${cErrors.NoIbcConnections.name}`;
    const errorMessage = `${cErrors.NoIbcConnections.message}`;
    return [
      {
        errorName,
        // eslint-disable-next-line canonical/sort-keys
        errorMessage,
      },
    ];
  }
};

/**
 * Writes assetlist data to a file.
 *
 * @param {Array} assetlist - The array of assets to write to the file.
 * @throws Will throw an error if there is an issue reading or parsing the JSON file.
 */
const writeToFile = (assetlist: object): unknown | { errorMessage: string, errorName: string, } => {
  const joinedPath = path.join(
    String(constant.projectRoot),
    String(constant.zoneSubdirectory),
    String(ENV_VARS.CHAIN_NAME) + '.' + String(fileNames.assetlistJSON),
  );
  return new Promise((resolve) => {
    fs.writeFile(joinedPath, JSON.stringify(assetlist, null, 2), (error) => {
      if (error) {
        const errorName = `${cErrors.FilePathError.name}`;
        const errorMessage = `${cErrors.FilePathError.message}`;
        resolve({
          errorName,
          // eslint-disable-next-line canonical/sort-keys
          errorMessage,
        });
      } else {
        const errorName = `${cErrors.GenericError.name}`;
        const errorMessage = `${cErrors.GenericError.message}`;
        resolve({
          errorName,
          // eslint-disable-next-line canonical/sort-keys
          errorMessage,
        });
      }
    });
  });
};

const calculateIbcHash = async (ibcHashInput: string) => {
  const textAsBuffer = new TextEncoder().encode(ibcHashInput);
  const hashBuffer = await crypto.subtle.digest('SHA-256', textAsBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const digest = hashArray.map((b) => {
    return b.toString(16).padStart(2, '0');
  }).join('');
  const ibcHashOutput = 'ibc/' + digest.toUpperCase();
  return ibcHashOutput;
};

const asyncForEach = async <T>(array: T[], callback: (value: T, index?: number, array?: T[]) => Promise<void>) => {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
};

const reorderProperties = (object: object, referenceObject: types.Asset): unknown => {
  let newObject = object;
  if (typeof object === 'object' && object.constructor !== Array) {
    newObject = {};
    for (const key of Object.keys(referenceObject)) {
      if (object[key] && referenceObject[key]) {
        newObject[key] = reorderProperties(object[key], referenceObject[key]);
      }
    }
  }

  return newObject;
};

type ZoneAsset = {
  base_denom: string,
  chain_name: string,
};

const generateAssets = async (generatedAssetlist: types.Asset, zoneAssetlist: types.Zone) => {
  await asyncForEach(zoneAssetlist.assets, async (zoneAsset: ZoneAsset) => {
    const generatedAsset = copyRegisteredAsset(
      zoneAsset.chain_name,
      zoneAsset.base_denom,
    );

    if (zoneAsset.chain_name !== constant.localChainName) {
      let TYPE = 'ibc';

      const {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        base_denom,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        chain_name,
      } = zoneAsset;

      const COUNTERPARTY: Counterparty = {
        base_denom,
        chain_name,
        port: 'transfer',
      };

      const CHAIN: IbcChain = {
        chain_name: constant.localChainName,
        port: 'transfer',
      };

      let CHAIN_1 = CHAIN ? COUNTERPARTY : CHAIN;
      let CHAIN_2 = COUNTERPARTY ? CHAIN : COUNTERPARTY;

      // Identify CW20 Transfer
      if (zoneAsset.base_denom.slice(0, 5) === 'cw20:') {
        COUNTERPARTY.port = 'wasm.';
        TYPE = 'ibc-cw20';
      }

      // Swap Chain_1 and Chain_2 if necessary
      if (COUNTERPARTY.chain_name < CHAIN.chain_name) {
        CHAIN_1 = COUNTERPARTY;
        CHAIN_2 = CHAIN;
      }

      // Find IBC File Name
      const ibcFileName = CHAIN_1.chain_name + '-' + CHAIN_2.chain_name + '.json';

      // Find IBC Connection
      const ibcConnections: types.IbcSchema = getIbcConnections(ibcFileName);

      // Find IBC Channel and Port Info
      for (const channel of ibcConnections.channels) {
        if (
          channel.chain_1.port_id.slice(0, 5) === CHAIN_1.port?.slice(0, 5) &&
          channel.chain_2.port_id.slice(0, 5) === CHAIN_2.port.slice(0, 5)
        ) {
          // eslint-disable-next-line canonical/id-match
          CHAIN_1.channel_id = channel.chain_1.channel_id;
          // eslint-disable-next-line canonical/id-match
          CHAIN_2.channel_id = channel.chain_2.channel_id;
          CHAIN_1.port = channel.chain_1.port_id;
          CHAIN_2.port = channel.chain_2.port_id;
          continue;
        }
      }

      const trace: types.Trace = {
        chain: {
          channel_id: 'default',
          path: 'none',
        },
        counterparty: COUNTERPARTY,
        type: Ibc,
      };
      trace.chain.path =
        CHAIN.port + '/' + trace.chain.channel_id + '/' + zoneAsset.base_denom;
      let traces: [] = [];
      if (generatedAsset.traces === typeof types.Asset) {
        traces = generatedAsset.traces;
        if (
          traces[traces.length - 1].type === 'ibc' ||
            traces[traces.length - 1].type === 'ibc-cw20'
        ) {
          if (traces[traces.length - 1].chain.path) {
            trace.chain.path =
                chain.port +
                '/' +
                trace.chain.channel_id +
                '/' +
                traces[traces.length - 1].chain.path;
          } else {
            console.log(generatedAsset.base + 'Missing Path');
          }
        }
      } else if (zoneAsset.base_denom.slice(0, 7) === 'factory') {
        const baseReplacement = zoneAsset.base_denom.replaceAll('/', ':');
        trace.chain.path =
            chain.port + '/' + trace.chain.channel_id + '/' + baseReplacement;
      }
    }
  });
};
