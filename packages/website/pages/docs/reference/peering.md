---
title: Peering with Web3.Storage
description: Learn how and why to peer your IPFS nodes with Web3.Storage
---

# Peering with Web3.Storage

Web3.Storage uses [IPFS](https://ipfs.io) to provide [decentralized storage][concepts-decentralized-storage] that can be easily accessed and verified by any IPFS node.

When an IPFS node is looking for some data, it sends out a message to all of the IPFS nodes it's currently connected to (its "peers"). If none of the connected peers has the data for the requested CID (Content Identifier), the node will search the [DHT][concepts-ipfs-dht], a Distributed Hash Table that contains "advertisements" called Provider Records containing the addresses of nodes who are providing the data for each CID.

To get the fastest response time for your queries, it's beneficial to be directly connected to the nodes providing the data. This avoids the DHT query and can improve overall latency and responsiveness. You can configure your [kubo][kubo-github] IPFS node to prioritize some nodes and try to maintain persistent connections to them. This is called _peering_, and can especially benefit "infrastructure nodes" with lots of traffic.

Web3.Storage uses [Elastic IPFS][elastic-ipfs], a new cloud-native implementation of the core IPFS protocols. Even though under the hood Elastic IPFS consists of many interoperating systems, each deployment presents itself to the IPFS network as one big node with a single address and Peer ID.

Elastic IPFS advertises content to the DHT indirectly using a collection of "indexer nodes". As a result, there may be a slight delay after the initial upload where content is availabe to fetch from Elastic IPFS, but is not yet discoverable via the DHT. Peering with our Elastic IPFS node will remove the delay and make content retrievable right away.

Here's an example of the [`Peering` configuration][ipfs-docs-peering-config] for [kubo][kubo-github], the primary Go implementaton of IPFS:

```json
{
  "Peering": {
    "Peers": [
      {
        "ID": "bafzbeibhqavlasjc7dvbiopygwncnrtvjd2xmryk5laib7zyjor6kf3avm",
        "Addrs": ["/dnsaddr/elastic.dag.house"]
      }
    ]
  }
}
```

Adding the `Peering` section shown above to your configuration file should result in your node maintaining a connection to our Elastic IPFS proivder.

If you're using a different IPFS implementation, follow their docs for peering and use the following address and Peer ID:

**Address:** `/dnsaddr/elastic.dag.house`

**Peer ID:** `bafzbeibhqavlasjc7dvbiopygwncnrtvjd2xmryk5laib7zyjor6kf3avm`

See [Peering with content providers][ipfs-docs-peering-with-content-providers] in the IPFS docs for more examples, as well as a list of other content providers that you might want to peer with.

[concepts-decentralized-storage]: /docs/concepts/decentralized-storage/
[concepts-ipfs-dht]: https://docs.ipfs.tech/concepts/dht/
[elastic-ipfs]: https://github.com/elastic-ipfs/elastic-ipfs
[ipfs-docs-peering-config]: https://docs.ipfs.tech/how-to/configure-node/#peering
[ipfs-docs-peering-with-content-providers]: https://docs.ipfs.tech/how-to/peering-with-content-providers/
[kubo-github]: https://github.com/ipfs/kubo
