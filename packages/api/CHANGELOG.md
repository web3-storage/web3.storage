# Changelog

## [7.25.0](https://github.com/web3-storage/web3.storage/compare/api-v7.24.0...api-v7.25.0) (2024-03-11)


### Features

* bump db package to 4.1.0 and use dep on that new version from cron, api packages ([#2362](https://github.com/web3-storage/web3.storage/issues/2362)) ([18af9c6](https://github.com/web3-storage/web3.storage/commit/18af9c673a7d600105796b271ee962e2865c1eeb))

## [7.24.0](https://github.com/web3-storage/web3.storage/compare/api-v7.23.0...api-v7.24.0) (2024-01-22)


### Features

* listUploads includes parts property with list of links to CARs that contain it ([#2347](https://github.com/web3-storage/web3.storage/issues/2347)) ([b870346](https://github.com/web3-storage/web3.storage/commit/b87034604882252f314f9abfb96d347c30f17d25))

## [7.23.0](https://github.com/web3-storage/web3.storage/compare/api-v7.22.0...api-v7.23.0) (2024-01-09)


### Features

* api maintenance message is a FeatureHasBeenSunsetError when env.MODE is READ_ONLY ([#2346](https://github.com/web3-storage/web3.storage/issues/2346)) ([8c29cec](https://github.com/web3-storage/web3.storage/commit/8c29cec0e7dda7ac06ffac0339a734f0b0151b91))

## [7.22.0](https://github.com/web3-storage/web3.storage/compare/api-v7.21.0...api-v7.22.0) (2024-01-05)


### Features

* add README deprecation message ([#2340](https://github.com/web3-storage/web3.storage/issues/2340)) ([f3c661f](https://github.com/web3-storage/web3.storage/commit/f3c661f111d9b35dc8a133a6c1f9a10f3a861149))
* bypass maintenance mode for allowed tokens ([#2345](https://github.com/web3-storage/web3.storage/issues/2345)) ([7ec85aa](https://github.com/web3-storage/web3.storage/commit/7ec85aa7902d2337baada4f9eec94c4dc4edf29a))

## [7.21.0](https://github.com/web3-storage/web3.storage/compare/api-v7.20.0...api-v7.21.0) (2023-11-13)


### Features

* can disable new user registration at /user/login API around w3up launch by setting `NEXT_PUBLIC_W3UP_LAUNCH_LIMITED_AVAILABILITY_START` ([#2324](https://github.com/web3-storage/web3.storage/issues/2324)) ([09a59c6](https://github.com/web3-storage/web3.storage/commit/09a59c6d0590493b660b5a6c83ebc6829d52e733))

## [7.20.0](https://github.com/web3-storage/web3.storage/compare/api-v7.19.0...api-v7.20.0) (2023-10-18)


### Features

* support multiple gateway URLs ([#2126](https://github.com/web3-storage/web3.storage/issues/2126)) ([415dcf6](https://github.com/web3-storage/web3.storage/commit/415dcf6f57bbf6e01253460778d3d9517d878f82))


### Bug Fixes

* use dag-staging gateway from staging api ([#2318](https://github.com/web3-storage/web3.storage/issues/2318)) ([943b4cd](https://github.com/web3-storage/web3.storage/commit/943b4cdcec524f21b4c0dc64cda5d6d21cbe156f))

## [7.19.0](https://github.com/web3-storage/web3.storage/compare/api-v7.18.1...api-v7.19.0) (2023-07-31)


### Features

* write content claims ([#2291](https://github.com/web3-storage/web3.storage/issues/2291)) ([6a31c9b](https://github.com/web3-storage/web3.storage/commit/6a31c9b990d6600c910e9a77c39ce2b12311abab))


### Bug Fixes

* remove unnecessary compatibility flags ([#2301](https://github.com/web3-storage/web3.storage/issues/2301)) ([436cdb8](https://github.com/web3-storage/web3.storage/commit/436cdb82a88a3a253e5916a0dc4e1f6d34bacb89))
* signer DID ([82c3462](https://github.com/web3-storage/web3.storage/commit/82c34620236dcc978dad2b13d1475f2451307c01))
* this param for fetch calls ([#2292](https://github.com/web3-storage/web3.storage/issues/2292)) ([bf32c53](https://github.com/web3-storage/web3.storage/commit/bf32c53959d731ca567b109ab4d5fc73b4bbbfb7))
* use error message value in cause ([9b07288](https://github.com/web3-storage/web3.storage/commit/9b072887557546cbdcd718ea138c08c6319cab35))

## [7.18.1](https://github.com/web3-storage/web3.storage/compare/api-v7.18.0...api-v7.18.1) (2023-07-03)


### Bug Fixes

* remove send to gendex queue ([#2287](https://github.com/web3-storage/web3.storage/issues/2287)) ([a2cf9fd](https://github.com/web3-storage/web3.storage/commit/a2cf9fd551343a943c1a481d29dd0457f51f1143))

## [7.18.0](https://github.com/web3-storage/web3.storage/compare/api-v7.17.2...api-v7.18.0) (2023-06-27)


### Features

* re-enable queue push ([35b6bbd](https://github.com/web3-storage/web3.storage/commit/35b6bbd0d4db5462b21729d44b3be3e682cd10d1))

## [7.17.2](https://github.com/web3-storage/web3.storage/compare/api-v7.17.1...api-v7.17.2) (2023-06-27)


### Bug Fixes

* really do not use the queue ([851560c](https://github.com/web3-storage/web3.storage/commit/851560c0296b93c493218bad3e26f3ae52655cad))

## [7.17.1](https://github.com/web3-storage/web3.storage/compare/api-v7.17.0...api-v7.17.1) (2023-06-27)


### Bug Fixes

* only send to queue if configured ([f2b3d2c](https://github.com/web3-storage/web3.storage/commit/f2b3d2c6d467efe5bfae022e8f779511a886ccd4))
* remove queue binding ([d945fc9](https://github.com/web3-storage/web3.storage/commit/d945fc97dca143635c41c3d7ab235ca7148ad314))

## [7.17.0](https://github.com/web3-storage/web3.storage/compare/api-v7.16.1...api-v7.17.0) (2023-06-22)


### Features

* trigger block index creation ([#2279](https://github.com/web3-storage/web3.storage/issues/2279)) ([f058dcf](https://github.com/web3-storage/web3.storage/commit/f058dcf0226b08739393f7cb68762db6c0d3cc8e))

## [7.16.1](https://github.com/web3-storage/web3.storage/compare/api-v7.16.0...api-v7.16.1) (2023-05-12)


### Bug Fixes

* dudewhere root cid should be content cid ([#2267](https://github.com/web3-storage/web3.storage/issues/2267)) ([2beaf4f](https://github.com/web3-storage/web3.storage/commit/2beaf4f211e19a62d5b00ffcbdfec817c60a37bf))

## [7.16.0](https://github.com/web3-storage/web3.storage/compare/api-v7.15.4...api-v7.16.0) (2023-03-22)


### Features

* provide delegates on pin add response ([#2255](https://github.com/web3-storage/web3.storage/issues/2255)) ([5764145](https://github.com/web3-storage/web3.storage/commit/5764145230dcb5bb4c3cbcc0de54092e28dd31d2))

## [7.15.4](https://github.com/web3-storage/web3.storage/compare/api-v7.15.3...api-v7.15.4) (2023-03-17)


### Bug Fixes

* update pin status from GET /pins even if failed ([#2235](https://github.com/web3-storage/web3.storage/issues/2235)) ([78bbcdb](https://github.com/web3-storage/web3.storage/commit/78bbcdb019458c13395f07b44c8804d5e16b9788))

## [7.15.3](https://github.com/web3-storage/web3.storage/compare/api-v7.15.2...api-v7.15.3) (2023-03-15)


### Bug Fixes

* use car block validator ([#2241](https://github.com/web3-storage/web3.storage/issues/2241)) ([13fcc6c](https://github.com/web3-storage/web3.storage/commit/13fcc6c70e6f2af81e78f149c6e507109adc5563))

## [7.15.2](https://github.com/web3-storage/web3.storage/compare/api-v7.15.1...api-v7.15.2) (2023-03-10)


### Bug Fixes

* stop creating a Stripe account during web3.storage account creation ([#2226](https://github.com/web3-storage/web3.storage/issues/2226)) ([425ac5c](https://github.com/web3-storage/web3.storage/commit/425ac5c0b6f92ffa038077b08237a4201dfa5615))

## [7.15.1](https://github.com/web3-storage/web3.storage/compare/api-v7.15.0...api-v7.15.1) (2023-02-22)


### Bug Fixes

* include R2 key in error message ([#2219](https://github.com/web3-storage/web3.storage/issues/2219)) ([5a320f4](https://github.com/web3-storage/web3.storage/commit/5a320f4258c9c757075545762d0a65dbb602daaf))

## [7.15.0](https://github.com/web3-storage/web3.storage/compare/api-v7.14.0...api-v7.15.0) (2023-02-21)


### Features

* recheck pin status on GET /pins/:req-id ([#2214](https://github.com/web3-storage/web3.storage/issues/2214)) ([91f067f](https://github.com/web3-storage/web3.storage/commit/91f067fabbea2403280b25cc555cd88fb062e201))

## [7.14.0](https://github.com/web3-storage/web3.storage/compare/api-v7.13.1...api-v7.14.0) (2023-01-13)


### Features

* allow displaying of custom stripe prices ([#2152](https://github.com/web3-storage/web3.storage/issues/2152)) ([e3011be](https://github.com/web3-storage/web3.storage/commit/e3011bee166f762cefae40240be8ab46476aee33))
* use pickup as `CLUSTER_API_URL` ([#2179](https://github.com/web3-storage/web3.storage/issues/2179)) ([e486a67](https://github.com/web3-storage/web3.storage/commit/e486a67ae5d49e42525cfeaf977fce166f3833ee))

## [7.13.1](https://github.com/web3-storage/web3.storage/compare/api-v7.13.0...api-v7.13.1) (2023-01-04)


### Bug Fixes

* reject not supported codecs ([#2159](https://github.com/web3-storage/web3.storage/issues/2159)) ([811c1b1](https://github.com/web3-storage/web3.storage/commit/811c1b169d4833e2bb116fd869abb263fa833c02)), closes [#2154](https://github.com/web3-storage/web3.storage/issues/2154)

## [7.13.0](https://github.com/web3-storage/web3.storage/compare/api-v7.12.0...api-v7.13.0) (2022-11-30)


### Features

* list and ability to delete psa request created though deleted tokens ([#2054](https://github.com/web3-storage/web3.storage/issues/2054)) ([e150d1f](https://github.com/web3-storage/web3.storage/commit/e150d1fa86dc0e6600f159fa92ccb7c8e65900e3))


### Bug Fixes

* allow update PSA pin requests with same CID ([#2125](https://github.com/web3-storage/web3.storage/issues/2125)) ([0013efd](https://github.com/web3-storage/web3.storage/commit/0013efdeebaa5af7e4f88daa7bf6e53d706622a8)), closes [#1547](https://github.com/web3-storage/web3.storage/issues/1547)
* PSA compliance fixes ([#2091](https://github.com/web3-storage/web3.storage/issues/2091)) ([8b1c1d3](https://github.com/web3-storage/web3.storage/commit/8b1c1d3eca4a7ae5a557cb29d3f43f9d6ca29b9d)), closes [#1579](https://github.com/web3-storage/web3.storage/issues/1579)

## [7.12.0](https://github.com/web3-storage/web3.storage/compare/api-v7.11.3...api-v7.12.0) (2022-11-11)


### Features

* logins of already-existing users result in the user's customer contact info being updated (e.g. in stripe.com dashboard) ([#2103](https://github.com/web3-storage/web3.storage/issues/2103)) ([a365b4c](https://github.com/web3-storage/web3.storage/commit/a365b4c732aea169f372276e40c8792e69bfde69))

## [7.11.3](https://github.com/web3-storage/web3.storage/compare/api-v7.11.2...api-v7.11.3) (2022-11-01)


### Bug Fixes

* add api comment to trigger release on db change ([88042dd](https://github.com/web3-storage/web3.storage/commit/88042ddf1576cd9e04868b579e513fb2d9558b6a))

## [7.11.2](https://github.com/web3-storage/web3.storage/compare/api-v7.11.1...api-v7.11.2) (2022-10-27)


### Bug Fixes

* dummy commit ([29f7751](https://github.com/web3-storage/web3.storage/commit/29f775105e65410be90c281517f4372c1e0ab45d))

## [7.11.1](https://github.com/web3-storage/web3.storage/compare/api-v7.11.0...api-v7.11.1) (2022-10-27)


### Bug Fixes

* report carCid as string to sentry ([#2072](https://github.com/web3-storage/web3.storage/issues/2072)) ([5f55e32](https://github.com/web3-storage/web3.storage/commit/5f55e32d5e3c2943235157d91ddb5d143e711cf0))

## [7.11.0](https://github.com/web3-storage/web3.storage/compare/api-v7.10.0...api-v7.11.0) (2022-10-27)


### Features

* add metadata to upload error reports ([#2070](https://github.com/web3-storage/web3.storage/issues/2070)) ([6d240b7](https://github.com/web3-storage/web3.storage/commit/6d240b78f69a32f406c0da92c9d4f352576fc2cb))


### Other Changes

* rm LINKDEX_URL from wrangler.toml ([#2023](https://github.com/web3-storage/web3.storage/issues/2023)) ([1341283](https://github.com/web3-storage/web3.storage/commit/13412839bd061bdb96b1f93ddd43d77ec34cc83d))

## [7.10.0](https://github.com/web3-storage/web3.storage/compare/api-v7.9.1...api-v7.10.0) (2022-10-23)


### Features

* log terms of service acceptance ([#2028](https://github.com/web3-storage/web3.storage/issues/2028)) ([47c3540](https://github.com/web3-storage/web3.storage/commit/47c35400ae97e45d07d55e723355f139376233e6))

## [7.9.1](https://github.com/web3-storage/web3.storage/compare/api-v7.9.0...api-v7.9.1) (2022-10-18)


### Bug Fixes

* issue with logging user being set to different value than underlying user.id bigint::text ([#2042](https://github.com/web3-storage/web3.storage/issues/2042)) ([9659ab0](https://github.com/web3-storage/web3.storage/commit/9659ab08bb99dbb1b42f7591488263a7cb0aaf1c))
* update toucan-js and move to deps ([#2045](https://github.com/web3-storage/web3.storage/issues/2045)) ([9de591d](https://github.com/web3-storage/web3.storage/commit/9de591dcb13c04a32626505c9c1152adbc003d61))


### Other Changes

* use db ids > JS MAX_SAFE_INTEGER in test ([#2020](https://github.com/web3-storage/web3.storage/issues/2020)) ([6103e99](https://github.com/web3-storage/web3.storage/commit/6103e9954c2fa0ffb75b0f53e7eaa21812c924c4))

## [7.9.0](https://github.com/web3-storage/web3.storage/compare/api-v7.8.3...api-v7.9.0) (2022-10-17)


### Features

* add SATNAV and DUDEWHERE index buckets ([#2035](https://github.com/web3-storage/web3.storage/issues/2035)) ([20243bb](https://github.com/web3-storage/web3.storage/commit/20243bb3a132d274b1c3c275e41021f31d8392e6))
* display name and email in stripe ([#2010](https://github.com/web3-storage/web3.storage/issues/2010)) ([41c385a](https://github.com/web3-storage/web3.storage/commit/41c385a6d4ecdee40e599b1821de2b197b11cde0))


### Other Changes

* improve error handling upload script ([#1968](https://github.com/web3-storage/web3.storage/issues/1968)) ([a5e2373](https://github.com/web3-storage/web3.storage/commit/a5e2373a111fd57be84b6c2bf4ccb12500de4b0c)), closes [#1922](https://github.com/web3-storage/web3.storage/issues/1922)

## [7.8.3](https://github.com/web3-storage/web3.storage/compare/api-v7.8.2...api-v7.8.3) (2022-10-10)


### Bug Fixes

* PSA instructions ([#1914](https://github.com/web3-storage/web3.storage/issues/1914)) ([10f94e2](https://github.com/web3-storage/web3.storage/commit/10f94e2b92f1f7acc89998f892468a65508e5b00))

## [7.8.2](https://github.com/web3-storage/web3.storage/compare/api-v7.8.1...api-v7.8.2) (2022-10-03)


### Bug Fixes

* migrate upsert_user function to return id text instead of id bigint ([#1990](https://github.com/web3-storage/web3.storage/issues/1990)) ([8253e8c](https://github.com/web3-storage/web3.storage/commit/8253e8c1e0295e09b10e9609f65c988b7fef80f5))

## [7.8.1](https://github.com/web3-storage/web3.storage/compare/api-v7.8.0...api-v7.8.1) (2022-09-30)


### Bug Fixes

* trigger release to pick up fix from [#1976](https://github.com/web3-storage/web3.storage/issues/1976) ([#1982](https://github.com/web3-storage/web3.storage/issues/1982)) ([27f2542](https://github.com/web3-storage/web3.storage/commit/27f25422f1f1d385c2c8691a96d7ac5f1b14da6a))

## [7.8.0](https://github.com/web3-storage/web3.storage/compare/api-v7.7.1...api-v7.8.0) (2022-09-29)


### Features

* new users are initialized into free tier ([#1945](https://github.com/web3-storage/web3.storage/issues/1945)) ([ee67c35](https://github.com/web3-storage/web3.storage/commit/ee67c35c6b12a363140b79ea34835123ad76420c))

## [7.7.1](https://github.com/web3-storage/web3.storage/compare/api-v7.7.0...api-v7.7.1) (2022-09-23)


### Other Changes

* report error cause to sentry ([#1925](https://github.com/web3-storage/web3.storage/issues/1925)) ([69653b7](https://github.com/web3-storage/web3.storage/commit/69653b7b691b586c0de70f2acc34abc0330eec90))

## [7.7.0](https://github.com/web3-storage/web3.storage/compare/api-v7.6.0...api-v7.7.0) (2022-09-22)


### Features

* 1909 use stripe fixtures for website storage productprices ([#1920](https://github.com/web3-storage/web3.storage/issues/1920)) ([63d15ff](https://github.com/web3-storage/web3.storage/commit/63d15ff222ac39a59acf6380686fe0524e92a7b6))

## [7.6.0](https://github.com/web3-storage/web3.storage/compare/api-v7.5.1...api-v7.6.0) (2022-09-20)


### Features

* I can choose a storage pricing tier (issue 1869) ([#1878](https://github.com/web3-storage/web3.storage/issues/1878)) ([58de180](https://github.com/web3-storage/web3.storage/commit/58de180300e72f7a79193657a7d995f0799bae28))
* put write to cluster behind a flag ([#1785](https://github.com/web3-storage/web3.storage/issues/1785)) ([eae75d2](https://github.com/web3-storage/web3.storage/commit/eae75d2366d59b0cf16143723a5af6513d891f9e))
* send timing info to logtail. Time r2 & s3. ([#1908](https://github.com/web3-storage/web3.storage/issues/1908)) ([8dff635](https://github.com/web3-storage/web3.storage/commit/8dff6354b6f5bccbe953443c445e472085b1309d))
* use sha256 checksum for r2.put ([#1910](https://github.com/web3-storage/web3.storage/issues/1910)) ([d277ba0](https://github.com/web3-storage/web3.storage/commit/d277ba02b5d6cbb3e4065d1ecb5c516cf35cf976))


### Other Changes

* add a script that generates many uploads ([#1790](https://github.com/web3-storage/web3.storage/issues/1790)) ([e38b7a0](https://github.com/web3-storage/web3.storage/commit/e38b7a0689ae160a30ea6edd54e52376e81ebec9))
* encode sha256 hash as hex for r2 put ([#1911](https://github.com/web3-storage/web3.storage/issues/1911)) ([3d66fa9](https://github.com/web3-storage/web3.storage/commit/3d66fa91d51a15f2cde075a51b06fc614be1c108))
* silence logging debug statements in test/dev ([#1870](https://github.com/web3-storage/web3.storage/issues/1870)) ([a576131](https://github.com/web3-storage/web3.storage/commit/a576131c7e0aaaf4851a5844e2c7778fa77a343b))

## [7.5.1](https://github.com/web3-storage/web3.storage/compare/api-v7.5.0...api-v7.5.1) (2022-09-09)


### Bug Fixes

* /account/payment tiny bugs - use env var on website, fix uncaught error when no default_payment_method in StripeBillingService ([#1871](https://github.com/web3-storage/web3.storage/issues/1871)) ([5965b82](https://github.com/web3-storage/web3.storage/commit/5965b8230c9d3310c700cc306bee8431c0102ab8))

## [7.5.0](https://github.com/web3-storage/web3.storage/compare/api-v7.4.5...api-v7.5.0) (2022-09-09)


### Features

* issues/1779 - I can save my payment settings ([#1852](https://github.com/web3-storage/web3.storage/issues/1852)) ([a49e780](https://github.com/web3-storage/web3.storage/commit/a49e780a4c7c0a3680aa03239552b01f1fcf72ed))

## [7.4.5](https://github.com/web3-storage/web3.storage/compare/api-v7.4.4...api-v7.4.5) (2022-09-08)


### Bug Fixes

* add a `/user/uploads/:cid` endpoint. ([#1530](https://github.com/web3-storage/web3.storage/issues/1530)) ([99654bc](https://github.com/web3-storage/web3.storage/commit/99654bcc668db016710a91e07901cd40b9a9995a))

## [7.4.4](https://github.com/web3-storage/web3.storage/compare/api-v7.4.3...api-v7.4.4) (2022-09-07)


### Bug Fixes

* empty payload is client error ([#1854](https://github.com/web3-storage/web3.storage/issues/1854)) ([1613e4b](https://github.com/web3-storage/web3.storage/commit/1613e4b45cc59a4df36f52ebda8fe5930b035bbe))

## [7.4.3](https://github.com/web3-storage/web3.storage/compare/api-v7.4.2...api-v7.4.3) (2022-09-06)


### Bug Fixes

* trigger release ([e4175a6](https://github.com/web3-storage/web3.storage/commit/e4175a667bc177eb807f5974d79381bf36a67aa5))

## [7.4.2](https://github.com/web3-storage/web3.storage/compare/api-v7.4.1...api-v7.4.2) (2022-09-06)


### Bug Fixes

* always retry s3 upload ([#1846](https://github.com/web3-storage/web3.storage/issues/1846)) ([a5fa72c](https://github.com/web3-storage/web3.storage/commit/a5fa72c8c9c99ebb524cd21d7572fdbf178747af))

## [7.4.1](https://github.com/web3-storage/web3.storage/compare/api-v7.4.0...api-v7.4.1) (2022-09-06)


### Bug Fixes

* sourcemap stacktraces in sentry ([#1838](https://github.com/web3-storage/web3.storage/issues/1838)) ([4de82b6](https://github.com/web3-storage/web3.storage/commit/4de82b6c721c87875cd11890979bd9deb211c746))
* wrangler publish wildcard route with specified zone id ([#1843](https://github.com/web3-storage/web3.storage/issues/1843)) ([9ccacff](https://github.com/web3-storage/web3.storage/commit/9ccacff1183dee0eb8142d4bf65f224ac8a5b273))

## [7.4.0](https://github.com/web3-storage/web3.storage/compare/api-v7.3.0...api-v7.4.0) (2022-08-31)


### Features

* account payments UI start ([#1767](https://github.com/web3-storage/web3.storage/issues/1767)) ([38f0088](https://github.com/web3-storage/web3.storage/commit/38f00887df1e22ddef7c76c51e9c68883ad80895))
* add tsc checking to packages/api ([#1813](https://github.com/web3-storage/web3.storage/issues/1813)) ([b7cc6f7](https://github.com/web3-storage/web3.storage/commit/b7cc6f7a6eb9a11c6d1fa856a97d15a8b89bf10e))
* drop name table & IPNS migration cron ([#1719](https://github.com/web3-storage/web3.storage/issues/1719)) ([0cdfad9](https://github.com/web3-storage/web3.storage/commit/0cdfad9f6baf4a1a356b8c6c8291e4bceb45aa17))
* e2e test website accountPayment loggedIn, includes magic.link testMode support in test-e2e job only ([#1754](https://github.com/web3-storage/web3.storage/issues/1754)) ([6d6f92c](https://github.com/web3-storage/web3.storage/commit/6d6f92cb10552c149ebd1fcaedb2295cb661192c))


### Bug Fixes

* Return correct issuer from magic token in `tryMagicToken`. ([#1806](https://github.com/web3-storage/web3.storage/issues/1806)) ([0a10f46](https://github.com/web3-storage/web3.storage/commit/0a10f46d8d04c9babd2e16c9c7c6876c9934085d))
* upload list pagination headers ([#1739](https://github.com/web3-storage/web3.storage/issues/1739)) ([2ffe6d7](https://github.com/web3-storage/web3.storage/commit/2ffe6d749628095a93d957836c6b4e8ad3b6acf9))

## [7.3.0](https://github.com/web3-storage/web3.storage/compare/api-v7.2.0...api-v7.3.0) (2022-08-22)


### Features

* add to api GET /user/payment, add AuthorizationTestContext to encapsulate magic.link test bypass ([#1769](https://github.com/web3-storage/web3.storage/issues/1769)) ([7722acc](https://github.com/web3-storage/web3.storage/commit/7722acc91a5c105f4865b47861000147fb227f26))


### Other Changes

* remove /name API endpoints and storage ([#1686](https://github.com/web3-storage/web3.storage/issues/1686)) ([ab93278](https://github.com/web3-storage/web3.storage/commit/ab93278ebe0a9fadc53171a72237bfe3d4a5e32a))

## [7.2.0](https://github.com/web3-storage/web3.storage/compare/api-v7.1.1...api-v7.2.0) (2022-08-17)


### Features

* New Users Pins Endpoint ([#1718](https://github.com/web3-storage/web3.storage/issues/1718)) ([0d8eb86](https://github.com/web3-storage/web3.storage/commit/0d8eb86862783006bdeed131c5099e3ca3ecfb5b))


### Bug Fixes

* stracktraces with wrangler no bundle ([#1731](https://github.com/web3-storage/web3.storage/issues/1731)) ([763442c](https://github.com/web3-storage/web3.storage/commit/763442cb985f5297f04b25f4451605ab38431e44))

## [7.1.1](https://github.com/web3-storage/web3.storage/compare/api-v7.1.0...api-v7.1.1) (2022-08-12)


### Bug Fixes

* add ipns migration cron job ([#1705](https://github.com/web3-storage/web3.storage/issues/1705)) ([4b6e67f](https://github.com/web3-storage/web3.storage/commit/4b6e67f07983b06e9bad9c27deb5d6c5b993258e))
* Make PSA Errors compliant ([#1710](https://github.com/web3-storage/web3.storage/issues/1710)) ([4080363](https://github.com/web3-storage/web3.storage/commit/4080363193893f8ce72d4cf28d8153e2f4faee14))

## [7.1.0](https://github.com/web3-storage/web3.storage/compare/api-v7.0.1...api-v7.1.0) (2022-07-07)


### Features

* stop tracking remote pins and remote them from db ([#1615](https://github.com/web3-storage/web3.storage/issues/1615)) ([faa9d6a](https://github.com/web3-storage/web3.storage/commit/faa9d6a546a095a24e9a36ab48bedc77ad7d4787))


### Bug Fixes

* add blog subscription stub ([#1617](https://github.com/web3-storage/web3.storage/issues/1617)) ([6bc6bfc](https://github.com/web3-storage/web3.storage/commit/6bc6bfc43a053389391d80b4d0cf3e06820c70c4))

## [7.0.1](https://github.com/web3-storage/web3.storage/compare/api-v7.0.0...api-v7.0.1) (2022-06-29)


### Bug Fixes

* add pagination to user/uploads endpoint ([#1408](https://github.com/web3-storage/web3.storage/issues/1408)) ([3e0a14f](https://github.com/web3-storage/web3.storage/commit/3e0a14fc8407ae549d19ba8b48ddab23bd2a5141))


### Other Changes

* use `instanceof` for error type inference ([#1463](https://github.com/web3-storage/web3.storage/issues/1463)) ([a42e762](https://github.com/web3-storage/web3.storage/commit/a42e762e4935b4cbad864bd3b9edc0499b7c225c))

## [7.0.0](https://github.com/web3-storage/web3.storage/compare/api-v6.4.1...api-v7.0.0) (2022-06-27)


### ⚠ BREAKING CHANGES

* uploaded files are no longer _instantly_ available via gateways or on the DHT. They may take a few seconds to become indexed by Elastic Provider.

### Features

* switch to Elastic IPFS ([#1455](https://github.com/web3-storage/web3.storage/issues/1455)) ([9fac681](https://github.com/web3-storage/web3.storage/commit/9fac681b121f2902f0570c15e7e6b4bf16521d3c))
* use direct connection to cargo to get claimed size ([#1535](https://github.com/web3-storage/web3.storage/issues/1535)) ([e4087a9](https://github.com/web3-storage/web3.storage/commit/e4087a9f4d4202d672938d339e121c19344866b4))

## [6.4.1](https://github.com/web3-storage/web3.storage/compare/api-v6.4.0...api-v6.4.1) (2022-06-22)


### Bug Fixes

* sentry not receiving errors ([#1548](https://github.com/web3-storage/web3.storage/issues/1548)) ([1dd8d6f](https://github.com/web3-storage/web3.storage/commit/1dd8d6f2df6ae316980fd070a695aca6bfdc7e10))

## [6.4.0](https://github.com/web3-storage/web3.storage/compare/api-v6.3.1...api-v6.4.0) (2022-06-17)


### Features

* update Storage Limit Request slack message to display 1TiB ([#1517](https://github.com/web3-storage/web3.storage/issues/1517)) ([e3f904f](https://github.com/web3-storage/web3.storage/commit/e3f904f54706a4452aa2e48daed32cb727db875f))

## [6.3.1](https://github.com/web3-storage/web3.storage/compare/api-v6.3.0...api-v6.3.1) (2022-06-16)


### Bug Fixes

* ensure valid mode ([#1499](https://github.com/web3-storage/web3.storage/issues/1499)) ([45e3d1e](https://github.com/web3-storage/web3.storage/commit/45e3d1e99a3f5d7abaa9f21f8c120efad07ad312))

## [6.3.0](https://github.com/web3-storage/web3.storage/compare/api-v6.2.2...api-v6.3.0) (2022-06-16)


### Features

* Add basic storage limit request functionality ([#1398](https://github.com/web3-storage/web3.storage/issues/1398)) ([1347ed5](https://github.com/web3-storage/web3.storage/commit/1347ed50abe2831076fb61118d931226d47e2028))

## [6.2.2](https://github.com/web3-storage/web3.storage/compare/api-v6.2.1...api-v6.2.2) (2022-06-16)


### Bug Fixes

* add modules to miniflare ([#1492](https://github.com/web3-storage/web3.storage/issues/1492)) ([cba24c8](https://github.com/web3-storage/web3.storage/commit/cba24c8e25749fb2b0db6cce01baa67fabb73241))
* user login without mode middleware ([#1443](https://github.com/web3-storage/web3.storage/issues/1443)) ([a608e06](https://github.com/web3-storage/web3.storage/commit/a608e06aaf269e40018e1079451af31cab41fe5a))

## [6.2.1](https://github.com/web3-storage/web3.storage/compare/api-v6.2.0...api-v6.2.1) (2022-06-14)


### Bug Fixes

* add wrangler entry point ([85aea7b](https://github.com/web3-storage/web3.storage/commit/85aea7b79147e2f543bdfb0428215113bcef94ac))
* upgrade wrangler ([#1432](https://github.com/web3-storage/web3.storage/issues/1432)) ([e2d10e7](https://github.com/web3-storage/web3.storage/commit/e2d10e7127ace2de4af462043183e3337ad9bc3e))


### Other Changes

* add API endpoint to test instanceof behaviour on Cloudflare ([#1462](https://github.com/web3-storage/web3.storage/issues/1462)) ([b5f9163](https://github.com/web3-storage/web3.storage/commit/b5f9163b066372b05c900b4d4a8805b337a7205e))
* add Wrangler worker env for Josh ([#1351](https://github.com/web3-storage/web3.storage/issues/1351)) ([74f4656](https://github.com/web3-storage/web3.storage/commit/74f4656123863089d0df86c2ab916262df59f26f))
* fix typedefs for user tag functions ([#1387](https://github.com/web3-storage/web3.storage/issues/1387)) ([6f3500c](https://github.com/web3-storage/web3.storage/commit/6f3500cf93e22c37af09d12a0f5e1f5e68194286))

## [6.2.0](https://github.com/web3-storage/web3.storage/compare/api-v6.1.1...api-v6.2.0) (2022-06-01)


### Features

* Adding HasDeleteRestriction user_tag ([#1390](https://github.com/web3-storage/web3.storage/issues/1390)) ([0c3bb58](https://github.com/web3-storage/web3.storage/commit/0c3bb5874cc5d4ad313080fa5b1966748918481d))


### Bug Fixes

* clone env so new each request ([#1396](https://github.com/web3-storage/web3.storage/issues/1396)) ([9dd026b](https://github.com/web3-storage/web3.storage/commit/9dd026b9777d0bd235574e40b645ca67d2df19f9))

### [6.1.1](https://github.com/web3-storage/web3.storage/compare/api-v6.1.0...api-v6.1.1) (2022-05-31)


### Bug Fixes

* show custom storage quota to user ([#1338](https://github.com/web3-storage/web3.storage/issues/1338)) ([51abb35](https://github.com/web3-storage/web3.storage/commit/51abb35b9c6f53ed1023a7dbb162ce2838fe09e9))


### Other Changes

* add test for CORS OPTIONS handler ([#1331](https://github.com/web3-storage/web3.storage/issues/1331)) ([63328b5](https://github.com/web3-storage/web3.storage/commit/63328b576b8440886d8d22b763751027406bbb7f))
* fix tags in api user info ([#1379](https://github.com/web3-storage/web3.storage/issues/1379)) ([fdf6c76](https://github.com/web3-storage/web3.storage/commit/fdf6c760ea41c6befb6308d651d1621e31572d37))

## [6.1.0](https://github.com/web3-storage/web3.storage/compare/api-v6.0.0...api-v6.1.0) (2022-05-28)


### Features

* add user blocking functionality to web3 ([#1322](https://github.com/web3-storage/web3.storage/issues/1322)) ([5803876](https://github.com/web3-storage/web3.storage/commit/5803876b6ab6672ce82ebe3e641a8729993743ef))
* send email notifications for storage quota usage ([#1273](https://github.com/web3-storage/web3.storage/issues/1273)) ([0b1eb09](https://github.com/web3-storage/web3.storage/commit/0b1eb09b32dfb6cb1b3a5a8b5034dc4ac54ba3e2))


### Bug Fixes

* typo in Logging constructor ([#1346](https://github.com/web3-storage/web3.storage/issues/1346)) ([0e9c0ae](https://github.com/web3-storage/web3.storage/commit/0e9c0ae18229e5b851d58fb62348181550578e5d))

## [6.0.0](https://github.com/web3-storage/web3.storage/compare/api-v5.7.3...api-v6.0.0) (2022-05-20)


### ⚠ BREAKING CHANGES

* psa pinning APIs - rename requestId to requestid

### Features

* respond with unique error message when blocked API key is used ([#1302](https://github.com/web3-storage/web3.storage/issues/1302)) ([faae1db](https://github.com/web3-storage/web3.storage/commit/faae1db8d635678fd6b9f36294e0c0dc0f243f22))


### Bug Fixes

* psa pinning APIs - rename requestId to requestid ([b95b786](https://github.com/web3-storage/web3.storage/commit/b95b7868d59bf7ce01ac98abfad8d9cec377f5f9))
* swap the order of `corsOptions` and `envAll` to avoid error ([#1329](https://github.com/web3-storage/web3.storage/issues/1329)) ([fe15698](https://github.com/web3-storage/web3.storage/commit/fe156984178bf7a1ff320621a437c347758a114d))


### Other Changes

* add Logtail logging to the API ([d0c9b04](https://github.com/web3-storage/web3.storage/commit/d0c9b04bd998789f148e32f85ad841396aa069ff))
* rename pinned to psaPinned ([#1268](https://github.com/web3-storage/web3.storage/issues/1268)) ([aeae342](https://github.com/web3-storage/web3.storage/commit/aeae342547b1fb15c17069f6d019beae250564f5))

### [5.7.3](https://github.com/web3-storage/web3.storage/compare/api-v5.7.2...api-v5.7.3) (2022-05-13)


### Bug Fixes

* upgrade miniflare to ^2.4.0 ([#1312](https://github.com/web3-storage/web3.storage/issues/1312)) ([69b2004](https://github.com/web3-storage/web3.storage/commit/69b2004c95dd86e534e1503d8f78c5f068140c71))


### Other Changes

* refactor auth middleware ([#1271](https://github.com/web3-storage/web3.storage/issues/1271)) ([cf9b8e2](https://github.com/web3-storage/web3.storage/commit/cf9b8e217f1852bcf15568a73a1cf6a2871d9d6f))

### [5.7.2](https://github.com/web3-storage/web3.storage/compare/api-v5.7.1...api-v5.7.2) (2022-04-29)


### Bug Fixes

* Bump MAX_BLOCK_SIZE to 2MiB limit imposed by bitswap ([#1269](https://github.com/web3-storage/web3.storage/issues/1269)) ([f0d8d95](https://github.com/web3-storage/web3.storage/commit/f0d8d95df55e54d6d435c7fe11d6c3e81d12fca6))

### [5.7.1](https://github.com/web3-storage/web3.storage/compare/api-v5.7.0...api-v5.7.1) (2022-04-26)


### Bug Fixes

* trigger api release with db change ([#1274](https://github.com/web3-storage/web3.storage/issues/1274)) ([459e033](https://github.com/web3-storage/web3.storage/commit/459e033566dc080efb4ee5484047879663d2398f))

## [5.7.0](https://github.com/web3-storage/web3.storage/compare/api-v5.6.0...api-v5.7.0) (2022-04-19)


### Features

* use IANA media type application/vnd.ipld.car ([#1215](https://github.com/web3-storage/web3.storage/issues/1215)) ([c6fa207](https://github.com/web3-storage/web3.storage/commit/c6fa20768f4bef7f715f08d518f90d3a355bf15b))


### Bug Fixes

* return 400 on malformed form data ([#1255](https://github.com/web3-storage/web3.storage/issues/1255)) ([976b0c6](https://github.com/web3-storage/web3.storage/commit/976b0c611d4556e530d6a52d48ae88a306c3ad9b))

## [5.6.0](https://github.com/web3-storage/web3.storage/compare/api-v5.5.0...api-v5.6.0) (2022-04-11)


### Features

* api support for ipfs-cluster@1.0 ([#1227](https://github.com/web3-storage/web3.storage/issues/1227)) ([57678fe](https://github.com/web3-storage/web3.storage/commit/57678fe60baf5fe5648bfff23c0144e1477b26e2)), closes [#1184](https://github.com/web3-storage/web3.storage/issues/1184)


### Bug Fixes

* api add to cluster always with local false ([#1241](https://github.com/web3-storage/web3.storage/issues/1241)) ([9100b8f](https://github.com/web3-storage/web3.storage/commit/9100b8fa7c5dcc464baab5cdd699d8dc2c3baf40))
* Return 400 on malformed form-data ([#1219](https://github.com/web3-storage/web3.storage/issues/1219)) ([2e165ad](https://github.com/web3-storage/web3.storage/commit/2e165adb83b752c4bc1f1e5bdfdb35eb61db5c1b))

## [5.5.0](https://github.com/web3-storage/web3.storage/compare/api-v5.4.3...api-v5.5.0) (2022-04-05)


### Features

* add pinned storage to user account API ([#1044](https://github.com/web3-storage/web3.storage/issues/1044)) ([3200a6e](https://github.com/web3-storage/web3.storage/commit/3200a6e20a3460cefe5887ab5d48ad320a84a86f))
* implement account restriction ([#1053](https://github.com/web3-storage/web3.storage/issues/1053)) ([6f6f279](https://github.com/web3-storage/web3.storage/commit/6f6f2795a374c6df1e825f52d2c99afbe79131e5))

### [5.4.3](https://github.com/web3-storage/web3.storage/compare/api-v5.4.2...api-v5.4.3) (2022-03-18)


### Bug Fixes

* add missing status UnexpectedlyUnpinned ([#1105](https://github.com/web3-storage/web3.storage/issues/1105)) ([118ceb0](https://github.com/web3-storage/web3.storage/commit/118ceb0b1d768ac6585124385994199173deefac))
* check bytes match cid ([#1069](https://github.com/web3-storage/web3.storage/issues/1069)) ([72b8073](https://github.com/web3-storage/web3.storage/commit/72b8073d829773b795069cf88681d6adfaf33d87))
* filter PSA requests by queued status for Unpinned CIDs ([#1110](https://github.com/web3-storage/web3.storage/issues/1110)) ([dc2d359](https://github.com/web3-storage/web3.storage/commit/dc2d3590e243d94d569c38f4a07ec73582a6aafb))
* use rpc for pins upsert ([#1088](https://github.com/web3-storage/web3.storage/issues/1088)) ([6a8e394](https://github.com/web3-storage/web3.storage/commit/6a8e394af8a63315db91bed82c17e77c13fb9fc2))

### [5.4.2](https://github.com/web3-storage/web3.storage/compare/api-v5.4.1...api-v5.4.2) (2022-03-10)


### Bug Fixes

* store IPFS peer IDs ([#1093](https://github.com/web3-storage/web3.storage/issues/1093)) ([1f2dcda](https://github.com/web3-storage/web3.storage/commit/1f2dcdaf4fb49419967aae7f988e05e67c05506f))

### [5.4.1](https://github.com/web3-storage/web3.storage/compare/api-v5.4.0...api-v5.4.1) (2022-03-09)


### Bug Fixes

* tmp workaround for lack of ipfs peer id on status response ([#1090](https://github.com/web3-storage/web3.storage/issues/1090)) ([b0fce07](https://github.com/web3-storage/web3.storage/commit/b0fce07d6f13c294d15060d6158372343c088213))

## [5.4.0](https://github.com/web3-storage/web3.storage/compare/api-v5.3.0...api-v5.4.0) (2022-03-09)


### Features

* use user tags to check PSA auth ([#1008](https://github.com/web3-storage/web3.storage/issues/1008)) ([6fc29e6](https://github.com/web3-storage/web3.storage/commit/6fc29e6aebde22210d3dbaf0f827876035c77b5e))


### Bug Fixes

* metrics computed async ([#1085](https://github.com/web3-storage/web3.storage/issues/1085)) ([99b52e5](https://github.com/web3-storage/web3.storage/commit/99b52e51689923426a857dc8693176dcbbceda7b))
* pin status syncing ([#1083](https://github.com/web3-storage/web3.storage/issues/1083)) ([b7e0e7c](https://github.com/web3-storage/web3.storage/commit/b7e0e7c12b30f3c1136baa90907350f01d3cde22))
* verify s3 backup integrity on upload ([#1068](https://github.com/web3-storage/web3.storage/issues/1068)) ([c18b6e7](https://github.com/web3-storage/web3.storage/commit/c18b6e713711cfe8a38a0120dbfda12158959295)), closes [#1036](https://github.com/web3-storage/web3.storage/issues/1036)

## [5.3.0](https://github.com/web3-storage/web3.storage/compare/api-v5.2.0...api-v5.3.0) (2022-02-24)


### Features

* update metrics and add psa pin requests to metrics ([d647ecb](https://github.com/web3-storage/web3.storage/commit/d647ecb90bbf7e068b9394f42b1c535671346d71))


### Bug Fixes

* use ipfs peerId as pin location ([#966](https://github.com/web3-storage/web3.storage/issues/966)) ([5ae212d](https://github.com/web3-storage/web3.storage/commit/5ae212da21692da2fe9d08a53463b15875ec0cd7))
* use upsertpins ([#938](https://github.com/web3-storage/web3.storage/issues/938)) ([d593a19](https://github.com/web3-storage/web3.storage/commit/d593a19a1c595b201ab27d62db23d2b6c4dc1bf2))
* version endpoint info ([#1024](https://github.com/web3-storage/web3.storage/issues/1024)) ([049f9b8](https://github.com/web3-storage/web3.storage/commit/049f9b823a0b6406a6cc8105ca65c459a7646d15))

## [5.2.0](https://github.com/web3-storage/web3.storage/compare/api-v5.1.4...api-v5.2.0) (2022-02-22)


### Features

* custom message for pin unauthorised ([#995](https://github.com/web3-storage/web3.storage/issues/995)) ([38c2e22](https://github.com/web3-storage/web3.storage/commit/38c2e22f0e71a2e6e20c176fe8cb42a4e2979fc5))
* pins list filter by meta ([#927](https://github.com/web3-storage/web3.storage/issues/927)) ([486a0cd](https://github.com/web3-storage/web3.storage/commit/486a0cdcb82d73f2f07b76ffdc4f8d08b41a9d6a))


### Bug Fixes

* handle maintenance error ([#1019](https://github.com/web3-storage/web3.storage/issues/1019)) ([9068490](https://github.com/web3-storage/web3.storage/commit/9068490aaa4dbe037e8e6aa9eaad706a46f11aed))
* remove api db create upload retry ([#1018](https://github.com/web3-storage/web3.storage/issues/1018)) ([e6a2f83](https://github.com/web3-storage/web3.storage/commit/e6a2f8310d812fe6f1b222ddd603b543a2f4d5e7))

### [5.1.4](https://github.com/web3-storage/web3.storage/compare/api-v5.1.3...api-v5.1.4) (2022-02-14)


### Bug Fixes

* invalid CAR errors ([#977](https://github.com/web3-storage/web3.storage/issues/977)) ([2ee4a08](https://github.com/web3-storage/web3.storage/commit/2ee4a08457dbf1dc0385e65b7ea034a232c5b44c))

### [5.1.3](https://github.com/web3-storage/web3.storage/compare/api-v5.1.2...api-v5.1.3) (2022-02-07)


### Bug Fixes

* db client do not throw error when no upload found ([#885](https://github.com/web3-storage/web3.storage/issues/885)) ([834d3cc](https://github.com/web3-storage/web3.storage/commit/834d3ccb22d8ee00b4f47e5eae850aaf5b7ebba1))

### [5.1.2](https://github.com/web3-storage/web3.storage/compare/api-v5.1.1...api-v5.1.2) (2022-02-06)


### Bug Fixes

* size for single block raw node ([#958](https://github.com/web3-storage/web3.storage/issues/958)) ([708aea7](https://github.com/web3-storage/web3.storage/commit/708aea775461ede27f67ac133eba9f1a22163f5d))

### [5.1.1](https://github.com/web3-storage/web3.storage/compare/api-v5.1.0...api-v5.1.1) (2022-02-03)


### Bug Fixes

* add initial migration ([#951](https://github.com/web3-storage/web3.storage/issues/951)) ([89c16b8](https://github.com/web3-storage/web3.storage/commit/89c16b89443dea63884820dd978c03981c7ab917))
* durable objects config ([#949](https://github.com/web3-storage/web3.storage/issues/949)) ([0ccb3f3](https://github.com/web3-storage/web3.storage/commit/0ccb3f35b02423930fc6dbad00c3a5d867c159c7))
* user and auth token type declarations ([#948](https://github.com/web3-storage/web3.storage/issues/948)) ([287f01c](https://github.com/web3-storage/web3.storage/commit/287f01ce574f093f732b9f33eb28d4b4258a6512))

## [5.1.0](https://github.com/web3-storage/web3.storage/compare/api-v5.0.8...api-v5.1.0) (2022-02-02)


### Features

* add origins to psa pin request ([#897](https://github.com/web3-storage/web3.storage/issues/897)) ([0056679](https://github.com/web3-storage/web3.storage/commit/00566792980b42431fa9edc55add3c7ec0618732))
* filter pins by status ([#848](https://github.com/web3-storage/web3.storage/issues/848)) ([df1582b](https://github.com/web3-storage/web3.storage/commit/df1582b6b7d9fef45f832212d8df13aa29f246f3))
* pinning api allowlist ([#705](https://github.com/web3-storage/web3.storage/issues/705)) ([ed3a08d](https://github.com/web3-storage/web3.storage/commit/ed3a08d9ec4a7c7a746ffd5de06319a1ba5b1dad))
* pinning API implementation ([8187bb5](https://github.com/web3-storage/web3.storage/commit/8187bb5891ccf73c35289fd9f265ea110cbd5b9a))
* websockets support for w3name ([#932](https://github.com/web3-storage/web3.storage/issues/932)) ([20998fa](https://github.com/web3-storage/web3.storage/commit/20998fabf87944aa8c877702ba4175e0db8cedad))


### Bug Fixes

* bind normalizedCid instead of function ([#941](https://github.com/web3-storage/web3.storage/issues/941)) ([49cc35f](https://github.com/web3-storage/web3.storage/commit/49cc35f2cc4f3ce4790a416b907341dbb19ba716))
* bind normalizedCid instead of function ([#942](https://github.com/web3-storage/web3.storage/issues/942)) ([6cfa3dd](https://github.com/web3-storage/web3.storage/commit/6cfa3dd148096a9aecf2f48ed712c829cf210d38))
* check if unpinned then downgrade to v0 ([#919](https://github.com/web3-storage/web3.storage/issues/919)) ([f1e9da5](https://github.com/web3-storage/web3.storage/commit/f1e9da5da5883671415091e6168a7ac95778dfef))
* include meta for replace pin ([#935](https://github.com/web3-storage/web3.storage/issues/935)) ([83f0b0b](https://github.com/web3-storage/web3.storage/commit/83f0b0bc4840171490a9e09c6a7ce1174ca38cd8))
* limit the psa request listing and return right count ([67d71e8](https://github.com/web3-storage/web3.storage/commit/67d71e8f22ec87667801f7eb790eb3498f924aaf))
* psa pin request status ([f8967a8](https://github.com/web3-storage/web3.storage/commit/f8967a870ba99d06f9e6505b08dc83930da220e9))
* return right psa status in APIs ([445fd12](https://github.com/web3-storage/web3.storage/commit/445fd1289d1eeaa1063b5d12d9de5fb0fee773cf))
* sentry version cannot contain slash ([#924](https://github.com/web3-storage/web3.storage/issues/924)) ([3449af4](https://github.com/web3-storage/web3.storage/commit/3449af46517989e0ba9a42785d996dba64861912))
* update name in pinning status filtering test ([57eaf6c](https://github.com/web3-storage/web3.storage/commit/57eaf6c9e892be637b0cc182804ea10be2f3c4a0))
* update package.json main entry ([4b46a8c](https://github.com/web3-storage/web3.storage/commit/4b46a8cff28dbdcd3bea5fad2e09db6707b6d318))

### [5.0.8](https://www.github.com/web3-storage/web3.storage/compare/api-v5.0.7...api-v5.0.8) (2022-01-17)


### Bug Fixes

* use single sentry project ([#869](https://www.github.com/web3-storage/web3.storage/issues/869)) ([ca530cd](https://www.github.com/web3-storage/web3.storage/commit/ca530cde3a601ddcabb8e25e39b9006641d6c3cf))

### [5.0.7](https://www.github.com/web3-storage/web3.storage/compare/api-v5.0.6...api-v5.0.7) (2022-01-11)


### Bug Fixes

* api cluster add car explicitly ([#858](https://www.github.com/web3-storage/web3.storage/issues/858)) ([66b8fe3](https://www.github.com/web3-storage/web3.storage/commit/66b8fe3c9da72074865b86539e6e26b26d482a3b))

### [5.0.6](https://www.github.com/web3-storage/web3.storage/compare/api-v5.0.5...api-v5.0.6) (2022-01-11)


### Bug Fixes

* dag size for big dags with non pb root ([#850](https://www.github.com/web3-storage/web3.storage/issues/850)) ([b60fa1c](https://www.github.com/web3-storage/web3.storage/commit/b60fa1c3dbd839e3669578aa539cc5815b470d05))
* update deps in api and client ([#855](https://www.github.com/web3-storage/web3.storage/issues/855)) ([22155db](https://www.github.com/web3-storage/web3.storage/commit/22155db13b646e9846cf10c26d10faeb0d3b936e))


### Changes

* added leslieoa to api wrangler config ([#849](https://www.github.com/web3-storage/web3.storage/issues/849)) ([ec502e3](https://www.github.com/web3-storage/web3.storage/commit/ec502e341283c6e4f767090ee269a45d36abc563))

### [5.0.5](https://www.github.com/web3-storage/web3.storage/compare/api-v5.0.4...api-v5.0.5) (2022-01-06)


### Bug Fixes

* db endpoint to use heroku ([#817](https://www.github.com/web3-storage/web3.storage/issues/817)) ([5f846a7](https://www.github.com/web3-storage/web3.storage/commit/5f846a705063ccdc966c4837492dd87926eebd06))

### [5.0.4](https://www.github.com/web3-storage/web3.storage/compare/api-v5.0.3...api-v5.0.4) (2021-12-24)


### Bug Fixes

* remove temporary dag size sum for pins ([#824](https://www.github.com/web3-storage/web3.storage/issues/824)) ([f7faccc](https://www.github.com/web3-storage/web3.storage/commit/f7facccb6ee7ee23d080dcf7ec8376adc98638fe))

### [5.0.3](https://www.github.com/web3-storage/web3.storage/compare/api-v5.0.2...api-v5.0.3) (2021-12-14)


### Bug Fixes

* add metadata to backup ([#783](https://www.github.com/web3-storage/web3.storage/issues/783)) ([70db5c9](https://www.github.com/web3-storage/web3.storage/commit/70db5c9e417c6df1858db2caf9fae62d45cc6410))

### [5.0.2](https://www.github.com/web3-storage/web3.storage/compare/api-v5.0.1...api-v5.0.2) (2021-12-10)


### Changes

* create tool package with ipfs-cluster docker-compose setup. ([d6ee483](https://www.github.com/web3-storage/web3.storage/commit/d6ee4831237efcfc24e9fb8ee4c835533b16fbe7))

### [5.0.1](https://www.github.com/web3-storage/web3.storage/compare/api-v5.0.0...api-v5.0.1) (2021-12-09)


### Bug Fixes

* api using db instead of mocks for tests ([#765](https://www.github.com/web3-storage/web3.storage/issues/765)) ([c9f6c06](https://www.github.com/web3-storage/web3.storage/commit/c9f6c066a5d46367d57a6f0de482166621c3fe38))
* db delete key return value ([#766](https://www.github.com/web3-storage/web3.storage/issues/766)) ([34f5f82](https://www.github.com/web3-storage/web3.storage/commit/34f5f826f68ff8407fad0a6e9d0a20f6e4d99d47))

## [5.0.0](https://www.github.com/web3-storage/web3.storage/compare/api-v4.3.0...api-v5.0.0) (2021-12-06)


### ⚠ BREAKING CHANGES

* client should not throw on 404 (#751)

### Bug Fixes

* client should not throw on 404 ([#751](https://www.github.com/web3-storage/web3.storage/issues/751)) ([a4cce7e](https://www.github.com/web3-storage/web3.storage/commit/a4cce7eb67a6dab6a75c5c86bcebe4dc66ecd6e4))
* remove backdoor routes ([#737](https://www.github.com/web3-storage/web3.storage/issues/737)) ([132c1f5](https://www.github.com/web3-storage/web3.storage/commit/132c1f5cd6dcb1a001eec8c97ce575feacc78dec))


### Changes

* update db breaking change ([d011d00](https://www.github.com/web3-storage/web3.storage/commit/d011d003f0e76c37e9a1646ae1cd53bb65ad673d))

## [4.3.0](https://www.github.com/web3-storage/web3.storage/compare/api-v4.2.1...api-v4.3.0) (2021-12-01)


### Features

* temporary api backdoor ([#722](https://www.github.com/web3-storage/web3.storage/issues/722)) ([a9480d9](https://www.github.com/web3-storage/web3.storage/commit/a9480d94c9ca1b031937c6de196c68d659fc79b8))

### [4.2.1](https://www.github.com/web3-storage/web3.storage/compare/api-v4.2.0...api-v4.2.1) (2021-11-30)


### Bug Fixes

* data CID is root CID of aggregate, not content CID ([#720](https://www.github.com/web3-storage/web3.storage/issues/720)) ([8c67725](https://www.github.com/web3-storage/web3.storage/commit/8c677259635a3deb30c948330f8ea118053309ce))

## [4.2.0](https://www.github.com/web3-storage/web3.storage/compare/api-v4.1.0...api-v4.2.0) (2021-11-30)


### Features

* enable sentry to record X-Client request header ([#711](https://www.github.com/web3-storage/web3.storage/issues/711)) ([5276add](https://www.github.com/web3-storage/web3.storage/commit/5276addfc22b63a0af7a5311056b477160a1ae28))


### Bug Fixes

* encode created date in Link header ([#719](https://www.github.com/web3-storage/web3.storage/issues/719)) ([bb0285f](https://www.github.com/web3-storage/web3.storage/commit/bb0285f2a0a5269ad1126905920758b8050a95d5))

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
