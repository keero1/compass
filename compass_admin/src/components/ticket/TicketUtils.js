const generateEmailContent = (ticket, replyContent) => {
  return `
  Hello There,

  Thank you for reaching out to us. We have received your ticket regarding "${ticket.subject}". Below is your query:

  Description:
  "${ticket.description}"

  Our response:
  ${replyContent}


  If you have any further questions, please do not hesitate to contact us. We are here to assist you.

  Best regards,
  ComPass Support Operation

  Contact Us:
  Email: johnjoshua.dev@gmail.com
  Phone: (+63) 9565109939
  Website: https://www.compass-santrans.online/download-app


  This email and any attachments may contain confidential information and are intended only for the recipient. If you have received this email in error, please notify us immediately and delete it from your system.
  `;
};

export default generateEmailContent;
