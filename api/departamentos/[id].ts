import { departamentos } from "../../src/data/colombiaDepartamentos"

export default async function handler(req: any, res: any) {
  const url = req.url || "";
  const id = decodeURIComponent(url.split("/api/departamentos/")[1] || "");
  const dep = departamentos.find((d) => d.id.toLowerCase() === id.toLowerCase());
  if (!dep) {
    res.setHeader("Content-Type", "application/json");
    res.status(404).send(JSON.stringify({ error: "Not Found" }));
    return;
  }
  res.setHeader("Content-Type", "application/json");
  res.status(200).send(JSON.stringify(dep));
}
