export const pins = {
  count: 1,
  results: [
    {
      requestid: '70fc4633-0daf-434f-8e81-aef3cbd89c66',
      status: 'pinned',
      created: '2022-05-30T18:08:23.98+00:00',
      pin: {
        cid: 'bafybeiejgdu6vwkzo5hstynnrrrgau23dtkwr2dbdghvohke4avy62j4iy',
        _id: '70fc4633-0daf-434f-8e81-aef3cbd89c66',
        sourceCid: 'bafybeiejgdu6vwkzo5hstynnrrrgau23dtkwr2dbdghvohke4avy62j4iy',
        contentCid: 'bafybeiejgdu6vwkzo5hstynnrrrgau23dtkwr2dbdghvohke4avy62j4iy',
        authKey: '313903969865827000',
        name: 'MVI_9821.MOV',
        meta: null,
        deleted: null,
        created: '2022-05-30T18:08:23.98+00:00',
        updated: '2022-05-30T18:08:23.98+00:00',
        pins: [
          {
            status: 'Pinning',
            updated: '2022-05-30T18:08:23.98+00:00',
            peerId: '12D3KooWSGCJYbM6uCvCF7cGWSitXSJTgEb7zjVCaxDyYNASTa8i',
            peerName: 'nft-storage-sv15',
            region: 'null',
          },
          {
            status: 'Pinning',
            updated: '2022-05-30T18:08:23.98+00:00',
            peerId: '12D3KooWJbARcvvEEF4AAqvAEaVYRkEUNPC3Rv3joebqfPh4LaKq',
            peerName: 'nft-storage-dc13',
            region: null,
          },
          {
            status: 'Pinning',
            updated: '2022-05-30T18:08:23.98+00:00',
            peerId: '12D3KooWNcshtC1XTbPxew2kq3utG2rRGLeMN8y5vSfAMTJMV7fE',
            peerName: 'nft-storage-am6',
            region: null,
          },
        ],
      },
      delegates: [],
    },
  ],
};

export default function handler(_, res) {
  if (process.env.NEXT_PUBLIC_ENV === 'dev') {
    return res.status(200).json(pins);
  }

  return res.status(403).json({ message: 'Forbidden.' });
}
