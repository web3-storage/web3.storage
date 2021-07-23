### What is Web3.Storage?

Web3.Storage aims to make leveraging the power of decentralized storage for web3 applications as simple as possible - no additional infrastructure required and totally free. Behind the scenes, Web3.Storage relies on Filecoin for persistent, decentralized storage and IPFS for content addressing and cached retrievals. Packaged into a friendly JS client library, developers can get started building on web3 technologies with just a few lines of code.

### Methodology

Content uploaded to [Web3.Storage](http://web3.storage) is pinned redundantly in an [IPFS Cluster](https://cluster.ipfs.io/) of 3 geographically distributed nodes. When 32GiB of content is made available, a request is made to pin a new batch of content into a separate IPFS cluster - where a 32GiB [CAR file](https://ipld.io/specs/transport/car/carv2/#summary) is generated to store the data. Once this 32GiB CAR file is ready, a queue of geographically distributed storage providers - selected for performance and availability - bid for the right to store these deals, with the Web3.Storage client making a minimum of 5 deals with the various storage providers. Please see the [documentation](/) for how one can use the Status API to query for information regarding pin status and deal status for your uploaded content.

Once the deals are active, the [Web3.Storage](http://web3.storage) client polls to ensure that the relevant sectors are still available. In the event of an early termination (or a storage provider going offline), the [Web3.Storage](http://web3.storage) client will automatically add the relevant deals into the queue of upcoming deals to ensure at all times there are always a minimum of 5 copies of data being stored with Filecoin Storage Providers.

In the future, we hope to expand this service to offer a variety of options for storing data - including purely protocol based approaches (e.g. via smart contracts) as well as other hosted options (e.g. HTTP end points). We also aim to provide more native tooling for automated deal management via tools like Data DAOs - which may augment the offerings of this service in the future. Our aim today is to provide a user friendly experience that massively reduces the burden for onboarding new use cases into the web3 ecosystem today - while providing an upgrade path for further decentralization.

### Storage Term and Data Limits

[Web3.Storage](http://web3.storage) supports uploads up to 32GiB in size per request, and currently has a cap of 32GiB of storage per account. Data stored via Web3.Storage will be stored at no cost to the user on IPFS indefinitely for as long as Protocol Labs, Inc. continues to operate the service, and stored in Filecoin until deal expiry (see below for details).

Protocol Labs, Inc. reserves the right to terminate Web3.Storage at its sole discretion or to transfer management of deals to a third party or smart contract.

Prior to termination, Protocol Labs will provide 90 days notice to users via email to allow users enough time to make arrangements (e.g. pinning to their own IPFS node, or preparing to manage the renewal of their Filecoin deals on their own).

### Filecoin deals

Data stored in [Web3.Storage](http://web3.storage) is guaranteed to be available in IPFS upon completion of a successful upload. Please note that once replication in IPFS is complete (at a minimum of 3 copies being stored), data is also pushed to be stored on Filecoin. Given content is aggregated into deals on Filecoin, it is expected that there may be a delay between the content being uploaded to the service and eventually making it into a deal on Filecoin. You may query the status of any CID uploaded through [Web3.Storage](http://web3.storage) using the [Status API](/) (updated every five minutes) for the latest information regarding an individual CID's pin status or deal status.

For reference, the following parameters and strategies are used to ensure highly redundant storage on the Filecoin network:

- Deals with Storage Providers are set to last 18 months with deal renewals being automatically managed by [Web3.Storage](http://web3.storage).
- Each piece of content is stored with a minimum of 5 storage providers, typically exceeding this minimum (the specific list of storage providers being provided via the [Status API](/)).
- In the event of a storage provider going offline, [Web3.Storage](http://web3.storage) will automatically store an additional copy to meet the minimum of 5 copies being stored on the Filecoin network.

It is recommended that you do not rely on Filecoin deals directly for performant retrieval, and instead you allow [Web3.Storage](http://web3.storage) to make the data available in IPFS. Retrieving data over the IPFS network is the recommended means of accessing [Web3.Storage](http://web3.storage) data.

### [Terms of service](/terms)
