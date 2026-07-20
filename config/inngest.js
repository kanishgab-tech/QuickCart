// inngest/client.ts
import { Inngest } from "inngest";
import connectDB from "./db";
import User from "@/models/User";

import { connect } from "mongoose";
export const inngest = new Inngest({ id: "kansan-next" });


//Inngest function to save user data to a database

export const syncUserCreation = inngest.createFunction(
    {
        id:'sync-user-from-clerk',
        triggers:{event:'clerk/user.created'}
    },
    async ({event}) => {
        const { id, first_name, last_name, email_addresses, image_url} = event.data
        const userData = {
            _id:id,
            email:email_addresses[0].email_address,
            name: first_name + ' ' + last_name,
            imageUrl: image_url
        }
        await connectDB()
        await User.create(userData)
    }
)

export const syncUserUpdate = inngest.createFunction(
    {
        id:'update-user-from-clerk',
        triggers:{event: 'clerk/user.updated'},
        
    onFailure: async ({ error, event, step }) => {
  // 1. Log the error to your monitoring system
  await step.run("capture-sentry-error", async () => {
    Sentry.captureException(error, { extra: { event } });
  });

  // 2. Send an alert via Slack
  await step.run("send-slack-alert", async () => {
    await slack.chat.postMessage({
      channel: "#alerts",
      text: `🚨 Task *${event.name}* failed after maximum retries.\nError: \`${error.message}\``
    });
  });

  // 3. Notify the user/admin via Email
  await step.run("send-email-notification", async () => {
    await resend.emails.send({
      from: "kanishga.b@gmail.com",
      to: "kanishga.b@gmail.com",
      subject: `Task Failed: ${event.name}`,
      text: `The function execution failed for event ${event.id}. Reason: ${error.message}`
    });
  });
},

    },
    async ({event}) => {
        const { id, first_name, last_name, email_addresses, image_url} = event.data
        const userData = {
            _id:id,
            email:email_addresses[0].email_addresses,
            name: first_name + ' ' + last_name,
            imageUrl: image_url
        }
        await connectDB()
        await User.findByIdAndUpdate(id,userData)
    }
)

export const syncUserDeletion = inngest.createFunction(
    {
        id:'delete-user-from-clerk',
        triggers:{event: 'clerk/user.deleted'}
    },
    async ({event}) => {

        const { id } = event.data
                
        await connectDB()
        await User.findByIdAndDelete(id)
    }
)