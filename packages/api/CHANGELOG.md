# Changelog

## [4.1.0](https://www.github.com/web3-storage/web3.storage/compare/api-v4.0.5...api-v4.1.0) (2021-11-25)


### Features

* simple mutability API using IPNS ([#648](https://www.github.com/web3-storage/web3.storage/issues/648)) ([9c287bb](https://www.github.com/web3-storage/web3.storage/commit/9c287bb7c983d3adab6ebb304decb47c5093ad78))

### [4.0.5](https://www.github.com/web3-storage/web3.storage/compare/api-v4.0.4...api-v4.0.5) (2021-11-25)


### Bug Fixes

* use constants for import settings values ([#696](https://www.github.com/web3-storage/web3.storage/issues/696)) ([f40db9e](https://www.github.com/web3-storage/web3.storage/commit/f40db9e5cfd2b78038e7fd35c7754f592764c66f))

### [4.0.4](https://www.github.com/web3-storage/web3.storage/compare/api-v4.0.3...api-v4.0.4) (2021-11-25)


### Bug Fixes

* deal status filtering ([#692](https://www.github.com/web3-storage/web3.storage/issues/692)) ([a7b4151](https://www.github.com/web3-storage/web3.storage/commit/a7b4151b05fa55646d337a090263a1eeb77b8169))

### [4.0.3](https://www.github.com/web3-storage/web3.storage/compare/api-v4.0.2...api-v4.0.3) (2021-11-23)


### Bug Fixes

* deal normalize should filter out unexpected deal status ([#682](https://www.github.com/web3-storage/web3.storage/issues/682)) ([0e233cc](https://www.github.com/web3-storage/web3.storage/commit/0e233cc5af499a032cf83e3454eefbfb7ef2b0a0))
* pin normalize should filter out unexpected pin status ([#677](https://www.github.com/web3-storage/web3.storage/issues/677)) ([f8c78b4](https://www.github.com/web3-storage/web3.storage/commit/f8c78b4ff3377c19a9bc101a7c8c97757cc511ae))
* script startup timeout ([#679](https://www.github.com/web3-storage/web3.storage/issues/679)) ([fb76d07](https://www.github.com/web3-storage/web3.storage/commit/fb76d0740c9d0d42805801a4b445ecb9c1f3777e))

### [4.0.2](https://www.github.com/web3-storage/web3.storage/compare/api-v4.0.1...api-v4.0.2) (2021-11-17)


### Bug Fixes

* support upload list page size up to 1000 ([#645](https://www.github.com/web3-storage/web3.storage/issues/645)) ([04a5de6](https://www.github.com/web3-storage/web3.storage/commit/04a5de6080835da17398e0fde84584a817781346))

### [4.0.1](https://www.github.com/web3-storage/web3.storage/compare/api-v4.0.0...api-v4.0.1) (2021-11-17)


### Changes

* use new db version ([c1f8834](https://www.github.com/web3-storage/web3.storage/commit/c1f8834d1ffc47dc72694d342bad719b483b4121))

## [4.0.0](https://www.github.com/web3-storage/web3.storage/compare/api-v3.7.4...api-v4.0.0) (2021-11-17)


### ⚠ BREAKING CHANGES

* remove faunadb (#610)

### Bug Fixes

* metrics for pin status response ([eb9f9ca](https://www.github.com/web3-storage/web3.storage/commit/eb9f9cac67aaa7b4d23d91a034ebddb0dcf8b92b))
* remove faunadb ([#610](https://www.github.com/web3-storage/web3.storage/issues/610)) ([631e23f](https://www.github.com/web3-storage/web3.storage/commit/631e23f304ae3bef7d022041a39f72bc9438f469))

### [3.7.4](https://www.github.com/web3-storage/web3.storage/compare/api-v3.7.3...api-v3.7.4) (2021-11-15)


### Bug Fixes

* pin status metrics returns data object ([#628](https://www.github.com/web3-storage/web3.storage/issues/628)) ([20877ae](https://www.github.com/web3-storage/web3.storage/commit/20877aeed7730a81d08435be6bee1dfe6d9afebe))

### [3.7.3](https://www.github.com/web3-storage/web3.storage/compare/api-v3.7.2...api-v3.7.3) (2021-11-15)


### Bug Fixes

* performance metrics queries ([#625](https://www.github.com/web3-storage/web3.storage/issues/625)) ([85efba5](https://www.github.com/web3-storage/web3.storage/commit/85efba5c2ba0b65def2a93e2b811268e9ab96b00))

### [3.7.2](https://www.github.com/web3-storage/web3.storage/compare/api-v3.7.1...api-v3.7.2) (2021-11-15)


### Bug Fixes

* remove backdoor routes ([#617](https://www.github.com/web3-storage/web3.storage/issues/617)) ([11f394c](https://www.github.com/web3-storage/web3.storage/commit/11f394c8d664d59ab5772138d58e0c660193fb35))

### [3.7.1](https://www.github.com/web3-storage/web3.storage/compare/api-v3.7.0...api-v3.7.1) (2021-11-15)


### Bug Fixes

* create key mock ([#608](https://www.github.com/web3-storage/web3.storage/issues/608)) ([81f0fd3](https://www.github.com/web3-storage/web3.storage/commit/81f0fd30afb8980ff6d579e3ada77b67840ed9e3))


### Changes

* add worker env setup for paolo ([#582](https://www.github.com/web3-storage/web3.storage/issues/582)) ([0b7e508](https://www.github.com/web3-storage/web3.storage/commit/0b7e5084e75843d3ca1dacc79e5ef1ffc69f6a7d))

## [3.7.0](https://www.github.com/web3-storage/web3.storage/compare/api-v3.6.0...api-v3.7.0) (2021-11-10)


### Features

* add user email to account page ([#566](https://www.github.com/web3-storage/web3.storage/issues/566)) ([a34d976](https://www.github.com/web3-storage/web3.storage/commit/a34d97623eaa2153c9bf068c3a099f3c463af1a3))
* temporary api backdoor ([#599](https://www.github.com/web3-storage/web3.storage/issues/599)) ([03fbc46](https://www.github.com/web3-storage/web3.storage/commit/03fbc463a2fa18073bfcc5e7131833c602b28e79))

## [3.6.0](https://www.github.com/web3-storage/web3.storage/compare/api-v3.5.2...api-v3.6.0) (2021-10-28)


### Features

* maintenance mode ([#538](https://www.github.com/web3-storage/web3.storage/issues/538)) ([b206a66](https://www.github.com/web3-storage/web3.storage/commit/b206a66d5404246af9d5c25f0d5b4b0ad415610e))
* postgres setup ([#508](https://www.github.com/web3-storage/web3.storage/issues/508)) ([cd04716](https://www.github.com/web3-storage/web3.storage/commit/cd04716844a646d986f53aeae7c73840a008aad3))


### Bug Fixes

* add mocha dev dependency to api and db ([0648527](https://www.github.com/web3-storage/web3.storage/commit/064852797e0cf56faacbfdcbf9a142973e25c663))
* api dev mode without backup secrets ([#526](https://www.github.com/web3-storage/web3.storage/issues/526)) ([4d3f1b1](https://www.github.com/web3-storage/web3.storage/commit/4d3f1b17821f4f2b7bac8bbb7078f3fea85a67d7))
* api webpack build compatible with both dbs and swappable on runtime ([#559](https://www.github.com/web3-storage/web3.storage/issues/559)) ([9000b2d](https://www.github.com/web3-storage/web3.storage/commit/9000b2d4d54f34301f82ca1ffc7983cc299c5c7e))
* database env var ([#568](https://www.github.com/web3-storage/web3.storage/issues/568)) ([47ac553](https://www.github.com/web3-storage/web3.storage/commit/47ac5538e2e90908b9873227cc548e7a21d9b45e))
* db client improvements ([#546](https://www.github.com/web3-storage/web3.storage/issues/546)) ([5deffae](https://www.github.com/web3-storage/web3.storage/commit/5deffae2ec3e6c81d90d7db10285fd051c5c1c7d))
* encode filenames ([#539](https://www.github.com/web3-storage/web3.storage/issues/539)) ([de01972](https://www.github.com/web3-storage/web3.storage/commit/de0197278c041a5bd0c2979e38f79bad068bf993))
* fauna webpack config ([#550](https://www.github.com/web3-storage/web3.storage/issues/550)) ([d1cfc71](https://www.github.com/web3-storage/web3.storage/commit/d1cfc71cc6df91b58b59d0abd1d60a4518770221))


### Changes

* api rewire ([#524](https://www.github.com/web3-storage/web3.storage/issues/524)) ([f4f9cd3](https://www.github.com/web3-storage/web3.storage/commit/f4f9cd39f0859b843067057af9bcdbf4f29063e9))

### [3.5.2](https://www.github.com/web3-storage/web3.storage/compare/api-v3.5.1...api-v3.5.2) (2021-09-30)


### Bug Fixes

* source mapping and commit info in sentry ([#505](https://www.github.com/web3-storage/web3.storage/issues/505)) ([5f058a8](https://www.github.com/web3-storage/web3.storage/commit/5f058a81f1b9acd083a9240399f74c1a1bb60adb))


### Changes

* dont send source-map to cloudflare ([#506](https://www.github.com/web3-storage/web3.storage/issues/506)) ([f67e3d6](https://www.github.com/web3-storage/web3.storage/commit/f67e3d666d7ef1b5c5f4ff8f5eb6878866f6bdea))

### [3.5.1](https://www.github.com/web3-storage/web3.storage/compare/api-v3.5.0...api-v3.5.1) (2021-09-28)


### Bug Fixes

* increment used storage ([#501](https://www.github.com/web3-storage/web3.storage/issues/501)) ([1becd09](https://www.github.com/web3-storage/web3.storage/commit/1becd09bbdaabc503c180cc38c37f7f03852fe62))

## [3.5.0](https://www.github.com/web3-storage/web3.storage/compare/api-v3.4.0...api-v3.5.0) (2021-09-27)


### Features

* add a new step to the getting started ([#391](https://www.github.com/web3-storage/web3.storage/issues/391)) ([03844f4](https://www.github.com/web3-storage/web3.storage/commit/03844f456a3faafc755d3342ae6a2fc67822b1e2))
* storage backup ([#417](https://www.github.com/web3-storage/web3.storage/issues/417)) ([ae5423a](https://www.github.com/web3-storage/web3.storage/commit/ae5423aebc779545126fb6ba652637317efc91e7))


### Changes

* bring upload car settings inline with client ([81456c2](https://www.github.com/web3-storage/web3.storage/commit/81456c2cad203a505f83968c11fd44ab4e79548d))
* unify /upload and /car uploads ([#480](https://www.github.com/web3-storage/web3.storage/issues/480)) ([b62c8b9](https://www.github.com/web3-storage/web3.storage/commit/b62c8b930686f77e455862428699a2870fdd3eb7))

## [3.4.0](https://www.github.com/web3-storage/web3.storage/compare/api-v3.3.2...api-v3.4.0) (2021-09-06)


### Features

* allow uploads to be renamed ([2cd9483](https://www.github.com/web3-storage/web3.storage/commit/2cd9483734df5e558a79f58701002f2c50c94269))
* api supports upload list sorting ([#373](https://www.github.com/web3-storage/web3.storage/issues/373)) ([7b0ec3b](https://www.github.com/web3-storage/web3.storage/commit/7b0ec3beea3aa9b596a794441267d7b8bfcbb7b6))


### Bug Fixes

* sort direction in api ([d0551ec](https://www.github.com/web3-storage/web3.storage/commit/d0551ecda381e2ff5e5ff84b013a4975a27f989b))
* update dependencies ([#404](https://www.github.com/web3-storage/web3.storage/issues/404)) ([dd11034](https://www.github.com/web3-storage/web3.storage/commit/dd110344c6475e0e074bfaec6cf32d16643e1bdb))

### [3.3.2](https://www.github.com/web3-storage/web3.storage/compare/api-v3.3.1...api-v3.3.2) (2021-08-12)


### Bug Fixes

* disallow CAR of single block with links ([#344](https://www.github.com/web3-storage/web3.storage/issues/344)) ([e7436da](https://www.github.com/web3-storage/web3.storage/commit/e7436da00d0b8b43f55fce1fb6e6fc2b58a0f04e))

### [3.3.1](https://www.github.com/web3-storage/web3.storage/compare/api-v3.3.0...api-v3.3.1) (2021-08-11)


### Bug Fixes

* set stream-channels=false for cluster add ([#342](https://www.github.com/web3-storage/web3.storage/issues/342)) ([31f30b2](https://www.github.com/web3-storage/web3.storage/commit/31f30b293071cb6915a04117d004c2a0f7e2fccf))
* update api docs ([#332](https://www.github.com/web3-storage/web3.storage/issues/332)) ([7d2f754](https://www.github.com/web3-storage/web3.storage/commit/7d2f75432e3abad7b462da848d2848354e87f76f))

## [3.3.0](https://www.github.com/web3-storage/web3.storage/compare/api-v3.2.5...api-v3.3.0) (2021-08-05)


### Features

* use db metrics ([#306](https://www.github.com/web3-storage/web3.storage/issues/306)) ([0156e9e](https://www.github.com/web3-storage/web3.storage/commit/0156e9e5705914beb58f2c3ac69415b4643efe64)), closes [#93](https://www.github.com/web3-storage/web3.storage/issues/93)

### [3.2.5](https://www.github.com/web3-storage/web3.storage/compare/api-v3.2.4...api-v3.2.5) (2021-08-04)


### Bug Fixes

* retry createUpload DB transaction ([#297](https://www.github.com/web3-storage/web3.storage/issues/297)) ([606eefc](https://www.github.com/web3-storage/web3.storage/commit/606eefc478b9acba9e22904109aaef0a419e380f))

### [3.2.4](https://www.github.com/web3-storage/web3.storage/compare/api-v3.2.3...api-v3.2.4) (2021-08-04)


### Bug Fixes

* use page sizes that do not result in width errors ([88818b7](https://www.github.com/web3-storage/web3.storage/commit/88818b7162055eceec506942653370c3e1860fec))

### [3.2.3](https://www.github.com/web3-storage/web3.storage/compare/api-v3.2.2...api-v3.2.3) (2021-08-03)


### Bug Fixes

* dag size UDFs ([6841775](https://www.github.com/web3-storage/web3.storage/commit/68417757553b5afc56e09f21db2b44cf49150954))
* metrics ([#285](https://www.github.com/web3-storage/web3.storage/issues/285)) ([b4c1bb2](https://www.github.com/web3-storage/web3.storage/commit/b4c1bb2f60788324c3a14440236047e97bcec460))

### [3.2.2](https://www.github.com/web3-storage/web3.storage/compare/api-v3.2.1...api-v3.2.2) (2021-08-03)


### Bug Fixes

* check for empty CAR ([#281](https://www.github.com/web3-storage/web3.storage/issues/281)) ([ea2a34b](https://www.github.com/web3-storage/web3.storage/commit/ea2a34b3d9b6959fa53fbff3cb80100298028244))
* increment user used storage in waitUntil ([#280](https://www.github.com/web3-storage/web3.storage/issues/280)) ([aa32153](https://www.github.com/web3-storage/web3.storage/commit/aa321534b0fba899488587c8df3ab5378dad30e2))

### [3.2.1](https://www.github.com/web3-storage/web3.storage/compare/api-v3.2.0...api-v3.2.1) (2021-08-02)


### Bug Fixes

* force webpack to load ESM config ([#247](https://www.github.com/web3-storage/web3.storage/issues/247)) ([055ed61](https://www.github.com/web3-storage/web3.storage/commit/055ed6109ecedbf335ebe01f03a89a7b9362c147))
* move pin ok status polling into waitUntil ([#267](https://www.github.com/web3-storage/web3.storage/issues/267)) ([97634ea](https://www.github.com/web3-storage/web3.storage/commit/97634eaeec13f33111f8728a1ba96a22c58d846d))

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
