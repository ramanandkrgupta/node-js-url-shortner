const dotenv = require('dotenv');

dotenv.config();

const express = require("express");


const path = require('path')
const { connectToMongoDB } = require("./database")

const URL = require('./models/url');

const urlRoute = require('./routes/url');
const staticRoute = require('./routes/staticRouter')
const userRoute =require('./routes/user');
const CookieParser = require("cookie-parser");
const { restrictTo, checkForAuthentication } = require("./middlewares/auth")

const app = express();
const PORT = 3000;

connectToMongoDB(process.env.MONGO_URL).then(() => console.log('mongodb connected'))

app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));

//middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(CookieParser());
app.use(checkForAuthentication); 


app.use("/url", restrictTo(['NORMAL', 'ADMIN']), urlRoute);
app.use("/user",  userRoute);
app.use("/", staticRoute);






app.get('/:shortId', async (req, res) => {
    const shortId = req.params.shortId;
    const entry = await URL.findOneAndUpdate (
    {
        shortId,
    },
    {
        $push: {
            visitHistory: {
                timestamp: Date.now(),
            }
        },
    }
    );
    if (entry) {
        res.redirect(entry.redirectUrl);
    } else {
        res.status(404).send('URL not found');
    }
})


/**
* This function starts the server at the specified PORT.
* It logs a message to the console once the server has started.
*/
app.listen(PORT, () => console.log(`server started at PORT ${PORT}`));
