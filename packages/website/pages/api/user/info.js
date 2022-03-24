export default function handler(req, res) {
  if (process.env.NEXT_PUBLIC_ENV === 'dev') {
    return res.status(200).json({
      _id: Math.floor(Date.now()),
      issuer: `did:ethr${Math.floor(Date.now())}`,
      name: 'John Doe',
      email: 'john.doe@agencyundone.com',
      github: Math.round(Math.random() * 50000 + 50000),
      publicAddress: `0x${Math.floor(Date.now())}`,
      created: '2021-11-29T16:08:06.009729+00:00',
      updated: '2021-11-29T16:08:06.009729+00:00',
    });
  }

  return res.status(403).json({ message: 'Forbidden.' });
}
