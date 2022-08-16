export default function handler(req, res) {
  console.log('website api user login env', process.env);
  if (process.env.NEXT_PUBLIC_ENV === 'dev') {
    return res.status(200).json({ issuer: 'JohnDoe' });
  }

  return res.status(403).json({ message: 'Forbidden.' });
}
