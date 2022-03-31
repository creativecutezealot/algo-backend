import assert from 'assert';
import { getConfig } from '../config';
import { NodeMailgun } from 'ts-mailgun'
import { MailgunTemplate } from 'ts-mailgun/dist/mailgun-template';

const mailer = new NodeMailgun();

mailer.apiKey = getConfig().MAILGUN_API_KEY;
mailer.domain = getConfig().MAILGUN_DOMAIN;
mailer.fromEmail = getConfig().MAILGUN_EMAIL_FROM;
mailer.fromTitle = getConfig().MAILGUN_TITLE_FROM;
mailer.unsubscribeLink = false;

mailer.templates[getConfig().MAILGUN_TEMPLATE_EMAIL_ADDRESS_VERIFICATION] = new MailgunTemplate();
mailer.templates[getConfig().MAILGUN_TEMPLATE_EMAIL_ADDRESS_VERIFICATION].subject = 'Verify your email for AlgoCloud';
mailer.templates[getConfig().MAILGUN_TEMPLATE_EMAIL_ADDRESS_VERIFICATION].body = '\
    <p>Hello,</p> \
    <p>Follow this link to verify your email address.</p> \
    <p><a href="{{link}}">{{link}}</a></p> \
    <p> \
      If you didn’t ask to verify this address, you can ignore \
      this email. \
    </p>\
    <p>Thanks,</p> \
    <p>Your AlgoCloud team</p>';

mailer.templates[getConfig().MAILGUN_TEMPLATE_INVITATION] = new MailgunTemplate();
mailer.templates[getConfig().MAILGUN_TEMPLATE_INVITATION].subject = 'You\'ve been invited to {{tenantName}} at AlgoCloud';
mailer.templates[getConfig().MAILGUN_TEMPLATE_INVITATION].body = '\
    <p>Hello,</p> \
    <p>You\'ve been invited to {{tenantName}}.</p> \
    <p>Follow this link to register.</p> \
    <p><a href="{{link}}">{{link}}</a></p> \
    <p>Thanks,</p> \
    <p>Your AlgoCloud team</p>';

mailer.templates[getConfig().MAILGUN_TEMPLATE_PASSWORD_RESET] = new MailgunTemplate();
mailer.templates[getConfig().MAILGUN_TEMPLATE_PASSWORD_RESET].subject = 'Reset your password for AlgoCloud';
mailer.templates[getConfig().MAILGUN_TEMPLATE_PASSWORD_RESET].body = '\
    <p>Hello,</p> \
    <p> \
      Follow this link to reset your AlgoCloud password for \
      your account. \
    </p> \
    <p><a href="{{link}}">{{link}}</a></p> \
    <p> \
      If you didn\’t ask to reset your password, you can ignore \
      this email. \
    </p> \
    <p>Thanks,</p> \
    <p>Your AlgoCloud team</p>';

mailer.templates[getConfig().MAILGUN_TEMPLATE_USER_UPDATED] = new MailgunTemplate();
mailer.templates[getConfig().MAILGUN_TEMPLATE_USER_UPDATED].subject = 'Your account has been {{done}} by AlgoCloud';
mailer.templates[getConfig().MAILGUN_TEMPLATE_USER_UPDATED].body = '\
    <p>Hello,</p> \
    <p>Your account has been {{done}} by AlgoCloud.</p>\
    <p>Thanks,</p> \
    <p>Your AlgoCloud team</p>';

mailer.init();

export default class EmailSender {
  template: string;
  variables: any;

  constructor(template, variables) {
    this.template = template;
    this.variables = variables;
  }

  static get TEMPLATES() {
    if (!EmailSender.isConfigured) {
      return {};
    }

    return {
      EMAIL_ADDRESS_VERIFICATION: getConfig().MAILGUN_TEMPLATE_EMAIL_ADDRESS_VERIFICATION,
      INVITATION: getConfig().MAILGUN_TEMPLATE_INVITATION,
      PASSWORD_RESET: getConfig().MAILGUN_TEMPLATE_PASSWORD_RESET,
      USER_UPDATED: getConfig().MAILGUN_TEMPLATE_USER_UPDATED,
    };
  }

  async sendTo(recipient) {
    if (!EmailSender.isConfigured) {
      console.error(`Email provider is not configured.`);
      return;
    }

    assert(recipient, 'to is required');
    
    try {
      let mgTemplate = mailer.getTemplate(this.template);
      if (mgTemplate && mgTemplate instanceof MailgunTemplate)
        return await mailer.sendFromTemplate(recipient, mgTemplate, this.variables);
    } catch (error) {
      console.error('Error sending MailGun email.');
      console.error(error);
      throw error;
    }
  }

  static get isConfigured() {
    return Boolean(
      getConfig().MAILGUN_API_KEY &&
        getConfig().MAILGUN_DOMAIN,
    );
  }
}
