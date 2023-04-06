export type IbcSchema = {
  $schema?: string,
  chain_1: IbcSchemaChain,
  chain_2: IbcSchemaChain,
  channels: Channel[],
};

/**
* Top level IBC data pertaining to the chain. `chain_1` and `chain_2` should be in
* alphabetical order.
*/
export type IbcSchemaChain = {
  chain_name: string,
  /**
   * The client ID on the corresponding chain representing the other chain's light client.
   */
  client_id: string,
  /**
   * The connection ID on the corresponding chain representing a connection to the other chain.
   */
  connection_id: string,
};

export type IbcChain = {
  chain_name: string,
  channel_id?: string,
  port: string,
};

export type Channel = {
  chain_1: ChannelChain,
  chain_2: ChannelChain,
  /**
   * Human readable description of the channel.
   */
  description?: string,
  /**
   * Determines if packets from a sending module must be 'ordered' or 'unordered'.
   */
  ordering: Ordering,
  /**
   * Human readable key:value pairs that help describe and distinguish channels.
   */
  tags?: Tags,
  /**
   * IBC Version
   */
  version: string,
};

export type ChannelChain = {
  /**
   * The channel ID on the corresponding chain's connection representing a channel on the
   * other chain.
   */
  channel_id: string,
  /**
   * The IBC port ID which a relevant module binds to on the corresponding chain.
   */
  port_id: string,
};

/**
* Determines if packets from a sending module must be 'ordered' or 'unordered'.
*/
export enum Ordering {
  Ordered = 'ordered',
  Unordered = 'unordered'
}

/**
* Human readable key:value pairs that help describe and distinguish channels.
*/
export type Tags = {
  dex?: string,
  preferred?: boolean,
  /**
   * String that helps describe non-dex use cases ex: interchain accounts(ICA).
   */
  properties?: string,
  status?: Status,
};

export enum Status {
  Killed = 'killed',
  Live = 'live',
  Upcoming = 'upcoming'
}
