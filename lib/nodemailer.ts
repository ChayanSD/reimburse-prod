import nodemailer from "nodemailer";

const transport = nodemailer.createTransport({
    service : "gmail",
    auth : {
        user : process.env.APP_EMAIL,
        pass : process.env.APP_PASSWORD,
    }
});

export default transport;