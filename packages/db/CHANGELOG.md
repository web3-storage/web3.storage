# Changelog

### [2.0.3](https://www.github.com/web3-storage/web3.storage/compare/db-v2.0.2...db-v2.0.3) (2021-08-03)


### Bug Fixes

* increment user used storage in waitUntil ([#280](https://www.github.com/web3-storage/web3.storage/issues/280)) ([aa32153](https://www.github.com/web3-storage/web3.storage/commit/aa321534b0fba899488587c8df3ab5378dad30e2))

### [2.0.2](https://www.github.com/web3-storage/web3.storage/compare/db-v2.0.1...db-v2.0.2) (2021-07-30)


### Bug Fixes

* pins dag size default to 0 ([#252](https://www.github.com/web3-storage/web3.storage/issues/252)) ([5e578f4](https://www.github.com/web3-storage/web3.storage/commit/5e578f4ae9f0f1edb35e0c38b39007781cad7bd6))

### [2.0.1](https://www.github.com/web3-storage/web3.storage/compare/db-v2.0.0...db-v2.0.1) (2021-07-30)


### Bug Fixes

* path to usedStorage ([10e12de](https://www.github.com/web3-storage/web3.storage/commit/10e12dea780297eb06dc8a181d01b8d946652672))
* update usedStorage for chunked uploads ([#249](https://www.github.com/web3-storage/web3.storage/issues/249)) ([069fbf8](https://www.github.com/web3-storage/web3.storage/commit/069fbf815057d75b9099c1c7a2f8c528fbba7fae))

## [2.0.0](https://www.github.com/web3-storage/web3.storage/compare/db-v1.0.0...db-v2.0.0) (2021-07-28)


### ⚠ BREAKING CHANGES

* track user storage (#197)

### Features

* track user storage ([#197](https://www.github.com/web3-storage/web3.storage/issues/197)) ([ffdd27c](https://www.github.com/web3-storage/web3.storage/commit/ffdd27c68adc6c9328f83e626c2b5d96d2e06397))

## 1.0.0 (2021-07-22)


### ⚠ BREAKING CHANGES

* add upload type property (#123)

### Features

* add PinRequest to track CIDs to replicate ([#118](https://www.github.com/web3-storage/web3.storage/issues/118)) ([8a1aee7](https://www.github.com/web3-storage/web3.storage/commit/8a1aee7c1e03e5be70661e2a253ebe1bf2666aba))
* add upload type property ([#123](https://www.github.com/web3-storage/web3.storage/issues/123)) ([957ac21](https://www.github.com/web3-storage/web3.storage/commit/957ac217dd887d13db904e07b67d0417d852f54b)), closes [#115](https://www.github.com/web3-storage/web3.storage/issues/115)
* cron pin sync ([#71](https://www.github.com/web3-storage/web3.storage/issues/71)) ([d40980a](https://www.github.com/web3-storage/web3.storage/commit/d40980aa8c20c68d209f6c1d00f9dbf93d192895))
* db ([#10](https://www.github.com/web3-storage/web3.storage/issues/10)) ([dfeffd6](https://www.github.com/web3-storage/web3.storage/commit/dfeffd6f4d529fe5765ee0ea12d0a813f2e951af))
* delete user upload ([#48](https://www.github.com/web3-storage/web3.storage/issues/48)) ([885ddbf](https://www.github.com/web3-storage/web3.storage/commit/885ddbf7fda174c0ca64c415ff99ec87fc1e1c46))
* find uploads ([#35](https://www.github.com/web3-storage/web3.storage/issues/35)) ([151eaa4](https://www.github.com/web3-storage/web3.storage/commit/151eaa49c696b0757510b6e04501a8cf8595da3f))
* get metrics ([#70](https://www.github.com/web3-storage/web3.storage/issues/70)) ([f95f152](https://www.github.com/web3-storage/web3.storage/commit/f95f152ea27b2f2140654ad199e8bcd7b875033e))
* post car api ([#25](https://www.github.com/web3-storage/web3.storage/issues/25)) ([7dd1386](https://www.github.com/web3-storage/web3.storage/commit/7dd13864f6e457ab6ddd69e52ab7223c208b1f1f))
* storage broker API ([#51](https://www.github.com/web3-storage/web3.storage/issues/51)) ([0061339](https://www.github.com/web3-storage/web3.storage/commit/0061339c961f3c4e9ad138bf094bb8c4d4c7cfdf))
* update Content dagSize from addAggregateEntries ([#122](https://www.github.com/web3-storage/web3.storage/issues/122)) ([bd2dc50](https://www.github.com/web3-storage/web3.storage/commit/bd2dc50b654798cee710d093997250cb97f8f613))
* user token delete ([#30](https://www.github.com/web3-storage/web3.storage/issues/30)) ([41b7470](https://www.github.com/web3-storage/web3.storage/commit/41b7470ddfed050f46be3d7a3eb18f33db381e43))
* user tokens get ([#23](https://www.github.com/web3-storage/web3.storage/issues/23)) ([a58e525](https://www.github.com/web3-storage/web3.storage/commit/a58e5254bc6126fb8842d42215b5a07c217c4de2))


### Bug Fixes

* chainDealId is unique ([#26](https://www.github.com/web3-storage/web3.storage/issues/26)) ([221a5a6](https://www.github.com/web3-storage/web3.storage/commit/221a5a6810643e7a8ad98a45ce262581568db316))
* delete upload by cid ([#81](https://www.github.com/web3-storage/web3.storage/issues/81)) ([8faca9c](https://www.github.com/web3-storage/web3.storage/commit/8faca9cb886bf1a8c5ae26c63d5ab7cac60b5c47))
* import gql schema before fql indexes ([#50](https://www.github.com/web3-storage/web3.storage/issues/50)) ([685d53d](https://www.github.com/web3-storage/web3.storage/commit/685d53d7e23a42ac9cccbce1cf4e351d4c7fed34)), closes [#49](https://www.github.com/web3-storage/web3.storage/issues/49)
* split CAR uploads ([#42](https://www.github.com/web3-storage/web3.storage/issues/42)) ([80feba4](https://www.github.com/web3-storage/web3.storage/commit/80feba4be7702f79057074f3b8997fd754c5d348))
* switch dagSize type to Long ([#116](https://www.github.com/web3-storage/web3.storage/issues/116)) ([15f85eb](https://www.github.com/web3-storage/web3.storage/commit/15f85eb3bbf090ee4bfce5138eb7b963991956e5))
