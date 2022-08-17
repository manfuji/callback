const router = require('express').Router();
const axios = require('axios');
// import fetch from 'node-fetch';
const fetch = require('cross-fetch');
// sms code
async function sms(contact, event_name, tool_reference) {
  const event1 = 'project.projectSubmitted';
  const event2 = 'project.partVersionSubmitted';
  const event3 = 'project.statusChanged';
  if (event_name === event1) {
    const resp = await axios.request(
      `https://smsc.hubtel.com/v1/messages/send`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization:
            'Basic ' + Buffer.from('ixlzasgi:wcbfwruk').toString('base64'),
        },
        body: JSON.stringify({
          from: 'GSDF',
          to: `${contact}`,
          // to: '+233543340697',
          content: `Dear applicant your concept note submitted has been received. Please keep your account details and note your reference ${tool_reference} for any communication with GSDF or Please login to our project portal https://ctvet-gsdf.optimytool.com to view your status updates.`,
        }),
      }
    );
    const data = await resp.json();
    console.log(event_name, data);

    // console.log(event_name, data);
  } else if (event_name === event2) {
    const resp = await fetch(`https://smsc.hubtel.com/v1/messages/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization:
          'Basic ' + Buffer.from('ixlzasgi:wcbfwruk').toString('base64'),
      },
      body: JSON.stringify({
        from: 'GSDF',
        to: `${contact}`,
        content: `Dear applicant your concept note submitted has been received. Please keep your account details and note your reference ${tool_reference} for any communication with GSDF or Please login to our project portal https://ctvet-gsdf.optimytool.com to view your status updates.`,
      }),
    });
    const data = await resp.json();
    console.log(data);
    console.log(event_name, contact);
  }

  if (event_name === event3) {
    const resp = await fetch(`https://smsc.hubtel.com/v1/messages/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization:
          'Basic ' + Buffer.from('ixlzasgi:wcbfwruk').toString('base64'),
      },
      body: JSON.stringify({
        from: 'GSDF',
        to: `${contact}`,
        content: `Dear applicant, this is a status update. Your concept note with reference: ${tool_reference}  is currently been screened, a copy of this system message has also been emailed. Please login to our project portal https://ctvet-gsdf.optimytool.com to view your status updates.`,
      }),
    });
    const data = await resp.json();
    console.log(data);
    // console.log(event_name, data);
  }
}

//update user
router.post('/callback', async (req, res) => {
  const { body } = req;
  const username = 'OIPT6LSCXVLS57DFN0S7';
  const password =
    'S0IRT0QRc0rB2LkRopVIvPKSBB8rsMdOV5OEnUoMgB10Sly6OIvj3BESVWK2ratN';
  // const id = 'c9d3b687-b4b9-5cf7-82b3-9be36a078d13';
  try {
    const { object_id, event_name } = body;
    console.log(object_id);
    await axios.post('https://gsdfsms.pythonanywhere.com/api/callback/', body);
    // fetching the project endpoint data\
    const projectUrl = `https://api.optimytool.com/v1.3/projects/${object_id}/versions`;
    const { data } = await axios.get(projectUrl, {
      auth: { username, password },
    });
    // console.log(data);
    // extractiong the reference id
    const referenceUrl = `https://api.optimytool.com/v1.3/projects/${object_id}`;
    const referenceData = await axios.get(referenceUrl, {
      auth: { username, password },
    });
    console.log(referenceData.data.data.tool_reference);
    const tool_reference = referenceData.data.data.tool_reference;

    // extracting version id
    try {
      const version_id = data.data.shift().version_id;
      console.log(version_id);
      // const version_id = '89773351-6847-55eb-8042-df749dd9bf82';
      // making request to get the answer
      const versionUrl = `https://api.optimytool.com/v1.3/projects/${object_id}/versions/${version_id}/answers/`;

      const answer = await axios.get(versionUrl, {
        auth: { username, password },
      });
      // console.log(answer.data.data);
      const static_id = '52415ea3-5fb3-5735-9ea3-5bf61d83ca25';
      const contact_details = answer.data.data.filter(
        (data) => data.answer_id === static_id
      );
      const contact = contact_details[0].value.replace(/\s/g, '');
      // console.log(contact);
      sms(contact, event_name, tool_reference);

      res.status(200).send(contact);

      // extracting the user contact details

      // const currentProject = dataFromCallback;
    } catch (error) {
      res.status(500).json(error);
    }
  } catch (error) {
    res.status(500).json({ message: 'Error Check your http method' });
  }
});

// delete a user
router.get('/callback', async (req, res) => {
  try {
    const { data } = await axios.get(
      'https://gsdfsms.pythonanywhere.com/api/callback'
    );
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: 'something went wrong' });
  }
});
module.exports = router;
