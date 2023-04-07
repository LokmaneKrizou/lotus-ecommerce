const populateUserWithoutPassword = {path: 'user', select: '-password -__v'};
module.exports = populateUserWithoutPassword
