# Changelog

## [1.7.1](https://github.com/web3-storage/web3.storage/compare/cron-v1.7.0...cron-v1.7.1) (2023-03-17)


### Bug Fixes

* only recheck pin status if pinning or queued ([#2236](https://github.com/web3-storage/web3.storage/issues/2236)) ([949f866](https://github.com/web3-storage/web3.storage/commit/949f866b1845cc3a407d91bd8c09d21fbe0b13bb))

## [1.7.0](https://github.com/web3-storage/web3.storage/compare/cron-v1.6.1...cron-v1.7.0) (2023-01-03)


### Features

* increase timeout for pins cron ([#2174](https://github.com/web3-storage/web3.storage/issues/2174)) ([43a8708](https://github.com/web3-storage/web3.storage/commit/43a8708cd39e55c5875f7bf5fc6896edb41026e2))
* put write to cluster behind a flag ([#1785](https://github.com/web3-storage/web3.storage/issues/1785)) ([eae75d2](https://github.com/web3-storage/web3.storage/commit/eae75d2366d59b0cf16143723a5af6513d891f9e))
* split pins cron by environments ([#1903](https://github.com/web3-storage/web3.storage/issues/1903)) ([2c81055](https://github.com/web3-storage/web3.storage/commit/2c81055c6f0f9dfb3b9aa908e34db700d6f41b45))

## [1.6.1](https://github.com/web3-storage/web3.storage/compare/cron-v1.6.0...cron-v1.6.1) (2022-09-16)


### Bug Fixes

* cron not counting pin statuses ([#1899](https://github.com/web3-storage/web3.storage/issues/1899)) ([2be52cd](https://github.com/web3-storage/web3.storage/commit/2be52cdd216805596540383df08e6122d7eb6e75))

## [1.6.0](https://github.com/web3-storage/web3.storage/compare/cron-v1.5.7...cron-v1.6.0) (2022-08-31)


### Features

* drop name table & IPNS migration cron ([#1719](https://github.com/web3-storage/web3.storage/issues/1719)) ([0cdfad9](https://github.com/web3-storage/web3.storage/commit/0cdfad9f6baf4a1a356b8c6c8291e4bceb45aa17))


### Bug Fixes

* add retry to fetch during IPNS record migration ([#1759](https://github.com/web3-storage/web3.storage/issues/1759)) ([b7b9802](https://github.com/web3-storage/web3.storage/commit/b7b98024c3cc9fe95b29d475927341625651601b))
* only log user IDs, not names or email addresses ([#1584](https://github.com/web3-storage/web3.storage/issues/1584)) ([d7d7f75](https://github.com/web3-storage/web3.storage/commit/d7d7f757d36bfcb6df777e357ab70245a2321a3b))
* upload list pagination headers ([#1739](https://github.com/web3-storage/web3.storage/issues/1739)) ([2ffe6d7](https://github.com/web3-storage/web3.storage/commit/2ffe6d749628095a93d957836c6b4e8ad3b6acf9))

## [1.5.7](https://github.com/web3-storage/web3.storage/compare/cron-v1.5.6...cron-v1.5.7) (2022-08-16)


### Bug Fixes

* correct w3name staging and prod urls in cron job. ([#1752](https://github.com/web3-storage/web3.storage/issues/1752)) ([7f52962](https://github.com/web3-storage/web3.storage/commit/7f5296234db5fe516cd4474c056a1e835447ca33))

## [1.5.6](https://github.com/web3-storage/web3.storage/compare/cron-v1.5.5...cron-v1.5.6) (2022-08-04)


### Bug Fixes

* throttled names cron job requests ([#1708](https://github.com/web3-storage/web3.storage/issues/1708)) ([7df9ad9](https://github.com/web3-storage/web3.storage/commit/7df9ad9b1ae88cdeead219e0dadb3152fd1cda83))

## [1.5.5](https://github.com/web3-storage/web3.storage/compare/cron-v1.5.4...cron-v1.5.5) (2022-08-03)


### Bug Fixes

* add ipns migration cron job ([#1705](https://github.com/web3-storage/web3.storage/issues/1705)) ([4b6e67f](https://github.com/web3-storage/web3.storage/commit/4b6e67f07983b06e9bad9c27deb5d6c5b993258e))

## [1.5.4](https://github.com/web3-storage/web3.storage/compare/cron-v1.5.3...cron-v1.5.4) (2022-07-26)


### Bug Fixes

* cron remote status ([#1675](https://github.com/web3-storage/web3.storage/issues/1675)) ([02fc600](https://github.com/web3-storage/web3.storage/commit/02fc600ef5afb2fc6344c98ef29c01010cee76bb))

## [1.5.3](https://github.com/web3-storage/web3.storage/compare/cron-v1.5.2...cron-v1.5.3) (2022-07-20)


### Bug Fixes

* cron should await on delete remote pins ([f258108](https://github.com/web3-storage/web3.storage/commit/f258108c42677a90a9ca10229184aa57103f2256))

## [1.5.2](https://github.com/web3-storage/web3.storage/compare/cron-v1.5.1...cron-v1.5.2) (2022-07-20)


### Bug Fixes

* cron pins skips remote status ([#1660](https://github.com/web3-storage/web3.storage/issues/1660)) ([0cb4ff3](https://github.com/web3-storage/web3.storage/commit/0cb4ff3ec068ac490086a7b1264765e278a9ca29))

## [1.5.1](https://github.com/web3-storage/web3.storage/compare/cron-v1.5.0...cron-v1.5.1) (2022-07-19)


### Bug Fixes

* cron pins delete ([#1653](https://github.com/web3-storage/web3.storage/issues/1653)) ([7d14907](https://github.com/web3-storage/web3.storage/commit/7d1490746fc9d719dd2fb0c2a080a03368d223be))

## [1.5.0](https://github.com/web3-storage/web3.storage/compare/cron-v1.4.0...cron-v1.5.0) (2022-07-18)


### Features

* admin limit notification email improv ([#1641](https://github.com/web3-storage/web3.storage/issues/1641)) ([0669734](https://github.com/web3-storage/web3.storage/commit/06697341166616fee906c5d81320e94ee7524fda))
* update pin remote type ([#1619](https://github.com/web3-storage/web3.storage/issues/1619)) ([939edd1](https://github.com/web3-storage/web3.storage/commit/939edd15f0a6cb1db511b2b5b78ccd216142cb05))

## [1.4.0](https://github.com/web3-storage/web3.storage/compare/cron-v1.3.1...cron-v1.4.0) (2022-07-12)


### Features

* dag size job improvements ([#1634](https://github.com/web3-storage/web3.storage/issues/1634)) ([b6b3de8](https://github.com/web3-storage/web3.storage/commit/b6b3de81be175d09e2488d7c3f7d6c4ad13b2c37))

## [1.3.1](https://github.com/web3-storage/web3.storage/compare/cron-v1.3.0...cron-v1.3.1) (2022-07-07)


### Bug Fixes

* cron drop remote pins needs await ([#1625](https://github.com/web3-storage/web3.storage/issues/1625)) ([7d6f15b](https://github.com/web3-storage/web3.storage/commit/7d6f15b562cf89a14ce18732a6e068db1bdb6684))

## [1.3.0](https://github.com/web3-storage/web3.storage/compare/cron-v1.2.3...cron-v1.3.0) (2022-07-07)


### Features

* stop tracking remote pins and remote them from db ([#1615](https://github.com/web3-storage/web3.storage/issues/1615)) ([faa9d6a](https://github.com/web3-storage/web3.storage/commit/faa9d6a546a095a24e9a36ab48bedc77ad7d4787))

## [1.2.3](https://github.com/web3-storage/web3.storage/compare/cron-v1.2.2...cron-v1.2.3) (2022-07-06)


### Bug Fixes

* update content dag_size only if it has changed ([#1611](https://github.com/web3-storage/web3.storage/issues/1611)) ([0b99566](https://github.com/web3-storage/web3.storage/commit/0b99566acc6c34bba675891ccebe3607296a37e2))

## [1.2.2](https://github.com/web3-storage/web3.storage/compare/cron-v1.2.1...cron-v1.2.2) (2022-06-29)


### Bug Fixes

* make sure null claimed sizes are updated ([#1594](https://github.com/web3-storage/web3.storage/issues/1594)) ([3f585f3](https://github.com/web3-storage/web3.storage/commit/3f585f36b6c1b661aeef22919c519dfde0b99d1c))

## [1.2.1](https://github.com/web3-storage/web3.storage/compare/cron-v1.2.0...cron-v1.2.1) (2022-06-29)


### Bug Fixes

* don't allow individual email sending failures to halt cron job ([#1589](https://github.com/web3-storage/web3.storage/issues/1589)) ([2d7a4e0](https://github.com/web3-storage/web3.storage/commit/2d7a4e0028a8275a60089ce243297020c249dcd9))
* pg connection string append ssl-true ([#1576](https://github.com/web3-storage/web3.storage/issues/1576)) ([1d10181](https://github.com/web3-storage/web3.storage/commit/1d101812cbb8db2099dc2fb03447bf2f94f72f40))

## [1.2.0](https://github.com/web3-storage/web3.storage/compare/cron-v1.1.5...cron-v1.2.0) (2022-06-27)


### Features

* use direct connection to cargo to get claimed size ([#1535](https://github.com/web3-storage/web3.storage/issues/1535)) ([e4087a9](https://github.com/web3-storage/web3.storage/commit/e4087a9f4d4202d672938d339e121c19344866b4))


### Bug Fixes

* build-cargo-connection-string ([#1564](https://github.com/web3-storage/web3.storage/issues/1564)) ([0663ee2](https://github.com/web3-storage/web3.storage/commit/0663ee28fe97e8bb6d4c10bcd3a18bc0a2e9a839))
* use github.event.inputs instead ([#1563](https://github.com/web3-storage/web3.storage/issues/1563)) ([044cff8](https://github.com/web3-storage/web3.storage/commit/044cff85c6876c5cf493d3ec98bb84a3c6d5a856))

## [1.1.5](https://github.com/web3-storage/web3.storage/compare/cron-v1.1.4...cron-v1.1.5) (2022-06-20)


### Bug Fixes

* use dummy provider in staging ([#1523](https://github.com/web3-storage/web3.storage/issues/1523)) ([c566d16](https://github.com/web3-storage/web3.storage/commit/c566d16e5c435e1dd85d931baac7ded3140912da))

## [1.1.4](https://github.com/web3-storage/web3.storage/compare/cron-v1.1.3...cron-v1.1.4) (2022-06-20)


### Bug Fixes

* add logging to storage cron ([#1502](https://github.com/web3-storage/web3.storage/issues/1502)) ([a9b8d57](https://github.com/web3-storage/web3.storage/commit/a9b8d577e31eee69131d687627d1a612e61115d4))
* fix storage logging ([#1510](https://github.com/web3-storage/web3.storage/issues/1510)) ([13fe24b](https://github.com/web3-storage/web3.storage/commit/13fe24bb478fb4431c3414812a0a65665df81951))
* reduce loops on users and improve testing ([#1503](https://github.com/web3-storage/web3.storage/issues/1503)) ([f214121](https://github.com/web3-storage/web3.storage/commit/f2141213cedf57d8dc89c1dede86eb60b7c7c390))

## [1.1.3](https://github.com/web3-storage/web3.storage/compare/cron-v1.1.2...cron-v1.1.3) (2022-06-15)


### Bug Fixes

* close connection at the end of cron ([#1488](https://github.com/web3-storage/web3.storage/issues/1488)) ([ea14612](https://github.com/web3-storage/web3.storage/commit/ea14612b510d56d13cdef2ee7f3417a6bcf9877d))

## [1.1.2](https://github.com/web3-storage/web3.storage/compare/cron-v1.1.1...cron-v1.1.2) (2022-06-15)


### Bug Fixes

* change batching strategy for user storage cron ([#1419](https://github.com/web3-storage/web3.storage/issues/1419)) ([ac10cb0](https://github.com/web3-storage/web3.storage/commit/ac10cb05011747fbd76f33bc0d79252f3924ce06))
* make the default batch size for storage limit cron smaller ([#1485](https://github.com/web3-storage/web3.storage/issues/1485)) ([4df878f](https://github.com/web3-storage/web3.storage/commit/4df878f0707f102ac8609abf685fdbef249b8ad6))
* update getPg to automatically connect to the db ([#1465](https://github.com/web3-storage/web3.storage/issues/1465)) ([2ad46a0](https://github.com/web3-storage/web3.storage/commit/2ad46a0bd6a27048b9a9f62a2a068fafe2417759))
* use NODE_TLS_REJECT_UNAUTHORIZED=0 env var for storage cron job ([#1418](https://github.com/web3-storage/web3.storage/issues/1418)) ([179ef95](https://github.com/web3-storage/web3.storage/commit/179ef950376dcf86bfdd1301955ab3e6bccf1d3d))

## [1.1.1](https://github.com/web3-storage/web3.storage/compare/cron-v1.1.0...cron-v1.1.1) (2022-06-08)


### Bug Fixes

* optimise getUserByStorage query to avoid timeouts ([#1412](https://github.com/web3-storage/web3.storage/issues/1412)) ([8291115](https://github.com/web3-storage/web3.storage/commit/829111591445b519b86fb46bb28d27b2f940890c))
* update incorrect dag sizes job ([#1059](https://github.com/web3-storage/web3.storage/issues/1059)) ([#1196](https://github.com/web3-storage/web3.storage/issues/1196)) ([dd9ce3b](https://github.com/web3-storage/web3.storage/commit/dd9ce3b89ccfb0b8b5a663e1673937c992720617))

## [1.1.0](https://github.com/web3-storage/web3.storage/compare/cron-v1.0.0...cron-v1.1.0) (2022-05-27)


### Features

* send email notifications for storage quota usage ([#1273](https://github.com/web3-storage/web3.storage/issues/1273)) ([0b1eb09](https://github.com/web3-storage/web3.storage/commit/0b1eb09b32dfb6cb1b3a5a8b5034dc4ac54ba3e2))

## 1.0.0 (2022-05-16)


### ⚠ BREAKING CHANGES

* add continuous deployment to cron package (#1281)

### Features

* add continuous deployment to cron package ([#1281](https://github.com/web3-storage/web3.storage/issues/1281)) ([eb79d62](https://github.com/web3-storage/web3.storage/commit/eb79d62b221a8971ad2e1f90c963c6f1e3c986ae))
* add count cids ([#583](https://github.com/web3-storage/web3.storage/issues/583)) ([690b3b3](https://github.com/web3-storage/web3.storage/commit/690b3b35a7e4915128a9a24fdcb457514dc7719b))
* cron and pinpin rewire ([#531](https://github.com/web3-storage/web3.storage/issues/531)) ([9e5b42d](https://github.com/web3-storage/web3.storage/commit/9e5b42dc6d33bf3cf017034474981812370b366e))
* cron metrics ([#305](https://github.com/web3-storage/web3.storage/issues/305)) ([f064afb](https://github.com/web3-storage/web3.storage/commit/f064afb83776e14d6a66f1bde5884a9d57013794))
* cron to update status for PinError pins ([#358](https://github.com/web3-storage/web3.storage/issues/358)) ([1f2fad7](https://github.com/web3-storage/web3.storage/commit/1f2fad7380cba7cc9520a5824aef76a8d2bf6696))


### Bug Fixes

* add pin sync queue collection ([#369](https://github.com/web3-storage/web3.storage/issues/369)) ([9813a1d](https://github.com/web3-storage/web3.storage/commit/9813a1d8cf4b96a7aa44ddbfd25502699c6601f5))
* check if unpinned then downgrade to v0 ([#919](https://github.com/web3-storage/web3.storage/issues/919)) ([f1e9da5](https://github.com/web3-storage/web3.storage/commit/f1e9da5da5883671415091e6168a7ac95778dfef))
* consider pins within the last month ([214f288](https://github.com/web3-storage/web3.storage/commit/214f288d499b362b67e5a2eeb652e583290da620))
* cron metrics data prop ([#584](https://github.com/web3-storage/web3.storage/issues/584)) ([63fe8bc](https://github.com/web3-storage/web3.storage/commit/63fe8bce795a55b6f054a3e8c101861a0e0c039b))
* dag size cron use ro for read ([#1087](https://github.com/web3-storage/web3.storage/issues/1087)) ([22f4170](https://github.com/web3-storage/web3.storage/commit/22f417091acf88e891449a06f02cfcba118726d8))
* dag size for big dags with non pb root ([#850](https://github.com/web3-storage/web3.storage/issues/850)) ([b60fa1c](https://github.com/web3-storage/web3.storage/commit/b60fa1c3dbd839e3669578aa539cc5815b470d05))
* delete fauna history when deleting PinRequest ([191ad1a](https://github.com/web3-storage/web3.storage/commit/191ad1a78a3f02f4633d8783206251754dec272d))
* incremental metrics ([#349](https://github.com/web3-storage/web3.storage/issues/349)) ([8347c20](https://github.com/web3-storage/web3.storage/commit/8347c20ed4a34c983d4d815b41c06fb849fff279))
* log on failed attempt ([d43c4cc](https://github.com/web3-storage/web3.storage/commit/d43c4ccc011c72e24ef89f0352d840451f6c57e8))
* max pin requests per run in cron and pinpin ([#623](https://github.com/web3-storage/web3.storage/issues/623)) ([edc7c24](https://github.com/web3-storage/web3.storage/commit/edc7c24fee72e1e167e205de34edfc630ea6aeb4))
* metrics computed async ([#1085](https://github.com/web3-storage/web3.storage/issues/1085)) ([99b52e5](https://github.com/web3-storage/web3.storage/commit/99b52e51689923426a857dc8693176dcbbceda7b))
* pin status syncing ([#1083](https://github.com/web3-storage/web3.storage/issues/1083)) ([b7e0e7c](https://github.com/web3-storage/web3.storage/commit/b7e0e7c12b30f3c1136baa90907350f01d3cde22))
* pin sync req id text ([#622](https://github.com/web3-storage/web3.storage/issues/622)) ([dee0a4e](https://github.com/web3-storage/web3.storage/commit/dee0a4ea2c92f435b4669825894341faf317f658))
* pins sync job ([26bdb43](https://github.com/web3-storage/web3.storage/commit/26bdb431ea72b0eac1149907e276e4f345a43516))
* query name ([c315078](https://github.com/web3-storage/web3.storage/commit/c315078fd7424033972334c281eddf123dc4f620))
* reduce MAX_PIN_REQUESTS_PER_RUN to fit in max URL length ([1b0a361](https://github.com/web3-storage/web3.storage/commit/1b0a361e56e8efe015c76fe57a7d16c19ab00a7e))
* reduce number of pins per page ([03bf8d1](https://github.com/web3-storage/web3.storage/commit/03bf8d1687fe7b51c878ca92ca0361e4999b4883))
* remove dagcargo materialized views ([#735](https://github.com/web3-storage/web3.storage/issues/735)) ([62db538](https://github.com/web3-storage/web3.storage/commit/62db5383f39e7d3e3484ccb51bd4eb3de816bcfd))
* remove unused pinata import ([8e4e2a1](https://github.com/web3-storage/web3.storage/commit/8e4e2a1ebb7ba9a0c538584b672e0a3a75e26621))
* retry DB requests ([f27896e](https://github.com/web3-storage/web3.storage/commit/f27896e7f79470dcc18c10024c9c1cf873d22f21))
* set stream-channels=false for cluster add ([#342](https://github.com/web3-storage/web3.storage/issues/342)) ([31f30b2](https://github.com/web3-storage/web3.storage/commit/31f30b293071cb6915a04117d004c2a0f7e2fccf))
* smaller page size, shorter check period ([3a57a8e](https://github.com/web3-storage/web3.storage/commit/3a57a8e33dc16713f560dea35120bee66399512e))
* store IPFS peer IDs ([#1093](https://github.com/web3-storage/web3.storage/issues/1093)) ([1f2dcda](https://github.com/web3-storage/web3.storage/commit/1f2dcdaf4fb49419967aae7f988e05e67c05506f))
* use ipfs peerId as pin location ([#966](https://github.com/web3-storage/web3.storage/issues/966)) ([5ae212d](https://github.com/web3-storage/web3.storage/commit/5ae212da21692da2fe9d08a53463b15875ec0cd7))
* use rpc for pins upsert ([#1088](https://github.com/web3-storage/web3.storage/issues/1088)) ([6a8e394](https://github.com/web3-storage/web3.storage/commit/6a8e394af8a63315db91bed82c17e77c13fb9fc2))
* use upsertpins ([#938](https://github.com/web3-storage/web3.storage/issues/938)) ([d593a19](https://github.com/web3-storage/web3.storage/commit/d593a19a1c595b201ab27d62db23d2b6c4dc1bf2))


### Performance Improvements

* double the number of pins to retrieve per page ([395966a](https://github.com/web3-storage/web3.storage/commit/395966a718fef57c354a8762cd24ebc3b53f5b20))
* faster pin status sync ([#338](https://github.com/web3-storage/web3.storage/issues/338)) ([2861e33](https://github.com/web3-storage/web3.storage/commit/2861e3346cdff780b6eec6e50f0b365c7dd7f35e))
* improve pins cron ([#1097](https://github.com/web3-storage/web3.storage/issues/1097)) ([051f12d](https://github.com/web3-storage/web3.storage/commit/051f12d98f98a58646057344b3b80096dc60bbee))
* parallel DAG size calculations ([2f80af9](https://github.com/web3-storage/web3.storage/commit/2f80af980ee6a75aa7dbc6ca92be05bb143bd419))
