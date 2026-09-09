export const ok = (res, data = null, message = "", status = 200) => {
  const body = { success: true, data };
  if (message) body.message = message;
  res.status(status).json(body);
};

export const created = (res, data = null, message = "") => {
  const body = { success: true, data };
  if (message) body.message = message;
  res.status(201).json(body);
};