import emailjs from '@emailjs/browser';
import { getUserProfilesWithInterests } from "../../modules/profile/service"

export const sendEventPromotionMail = async (eventTitle: string, eventDescription: string, eventTag: string, eventLink: string, emailRecipient: string) => {
    emailjs.init({
      publicKey: 'RXKJqHFZaTv8DcPeE',
      // Do not allow headless browsers
      blockHeadless: true
    });

    if(emailRecipient)
    {
      let tagArray = eventTag.split(',').map(str => str.trim());
      let selectedTags = tagArray.filter((tag) => "educational,entertainment,networking".includes(tag));
      let selectedTag = selectedTags[Math.floor(Math.random() * selectedTags.length)];
      if(selectedTag)
      {
        var templateParams = {
          EmailTitle: getEmailTitle(selectedTag),
          EventTitle: eventTitle,
          EventDescription: eventDescription,
          EventLink: eventLink,
          'email': emailRecipient
        };

        emailjs.send('service_856qqh8', getEmailTemplate(selectedTag), templateParams)
        .then(
          () => {
            console.log('SUCCESS!');
          },
          (error) => {
            console.log('FAILED...', error.text);
          },
        );
      }
    }
    else
    {
      getUserProfilesWithInterests(eventTag)
      .then( (profiles) => {
        if(profiles && profiles.length > 0)
        {
          profiles.forEach(function (profile, index) {

            let tagArray = eventTag.split(',').map(str => str.trim());
            let selectedTags = tagArray.filter((tag) => profile.interests?.includes(tag));
            let selectedTag = selectedTags[Math.floor(Math.random() * selectedTags.length)];
            if(selectedTag)
            {
              var templateParams = {
                EmailTitle: getEmailTitle(selectedTag),
                EventTitle: eventTitle,
                EventDescription: eventDescription,
                EventLink: eventLink,
                'email': profile.email
              };
  
              emailjs.send('service_856qqh8', getEmailTemplate(selectedTag), templateParams)
              .then(
                () => {
                  console.log('SUCCESS!');
                },
                (error) => {
                  console.log('FAILED...', error.text);
                },
              );
            }
          });
        }
        else
        {
          console.log("No user found with the correct interests");
        }
      });
    }
}

function getEmailTemplate(tag: string)
{
  switch(tag)
  {
    case 'educational':
      return 'template_5greirm';
    case 'entertainment':
      return 'template_62db823';
    case 'networking':
      return 'template_62db823';
    default:
      return 'template_5greirm';
  }
}

function getEmailTitle(tag: string)
{
  switch(tag)
  {
    case 'educational':
      return  'A new learning opportunity awaits you!';
    case 'entertainment':
      return  "Don't miss this fun activity happening soon!";
    case 'networking':
      return  'Come meet new people in this new event!';
    default:
      return 'Do not miss this new event!';
  }
}
