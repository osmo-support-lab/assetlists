import * as fs from 'fs';
import * as path from 'path';
import * as assetTypes from './assetlistTypes';

const chainRegistryRoot: string = '../../../chain-registry/';
const chainRegistryMainnetsSubdirectory: string = '';
let chainRegistrySubdirectory: string = '';
const assetlistsRoot: string = '../../..';
const assetlistsMainnetsSubdirectory: string = '/' + process.env.CHAIN_ID;
let assetlistsSubdirectory: string = '';
const assetlistFileName: string = 'assetlist.json';
const chainFileName: string = 'chain.json';
const zoneAssetlistFileName: string = process.env.CHAIN_NAME + '.zone.json';
const ibcFolderName: string = '_IBC';
const mainnetChainName: any = process.env.CHAIN_NAME;
let localChainName: string = '';
const mainnetChainId: any = process.env.CHAIN_ID;
let localChainId: string = '';
const coinLandingRoot: string = 'https://www.coinlanding.page/post/'
const polygonScanRoot: string = 'https://polygonscan.com/token/'
const etherScanRoot: string = 'https://etherscan.io/token/'
const snowTraceRoot: string = 'https://snowtrace.io/token/'
const moonScanRoot: string = 'https://moonscan.io/token/'
const bnbScanRoot: string = 'https://bscscan.com/token/'
const ftmScanRoot: string = 'https://ftmscan.com/token/'
const sinfoniaRoot: string = 'https://app.sinfonia.zone/fantokens/'

/**
 * Retrieves the `<chain_name>.zone.json`.
 *
 * @function getZoneAssetlist
 * @returns {Object} The asset list for the specified zone.
 * @throws {Error} If there is an error reading or parsing the asset list file.
 */
function getZoneAssetlist() {
  let zonePath = assetlistsRoot + assetlistsSubdirectory + zoneAssetlistFileName
  let fileSync = fs.readFileSync(zonePath)
  try {
    return JSON.parse(fileSync.toString());
  } catch (err) {
    console.log(err);
  }
}

/**
 * Finds and returns a registered asset with matching base denomination in the specified chain's asset list.
 *
 * @function copyRegisteredAsset
 * @param {string} chain_name - The name of the chain whose registry is being searched.
 * @param {string} base_denom - The base denomination of the registered asset being searched for.
 * @returns {Object|undefined} Returns an object representing a registered asset if found, otherwise undefined.
 * @throws Will throw an error if there is an issue reading or parsing the JSON file.
 */
function copyRegisteredAsset(chain_name: string, base_denom: string) {
  let registryPath = chainRegistryRoot + chainRegistrySubdirectory + chain_name + assetlistFileName
  let fileSync = fs.readFileSync(registryPath)
  try {
    const chainRegistryChainAssetlist = JSON.parse(fileSync.toString());
    return chainRegistryChainAssetlist.assets.find((registeredAsset: {base: string}) => {
      return (
        registeredAsset.base === base_denom
      );
    });
  } catch (err) {
    console.log(err);
  }
}
