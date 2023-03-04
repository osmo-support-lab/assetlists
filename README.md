# Support Lab Maintained Asset Lists

To further support the community, we are working on maintaining an up to date and easily updatable asset lists.

> This repository is original built from [osmosis-labs/assetlists](https://github.com/osmosis-labs/assetlists/) with original scripts built by [Jeremy Parish](https://github.com/JeremyParish69).

## Description

Asset lists are inspired by the [Token Lists](https://tokenlists.org/) project on Ethereum, which helps discoverability of ERC20 tokens by mapping ERC20 contracts to their associated metadata. Asset Lists offer a similar mechanism to allow frontends and other UIs to fetch metadata associated with Cosmos SDK denominations, especially for assets sent over IBC, although, this standard is a work in progress. You'll notice that the format of `assets` in the assetlist.json structure is a strict superset json representation of the [`banktypes.DenomMetadata`](https://docs.cosmos.network/v0.47/modules/bank#denommetadata) from the Cosmos SDK; this is purposefully done so that this standard may eventually be migrated into a Cosmos SDK module in the future, so it can be easily maintained on chain instead of on GitHub. The assetlist JSON Schema can be found at the Chain Registry [here](https://github.com/cosmos/chain-registry/blob/master/assetlist.schema.json).

## Steps to add assets

The `<chain-id>.assetlist.json` files herein are automatically generated, which will be triggered by additions to the corresponding `<chain-name>.zone.json` file. The metadata is fetched from the [Cosmos Chain Registry](https://github.com/cosmos/chain-registry).

### Step 1: Cosmos Chain Registry Additions

1. Ensure asset is added to the chains `assetlist.json` and image added to the `images` folder on [Cosmos Chain Registry](https://github.com/cosmos/chain-registry).
2. IBC information is added to the `_IBC` folder on [Cosmos Chain Registry](https://github.com/cosmos/chain-registry).

### Step 2: How to Add Assets to *this* repository

To add an asset:

1. Create a new entry at the very bottom of the `<chain-id>/<chain-name>.zone.json` file, containing the asset's base denom and chain name.

```json
...
{
  "chain_name": "fooChain",
  "base_denom": "ubar"
}
```

- `chain_name` must be the exact value defined as `chain_name` for the chain in the Chain Registry -- it is also the name of the chain's directory in the Chain Registry.
- `base_denom` is the indivisible, minimal (exponent 0) denomination unit for the asset, which is also the value defined as `base` for the asset in the Chain Registry.

## Modifications to standard metadata

This repository allows for overrides for certain metadata. Those overrides are:

- `symbol`
- `logo_URIs`
- `coingecko_id`

**For example:**

```json
    {
      "frontend_properties": {
        "symbol": "wMATIC.axl",
        "logo_URIs": {
          "png": "https://raw.githubusercontent.com/osmo-support-lab/assetlists/main/images/wmatic.png",
          "svg": "https://raw.githubusercontent.com/osmo-support-lab/assetlists/main/images/wmatic.svg"
        },
        "coingecko_id": "wmatic"
      }
    },
```

## Zone Example

An example asset object in `osmosis.zone.json`:

```json
...
{
  "chain_name": "osmosis",
  "base_denom": "uosmo"
},
{
  "chain_name": "axelar",
  "base_denom": "wmatic-wei",
  "frontend_properties": {
    "symbol": "wMATIC.axl",
      "logo_URIs": {
        "png": "https://raw.githubusercontent.com/osmo-support-lab/assetlists/main/images/wmatic.png",
        "svg": "https://raw.githubusercontent.com/osmo-support-lab/assetlists/main/images/wmatic.svg"
    }
  }
}
```

## Assetlist Example

An example generated assetlist JSON file:

```json
{
  "chain_name": "osmosis",
  "assets": [
    {
      "description": "The native token of Osmosis",
      "denom_units": [
        {
          "denom": "uosmo",
          "exponent": 0
        },
        {
          "denom": "osmo",
          "exponent": 6
        }
      ],
      "base": "uosmo",
      "name": "Osmosis",
      "display": "osmo",
      "symbol": "OSMO",
      "logo_URIs": {
        "png": "https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/osmo.png",
        "svg": "https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/osmo.svg"
      },
      "coingecko_id": "osmosis",
      "keywords": [
        "dex",
        "staking"
      ]
    },
    {
      "description": "Wrapped Matic on Axelar",
      "denom_units": [
        {
          "denom": "ibc/AB589511ED0DD5FA56171A39978AFBF1371DB986EC1C3526CE138A16377E39BB",
          "exponent": 0,
          "aliases": [
            "wmatic-wei"
          ]
        },
        {
          "denom": "wmatic",
          "exponent": 18
        }
      ],
      "base": "ibc/AB589511ED0DD5FA56171A39978AFBF1371DB986EC1C3526CE138A16377E39BB",
      "name": "Wrapped Matic",
      "display": "wmatic",
      "symbol": "wMATIC.axl",
      "traces": [
        {
          "type": "bridge",
          "counterparty": {
            "chain_name": "polygon",
            "base_denom": "0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270"
          },
          "provider": "Axelar"
        },
        {
          "type": "ibc",
          "counterparty": {
            "chain_name": "axelar",
            "base_denom": "wmatic-wei",
            "channel_id": "channel-3"
          },
          "chain": {
            "channel_id": "channel-208",
            "path": "transfer/channel-208/wmatic-wei"
          }
        }
      ],
      "logo_URIs": {
        "png": "https://raw.githubusercontent.com/osmo-support-lab/assetlists/main/images/wmatic.png",
        "svg": "https://raw.githubusercontent.com/osmo-support-lab/assetlists/main/images/wmatic.svg"
      }
    },
  ]
}
```
