/**
 * Author: Elia Contini <https://elia.contini.page/>
 *
 * Input validators
 */

/**
 * Validate date format
 *
 * See https://docs.mongodb.com/manual/reference/method/ObjectId/
 *
 * @params {string} date - the date to validate
 *
 * @returns true if date is valid, false otherwise
 */
const isDateValid = (date) => {
    // syntactic check only
    const patternValidDate = /^[0-9]{4}-[0-9]{2}-[0-9]{2}$/g;

    return patternValidDate.test(date) ? true : false;
};

/**
 * Validate number
 *
 * @params {number} number - the number to validate
 *
 * @returns true if number is valid, false otherwise
 */
const isNumberValid = (number) => {
    return !Number.isNaN(number) ? true : false;
};

/**
 * Validate userId format
 *
 * See https://docs.mongodb.com/manual/reference/method/ObjectId/
 *
 * @params {string} userId - the userId to validate
 *
 * @returns true if userId is valid, false otherwise
 */
const isUserIdValid = (userId) => {
    return userId.length == 24 ? true : false;
};

/**
 * Validate username format
 *
 * A username can contain letters, numbers, _, -, . and must
 * be long at least 8 characters
 *
 * @returns true if username is valid, false otherwise
 */
const isUsernameValid = (username) => {
    const patternValidCharacters = /^[a-zA-Z0-9_\.\-]{8,}$/g;

    return patternValidCharacters.test(username);
};

/**
 * Validate excercise parameters format
 *
 * @params {string} date - the date of the execise. It is optional (can be null)
 * @params {string} description - descrition of exercise
 * @params {number} duration - duration of exercise in minutes
 * @params {string} userId - the userId to which exercise belongs to
 *
 * @returns true if params are valid, false otherwise
 */
const areExerciseParamsValid = (params) => {
    const date = params.date;
    const description = params.description;
    const duration = params.duration;
    const userId = params.userId;

    const isExerciseDateValid =
        date == null || isDateValid(date) ? true : false;
    const isExerciseDescriptionValid =
        description != null && description.length > 0 ? true : false;
    const isExerciseDurationValid =
        isNumberValid(duration) && duration > 0 ? true : false;
    const isExerciseUserIdValid = isUserIdValid(userId);

    return (
        isExerciseDateValid &&
        isExerciseDescriptionValid &&
        isExerciseDurationValid &&
        isExerciseUserIdValid
    );
};

/**
 * Validate logs parameters format
 *
 * @params {string} dateFrom - the date from log starts. It is optional (can be null)
 * @params {string} dateFrom - the date when log ends. It is optional (can be null)
 * @params {number} limit - the number of logs to retrieve. It is optional (can be null)
 * @params {string} userId - the userId to which exercise belongs to
 *
 * @returns true if params are valid, false otherwise
 */
const areLogParamsValid = (params) => {
    const dateFrom = params.dateFrom;
    const dateTo = params.dateTo;
    const limit = params.limit;
    const userId = params.userId;

    const isLogDateFromValid =
        dateFrom == null || isDateValid(dateFrom) ? true : false;
    const isLogDateToValid =
        dateTo == null || isDateValid(dateTo) ? true : false;
    const isLogLimitValid =
        limit == null || isNumberValid(limit) ? true : false;
    const isLogUserIdValid = isUserIdValid(userId);

    return (
        isLogDateFromValid &&
        isLogDateToValid &&
        isLogLimitValid &&
        isLogUserIdValid
    );
};

module.exports = {
    areExerciseParamsValid: areExerciseParamsValid,
    areLogParamsValid: areLogParamsValid,
    isUsernameValid: isUsernameValid,
};
