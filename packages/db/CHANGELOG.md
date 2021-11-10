# Changelog

## [2.5.0](https://www.github.com/web3-storage/web3.storage/compare/db-v2.4.0...db-v2.5.0) (2021-10-29)


### Features

* add migration indexes ([#573](https://www.github.com/web3-storage/web3.storage/issues/573)) ([c9cd864](https://www.github.com/web3-storage/web3.storage/commit/c9cd8642f9c9d21d98b3d9e9061d8549b82f35ef))
* add migration tracker table ([#578](https://www.github.com/web3-storage/web3.storage/issues/578)) ([dc1ce24](https://www.github.com/web3-storage/web3.storage/commit/dc1ce241e129fe65108cb96f129032608acd2b8a))


### Bug Fixes

* backup should not have unique url ([#580](https://www.github.com/web3-storage/web3.storage/issues/580)) ([14b5c78](https://www.github.com/web3-storage/web3.storage/commit/14b5c781be6e886c9e5158f81795efe773d22ffe))

## [2.4.0](https://www.github.com/web3-storage/web3.storage/compare/db-v2.3.1...db-v2.4.0) (2021-10-28)


### Features

* cron and pinpin rewire ([#531](https://www.github.com/web3-storage/web3.storage/issues/531)) ([9e5b42d](https://www.github.com/web3-storage/web3.storage/commit/9e5b42dc6d33bf3cf017034474981812370b366e))
* postgres setup ([#508](https://www.github.com/web3-storage/web3.storage/issues/508)) ([cd04716](https://www.github.com/web3-storage/web3.storage/commit/cd04716844a646d986f53aeae7c73840a008aad3))
* updated at indexes ([#551](https://www.github.com/web3-storage/web3.storage/issues/551)) ([b6c0ce5](https://www.github.com/web3-storage/web3.storage/commit/b6c0ce51f51e5b5339a202fbd04c15674e36e79d))


### Bug Fixes

* add mocha dev dependency to api and db ([0648527](https://www.github.com/web3-storage/web3.storage/commit/064852797e0cf56faacbfdcbf9a142973e25c663))
* **api:** add timeout statement to upload function ([#569](https://www.github.com/web3-storage/web3.storage/issues/569)) ([bf17756](https://www.github.com/web3-storage/web3.storage/commit/bf177569c690ad1f37583574a0b8c6026c189f40))
* db client improvements ([#546](https://www.github.com/web3-storage/web3.storage/issues/546)) ([5deffae](https://www.github.com/web3-storage/web3.storage/commit/5deffae2ec3e6c81d90d7db10285fd051c5c1c7d))
* db fauna updated ts ([#572](https://www.github.com/web3-storage/web3.storage/issues/572)) ([c0c8334](https://www.github.com/web3-storage/web3.storage/commit/c0c8334ff29810d4c7f841740fd8714acf0e9a66))
* upload fn ts wrongly inserted ([#570](https://www.github.com/web3-storage/web3.storage/issues/570)) ([c9de809](https://www.github.com/web3-storage/web3.storage/commit/c9de809d4bda1939e6867f22fef986d493888bfe))


### Changes

* api rewire ([#524](https://www.github.com/web3-storage/web3.storage/issues/524)) ([f4f9cd3](https://www.github.com/web3-storage/web3.storage/commit/f4f9cd39f0859b843067057af9bcdbf4f29063e9))

### [2.3.1](https://www.github.com/web3-storage/web3.storage/compare/db-v2.3.0...db-v2.3.1) (2021-09-28)


### Bug Fixes

* increment used storage ([#501](https://www.github.com/web3-storage/web3.storage/issues/501)) ([1becd09](https://www.github.com/web3-storage/web3.storage/commit/1becd09bbdaabc503c180cc38c37f7f03852fe62))

## [2.3.0](https://www.github.com/web3-storage/web3.storage/compare/db-v2.2.0...db-v2.3.0) (2021-09-27)


### Features

* storage backup ([#417](https://www.github.com/web3-storage/web3.storage/issues/417)) ([ae5423a](https://www.github.com/web3-storage/web3.storage/commit/ae5423aebc779545126fb6ba652637317efc91e7))


### Bug Fixes

* chunked backup creation ([#496](https://www.github.com/web3-storage/web3.storage/issues/496)) ([4c8cf17](https://www.github.com/web3-storage/web3.storage/commit/4c8cf173deb21cbf0debf40901bfd2e7207c2026))
* upload type in upload enum for db ([#490](https://www.github.com/web3-storage/web3.storage/issues/490)) ([ed8f089](https://www.github.com/web3-storage/web3.storage/commit/ed8f0897082160015a0fa7a23ac0ec55bd78bceb))

## [2.2.0](https://www.github.com/web3-storage/web3.storage/compare/db-v2.1.0...db-v2.2.0) (2021-09-06)


### Features

* allow uploads to be renamed ([2cd9483](https://www.github.com/web3-storage/web3.storage/commit/2cd9483734df5e558a79f58701002f2c50c94269))
* api supports upload list sorting ([#373](https://www.github.com/web3-storage/web3.storage/issues/373)) ([7b0ec3b](https://www.github.com/web3-storage/web3.storage/commit/7b0ec3beea3aa9b596a794441267d7b8bfcbb7b6))

## [2.1.0](https://www.github.com/web3-storage/web3.storage/compare/db-v2.0.3...db-v2.1.0) (2021-08-24)


### Features

* additional UDFs for admin purposes ([#348](https://www.github.com/web3-storage/web3.storage/issues/348)) ([919e9cb](https://www.github.com/web3-storage/web3.storage/commit/919e9cb0a20342413bc31c86e543da193f444300))
* cron metrics ([#305](https://www.github.com/web3-storage/web3.storage/issues/305)) ([f064afb](https://www.github.com/web3-storage/web3.storage/commit/f064afb83776e14d6a66f1bde5884a9d57013794))


### Bug Fixes

* add pin sync queue collection ([#369](https://www.github.com/web3-storage/web3.storage/issues/369)) ([9813a1d](https://www.github.com/web3-storage/web3.storage/commit/9813a1d8cf4b96a7aa44ddbfd25502699c6601f5))
* consider pins within the last month ([214f288](https://www.github.com/web3-storage/web3.storage/commit/214f288d499b362b67e5a2eeb652e583290da620))
* dag size UDFs ([6841775](https://www.github.com/web3-storage/web3.storage/commit/68417757553b5afc56e09f21db2b44cf49150954))
* delete fauna history when deleting PinRequest ([191ad1a](https://www.github.com/web3-storage/web3.storage/commit/191ad1a78a3f02f4633d8783206251754dec272d))
* find pins by status sort by created DESC ([#292](https://www.github.com/web3-storage/web3.storage/issues/292)) ([e96d6ae](https://www.github.com/web3-storage/web3.storage/commit/e96d6aec5bc3fe85772152f4a467568bfbf66579))
* incremental metrics ([#349](https://www.github.com/web3-storage/web3.storage/issues/349)) ([8347c20](https://www.github.com/web3-storage/web3.storage/commit/8347c20ed4a34c983d4d815b41c06fb849fff279))
* metrics ([#285](https://www.github.com/web3-storage/web3.storage/issues/285)) ([b4c1bb2](https://www.github.com/web3-storage/web3.storage/commit/b4c1bb2f60788324c3a14440236047e97bcec460))
* pin sync request history ([fbbd718](https://www.github.com/web3-storage/web3.storage/commit/fbbd71803cbfdec20f6a2614096c21b7a578e8e4))
* pins sync job ([26bdb43](https://www.github.com/web3-storage/web3.storage/commit/26bdb431ea72b0eac1149907e276e4f345a43516))


### Performance Improvements

* faster pin status sync ([#338](https://www.github.com/web3-storage/web3.storage/issues/338)) ([2861e33](https://www.github.com/web3-storage/web3.storage/commit/2861e3346cdff780b6eec6e50f0b365c7dd7f35e))

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
