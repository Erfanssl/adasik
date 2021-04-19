const mongoose = require('mongoose');

const testSchema = new mongoose.Schema({
    testId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    result: {
        text: String,
        testsSoFar: Number
    },
    choices: [{
        element: Number,
        choice: Number
    }],
    traitsResult: {
        detailed: {
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
            }
        },
        abstract: {
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
    }, // base on only one test
    traitsDifference: {
        detailed: {
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
            }
        },
        abstract: {
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
        },
        result: String
    },
    feedback: {
        accuracy: Number,
        comment: String
    },
    startAt: Date,
    endAt: Date,
    timeSpent: Number
}, { timestamps: true });

const testHolderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        unique: true
    },
    tests: [testSchema]
}, { timestamps: true });

mongoose.model('Test', testHolderSchema);
