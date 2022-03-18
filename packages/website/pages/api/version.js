export default function handler(_, res) {
  if (process.env.NEXT_PUBLIC_ENV === 'dev') {
    return res.status(200).json({ mode: 'rw' });
  }

  return res.status(403).json({ message: 'Forbidden.' });
}
