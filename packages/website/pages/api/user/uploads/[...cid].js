import { files } from './';

export default async function handler(req, res) {
  if (process.env.NEXT_PUBLIC_ENV === 'dev') {
    const { cid } = req.query;
    if (!!cid) {
      if (req.method === 'DELETE') {
        const targetDeleteIndx = files.findIndex(({ cid: fileCID }) => cid[0] === fileCID);
        if (targetDeleteIndx !== -1) {
          files.splice(targetDeleteIndx, 1);
        }
        // fake wait
        await new Promise(resolve => setTimeout(resolve, 1000));

        return res.send(204);
      }

      return res.status(200).json(files.find(({ cid: fileCID }) => fileCID === cid));
    }
  }

  return res.status(403).json({ message: 'Forbidden.' });
}
