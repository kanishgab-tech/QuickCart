const path = require('path');
const mod = require('./node_modules/@clerk/nextjs/server');
console.log('keys', Object.keys(mod));
console.log('clerkClientType', typeof mod.clerkClient);
(async () => {
  try {
    const client = await mod.clerkClient();
    console.log('client keys', Object.keys(client));
    console.log('has users', !!client.users);
    if (client.users) {
      console.log('user keys', Object.keys(client.users).slice(0, 20));
    }
  } catch (err) {
    console.error('clerkClient error', err);
  }
})();
