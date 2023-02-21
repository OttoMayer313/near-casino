const sdk = require("node-appwrite");

/*
  'req' variable has:
    'headers' - object with request headers
    'payload' - object with request body data
    'env' - object with environment variables

  'res' variable has:
    'send(text, status)' - function to return text response. Status code defaults to 200
    'json(obj, status)' - function to return JSON response. Status code defaults to 200

  If an error is thrown, a response with code 500 will be returned.
*/

module.exports = async function (req, res) {
  const client = new sdk.Client();

  const db = new sdk.Database(client);

  if (
    !req.env['APPWRITE_FUNCTION_ENDPOINT'] ||
    !req.env['APPWRITE_FUNCTION_PROJECT_ID'] ||
    !req.env['APPWRITE_FUNCTION_USER_ID'] ||
    !req.env['APPWRITE_FUNCTION_API_KEY']
  ) {
    throw new Error("Missing environment variables.");
  }

  const userId = req.env['APPWRITE_FUNCTION_USER_ID'];

  client
    .setEndpoint(req.env['APPWRITE_FUNCTION_ENDPOINT'])
    .setProject(req.env['APPWRITE_FUNCTION_PROJECT_ID'])
    .setKey(req.env['APPWRITE_FUNCTION_API_KEY']);

  let profile;

  try {
    profile = await db.getDocument('profiles', userId);

  } catch (err) {
    profile = await db.createDocument('profiles', userId, {
      balance: 500
    });
  }

  res.json({
    profile
  });
};
