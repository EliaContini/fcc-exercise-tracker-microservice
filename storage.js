/**
 * Author: Elia Contini <https://elia.contini.page/>
 *
 * Data model design
 * https://docs.mongodb.com/manual/core/data-model-design/
 *
 * I used a normalized approach.
 *
 * MongoDB collection name conventions. I didn't find anything
 * official, but these sound reasonable
 *
 * https://stackoverflow.com/questions/9868323/is-there-a-convention-to-name-collection-in-mongodb
 *
 * https://stackoverflow.com/questions/5916080/what-are-naming-conventions-for-mongodb
 */
const mongoose = require("mongoose");
const { Schema } = mongoose;

// Format required by test suite: Sun Feb 28 2021
const formatDate = (dbDate) => {
    const options = {
        day: "2-digit",
        month: "short",
        weekday: "short",
        year: "numeric",
    };

    return new Intl.DateTimeFormat("en", options)
        .format(dbDate)
        .replace(/,/g, "");
};

// return the date in format yyyy-mm-dd
const prepareDate = (paramDate) => {
    let date = new Date();
    if (paramDate != null) {
        date = new Date(paramDate);
    }

    return date.toISOString().substring(0, 10);
};

const exercisesCollection = (params) => {
    const exerciseSchema = new Schema({
        date: {
            type: Date,
        },
        description: {
            required: true,
            type: String,
        },
        duration: {
            required: true,
            type: Number,
        },
        userId: {
            required: true,
            type: String,
        },
    });
    const Exercise = mongoose.model("Exercise", exerciseSchema);

    const users = params.refs.users;

    return {
        create: async (params) => {
            const userId = params.userId;

            if (mongoose.Types.ObjectId.isValid(userId) === true) {
                const user = (await users.get({ _id: userId }))[0];

                if (user != null) {
                    const exercise = new Exercise({
                        date: prepareDate(params.date),
                        description: params.description,
                        duration: params.duration,
                        userId: userId,
                    });

                    const exerciseSaved = await exercise.save();

                    return {
                        _id: userId,
                        date: formatDate(exerciseSaved.date),
                        description: exerciseSaved.description,
                        duration: exerciseSaved.duration,
                        username: user.username,
                    };
                }
            }

            throw Error("USER_NOT_FOUND_EXCEPTION");
        },
        log: async (params) => {
            if ("userId" in params) {
                const userId = params.userId;

                if (mongoose.Types.ObjectId.isValid(userId) === true) {
                    const user = (await users.get({ _id: userId }))[0];

                    if (user != null) {
                        let paramsQuery = { userId: userId };

                        const dateFrom = params.dateFrom;
                        const dateTo = params.dateTo;
                        if (dateFrom != null || dateTo != null) {
                            paramsQuery.date = {};

                            if (dateFrom != null) {
                                paramsQuery.date.$gte = dateFrom;
                            }

                            if (dateTo != null) {
                                paramsQuery.date.$lte = dateTo;
                            }
                        }

                        let query = Exercise.find(paramsQuery);

                        const limit = params.limit;
                        if (limit > 0) {
                            query = query.limit(limit);
                        }

                        const exercises = await query;

                        const logs = {
                            _id: user._id,
                            count: exercises.length,
                            log: exercises.map((item) => {
                                return {
                                    date: formatDate(item.date),
                                    description: item.description,
                                    duration: item.duration,
                                };
                            }),
                            username: user.username,
                        };

                        return logs;
                    }
                }

                throw Error("USER_NOT_FOUND_EXCEPTION");
            }
        },
    };
};

const usersCollection = () => {
    //
    // I don't need to use init() in this case, but important to keep this is mind
    // https://mongoosejs.com/docs/validation.html#the-unique-option-is-not-a-validator
    //
    const userSchema = new Schema({
        username: {
            required: true,
            type: String,
            unique: true,
        },
    });
    const User = mongoose.model("User", userSchema);

    return {
        create: async (username) => {
            var user = new User({
                username: username,
            });

            return await user.save();
        },
        get: async (params) => {
            return await User.find(params);
        },
    };
};

const storage = (mongoUri) => {
    mongoose.connect(mongoUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });

    const users = usersCollection();
    const exercises = exercisesCollection({
        refs: {
            users: users,
        },
    });

    return {
        exercises: exercises,
        users: users,
    };
};

module.exports = storage;
