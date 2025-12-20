export default function handler(req, res) {
  const { project, password } = req.body;

  const PASSWORDS = {
    "projeto-locaweb-ds": process.env.PASSWORD_LOCAWEB_DS
  };

  if (PASSWORDS[project] === password) {
    return res.status(200).json({ success: true });
  }

  return res.status(401).json({ success: false });
}