# Changelog

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
