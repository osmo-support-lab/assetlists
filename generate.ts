import ROOT_DIR from '.';
import * as types from './types';
import * as fs from 'node:fs';
import * as path from 'node:path';

const assetlistsMainnetsSubdirectory: string = '/' + process.env.CHAIN_ID;
let assetlistsSubdirectory: string = '';
const zoneAssetlistFileName: string = process.env.CHAIN_NAME + '.zone.json';
const mainnetChainName: any = process.env.CHAIN_NAME;
let localChainName: string = '';
const mainnetChainId: any = process.env.CHAIN_ID;
let localChainId: string = '';

const envVars = {
  CHAIN_ID: process.env.CHAIN_ID,
  CHAIN_NAME: process.env.CHAIN_NAME,
};

const fileNames = {
  assetlistJSON: 'assetlist.json',
  chainJSON: 'chain.json',
  zoneJSON: 'zone.json',
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

class Constants {
  public readonly chainRegistryRoot: string;

  public readonly chainRegistryMainnetSubdirectory: string;

  public readonly projectRoot: string;

  public readonly zoneSubdirectory: string;

  public readonly ibcFolderName: string;

  public readonly zoneAssetlistFileName: string;

  public constructor () {
    this.chainRegistryRoot = ROOT_DIR + '/chain-registry';
    this.chainRegistryMainnetSubdirectory = '';
    this.zoneSubdirectory = ROOT_DIR + '/' + envVars.CHAIN_ID;
  }
}
