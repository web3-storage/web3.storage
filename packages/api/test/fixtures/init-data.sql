-- Mock DB data for API tests
INSERT INTO public.user (id, name, email, issuer, public_address)
VALUES (1, 'test-user', 'test@user.com', 'test-magic-issuer', 'test-magic');

INSERT INTO public.user (id, name, email, issuer, public_address)
VALUES (2, 'test-upload-user', 'test-upload@user.com', 'test-upload', 'test-upload');

INSERT INTO public.user (id, name, email, issuer, public_address)
VALUES (3, 'test-status-user', 'test-status@user.com', 'test-status', 'test-status');

INSERT INTO auth_key (name, secret, user_id)
VALUES ('test-key', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0LW1hZ2ljLWlzc3VlciIsImlzcyI6IndlYjMtc3RvcmFnZSIsImlhdCI6MTYzMzk1NzM4OTg3MiwibmFtZSI6InRlc3QtbWFnaWMtaXNzdWVyIn0.p2nD1Q4X4Z6DtJ0vxk35hhZOqSPVymhN5uyXrXth1zs', 1);

-- Used for testing with DANGEROUSLY_BYPASS_MAGIC_AUTH
INSERT INTO auth_key (name, secret, user_id)
VALUES ('test-magic-key', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0LW1hZ2ljLWlzc3VlciIsImlzcyI6IndlYjMtc3RvcmFnZSIsImlhdCI6MTYzMzk1NzM4OTg3MiwibmFtZSI6InRlc3QtbWFnaWMtaXNzdWVyIn0.p2nD1Q4X4Z6DtJ0vxk35hhZOqSPVymhN5uyXrXth1zs', 1);

INSERT INTO auth_key (name, secret, user_id)
VALUES ('test-upload-key', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0LXVwbG9hZCIsImlzcyI6IndlYjMtc3RvcmFnZSIsImlhdCI6MTYzMzk1NzM4OTg3MiwibmFtZSI6InRlc3QtdXBsb2FkIn0.K30NZxNOTUdJ0u-2dRGbZYXu2A2-TqcNdRV-G1HkKnI', 2);

-- /user route data testing
INSERT INTO content (cid)
VALUES ('bafkreigpimx5kl6thyfysh2witvbo5nexvu3q3uc3y65rj5sr5czcc7wae'),
       ('bafybeigc4fntpegrqzgzhxyc7hzu25ykqqai7nzllov2jn55wvzjju7pwu'),
       ('bafkreiajkbmpugz75eg2tmocmp3e33sg5kuyq2amzngslahgn6ltmqxxfa');
INSERT INTO upload (user_id, content_cid, source_cid, type, name, inserted_at, updated_at)
VALUES (1, 'bafkreigpimx5kl6thyfysh2witvbo5nexvu3q3uc3y65rj5sr5czcc7wae', 'bafkreigpimx5kl6thyfysh2witvbo5nexvu3q3uc3y65rj5sr5czcc7wae', 'Car', 'Upload at 2021-07-09T16:20:32.658Z', '2021-07-09T16:20:33.946845Z', '2021-07-09T16:20:33.946845Z'),
       (1, 'bafybeigc4fntpegrqzgzhxyc7hzu25ykqqai7nzllov2jn55wvzjju7pwu', 'bafybeigc4fntpegrqzgzhxyc7hzu25ykqqai7nzllov2jn55wvzjju7pwu', 'Car', 'week-in-web3-2021-07-02.mov', '2021-07-09T10:40:35.408884Z', '2021-07-09T10:40:35.408884Z'),
       (1, 'bafkreiajkbmpugz75eg2tmocmp3e33sg5kuyq2amzngslahgn6ltmqxxfa', 'bafkreiajkbmpugz75eg2tmocmp3e33sg5kuyq2amzngslahgn6ltmqxxfa', 'Car', 'pinpie.jpg', '2021-07-09T10:36:05.862862Z', '2021-07-09T10:36:05.862862Z');

-- /status route data testing
INSERT INTO content (cid, dag_size, inserted_at)
VALUES ('bafybeifnfkzjeohjf2dch2iqqpef3bfjylwxlcjws2msvdfyze5bvdprfm', 101, '2021-07-14T19:27:14.934572Z'),
       ('bafybeica6klnrhlrbx6z24icefykpbwyypouglnypvnwb5esdm6yzcie3q', 101, '2021-07-14T19:27:14.934572Z'),
       ('bafybeiaiipiibr7aletbbrzmpklw4l5go6sodl22xs6qtcqo3lqogfogy4', 101, '2021-07-14T19:27:14.934572Z');

INSERT INTO upload (user_id, content_cid, source_cid, type, inserted_at, updated_at)
VALUES (3, 'bafybeifnfkzjeohjf2dch2iqqpef3bfjylwxlcjws2msvdfyze5bvdprfm', 'bafybeifnfkzjeohjf2dch2iqqpef3bfjylwxlcjws2msvdfyze5bvdprfm', 'Car', '2021-07-14T19:27:14.934572Z', '2021-07-14T19:27:14.934572Z'),
       (3, 'bafybeica6klnrhlrbx6z24icefykpbwyypouglnypvnwb5esdm6yzcie3q', 'bafybeica6klnrhlrbx6z24icefykpbwyypouglnypvnwb5esdm6yzcie3q', 'Car', '2021-07-14T19:27:14.934572Z', '2021-07-14T19:27:14.934572Z'),
       (3, 'bafybeiaiipiibr7aletbbrzmpklw4l5go6sodl22xs6qtcqo3lqogfogy4', 'bafybeiaiipiibr7aletbbrzmpklw4l5go6sodl22xs6qtcqo3lqogfogy4', 'Car', '2021-07-14T19:27:14.934572Z', '2021-07-14T19:27:14.934572Z');

INSERT INTO pin_location (peer_id, peer_name, region)
VALUES ('12D3KooWR1Js', 'who?', 'where?');

INSERT INTO pin (status, content_cid, pin_location_id, inserted_at, updated_at)
VALUES ('Pinned', 'bafybeifnfkzjeohjf2dch2iqqpef3bfjylwxlcjws2msvdfyze5bvdprfm', 1, '2021-07-14T19:27:14.934572+00:00', '2021-07-14T19:27:14.934572+00:00'),
       ('Pinned', 'bafybeica6klnrhlrbx6z24icefykpbwyypouglnypvnwb5esdm6yzcie3q', 1, '2021-07-14T19:27:14.934572+00:00', '2021-07-14T19:27:14.934572+00:00'),
       ('Pinned', 'bafybeiaiipiibr7aletbbrzmpklw4l5go6sodl22xs6qtcqo3lqogfogy4', 1, '2021-07-14T19:27:14.934572+00:00', '2021-07-14T19:27:14.934572+00:00');

INSERT INTO cargo.aggregate_entries (aggregate_cid, cid_v1, datamodel_selector) VALUES
('bafybeiek5gau46j4dxoyty27qtirb3iuoq7aax4l3xt25mfk2igyt35bme', 'bafybeifnfkzjeohjf2dch2iqqpef3bfjylwxlcjws2msvdfyze5bvdprfm', 'Links/0/Links'),
('bafybeiek5gau46j4dxoyty27qtirb3iuoq7aax4l3xt25mfk2igyt35bmf', 'bafybeica6klnrhlrbx6z24icefykpbwyypouglnypvnwb5esdm6yzcie3q', 'Links/0/Links');

INSERT INTO cargo.aggregates (aggregate_cid, piece_cid, sha256hex, export_size, metadata, entry_created) VALUES
('bafybeiek5gau46j4dxoyty27qtirb3iuoq7aax4l3xt25mfk2igyt35bme', 'bafybeidymjmzqihaz7oeiod3zyolzgcxwbum4b4nvo4aublm6quh6zb3ae', '9ad34a5221cc171dcc61c0862680634ca065c32972ab59f92626b7f2f18ca3fc', 25515304172, '{"Version": 1, "RecordType": "DagAggregate UnixFS"}', '2021-09-09 14:41:14.099613+00'),
('bafybeiek5gau46j4dxoyty27qtirb3iuoq7aax4l3xt25mfk2igyt35bmf', 'bafybeidymjmzqihaz7oeiod3zyolzgcxwbum4b4nvo4aublm6quh6zb5af', '9ad34a5221cc171dcc61c0862680634ca065c32972ab59f92626b7f2f18ca3fc', 25515304172, '{"Version": 1, "RecordType": "DagAggregate UnixFS"}', '2021-09-09 14:41:14.099613+00');

INSERT INTO cargo.deals (deal_id, aggregate_cid, client, provider, status, start_epoch, end_epoch, entry_created, entry_last_updated, status_meta, start_time, sector_start_epoch, sector_start_time, end_time) VALUES
(2424132, 'bafybeiek5gau46j4dxoyty27qtirb3iuoq7aax4l3xt25mfk2igyt35bme', 'f144zep4gitj73rrujd3jw6iprljicx6vl4wbeavi', 'f0678914', 'active', 1102102, 2570902, '2021-09-09 16:30:52.252233+00', '2021-09-10 00:45:50.408956+00', 'containing sector active as of 2021-09-10 00:36:30 at epoch 1097593', '2021-09-11 14:11:00+00', 1097593, '2021-09-10 00:36:30+00', '2023-02-03 14:11:00+00'),
(2424133, 'bafybeiek5gau46j4dxoyty27qtirb3iuoq7aax4l3xt25mfk2igyt35bmf', 'f144zep4gitj73rrujd3jw6iprljicx6vl4wbeavi', 'f0678914', 'queued', 1102102, 2570902, '2021-09-09 16:30:52.252233+00', '2021-09-10 00:45:50.408956+00', 'containing sector active as of 2021-09-10 00:36:30 at epoch 1097593', '2021-09-11 14:11:00+00', 1097593, '2021-09-10 00:36:30+00', '2023-02-03 14:11:00+00');

-- /name route data testing
INSERT INTO public.name (key, record, has_v2_sig, seqno, validity)
VALUES (
  'k51qzi5uqu5dl2hq2hm5m29sdq1lum0kb0lmyqsowicmrmxzxywwgxhy6ymrdv',
  'CkEvaXBmcy9iYWZrcmVpZW00dHdrcXpzcTJhajRzaGJ5Y2Q0eXZvajJjeDcydmV6aWNsZXRsaGk3ZGlqamNpcXB1aRJAiThIzmqigDqiV4p4tJ31wiWuMy4gWAuZaPdGzXdIOm+SYfJ/JlDNUAXILZO7vh0mkHdFYLeHouHZFMQI2dqrARgAIh4yMDIxLTExLTE2VDIyOjQ2OjA4Ljg5NjAwMDAwMFooADCAoLCNvQpCQLiFTWU8F+O8R/V+ql5glmnaBEh8+bBKZ6o1s84+TGeVlzqRn/2XstFYV83ilEHseU4bvHfxwaxLoucJaMYeNQVKmAGlY1RUTBsAAABT0awQAGVWYWx1ZVhBL2lwZnMvYmFma3JlaWVtNHR3a3F6c3EyYWo0c2hieWNkNHl2b2oyY3g3MnZlemljbGV0bGhpN2RpampjaXFwdWloU2VxdWVuY2UAaFZhbGlkaXR5WB4yMDIxLTExLTE2VDIyOjQ2OjA4Ljg5NjAwMDAwMFpsVmFsaWRpdHlUeXBlAA==',
  true,
  1,
  1669394359626000000
);

-- /pins route testing
INSERT INTO content (cid)
VALUES  ('bafybeid46f7zggioxjm5p2ze2l6s6wbqvoo4gzbdzfjtdosthmfyxdign4'),
        ('bafybeig7yvw6a4uhio4pmg5gahyd2xumowkfljdukad7pmdsv5uk5zcseu'),
        ('bafybeia45bscvzxngto555xsel4gwoclb5fxd7zpxige7rl3maoleznswu'),
        ('bafybeidw7pc6nvm7u4rfhpctac4qgtpmwxapw4duugvsl3ppivvzibdlgy'),
        ('bafybeidrzt6t4k25qjeasydgi3fyh6ejos5x4d6tk2pdzxkb66bkomezy4'),
        ('bafybeifsrhq2qtkcgjt4gzi7rkafrv2gaai24ptt6rohe2ebqzydkz47sm'),
        ('bafybeiaqu6ijhfhwzjipwesbqf4myz6uczyigahib5joqbo5jw2xmjczfa'),
        ('bafybeidqts3rbwkprggjojbvcxy4jzpgzgcvs4a73y3gx2jjxphjeerbcy');
      

INSERT INTO pa_pin_request (auth_key_id, content_cid, requested_cid, name, inserted_at, updated_at)
VALUES (3, 'bafybeid46f7zggioxjm5p2ze2l6s6wbqvoo4gzbdzfjtdosthmfyxdign4', 'bafybeid46f7zggioxjm5p2ze2l6s6wbqvoo4gzbdzfjtdosthmfyxdign4', 'ReportDoc.pdf', '2021-07-14T19:27:14.934572Z', '2021-07-14T19:27:14.934572Z'),
       (3, 'bafybeig7yvw6a4uhio4pmg5gahyd2xumowkfljdukad7pmdsv5uk5zcseu', 'bafybeig7yvw6a4uhio4pmg5gahyd2xumowkfljdukad7pmdsv5uk5zcseu', 'reportdoc.pdf', '2021-01-01T19:27:14.934572Z', '2021-07-14T19:27:14.934572Z'),
       (3, 'bafybeia45bscvzxngto555xsel4gwoclb5fxd7zpxige7rl3maoleznswu', 'bafybeia45bscvzxngto555xsel4gwoclb5fxd7zpxige7rl3maoleznswu', 'Data', '2021-07-14T19:27:14.934572Z', '2021-07-14T19:27:14.934572Z'),
       (3, 'bafybeidw7pc6nvm7u4rfhpctac4qgtpmwxapw4duugvsl3ppivvzibdlgy', 'bafybeidw7pc6nvm7u4rfhpctac4qgtpmwxapw4duugvsl3ppivvzibdlgy', 'Image.jpeg', '2021-07-14T19:27:14.934572Z', '2021-07-14T19:27:14.934572Z'),
       (3, 'bafybeidrzt6t4k25qjeasydgi3fyh6ejos5x4d6tk2pdzxkb66bkomezy4', 'bafybeidrzt6t4k25qjeasydgi3fyh6ejos5x4d6tk2pdzxkb66bkomezy4', 'Image.png', '2021-07-14T19:27:14.934572Z', '2021-07-14T19:27:14.934572Z'),
       (3, 'bafybeifsrhq2qtkcgjt4gzi7rkafrv2gaai24ptt6rohe2ebqzydkz47sm', 'bafybeifsrhq2qtkcgjt4gzi7rkafrv2gaai24ptt6rohe2ebqzydkz47sm', 'Image.jpg', '2021-07-20T19:27:14.934572Z', '2021-07-14T19:27:14.934572Z'),
       (2, 'bafybeiaqu6ijhfhwzjipwesbqf4myz6uczyigahib5joqbo5jw2xmjczfa', 'bafybeiaqu6ijhfhwzjipwesbqf4myz6uczyigahib5joqbo5jw2xmjczfa', 'Image.jpg', '2021-07-20T19:27:14.934572Z', '2021-07-14T19:27:14.934572Z'),
       (2, 'bafybeidqts3rbwkprggjojbvcxy4jzpgzgcvs4a73y3gx2jjxphjeerbcy', 'bafybeidqts3rbwkprggjojbvcxy4jzpgzgcvs4a73y3gx2jjxphjeerbcy', 'Image.jpg', '2021-07-14T19:27:14.934572Z', '2021-07-14T19:27:14.934572Z');
