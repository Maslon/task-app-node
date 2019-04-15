const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendWelcomeEmail = (email, name) => {
	sgMail.send({
		to: email,
		from: 'radek.fr@email.cz',
		subject: 'Thanks for joining us',
		text: `Welcome to the app, ${name}. Let me know how you get along with the app`
	});
};

const sendOnCancelation = (email, name) => {
	sgMail.send({
		to: email,
		from: 'radek.fr@email.cz',
		subject: 'Good Bye',
		text: `We are sorry that you are leaving us ${name}, PLS come back we love you`
	});
};

module.exports = {
	sendWelcomeEmail,
	sendOnCancelation
};
