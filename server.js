/**
 * Author: Elia Contini <https://elia.contini.page/>
 */

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const storage = require("./storage");
const {
    areExerciseParamsValid,
    areLogParamsValid,
    isUsernameValid,
} = require("./validator");

const app = express();
app.use(cors());
app.use(express.static("public"));

// Basic Configuration
const port = process.env.APP_PORT || 3000;
const db = storage(process.env.MONGO_URI);

const exercisesException = (error, res) => {
    switch (error.message) {
        case "USER_NOT_FOUND_EXCEPTION": {
            return res.status(400).json({
                message: "User not found",
            });
        }
        default: {
            return res.status(400).json({
                error: error,
                message: "Unknown cause",
            });
        }
    }
};

// endpoints
app.get("/", (req, res) => {
    res.sendFile(__dirname + "/views/index.html");
});

app.get("/api/exercise/log", async (req, res) => {
    const dateFrom = req.query.from == null ? null : req.query.from;
    const dateTo = req.query.to == null ? null : req.query.to;
    const limit = req.query.limit == null ? null : parseInt(req.query.limit);
    const userId = req.query.userId;

    const params = {
        dateFrom: dateFrom,
        dateTo: dateTo,
        limit: limit,
        userId: userId,
    };

    if (areLogParamsValid(params) === true) {
        try {
            const logs = await db.exercises.log(params);

            return res.json(logs);
        } catch (error) {
            return exercisesException(error, res);
        }
    }

    return res.status(400).json({
        message:
            "Bad Request. 'userId' is mandatory and must be long 24 characters. 'from' and 'to' are optional: must have the yyyy-mm-dd format. 'limit' is optional: must be an number.",
    });
});

app.post(
    "/api/exercise/add",
    express.urlencoded({ extended: true }),
    async (req, res) => {
        const date =
            req.body.date == null || req.body.date.trim() === ""
                ? null
                : req.body.date.trim();
        const description = req.body.description.trim();
        const duration = parseInt(req.body.duration.trim());
        const userId = req.body.userId.trim();

        const params = { date, description, duration, userId };

        if (areExerciseParamsValid(params) === true) {
            try {
                const exercise = await db.exercises.create(params);

                return res.status(201).json(exercise);
            } catch (error) {
                return exercisesException(error, res);
            }
        }

        return res.status(400).json({
            message:
                "Bad Request. 'description', 'duration' and 'userId' are mandatory and cannot be empty strings. 'userId' must be long 24 characters.",
        });
    }
);

app.get("/api/exercise/users", async (req, res) => {
    const users = await db.users.get({});

    const payload = users.map((item) => {
        return {
            _id: item._id,
            username: item.username,
        };
    });

    return res.json(payload);
});

app.post(
    "/api/exercise/new-user",
    express.urlencoded({ extended: true }),
    async (req, res) => {
        const username = req.body.username.trim();

        if (isUsernameValid(username) === true) {
            try {
                const user = await db.users.create(username);

                return res.status(201).json({
                    _id: user._id,
                    username: user.username,
                });
            } catch (error) {
                return res.status(409).json({
                    message: `Conflict. The username ${error.keyValue.username} already exists.`,
                });
            }
        }

        return res.status(400).json({
            message:
                "Bad Request. The 'username' can contain only letters, digits, ., -, _ and must be long at least 8 characters.",
        });
    }
);

// app serves
const listener = app.listen(port, () => {
    console.log("Your app is listening on port " + listener.address().port);
});
