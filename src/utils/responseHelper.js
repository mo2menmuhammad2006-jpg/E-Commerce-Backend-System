export const ok = (res, data, status = 200) =>
  res.status(status).json({ success: true, data });

export const created = (res, data) =>  res.status(201).json({ success: true, data });