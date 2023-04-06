import {
  type AdditionalInformation,
  type LogoURIs,
} from './assetlistTypes';

/**
 * A basic list of assets for a particular chain. Used to auto-generate a completed asset list.
 *
 * Work originally based upon [@Jeremy Parish](https://github.com/JeremyParish69)'s work on [Osmosis-Labs/asssetlists](https://github.com/osmosis-labs/assetlists/).
 *
 * @file TypeScript types for based upon [zone schema](https://raw.githubusercontent.com/osmo-support-lab/assetlists/main/zone.schema.json).
 * @author Osmosis Support Lab <support@osmosisdao.zone>
 * @license MIT
 * @version v1.0.0
 */
export type Zone = {
  /**
   * @description A reference link pointing towards the Support Lab specification which describes all possible properties within the asset list object.
   * @see [Zone Schema](https://raw.githubusercontent.com/osmo-support-lab/assetlists/main/zone.schema.json)
   */
  $schema: string,
  /**
   * @description An array of assets included in this zone list.
   * @see {@link ZoneAsset}
   */
  assets: ZoneAsset[],
  /**
   * @description The name of the chain where these assets are used.
   */
  chain_name: string,
};

/**
 * Represents loose struct of the Cosmos SDK's `DenomMetadata`. Allowing for overrides with {@link ZoneAsset.frontend_properties|frontend_properties}
 */
export type ZoneAsset = {
  /**
   * @description The base unit of the asset prior to reaching the {@link Assetlist.chain_name|chain_name}.
   */
  base_denom: string,
  /**
   * @description Chain name as used in the Cosmos Chain Registry
   */
  chain_name: string,
  /**
   * @description An override to the `pretty_name` of an asset's chain from the {@link https://github.com/cosmos/chain-registry|Chain Registry} repo.
   * @example "oSmosis" --> "Osmosis"
   * @since v1.0.0
   */
  chain_name_pretty?: string,
  /**
   * @description Properties should behave or appear differently on front ends.
   * @see {@link FrontendProperties}
   * @since v1.0.0
   */
  frontend_properties?: FrontendProperties,
};

/**
* Properties that should not follow the Chain Registry, and behave or appear differently on
* different front ends.
*/
export type FrontendProperties = {
  /**
   * @description A list of up to 10 objects that have key:value pairs. Currently for the [Support Lab maintained](https://raw.githubusercontent.com/osmo-support-lab/assetlists/main/osmosis-1/osmosis-1.assetlist.json) asset list, these are automatically generated.
   * @see {@link AdditionalInformation}
   * @since v1.0.0
   */
  additional_information?: AdditionalInformation[],
  /**
   * @description And override for the coingecko id to fetch asset data from the [Coingecko API V3](https://www.coingecko.com/en/api/documentation).
   */
  coingecko_id?: string,
  /**
   * @description An override for the short description of the asset as part of the adherence to `x/bank - DenomMetadata`.
   *
   * @since v1.0.0
   * @see [Cosmos Network Docs](https://docs.cosmos.network/main/modules/bank#denommetadata)
   */
  description?: string,
  /**
   * @description An array of up to 20 keywords to describe the asset.
   *
   * _Note:_ Will be appended __after__ any keywords in the chains `assetlist.json` with the Github Action in [osmo-support-lab/assetlists](https://github.com/osmo-support-lab/assetlists).
   * @since v1.0.0
   * @example ["Native", "Derivative", "Liquid-Staked", "Wrapped/Bridged", "Fiat-Collateralized", "Anchored", "Utility", "Reflexive", ...]
   */
  keywords?: string[],
  /**
   * @description Overrides for logo images.
   *
   * @requires png - At least a PNG must be uploaded to the {@link [images]('../images')} directory under the folder for assets {@link ZoneAsset.chain_name|chain_name}.
   * @see {@link [Images Directory]('../images')}
   */
  logo_URIs?: LogoURIs,
  /**
   * @description This Support Lab added field is for bridged assets to allow front ends to display a path the asset has taken. This field is non-standard, and is edited via `frontend_properties`.
   * @since v1.0.0
   * @see [Zone Schema](https://raw.githubusercontent.com/osmo-support-lab/assetlists/main/zone.schema.json)
   */
  pretty_path?: string,
  /**
   * @description An override to the symbol of the asset as part of the adherence to `x/bank - DenomMetadata`.
   *
   * @since v1.0.0
   * @example "WBTC" --> "WBTC.axl"
   * @see {@link [Cosmos Network Docs](https://docs.cosmos.network/main/modules/bank#denommetadata)}
   */
  symbol?: string,
};
