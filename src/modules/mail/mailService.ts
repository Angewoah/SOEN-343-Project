import emailjs from '@emailjs/browser';

export const sendEventPromotionMail = async (eventTitle: String, eventDescription: String, eventLink: String, emailRecipient: String) => {
    
    emailjs.init({
        publicKey: 'RXKJqHFZaTv8DcPeE',
        // Do not allow headless browsers
        blockHeadless: true
    });

    var templateParams = {
        EventTitle: eventTitle,
        EventDescription: eventDescription,
        EventLink: eventLink,
        'email': emailRecipient
    };

    emailjs.send('service_856qqh8', 'template_5greirm', templateParams)
    .then(
        () => {
          console.log('SUCCESS!');
        },
        (error) => {
          console.log('FAILED...', error.text);
        },
      );
    
    console.log("sent mail!");
}