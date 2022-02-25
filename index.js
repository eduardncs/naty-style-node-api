const express = require("express");
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const env = require('./env');
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
const port = process.env.PORT || 5000;

const transporter = nodemailer.createTransport({
    pool: true,
    host: "smtp.hostinger.com",
    port: 465,
       auth: {
            user: 'hey@naty-style.com',
            pass: 'L@cra2007',
         },
    secure: true,
});

app.post('/api/send-mail',express.json({type: '*/*'}), (req,res) => {
    const {data, language_code, token} = req.body;
    if(!data || !language_code || !token)
    {
        return res.status(400).send({message:"INVALID_REQUEST"});
    }
    const {email, name, phone_number,text} = data;
    if(!email || !name || !phone_number || !text)
    {
        return res.status(400).send({message:"PLEASE_FILL_ALL_FIELDS"});
    }

    const mailDataMaster = {
        from: 'hey@naty-style.com',
        to: env.mainEmail,
        subject: language_code === "ro" ? "Mesaj vizitator Naty-Style" : "Naty-Style visitor message",
        html: language_code === "ro" ? env.mailTemplateMasterRo.replace("%message%",text).replace(/%name%/g,name).replace("%phone_number%",phone_number).replace("%email%",email) : env.mailTemplateMasterEn.replace("%message%",text).replace(/%name%/g,name).replace("%phone_number%",phone_number).replace("%email%",email)
    };

    const mailDataSlave = {
        from: 'hey@naty-style.com',
        to: email,
        subject: language_code === "ro" ? "Vă mulțumim pentru interesul acordat" : "Thank you for your interest",
        html: language_code === "ro" ? env.mailTemplateSlaveRo : env.mailTemplateSlaveEn
    };

    transporter.sendMail(mailDataMaster, (error, info) => {
        if(error)
            return res.status(500).send({message:"INTERNAL_ERROR"});
    })
    transporter.sendMail(mailDataSlave, (error, info) => {
        if(error)
            return res.status(500).send({message:"INTERNAL_ERROR"});
    })

    res.status(200).send({message: "MAIL_SENT"});
})

app.listen(port, () => { console.log(`Server listening on port ${port}`); });