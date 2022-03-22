# [Terms of service](#terms-of-service)

The following terms and conditions govern all use of the Web3.Storage website (“Web3.Storage” or the “Website”) and all content, services and products available at or through the Website. The Website is offered subject to your acceptance without modification of all of the terms and conditions contained herein. As all data uploaded to Web3.Storage will be stored on IPFS, this Website incorporates the [Terms of Service of IPFS.io](https://discuss.ipfs.io/tos).

If you do not agree to all the terms and conditions of this agreement, then you may not access the Website or use any of its services.

#### [Storage term](#storage-term)

Data stored via the Website will be stored on IPFS for as long as Protocol Labs, Inc. continues to operate the Website, and on Filecoin until the expiry of the respective deals (see “Filecoin deals” below for details).

Data will be stored as above at no cost to the user for as long as Protocol Labs, Inc. continues to operate the Website. The Website is operated at no cost to the user relying on open source infrastructure maintained by Protocol Labs, Inc. and [Filecoin Plus](https://docs.filecoin.io/store/filecoin-plus/) to fund storage deals.

Protocol Labs, Inc. reserves the right to terminate the Website at its sole discretion or to transfer operation of the Website to a third party or smart contract. Prior to termination or transfer, Protocol Labs, Inc. will provide 90 days’ notice to users via email to allow users enough time to make arrangements if any (e.g. pinning to their own IPFS node, or preparing to manage the renewal of their Filecoin deals on their own).

All data uploaded to Web3.Storage is available to anyone who requests it using the correct CID. Users should not store any private or sensitive information in an unencrypted form using Web3.Storage. Further, deleting files from Web3.Storage via the site's Files page or API will remove them from the file listing for a user's account, but nodes on the IPFS network may retain copies of the data indefinitely. Users should not use Web3.Storage for data that may need to be permanently deleted in the future.

#### [Data limits](#data-limits)

Web3.Storage supports uploads up to 31GiB in size per request, and currently has a cap of 1TiB of storage per account. Data limits can be increased at no cost by submitting a request via your Account page when logged in.

#### [Filecoin deals](#filecoin-deals)

Data stored via the Website is guaranteed to be available in IPFS upon completion of a successful upload. Please note that once replication in IPFS is complete (at a minimum of 3 copies being stored), data is also pushed to be stored on Filecoin. Content is batched into deals on Filecoin and it is expected that there may be a delay between the content being uploaded to the Website and being stored on Filecoin through a deal. You may query the status of any CID uploaded through Web3.Storage using the Status API (updated every five minutes) for the latest information regarding an individual CID's pin status or deal status.

For reference, the following parameters and strategies are used to ensure highly redundant storage on the Filecoin network:

- Deals with storage providers are set to last 18 months with automatic deal renewals, managed by Web3.Storage.

- Each piece of content is stored with a minimum of 5 storage providers, typically exceeding this minimum (the specific list of storage providers being provided via the Status API).

- In the event of a terminated sector, Web3.Storage will automatically store an additional copy to meet the minimum of 5 copies being stored on the Filecoin network.

It is recommended that you do not rely on Filecoin deals directly for performant retrieval, and instead retrieve the data via IPFS (where Web3.Storage will be dual pinning the content). Retrieving data over the IPFS network is the recommended means of accessing Web3.Storage data.
