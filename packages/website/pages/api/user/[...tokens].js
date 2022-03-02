const secret = `${Number.MAX_SAFE_INTEGER}.${Number.MAX_SAFE_INTEGER * 2}.${Number.MAX_SAFE_INTEGER * 3}.${
  Number.MAX_SAFE_INTEGER * 4
}.${new Date().getTime()}`;
export const tokens = [
  {
    _id: '315318824629961583',
    name: 'my first token',
    secret: `${secret}1`,
    created: '2021-11-29T16:08:33.077+00:00',
    hasUploads: false,
  },
  {
    _id: '315318824629961584',
    name: 'my second token',
    secret: `${secret}2`,
    created: '2021-11-29T17:09:16.617+00:00',
    hasUploads: false,
  },
  {
    _id: '315318824629961585',
    name: 'my third token',
    secret: `${secret}3`,
    created: '2021-12-02T12:01:16.617+00:00',
    hasUploads: false,
  },
  {
    _id: '315318824629961586',
    name: 'my fourth token',
    secret: `${secret}4`,
    created: '2021-12-05T14:44:16.617+00:00',
    hasUploads: true,
  },
];

export default async function handler(req, res) {
  if (process.env.NEXT_PUBLIC_ENV === 'dev') {
    const { tokens: tokensRoute } = req.query;

    if (!!tokensRoute) {
      // Deletion route
      if (!!tokensRoute[1] && req.method === 'DELETE') {
        const targetDeleteIndx = tokens.findIndex(({ _id }) => _id === tokensRoute[1].toString());
        if (targetDeleteIndx !== -1) {
          tokens.splice(targetDeleteIndx, 1);
        }
        // fake wait
        await new Promise(resolve => setTimeout(resolve, 1000));

        return res.status(200).json({ _id: tokensRoute[1] });
      }
      if (req.method === 'POST') {
        const { name } = req.body;
        const newToken = {
          _id: new Date().getTime().toString(),
          name,
          secret: `${secret}${new Date().getTime().toString()}`,
          hasUploads: false,
          created: new Date().toISOString(),
        };
        tokens.push(newToken);
        // fake wait
        await new Promise(resolve => setTimeout(resolve, 1000));

        return res.status(200).json({ _id: newToken._id });
      }
      return res.status(200).json(tokens);
    }
  }

  return res.status(403).json({ message: 'Forbidden.' });
}
