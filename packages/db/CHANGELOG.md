# Changelog

## 1.0.0 (2022-06-27)


### ⚠ BREAKING CHANGES

* client should not throw on 404 (#751)
* remove faunadb (#610)

### Features

* Add basic storage limit request functionality ([#1398](https://github.com/web3-storage/web3.storage/issues/1398)) ([1347ed5](https://github.com/web3-storage/web3.storage/commit/1347ed50abe2831076fb61118d931226d47e2028))
* add migration indexes ([#573](https://github.com/web3-storage/web3.storage/issues/573)) ([c9cd864](https://github.com/web3-storage/web3.storage/commit/c9cd8642f9c9d21d98b3d9e9061d8549b82f35ef))
* add migration tracker table ([#578](https://github.com/web3-storage/web3.storage/issues/578)) ([dc1ce24](https://github.com/web3-storage/web3.storage/commit/dc1ce241e129fe65108cb96f129032608acd2b8a))
* add origins to psa pin request ([#897](https://github.com/web3-storage/web3.storage/issues/897)) ([0056679](https://github.com/web3-storage/web3.storage/commit/00566792980b42431fa9edc55add3c7ec0618732))
* add pin composite pinned at idx ([#634](https://github.com/web3-storage/web3.storage/issues/634)) ([6b64d7f](https://github.com/web3-storage/web3.storage/commit/6b64d7fd20f1fde769eaf66626b8bdb3eea5c7a2))
* add pinned storage to user account API ([#1044](https://github.com/web3-storage/web3.storage/issues/1044)) ([3200a6e](https://github.com/web3-storage/web3.storage/commit/3200a6e20a3460cefe5887ab5d48ad320a84a86f))
* add user blocking functionality to web3 ([#1322](https://github.com/web3-storage/web3.storage/issues/1322)) ([5803876](https://github.com/web3-storage/web3.storage/commit/5803876b6ab6672ce82ebe3e641a8729993743ef))
* add user email to account page ([#566](https://github.com/web3-storage/web3.storage/issues/566)) ([a34d976](https://github.com/web3-storage/web3.storage/commit/a34d97623eaa2153c9bf068c3a099f3c463af1a3))
* Adding admin ability to search by github_id ([#1403](https://github.com/web3-storage/web3.storage/issues/1403)) ([6e63656](https://github.com/web3-storage/web3.storage/commit/6e63656a25c35ee1ff890672fd98bc884602510d))
* Adding HasDeleteRestriction user_tag ([#1390](https://github.com/web3-storage/web3.storage/issues/1390)) ([0c3bb58](https://github.com/web3-storage/web3.storage/commit/0c3bb5874cc5d4ad313080fa5b1966748918481d))
* cron and pinpin rewire ([#531](https://github.com/web3-storage/web3.storage/issues/531)) ([9e5b42d](https://github.com/web3-storage/web3.storage/commit/9e5b42dc6d33bf3cf017034474981812370b366e))
* DB schema and API for user_tag_proposal. ([#1006](https://github.com/web3-storage/web3.storage/issues/1006)) ([effe575](https://github.com/web3-storage/web3.storage/commit/effe5754611b5a586959ebf2ff9b829deb5fcd33))
* filter pins by status ([#848](https://github.com/web3-storage/web3.storage/issues/848)) ([df1582b](https://github.com/web3-storage/web3.storage/commit/df1582b6b7d9fef45f832212d8df13aa29f246f3))
* implement account restriction ([#1053](https://github.com/web3-storage/web3.storage/issues/1053)) ([6f6f279](https://github.com/web3-storage/web3.storage/commit/6f6f2795a374c6df1e825f52d2c99afbe79131e5))
* implement postgres optimization ([#1305](https://github.com/web3-storage/web3.storage/issues/1305)) ([2cd6105](https://github.com/web3-storage/web3.storage/commit/2cd6105f838142cd559c9f59fcc09a327e03b1b9))
* pinning api allowlist ([#705](https://github.com/web3-storage/web3.storage/issues/705)) ([ed3a08d](https://github.com/web3-storage/web3.storage/commit/ed3a08d9ec4a7c7a746ffd5de06319a1ba5b1dad))
* pinning API implementation ([8187bb5](https://github.com/web3-storage/web3.storage/commit/8187bb5891ccf73c35289fd9f265ea110cbd5b9a))
* pins list filter by meta ([#927](https://github.com/web3-storage/web3.storage/issues/927)) ([486a0cd](https://github.com/web3-storage/web3.storage/commit/486a0cdcb82d73f2f07b76ffdc4f8d08b41a9d6a))
* postgres setup ([#508](https://github.com/web3-storage/web3.storage/issues/508)) ([cd04716](https://github.com/web3-storage/web3.storage/commit/cd04716844a646d986f53aeae7c73840a008aad3))
* respond with unique error message when blocked API key is used ([#1302](https://github.com/web3-storage/web3.storage/issues/1302)) ([faae1db](https://github.com/web3-storage/web3.storage/commit/faae1db8d635678fd6b9f36294e0c0dc0f243f22))
* schema updates for admin site ([#947](https://github.com/web3-storage/web3.storage/issues/947)) ([731b6e1](https://github.com/web3-storage/web3.storage/commit/731b6e1acb728e8056236a9bced9ba31263770ed))
* send email notifications for storage quota usage ([#1273](https://github.com/web3-storage/web3.storage/issues/1273)) ([0b1eb09](https://github.com/web3-storage/web3.storage/commit/0b1eb09b32dfb6cb1b3a5a8b5034dc4ac54ba3e2))
* simple mutability API using IPNS ([#648](https://github.com/web3-storage/web3.storage/issues/648)) ([9c287bb](https://github.com/web3-storage/web3.storage/commit/9c287bb7c983d3adab6ebb304decb47c5093ad78))
* storage backup ([#417](https://github.com/web3-storage/web3.storage/issues/417)) ([ae5423a](https://github.com/web3-storage/web3.storage/commit/ae5423aebc779545126fb6ba652637317efc91e7))
* update metrics and add psa pin requests to metrics ([d647ecb](https://github.com/web3-storage/web3.storage/commit/d647ecb90bbf7e068b9394f42b1c535671346d71))
* updated at indexes ([#551](https://github.com/web3-storage/web3.storage/issues/551)) ([b6c0ce5](https://github.com/web3-storage/web3.storage/commit/b6c0ce51f51e5b5339a202fbd04c15674e36e79d))
* use direct connection to cargo to get claimed size ([#1535](https://github.com/web3-storage/web3.storage/issues/1535)) ([e4087a9](https://github.com/web3-storage/web3.storage/commit/e4087a9f4d4202d672938d339e121c19344866b4))
* use user tags to check PSA auth ([#1008](https://github.com/web3-storage/web3.storage/issues/1008)) ([6fc29e6](https://github.com/web3-storage/web3.storage/commit/6fc29e6aebde22210d3dbaf0f827876035c77b5e))


### Bug Fixes

* add indexes and optimise token list function ([#618](https://github.com/web3-storage/web3.storage/issues/618)) ([05ff3ed](https://github.com/web3-storage/web3.storage/commit/05ff3ed907977816f4609c049ceb910333c2b545))
* add missing sql drop functions ([#605](https://github.com/web3-storage/web3.storage/issues/605)) ([0f01eb6](https://github.com/web3-storage/web3.storage/commit/0f01eb6c73cf95d8860e27d42619f2b7ac0c3a45))
* add missing status UnexpectedlyUnpinned ([#1105](https://github.com/web3-storage/web3.storage/issues/1105)) ([118ceb0](https://github.com/web3-storage/web3.storage/commit/118ceb0b1d768ac6585124385994199173deefac))
* add mocha dev dependency to api and db ([0648527](https://github.com/web3-storage/web3.storage/commit/064852797e0cf56faacbfdcbf9a142973e25c663))
* add on conflict clause to create backup ([#602](https://github.com/web3-storage/web3.storage/issues/602)) ([504809e](https://github.com/web3-storage/web3.storage/commit/504809ecdc4b87fd472874a3b4fe0eb8e336a357))
* add sv15-3 am6-3 and dc13-3 to migration ([#1037](https://github.com/web3-storage/web3.storage/issues/1037)) ([d6d7447](https://github.com/web3-storage/web3.storage/commit/d6d7447016826b0284905adce798bc8518f577d9))
* Adding user_tag_proposal schema to reset.sql for local dev ([#1445](https://github.com/web3-storage/web3.storage/issues/1445)) ([8533ce4](https://github.com/web3-storage/web3.storage/commit/8533ce4dce139c1830a11daf472e750ac3e6b173))
* api using db instead of mocks for tests ([#765](https://github.com/web3-storage/web3.storage/issues/765)) ([c9f6c06](https://github.com/web3-storage/web3.storage/commit/c9f6c066a5d46367d57a6f0de482166621c3fe38))
* **api:** add timeout statement to upload function ([#569](https://github.com/web3-storage/web3.storage/issues/569)) ([bf17756](https://github.com/web3-storage/web3.storage/commit/bf177569c690ad1f37583574a0b8c6026c189f40))
* backup should not have unique url ([#580](https://github.com/web3-storage/web3.storage/issues/580)) ([14b5c78](https://github.com/web3-storage/web3.storage/commit/14b5c781be6e886c9e5158f81795efe773d22ffe))
* backup unique constraint ([#795](https://github.com/web3-storage/web3.storage/issues/795)) ([b19790f](https://github.com/web3-storage/web3.storage/commit/b19790f621fd6544f3abdf944edde95697227f76))
* bigserial id cast to string ([#604](https://github.com/web3-storage/web3.storage/issues/604)) ([7c6b9b4](https://github.com/web3-storage/web3.storage/commit/7c6b9b4c66742652ace92c8e71d42a0f9c945acb))
* change batching strategy for user storage cron ([#1419](https://github.com/web3-storage/web3.storage/issues/1419)) ([ac10cb0](https://github.com/web3-storage/web3.storage/commit/ac10cb05011747fbd76f33bc0d79252f3924ce06))
* check if unpinned then downgrade to v0 ([#919](https://github.com/web3-storage/web3.storage/issues/919)) ([f1e9da5](https://github.com/web3-storage/web3.storage/commit/f1e9da5da5883671415091e6168a7ac95778dfef))
* chunked backup creation ([#496](https://github.com/web3-storage/web3.storage/issues/496)) ([4c8cf17](https://github.com/web3-storage/web3.storage/commit/4c8cf173deb21cbf0debf40901bfd2e7207c2026))
* client should not throw on 404 ([#751](https://github.com/web3-storage/web3.storage/issues/751)) ([a4cce7e](https://github.com/web3-storage/web3.storage/commit/a4cce7eb67a6dab6a75c5c86bcebe4dc66ecd6e4))
* dag size cron use ro for read ([#1087](https://github.com/web3-storage/web3.storage/issues/1087)) ([22f4170](https://github.com/web3-storage/web3.storage/commit/22f417091acf88e891449a06f02cfcba118726d8))
* data CID is root CID of aggregate, not content CID ([#720](https://github.com/web3-storage/web3.storage/issues/720)) ([8c67725](https://github.com/web3-storage/web3.storage/commit/8c677259635a3deb30c948330f8ea118053309ce))
* db client do not throw error when no upload found ([#885](https://github.com/web3-storage/web3.storage/issues/885)) ([834d3cc](https://github.com/web3-storage/web3.storage/commit/834d3ccb22d8ee00b4f47e5eae850aaf5b7ebba1))
* db client improvements ([#546](https://github.com/web3-storage/web3.storage/issues/546)) ([5deffae](https://github.com/web3-storage/web3.storage/commit/5deffae2ec3e6c81d90d7db10285fd051c5c1c7d))
* db delete key return value ([#766](https://github.com/web3-storage/web3.storage/issues/766)) ([34f5f82](https://github.com/web3-storage/web3.storage/commit/34f5f826f68ff8407fad0a6e9d0a20f6e4d99d47))
* db fauna updated ts ([#572](https://github.com/web3-storage/web3.storage/issues/572)) ([c0c8334](https://github.com/web3-storage/web3.storage/commit/c0c8334ff29810d4c7f841740fd8714acf0e9a66))
* db migrations versioning ([#1375](https://github.com/web3-storage/web3.storage/issues/1375)) ([3880307](https://github.com/web3-storage/web3.storage/commit/38803076ba629a9b927f1ae778e497873c65a2b1))
* deal normalize should filter out unexpected deal status ([#682](https://github.com/web3-storage/web3.storage/issues/682)) ([0e233cc](https://github.com/web3-storage/web3.storage/commit/0e233cc5af499a032cf83e3454eefbfb7ef2b0a0))
* deal status filtering ([#692](https://github.com/web3-storage/web3.storage/issues/692)) ([a7b4151](https://github.com/web3-storage/web3.storage/commit/a7b4151b05fa55646d337a090263a1eeb77b8169))
* delete ops should update updated ts ([#774](https://github.com/web3-storage/web3.storage/issues/774)) ([88b6c09](https://github.com/web3-storage/web3.storage/commit/88b6c0910b4e33b56d912b6fa53eb62301e0aec2))
* drop uploads user index ([#1484](https://github.com/web3-storage/web3.storage/issues/1484)) ([b73f158](https://github.com/web3-storage/web3.storage/commit/b73f15874ddbc90b08b1325bad0c94e132a9115a))
* fauna pins cron ([#592](https://github.com/web3-storage/web3.storage/issues/592)) ([f1df5dc](https://github.com/web3-storage/web3.storage/commit/f1df5dc9140d96acb516cb79f5ee39469db64395))
* fixes and improv to types annotations across the board ([46a3f1c](https://github.com/web3-storage/web3.storage/commit/46a3f1cbe3da6ac401d9b4fddc5723ba62841ec7))
* improve list tokens ([#782](https://github.com/web3-storage/web3.storage/issues/782)) ([b58a101](https://github.com/web3-storage/web3.storage/commit/b58a1018c2cb2cd7f838dbc0e1fefef446b06eae))
* inaccurate used_storage migrations ([#1360](https://github.com/web3-storage/web3.storage/issues/1360)) ([8f98d27](https://github.com/web3-storage/web3.storage/commit/8f98d276e087fab0c995e236df03ef1f6d62d2aa))
* increment used storage ([#501](https://github.com/web3-storage/web3.storage/issues/501)) ([1becd09](https://github.com/web3-storage/web3.storage/commit/1becd09bbdaabc503c180cc38c37f7f03852fe62))
* limit the psa request listing and return right count ([67d71e8](https://github.com/web3-storage/web3.storage/commit/67d71e8f22ec87667801f7eb790eb3498f924aaf))
* list uploads fetch deals for correct cid ([#643](https://github.com/web3-storage/web3.storage/issues/643)) ([df1be1f](https://github.com/web3-storage/web3.storage/commit/df1be1fe65d781bda985e2710b4c89b52803ca35))
* list uploads should return source cid ([#1272](https://github.com/web3-storage/web3.storage/issues/1272)) ([164e06b](https://github.com/web3-storage/web3.storage/commit/164e06b54dec1e43bfd7235141257e4cbb82d1aa))
* metrics computed async ([#1085](https://github.com/web3-storage/web3.storage/issues/1085)) ([99b52e5](https://github.com/web3-storage/web3.storage/commit/99b52e51689923426a857dc8693176dcbbceda7b))
* metrics for pin status response ([eb9f9ca](https://github.com/web3-storage/web3.storage/commit/eb9f9cac67aaa7b4d23d91a034ebddb0dcf8b92b))
* naive take on adding an index ([#1466](https://github.com/web3-storage/web3.storage/issues/1466)) ([ebe9bd0](https://github.com/web3-storage/web3.storage/commit/ebe9bd07e293ce6e8a4aaaacd17db8091a6252c0))
* optimise pin content cid query ([#1573](https://github.com/web3-storage/web3.storage/issues/1573)) ([c315143](https://github.com/web3-storage/web3.storage/commit/c3151437909cff86d34567d5eb67a663bff5ae4d))
* performance metrics queries ([#625](https://github.com/web3-storage/web3.storage/issues/625)) ([85efba5](https://github.com/web3-storage/web3.storage/commit/85efba5c2ba0b65def2a93e2b811268e9ab96b00))
* pin dag size metric should filter by pinned status ([#646](https://github.com/web3-storage/web3.storage/issues/646)) ([547f466](https://github.com/web3-storage/web3.storage/commit/547f4663c70d3916aeb056b103fc5470ba8b52cd))
* pin normalize should filter out unexpected pin status ([#677](https://github.com/web3-storage/web3.storage/issues/677)) ([f8c78b4](https://github.com/web3-storage/web3.storage/commit/f8c78b4ff3377c19a9bc101a7c8c97757cc511ae))
* pin status metrics returns data object ([#628](https://github.com/web3-storage/web3.storage/issues/628)) ([20877ae](https://github.com/web3-storage/web3.storage/commit/20877aeed7730a81d08435be6bee1dfe6d9afebe))
* pin sync req id text ([#622](https://github.com/web3-storage/web3.storage/issues/622)) ([dee0a4e](https://github.com/web3-storage/web3.storage/commit/dee0a4ea2c92f435b4669825894341faf317f658))
* pin_location lock contention ([#1101](https://github.com/web3-storage/web3.storage/issues/1101)) ([8cb3fee](https://github.com/web3-storage/web3.storage/commit/8cb3feeb5d0c5455f60fc4de16ee54684b671a8d))
* postgres set max parallel workers per gather to 4 ([#725](https://github.com/web3-storage/web3.storage/issues/725)) ([9cdfcfa](https://github.com/web3-storage/web3.storage/commit/9cdfcfa51063ae2a9a87cd71a05a6e2d42cea887))
* prevent table.sql to fail if a type already exists ([22b222a](https://github.com/web3-storage/web3.storage/commit/22b222ad320e9933f01d9c59fc5b59b4fb05fa53))
* psa pin request status ([f8967a8](https://github.com/web3-storage/web3.storage/commit/f8967a870ba99d06f9e6505b08dc83930da220e9))
* re-add constraints ([#597](https://github.com/web3-storage/web3.storage/issues/597)) ([596e65c](https://github.com/web3-storage/web3.storage/commit/596e65cf9220953d82f7b5e85ab71e616b6424b3))
* remove dagcargo materialized views ([#735](https://github.com/web3-storage/web3.storage/issues/735)) ([62db538](https://github.com/web3-storage/web3.storage/commit/62db5383f39e7d3e3484ccb51bd4eb3de816bcfd))
* remove faunadb ([#610](https://github.com/web3-storage/web3.storage/issues/610)) ([631e23f](https://github.com/web3-storage/web3.storage/commit/631e23f304ae3bef7d022041a39f72bc9438f469))
* storage used should not count failed uploads ([#1430](https://github.com/web3-storage/web3.storage/issues/1430)) ([a86d7e2](https://github.com/web3-storage/web3.storage/commit/a86d7e2a7045d57793be28d7f78011581118daeb))
* store IPFS peer IDs ([#1093](https://github.com/web3-storage/web3.storage/issues/1093)) ([1f2dcda](https://github.com/web3-storage/web3.storage/commit/1f2dcdaf4fb49419967aae7f988e05e67c05506f))
* tolerant of failure for deals ([#769](https://github.com/web3-storage/web3.storage/issues/769)) ([2bae4d4](https://github.com/web3-storage/web3.storage/commit/2bae4d438b570de0905d1b7d577654657ddc1282))
* unlist deleted pin requests ([#899](https://github.com/web3-storage/web3.storage/issues/899)) ([a378c0d](https://github.com/web3-storage/web3.storage/commit/a378c0d6aaea45f4e0b3b074426fa6776bdc6ca7))
* update incorrect dag sizes job ([#1059](https://github.com/web3-storage/web3.storage/issues/1059)) ([#1196](https://github.com/web3-storage/web3.storage/issues/1196)) ([dd9ce3b](https://github.com/web3-storage/web3.storage/commit/dd9ce3b89ccfb0b8b5a663e1673937c992720617))
* upload fn ts wrongly inserted ([#570](https://github.com/web3-storage/web3.storage/issues/570)) ([c9de809](https://github.com/web3-storage/web3.storage/commit/c9de809d4bda1939e6867f22fef986d493888bfe))
* upload type in upload enum for db ([#490](https://github.com/web3-storage/web3.storage/issues/490)) ([ed8f089](https://github.com/web3-storage/web3.storage/commit/ed8f0897082160015a0fa7a23ac0ec55bd78bceb))
* upsert pins location ipfs_peer_id property name ([#1126](https://github.com/web3-storage/web3.storage/issues/1126)) ([cf46d1d](https://github.com/web3-storage/web3.storage/commit/cf46d1d7fb3b2a0f6d7ab539bfd07826b078ff07))
* use ipfs peerId as pin location ([#966](https://github.com/web3-storage/web3.storage/issues/966)) ([5ae212d](https://github.com/web3-storage/web3.storage/commit/5ae212da21692da2fe9d08a53463b15875ec0cd7))
* use rpc for pins upsert ([#1088](https://github.com/web3-storage/web3.storage/issues/1088)) ([6a8e394](https://github.com/web3-storage/web3.storage/commit/6a8e394af8a63315db91bed82c17e77c13fb9fc2))
* use upsertpins ([#938](https://github.com/web3-storage/web3.storage/issues/938)) ([d593a19](https://github.com/web3-storage/web3.storage/commit/d593a19a1c595b201ab27d62db23d2b6c4dc1bf2))
* user mapping for stats user ([#1121](https://github.com/web3-storage/web3.storage/issues/1121)) ([302cf2f](https://github.com/web3-storage/web3.storage/commit/302cf2f5f45a4c8499dafcd6bf3df8e77e386e90))


### Other Changes

* add missing indexes for fk ([#632](https://github.com/web3-storage/web3.storage/issues/632)) ([0a26912](https://github.com/web3-storage/web3.storage/commit/0a26912389508296f66e5efeb91952119b768748))
* api rewire ([#524](https://github.com/web3-storage/web3.storage/issues/524)) ([f4f9cd3](https://github.com/web3-storage/web3.storage/commit/f4f9cd39f0859b843067057af9bcdbf4f29063e9))
* create tool package with ipfs-cluster docker-compose setup. ([d6ee483](https://github.com/web3-storage/web3.storage/commit/d6ee4831237efcfc24e9fb8ee4c835533b16fbe7))
* do not convert bigint to number ([#1366](https://github.com/web3-storage/web3.storage/issues/1366)) ([eae21dd](https://github.com/web3-storage/web3.storage/commit/eae21dd7a19d7d1fd5601ebbdea34216b83cae0c))
* fix tags in api user info ([#1379](https://github.com/web3-storage/web3.storage/issues/1379)) ([fdf6c76](https://github.com/web3-storage/web3.storage/commit/fdf6c760ea41c6befb6308d651d1621e31572d37))
* fix typedefs for user tag functions ([#1387](https://github.com/web3-storage/web3.storage/issues/1387)) ([6f3500c](https://github.com/web3-storage/web3.storage/commit/6f3500cf93e22c37af09d12a0f5e1f5e68194286))
* flush data between tests and expose utils ([#1109](https://github.com/web3-storage/web3.storage/issues/1109)) ([802d105](https://github.com/web3-storage/web3.storage/commit/802d105d6c9eea714c114830955fd2d2e2542b85))
* improv repo setup documentation ([98c9df7](https://github.com/web3-storage/web3.storage/commit/98c9df7aae875f4db1dc9896ecd7b3b2388540c8))
* improve docs for updating schemas and db error logging  ([51021f1](https://github.com/web3-storage/web3.storage/commit/51021f11785914b7ae9fb43979b95be101ee8bf1))
* move dockerized services in cron tests ([#1148](https://github.com/web3-storage/web3.storage/issues/1148)) ([1efa21f](https://github.com/web3-storage/web3.storage/commit/1efa21f14a39b7c8a0125dba86302e2966c8ba2c))
* optimise getUserByStorage query ([#1405](https://github.com/web3-storage/web3.storage/issues/1405)) ([f9e013a](https://github.com/web3-storage/web3.storage/commit/f9e013a1c3d5e03f67c1b576b16daf295c324949))
* release @web3-storage/db 2.3.0 ([#495](https://github.com/web3-storage/web3.storage/issues/495)) ([b5c14b4](https://github.com/web3-storage/web3.storage/commit/b5c14b46752235bd610f1ad31a1f129e9f34f288))
* release @web3-storage/db 2.3.1 ([#502](https://github.com/web3-storage/web3.storage/issues/502)) ([c92745a](https://github.com/web3-storage/web3.storage/commit/c92745a7628e9ffd7253ec0c40bb3c1f420031b5))
* release @web3-storage/db 2.4.0 ([#553](https://github.com/web3-storage/web3.storage/issues/553)) ([f9c5451](https://github.com/web3-storage/web3.storage/commit/f9c5451c8fc02b453bcea8c091c1b592024ae7f2))
* release @web3-storage/db 2.5.0 ([#576](https://github.com/web3-storage/web3.storage/issues/576)) ([0a5f359](https://github.com/web3-storage/web3.storage/commit/0a5f35929ecc81ed799fd45b5adb51d0397423ce))
* release @web3-storage/db 2.6.0 ([#586](https://github.com/web3-storage/web3.storage/issues/586)) ([19da348](https://github.com/web3-storage/web3.storage/commit/19da3486be320cbeb91f319eadde13cce6425184))
* release @web3-storage/db 2.6.1 ([#603](https://github.com/web3-storage/web3.storage/issues/603)) ([220fbf0](https://github.com/web3-storage/web3.storage/commit/220fbf0dda83f6b1c3fb9d85a31be77fee2d25f7))
* release @web3-storage/db 2.6.2 ([#621](https://github.com/web3-storage/web3.storage/issues/621)) ([0617903](https://github.com/web3-storage/web3.storage/commit/061790388278b0ec2a11d7d51f45ebeb25e0a00c))
* release @web3-storage/db 2.6.3 ([#626](https://github.com/web3-storage/web3.storage/issues/626)) ([3869fa9](https://github.com/web3-storage/web3.storage/commit/3869fa97754eb7bb46bec75ea3a536ec12a77c83))
* release @web3-storage/db 2.6.4 ([#630](https://github.com/web3-storage/web3.storage/issues/630)) ([21c3063](https://github.com/web3-storage/web3.storage/commit/21c3063750b41eb56b9db8c85b5758da0a735584))
* release @web3-storage/db 3.0.0 ([#637](https://github.com/web3-storage/web3.storage/issues/637)) ([52c5aec](https://github.com/web3-storage/web3.storage/commit/52c5aec72e11b6b116966f282442a719b06cb519))
* release @web3-storage/db 3.0.1 ([#644](https://github.com/web3-storage/web3.storage/issues/644)) ([c583853](https://github.com/web3-storage/web3.storage/commit/c583853b7371dcf82bf380472fb4e9a01a8b4e4d))
* release @web3-storage/db 3.0.2 ([#654](https://github.com/web3-storage/web3.storage/issues/654)) ([6ec15b7](https://github.com/web3-storage/web3.storage/commit/6ec15b73fbc4fe1e08ced23f14c524409ffc51fd))
* release @web3-storage/db 3.1.0 ([#700](https://github.com/web3-storage/web3.storage/issues/700)) ([83cd8f3](https://github.com/web3-storage/web3.storage/commit/83cd8f32caf3788070f45dd6b9f37209f55982fc))
* release @web3-storage/db 4.0.0 ([#753](https://github.com/web3-storage/web3.storage/issues/753)) ([723be14](https://github.com/web3-storage/web3.storage/commit/723be14ebc1f369bfada7c2a8f5e25f9164f4a02))
* release @web3-storage/db 4.0.1 ([#767](https://github.com/web3-storage/web3.storage/issues/767)) ([30b834b](https://github.com/web3-storage/web3.storage/commit/30b834b5c87fd8ab891f6f1c754bd8b04f587c74))
* release @web3-storage/db 4.0.2 ([#777](https://github.com/web3-storage/web3.storage/issues/777)) ([064fc93](https://github.com/web3-storage/web3.storage/commit/064fc9387d8681c914bb4511ac03ed5697a8229d))
* release @web3-storage/db 4.0.3 ([#787](https://github.com/web3-storage/web3.storage/issues/787)) ([cac8069](https://github.com/web3-storage/web3.storage/commit/cac8069d29cca846b7c119bbe5d2d58d6694603e))
* release @web3-storage/db 4.0.4 ([#796](https://github.com/web3-storage/web3.storage/issues/796)) ([f5b8caf](https://github.com/web3-storage/web3.storage/commit/f5b8caf5db85d8399a1a08237e5fccf6ada44e93))
* remove migration tracking table ([#832](https://github.com/web3-storage/web3.storage/issues/832)) ([cf6e628](https://github.com/web3-storage/web3.storage/commit/cf6e628c5e74a44d4206dd7f7cd21ffe1005c9f7))
* remove package lock files from packages ([#1169](https://github.com/web3-storage/web3.storage/issues/1169)) ([bef6e0b](https://github.com/web3-storage/web3.storage/commit/bef6e0be2cb96aeb8a5eaa136ba1936d14678258))
* remove unnecessary migration for creating admin user ([#1373](https://github.com/web3-storage/web3.storage/issues/1373)) ([27ca9c2](https://github.com/web3-storage/web3.storage/commit/27ca9c21f2cb231a0f998364242e91da82784b2a))
* rename pinned to psaPinned ([#1268](https://github.com/web3-storage/web3.storage/issues/1268)) ([aeae342](https://github.com/web3-storage/web3.storage/commit/aeae342547b1fb15c17069f6d019beae250564f5))
* rename update admin search migration script to 7 ([#1218](https://github.com/web3-storage/web3.storage/issues/1218)) ([07d78e3](https://github.com/web3-storage/web3.storage/commit/07d78e30752cc887d75febbbbada140f57a43712))
* send list of storage quota violators to support@web3.storage, not admin@ ([#1369](https://github.com/web3-storage/web3.storage/issues/1369)) ([f5d988e](https://github.com/web3-storage/web3.storage/commit/f5d988ed0ec3b98df7508e808be4fab09675af5e))
* single top level dev .env file and quicker quickstart ([#1021](https://github.com/web3-storage/web3.storage/issues/1021)) ([e537f26](https://github.com/web3-storage/web3.storage/commit/e537f26adda97a0475335ffac5c86beb7a5ede18))
* update DB migrations documentation ([57df784](https://github.com/web3-storage/web3.storage/commit/57df7843b047ae181b1f0fa2e83543e781419162))
* update licenses ([#831](https://github.com/web3-storage/web3.storage/issues/831)) ([8e081aa](https://github.com/web3-storage/web3.storage/commit/8e081aac2dd03dd5eb642bff9c2da867d61edd87))
* update migration number ([#1480](https://github.com/web3-storage/web3.storage/issues/1480)) ([5f0ff76](https://github.com/web3-storage/web3.storage/commit/5f0ff76bc975f928cd6947d354e4b6f97e69e32f))
* update pgrest ([#816](https://github.com/web3-storage/web3.storage/issues/816)) ([574baad](https://github.com/web3-storage/web3.storage/commit/574baad961c3a4524212ad7a27c30d150ca150c0))
* update SQL migration to drop the old `users_by_storage_used` function before replacing ([#1414](https://github.com/web3-storage/web3.storage/issues/1414)) ([6ddfdf3](https://github.com/web3-storage/web3.storage/commit/6ddfdf3d9aeee1dadff25270717bd406a4fa9e6d))
* use mocha to run package/db tests ([#1149](https://github.com/web3-storage/web3.storage/issues/1149)) ([a374aab](https://github.com/web3-storage/web3.storage/commit/a374aab655b5c5cc89f080783d642fedb2813e26))

### [4.0.4](https://www.github.com/web3-storage/web3.storage/compare/db-v4.0.3...db-v4.0.4) (2022-01-04)


### Bug Fixes

* backup unique constraint ([#795](https://www.github.com/web3-storage/web3.storage/issues/795)) ([b19790f](https://www.github.com/web3-storage/web3.storage/commit/b19790f621fd6544f3abdf944edde95697227f76))


### Changes

* update pgrest ([#816](https://www.github.com/web3-storage/web3.storage/issues/816)) ([574baad](https://www.github.com/web3-storage/web3.storage/commit/574baad961c3a4524212ad7a27c30d150ca150c0))

### [4.0.3](https://www.github.com/web3-storage/web3.storage/compare/db-v4.0.2...db-v4.0.3) (2021-12-14)


### Bug Fixes

* improve list tokens ([#782](https://www.github.com/web3-storage/web3.storage/issues/782)) ([b58a101](https://www.github.com/web3-storage/web3.storage/commit/b58a1018c2cb2cd7f838dbc0e1fefef446b06eae))

### [4.0.2](https://www.github.com/web3-storage/web3.storage/compare/db-v4.0.1...db-v4.0.2) (2021-12-10)


### Bug Fixes

* delete ops should update updated ts ([#774](https://www.github.com/web3-storage/web3.storage/issues/774)) ([88b6c09](https://www.github.com/web3-storage/web3.storage/commit/88b6c0910b4e33b56d912b6fa53eb62301e0aec2))


### Changes

* create tool package with ipfs-cluster docker-compose setup. ([d6ee483](https://www.github.com/web3-storage/web3.storage/commit/d6ee4831237efcfc24e9fb8ee4c835533b16fbe7))

### [4.0.1](https://www.github.com/web3-storage/web3.storage/compare/db-v4.0.0...db-v4.0.1) (2021-12-09)


### Bug Fixes

* api using db instead of mocks for tests ([#765](https://www.github.com/web3-storage/web3.storage/issues/765)) ([c9f6c06](https://www.github.com/web3-storage/web3.storage/commit/c9f6c066a5d46367d57a6f0de482166621c3fe38))
* db delete key return value ([#766](https://www.github.com/web3-storage/web3.storage/issues/766)) ([34f5f82](https://www.github.com/web3-storage/web3.storage/commit/34f5f826f68ff8407fad0a6e9d0a20f6e4d99d47))
* remove dagcargo materialized views ([#735](https://www.github.com/web3-storage/web3.storage/issues/735)) ([62db538](https://www.github.com/web3-storage/web3.storage/commit/62db5383f39e7d3e3484ccb51bd4eb3de816bcfd))
* tolerant of failure for deals ([#769](https://www.github.com/web3-storage/web3.storage/issues/769)) ([2bae4d4](https://www.github.com/web3-storage/web3.storage/commit/2bae4d438b570de0905d1b7d577654657ddc1282))

## [4.0.0](https://www.github.com/web3-storage/web3.storage/compare/db-v3.1.0...db-v4.0.0) (2021-12-06)


### ⚠ BREAKING CHANGES

* client should not throw on 404 (#751)

### Bug Fixes

* client should not throw on 404 ([#751](https://www.github.com/web3-storage/web3.storage/issues/751)) ([a4cce7e](https://www.github.com/web3-storage/web3.storage/commit/a4cce7eb67a6dab6a75c5c86bcebe4dc66ecd6e4))

## [3.1.0](https://www.github.com/web3-storage/web3.storage/compare/db-v3.0.2...db-v3.1.0) (2021-12-01)


### Features

* simple mutability API using IPNS ([#648](https://www.github.com/web3-storage/web3.storage/issues/648)) ([9c287bb](https://www.github.com/web3-storage/web3.storage/commit/9c287bb7c983d3adab6ebb304decb47c5093ad78))


### Bug Fixes

* data CID is root CID of aggregate, not content CID ([#720](https://www.github.com/web3-storage/web3.storage/issues/720)) ([8c67725](https://www.github.com/web3-storage/web3.storage/commit/8c677259635a3deb30c948330f8ea118053309ce))
* deal status filtering ([#692](https://www.github.com/web3-storage/web3.storage/issues/692)) ([a7b4151](https://www.github.com/web3-storage/web3.storage/commit/a7b4151b05fa55646d337a090263a1eeb77b8169))
* postgres set max parallel workers per gather to 4 ([#725](https://www.github.com/web3-storage/web3.storage/issues/725)) ([9cdfcfa](https://www.github.com/web3-storage/web3.storage/commit/9cdfcfa51063ae2a9a87cd71a05a6e2d42cea887))

### [3.0.2](https://www.github.com/web3-storage/web3.storage/compare/db-v3.0.1...db-v3.0.2) (2021-11-23)


### Bug Fixes

* deal normalize should filter out unexpected deal status ([#682](https://www.github.com/web3-storage/web3.storage/issues/682)) ([0e233cc](https://www.github.com/web3-storage/web3.storage/commit/0e233cc5af499a032cf83e3454eefbfb7ef2b0a0))
* fixes and improv to types annotations across the board ([46a3f1c](https://www.github.com/web3-storage/web3.storage/commit/46a3f1cbe3da6ac401d9b4fddc5723ba62841ec7))
* pin dag size metric should filter by pinned status ([#646](https://www.github.com/web3-storage/web3.storage/issues/646)) ([547f466](https://www.github.com/web3-storage/web3.storage/commit/547f4663c70d3916aeb056b103fc5470ba8b52cd))
* pin normalize should filter out unexpected pin status ([#677](https://www.github.com/web3-storage/web3.storage/issues/677)) ([f8c78b4](https://www.github.com/web3-storage/web3.storage/commit/f8c78b4ff3377c19a9bc101a7c8c97757cc511ae))
* prevent table.sql to fail if a type already exists ([22b222a](https://www.github.com/web3-storage/web3.storage/commit/22b222ad320e9933f01d9c59fc5b59b4fb05fa53))

### [3.0.1](https://www.github.com/web3-storage/web3.storage/compare/db-v3.0.0...db-v3.0.1) (2021-11-17)


### Bug Fixes

* list uploads fetch deals for correct cid ([#643](https://www.github.com/web3-storage/web3.storage/issues/643)) ([df1be1f](https://www.github.com/web3-storage/web3.storage/commit/df1be1fe65d781bda985e2710b4c89b52803ca35))

## [3.0.0](https://www.github.com/web3-storage/web3.storage/compare/db-v2.6.4...db-v3.0.0) (2021-11-17)


### ⚠ BREAKING CHANGES

* remove faunadb (#610)

### Features

* add pin composite pinned at idx ([#634](https://www.github.com/web3-storage/web3.storage/issues/634)) ([6b64d7f](https://www.github.com/web3-storage/web3.storage/commit/6b64d7fd20f1fde769eaf66626b8bdb3eea5c7a2))


### Bug Fixes

* metrics for pin status response ([eb9f9ca](https://www.github.com/web3-storage/web3.storage/commit/eb9f9cac67aaa7b4d23d91a034ebddb0dcf8b92b))
* remove faunadb ([#610](https://www.github.com/web3-storage/web3.storage/issues/610)) ([631e23f](https://www.github.com/web3-storage/web3.storage/commit/631e23f304ae3bef7d022041a39f72bc9438f469))


### Changes

* add missing indexes for fk ([#632](https://www.github.com/web3-storage/web3.storage/issues/632)) ([0a26912](https://www.github.com/web3-storage/web3.storage/commit/0a26912389508296f66e5efeb91952119b768748))

### [2.6.4](https://www.github.com/web3-storage/web3.storage/compare/db-v2.6.3...db-v2.6.4) (2021-11-15)


### Bug Fixes

* pin status metrics returns data object ([#628](https://www.github.com/web3-storage/web3.storage/issues/628)) ([20877ae](https://www.github.com/web3-storage/web3.storage/commit/20877aeed7730a81d08435be6bee1dfe6d9afebe))

### [2.6.3](https://www.github.com/web3-storage/web3.storage/compare/db-v2.6.2...db-v2.6.3) (2021-11-15)


### Bug Fixes

* performance metrics queries ([#625](https://www.github.com/web3-storage/web3.storage/issues/625)) ([85efba5](https://www.github.com/web3-storage/web3.storage/commit/85efba5c2ba0b65def2a93e2b811268e9ab96b00))

### [2.6.2](https://www.github.com/web3-storage/web3.storage/compare/db-v2.6.1...db-v2.6.2) (2021-11-15)


### Bug Fixes

* add indexes and optimise token list function ([#618](https://www.github.com/web3-storage/web3.storage/issues/618)) ([05ff3ed](https://www.github.com/web3-storage/web3.storage/commit/05ff3ed907977816f4609c049ceb910333c2b545))
* pin sync req id text ([#622](https://www.github.com/web3-storage/web3.storage/issues/622)) ([dee0a4e](https://www.github.com/web3-storage/web3.storage/commit/dee0a4ea2c92f435b4669825894341faf317f658))

### [2.6.1](https://www.github.com/web3-storage/web3.storage/compare/db-v2.6.0...db-v2.6.1) (2021-11-12)


### Bug Fixes

* add missing sql drop functions ([#605](https://www.github.com/web3-storage/web3.storage/issues/605)) ([0f01eb6](https://www.github.com/web3-storage/web3.storage/commit/0f01eb6c73cf95d8860e27d42619f2b7ac0c3a45))
* add on conflict clause to create backup ([#602](https://www.github.com/web3-storage/web3.storage/issues/602)) ([504809e](https://www.github.com/web3-storage/web3.storage/commit/504809ecdc4b87fd472874a3b4fe0eb8e336a357))
* bigserial id cast to string ([#604](https://www.github.com/web3-storage/web3.storage/issues/604)) ([7c6b9b4](https://www.github.com/web3-storage/web3.storage/commit/7c6b9b4c66742652ace92c8e71d42a0f9c945acb))


### Changes

* improve docs for updating schemas and db error logging  ([51021f1](https://www.github.com/web3-storage/web3.storage/commit/51021f11785914b7ae9fb43979b95be101ee8bf1))

## [2.6.0](https://www.github.com/web3-storage/web3.storage/compare/db-v2.5.0...db-v2.6.0) (2021-11-10)


### Features

* add user email to account page ([#566](https://www.github.com/web3-storage/web3.storage/issues/566)) ([a34d976](https://www.github.com/web3-storage/web3.storage/commit/a34d97623eaa2153c9bf068c3a099f3c463af1a3))


### Bug Fixes

* fauna pins cron ([#592](https://www.github.com/web3-storage/web3.storage/issues/592)) ([f1df5dc](https://www.github.com/web3-storage/web3.storage/commit/f1df5dc9140d96acb516cb79f5ee39469db64395))
* re-add constraints ([#597](https://www.github.com/web3-storage/web3.storage/issues/597)) ([596e65c](https://www.github.com/web3-storage/web3.storage/commit/596e65cf9220953d82f7b5e85ab71e616b6424b3))

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
