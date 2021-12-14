export default function handler(req, res) {
  if (process.env.NEXT_PUBLIC_ENV === 'dev') {
    return res.status(200).json({ name: 'John Doe' });
  }

  return res.status(403).json({ message: 'Forbidden fruit.' });
}
