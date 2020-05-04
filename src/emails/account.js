// using Twilio SendGrid's v3 Node.js Library
// https://github.com/sendgrid/sendgrid-nodejs
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sender= process.env.SENDER;
const sendWelcomeMail = (email, name) => {
	const msg = {
	  to: email,
	  from: sender,
	  subject: `Welcome to the community, ${name}`,
	  text: `Hey ${name}, I wanted to welcome you to our growing community. Let me know how you get along with the app.`,
	};
	sgMail.send(msg);
}

const sendDeleteMail = (email, name) => {
	const msg = {
	  to: email,
	  from: sender,
	  subject: `We're sorry to see you go, ${name}`,
	  text: `Let us know how we could improve.`,
	};
	sgMail.send(msg);
}

module.exports = {
	sendWelcomeMail,
	sendDeleteMail
};