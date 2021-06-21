# filecoin.storage API

## API

### 🔐 `PUT /car/:cid`

Upload a CAR for a root CID. _Authenticated_

### `GET /car/:cid`

Fetch a CAR by CID.

### `HEAD /car/:cid`

Fetch headers like content-length for a given CAR.

### `GET /root/:cid/deals`

Get filecoin deals info. (*TBD*) We need to define what info we want here to find the right status.
