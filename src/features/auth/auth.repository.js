const Users = require("../../models/mysql/user.model");
var bcrypt = require('bcryptjs');
var jwt = require("jsonwebtoken");
const uuidV1 = require('uuid/v1');
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const StandarException = require('../../exceptions/standard.exception');
const { createUsername } = require("../../helpers/strings.helper");
const logger = require('../../config/logger');

const authRepository = {

    signUp: async req => {
        try {

            let body = req.body;

            body.username = createUsername(body.name, body.last_name);
            body.password = bcrypt.hashSync(body.password, 10);
            body.access_token = uuidV1();

            let user = new Users(body);

            await user.save().catch(e => {
                throw new StandarException(400, e.errors[0].message);
            });

            return user.dataValues;
        } catch (e) {
            throw e;
        }
    },

    login: async req => {
        try {

            let body = req.body;

            let user = await Users.findOne({ where: { email: body.email } });

            if (!user) throw new StandarException(400, `User not found`);

            if (!user.active) throw new StandarException(200, `Count not active`);

            if (user.social) throw new StandarException(400, `You must log in normally`);

            if (!bcrypt.compareSync(body.password, user.dataValues.password))
                throw new StandarException(400, `Error in email or password`);

            let token = await createTokenJWT(user);

            return { token, ...user.dataValues };
        } catch (e) {
            throw e;
        }
    },

    socialGoogle: async req => {
        let body = req.body;

        try {
            let token = body.token;

            let googleUser = await verify(token).catch(e => {
                throw new StandarException(400, `Social login fail`);
            });

            let user = await Users.findOne({ where: { email: googleUser.email } });

            if (!user) {
                req.body = {
                    id_role: 1,
                    name: googleUser.given_name,
                    lastname: googleUser.family_name,
                    email: googleUser.email,
                    avatar: googleUser.picture,
                    social: 1
                };

                user = await authRepository.signUp(req);
                req.body = body;
            } else {
                if (!user.active) {
                    // evaluar si es code 200
                    throw new StandarException(200, `Count not active`);
                }

                user.dataValues.token = await createTokenJWT(user);
            }

            return user;
        } catch (e) {
            throw e;
        }
    },

    refreshToken: async req => {

    },
}

const verify = async token => {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
    });

    const payload = ticket.getPayload();

    return payload;
}

const createTokenJWT = async user => {
    let { id } = user.dataValues;
    return await jwt.sign({ user: { id } }, process.env.JWT_SEED, { expiresIn: 14400 });
}

module.exports = authRepository;