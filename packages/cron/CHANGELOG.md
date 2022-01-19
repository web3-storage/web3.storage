# Changelog

## 1.0.0 (2022-01-19)


### Features

* add count cids ([#583](https://www.github.com/web3-storage/web3.storage/issues/583)) ([690b3b3](https://www.github.com/web3-storage/web3.storage/commit/690b3b35a7e4915128a9a24fdcb457514dc7719b))
* add PinRequest to track CIDs to replicate ([#118](https://www.github.com/web3-storage/web3.storage/issues/118)) ([8a1aee7](https://www.github.com/web3-storage/web3.storage/commit/8a1aee7c1e03e5be70661e2a253ebe1bf2666aba))
* cron and pinpin rewire ([#531](https://www.github.com/web3-storage/web3.storage/issues/531)) ([9e5b42d](https://www.github.com/web3-storage/web3.storage/commit/9e5b42dc6d33bf3cf017034474981812370b366e))
* cron metrics ([#305](https://www.github.com/web3-storage/web3.storage/issues/305)) ([f064afb](https://www.github.com/web3-storage/web3.storage/commit/f064afb83776e14d6a66f1bde5884a9d57013794))
* cron pin sync ([#71](https://www.github.com/web3-storage/web3.storage/issues/71)) ([d40980a](https://www.github.com/web3-storage/web3.storage/commit/d40980aa8c20c68d209f6c1d00f9dbf93d192895))
* cron to update status for PinError pins ([#358](https://www.github.com/web3-storage/web3.storage/issues/358)) ([1f2fad7](https://www.github.com/web3-storage/web3.storage/commit/1f2fad7380cba7cc9520a5824aef76a8d2bf6696))


### Bug Fixes

* add pin sync queue collection ([#369](https://www.github.com/web3-storage/web3.storage/issues/369)) ([9813a1d](https://www.github.com/web3-storage/web3.storage/commit/9813a1d8cf4b96a7aa44ddbfd25502699c6601f5))
* clarify pin location in logs ([0b9e4e4](https://www.github.com/web3-storage/web3.storage/commit/0b9e4e400262a7c95b1a0fcf7462d6ec993b8823))
* consider pins within the last month ([214f288](https://www.github.com/web3-storage/web3.storage/commit/214f288d499b362b67e5a2eeb652e583290da620))
* cron metrics data prop ([#584](https://www.github.com/web3-storage/web3.storage/issues/584)) ([63fe8bc](https://www.github.com/web3-storage/web3.storage/commit/63fe8bce795a55b6f054a3e8c101861a0e0c039b))
* dag size for big dags with non pb root ([#850](https://www.github.com/web3-storage/web3.storage/issues/850)) ([b60fa1c](https://www.github.com/web3-storage/web3.storage/commit/b60fa1c3dbd839e3669578aa539cc5815b470d05))
* delete fauna history when deleting PinRequest ([191ad1a](https://www.github.com/web3-storage/web3.storage/commit/191ad1a78a3f02f4633d8783206251754dec272d))
* env var for cluster ipfs proxy auth token ([28b6985](https://www.github.com/web3-storage/web3.storage/commit/28b69853b658c37f5da833c327446d0a50ffa0e7))
* files listing ([#155](https://www.github.com/web3-storage/web3.storage/issues/155)) ([bde495c](https://www.github.com/web3-storage/web3.storage/commit/bde495c334874c742d09f3224854324ebaa24e38))
* incremental metrics ([#349](https://www.github.com/web3-storage/web3.storage/issues/349)) ([8347c20](https://www.github.com/web3-storage/web3.storage/commit/8347c20ed4a34c983d4d815b41c06fb849fff279))
* log on failed attempt ([d43c4cc](https://www.github.com/web3-storage/web3.storage/commit/d43c4ccc011c72e24ef89f0352d840451f6c57e8))
* max pin requests per run in cron and pinpin ([#623](https://www.github.com/web3-storage/web3.storage/issues/623)) ([edc7c24](https://www.github.com/web3-storage/web3.storage/commit/edc7c24fee72e1e167e205de34edfc630ea6aeb4))
* pin sync req id text ([#622](https://www.github.com/web3-storage/web3.storage/issues/622)) ([dee0a4e](https://www.github.com/web3-storage/web3.storage/commit/dee0a4ea2c92f435b4669825894341faf317f658))
* pins sync job ([26bdb43](https://www.github.com/web3-storage/web3.storage/commit/26bdb431ea72b0eac1149907e276e4f345a43516))
* query name ([c315078](https://www.github.com/web3-storage/web3.storage/commit/c315078fd7424033972334c281eddf123dc4f620))
* reduce number of pins per page ([03bf8d1](https://www.github.com/web3-storage/web3.storage/commit/03bf8d1687fe7b51c878ca92ca0361e4999b4883))
* remove dagcargo materialized views ([#735](https://www.github.com/web3-storage/web3.storage/issues/735)) ([62db538](https://www.github.com/web3-storage/web3.storage/commit/62db5383f39e7d3e3484ccb51bd4eb3de816bcfd))
* remove unused pinata import ([8e4e2a1](https://www.github.com/web3-storage/web3.storage/commit/8e4e2a1ebb7ba9a0c538584b672e0a3a75e26621))
* retry DB requests ([f27896e](https://www.github.com/web3-storage/web3.storage/commit/f27896e7f79470dcc18c10024c9c1cf873d22f21))
* set stream-channels=false for cluster add ([#342](https://www.github.com/web3-storage/web3.storage/issues/342)) ([31f30b2](https://www.github.com/web3-storage/web3.storage/commit/31f30b293071cb6915a04117d004c2a0f7e2fccf))
* small perf improvement to pins cron ([4646fc4](https://www.github.com/web3-storage/web3.storage/commit/4646fc4ca654600de362fb5192c555c0168ea98e))
* smaller page size, shorter check period ([3a57a8e](https://www.github.com/web3-storage/web3.storage/commit/3a57a8e33dc16713f560dea35120bee66399512e))
* switch dagSize type to Long ([#116](https://www.github.com/web3-storage/web3.storage/issues/116)) ([15f85eb](https://www.github.com/web3-storage/web3.storage/commit/15f85eb3bbf090ee4bfce5138eb7b963991956e5))


### Changes

* change API module name ([#135](https://www.github.com/web3-storage/web3.storage/issues/135)) ([2e436f8](https://www.github.com/web3-storage/web3.storage/commit/2e436f8596af53643ffba00749d35fa85eeea021)), closes [#86](https://www.github.com/web3-storage/web3.storage/issues/86)
* extract pinpin package for pinning our pins on pinata ([#418](https://www.github.com/web3-storage/web3.storage/issues/418)) ([8187092](https://www.github.com/web3-storage/web3.storage/commit/818709279bc492c6d63071a4f46b4dbe006ca3b2))
* run pinata backup more frequently ([3e04c0b](https://www.github.com/web3-storage/web3.storage/commit/3e04c0b916ad7e51409d1d9bc3ed0771b7f0d700))
* update db breaking change ([d011d00](https://www.github.com/web3-storage/web3.storage/commit/d011d003f0e76c37e9a1646ae1cd53bb65ad673d))
* update deps to use db@2.0 ([#235](https://www.github.com/web3-storage/web3.storage/issues/235)) ([54cdc0e](https://www.github.com/web3-storage/web3.storage/commit/54cdc0ee1c5c4021eb240fd8879182fd5be56446))
* update licenses ([#831](https://www.github.com/web3-storage/web3.storage/issues/831)) ([8e081aa](https://www.github.com/web3-storage/web3.storage/commit/8e081aac2dd03dd5eb642bff9c2da867d61edd87))
* use new db version ([c1f8834](https://www.github.com/web3-storage/web3.storage/commit/c1f8834d1ffc47dc72694d342bad719b483b4121))
