# Changelog

### [2.4.1](https://www.github.com/web3-storage/web3.storage/compare/w3-v2.4.0...w3-v2.4.1) (2021-08-31)


### Bug Fixes

* `w3 put <path>...` warn if paths do not exist ([#412](https://www.github.com/web3-storage/web3.storage/issues/412)) ([c790401](https://www.github.com/web3-storage/web3.storage/commit/c79040176a116047c0acd9a22680927c30596085)), closes [#399](https://www.github.com/web3-storage/web3.storage/issues/399)
* update dependencies ([#404](https://www.github.com/web3-storage/web3.storage/issues/404)) ([dd11034](https://www.github.com/web3-storage/web3.storage/commit/dd110344c6475e0e074bfaec6cf32d16643e1bdb))

## [2.4.0](https://www.github.com/web3-storage/web3.storage/compare/w3-v2.3.0...w3-v2.4.0) (2021-08-18)


### Features

* add command to upload CAR file from CLI ([#363](https://www.github.com/web3-storage/web3.storage/issues/363)) ([214d5b0](https://www.github.com/web3-storage/web3.storage/commit/214d5b09af6e1d2b6d8f8b36e00166aa10379955)), closes [#357](https://www.github.com/web3-storage/web3.storage/issues/357)


### Bug Fixes

* add missing dependency ([494478c](https://www.github.com/web3-storage/web3.storage/commit/494478c7baed649a49c59ba9605700c29ee9794d))

## [2.3.0](https://www.github.com/web3-storage/web3.storage/compare/w3-v2.2.0...w3-v2.3.0) (2021-08-17)


### Features

* add --name and --hidden flags to w3 put ([#356](https://www.github.com/web3-storage/web3.storage/issues/356)) ([c2e4de3](https://www.github.com/web3-storage/web3.storage/commit/c2e4de33cb17b93e8551c7230fa2f4b8d3bd8cce)), closes [#316](https://www.github.com/web3-storage/web3.storage/issues/316)

## [2.2.0](https://www.github.com/web3-storage/web3.storage/compare/w3-v2.1.0...w3-v2.2.0) (2021-08-11)


### Features

* `w3 put --no-retry` ([1cf501d](https://www.github.com/web3-storage/web3.storage/commit/1cf501dda6998d712808dc4b5571beef4629e2c2))

## [2.1.0](https://www.github.com/web3-storage/web3.storage/compare/w3-v2.0.0...w3-v2.1.0) (2021-07-29)


### Features

* add alias for list -> ls ([#228](https://www.github.com/web3-storage/web3.storage/issues/228)) ([58bda2d](https://www.github.com/web3-storage/web3.storage/commit/58bda2ddb72fa04aded0542fd33847cf194d64f0))

## [2.0.0](https://www.github.com/web3-storage/web3.storage/compare/w3-v1.1.0...w3-v2.0.0) (2021-07-28)


### ⚠ BREAKING CHANGES

* make unixfs importer on ipfs-car use same defaults as lotus (#170)

### Features

* list user uploads in client and `w3` ([#198](https://www.github.com/web3-storage/web3.storage/issues/198)) ([31caaa0](https://www.github.com/web3-storage/web3.storage/commit/31caaa0d6ef88a7467c6192a8b2d976f70087c62))
* make unixfs importer on ipfs-car use same defaults as lotus ([#170](https://www.github.com/web3-storage/web3.storage/issues/170)) ([06f6948](https://www.github.com/web3-storage/web3.storage/commit/06f6948ce36b5e2a87f31b9bfac41e9465cb901b))


### Bug Fixes

* get version of w3 cmd from package.json ([aa6a1ed](https://www.github.com/web3-storage/web3.storage/commit/aa6a1edcd7e0e586230d0146cb30877b8af62f71)), closes [#167](https://www.github.com/web3-storage/web3.storage/issues/167)

## [1.1.0](https://www.github.com/web3-storage/web3.storage/compare/w3-v1.0.1...w3-v1.1.0) (2021-07-23)


### Features

* user option for wrapWithDirectory ([#143](https://www.github.com/web3-storage/web3.storage/issues/143)) ([b08be84](https://www.github.com/web3-storage/web3.storage/commit/b08be84e7efcd610c21ff56b0cc129a11faf3840))


### Bug Fixes

* add missing ora dep and add tests ([#134](https://www.github.com/web3-storage/web3.storage/issues/134)) ([718c327](https://www.github.com/web3-storage/web3.storage/commit/718c327b87b4143358d9c6de5d69a83d8dcb65e0))

### [1.0.1](https://www.github.com/web3-storage/web3.storage/compare/w3-v1.0.0...w3-v1.0.1) (2021-07-22)


### Bug Fixes

* set npm publish access to public ([e1ddc56](https://www.github.com/web3-storage/web3.storage/commit/e1ddc56ca014dfe52bdb37c2f5f76b6fb0fee15d))

## 1.0.0 (2021-07-22)


### Features

* `w3 token` and `w3 status` commands ([#98](https://www.github.com/web3-storage/web3.storage/issues/98)) ([001dae1](https://www.github.com/web3-storage/web3.storage/commit/001dae1375bfdbbee9e72d95e94065fb87ead11b))
* add `w3` cli ([#17](https://www.github.com/web3-storage/web3.storage/issues/17)) ([d84dc98](https://www.github.com/web3-storage/web3.storage/commit/d84dc98ac39fe3546adc8711ea975ca0d762f0c0))
* subcommands for w3 ([#60](https://www.github.com/web3-storage/web3.storage/issues/60)) ([4825a8c](https://www.github.com/web3-storage/web3.storage/commit/4825a8c28266b60d6b37f498c327737e83093c15))
* w3 --put /path/to/files ([#57](https://www.github.com/web3-storage/web3.storage/issues/57)) ([57aa0a0](https://www.github.com/web3-storage/web3.storage/commit/57aa0a0fbd16801234fa896b09fe2522d7aa1962))
