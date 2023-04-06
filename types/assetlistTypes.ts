/**
 * An asset list is a collection of metadata associated with Cosmos SDK denoms that may not be available on-chain. This mechanism is similar to Ethereum's Token List project and is especially useful for assets sent over IBC.
 *
 * Work originally based upon [@Jeremy Parish](https://github.com/JeremyParish69)'s work on [Osmosis-Labs/asssetlists](https://github.com/osmosis-labs/assetlists/).
 *
 * @file TypeScript types for based upon [asset list schema](https://raw.githubusercontent.com/osmo-support-lab/assetlists/main/assetlist.schema.json).
 * @author Osmosis Support Lab <support@osmosisdao.zone>
 * @license MIT
 * @version v1.0.0
 */
export type Assetlist = {
  /**
   * @description A reference link pointing towards the Support Lab specification which describes all possible properties within the asset list object.
   * @see [Assetlist Schema](https://raw.githubusercontent.com/osmo-support-lab/assetlists/main/assetlist.schema.json)
   */
  $schema: string,
  /**
   * @description An array of assets included in this asset list.
   * @see {@link Asset}
   */
  assets: Asset[],
  /**
   * @description The name of the chain where these assets are used.
   */
  chain_name: string,
};

/**
 * Represents an asset on a Cosmos SDK blockchain. Represents a strict superstruct of the Cosmos SDK's `DenomMetadata`.
 *
 * @see [Cosmos Network Docs](https://docs.cosmos.network/main/modules/bank#denommetadata)
 */
export type Asset = {
  /**
   * @description A list of up to 10 objects that have key:value pairs. Currently for the [Support Lab maintained](https://raw.githubusercontent.com/osmo-support-lab/assetlists/main/osmosis-1/osmosis-1.assetlist.json) asset list, these are automatically generated.
   * @see {@link AdditionalInformation}
   * @since v1.0.0
   */
  additional_information?: AdditionalInformation[],
  /**
   * @description The address of the asset.
   * @requires AddressAssetType
   * @see {@link AddressAssetType}
   */
  address?: string,
  /**
   * @description The base unit of the asset on {@link Assetlist.chain_name|chain_name}. Either `uasset` for an asset native to {@link Assetlist.chain_name|chain_name} or `ibc/<hash>` for IBC'd assets.
   *
   * _This denom must be represented in at least one of the {@link DenomUnitElement.denom|denoms} in {@link Asset.denom_units|denom_units}._
   */
  base: string,
  /**
   * @description The coingecko id to fetch asset data from the [Coingecko API V3](https://www.coingecko.com/en/api/documentation).
   *
   * _Note:_ Can be overridden with `zone.json` file prior to automatic generation with the Github Action in [osmo-support-lab/assetlists](https://github.com/osmo-support-lab/assetlists).
   * @since v1.0.0
   */
  coingecko_id?: string,
  /**
   * @description A list of {@link DenomUnitElement|Denom Units}
   * @see {@link DenomUnitElement}
   */
  denom_units: DenomUnitElement[],
  /**
   * @description A short description of the asset as part of the adherence to `x/bank - DenomMetadata`.
   *
   * _Note:_ Can be overridden with `zone.json` file prior to automatic generation with the Github Action in [osmo-support-lab/assetlists](https://github.com/osmo-support-lab/assetlists).
   * @since v1.0.0
   * @see [Cosmos Network Docs](https://docs.cosmos.network/main/modules/bank#denommetadata)
   */
  description?: string,
  /**
   * @description A (generally) lowercase denom of the asset as part of the adherence to `x/bank - DenomMetadata`.
   * @see [Cosmos Network Docs](https://docs.cosmos.network/main/modules/bank#denommetadata)
   */
  display: string,
  /**
   * @description An optional list of keywords that can be used to describe the asset.
   *
   * _Note:_ Can be added to with `zone.json` file prior to automatic generation with the Github Action in [osmo-support-lab/assetlists](https://github.com/osmo-support-lab/assetlists).
   * @since v1.0.0
   * @example ["Native", "Fiat-Collateralized", "Collateral-Based", "Utility", ...]
   */
  keywords?: string[],
  /**
   * @description An object with two keys, `png` and/or `svg`.
   *
   * _Note:_ Can be overridden to with `zone.json` file prior to automatic generation with the Github Action in [osmo-support-lab/assetlists](https://github.com/osmo-support-lab/assetlists).
   * @since v1.0.0
   * @see {@link LogoURIs}
   */
  logo_URIs: LogoURIs,
  /**
   * @description The project name of an asset as part of the adherence to `x/bank - DenomMetadata`.
   *
   * _Note:_ Currently automatically overridden due to automatic generation with the Github Action in [osmo-support-lab/assetlists](https://github.com/osmo-support-lab/assetlists).
   * `name` reflects a "Pretty Chain Name".
   * @since v1.0.0
   * @see {@link [Generate Assetlist](.github/workflows/utility/generate_assetlist.mjs)}
   */
  name: string,
  /**
   * @description This Support Lab added field is for bridged assets to allow front ends to display a path the asset has taken. This field is non-standard, and is edited via `frontend_properties`.
   * @since v1.0.0
   * @see [Zone Schema](https://raw.githubusercontent.com/osmo-support-lab/assetlists/main/zone.schema.json)
   */
  pretty_path?: string,
  /**
   * @description The symbol of the asset as part of the adherence to `x/bank - DenomMetadata`.
   *
   * _Note:_ Can be overridden to with `zone.json` file prior to automatic generation with the Github Action in [osmo-support-lab/assetlists](https://github.com/osmo-support-lab/assetlists).
   * @since v1.0.0
   * @see {@link [Generate Assetlist](.github/workflows/utility/generate_assetlist.mjs)}
   */
  symbol: string,
  /**
   * @description An array of origins of the asset, starting with the index, and capturing all transitions in form and location.
   * @see {@link Trace}
   */
  traces?: Trace[],
  /**
   * @description The original type of asset. Technically, optional.
   * @see {@link TypeAsset}
   */
  type_asset?: TypeAsset,
};

/**
 * Represents the `key:value` objects within {@link Asset.additional_information|additional_information}.
 *
 * @example {"github_repo": "https://github.com/osmosis-labs/osmosis"}
 * @example {"coin_landing_page": "https://coinlanding.page/post/osmosis"}
 * @since v1.0.0
 * @see [osmo-support-lab/assetlists](https://github.com/osmo-support-lab/assetlists#modifications-to-standard-metadata)
 */
export type AdditionalInformation = {
  key: string,
  value: string,
};

/**
 * Represents a single unit of {@link Asset.denom_units|denom_units} as part of the adherence to `x/bank - DenomMetadata`. Used to explain each version of a denom, and their aliases.
 *
 * _Added Information:_ {@link DenomUnitElement.exponent|exponent}
 *
 * @see [Cosmos Network Docs](https://docs.cosmos.network/main/modules/bank#denommetadata)
 */
export type DenomUnitElement = {
  aliases?: string[],
  denom: string,
  exponent: number,
};

/**
 * An object holding the links to a `png` and/or a `svg` for use in front ends. At least a `png` is required.
 *
 * _Note:_ Will be added with automatic generation via the Github Action in [osmo-support-lab/assetlists](https://github.com/osmo-support-lab/assetlists) OR can be overridden as needed.
 *
 * @since v1.0.0
 * @see [Zone Schema](https://raw.githubusercontent.com/osmo-support-lab/assetlists/main/zone.schema.json)
 */
export type LogoURIs = {
  png: string,
  svg?: string,
};

/**
 * An origin of the asset that captures transitions in form and location.
 *
 * _Note:_ Will be added with automatic generation via the Github Action in [osmo-support-lab/assetlists](https://github.com/osmo-support-lab/assetlists).
 *
 * @example {"type": "bridge", "counterparty": {"chain_name": "ethereum", "base_denom": "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"}, "provider": "Axelar"}
 * @example {"counterparty": {"base_denom": "gravity0x6B175474E89094C44Da98b954EedeAC495271d0F", "chain_name": "gravitybridge", "channel_id": "channel-10"}, "chain": {"channel_id": "channel-144", "path": "transfer/channel-144/gravity0x6B175474E89094C44Da98b954EedeAC495271d0F"}, "type": "ibc"}
 * @see [Zone Schema](https://raw.githubusercontent.com/osmo-support-lab/assetlists/main/zone.schema.json)
 */
export type Trace = {
  chain: Chain,
  counterparty: Counterparty,
  /**
   * @description The entity offering the service.
   * @example "Circle"
   * @example "Axelar"
   */
  provider?: string,
  type: TraceType,
};

/**
 * An origin of the asset.
 *
 * _Note:_ Will be added with automatic generation via the Github Action in [osmo-support-lab/assetlists](https://github.com/osmo-support-lab/assetlists).
 *
 * @example {"channel_id": "channel-208", "path": "transfer/channel-208/frax-wei"}
 * @see [Schema](https://raw.githubusercontent.com/osmo-support-lab/assetlists/main/assetlist.schema.json)
 */
export type Chain = {
  /**
   * @description The chain's IBC transfer channel.
   * @example "channel-1"
   */
  channel_id: string,
  /**
   * @description The contract address where the asset is or locked, where applicable.
   * @example "0x853d955acef822db058eb8505911ed77f175b99e"
   */
  contract?: string,
  /**
   * @description The port/channel/denom input string that generates the `ibc/<hash>` denom.
   * @example "transfer/channel-648/arkh"
   */
  path: string,
  /**
   * @description The port used to transfer IBC assets; often `"transfer"`, but sometimes varies.
   * @example "transfer"
   */
  port?: string,
};

/**
 * The direct counterparty of an asset. This is used to programmatically build some {@link Asset.additional_information|additional_information}.
 *
 * _Note:_ Will be added with automatic generation via the Github Action in [osmo-support-lab/assetlists](https://github.com/osmo-support-lab/assetlists).
 *
 * @example {"base_denom": "frax-wei", "chain_name": "axelar", "channel_id": "channel-3"}
 * @example {"chain_name": "ethereum", "base_denom": "0x853d955acef822db058eb8505911ed77f175b99e"}
 * @see [Schema](https://raw.githubusercontent.com/osmo-support-lab/assetlists/main/assetlist.schema.json)
 */
export type Counterparty = {
  /**
   * @description The base unit of the asset on its source platform.
   * @example "uatom"
   * @example  "0x853d955acef822db058eb8505911ed77f175b99e"
   */
  base_denom: string,
  /**
   * @description The name of the counterparty chain _(must match exactly the chain name used in the Chain Registry)_
   * @example "forex"
   * @example "cosmoshub"
   */
  chain_name: string,
  /**
   * @description The chain's IBC transfer channel.
   * @example "channel-1"
   */
  channel_id?: string,
  /**
   * @description The contract address where the asset is or locked, where applicable.
   * @example "0x853d955acef822db058eb8505911ed77f175b99e"
   */
  contract?: string,
  /**
   * @description The port used to transfer IBC assets; often `"transfer"`, but sometimes varies.
   * @example "transfer"
   */
  port?: string,
};

/**
 * The type of Trace.
 *
 * _Note:_ Will be added with automatic generation via the Github Action in [osmo-support-lab/assetlists](https://github.com/osmo-support-lab/assetlists).
 *
 * @see [Schema](https://raw.githubusercontent.com/osmo-support-lab/assetlists/main/assetlist.schema.json)
 */
export enum TraceType {
  Bridge = 'bridge',
  Ibc = 'ibc',
  IbcCw20 = 'ibc-cw20',
  LiquidStake = 'liquid-stake',
  Synthetic = 'synthetic',
  Wrapped = 'wrapped'
}

/**
 * The original type of asset.
 *
 * _Note:_ Will be added with automatic generation via the Github Action in [osmo-support-lab/assetlists](https://github.com/osmo-support-lab/assetlists).
 *
 * @see [Schema](https://raw.githubusercontent.com/osmo-support-lab/assetlists/main/assetlist.schema.json)
 */
export enum TypeAsset {
  /**
   * @description A CW-20 fungible token standard asset.
   */
  Cw20 = 'cw20',
  /**
   * @description An ERC-20 token standard asset from Ethereum.
   */
  Erc20 = 'erc20',
  /**
   * @description An ICS-020 fungible token standard asset.
   */
  Ics20 = 'ics20',
  /**
   * @description A native Cosmos SDK coin.
   */
  SDKCoin = 'sdk.coin',
  /**
   * @description A SNIP-20 fungible token from the Secret Network.
   */
  Snip20 = 'snip20'
}

/**
 * Either a SNIP-20, or a CW-20 fungible token.
 *
 * @see {@link TypeAsset.Cw20} or {@link TypeAsset.Snip20}
 */
export type AddressAssetType = TypeAsset.Cw20 | TypeAsset.Snip20;
