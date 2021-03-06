const nodemailer = require('nodemailer');

const config = require ('./config.js');
const scheduler = require('./scheduler.js');


let transporter = null

if (config.mailer.auth.user == 'username') {
	console.warn('\nWarning: Mailer not configured ! Please fill the file server/config.js with your own mailing service login.\n');
} else {
	transporter = nodemailer.createTransport(config.mailer);
}



let send_mail = (token, subject, text, files=[]) => {
	if (transporter == null) {
		console.warn("Mailer not configured !!!");
		return;
	}

	if (!exports.mails[token])
		return;

	let mail = exports.mails[token];
	if (mail == 'aaa') {
		console.warn ("Please use this fake email ONLY for debug !!");
		return;
	}

	let mailOptions = {
		from: 'SLIM <' + config.mailer.__address + '>', // sender address
		to: mail, // list of receivers
		subject: '[No reply] ' + subject, // Subject line
		text: text
	};

	if (files.length > 0) {
		attachments = [];
		for (let idx=0 ; idx<files.length ; idx++) {
			let name = files[idx];
			let short_name = name.split('/');
			short_name = short_name[short_name.length - 1]

			attachments.push({
				filename: short_name,
				path: name
			});
		}

		mailOptions.attachments = attachments;
	}

	// send mail with defined transport object
	transporter.sendMail(mailOptions, (error, info) => {
		if (error) {
			console.log(error);
			return;
		}

		console.log(token + ': email sent');
	});
};


exports.mails = {};


exports.send_address = (token) => {
	send_mail(
		token,
		'Your job ' + token,
		'Here is the link to follow the execution process.\n' +
		scheduler.urls[token] + '\n\n' +
		'The SLIM pipeline staff',
		['/app/data/' + token + '/pipeline.conf', '/app/versions.tsv']
	);
};


exports.send_end_mail = (token) => {
	send_mail(
		token,
		'Your job ' + token + ' is over',
		'Your results are available at this address:\n' +
		scheduler.urls[token] + '\n\n' +
		'Your session will automatically be deleted in 24h. Don\'t forget to download your results\n\n' +
		'You can use the .conf attached file to reload all your pipeline in the future.\n' +
		'For used software versions, please look at the attached version.tsv file.' +
		'The SLIM pipeline staff',
		['/app/data/' + token + '/pipeline.conf', '/app/versions.tsv']
	);
}

exports.send_crash_email = (token) => {
	send_mail(
		token,
		'Your job ' + token + ' crashed :(',
		'Your partial results are available at this address:\n' +
		scheduler.urls[token] + '\n' +
		'Please check all your configuration before another submission.\n\n' +
		'Your session will automatically be deleted in 24h.\n\n' +
		'The SLIM pipeline staff'	
	);
}

exports.send_delete_reminder = (token) => {
	send_mail(
		token,
		'Your job ' + token + ' will be deleted in 3 hours',
		'Your results are still available at this address for only 3 more hours:\n' +
		scheduler.urls[token] + '\n\n' +
		'The SLIM pipeline staff'
	);
}
