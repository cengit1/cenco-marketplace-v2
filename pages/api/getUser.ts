import { getAuth } from "@clerk/nextjs/server";
import { NextApiRequest, NextApiResponse } from 'next';

import { xata } from '../../utils/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { userId } = getAuth(req);

  if (!userId) {
    return res.status(200).json({ user: null, message: "No session user id available" })
  }

  let data = undefined;

  try {
    data = await xata.db.user.filter({ username: userId }).getFirst();
  } catch (err) {
    const error = err as Error;
    return res.status(500).json({ user: null, error: error.message })
  }

  if (!data) {
    try {
      data = await xata.db.user.create({
        username: userId,
      });
    } catch (err) {
      const error = err as Error;
      return res.status(500).json({ user: null, error: error.message })
    }
  }
  return res.status(200).json({ user: data })
}
