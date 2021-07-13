# DB

## Getting Started

1. Sign up at https://fauna.com.
2. Create a `classic` database and then obtain an API key.
3. Add a `.env.local` to the project root with the following content:
    ```sh
    FAUNA_KEY="<YOUR_FAUNA_API_KEY>"
    ```
4. Import the DB schema:
    ```sh
    npm run import
    ```

Note: the `import` task imports both the GraphQL schema and the FaunaQL functions and Indexes for you. If you run them separately you need to run `import:gql` first to create the Collections **before** running `import:fql` which include references to those Collections.

## Schema

[![web3.storage schema](https://user-images.githubusercontent.com/152863/125276207-dc959980-e307-11eb-99fb-3f0c81d61b8f.jpg)](https://user-images.githubusercontent.com/152863/125276207-dc959980-e307-11eb-99fb-3f0c81d61b8f.jpg)

### `User`

A registered user in the system.

### `AuthToken`

An auth key (API key) used to authenticate user actions.

### `Content`

A file/directory that is being recorded by the system, essentially a root CID. It may have been uploaded by multiple users.

It's DAG size is cached here and it contains references to [pins](#pin) (IPFS nodes that are pinning it) and the [batchEntries](#batchentry) (Filecoin deal batches it appears in).

### `Pin`

Information for piece of content pinned in IPFS - it's pinning status and location.

### `PinLocation`

Location of a pin - libp2p peer ID, an optional name and a geographic region.

### `Upload`

Content that was uploaded to the system by a user.

### `Deal`

Information about a Filecoin deal for a [batch](#batch) of content.

### `Batch`

A aggregation of content that appears in a Filecoin deal. Content is assembled into [batch entries](#batchentry) which reference the [content](#content) and describe how to access the data within the batch (via a `dataModelSelector`).

### `BatchEntry`

Information about [content](#content) that is included in a [batch](#batch). 

