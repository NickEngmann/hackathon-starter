const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'SendGrid',
  auth: {
    user: process.env.SENDGRID_USER,
    pass: process.env.SENDGRID_PASSWORD
  }
});

/**
 * GET /contact
 * Contact form page.
 */
exports.getContact = (req, res) => {
  res.render('contact', {
    title: 'Contact'
  });
};

/**
 * POST /contact
 * Send a contact form via Nodemailer.
 */
exports.postContact = (req, res) => {
  req.assert('name', 'Name cannot be blank').notEmpty();
  req.isTrimmed('email').withMessage('Email must not contain leading or trailing whitespace').notEmpty();
  req.sanitize('email').isEmail().withMessage('Email is not valid');
  req.assert('message', 'Message cannot be blank').notEmpty();

  const errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect('/contact');
  }

  const mailOptions = {
    to: process.env.CONTACT_EMAIL || 'your@email.com',
    from: `${req.body.name} <${req.body.email.trim().toLowerCase()}>`,
    subject: 'Contact Form | Hackathon Starter',
    text: req.body.message.trim()
  };

  transporter.sendMail(mailOptions, (err) => {
    if (err) {
      const errorMessage = err.message || 'Failed to send email. Please try again later.';
      req.flash('errors', { msg: errorMessage });
      return res.redirect('/contact');
    }
    req.flash('success', { msg: 'Email has been sent successfully!' });
    res.redirect('/contact');
  });
};
