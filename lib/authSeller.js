import { clerkClient } from '@clerk/nextjs/server';


const authSeller = async (userId) => {
  //if (!userId) return false;
  console.log('authSeller userId:', userId);

  try {
    const client = await clerkClient();
    if (!client?.users?.getUser) {
      console.error('Seller auth failed: clerkClient returned invalid client', client);
      return false;
    }

    const user = await client.users.getUser(userId);
    return user.publicMetadata?.role === 'seller';
  } catch (error) {
    console.error('Seller auth failed:', error?.status || '', error?.message || error);
    return false;
  }
};

export default authSeller;

