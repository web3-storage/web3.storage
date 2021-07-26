# Changelog

## [3.0.0](https://www.github.com/web3-storage/web3.storage/compare/web3.storage-v2.1.1...web3.storage-v3.0.0) (2021-07-26)


### ⚠ BREAKING CHANGES

* make unixfs importer on ipfs-car use same defaults as lotus (#170)

### Features

* make unixfs importer on ipfs-car use same defaults as lotus ([#170](https://www.github.com/web3-storage/web3.storage/issues/170)) ([06f6948](https://www.github.com/web3-storage/web3.storage/commit/06f6948ce36b5e2a87f31b9bfac41e9465cb901b))


### Bug Fixes

* throw on 404 from /get ([#159](https://www.github.com/web3-storage/web3.storage/issues/159)) ([2fce1ac](https://www.github.com/web3-storage/web3.storage/commit/2fce1ac1db52dbb41910367ffc6394483908528d))

### [2.1.1](https://www.github.com/web3-storage/web3.storage/compare/web3.storage-v2.1.0...web3.storage-v2.1.1) (2021-07-23)


### Bug Fixes

* remove dev files from published client ([e02a349](https://www.github.com/web3-storage/web3.storage/commit/e02a349f0020b37767311241cbeece8e61e8017a))

## [2.1.0](https://www.github.com/web3-storage/web3.storage/compare/web3.storage-v2.0.1...web3.storage-v2.1.0) (2021-07-23)


### Features

* user option for wrapWithDirectory ([#143](https://www.github.com/web3-storage/web3.storage/issues/143)) ([b08be84](https://www.github.com/web3-storage/web3.storage/commit/b08be84e7efcd610c21ff56b0cc129a11faf3840))

### [2.0.1](https://www.github.com/web3-storage/web3.storage/compare/web3.storage-v2.0.0...web3.storage-v2.0.1) (2021-07-22)


### Bug Fixes

* types in example ([1662d85](https://www.github.com/web3-storage/web3.storage/commit/1662d856ef7886dbd686355276c57d45fadd2105))

## [2.0.0](https://www.github.com/web3-storage/web3.storage/compare/web3.storage-v1.0.0...web3.storage-v2.0.0) (2021-07-19)


### ⚠ BREAKING CHANGES

* cid prop on web3file is a string

### Features

* client.status(cid) ([#95](https://www.github.com/web3-storage/web3.storage/issues/95)) ([b0a7d63](https://www.github.com/web3-storage/web3.storage/commit/b0a7d639ad28eccdbfd7a33a16a0a5004774533d))


### Bug Fixes

* cid prop on web3file is a string ([46dfe2f](https://www.github.com/web3-storage/web3.storage/commit/46dfe2fb26948dabc82e1b7c645f58bfb1d4a407))
* usage examples ([#58](https://www.github.com/web3-storage/web3.storage/issues/58)) ([0f5c23b](https://www.github.com/web3-storage/web3.storage/commit/0f5c23b57abded860f4dcffc2e7bef4265821cb0))

## 1.0.0 (2021-07-09)


### Features

* client `.store` & `.get` ([#2](https://www.github.com/web3-storage/web3.storage/issues/2)) ([fb8f8ce](https://www.github.com/web3-storage/web3.storage/commit/fb8f8ce1267c17b26b29fc9c004ab7a40b503ae9))
* client.get: (cid) => Responsish ([#4](https://www.github.com/web3-storage/web3.storage/issues/4)) ([5efc715](https://www.github.com/web3-storage/web3.storage/commit/5efc7159770d25787bb7ce6cf852105ff5da2076))
* cors ([#3](https://www.github.com/web3-storage/web3.storage/issues/3)) ([42175db](https://www.github.com/web3-storage/web3.storage/commit/42175db4c27efe37df9a6da936f7b276c673efea))
* feat: client.get uses unpackStream ([1973a7b](https://www.github.com/web3-storage/web3.storage/commit/1973a7b6372dd46a5e70458fa4ae1bc3ddf8d275))
* onRootCidReady ([#15](https://www.github.com/web3-storage/web3.storage/issues/15)) ([1442aab](https://www.github.com/web3-storage/web3.storage/commit/1442aab183e538b910a4591d68b0d0fbedafdd18))
* post car api ([#25](https://www.github.com/web3-storage/web3.storage/issues/25)) ([7dd1386](https://www.github.com/web3-storage/web3.storage/commit/7dd13864f6e457ab6ddd69e52ab7223c208b1f1f))
* put files (client) ([#12](https://www.github.com/web3-storage/web3.storage/issues/12)) ([2c11f5e](https://www.github.com/web3-storage/web3.storage/commit/2c11f5e7b1ac3f3935b5e8087908b0590df9fde0))


### Bug Fixes

* change filecoin storage to web3 storage in client ([#9](https://www.github.com/web3-storage/web3.storage/issues/9)) ([9eae4a4](https://www.github.com/web3-storage/web3.storage/commit/9eae4a40b172a35037d3b6f15f69a36c5b0cc14b))
