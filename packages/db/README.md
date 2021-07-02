# DB

## Getting Started

1. Sign up at https://fauna.com.
2. Create a database and then obtain an API key.
3. Add a `.env.local` to the project root with the following content:
    ```sh
    FAUNA_KEY="<YOUR_FAUNA_API_KEY>"
    ```
4. Import the DB schema:
    ```sh
    npm run import
    ```

## Collections

### `User`

A registered user in the system.

### `AuthToken`

An auth key (API key) used to authenticate user actions.

### `Content`

A file/directory that is being recorded by the system, essentially a root CID. It may have been uploaded by multiple users.

It's DAG size is cached here and it contains references to [pins](#pin) (IPFS nodes that are pinning it) and the [deals](#deal) (Filecoin deals it appears in).

### `Pin`

A CID for content that is pinned in IPFS.

### `PinLocation`

Location of a pin - libp2p peer ID and optionally a name.

### `Upload`

Content that was uploaded to the system by a user.

### `Deal`

Information for Filecoin deals that an asset appears in.
