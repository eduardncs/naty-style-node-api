require ('dotenv').config();
const express = require("express");
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const env = require('./env');
const app = express();

// adding Helmet to enhance your API's security
app.use(helmet());
// using bodyParser to parse JSON bodies into JS objects
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
// enabling CORS for all requests
app.use(cors());
// adding morgan to log HTTP requests
app.use(morgan('combined'));
const port = process.env.PORT;

const transporter = nodemailer.createTransport({
    pool: true,
    host: "smtp.gmail.com",
    port: 465,
       auth: {
            user: process.env.MASTER_EMAIL,
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
        from: process.env.MASTER_EMAIL,
        to: env.mainEmail,
        subject: language_code === "ro" ? "Mesaj vizitator Naty-Style" : "Naty-Style visitor message",
        html: language_code === "ro" ? env.mailTemplateMasterRo.replace("%message%",text).replace(/%name%/g,name).replace("%phone_number%",phone_number).replace("%email%",email) : env.mailTemplateMasterEn.replace("%message%",text).replace(/%name%/g,name).replace("%phone_number%",phone_number).replace("%email%",email)
    };

    const mailDataSlave = {
        from: process.env.MASTER_EMAIL,
        to: email,
        subject: language_code === "ro" ? "Vă mulțumim pentru interesul acordat" : "Thank you for your interest",
        html: language_code === "ro" ? env.mailTemplateSlaveRo : env.mailTemplateSlaveEn
    };

    transporter.sendMail(mailDataMaster, (error, info) => {
        console.log("Sending master email: "+info);
        if(error)
            return res.status(500).send({message:"INTERNAL_ERROR"});
    })
    transporter.sendMail(mailDataSlave, (error, info) => {
        console.log(`Sending slave email: ${info}`);
        if(error)
            return res.status(500).send({message:"INTERNAL_ERROR"});
    })

    res.status(200).send({message: "MAIL_SENT"});
})

app.listen(port, () => { 
    console.log(`Server listening on port ${port}`); 
    console.log(`ENVS ${process.env.MASTER_EMAIL}`)
});