const sendResponse = (res, statusCode, message, data = null, meta = null) => {
  const response = {
    status: 'success',
    message,
  };

  if (data !== null) {
    response.data = data;
  }

  if (meta !== null) {
    response.meta = meta;
  }

  return res.status(statusCode).json(response);
};

module.exports = {
  sendResponse
};
