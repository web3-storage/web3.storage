# Changelog

## [3.2.0](https://www.github.com/web3-storage/web3.storage/compare/api-v3.1.1...api-v3.2.0) (2021-07-30)


### Features

* add 'hasUpload' property to the tokens ([f583565](https://www.github.com/web3-storage/web3.storage/commit/f58356593a0e9cf02fa3a4c5c96a6be2d9acfc03))
* restrict block size ([#242](https://www.github.com/web3-storage/web3.storage/issues/242)) ([85b3199](https://www.github.com/web3-storage/web3.storage/commit/85b31996108e8c6a8d421844f82f35187efe85fa))


### Bug Fixes

* pass reader to getDagSize ([60d97fb](https://www.github.com/web3-storage/web3.storage/commit/60d97fb096043ac3a60f4f343b81aab1e89a171e))
* show 'explore the docs' when token hasnt been used ([2a707aa](https://www.github.com/web3-storage/web3.storage/commit/2a707aa6502c4a8acd465c34018b33c4c47a7d81))
* token upload now only fetchs 1 ([620435c](https://www.github.com/web3-storage/web3.storage/commit/620435c16cbb3a044ba56f8718055670f7369a2c))

### [3.1.1](https://www.github.com/web3-storage/web3.storage/compare/api-v3.1.0...api-v3.1.1) (2021-07-29)


### Bug Fixes

* immutable headers on cached responses ([#205](https://www.github.com/web3-storage/web3.storage/issues/205)) ([604a43b](https://www.github.com/web3-storage/web3.storage/commit/604a43b1bbb575d3c461516f29f40737ec3800c9))

## [3.1.0](https://www.github.com/web3-storage/web3.storage/compare/api-v3.0.0...api-v3.1.0) (2021-07-28)


### Features

* list user uploads in client and `w3` ([#198](https://www.github.com/web3-storage/web3.storage/issues/198)) ([31caaa0](https://www.github.com/web3-storage/web3.storage/commit/31caaa0d6ef88a7467c6192a8b2d976f70087c62))

## [3.0.0](https://www.github.com/web3-storage/web3.storage/compare/api-v2.0.0...api-v3.0.0) (2021-07-28)


### ⚠ BREAKING CHANGES

* track user storage (#197)

### Features

* track user storage ([#197](https://www.github.com/web3-storage/web3.storage/issues/197)) ([ffdd27c](https://www.github.com/web3-storage/web3.storage/commit/ffdd27c68adc6c9328f83e626c2b5d96d2e06397))

## [2.0.0](https://www.github.com/web3-storage/web3.storage/compare/api-v1.0.1...api-v2.0.0) (2021-07-28)


### ⚠ BREAKING CHANGES

* make unixfs importer on ipfs-car use same defaults as lotus (#170)

### Features

* make unixfs importer on ipfs-car use same defaults as lotus ([#170](https://www.github.com/web3-storage/web3.storage/issues/170)) ([06f6948](https://www.github.com/web3-storage/web3.storage/commit/06f6948ce36b5e2a87f31b9bfac41e9465cb901b))


### Bug Fixes

* query cluster until we get a preferable pin status ([#192](https://www.github.com/web3-storage/web3.storage/issues/192)) ([0ee131a](https://www.github.com/web3-storage/web3.storage/commit/0ee131a3217f9972ee1f9a0204677157c03773f8))
* sentry source maps ([#204](https://www.github.com/web3-storage/web3.storage/issues/204)) ([6cf8571](https://www.github.com/web3-storage/web3.storage/commit/6cf8571c79505db4769a40bf42b36d484d315550))

### [1.0.1](https://www.github.com/web3-storage/web3.storage/compare/api-v1.0.0...api-v1.0.1) (2021-07-26)


### Bug Fixes

* files listing ([#155](https://www.github.com/web3-storage/web3.storage/issues/155)) ([bde495c](https://www.github.com/web3-storage/web3.storage/commit/bde495c334874c742d09f3224854324ebaa24e38))

## 1.0.0 (2021-07-23)


### ⚠ BREAKING CHANGES

* fold in content into user uploads list (#102)
* add upload type property (#123)

### Features

* add GET /car/:cid ([7ecabaa](https://www.github.com/web3-storage/web3.storage/commit/7ecabaa6a453597c6f3e14828578682370807ccd))
* add sentry ([#90](https://www.github.com/web3-storage/web3.storage/issues/90)) ([66c8b7c](https://www.github.com/web3-storage/web3.storage/commit/66c8b7cf5236c22fdc6779b19467684342a1fbd4))
* add timestamps to /status/:cid response ([#89](https://www.github.com/web3-storage/web3.storage/issues/89)) ([3526451](https://www.github.com/web3-storage/web3.storage/commit/3526451a8082627e32db096498f0f978f91be629))
* add upload type property ([#123](https://www.github.com/web3-storage/web3.storage/issues/123)) ([957ac21](https://www.github.com/web3-storage/web3.storage/commit/957ac217dd887d13db904e07b67d0417d852f54b)), closes [#115](https://www.github.com/web3-storage/web3.storage/issues/115)
* cors ([#3](https://www.github.com/web3-storage/web3.storage/issues/3)) ([42175db](https://www.github.com/web3-storage/web3.storage/commit/42175db4c27efe37df9a6da936f7b276c673efea))
* cron pin sync ([#71](https://www.github.com/web3-storage/web3.storage/issues/71)) ([d40980a](https://www.github.com/web3-storage/web3.storage/commit/d40980aa8c20c68d209f6c1d00f9dbf93d192895))
* db ([#10](https://www.github.com/web3-storage/web3.storage/issues/10)) ([dfeffd6](https://www.github.com/web3-storage/web3.storage/commit/dfeffd6f4d529fe5765ee0ea12d0a813f2e951af))
* delete user upload ([#48](https://www.github.com/web3-storage/web3.storage/issues/48)) ([885ddbf](https://www.github.com/web3-storage/web3.storage/commit/885ddbf7fda174c0ca64c415ff99ec87fc1e1c46))
* find uploads ([#35](https://www.github.com/web3-storage/web3.storage/issues/35)) ([151eaa4](https://www.github.com/web3-storage/web3.storage/commit/151eaa49c696b0757510b6e04501a8cf8595da3f))
* fold in content into user uploads list ([#102](https://www.github.com/web3-storage/web3.storage/issues/102)) ([344619e](https://www.github.com/web3-storage/web3.storage/commit/344619ed4ad4b52e26205f9ff42ca22a9f4b2227))
* GET /status/:cid to check pin & deal status ([#82](https://www.github.com/web3-storage/web3.storage/issues/82)) ([8cac0f9](https://www.github.com/web3-storage/web3.storage/commit/8cac0f947406bf9475cd512398fff1962e761d07))
* get metrics ([#70](https://www.github.com/web3-storage/web3.storage/issues/70)) ([f95f152](https://www.github.com/web3-storage/web3.storage/commit/f95f152ea27b2f2140654ad199e8bcd7b875033e))
* mock deals script ([#120](https://www.github.com/web3-storage/web3.storage/issues/120)) ([43cb87a](https://www.github.com/web3-storage/web3.storage/commit/43cb87aa9265223bb42d275dd98a69b80e6fb8b3))
* POST /upload ([#110](https://www.github.com/web3-storage/web3.storage/issues/110)) ([1e75fc9](https://www.github.com/web3-storage/web3.storage/commit/1e75fc95c85984c68b0cd2b90a1b4139ae7179cc))
* post car api ([#25](https://www.github.com/web3-storage/web3.storage/issues/25)) ([7dd1386](https://www.github.com/web3-storage/web3.storage/commit/7dd13864f6e457ab6ddd69e52ab7223c208b1f1f))
* storage broker API ([#51](https://www.github.com/web3-storage/web3.storage/issues/51)) ([0061339](https://www.github.com/web3-storage/web3.storage/commit/0061339c961f3c4e9ad138bf094bb8c4d4c7cfdf))
* style files page ([#106](https://www.github.com/web3-storage/web3.storage/issues/106)) ([ba55fbc](https://www.github.com/web3-storage/web3.storage/commit/ba55fbca30c619faf9de54c1de37e906d5c1d682))
* user token delete ([#30](https://www.github.com/web3-storage/web3.storage/issues/30)) ([41b7470](https://www.github.com/web3-storage/web3.storage/commit/41b7470ddfed050f46be3d7a3eb18f33db381e43))
* user tokens get ([#23](https://www.github.com/web3-storage/web3.storage/issues/23)) ([a58e525](https://www.github.com/web3-storage/web3.storage/commit/a58e5254bc6126fb8842d42215b5a07c217c4de2))


### Bug Fixes

* delete upload by cid ([#81](https://www.github.com/web3-storage/web3.storage/issues/81)) ([8faca9c](https://www.github.com/web3-storage/web3.storage/commit/8faca9cb886bf1a8c5ae26c63d5ab7cac60b5c47))
* Don't mutate immutable Headers object ([0816c39](https://www.github.com/web3-storage/web3.storage/commit/0816c39ec11fd744371d419f1268930e58d5214c))
* set cors headers on errors ([#85](https://www.github.com/web3-storage/web3.storage/issues/85)) ([b034fc5](https://www.github.com/web3-storage/web3.storage/commit/b034fc5ef62fa21b1602dc87d201652b2f6df070)), closes [#73](https://www.github.com/web3-storage/web3.storage/issues/73)
* split CAR uploads ([#42](https://www.github.com/web3-storage/web3.storage/issues/42)) ([80feba4](https://www.github.com/web3-storage/web3.storage/commit/80feba4be7702f79057074f3b8997fd754c5d348))
* switch dagSize type to Long ([#116](https://www.github.com/web3-storage/web3.storage/issues/116)) ([15f85eb](https://www.github.com/web3-storage/web3.storage/commit/15f85eb3bbf090ee4bfce5138eb7b963991956e5))
* tests ([#24](https://www.github.com/web3-storage/web3.storage/issues/24)) ([277cc44](https://www.github.com/web3-storage/web3.storage/commit/277cc449efe8366a978cce6b573f24a50f5dc65d))
