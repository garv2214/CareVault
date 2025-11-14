module.exports = {
  encrypt: (data) => {
    return Buffer.from(data).toString("base64");
  }
};
