module.exports = async (body) => {
  let fullBody = '';

  for await (const data of body) {
    fullBody += data.toString();
  }

  return JSON.parse(fullBody);
};
