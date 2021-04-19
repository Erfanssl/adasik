const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const keys = require('../config/keys');

const CookieSession = mongoose.model('CookieSession');
const ModifiedProperty = mongoose.model('ModifiedProperty');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'You should provide an email'],
        unique: true
    },
    password: {
        type: String,
        required: [true, 'You should provide a password']
    },
    username: {
        type: String,
        required: [true, 'You should provide an username'],
        unique: true
    },
    phoneNumber: {
        type: String,
        index: true
    },
    prePhoneNumber: String,
    deletedAt: Date,
    status: {
        text: {
            type: String,
            enum: ['offline', 'online'],
            default: 'offline'
        },
        date: Date
    },
    messengerStatus: {
        text: {
            type: String,
            enum: ['offline', 'online'],
            default: 'offline'
        },
        date: Date
    },
    info: {
        general: {
            name: String,
            job: String,
            birthday: {
                day: Number,
                month: Number,
                year: Number
            },
            memberSince: Date,
            lastSeen: Date,
            gender: {
                type: String,
                enum: ['male', 'female', null]
            },
            education: String,
            social: [{
                name: String,
                link: String
            }],
            bio: {
                type: String,
                maxlength: 70
            },
            avatar: String,
            location: {
                country: String,
                city: String,
                coords: {
                    type: [Number],
                    length: 2
                }
            },
            philosophy: {
                type: String,
                maxlength: 60
            },
            howHeardUs: String,
            likes: Number,
            notification: {
                type: Boolean,
                default: false
            },
            install: {
                type: Boolean,
                default: false
            }
        },
        specific: {
            whole: {
                totalScore: Number,
                trainingScore: Number,
                rank: Number,
                level: {
                    level: {
                        type: Number,
                        default: 1
                    },
                    progress: {
                        type: Number,
                        default: 30
                    },
                    destination: {
                        type: Number,
                        default: 100
                    }
                },
                group: {
                    name: String,
                    link: String
                },
                friends: Number,
                games: {
                    total: Number,
                    win: Number,
                    lose: Number,
                    draw: Number
                },
                trainings: Number
            },
            detailed: {
                brain: {
                    calculation: {

                    },
                    judgement: {
                        type: Number,
                        min: 0,
                        max: 1
                    },
                    speed: {
                        type: Number,
                        min: 0,
                        max: 1
                    },
                    accuracy: {
                        type: Number,
                        min: 0,
                        max: 1
                    },
                    flexibility: {
                        type: Number,
                        min: 0,
                        max: 1
                    },
                    problemSolving: {
                        type: Number,
                        min: 0,
                        max: 1
                    },
                    attention: {
                        type: Number,
                        min: 0,
                        max: 1
                    },
                    memory: {
                        type: Number,
                        min: 0,
                        max: 1
                    },
                    creativity:{
                        type: Number,
                        min: 0,
                        max: 1
                    }
                    },
                personality: {
                    competence: {
                        type: Number,
                        min: 0,
                        max: 1
                    },
                    curiosity: {
                        type: Number,
                        min: 0,
                        max: 1
                    },
                    obsessive: {
                        type: Number,
                        min: 0,
                        max: 1
                    },
                    confidence: {
                        type: Number,
                        min: 0,
                        max: 1
                    },
                    depressive: {
                        type: Number,
                        min: 0,
                        max: 1
                    },
                    social: {
                        type: Number,
                        min: 0,
                        max: 1
                    },
                    stability: {
                        type: Number,
                        min: 0,
                        max: 1
                    },
                    emotional: {
                        type: Number,
                        min: 0,
                        max: 1
                    },
                    aggressive: {
                        type: Number,
                        min: 0,
                        max: 1
                    },
                    extroversion:{
                        type: Number,
                        min: 0,
                        max: 1
                    }}
            },
            abstract: {
                brain: {
                    responseInhibition: {
                        type: Number,
                        min: 0,
                        max: 1
                    },
                    informationProcessing: {
                        type: Number,
                        min: 0,
                        max: 1
                    },
                    selectiveAttention: {
                        type: Number,
                        min: 0,
                        max: 1
                    },
                    dividedAttention: {
                        type: Number,
                        min: 0,
                        max: 1
                    }
                },
                personality: {
                    believeInGod: {
                        type: Number,
                        min: 0,
                        max: 1
                    },
                    believeInAfterLife: {
                        type: Number,
                        min: 0,
                        max: 1
                    },
                    thinkAboutMeaningOfLife: {
                        type: Number,
                        min: 0,
                        max: 1
                    },
                    perfectionism: {
                        type: Number,
                        min: 0,
                        max: 1
                    },
                    logic: {
                        type: Number,
                        min: 0,
                        max: 1
                    },
                    insignificance: {
                        type: Number,
                        min: 0,
                        max: 1
                    },
                    forgiveness: {
                        type: Number,
                        min: 0,
                        max: 1
                    },
                    optimism: {
                        type: Number,
                        min: 0,
                        max: 1
                    },
                    softy: {
                        type: Number,
                        min: 0,
                        max: 1
                    },
                    empathy: {
                        type: Number,
                        min: 0,
                        max: 1
                    },
                    ambitious: {
                        type: Number,
                        min: 0,
                        max: 1
                    },
                    energy: {
                        type: Number,
                        min: 0,
                        max: 1
                    },
                    concentration: {
                        type: Number,
                        min: 0,
                        max: 1
                    },
                    riskTaker: {
                        type: Number,
                        min: 0,
                        max: 1
                    },
                    abstract: {
                        type: Number,
                        min: 0,
                        max: 1
                    },
                    workInParallel: {
                        type: Number,
                        min: 0,
                        max: 1
                    },
                    simplifier: {
                        type: Number,
                        min: 0,
                        max: 1
                    },
                    exercise: {
                        type: Number,
                        min: 0,
                        max: 1
                    },
                    mentalClarity: {
                        type: Number,
                        min: 0,
                        max: 1
                    },
                    moody: {
                        type: Number,
                        min: 0,
                        max: 1
                    },
                    organized: {
                        type: Number,
                        min: 0,
                        max: 1
                    },
                    management: {
                        type: Number,
                        min: 0,
                        max: 1
                    }
                }
            }
        }
    }
}, { timestamps: true });

userSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(this.password, salt);

        this.set('password', hashedPassword);
    }

    if (this.isModified('info.philosophy')) {
        // we save it to modifiedPhilosophy collection
        await ModifiedProperty.create({
            userId: this._id,
            property: 'philosophy',
            value: this.info.philosophy
        });
    }

    next();
});

// static method for handling generating jwt
userSchema.statics.handleJwt = async function(id, email) {
    // we create a session then we add the jwt consists of id of the and expire date to it then save it to database.
    const userIdJwt = jwt.sign({ id, email }, keys.JWT_SESSION_SECRET);

    const cookieSessionId = await CookieSession.create({
        info: userIdJwt
    });

    // jwt consists of id of the session, we send it to the browser as a cookie
    return jwt.sign({ id: cookieSessionId._id }, keys.JWT_COOKIE_SECRET);
};

userSchema.methods.toJSON = function () {
    const userObj = this.toObject();
    delete userObj.password;

    return userObj;
};

mongoose.model('User', userSchema);

userSchema.virtual('friends', { ref: 'Friend', localField: '_id', foreignField: 'userId' });
userSchema.virtual('messenger', { ref: 'MessageHolder', localField: '_id', foreignField: 'userId' });