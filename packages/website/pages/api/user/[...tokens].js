const secret = new Date().getTime() + '.secret';
export const tokens = [
  {
    _id: '315318824629961583',
    name: 'test',
    secret,
    created: '2021-11-29T16:08:33.077+00:00',
    hasUploads: false,
  },
  {
    _id: '315318824629961584',
    name: 'tesst',
    secret,
    created: '2021-11-29T16:09:16.617+00:00',
    hasUploads: false,
  },
];

export default function handler(req, res) {
  if (process.env.NEXT_PUBLIC_ENV === 'dev') {
    const { tokens: tokensRoute } = req.query;

    if (!!tokensRoute) {
      // Deletion route
      if (!!tokensRoute[1] && req.method === 'DELETE') {
        const targetDeleteIndx = tokens.findIndex(({ _id }) => _id === tokens[1]);
        if (targetDeleteIndx !== -1) {
          tokens.splice(targetDeleteIndx, 1);
        }
        return { _id: tokensRoute[1] };
      }
      if (req.method === 'POST') {
        const { name } = JSON.parse(req.body);
        const newToken = {
          _id: new Date().getTime().toString(),
          name,
          secret,
          hasUploads: false,
          created: new Date().toISOString(),
        };
        tokens.push(newToken);
        return { _id: newToken._id };
      }
      return res.status(200).json(tokens);
    }
  }

  return res.status(403).json({ message: 'Forbidden.' });
}
