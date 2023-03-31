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

async function calculateIbcHash(ibcHashInput) {
  const textAsBuffer = new TextEncoder().encode(ibcHashInput);
  const hashBuffer = await crypto.subtle.digest('SHA-256', textAsBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const digest = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  const ibcHashOutput = 'ibc/' + digest.toUpperCase();
  return ibcHashOutput;
}

async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}

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

const generateAssets = async (generatedAssetlist, zoneAssetlist) => {
  await asyncForEach(zoneAssetlist.assets, async (zoneAsset) => {
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
      if (generatedAsset.traces[0].type === 'wrapped') {
        generatedAsset.traces[0] = generatedAsset.traces[1]
      }
      if (generatedAsset.traces[0].type === 'synthetic') {
        generatedAsset.traces[0] = generatedAsset.traces[1]
      }
      if (generatedAsset.traces[0].type === 'forex') {
        generatedAsset.traces[0] = generatedAsset.traces[1]
      }
      if (generatedAsset.traces[0].type === 'bridged') {
        if (generatedAsset.traces[0].counterparty.chain_name === 'bitcoin') {
          generatedAsset.traces[0] = generatedAsset.traces[1]
        }
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

    // Fetch chain.json 'pretty_name'
    function getPrettyChain() {
      try {
        const chainRegistryChainJson = JSON.parse(
          fs.readFileSync(
            path.join(
              chainRegistryRoot,
              chainRegistrySubdirectory,
              zoneAsset.chain_name,
              chainFileName
            )
          )
        );
        return chainRegistryChainJson.pretty_name;
      } catch (err) {
        console.log(err);
        return "Error"
      }
    }

    // Fetch chain.json 'website' for 'additional_information'
    function getChainWebsite() {
      try {
        const chainRegistryChainJson = JSON.parse(
          fs.readFileSync(
            path.join(
              chainRegistryRoot,
              chainRegistrySubdirectory,
              zoneAsset.chain_name,
              chainFileName
            )
          )
        );
        let tempObj;
        tempObj = {
          "chain_website": chainRegistryChainJson.website
        }
        if (tempObj.chain_website === undefined) {
          tempObj = {
            "chain_website": "Error in Chain Registry."
          }
        }
        return tempObj;
      } catch (err) {
        console.log(err);
      }
    }

    // Fetch chain_name from chain.json to build 'coin_landing_page
    function getCoinLandingWebsite() {
      try {
        const chainRegistryChainJson = JSON.parse(
          fs.readFileSync(
            path.join(
              chainRegistryRoot,
              chainRegistrySubdirectory,
              zoneAsset.chain_name,
              chainFileName
            )
          )
        );
        let tempObj = {
          "coin_landing_page": coinLandingRoot + chainRegistryChainJson.chain_name
        }
        return tempObj;
      } catch (err) {
        let tempObj = {
          "coin_landing_page": "Error in Chain Registry."
        }
        console.log(err);
        return tempObj
      }
    }

    // Use chain.json to pull GH page for chain
    function getGitWebsite() {
      try {
        override.additional_information.find((registeredAsset) => {
          if (registeredAsset.git_repo) {
            return
          }
        });
      } catch {
        const chainRegistryChainJson = JSON.parse(
          fs.readFileSync(
            path.join(
              chainRegistryRoot,
              chainRegistrySubdirectory,
              zoneAsset.chain_name,
              chainFileName
            )
          )
        );
        let tempObj;
        tempObj = {
          "git_repo": chainRegistryChainJson.codebase.git_repo
        }
        if (tempObj.git_repo === undefined) {
          tempObj = {
            "git_repo": "Error in Chain Registry."
          }
        }
        return tempObj;
      }
    }

    let allAdditional = []

    // Check keywords for additional_info modification

    // Bridged Asset Modifier
    if (generatedAsset.traces) {
      if (generatedAsset.traces[0].type === 'ibc') {
        allAdditional = []
      } else {
        let protocol;
        let contractAddress;
        let linkContract;

        protocol = generatedAsset.traces[0].counterparty.chain_name
        contractAddress = generatedAsset.traces[0].counterparty.base_denom

        if (protocol === 'bitcoin') {
          protocol = generatedAsset.traces[1].counterparty.chain_name
          contractAddress = generatedAsset.traces[1].counterparty.base_denom
        }
        if (protocol === 'ethereum') {
          linkContract = { "block_explorer_link": etherScanRoot + contractAddress }
          allAdditional.push(linkContract)
        }
        if (protocol === 'polygon') {
          linkContract = { "block_explorer_link": polygonScanRoot + contractAddress }
          allAdditional.push(linkContract)
        }
        if (protocol === 'moonbeam') {
          linkContract = { "block_explorer_link": moonScanRoot + contractAddress }
          allAdditional.push(linkContract)
        }
        if (protocol === 'avalanche') {
          linkContract = { "block_explorer_link": snowTraceRoot + contractAddress }
          allAdditional.push(linkContract)
        }
        if (protocol === 'fantom') {
          linkContract = { "block_explorer_link": ftmScanRoot + contractAddress }
          allAdditional.push(linkContract)
        }
        if (protocol === 'binancesmartchain') {
          linkContract = { "block_explorer_link": bnbScanRoot + contractAddress }
          allAdditional.push(linkContract)
        }
      }
    }

    // Overriding Properties
    const override = zoneAsset.frontend_properties;
    let allKeywords = []
    if (getPrettyChain()) {
      generatedAsset.name = getPrettyChain();
    } else {
      generatedAsset.name = override.chain_name_pretty;
    }

    // OVERRIDES AND APPENDS
    if (override) {
      // Override symbol with zoneAsset override.
      if (override.symbol) {
        generatedAsset.symbol = override.symbol;
      }

      // Override description
      if (override.description) {
        generatedAsset.description = override.description
      }

      // Add zoneAsset pretty_path
      if (override.pretty_path) {
        generatedAsset.pretty_path = override.pretty_path;
      }

      // Override logo_URIs with zoneAsset logo_URIs.
      if (override.logo_URIs) {
        generatedAsset.logo_URIs = override.logo_URIs;
      }

      // Override coingecko_id with zoneAsset coingecko_id
      if (override.coingecko_id) {
        generatedAsset.coingecko_id = override.coingecko_id;
      }

      // Add, combine, and flatten keywords if any.
      if (generatedAsset.keywords) {
        allKeywords.push(override.keywords)
        allKeywords.push(generatedAsset.keywords);
        generatedAsset.keywords = allKeywords.flat()
      } else {
        allKeywords.push(override.keywords);
        generatedAsset.keywords = allKeywords.flat();
      }

      if (override.additional_information) {
        allAdditional.push(override.additional_information)
        allAdditional.push(getChainWebsite())
        allAdditional.push(getCoinLandingWebsite())
        generatedAsset.additional_information = allAdditional.flat()
      } else {
        allAdditional.push(getChainWebsite())
        allAdditional.push(getCoinLandingWebsite())
        generatedAsset.additional_information = allAdditional.flat()
      }
    }


    // Sinfonia Modifier
    for (let tag in generatedAsset.keywords) {
      if (generatedAsset.keywords[tag] === 'Sinfonia') {
        generatedAsset.additional_information = allAdditional
        let linkSinfonia;
        let baseFanDenom = generatedAsset.traces[0].counterparty.base_denom
        linkSinfonia = { "sinfonia_link": sinfoniaRoot + baseFanDenom }
        allAdditional.push(linkSinfonia)
        generatedAsset.additional_information = allAdditional.flat()
      }
    }


    if (getGitWebsite() === undefined) {

    } else {
      allAdditional.push(getGitWebsite())
      generatedAsset.additional_information = allAdditional.flat()
    }
    //console.log(generatedAsset);


    // Github Modifier

    // Re-order Properties
    generatedAsset = reorderProperties(generatedAsset, assetlistSchema);
    // To see each asset generated, uncomment next line. **Should only be used for debug purposes. Re-comment before commit

    //- Append Asset to Assetlist
    generatedAssetlist.push(generatedAsset);

    // To see full asset list, uncomment next line. **Should only be used for debug purposes. Re-comment before commit
    // console.log(generatedAssetlist);
  });
};

async function generateAssetlist() {
  let zoneAssetlist = getZoneAssetlist();

  let generatedAssetlist = [];
  await generateAssets(generatedAssetlist, zoneAssetlist);
  let chainAssetlist = {
    $schema: "../assetlist.schema.json",
    assets: generatedAssetlist,
    chain_name: localChainName
  };
  console.log(chainAssetlist);

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
