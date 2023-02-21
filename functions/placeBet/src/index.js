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
  const { betPrice, betSide } = JSON.parse(req.payload || '{}');

  if (!betPrice || !betSide) {
    throw new Error("Set a bet price and pick a coin side.");
  }

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

  const profile = await db.getDocument('profiles', userId);

  if (betPrice > profile.balance) {
    throw new Error(`You can only bet up to ${profile.balance} Near Dollars.`);
  }

  const didWin = betSide === 'heads' ? Math.random() <= 0.5 : Math.random() >= 0.5;
  const change = didWin ? betPrice : -betPrice;

  await db.updateDocument('profiles', userId, {
    balance: profile.balance + change
  });

  res.json({
    didWin
  });
};
