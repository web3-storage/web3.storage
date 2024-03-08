# Changelog

## [2.39.4](https://github.com/web3-storage/web3.storage/compare/website-v2.39.3...website-v2.39.4) (2024-03-08)


### Bug Fixes

* remove plans and payment link from menu ([715df70](https://github.com/web3-storage/web3.storage/commit/715df70a53addc404eeff360ffdbeb3ebefa9fa9))

## [2.39.3](https://github.com/web3-storage/web3.storage/compare/website-v2.39.2...website-v2.39.3) (2024-02-07)


### Bug Fixes

* hide pricing info ([#2357](https://github.com/web3-storage/web3.storage/issues/2357)) ([3a727ec](https://github.com/web3-storage/web3.storage/commit/3a727ec572134a5a1559acf0d0c461d54e5d83c5))

## [2.39.2](https://github.com/web3-storage/web3.storage/compare/website-v2.39.1...website-v2.39.2) (2024-01-09)


### Bug Fixes

* force website release ([07881a3](https://github.com/web3-storage/web3.storage/commit/07881a341432e4261f0498467e9570873fc6964b))

## [2.39.1](https://github.com/web3-storage/web3.storage/compare/website-v2.39.0...website-v2.39.1) (2024-01-09)


### Bug Fixes

* only display maintenance message for no read or write ([b85827a](https://github.com/web3-storage/web3.storage/commit/b85827ab175db91c29a64da45c2d9653635ff0d9))

## [2.39.0](https://github.com/web3-storage/web3.storage/compare/website-v2.38.2...website-v2.39.0) (2024-01-09)


### Features

* api maintenance message is a FeatureHasBeenSunsetError when env.MODE is READ_ONLY ([#2346](https://github.com/web3-storage/web3.storage/issues/2346)) ([8c29cec](https://github.com/web3-storage/web3.storage/commit/8c29cec0e7dda7ac06ffac0339a734f0b0151b91))

## [2.38.2](https://github.com/web3-storage/web3.storage/compare/website-v2.38.1...website-v2.38.2) (2023-11-14)


### Bug Fixes

* remove upgrade button ([#2332](https://github.com/web3-storage/web3.storage/issues/2332)) ([4b1da4e](https://github.com/web3-storage/web3.storage/commit/4b1da4ebf73937309c0db4240dc929a46961a3f0))

## [2.38.1](https://github.com/web3-storage/web3.storage/compare/website-v2.38.0...website-v2.38.1) (2023-11-14)


### Bug Fixes

* link banner to blogpost instead of console ([#2330](https://github.com/web3-storage/web3.storage/issues/2330)) ([e4f384d](https://github.com/web3-storage/web3.storage/commit/e4f384db1f4a3d0a4963417d8b94154426f65d5f))

## [2.38.0](https://github.com/web3-storage/web3.storage/compare/website-v2.37.0...website-v2.38.0) (2023-11-13)


### Features

* /account/payment disables changing plans after scheduled sunset date ([#2321](https://github.com/web3-storage/web3.storage/issues/2321)) ([22799fe](https://github.com/web3-storage/web3.storage/commit/22799fe56e0a4b26235ca8714eddfb1496b19972))
* can disable new user registration at /user/login API around w3up launch by setting `NEXT_PUBLIC_W3UP_LAUNCH_LIMITED_AVAILABILITY_START` ([#2324](https://github.com/web3-storage/web3.storage/issues/2324)) ([09a59c6](https://github.com/web3-storage/web3.storage/commit/09a59c6d0590493b660b5a6c83ebc6829d52e733))

## [2.37.0](https://github.com/web3-storage/web3.storage/compare/website-v2.36.3...website-v2.37.0) (2023-11-09)


### Features

* add w3up-launch announcement banner (when env.NEXT_PUBLIC_W3UP_LAUNCH_SUNSET_ANNOUNCEMENT_START is set) ([#2319](https://github.com/web3-storage/web3.storage/issues/2319)) ([f3d5b97](https://github.com/web3-storage/web3.storage/commit/f3d5b97eb781e20ad73d06597c88bd67303a9083))
* remove 'whats the data layer?' cta2 from website homepage ([#2322](https://github.com/web3-storage/web3.storage/issues/2322)) ([7975fdf](https://github.com/web3-storage/web3.storage/commit/7975fdfb2b21eb570fcfe295064e24ef44d0f58e))

## [2.36.3](https://github.com/web3-storage/web3.storage/compare/website-v2.36.2...website-v2.36.3) (2023-08-29)


### Bug Fixes

* curl http header arg name ([#2308](https://github.com/web3-storage/web3.storage/issues/2308)) ([900de50](https://github.com/web3-storage/web3.storage/commit/900de5097f97412256c552836ae60f91c8023f50)), closes [#2289](https://github.com/web3-storage/web3.storage/issues/2289)

## [2.36.2](https://github.com/web3-storage/web3.storage/compare/website-v2.36.1...website-v2.36.2) (2023-07-24)


### Bug Fixes

* trigger release for 0a7e091 ([480d49d](https://github.com/web3-storage/web3.storage/commit/480d49d266786068c4be41cb3bad0f80dff4c7c2))

## [2.36.1](https://github.com/web3-storage/web3.storage/compare/website-v2.36.0...website-v2.36.1) (2023-07-24)


### Bug Fixes

* make blocking in ToS explicit ([#2296](https://github.com/web3-storage/web3.storage/issues/2296)) ([0a7e091](https://github.com/web3-storage/web3.storage/commit/0a7e09100b0991d14281f6c826877c469c9032db))

## [2.36.0](https://github.com/web3-storage/web3.storage/compare/website-v2.35.4...website-v2.36.0) (2023-06-07)


### Features

* load faq content from Netlify ([#2106](https://github.com/web3-storage/web3.storage/issues/2106)) ([7eb3e11](https://github.com/web3-storage/web3.storage/commit/7eb3e114c8089aaa53ace6810fab717cd78b4018))


### Bug Fixes

* w3name docs ([#2273](https://github.com/web3-storage/web3.storage/issues/2273)) ([8fee564](https://github.com/web3-storage/web3.storage/commit/8fee56448bc5557264f85ef6cc68b3df641b4596))

## [2.35.4](https://github.com/web3-storage/web3.storage/compare/website-v2.35.3...website-v2.35.4) (2023-03-16)


### Bug Fixes

* w3link rate limit in docs ([#2250](https://github.com/web3-storage/web3.storage/issues/2250)) ([ef67051](https://github.com/web3-storage/web3.storage/commit/ef6705191a51a48b7b056e9c0fc06e3733787121))

## [2.35.3](https://github.com/web3-storage/web3.storage/compare/website-v2.35.2...website-v2.35.3) (2023-03-13)


### Bug Fixes

* clarify docs when status is pinning ([#2242](https://github.com/web3-storage/web3.storage/issues/2242)) ([04ff58a](https://github.com/web3-storage/web3.storage/commit/04ff58ac0a488360926f9c9e8c31184c53da4d1d))
* fix app failure when clicking 'Account +' on mobile ([#2240](https://github.com/web3-storage/web3.storage/issues/2240)) ([34e64ea](https://github.com/web3-storage/web3.storage/commit/34e64ea1135915ebdfe9951689756c273c64eabf)), closes [#2223](https://github.com/web3-storage/web3.storage/issues/2223)

## [2.35.2](https://github.com/web3-storage/web3.storage/compare/website-v2.35.1...website-v2.35.2) (2023-03-07)


### Bug Fixes

* apply workaround to Simple Analytics blocking navigation to /docs ([#2238](https://github.com/web3-storage/web3.storage/issues/2238)) ([29ab7fa](https://github.com/web3-storage/web3.storage/commit/29ab7fa86f98e1334599e3158f51bbb43eaa13f9)), closes [#2237](https://github.com/web3-storage/web3.storage/issues/2237)

## [2.35.1](https://github.com/web3-storage/web3.storage/compare/website-v2.35.0...website-v2.35.1) (2023-02-23)


### Bug Fixes

* display those with no subscription as Free Tier users ([#2221](https://github.com/web3-storage/web3.storage/issues/2221)) ([81081bd](https://github.com/web3-storage/web3.storage/commit/81081bd6760b5277a9f194f468ce5abd9e255f84))
* PSA language emphasizing not for production ([#2209](https://github.com/web3-storage/web3.storage/issues/2209)) ([6f06ca7](https://github.com/web3-storage/web3.storage/commit/6f06ca7dd87737ba08ae2c6bcc619f0951b2545c))
* remove '/mo' from free tier description ([#2203](https://github.com/web3-storage/web3.storage/issues/2203)) ([769fd67](https://github.com/web3-storage/web3.storage/commit/769fd6770a54d2aa826b6cd4a8cec1f2ac384ce3)), closes [#2173](https://github.com/web3-storage/web3.storage/issues/2173)
* update price displayed in UI to reflect advertised price ([#2207](https://github.com/web3-storage/web3.storage/issues/2207)) ([da1b1d8](https://github.com/web3-storage/web3.storage/commit/da1b1d832b583bf04a53f77c3b5e1aaa110ba865))

## [2.35.0](https://github.com/web3-storage/web3.storage/compare/website-v2.34.0...website-v2.35.0) (2023-01-13)


### Features

* allow displaying of custom stripe prices ([#2152](https://github.com/web3-storage/web3.storage/issues/2152)) ([e3011be](https://github.com/web3-storage/web3.storage/commit/e3011bee166f762cefae40240be8ab46476aee33))


### Bug Fixes

* make pinning API request form more general ([#2146](https://github.com/web3-storage/web3.storage/issues/2146)) ([4f12057](https://github.com/web3-storage/web3.storage/commit/4f12057cdddf48dfa61cdb74e910b1e448722d47))
* more precise language in SLA ([#2149](https://github.com/web3-storage/web3.storage/issues/2149)) ([b61060e](https://github.com/web3-storage/web3.storage/commit/b61060e4abc5e66c610345abc256ff6b82234dfe))

## [2.34.0](https://github.com/web3-storage/web3.storage/compare/website-v2.33.1...website-v2.34.0) (2023-01-02)


### Features

* add synchronized, persistent tab groups ([#2172](https://github.com/web3-storage/web3.storage/issues/2172)) ([3be2028](https://github.com/web3-storage/web3.storage/commit/3be2028b2e01dfcc1007babe3b4bda7bb454595a))
* website has /.well-known/did.json so did:web can resolve in prod ([#2169](https://github.com/web3-storage/web3.storage/issues/2169)) ([3ed273d](https://github.com/web3-storage/web3.storage/commit/3ed273d75d6ebd7f733cbcb4c818d5775eca073f))


### Bug Fixes

* website typo on protocol descrptions ([#2166](https://github.com/web3-storage/web3.storage/issues/2166)) ([89ff4e1](https://github.com/web3-storage/web3.storage/commit/89ff4e1c2029563cbe855ffa814c0d110e844a10))

## [2.33.1](https://github.com/web3-storage/web3.storage/compare/website-v2.33.0...website-v2.33.1) (2022-12-14)


### Bug Fixes

* bump 'playwright' version & fix intermittent e2e test failure ([#2151](https://github.com/web3-storage/web3.storage/issues/2151)) ([dc529f5](https://github.com/web3-storage/web3.storage/commit/dc529f5035fdc525420d9dbdf28ee8d0ac7fee55))
* update docs for PSA with IPLD codec info ([#2160](https://github.com/web3-storage/web3.storage/issues/2160)) ([e95e434](https://github.com/web3-storage/web3.storage/commit/e95e434264c4435fbb8f3640f042c76b71a123f1))

## [2.33.0](https://github.com/web3-storage/web3.storage/compare/website-v2.32.0...website-v2.33.0) (2022-12-01)


### Features

* add tooltip to dashboard storage totals ([#2101](https://github.com/web3-storage/web3.storage/issues/2101)) ([2056ec6](https://github.com/web3-storage/web3.storage/commit/2056ec6fd692949f112b7b37d48d4da9d6a34523)), closes [#2081](https://github.com/web3-storage/web3.storage/issues/2081)
* list and ability to delete psa request created though deleted tokens ([#2054](https://github.com/web3-storage/web3.storage/issues/2054)) ([e150d1f](https://github.com/web3-storage/web3.storage/commit/e150d1fa86dc0e6600f159fa92ccb7c8e65900e3))
* simple analytics ([#2110](https://github.com/web3-storage/web3.storage/issues/2110)) ([4d5a1a0](https://github.com/web3-storage/web3.storage/commit/4d5a1a0e07db3c6749efed0072ab5b4c2fcb828e))


### Bug Fixes

* styles missing from custom storage form ([#2135](https://github.com/web3-storage/web3.storage/issues/2135)) ([04b66bc](https://github.com/web3-storage/web3.storage/commit/04b66bc27826aab4b10cc9c9b487126ccc7375b0))

## [2.32.0](https://github.com/web3-storage/web3.storage/compare/website-v2.31.0...website-v2.32.0) (2022-11-11)


### Features

* add twitter logo to contact page [#2068](https://github.com/web3-storage/web3.storage/issues/2068) ([#2078](https://github.com/web3-storage/web3.storage/issues/2078)) ([179a844](https://github.com/web3-storage/web3.storage/commit/179a8443663e6d9e23acccb0269ae8b454cd8888))
* **docs:** remove decentralized storage concept doc ([#2102](https://github.com/web3-storage/web3.storage/issues/2102)) ([f65c82e](https://github.com/web3-storage/web3.storage/commit/f65c82e7dddec58c2ea35d171b8894f0dafe3cf4))


### Bug Fixes

* align links when stacking mobile ([#2088](https://github.com/web3-storage/web3.storage/issues/2088)) ([3bedf2d](https://github.com/web3-storage/web3.storage/commit/3bedf2d584195a90912574cbcde1b69ea5e50220))
* do not render account blocked modal unless account restricted ([#2089](https://github.com/web3-storage/web3.storage/issues/2089)) ([1025a22](https://github.com/web3-storage/web3.storage/commit/1025a223c9c3605447329a57a9bd1bca90d2569e))
* incorrect class use ([#2094](https://github.com/web3-storage/web3.storage/issues/2094)) ([6919cb0](https://github.com/web3-storage/web3.storage/commit/6919cb09b335c7f757034f79235453e76c58ae77))
* remove web apps footer link ([#2087](https://github.com/web3-storage/web3.storage/issues/2087)) ([a8c16a8](https://github.com/web3-storage/web3.storage/commit/a8c16a8f694567832a08d13009d0c8c8aedf79fe))
* rm staging url in PSA docs ([#2037](https://github.com/web3-storage/web3.storage/issues/2037)) ([2dcc4dc](https://github.com/web3-storage/web3.storage/commit/2dcc4dcb988b606c7a9d62a9a22ddb3b3b1dce7f))
* typo in w3name product page ([#2098](https://github.com/web3-storage/web3.storage/issues/2098)) ([9b50cc9](https://github.com/web3-storage/web3.storage/commit/9b50cc98425f67f79a8edd857fde93a02c6a64dc))
* update product pages to have appropriate descriptions and titles ([#2085](https://github.com/web3-storage/web3.storage/issues/2085)) ([ae6ed12](https://github.com/web3-storage/web3.storage/commit/ae6ed12ced91718d6c60aa6fef709b1dbe371b64))

## [2.31.0](https://github.com/web3-storage/web3.storage/compare/website-v2.30.0...website-v2.31.0) (2022-10-23)


### Features

* AddPaymentMethodForm shows a more end-user-friendly error message when it encounters an error ([#2058](https://github.com/web3-storage/web3.storage/issues/2058)) ([376e05b](https://github.com/web3-storage/web3.storage/commit/376e05ba48cf0cd626e189419ae981864be8e05d))
* log terms of service acceptance ([#2028](https://github.com/web3-storage/web3.storage/issues/2028)) ([47c3540](https://github.com/web3-storage/web3.storage/commit/47c35400ae97e45d07d55e723355f139376233e6))


### Bug Fixes

* clarity on web3.storage PSA ([#2062](https://github.com/web3-storage/web3.storage/issues/2062)) ([62dadb1](https://github.com/web3-storage/web3.storage/commit/62dadb1fe181bb317c3dfc400084eb218d23273f))
* properly center align the loading icon within login/logout button ([#2043](https://github.com/web3-storage/web3.storage/issues/2043)) ([4fa8ec3](https://github.com/web3-storage/web3.storage/commit/4fa8ec35ad44691aaf608406676f23b0aa9cacb1))

## [2.30.0](https://github.com/web3-storage/web3.storage/compare/website-v2.29.0...website-v2.30.0) (2022-10-19)


### Features

* terms update ([#2052](https://github.com/web3-storage/web3.storage/issues/2052)) ([366f726](https://github.com/web3-storage/web3.storage/commit/366f72670c377c2ecc9c18fc865c3edce7014477))


### Bug Fixes

* update tier values ([#2026](https://github.com/web3-storage/web3.storage/issues/2026)) ([aacb1d7](https://github.com/web3-storage/web3.storage/commit/aacb1d75727f4a21eefa84f8a535c6d0a5578230))

## [2.29.0](https://github.com/web3-storage/web3.storage/compare/website-v2.28.0...website-v2.29.0) (2022-10-18)


### Features

* enterprise let's chat form ([#2034](https://github.com/web3-storage/web3.storage/issues/2034)) ([ec2bb57](https://github.com/web3-storage/web3.storage/commit/ec2bb5743644e93cc7b30c2b7c3a0d6ea3d0989f))
* show tier modal on account page after logging in ([#2048](https://github.com/web3-storage/web3.storage/issues/2048)) ([1204561](https://github.com/web3-storage/web3.storage/commit/12045617cb021eb38ec855460592bc7791456cac))

## [2.28.0](https://github.com/web3-storage/web3.storage/compare/website-v2.27.0...website-v2.28.0) (2022-10-18)


### Features

* add css only logo carousel ([#2022](https://github.com/web3-storage/web3.storage/issues/2022)) ([5d96ddc](https://github.com/web3-storage/web3.storage/commit/5d96ddcdbabde80f0a1d56ef4db3d2ed1719d95b))
* update testimonials ([#2032](https://github.com/web3-storage/web3.storage/issues/2032)) ([c8d9299](https://github.com/web3-storage/web3.storage/commit/c8d9299f8e47388cba0cdc033bb9c8a636716330))
* website link component defaults target to _blank when the href is external ([#2038](https://github.com/web3-storage/web3.storage/issues/2038)) ([947e764](https://github.com/web3-storage/web3.storage/commit/947e764a21e4d845b6b606ee4f7a47429c056658))

## [2.27.0](https://github.com/web3-storage/web3.storage/compare/website-v2.26.0...website-v2.27.0) (2022-10-17)


### Features

* status docs ([#1937](https://github.com/web3-storage/web3.storage/issues/1937)) ([5fde787](https://github.com/web3-storage/web3.storage/commit/5fde78773c9696fe1e9140d9f967f491bb5d3158))


### Bug Fixes

* no more request storage in docs ([#2029](https://github.com/web3-storage/web3.storage/issues/2029)) ([59715d9](https://github.com/web3-storage/web3.storage/commit/59715d94b273921b2161c57e527aeddcd6622365))
* upload and pin table refactor ([#2018](https://github.com/web3-storage/web3.storage/issues/2018)) ([cbfe9d7](https://github.com/web3-storage/web3.storage/commit/cbfe9d70dbd6ce4ac9e70692160feeec5d2713e2))

## [2.26.0](https://github.com/web3-storage/web3.storage/compare/website-v2.25.0...website-v2.26.0) (2022-10-13)


### Features

* tie in currentPlan into storage useage meter ([#2015](https://github.com/web3-storage/web3.storage/issues/2015)) ([a4ad62e](https://github.com/web3-storage/web3.storage/commit/a4ad62eff437373b4113d7f1645fc4e762f71380))


### Bug Fixes

* login redirect should preserve query parameters ([#2012](https://github.com/web3-storage/web3.storage/issues/2012)) ([477cf73](https://github.com/web3-storage/web3.storage/commit/477cf73def3850c5ce7b38d63725b516497e10f4))
* missing prop for cc form in confirm modal ([#2007](https://github.com/web3-storage/web3.storage/issues/2007)) ([6b6ee15](https://github.com/web3-storage/web3.storage/commit/6b6ee151601bf2e5743b68b6f18be38c9e5f075a))

## [2.25.0](https://github.com/web3-storage/web3.storage/compare/website-v2.24.2...website-v2.25.0) (2022-10-10)


### Features

* add link to blog post ([#1994](https://github.com/web3-storage/web3.storage/issues/1994)) ([2204ad5](https://github.com/web3-storage/web3.storage/commit/2204ad5fca06d92a7506524a5375df2210818cd6))

## [2.24.2](https://github.com/web3-storage/web3.storage/compare/website-v2.24.1...website-v2.24.2) (2022-10-07)


### Bug Fixes

* "get started" only partially clickable ([#1996](https://github.com/web3-storage/web3.storage/issues/1996)) ([1416a97](https://github.com/web3-storage/web3.storage/commit/1416a9763dfdbcd5bcd1f48e03763a215d0ff514))
* pointer-events: none the swoosh ([#2001](https://github.com/web3-storage/web3.storage/issues/2001)) ([6079070](https://github.com/web3-storage/web3.storage/commit/6079070d0ff68dc58b73ca7f81dc320b201c6aef))
* remove background squiggle ([#1997](https://github.com/web3-storage/web3.storage/issues/1997)) ([e539ac8](https://github.com/web3-storage/web3.storage/commit/e539ac85fe27f84bbeba0639876c100cb0ec81b2))

## [2.24.1](https://github.com/web3-storage/web3.storage/compare/website-v2.24.0...website-v2.24.1) (2022-10-07)


### Bug Fixes

* add terms for w3link usage ([#2013](https://github.com/web3-storage/web3.storage/issues/2013)) ([d4df533](https://github.com/web3-storage/web3.storage/commit/d4df5335c49afaef5675e406a091a031f59417a3))

## [2.24.0](https://github.com/web3-storage/web3.storage/compare/website-v2.23.0...website-v2.24.0) (2022-10-06)


### Features

* consistent casing ([#1995](https://github.com/web3-storage/web3.storage/issues/1995)) ([48946b6](https://github.com/web3-storage/web3.storage/commit/48946b621200a974d36ed4e6a57acbb18284233d))

## [2.23.0](https://github.com/web3-storage/web3.storage/compare/website-v2.22.2...website-v2.23.0) (2022-10-05)


### Features

* **website:** update API token howto to match current design ([#2000](https://github.com/web3-storage/web3.storage/issues/2000)) ([0374ac5](https://github.com/web3-storage/web3.storage/commit/0374ac53131166f8ceec521ef6c50c75fafdaba7)), closes [#1999](https://github.com/web3-storage/web3.storage/issues/1999)


### Bug Fixes

* add 'Complete' column to uploads table ([#1958](https://github.com/web3-storage/web3.storage/issues/1958)) ([0d463fb](https://github.com/web3-storage/web3.storage/commit/0d463fbc15316fa7efe57378946be6eb4f15acdf)), closes [#1787](https://github.com/web3-storage/web3.storage/issues/1787)
* display proper breadcrumbs for product pages ([#1973](https://github.com/web3-storage/web3.storage/issues/1973)) ([2d58763](https://github.com/web3-storage/web3.storage/commit/2d587630edbb22537fbb3a1ccd29968db7172f97)), closes [#1926](https://github.com/web3-storage/web3.storage/issues/1926)
* fix social media preview image URLs ([#1993](https://github.com/web3-storage/web3.storage/issues/1993)) ([4d14c1e](https://github.com/web3-storage/web3.storage/commit/4d14c1eb997a4508fe29782630bf64133a74144c))

## [2.22.2](https://github.com/web3-storage/web3.storage/compare/website-v2.22.1...website-v2.22.2) (2022-10-03)


### Bug Fixes

* fix bug when saving payment method while paymentSettings.storage.subscription=null ([#1988](https://github.com/web3-storage/web3.storage/issues/1988)) ([b389146](https://github.com/web3-storage/web3.storage/commit/b389146b3a96ba8b8e2b1a81ebc3cec1776583c2))

## [2.22.1](https://github.com/web3-storage/web3.storage/compare/website-v2.22.0...website-v2.22.1) (2022-09-30)


### Bug Fixes

* remove storage economics page ([#1977](https://github.com/web3-storage/web3.storage/issues/1977)) ([50c5eb4](https://github.com/web3-storage/web3.storage/commit/50c5eb47bca55d3917f954650d61ee2bff459bb3))
* yank out faulty browser detection script ([#1974](https://github.com/web3-storage/web3.storage/issues/1974)) ([38aefeb](https://github.com/web3-storage/web3.storage/commit/38aefebec8c3ea053a41af1f8dfdd0895ceb9260))

## [2.22.0](https://github.com/web3-storage/web3.storage/compare/website-v2.21.2...website-v2.22.0) (2022-09-29)


### Features

* /account/login?redirect_to=/final/url should redirect to /final/url after authn ([#1950](https://github.com/web3-storage/web3.storage/issues/1950)) ([2bbe6de](https://github.com/web3-storage/web3.storage/commit/2bbe6defaca22663437b9ce28ef8cd5529d5facb))
* create page for service level agreement ([#1955](https://github.com/web3-storage/web3.storage/issues/1955)) ([6525845](https://github.com/web3-storage/web3.storage/commit/6525845bea1b79bb12870698b1f9f2c135f57109))
* early adopter UI ([#1959](https://github.com/web3-storage/web3.storage/issues/1959)) ([1affae3](https://github.com/web3-storage/web3.storage/commit/1affae30271ba7a5bd6e2727922441680b9f291c))
* homepage (index) copy for pricing changes ([#1942](https://github.com/web3-storage/web3.storage/issues/1942)) ([f2084a3](https://github.com/web3-storage/web3.storage/commit/f2084a375e7fc4034db7bd5fae194d3b597d89c8))
* new users are initialized into free tier ([#1945](https://github.com/web3-storage/web3.storage/issues/1945)) ([ee67c35](https://github.com/web3-storage/web3.storage/commit/ee67c35c6b12a363140b79ea34835123ad76420c))
* pricing page (for tiered pricing) ([#1894](https://github.com/web3-storage/web3.storage/issues/1894)) ([3f0db86](https://github.com/web3-storage/web3.storage/commit/3f0db86be270000f37c1d9b8ce49be70a90c8dfc))
* revert "fix: rm menu item from global account menu" ([#1951](https://github.com/web3-storage/web3.storage/issues/1951)) ([2f84754](https://github.com/web3-storage/web3.storage/commit/2f84754a5e6deb72700f803eeae66aa079e4272a))
* update preview summary metadata ([#1965](https://github.com/web3-storage/web3.storage/issues/1965)) ([a47949c](https://github.com/web3-storage/web3.storage/commit/a47949c10b4317902ed3cea3ad0cd177d33bdab0))
* update terms of service ([#1964](https://github.com/web3-storage/web3.storage/issues/1964)) ([dd810b9](https://github.com/web3-storage/web3.storage/commit/dd810b93f752c987e3f1785ae0745e8154099bed))
* update the web3storage product page (for tiered pricing) ([#1957](https://github.com/web3-storage/web3.storage/issues/1957)) ([03a6422](https://github.com/web3-storage/web3.storage/commit/03a642283d56e580436ff853bc2b3971a24875e1))

## [2.21.2](https://github.com/web3-storage/web3.storage/compare/website-v2.21.1...website-v2.21.2) (2022-09-28)


### Bug Fixes

* add blog link with navigation fix ([#1960](https://github.com/web3-storage/web3.storage/issues/1960)) ([efaed67](https://github.com/web3-storage/web3.storage/commit/efaed6746b44cdbba4dbc0729f56a85858bfea70))

## [2.21.1](https://github.com/web3-storage/web3.storage/compare/website-v2.21.0...website-v2.21.1) (2022-09-27)


### Bug Fixes

* change verbiage on file manager legend ([#1893](https://github.com/web3-storage/web3.storage/issues/1893)) ([ab85aa2](https://github.com/web3-storage/web3.storage/commit/ab85aa246ccb65afb76d1b0c25605aa890258451)), closes [#1768](https://github.com/web3-storage/web3.storage/issues/1768)
* revert "feat: add blog link ([#1952](https://github.com/web3-storage/web3.storage/issues/1952))" ([#1956](https://github.com/web3-storage/web3.storage/issues/1956)) ([481dcf0](https://github.com/web3-storage/web3.storage/commit/481dcf04cecee1b226f9da4a9c18d7ff323c745d))

## [2.21.0](https://github.com/web3-storage/web3.storage/compare/website-v2.20.2...website-v2.21.0) (2022-09-26)


### Features

* add blog link ([#1952](https://github.com/web3-storage/web3.storage/issues/1952)) ([1289ac1](https://github.com/web3-storage/web3.storage/commit/1289ac1921fe832b81d0dfa9e464b19ea8969481))
* add TOS agree before confirm ([#1919](https://github.com/web3-storage/web3.storage/issues/1919)) ([aacde20](https://github.com/web3-storage/web3.storage/commit/aacde202439ff5102bd89fabbaf48711bbc2f50b))
* remove nft.storage banner ([#1940](https://github.com/web3-storage/web3.storage/issues/1940)) ([edceaa3](https://github.com/web3-storage/web3.storage/commit/edceaa35f03c83a7aa1f4ee3d9ec8ef34a862be9))

## [2.20.2](https://github.com/web3-storage/web3.storage/compare/website-v2.20.1...website-v2.20.2) (2022-09-22)


### Other Changes

* rm unnecessary comment in packages/website to trigger release-please … ([#1932](https://github.com/web3-storage/web3.storage/issues/1932)) ([39969c2](https://github.com/web3-storage/web3.storage/commit/39969c27d4ba7b4b47069623dba670fd9470c952))

## [2.20.1](https://github.com/web3-storage/web3.storage/compare/website-v2.20.0...website-v2.20.1) (2022-09-21)


### Bug Fixes

* rm menu item from global account menu ([#1916](https://github.com/web3-storage/web3.storage/issues/1916)) ([29fef57](https://github.com/web3-storage/web3.storage/commit/29fef57896c0772d4b3457a3cdb70bf05dfda42a))

## [2.20.0](https://github.com/web3-storage/web3.storage/compare/website-v2.19.1...website-v2.20.0) (2022-09-21)


### Features

* I can choose a storage pricing tier (issue 1869) ([#1878](https://github.com/web3-storage/web3.storage/issues/1878)) ([58de180](https://github.com/web3-storage/web3.storage/commit/58de180300e72f7a79193657a7d995f0799bae28))


### Bug Fixes

* bugs saving credit card at /account/payment for the first time ([#1913](https://github.com/web3-storage/web3.storage/issues/1913)) ([724e3ab](https://github.com/web3-storage/web3.storage/commit/724e3abba4053dc18189942f84de81f0d6cdb083))
* make browser update versions absolute ([#1887](https://github.com/web3-storage/web3.storage/issues/1887)) ([bca96fa](https://github.com/web3-storage/web3.storage/commit/bca96faaa2e9853d3e39ece54725edaed680139d))


### Other Changes

* **docs:** add curl CAR upload example to store howto ([#1735](https://github.com/web3-storage/web3.storage/issues/1735)) ([54e31d9](https://github.com/web3-storage/web3.storage/commit/54e31d9b76dcb85888a3a082384afe43c30f5159))

## [2.19.1](https://github.com/web3-storage/web3.storage/compare/website-v2.19.0...website-v2.19.1) (2022-09-09)


### Bug Fixes

* make website e2e tests more reliable on ci ([#1873](https://github.com/web3-storage/web3.storage/issues/1873)) ([a31ef04](https://github.com/web3-storage/web3.storage/commit/a31ef048575e944db2558e3ec26bfb3d28818e99))

## [2.19.0](https://github.com/web3-storage/web3.storage/compare/website-v2.18.1...website-v2.19.0) (2022-09-09)


### Features

* add w3name http api swagger doc page ([#1727](https://github.com/web3-storage/web3.storage/issues/1727)) ([2a03748](https://github.com/web3-storage/web3.storage/commit/2a03748d70e4e8aa0764fec0538c26dbf84ae6e6))
* issues/1779 - I can save my payment settings ([#1852](https://github.com/web3-storage/web3.storage/issues/1852)) ([a49e780](https://github.com/web3-storage/web3.storage/commit/a49e780a4c7c0a3680aa03239552b01f1fcf72ed))

## [2.18.1](https://github.com/web3-storage/web3.storage/compare/website-v2.18.0...website-v2.18.1) (2022-09-08)


### Bug Fixes

* add a `/user/uploads/:cid` endpoint. ([#1530](https://github.com/web3-storage/web3.storage/issues/1530)) ([99654bc](https://github.com/web3-storage/web3.storage/commit/99654bcc668db016710a91e07901cd40b9a9995a))

## [2.18.0](https://github.com/web3-storage/web3.storage/compare/website-v2.17.1...website-v2.18.0) (2022-09-07)


### Features

* reusable and accessible table component ([#1700](https://github.com/web3-storage/web3.storage/issues/1700)) ([a4643a0](https://github.com/web3-storage/web3.storage/commit/a4643a09f15aef465bda50836c311e06de9f2471))

## [2.17.1](https://github.com/web3-storage/web3.storage/compare/website-v2.17.0...website-v2.17.1) (2022-09-02)


### Bug Fixes

* prevent tabnabbing and clickjacking ([#1826](https://github.com/web3-storage/web3.storage/issues/1826)) ([7c63d83](https://github.com/web3-storage/web3.storage/commit/7c63d83fdd161705389f8b011af162fbdc2f1351))
* remove helix image that clashes with 'products' nav item ([#1825](https://github.com/web3-storage/web3.storage/issues/1825)) ([a90a264](https://github.com/web3-storage/web3.storage/commit/a90a264a8e0f23571261243bfb170134b10cd3d2))
* update storage column header verbiage ([#1824](https://github.com/web3-storage/web3.storage/issues/1824)) ([5494d9d](https://github.com/web3-storage/web3.storage/commit/5494d9d0ecf0727adc5227d12286408971a76a31))

## [2.17.0](https://github.com/web3-storage/web3.storage/compare/website-v2.16.0...website-v2.17.0) (2022-08-31)


### Features

* account payments UI start ([#1767](https://github.com/web3-storage/web3.storage/issues/1767)) ([38f0088](https://github.com/web3-storage/web3.storage/commit/38f00887df1e22ddef7c76c51e9c68883ad80895))
* e2e test website accountPayment loggedIn, includes magic.link testMode support in test-e2e job only ([#1754](https://github.com/web3-storage/web3.storage/issues/1754)) ([6d6f92c](https://github.com/web3-storage/web3.storage/commit/6d6f92cb10552c149ebd1fcaedb2295cb661192c))


### Bug Fixes

* upload list pagination headers ([#1739](https://github.com/web3-storage/web3.storage/issues/1739)) ([2ffe6d7](https://github.com/web3-storage/web3.storage/commit/2ffe6d749628095a93d957836c6b4e8ad3b6acf9))
* website lint script now lints its 'lib' directory after it was previously eslintignored ([#1770](https://github.com/web3-storage/web3.storage/issues/1770)) ([78f0c71](https://github.com/web3-storage/web3.storage/commit/78f0c71f89b231f23e95e827caf7fce522df7f63))


### Other Changes

* add note about client.get reliability to retrieval doc ([#1812](https://github.com/web3-storage/web3.storage/issues/1812)) ([b23cee1](https://github.com/web3-storage/web3.storage/commit/b23cee1609abc631d2d1136a36d3e9e5e7e6a830))
* point users to w3link ([#1814](https://github.com/web3-storage/web3.storage/issues/1814)) ([285b76e](https://github.com/web3-storage/web3.storage/commit/285b76e2b2b42625818700eba253489bd34e0e55))

## [2.16.0](https://github.com/web3-storage/web3.storage/compare/website-v2.15.0...website-v2.16.0) (2022-08-17)


### Features

* **@web3-storage/website:** add /account/payment page in website ([#1744](https://github.com/web3-storage/web3.storage/issues/1744)) ([5410378](https://github.com/web3-storage/web3.storage/commit/54103786a927711b686cced7569356f3e2d07b84))
* remove status column from uploads table ([#1761](https://github.com/web3-storage/web3.storage/issues/1761)) ([4db3acc](https://github.com/web3-storage/web3.storage/commit/4db3acccc2d1512b410c79266077b34799a85df5))
* update pinning api access tooltip copy ([#1726](https://github.com/web3-storage/web3.storage/issues/1726)) ([a9d2798](https://github.com/web3-storage/web3.storage/commit/a9d27986472d72d043d3c7dfb4204395e92f0137))


### Bug Fixes

* remove incorrect 'last updated on' text ([#1717](https://github.com/web3-storage/web3.storage/issues/1717)) ([3e29e92](https://github.com/web3-storage/web3.storage/commit/3e29e92a6c67868d3ed64998ab96f9c574f2527a))
* update verbiage on the help and support docs page ([#1720](https://github.com/web3-storage/web3.storage/issues/1720)) ([0da2b57](https://github.com/web3-storage/web3.storage/commit/0da2b57e35a7edab281376986c0588e960b2e9be))

## [2.15.0](https://github.com/web3-storage/web3.storage/compare/website-v2.14.0...website-v2.15.0) (2022-08-16)


### Features

* add gateway dropdown to uploads list ([#1740](https://github.com/web3-storage/web3.storage/issues/1740)) ([01e3339](https://github.com/web3-storage/web3.storage/commit/01e33399987de8d1540a037b078b5bfaf7af7dd9))

## [2.14.0](https://github.com/web3-storage/web3.storage/compare/website-v2.13.0...website-v2.14.0) (2022-08-15)


### Features

* add w3s.link url on files table ([#1729](https://github.com/web3-storage/web3.storage/issues/1729)) ([50dd4e5](https://github.com/web3-storage/web3.storage/commit/50dd4e59d472bfdba8d3411ace7b631e3d1b2414))
* create w3link page ([#1728](https://github.com/web3-storage/web3.storage/issues/1728)) ([25f58f9](https://github.com/web3-storage/web3.storage/commit/25f58f9b96e874653471ad327b10aaca2602a774))
* w3link docs ([#1736](https://github.com/web3-storage/web3.storage/issues/1736)) ([8539ae5](https://github.com/web3-storage/web3.storage/commit/8539ae5c3833c0c9670e24f9ed027dfbfea53403))

## [2.13.0](https://github.com/web3-storage/web3.storage/compare/website-v2.12.1...website-v2.13.0) (2022-08-05)


### Features

* create w3name landing page, rework nav to reflec update ([#1607](https://github.com/web3-storage/web3.storage/issues/1607)) ([e9b0d78](https://github.com/web3-storage/web3.storage/commit/e9b0d780b10b565dbfe3cdc1db50ae19d7c49a49))
* **website/docs:** add draft of w3name how-to ([#1694](https://github.com/web3-storage/web3.storage/issues/1694)) ([9cd4f2c](https://github.com/web3-storage/web3.storage/commit/9cd4f2c0d33e2760b4b68f6c3d5e63a017a2d7d3))


### Bug Fixes

* add ipns migration cron job ([#1705](https://github.com/web3-storage/web3.storage/issues/1705)) ([4b6e67f](https://github.com/web3-storage/web3.storage/commit/4b6e67f07983b06e9bad9c27deb5d6c5b993258e))
* footer 404s ([#1693](https://github.com/web3-storage/web3.storage/issues/1693)) ([32cb036](https://github.com/web3-storage/web3.storage/commit/32cb03693148d8856eb011869002cc8bf5214f1e))

## [2.12.1](https://github.com/web3-storage/web3.storage/compare/website-v2.12.0...website-v2.12.1) (2022-07-29)


### Bug Fixes

* overlap on token creator and a few mobile issues ([#1658](https://github.com/web3-storage/web3.storage/issues/1658)) ([945a2f7](https://github.com/web3-storage/web3.storage/commit/945a2f76a67a2d2e5c757348b44ddd70fe529970))
* update user req modals to match site ([#1664](https://github.com/web3-storage/web3.storage/issues/1664)) ([1e6c19b](https://github.com/web3-storage/web3.storage/commit/1e6c19bbcffaa7290a78709e726cec135726ba30))

## [2.12.0](https://github.com/web3-storage/web3.storage/compare/website-v2.11.0...website-v2.12.0) (2022-07-25)


### Features

* add a section explaining how to request more storage space ([#1672](https://github.com/web3-storage/web3.storage/issues/1672)) ([88cf588](https://github.com/web3-storage/web3.storage/commit/88cf58823bc6d95da8a3f49594785a8bb06d6546))
* add error tooltips to file uploader ([#1665](https://github.com/web3-storage/web3.storage/issues/1665)) ([7275531](https://github.com/web3-storage/web3.storage/commit/72755317758fb9c7975293675225e58f9617820f))


### Bug Fixes

* properly direct user to /tokens instead of /account for token creation ([#1671](https://github.com/web3-storage/web3.storage/issues/1671)) ([a6eaed3](https://github.com/web3-storage/web3.storage/commit/a6eaed326f31018d47a81d136ed7c0d60bb65d52))
* properly scroll to section when navigating to docs with a hash fragment ([#1673](https://github.com/web3-storage/web3.storage/issues/1673)) ([85fd2dc](https://github.com/web3-storage/web3.storage/commit/85fd2dc0af41b982e1a0e08eaff55d8adfa46b86))
* show only a single selected nav item at a time ([#1669](https://github.com/web3-storage/web3.storage/issues/1669)) ([c445008](https://github.com/web3-storage/web3.storage/commit/c44500884403b7334789fa04ccb858d27b583d51))

## [2.11.0](https://github.com/web3-storage/web3.storage/compare/website-v2.10.1...website-v2.11.0) (2022-07-21)


### Features

* contact ([#1637](https://github.com/web3-storage/web3.storage/issues/1637)) ([8599408](https://github.com/web3-storage/web3.storage/commit/85994082778c3907368a8cbd386d4d7b47426db8))


### Bug Fixes

* **docs:** fix upload percent calculation in example ([#1652](https://github.com/web3-storage/web3.storage/issues/1652)) ([1173580](https://github.com/web3-storage/web3.storage/commit/11735808d96aa3508bfa265c900271a379da10f0))
* links to slack and discord ([#1668](https://github.com/web3-storage/web3.storage/issues/1668)) ([49259b2](https://github.com/web3-storage/web3.storage/commit/49259b24c49ed7859cd826d6421783f061e70f0e))
* terms of service ([#1666](https://github.com/web3-storage/web3.storage/issues/1666)) ([dcee174](https://github.com/web3-storage/web3.storage/commit/dcee1743e8545f11d97788e8caa0a744ca99e878))

## [2.10.1](https://github.com/web3-storage/web3.storage/compare/website-v2.10.0...website-v2.10.1) (2022-07-11)


### Bug Fixes

* broken inter-doc links ([#1538](https://github.com/web3-storage/web3.storage/issues/1538)) ([45e715f](https://github.com/web3-storage/web3.storage/commit/45e715f36812d62dff3a98e6a3fab5a6839fb403))

## [2.10.0](https://github.com/web3-storage/web3.storage/compare/website-v2.9.0...website-v2.10.0) (2022-07-08)


### Features

* copy change to pricing ([#1630](https://github.com/web3-storage/web3.storage/issues/1630)) ([78e72c2](https://github.com/web3-storage/web3.storage/commit/78e72c28eba6a05ec5bfa98b78724ba1676afbfb))

## [2.9.0](https://github.com/web3-storage/web3.storage/compare/website-v2.8.4...website-v2.9.0) (2022-07-03)


### Features

* add cloudflare img component ([#1361](https://github.com/web3-storage/web3.storage/issues/1361)) ([1477646](https://github.com/web3-storage/web3.storage/commit/14776460e3436cb24e6d3f77c66501373668ef62))
* Docs polish ([#1444](https://github.com/web3-storage/web3.storage/issues/1444)) ([d952b61](https://github.com/web3-storage/web3.storage/commit/d952b613bf0c7c5c77b69e8e3d781650ee5683b6))


### Bug Fixes

* add pagination to user/uploads endpoint ([#1408](https://github.com/web3-storage/web3.storage/issues/1408)) ([3e0a14f](https://github.com/web3-storage/web3.storage/commit/3e0a14fc8407ae549d19ba8b48ddab23bd2a5141))
* aligns hero text to center of grid background ([#1590](https://github.com/web3-storage/web3.storage/issues/1590)) ([05415a8](https://github.com/web3-storage/web3.storage/commit/05415a8168aac21a53c7c827f85bbc2f0b148196))
* don't prompt free ([#1598](https://github.com/web3-storage/web3.storage/issues/1598)) ([9969027](https://github.com/web3-storage/web3.storage/commit/996902754ac51f628e4570855d7b3a0da7bb9e2f))
* no page reload when pointing to relative path in docs ([#1559](https://github.com/web3-storage/web3.storage/issues/1559)) ([78bb7e5](https://github.com/web3-storage/web3.storage/commit/78bb7e562ae58d2bfd695e607dd359b8df36f861))


### Other Changes

* update husky package for web ([#1355](https://github.com/web3-storage/web3.storage/issues/1355)) ([913be2c](https://github.com/web3-storage/web3.storage/commit/913be2c931f8fdd04a78d42a41419cd6260e8c10))

## [2.8.4](https://github.com/web3-storage/web3.storage/compare/website-v2.8.3...website-v2.8.4) (2022-06-24)


### Bug Fixes

* allow delete file modal to close on error ([#1542](https://github.com/web3-storage/web3.storage/issues/1542)) ([8dd4174](https://github.com/web3-storage/web3.storage/commit/8dd417486c3a03f9ed2ea5890059aa542fdc11c9))
* stop navigating to account screen from token creator button ([#1541](https://github.com/web3-storage/web3.storage/issues/1541)) ([dc752ad](https://github.com/web3-storage/web3.storage/commit/dc752ad35af24b6f0300f2c1b53899aa60bab704))

## [2.8.3](https://github.com/web3-storage/web3.storage/compare/website-v2.8.2...website-v2.8.3) (2022-06-24)


### Bug Fixes

* 1528 gutter alignment ([#1549](https://github.com/web3-storage/web3.storage/issues/1549)) ([dda568e](https://github.com/web3-storage/web3.storage/commit/dda568eeeac3a2f5c7eea1693bc6980d02be1549))
* explain api maintenance mode ([#1545](https://github.com/web3-storage/web3.storage/issues/1545)) ([cabc458](https://github.com/web3-storage/web3.storage/commit/cabc458bc6cf98156aaf6491608d811b1e05ac43))
* rename `id` -> `cid`... ([#1470](https://github.com/web3-storage/web3.storage/issues/1470)) ([a5cb811](https://github.com/web3-storage/web3.storage/commit/a5cb81136bee4c197eaa0813488dadfea99768e9))


### Other Changes

* update year in footer ([#1551](https://github.com/web3-storage/web3.storage/issues/1551)) ([ce4a7f2](https://github.com/web3-storage/web3.storage/commit/ce4a7f296fa83c3a36fcfb273ae23176a393046b))

## [2.8.2](https://github.com/web3-storage/web3.storage/compare/website-v2.8.1...website-v2.8.2) (2022-06-20)


### Bug Fixes

* nav active states ([#1505](https://github.com/web3-storage/web3.storage/issues/1505)) ([1157d3a](https://github.com/web3-storage/web3.storage/commit/1157d3a4b0c8bd47ffab3c8674a5c9baacf92e50))
* replace markdown links in docs with absolute non-md format ([#1524](https://github.com/web3-storage/web3.storage/issues/1524)) ([981470b](https://github.com/web3-storage/web3.storage/commit/981470b93d7b39cf9551f39b3e9ae3086526a6be))

## [2.8.1](https://github.com/web3-storage/web3.storage/compare/website-v2.8.0...website-v2.8.1) (2022-06-17)


### Bug Fixes

* UI was sending empty string for HasPinningAccess user request form tag value ([#1513](https://github.com/web3-storage/web3.storage/issues/1513)) ([e253929](https://github.com/web3-storage/web3.storage/commit/e2539298669d5406526dee898637180ae4c50380))

## [2.8.0](https://github.com/web3-storage/web3.storage/compare/website-v2.7.1...website-v2.8.0) (2022-06-16)


### Features

* Add basic storage limit request functionality ([#1398](https://github.com/web3-storage/web3.storage/issues/1398)) ([1347ed5](https://github.com/web3-storage/web3.storage/commit/1347ed50abe2831076fb61118d931226d47e2028))


### Bug Fixes

* pins missing ([#1494](https://github.com/web3-storage/web3.storage/issues/1494)) ([4fe0120](https://github.com/web3-storage/web3.storage/commit/4fe01205326ed093f9e577a04b52c1cdca547574))

## [2.7.1](https://github.com/web3-storage/web3.storage/compare/website-v2.7.0...website-v2.7.1) (2022-06-15)


### Bug Fixes

* account view priority and table size ([#1431](https://github.com/web3-storage/web3.storage/issues/1431)) ([5352ca4](https://github.com/web3-storage/web3.storage/commit/5352ca43094606b4826ba61f98dca8f382c71d4c))

## [2.7.0](https://github.com/web3-storage/web3.storage/compare/website-v2.6.0...website-v2.7.0) (2022-06-14)


### Features

* cases for visual minimums to both stored and pinned meters ([#1333](https://github.com/web3-storage/web3.storage/issues/1333)) ([9ed73f3](https://github.com/web3-storage/web3.storage/commit/9ed73f372110856acec1078f5e556890662289db))


### Bug Fixes

* login screens jarring ([#1446](https://github.com/web3-storage/web3.storage/issues/1446)) ([87554bd](https://github.com/web3-storage/web3.storage/commit/87554bdab54aa9c2ad7725f44cfd130a1f51cbc6))

## [2.6.0](https://github.com/web3-storage/web3.storage/compare/website-v2.5.1...website-v2.6.0) (2022-06-13)


### Features

* Message bar incident/maintenance name ([#1335](https://github.com/web3-storage/web3.storage/issues/1335)) ([0e4ec06](https://github.com/web3-storage/web3.storage/commit/0e4ec066f702da5f57c4779c30315296197f8ee5))
* reduce font size ([#1411](https://github.com/web3-storage/web3.storage/issues/1411)) ([345c171](https://github.com/web3-storage/web3.storage/commit/345c1712d8951e58b05ad4a488a091c1b48390bf))
* Split file manager table into uploaded & pinned ([#1363](https://github.com/web3-storage/web3.storage/issues/1363)) ([df181ed](https://github.com/web3-storage/web3.storage/commit/df181ed947da3bcffc563c6c15dbbb3af84dda38))


### Bug Fixes

* docs toc highlight on click ([#1392](https://github.com/web3-storage/web3.storage/issues/1392)) ([29f45ca](https://github.com/web3-storage/web3.storage/commit/29f45cad67f0c3797c4605f9d6eb58394d3ce3d2))
* refactor accordion content ([#1391](https://github.com/web3-storage/web3.storage/issues/1391)) ([1817d3b](https://github.com/web3-storage/web3.storage/commit/1817d3b4edbd3aa8a019024c4d53b9acd6ebad5b))

## [2.5.1](https://github.com/web3-storage/web3.storage/compare/website-v2.5.0...website-v2.5.1) (2022-06-08)


### Bug Fixes

* 404 API http reference links ([#1358](https://github.com/web3-storage/web3.storage/issues/1358)) ([09550b9](https://github.com/web3-storage/web3.storage/commit/09550b904b6f2d05d298ab6917f04a0a21a628bd)), closes [#1359](https://github.com/web3-storage/web3.storage/issues/1359)
* **http docs:** incorrect endpoint in description ([#1429](https://github.com/web3-storage/web3.storage/issues/1429)) ([f445cda](https://github.com/web3-storage/web3.storage/commit/f445cda5da6fef3893bb291bce61f42f02506927))

## [2.5.0](https://github.com/web3-storage/web3.storage/compare/website-v2.4.1...website-v2.5.0) (2022-05-30)


### Features

* add user blocking functionality to web3 ([#1322](https://github.com/web3-storage/web3.storage/issues/1322)) ([5803876](https://github.com/web3-storage/web3.storage/commit/5803876b6ab6672ce82ebe3e641a8729993743ef))


### Bug Fixes

* Set fetch date before changing isFetching state ([#1341](https://github.com/web3-storage/web3.storage/issues/1341)) ([0e07f1f](https://github.com/web3-storage/web3.storage/commit/0e07f1f72b3037b56a4a236ffa9696ab982c22f5))
* show custom storage quota to user ([#1338](https://github.com/web3-storage/web3.storage/issues/1338)) ([51abb35](https://github.com/web3-storage/web3.storage/commit/51abb35b9c6f53ed1023a7dbb162ce2838fe09e9))

### [2.4.1](https://github.com/web3-storage/web3.storage/compare/website-v2.4.0...website-v2.4.1) (2022-05-20)


### Other Changes

* rename pinned to psaPinned ([#1268](https://github.com/web3-storage/web3.storage/issues/1268)) ([aeae342](https://github.com/web3-storage/web3.storage/commit/aeae342547b1fb15c17069f6d019beae250564f5))

## [2.4.0](https://github.com/web3-storage/web3.storage/compare/website-v2.3.0...website-v2.4.0) (2022-05-18)


### Features

* Additional file upload button ([#1290](https://github.com/web3-storage/web3.storage/issues/1290)) ([9fafc83](https://github.com/web3-storage/web3.storage/commit/9fafc830b841da0dd6bd5319c77febaded232240))
* Pinned/uploaded storage bar feedback ([#1288](https://github.com/web3-storage/web3.storage/issues/1288)) ([d47962d](https://github.com/web3-storage/web3.storage/commit/d47962df7a51bbfd15c3efa5564c676b0228876b))
* re-platform docs to nextra ([#1229](https://github.com/web3-storage/web3.storage/issues/1229)) ([5a7f53b](https://github.com/web3-storage/web3.storage/commit/5a7f53b7a43d4a66435a4b515ce2fea663608b42))
* Upload progress feedback ([#1261](https://github.com/web3-storage/web3.storage/issues/1261)) ([3392a06](https://github.com/web3-storage/web3.storage/commit/3392a068ff7e765cc1288fd5eae5df11e7d3db73))


### Bug Fixes

* Change hover over description for Queuing in individual file rows ([#1296](https://github.com/web3-storage/web3.storage/issues/1296)) ([04dafec](https://github.com/web3-storage/web3.storage/commit/04dafec1781bfd7c4741f36f028d9c4d8f357cab))
* Default sort by should be newest to oldest ([#1295](https://github.com/web3-storage/web3.storage/issues/1295)) ([b0da078](https://github.com/web3-storage/web3.storage/commit/b0da078962d3715c66f29a013102aab2fd5d1cf4))
* JS errors from docs changes ([#1334](https://github.com/web3-storage/web3.storage/issues/1334)) ([2dd88f4](https://github.com/web3-storage/web3.storage/commit/2dd88f492ca6c7f1adf8a07a675afd1668f29a4c))
* Removed mistakenly generated link on CID header item in filemanager ([#1336](https://github.com/web3-storage/web3.storage/issues/1336)) ([83201cf](https://github.com/web3-storage/web3.storage/commit/83201cf1c26be981991e11983bf77cdca500f622))
* testimonial cards link behavior ([#1247](https://github.com/web3-storage/web3.storage/issues/1247)) ([67facbe](https://github.com/web3-storage/web3.storage/commit/67facbe08bd58d65da6367b3072caa13360fe5b3))

## [2.3.0](https://github.com/web3-storage/web3.storage/compare/website-v2.2.1...website-v2.3.0) (2022-04-26)


### Features

* CID links in files table ([#1243](https://github.com/web3-storage/web3.storage/issues/1243)) ([dccf457](https://github.com/web3-storage/web3.storage/commit/dccf457a4005dace47d685b57dbfb66d52e36b5b))
* consolidate subnav account menu ([#1252](https://github.com/web3-storage/web3.storage/issues/1252)) ([0a9b1b1](https://github.com/web3-storage/web3.storage/commit/0a9b1b17b5e2acf25fcc0f4fd5bc91b59aa695df))


### Bug Fixes

* statuspage incidents appear in message banner ([#1188](https://github.com/web3-storage/web3.storage/issues/1188)) ([a086fcc](https://github.com/web3-storage/web3.storage/commit/a086fcc0f0d6d751bd0a4c014ef02e9d75a4fa13))

### [2.2.1](https://github.com/web3-storage/web3.storage/compare/website-v2.2.0...website-v2.2.1) (2022-04-12)


### Bug Fixes

* trigger website release ([b5a8b88](https://github.com/web3-storage/web3.storage/commit/b5a8b88d66e14bd763833eada1a8a01133450b4b))

## [2.2.0](https://github.com/web3-storage/web3.storage/compare/website-v2.1.0...website-v2.2.0) (2022-04-12)


### Features

* Gradient background optimization ([#1230](https://github.com/web3-storage/web3.storage/issues/1230)) ([3fbcc6e](https://github.com/web3-storage/web3.storage/commit/3fbcc6efaefa58534d1aaeaff54f83c803e13f70))


### Bug Fixes

* safari checkmark is always checked ([#1236](https://github.com/web3-storage/web3.storage/issues/1236)) ([6fa77e0](https://github.com/web3-storage/web3.storage/commit/6fa77e0a253d10f5e7c316eb8410ac45f675426e))
* website copy filecoin storage capacity ([#1210](https://github.com/web3-storage/web3.storage/issues/1210)) ([07c4315](https://github.com/web3-storage/web3.storage/commit/07c4315727d163bd3c439b6e6ed1d9b3d91e50a8))

## [2.1.0](https://github.com/web3-storage/web3.storage/compare/website-v2.0.0...website-v2.1.0) (2022-04-05)


### Features

* minor update to copy in SP tooltips ([#1151](https://github.com/web3-storage/web3.storage/issues/1151)) ([aa4785f](https://github.com/web3-storage/web3.storage/commit/aa4785f66375c4647dec70dad4262bd2e786f4e0))


### Bug Fixes

* npm package name ([#1128](https://github.com/web3-storage/web3.storage/issues/1128)) ([5bae2a9](https://github.com/web3-storage/web3.storage/commit/5bae2a9cb67879078be368bd21c822644d207a94))
* post-ship website fixes and enhancements ([#1150](https://github.com/web3-storage/web3.storage/issues/1150)) ([80be326](https://github.com/web3-storage/web3.storage/commit/80be3269d875795bc233f59322385297eaaf2b00))
* trivial change to trigger release process ([#1220](https://github.com/web3-storage/web3.storage/issues/1220)) ([e3d5a2c](https://github.com/web3-storage/web3.storage/commit/e3d5a2cc963a1bce2a1a9103d8abba620dbacfed))
* user storage display on web ([#1183](https://github.com/web3-storage/web3.storage/issues/1183)) ([1c8d36c](https://github.com/web3-storage/web3.storage/commit/1c8d36cb1f941cb940836af51451da4c72bdf685))
* website 404 ([#1172](https://github.com/web3-storage/web3.storage/issues/1172)) ([8608735](https://github.com/web3-storage/web3.storage/commit/860873573018ea1ae6020d2ebfbc444138372ece))

## [2.0.0](https://github.com/web3-storage/web3.storage/compare/website-v1.10.0...website-v2.0.0) (2022-03-18)


### ⚠ BREAKING CHANGES

* new website frontend and app ui (#1001)

### Features

* new website frontend and app ui ([#1001](https://github.com/web3-storage/web3.storage/issues/1001)) ([dc61e36](https://github.com/web3-storage/web3.storage/commit/dc61e362001859605300f525b51e0fdd54d84704))


### Bug Fixes

* disable swc minify ([#1040](https://github.com/web3-storage/web3.storage/issues/1040)) ([bcfa71c](https://github.com/web3-storage/web3.storage/commit/bcfa71cb119af8fabe4cd0cfd46a5659ae56cf51))
* tests in CI ([#1034](https://github.com/web3-storage/web3.storage/issues/1034)) ([ad26c27](https://github.com/web3-storage/web3.storage/commit/ad26c27cdbe2b18ad5af32943403b7852e49e465))

## [1.10.0](https://github.com/web3-storage/web3.storage/compare/website-v1.9.1...website-v1.10.0) (2022-02-23)


### Features

* remove availability and update status columns ([e1dd1aa](https://github.com/web3-storage/web3.storage/commit/e1dd1aac229d761cac94ea687536f4197cbcdb79))


### Bug Fixes

* remove resize observer, use css for responsive menu ([#778](https://github.com/web3-storage/web3.storage/issues/778)) ([afc0292](https://github.com/web3-storage/web3.storage/commit/afc02922a4332602a7a1294bcc2cf82a206a63ec))

### [1.9.1](https://www.github.com/web3-storage/web3.storage/compare/website-v1.9.0...website-v1.9.1) (2022-01-11)


### Bug Fixes

* only disallow delete if dag size is unknown ([#839](https://www.github.com/web3-storage/web3.storage/issues/839)) ([c5729b6](https://www.github.com/web3-storage/web3.storage/commit/c5729b6a340b665e09602d2a71de04453e81f63d))
* update deps in api and client ([#855](https://www.github.com/web3-storage/web3.storage/issues/855)) ([22155db](https://www.github.com/web3-storage/web3.storage/commit/22155db13b646e9846cf10c26d10faeb0d3b936e))

## [1.9.0](https://www.github.com/web3-storage/web3.storage/compare/website-v1.8.0...website-v1.9.0) (2022-01-06)


### Features

* issue 689 added new column and metadata for review ([#729](https://www.github.com/web3-storage/web3.storage/issues/729)) ([b360024](https://www.github.com/web3-storage/web3.storage/commit/b360024315411651fb452314a6c68fc8fcadb149))
* Multiple File upload and uniform drag and drop ([#567](https://www.github.com/web3-storage/web3.storage/issues/567)) ([dbe8239](https://www.github.com/web3-storage/web3.storage/commit/dbe823921e639d49aebd1e7d650536185d9521af))


### Bug Fixes

* mispelled available ([#731](https://www.github.com/web3-storage/web3.storage/issues/731)) ([24e1949](https://www.github.com/web3-storage/web3.storage/commit/24e1949bcf455d8aff52e8beaa88b30591af440d))


### Changes

* created a formatter abstraction for filesize to standardize iec binary units for all file size display props ([#757](https://www.github.com/web3-storage/web3.storage/issues/757)) ([72a5ac7](https://www.github.com/web3-storage/web3.storage/commit/72a5ac7c1e273ce7220c0e0fdd88f8cd8e90503e))

## [1.8.0](https://www.github.com/web3-storage/web3.storage/compare/website-v1.7.1...website-v1.8.0) (2021-11-30)


### Features

* handle upload errors ([#543](https://www.github.com/web3-storage/web3.storage/issues/543)) ([f3ccded](https://www.github.com/web3-storage/web3.storage/commit/f3ccded145d81495d093359bc8d93e69b6fcf2eb))

### [1.7.1](https://www.github.com/web3-storage/web3.storage/compare/website-v1.7.0...website-v1.7.1) (2021-11-25)


### Bug Fixes

* advertise more correct size for storage in filecoin ([#690](https://www.github.com/web3-storage/web3.storage/issues/690)) ([f51387c](https://www.github.com/web3-storage/web3.storage/commit/f51387c1117074bae20da5aeaa5c8c2dd65c8631))

## [1.7.0](https://www.github.com/web3-storage/web3.storage/compare/website-v1.6.0...website-v1.7.0) (2021-11-23)


### Features

* add website version and commit to meta tags ([#639](https://www.github.com/web3-storage/web3.storage/issues/639)) ([23d0b53](https://www.github.com/web3-storage/web3.storage/commit/23d0b53c0dbd36b062c4b12809ac212f004cfc70))

## [1.6.0](https://www.github.com/web3-storage/web3.storage/compare/website-v1.5.0...website-v1.6.0) (2021-11-15)


### Features

* add user email to account page ([#566](https://www.github.com/web3-storage/web3.storage/issues/566)) ([a34d976](https://www.github.com/web3-storage/web3.storage/commit/a34d97623eaa2153c9bf068c3a099f3c463af1a3))
* add user survey ([#574](https://www.github.com/web3-storage/web3.storage/issues/574)) ([3d17829](https://www.github.com/web3-storage/web3.storage/commit/3d1782963c6d94378e97842b09a1dbcf95c6c129))

## [1.5.0](https://www.github.com/web3-storage/web3.storage/compare/website-v1.4.0...website-v1.5.0) (2021-10-28)


### Features

* add dynamic sitemap and robots file ([#517](https://www.github.com/web3-storage/web3.storage/issues/517)) ([25200ff](https://www.github.com/web3-storage/web3.storage/commit/25200ff9ca8171b0a7bd3fe7bf13357c4536fd6d))
* add link to token tester demo app from tokens page ([#374](https://www.github.com/web3-storage/web3.storage/issues/374)) ([9167c73](https://www.github.com/web3-storage/web3.storage/commit/9167c73379b92ef6e07780aaf584a5ccd67fe21b))
* add maintenance banner ([#544](https://www.github.com/web3-storage/web3.storage/issues/544)) ([1ee989c](https://www.github.com/web3-storage/web3.storage/commit/1ee989c81ab32fdb4f93bebd911d3e0f8b59416a))
* add tooltip to the pin status ([#474](https://www.github.com/web3-storage/web3.storage/issues/474)) ([9a53d06](https://www.github.com/web3-storage/web3.storage/commit/9a53d06ee5f06b441cbd31f215cd6f18afcf05d2))
* improve tokens table ([#483](https://www.github.com/web3-storage/web3.storage/issues/483)) ([9af8a1a](https://www.github.com/web3-storage/web3.storage/commit/9af8a1af463632c61b629129cac3466947c7269f))
* storage backup ([#417](https://www.github.com/web3-storage/web3.storage/issues/417)) ([ae5423a](https://www.github.com/web3-storage/web3.storage/commit/ae5423aebc779545126fb6ba652637317efc91e7))


### Bug Fixes

* encode filenames ([#539](https://www.github.com/web3-storage/web3.storage/issues/539)) ([de01972](https://www.github.com/web3-storage/web3.storage/commit/de0197278c041a5bd0c2979e38f79bad068bf993))
* improve seo metadata ([#522](https://www.github.com/web3-storage/web3.storage/issues/522)) ([23b008c](https://www.github.com/web3-storage/web3.storage/commit/23b008c53d8b8216e230c572ba147b3b067f92d1))
* tables scroll with the buttons ([09862a8](https://www.github.com/web3-storage/web3.storage/commit/09862a89ad45e8ed6281f27ffc7a03fba30c5a71))
* typo copy banner ([#558](https://www.github.com/web3-storage/web3.storage/issues/558)) ([e2633f7](https://www.github.com/web3-storage/web3.storage/commit/e2633f73417e6f595f71237010ea73b3fccbd81b))
* website maintenance banner ([#557](https://www.github.com/web3-storage/web3.storage/issues/557)) ([02a93a2](https://www.github.com/web3-storage/web3.storage/commit/02a93a244ff273f6be64b86d1602d621d0d72dd4))


### Changes

* api rewire ([#524](https://www.github.com/web3-storage/web3.storage/issues/524)) ([f4f9cd3](https://www.github.com/web3-storage/web3.storage/commit/f4f9cd39f0859b843067057af9bcdbf4f29063e9))

## [1.4.0](https://www.github.com/web3-storage/web3.storage/compare/website-v1.3.1...website-v1.4.0) (2021-09-10)


### Features

* add a new step to the getting started ([#391](https://www.github.com/web3-storage/web3.storage/issues/391)) ([03844f4](https://www.github.com/web3-storage/web3.storage/commit/03844f456a3faafc755d3342ae6a2fc67822b1e2))


### Bug Fixes

* use the same font size for the whole footer ([#461](https://www.github.com/web3-storage/web3.storage/issues/461)) ([91b054a](https://www.github.com/web3-storage/web3.storage/commit/91b054a30070d0db11477a0397af40ad42f2bda9))

### [1.3.1](https://www.github.com/web3-storage/web3.storage/compare/website-v1.3.0...website-v1.3.1) (2021-09-09)


### Bug Fixes

* improve table layout inside files page ([#454](https://www.github.com/web3-storage/web3.storage/issues/454)) ([e591487](https://www.github.com/web3-storage/web3.storage/commit/e5914878bdbb200b7cb6903555ad35363db4fdbb)), closes [#430](https://www.github.com/web3-storage/web3.storage/issues/430) [#431](https://www.github.com/web3-storage/web3.storage/issues/431)
* make refresh fetch recent uploads ([#423](https://www.github.com/web3-storage/web3.storage/issues/423)) ([d8c9245](https://www.github.com/web3-storage/web3.storage/commit/d8c9245e8ed6cb98d5dfaf4a0d8ffd2edd87994b))

## [1.3.0](https://www.github.com/web3-storage/web3.storage/compare/website-v1.2.4...website-v1.3.0) (2021-09-06)


### Features

* add navbar mobile functionalities ([#251](https://www.github.com/web3-storage/web3.storage/issues/251)) ([e6b5322](https://www.github.com/web3-storage/web3.storage/commit/e6b5322d9d7e398558d3737641563f03f10150b7))
* add sorting to the uploads list ([d09f2aa](https://www.github.com/web3-storage/web3.storage/commit/d09f2aa34833cc20af8e19923a80e39060190bad))
* allow uploads to be renamed ([2cd9483](https://www.github.com/web3-storage/web3.storage/commit/2cd9483734df5e558a79f58701002f2c50c94269))


### Bug Fixes

* add jsdocs to the uploads fetching ([5964ff2](https://www.github.com/web3-storage/web3.storage/commit/5964ff267b8558447a98172cb34331bd665c5ee3))
* button size on the tokens page ([a2c76b3](https://www.github.com/web3-storage/web3.storage/commit/a2c76b312a5a9844c64a02cc56760b94ba4d87e1))
* logo text style ([e3b64b1](https://www.github.com/web3-storage/web3.storage/commit/e3b64b143bfc5dff00bf9348484aefae4deb17ac))
* logo text style ([47f190d](https://www.github.com/web3-storage/web3.storage/commit/47f190d0213a92a85916ea2a10443803b7cc5148))
* remove double spinners for the account page ([#354](https://www.github.com/web3-storage/web3.storage/issues/354)) ([de966e2](https://www.github.com/web3-storage/web3.storage/commit/de966e265df4354e89675178a3a7fd42a7e14a1a))
* tslint errors ([c450553](https://www.github.com/web3-storage/web3.storage/commit/c450553ea14613b5654b3623ff61352b31960aa1))

### [1.2.4](https://www.github.com/web3-storage/web3.storage/compare/website-v1.2.3...website-v1.2.4) (2021-08-16)


### Bug Fixes

* remove unused user metadata request ([#352](https://www.github.com/web3-storage/web3.storage/issues/352)) ([cf3dc17](https://www.github.com/web3-storage/web3.storage/commit/cf3dc175d8ce97506002bbca3eb01e65f91d632d))

### [1.2.3](https://www.github.com/web3-storage/web3.storage/compare/website-v1.2.2...website-v1.2.3) (2021-08-04)


### Bug Fixes

* do not wrap Calculating... ([52b10be](https://www.github.com/web3-storage/web3.storage/commit/52b10be5a26e2fc4a9ecac787fdcb1326ec67a5c))
* link to IPFS ToS ([d7f78e7](https://www.github.com/web3-storage/web3.storage/commit/d7f78e7cd35406c396c14b3517adcfc835ea3cac))
* redirect URL ([0d1c3ef](https://www.github.com/web3-storage/web3.storage/commit/0d1c3ef48e7217c332abbdc59b559b63bc003c7f))

### [1.2.2](https://www.github.com/web3-storage/web3.storage/compare/website-v1.2.1...website-v1.2.2) (2021-07-31)


### Bug Fixes

* more social image ([df3d0ca](https://www.github.com/web3-storage/web3.storage/commit/df3d0ca2811ac98f1786852bc7b23d31cabf8934))
* social image twitter url ([e530776](https://www.github.com/web3-storage/web3.storage/commit/e530776f3fe20e2b5f33bafca6fb7c1351f84308))

### [1.2.1](https://www.github.com/web3-storage/web3.storage/compare/website-v1.2.0...website-v1.2.1) (2021-07-31)


### Bug Fixes

* rectify trivial typos ([#254](https://www.github.com/web3-storage/web3.storage/issues/254)) ([6067d20](https://www.github.com/web3-storage/web3.storage/commit/6067d204a68a10a316ef8e52420cca9a6dc9515a))
* social card ([0f8e2db](https://www.github.com/web3-storage/web3.storage/commit/0f8e2db47b205c28f55cfd13a65d3cdd378a8b3c))

## [1.2.0](https://www.github.com/web3-storage/web3.storage/compare/website-v1.1.2...website-v1.2.0) (2021-07-30)


### Features

* add 'hasUpload' property to the tokens ([f583565](https://www.github.com/web3-storage/web3.storage/commit/f58356593a0e9cf02fa3a4c5c96a6be2d9acfc03))


### Bug Fixes

* adapt vertical lines to incoming fix ([1c22bac](https://www.github.com/web3-storage/web3.storage/commit/1c22bac357e7646629ea42e843a57c8adca95688))
* firefox compatibility ([f69e824](https://www.github.com/web3-storage/web3.storage/commit/f69e824c7b3882a6e1421b593c95c5f90b1228b2))
* hero illustration lines ([719f0a0](https://www.github.com/web3-storage/web3.storage/commit/719f0a072719f58a349bbbb06d2946122f49c4d1))
* homepage styles according to ui revision ([e7565d1](https://www.github.com/web3-storage/web3.storage/commit/e7565d1d7321896cf0da7de092cdd4b02317f381))
* improve footer links click area ([655fd98](https://www.github.com/web3-storage/web3.storage/commit/655fd98540cf062714939e995a081e6c192f8656))
* improve navbar links click area ([a1e93ee](https://www.github.com/web3-storage/web3.storage/commit/a1e93eedd7094ab2be2f721f596bc9f4a4507015))
* margin between menu items and login button ([b810e03](https://www.github.com/web3-storage/web3.storage/commit/b810e037215c84d469bfcbe37da0d4fc55b3c4ce))
* prepare UI for undefined usedStorage ([313125c](https://www.github.com/web3-storage/web3.storage/commit/313125cf34bfe5b19cfa8b7142c1cfddad79f4c0))
* profile page token card ([9459193](https://www.github.com/web3-storage/web3.storage/commit/9459193318ccf797c76506f681dfaa98ea34762c))
* profile page ui makeover ([98d7536](https://www.github.com/web3-storage/web3.storage/commit/98d7536cca33a901e5d98622045eef3d415c8801))
* show 'explore the docs' when token hasnt been used ([2a707aa](https://www.github.com/web3-storage/web3.storage/commit/2a707aa6502c4a8acd465c34018b33c4c47a7d81))
* show vertical-lines illustration again ([c9571f7](https://www.github.com/web3-storage/web3.storage/commit/c9571f7ad15c36028b5b1ccf40a42d44f817b8af))
* vertical lines now has max width and height ([8b7dee2](https://www.github.com/web3-storage/web3.storage/commit/8b7dee225a184f80959fbf80929d77bdd9cad595))

### [1.1.2](https://www.github.com/web3-storage/web3.storage/compare/website-v1.1.1...website-v1.1.2) (2021-07-29)


### Bug Fixes

* purge list ([045dbb8](https://www.github.com/web3-storage/web3.storage/commit/045dbb8d93d2c4a648b11de84d98f68afe93b055))

### [1.1.1](https://www.github.com/web3-storage/web3.storage/compare/website-v1.1.0...website-v1.1.1) (2021-07-28)


### Bug Fixes

* capitalizations ([befeab0](https://www.github.com/web3-storage/web3.storage/commit/befeab0ed7aa889d3ef4c92156f8be991a0c2021))

## [1.1.0](https://www.github.com/web3-storage/web3.storage/compare/website-v1.0.0...website-v1.1.0) (2021-07-28)


### Features

* show enqueuing uploads ([23f58a3](https://www.github.com/web3-storage/web3.storage/commit/23f58a36446aa3fd240eb38b5b63ae2a5aa6462a))


### Bug Fixes

* query cluster until we get a preferable pin status ([#192](https://www.github.com/web3-storage/web3.storage/issues/192)) ([0ee131a](https://www.github.com/web3-storage/web3.storage/commit/0ee131a3217f9972ee1f9a0204677157c03773f8))
* show calculating when DAG size is not yet known ([#199](https://www.github.com/web3-storage/web3.storage/issues/199)) ([0aa3aaf](https://www.github.com/web3-storage/web3.storage/commit/0aa3aafc62d41a9943766d3df11c621e998c4d1f))
* two docs links to quickstart ([#168](https://www.github.com/web3-storage/web3.storage/issues/168)) ([dff14f4](https://www.github.com/web3-storage/web3.storage/commit/dff14f4d1d3a533342e60d924c963d553ede2295))

## 1.0.0 (2021-07-26)


### Features

* add favicon and logo ([b4f7cb7](https://www.github.com/web3-storage/web3.storage/commit/b4f7cb7658a772d475f6af964946cf0ec9a74f8a))
* add home, login and about pages ([#68](https://www.github.com/web3-storage/web3.storage/issues/68)) ([2f351bf](https://www.github.com/web3-storage/web3.storage/commit/2f351bf6fa0f622240c07b3256409dcf86d28296))
* add profile page ([#88](https://www.github.com/web3-storage/web3.storage/issues/88)) ([9ef3e17](https://www.github.com/web3-storage/web3.storage/commit/9ef3e179695e9ac660605aede8c3db8082b46490))
* add styling to the about page ([#105](https://www.github.com/web3-storage/web3.storage/issues/105)) ([78dd4a1](https://www.github.com/web3-storage/web3.storage/commit/78dd4a1e25d7995140470c003f273c360d4cc9f7))
* add styling to the homepage ([#137](https://www.github.com/web3-storage/web3.storage/issues/137)) ([673a32c](https://www.github.com/web3-storage/web3.storage/commit/673a32c9d52727bd0fd537c8ab335901146b21fe))
* add tabs and copy to clipboard to code block ([#152](https://www.github.com/web3-storage/web3.storage/issues/152)) ([fa0680a](https://www.github.com/web3-storage/web3.storage/commit/fa0680acc9b2a7b713c93667d6fcc1466027ff2a))
* add terms page ([#140](https://www.github.com/web3-storage/web3.storage/issues/140)) ([715a930](https://www.github.com/web3-storage/web3.storage/commit/715a9302eab8447c41d0d126c0eb9f6fc379053a))
* add website ([#21](https://www.github.com/web3-storage/web3.storage/issues/21)) ([eefc16f](https://www.github.com/web3-storage/web3.storage/commit/eefc16f62371654e416ea3e53a9e3ac16ccf4534))
* delete user upload ([#48](https://www.github.com/web3-storage/web3.storage/issues/48)) ([885ddbf](https://www.github.com/web3-storage/web3.storage/commit/885ddbf7fda174c0ca64c415ff99ec87fc1e1c46))
* favicon! ([bcc4d3d](https://www.github.com/web3-storage/web3.storage/commit/bcc4d3d63b93565d6399e4563d595269cfb317eb))
* files pagination & bug fixes ([#139](https://www.github.com/web3-storage/web3.storage/issues/139)) ([361496e](https://www.github.com/web3-storage/web3.storage/commit/361496e66ac2f079f72590e6d5c6bb435cea2a7d))
* find uploads ([#35](https://www.github.com/web3-storage/web3.storage/issues/35)) ([151eaa4](https://www.github.com/web3-storage/web3.storage/commit/151eaa49c696b0757510b6e04501a8cf8595da3f))
* link to status page ([#117](https://www.github.com/web3-storage/web3.storage/issues/117)) ([359109a](https://www.github.com/web3-storage/web3.storage/commit/359109aa52492758b5d71a245d960a33d5dcb440))
* style files page ([#106](https://www.github.com/web3-storage/web3.storage/issues/106)) ([ba55fbc](https://www.github.com/web3-storage/web3.storage/commit/ba55fbca30c619faf9de54c1de37e906d5c1d682))
* style sign-in-page and add variants to layout ([439d5ef](https://www.github.com/web3-storage/web3.storage/commit/439d5efbc87c41f9364f851b8924f03cdc601db4))
* style upload page ([#147](https://www.github.com/web3-storage/web3.storage/issues/147)) ([2cb29ce](https://www.github.com/web3-storage/web3.storage/commit/2cb29cefc706f8844d03aa7350abfc2e13fb7777))
* update typography and add colors ([#97](https://www.github.com/web3-storage/web3.storage/issues/97)) ([f9e57d0](https://www.github.com/web3-storage/web3.storage/commit/f9e57d0436be1f40bfa73c11557b1940974e842c))


### Bug Fixes

* **about:** disable illustration interaction ([#119](https://www.github.com/web3-storage/web3.storage/issues/119)) ([bd950bd](https://www.github.com/web3-storage/web3.storage/commit/bd950bd3569362380342eef6bec9c11b1847084d))
* delete upload by cid ([#81](https://www.github.com/web3-storage/web3.storage/issues/81)) ([8faca9c](https://www.github.com/web3-storage/web3.storage/commit/8faca9cb886bf1a8c5ae26c63d5ab7cac60b5c47))
* do not re-render page when user fetching ([78e737f](https://www.github.com/web3-storage/web3.storage/commit/78e737fe1da26d0b4c7eac89eb818a35143d899f))
* files listing ([#155](https://www.github.com/web3-storage/web3.storage/issues/155)) ([bde495c](https://www.github.com/web3-storage/web3.storage/commit/bde495c334874c742d09f3224854324ebaa24e38))
* header/content spacing consistency ([cdf8c45](https://www.github.com/web3-storage/web3.storage/commit/cdf8c459e697a025579cdb57835f976549fc77d8))
* mobile styles ([#157](https://www.github.com/web3-storage/web3.storage/issues/157)) ([208669e](https://www.github.com/web3-storage/web3.storage/commit/208669e9afefcb4fc038f8842ceaa438c2c4699a))
* safari no understand overflow: clip ([093ecd6](https://www.github.com/web3-storage/web3.storage/commit/093ecd6467818a31151335e1d32457b8786a1aa6))
* split CAR uploads ([#42](https://www.github.com/web3-storage/web3.storage/issues/42)) ([80feba4](https://www.github.com/web3-storage/web3.storage/commit/80feba4be7702f79057074f3b8997fd754c5d348))
* use CSS.supports ([25e717d](https://www.github.com/web3-storage/web3.storage/commit/25e717d8076cbefb6aadcdd472a3c17ddc3231ce))
* user loading states ([#146](https://www.github.com/web3-storage/web3.storage/issues/146)) ([bd93d2f](https://www.github.com/web3-storage/web3.storage/commit/bd93d2f1b71f6c5ba25a7ec00c22b4f09f2785e5))
* user token stale time ([c441ea0](https://www.github.com/web3-storage/web3.storage/commit/c441ea00c9510a7a802e8413a9f1b3b9e775790b))
