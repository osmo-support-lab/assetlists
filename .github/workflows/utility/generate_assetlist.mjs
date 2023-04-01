// Purpose:
//   To automatically generate an asset list json using the <chain_name>.zone.json file and cosmos/chain_registry data
//
// -- THE PLAN --
//
// 1. Read <chain_name>.zone.json list.
// 2. Add assets to a zoneArray
// 3. For each asset in zoneArray:
//      1. Identify the "chain" and "base" (base = primary key)
//      2. With "chain": Find the matching chain folder in cosmos/chain_registry
//      3. Within the chain folder: Pull ALL asset details from the chain's assetlist.json,
//      4. Get ibc connection details.
//      5. Parse out which chain name comes first alphabetically
//      6. Generate assetObject differently if IBC:
//          - With an extra trace for the ibc transfer, and
//          - The "base" becomes the ibc/<hash>, and the first denom becomes the ibc/<hash>,
//            and the original base becomes an alias
//      7. Process any customizations, swapping "name" for "pretty_name", adding extra "keywords", etc.
//      8. Write <chain_id>.assetlist.json array to file.
//      9. Utilize GitHub Actions to automate this process, and lint/format properly.

// IMPORTS
import * as fs from 'fs';
import * as path from 'path';

const chainRegistryRoot = '../../../chain-registry/';
const chainRegistryMainnetsSubdirectory = '';
let chainRegistrySubdirectory = '';
const assetlistsRoot = '../../..';
const assetlistsMainnetsSubdirectory = '/' + process.env.CHAIN_ID;
let assetlistsSubdirectory = '';
const assetlistFileName = 'assetlist.json';
const chainFileName = 'chain.json';
const zoneAssetlistFileName = process.env.CHAIN_NAME + '.zone.json';
const ibcFolderName = '_IBC';
const mainnetChainName = process.env.CHAIN_NAME;
let localChainName = '';
const mainnetChainId = process.env.CHAIN_ID;
let localChainId = '';
const coinLandingRoot = 'https://www.coinlanding.page/post/'
const polygonScanRoot = 'https://polygonscan.com/token/'
const etherScanRoot = 'https://etherscan.io/token/'
const snowTraceRoot = 'https://snowtrace.io/token/'
const moonScanRoot = 'https://moonscan.io/token/'
const bnbScanRoot = 'https://bscscan.com/token/'
const ftmScanRoot = 'https://ftmscan.com/token/'
const sinfoniaRoot = 'https://app.sinfonia.zone/fantokens/'
const assetlistSchema = {
  additional_information: [],
  address: 'string',
  base: 'string',
  coingecko_id: 'string',
  denom_units: [],
  description: 'string',
  display: 'string',
  keywords: [],
  logo_URIs: {
    png: 'string',
    svg: 'string',
  },
  name: 'string',
  pretty_path: 'string',
  symbol: 'string',
  traces: [],
  type_asset: 'string'
};

/**
 * Retrieves the `<chain_name>.zone.json`.
 *
 * @function getZoneAssetlist
 * @returns {Object} The asset list for the specified zone.
 * @throws {Error} If there is an error reading or parsing the asset list file.
 */
function getZoneAssetlist() {
  try {
    return JSON.parse(
      fs.readFileSync(
        path.join(assetlistsRoot, assetlistsSubdirectory, zoneAssetlistFileName)
      )
    );
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
 */
function copyRegisteredAsset(chain_name, base_denom) {
  try {
    const chainRegistryChainAssetlist = JSON.parse(
      fs.readFileSync(
        path.join(
          chainRegistryRoot,
          chainRegistrySubdirectory,
          chain_name,
          assetlistFileName
        )
      )
    );
    return chainRegistryChainAssetlist.assets.find((registeredAsset) => {
      return (
        registeredAsset.base === base_denom
      );
    });
  } catch (err) {
    console.log(err);
  }
}

/**
 * Retrieves IBC connections from a JSON file.
 *
 * @function getIbcConnections
 * @param {string} ibcFileName - The name of the JSON file containing IBC connections.
 * @returns {Array.<Object>} An array of objects representing IBC connections.
 * @throws Will throw an error if there is an issue reading or parsing the JSON file.
 */
function getIbcConnections(ibcFileName) {
  try {
    return JSON.parse(
      fs.readFileSync(
        path.join(
          chainRegistryRoot,
          chainRegistrySubdirectory,
          ibcFolderName,
          ibcFileName
        )
      )
    );
  } catch (err) {
    console.log(err);
  }
}

/**
 * Writes assetlist data to a file.
 *
 * @param {Array} assetlist - The array of assets to write to the file.
 */
function writeToFile(assetlist) {
  try {
    fs.writeFile(
      path.join(
        assetlistsRoot,
        assetlistsSubdirectory,
        localChainId + '.assetlist.json'
      ),
      JSON.stringify(assetlist, null, 2),
      (err) => {
        if (err) throw err;
      }
    );
  } catch (err) {
    console.log(err);
  }
}

/**
 * Calculates an IBC hash for the given input string.
 *
 * @param {string} ibcHashInput - The input string to calculate the hash for.
 * @returns {Promise<string>} A Promise that resolves with the calculated IBC hash as a string in format "ibc/XXXXXXXXXXXX...".
 * @throws {TypeError} If ibcHashInput is not a valid string or if crypto.subtle.digest() fails.
 */
async function calculateIbcHash(ibcHashInput) {
  const textAsBuffer = new TextEncoder().encode(ibcHashInput);
  const hashBuffer = await crypto.subtle.digest('SHA-256', textAsBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const digest = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  const ibcHashOutput = 'ibc/' + digest.toUpperCase();
  return ibcHashOutput;
}

/**
 * Asynchronously iterates over an array and executes a callback on each element.
 *
 * @param {Array} array - The input array to iterate over.
 * @param {Function} callback - The async function to execute on each element of the array. It takes three arguments: currentValue, index, and the original array.
 */
async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}

/**
 * Reorders properties of `generatedAsset` based on a `assetlistSchema`.
 *
 * @param {{generatedAsset: {}}} object - The input object to reorder, will normally be
 * @param {{assetlistSchema: {}}} referenceObject - The reference object used for reordering.
 * @returns {Object} A new reordered object with properties matching those in the reference object.
 */
function reorderProperties(object, referenceObject) {
  let newObject = object;
  if (typeof object === 'object') {
    if (object.constructor !== Array) {
      newObject = {};
      Object.keys(referenceObject).forEach((key) => {
        if (object[key] && referenceObject[key]) {
          newObject[key] = reorderProperties(object[key], referenceObject[key]);
        }
      });
    }
  }
  return newObject;
}

/**
 * Generates assets by comparing two asset lists.
 *
 * @param {Array} generatedAssetlist - The list of generated assets.
 * @param {Array} zoneAssetlist - The list of zone assets.
 *
 * @returns {Promise<Array>} A promise that resolves with the updated list of generated assets.
 */
const generateAssets = async (generatedAssetlist, zoneAssetlist) => {
  /**
 * @function asyncForEach
 */
  await asyncForEach(zoneAssetlist.assets, async (zoneAsset) => {
    /**
     * @function copyRegisteredAsset
     */
    let generatedAsset = copyRegisteredAsset(
      zoneAsset.chain_name,
      zoneAsset.base_denom
    );

    if (zoneAsset.chain_name != localChainName) {
      let type = 'ibc';
      let counterparty = {
        base_denom: zoneAsset.base_denom,
        chain_name: zoneAsset.chain_name,
        port: 'transfer',
      };
      let chain = {
        chain_name: localChainName,
        port: 'transfer',
      };
      let chain_1 = chain;
      let chain_2 = counterparty;

      //--Identify CW20 Transfer--
      if (counterparty.base_denom.slice(0, 5) === 'cw20:') {
        counterparty.port = 'wasm.';
        type = 'ibc-cw20';
      }

      //--Identify Chain_1 and Chain_2--
      if (counterparty.chain_name < chain.chain_name) {
        chain_1 = counterparty;
        chain_2 = chain;
      }

      //--Find IBC File Name--
      let ibcFileName = chain_1.chain_name + '-' + chain_2.chain_name + '.json';

      //--Find IBC Connection--
      const ibcConnections = getIbcConnections(ibcFileName);

      //--Find IBC Channel and Port Info--
      ibcConnections.channels.forEach(function (channel) {
        if (
          channel.chain_1.port_id.slice(0, 5) === chain_1.port.slice(0, 5) &&
          channel.chain_2.port_id.slice(0, 5) === chain_2.port.slice(0, 5)
        ) {
          chain_1.channel_id = channel.chain_1.channel_id;
          chain_2.channel_id = channel.chain_2.channel_id;
          chain_1.port = channel.chain_1.port_id;
          chain_2.port = channel.chain_2.port_id;
          return;
        }
      });

      //--Create Trace--
      let trace = {
        counterparty: counterparty,
        chain: chain,
        type: type
      };

      //--Add Trace Path--
      trace.chain.path =
        chain.port + '/' + trace.chain.channel_id + '/' + zoneAsset.base_denom;
      let traces = [];
      if (generatedAsset.traces) {
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
        let baseReplacement = zoneAsset.base_denom.replace(/\//g, ':');
        trace.chain.path =
          chain.port + '/' + trace.chain.channel_id + '/' + baseReplacement;
      }

      //--Cleanup Trace--
      delete trace.chain.chain_name;
      if (type === 'ibc') {
        delete trace.chain.port;
        delete trace.counterparty.port;
      }
      // console.log(trace)

      //--Append Latest Trace to Traces--
      traces.push(trace);
      generatedAsset.traces = traces;

      switch (generatedAsset.traces[0].type) {
        case 'wrapped':
        case 'synthetic':
        case 'forex':
          generatedAsset.traces[0] = generatedAsset.traces[1];
          break;
        case 'ibc-cw20':
          generatedAsset.traces[0].type = 'ibc';
          break;
        case 'liquid-stake':
          if (generatedAsset.traces[0].counterparty.chain_name === 'persistence') {
            generatedAsset.traces[0] = generatedAsset.traces[1];
          } else {
            generatedAsset.traces[0].type = 'ibc';
          }
      }

      if (generatedAsset.display === 'gwbtc') {
        generatedAsset.traces[0] = generatedAsset.traces[1]
      }

      //--Get IBC Hash--
      let ibcHash = calculateIbcHash(traces[traces.length - 1].chain.path);

      //--Replace Base with IBC Hash--
      generatedAsset.base = await ibcHash;
      generatedAsset.denom_units.forEach(async function (unit) {
        if (unit.denom === zoneAsset.base_denom) {
          if (!unit.aliases) {
            unit.aliases = [];
          }
          unit.aliases.push(zoneAsset.base_denom);
          unit.denom = await ibcHash;
        }
        return;
      });
    }

    /**
     * Parses a JSON file containing chain registry information for a given chain name.
     *
     * @param {string} chainName - The name of the chain whose registry information is being parsed.
     * @returns {Object} An object representing the parsed JSON data from the specified file.
     */
    function parseChainRegistryJson(chainName) {
      const chainRegistryChainJson = JSON.parse(
        fs.readFileSync(
          path.join(chainRegistryRoot, chainRegistrySubdirectory, chainName, chainFileName)
        )
      );
      return chainRegistryChainJson;
    }

    /**
     * Retrieves the pretty name for a chain from `chain.json`.
     *
     * @returns {string} The pretty name of the chain.
     * @throws {Error} If there is an error parsing or retrieving the pretty name.
     */
    function getPrettyChain() {
      try {
        const { pretty_name } = parseChainRegistryJson(zoneAsset.chain_name);
        return pretty_name;
      } catch (err) {
        console.log(err);
        return "Error";
      }
    }

    /**
     * Retrieves the chain's website URL from `chain.json`.
     *
     * @returns {{chain_website: string}} An object with a single property "chain_website" containing the retrieved website URL or an error message.
     * @throws {Error} If there is an error in generating the result.
     */
    function getChainWebsite() {
      try {
        const { website } = parseChainRegistryJson(zoneAsset.chain_name)
        return { "chain_website": website ?? "Error in Chain Registry." };
      } catch (err) {
        console.log(err);
        return { "chain_website": "Error in Generation." }
      }
    }

    /**
     * Returns the coin landing page URL for a given chain.
     *
     * @returns {{coin_landing_page: string}} An object with a single property "coin_landing_page" containing the URL of the coin landing page.
     * @throws {Error} If there is an error in generating or retrieving data from Chain Registry.
     */
    function getCoinLandingWebsite() {
      // TODO: Must be adjusted when update from Coin Landing Page about programmatically receiving info.
      try {
        const { chain_name } = parseChainRegistryJson(zoneAsset.chain_name);
        return { "coin_landing_page": coinLandingRoot + chain_name ?? "Error in Chain Registry." };
      } catch (err) {
        console.log(err)
        return { "coin_landing_page": "Error in Generation." }
      }
    }

    const { frontend_properties: override } = zoneAsset;
    const allAdditional = override.additional_information ? [...override.additional_information.filter(item => !item.git_repo)] : [];
    const allKeywords = generatedAsset.keywords ? [...generatedAsset.keywords] : [];

    /**
     * Returns the Git repo for a given asset. Based on if
     *
     * @returns {{git_repo: string}} An object containing the Git repository URL.
     * @throws {Error} If no Git repo is found.
     */
    function getGitWebsite() {
      try {
        let gitRepo;
        if (override.additional_information) {
          override.additional_information.forEach((asset) => {
            if (!gitRepo && asset.git_repo) { // check if asset has git repo property and no value has been set yet
              gitRepo = asset.git_repo; // use this asset's git repo property value
            }
          });
        }
        const { codebase } = parseChainRegistryJson(zoneAsset.chain_name);
        if (!gitRepo && codebase?.git_repo) {
          gitRepo = codebase.git_repo;
        }

        if (!gitRepo) throw new Error("No Git repo found");
        return { "git_repo": gitRepo };
      } catch (error) {
        console.error(error);
        const chainRegistryChainJson = parseChainRegistryJson(zoneAsset.chain_name);
        const tempObj = { "git_repo": chainRegistryChainJson.codebase?.git_repo || "Error in Chain Registry." };
        return tempObj;
      }
    }

    // Bridged Asset Modifier

    if (generatedAsset.traces) {
      const firstTrace = generatedAsset.traces[0];
      if (firstTrace.type === "ibc") {
      } else {
        let linkContract;
        switch (firstTrace.counterparty.chain_name) {
          case "ethereum":
            linkContract = { block_explorer_link: etherScanRoot + firstTrace.counterparty.base_denom };
            break;
          case "polygon":
            linkContract = { block_explorer_link: polygonScanRoot + firstTrace.counterparty.base_denom };
            break;
          case "moonbeam":
            linkContract = { block_explorer_link: moonScanRoot + firstTrace.counterparty.base_denom };
            break;
          case "avalanche":
            linkContract = { block_explorer_link: snowTraceRoot + firstTrace.counterparty.base_denom };
            break;
          case "fantom":
            linkContract = { block_explorer_link: ftmScanRoot + firstTrace.counterparty.base_denom };
            break;
          case "binancesmartchain":
            linkContract = { block_explorer_link: bnbScanRoot + firstTrace.counterparty.base_denom };
          default:
            // Do nothing if protocol is not recognized
            break;
        }
        allAdditional.push(linkContract);
      }
    }

    // OVERRIDES AND APPENDS
    if (override) {

      if (getPrettyChain()) {
        generatedAsset.name = getPrettyChain();
      } else {
        generatedAsset.name = override.chain_name_pretty;
      }
      if (override.symbol) {
        generatedAsset.symbol = override.symbol;
      }
      if (override.description) {
        generatedAsset.description = override.description;
      }
      if (override.pretty_path) {
        generatedAsset.pretty_path = override.pretty_path;
      }
      if (override.logo_URIs) {
        generatedAsset.logo_URIs = override.logo_URIs;
      }
      if (override.coingecko_id) {
        generatedAsset.coingecko_id = override.coingecko_id;
      }
      if (Array.isArray(override.keywords)) {
        allKeywords.push(...override.keywords);
      }
      allAdditional.push(getChainWebsite());
      allAdditional.push(getCoinLandingWebsite());
      allAdditional.push(getGitWebsite());


      if (allKeywords.length > 0) {
        generatedAsset.keywords = allKeywords;
      }

      function getSinfoniaLink() {
        if (allKeywords.includes('Sinfonia')) {
          let linkSinfonia;
          let baseFanDenom = generatedAsset.traces[0].counterparty.base_denom;

          linkSinfonia = { "sinfonia_link": sinfoniaRoot + baseFanDenom };
          return linkSinfonia;
        }
      }

      const sinfonaLinkResult = getSinfoniaLink();
      if (sinfonaLinkResult !== null && sinfonaLinkResult !== undefined) {
        allAdditional.push(sinfonaLinkResult);
      }

      if (allAdditional.length > 0) {
        generatedAsset.additional_information = allAdditional;
      }

    }
    /**
     * The override object used to retrieve additional information about assets.
     *
     * @name generatedAsset
     * @type Object
     */
    // Re-order Properties
    generatedAsset = reorderProperties(generatedAsset, assetlistSchema);
    // To see each asset generated, uncomment next line. **Should only be used for debug purposes. Re-comment before commit
    // console.log(generatedAsset);

    //- Append Asset to Assetlist
    generatedAssetlist.push(generatedAsset);

    // To see full asset list, uncomment next line. **Should only be used for debug purposes. Re-comment before commit
    // console.log(generatedAssetlist);
  });
};

/**
 * Generates an asset list for a local chain using zone asset lists.
 *
 * @async
 * @function generateAssetlist
 * @returns {Promise<void>}
 */
async function generateAssetlist() {
  /**
   * Gets the zone asset list.
   *
   * @function getZoneAssetlist
   */
  let zoneAssetlist = getZoneAssetlist();
  let generatedAssetlist = [];

  /**
   * Generates assets based on the given parameters and adds them to the provided array.
   *
   * @async
   * @function generateAssets
   *
   * @param {Array} generatedAssetlist - The array where generated assets will be added.
   * @param {Object} zoneAssetlist - The object containing information about available zones.
   */
  await generateAssets(generatedAssetlist, zoneAssetlist);
  let chainAssetlist = {
    $schema: "../assetlist.schema.json",
    assets: generatedAssetlist,
    chain_name: localChainName
  };
  // console.log(chainAssetlist);
  /**
   * Writes data to file system synchronously.
   *
   * @function writeToFile
   * @param {Object} chainAssetlist - Data that needs to be written into file.
   */
  writeToFile(chainAssetlist);
}

function selectDomain(domain) {
  if (domain == 'mainnets') {
    chainRegistrySubdirectory = chainRegistryMainnetsSubdirectory;
    assetlistsSubdirectory = assetlistsMainnetsSubdirectory;
    localChainName = mainnetChainName;
    localChainId = mainnetChainId;
  } else {
    console.log('Invalid Domain (Mainnets, Testnets, Devnets, etc.)');
  }
}

async function main() {
  selectDomain('mainnets');
  await generateAssetlist();
}

main();
