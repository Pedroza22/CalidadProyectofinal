import { departamentos } from "../src/data/colombiaDepartamentos"

export default async function handler(req: any, res: any) {
  res.setHeader("Content-Type", "application/json");
  res.status(200).send(JSON.stringify(departamentos));
}
