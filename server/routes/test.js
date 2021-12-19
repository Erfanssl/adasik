const express = require('express');
const mongoose = require('mongoose');
const auth = require('../middlewares/auth');
const currentUser = require('../middlewares/currentUser');
const personalityGeneralQuestions = require('./utils/testsData/personality-general');

const testRouter = express.Router();
const Test = mongoose.model('Test');
const AllTest = mongoose.model('AllTest');
const User = mongoose.model('User');
const DailyAssignment = mongoose.model('DailyAssignment');

const ONE_DAY = 1000 * 60 * 60 * 24;

// route for getting all the tests and if user can has taken them and can take them again
testRouter.get('/', currentUser, auth, async (req, res) => {
    try {
        const allTestQuery = await AllTest.aggregate([
            {
                $match: {}
            }
        ]);

        // now we check the tests that user has had so far
        const testQuery = await Test.aggregate([
            {
                $match: {
                    userId: mongoose.Types.ObjectId(req.user.id)
                }
            },
            {
                $unwind: '$tests'
            },
            {
                $group: {
                    _id: '$tests.testId',
                    createdAt: { $max: '$tests.createdAt' }
                }
            }
        ]);

        const testsHolder = [];

        const testIdsArr = testQuery.map(testQ => testQ._id.toString());
        allTestQuery.forEach(testObj => {
            delete testObj.__v;

            if (!testIdsArr.includes(testObj._id.toString())) {
                // means user has not taken it
                return testsHolder.push({ ...testObj, first: true });
            }

            // now we calculate if it's ready to retake or not; and if not, we calculate when it's going to be available
            // we find the createAt of that test
            const testCreatedAt = testQuery.find(test => test._id.toString() === testObj._id.toString()).createdAt;

            if (new Date() - new Date(testCreatedAt) >= ONE_DAY * 29) {
                // means it's ready to retake
                return testsHolder.push({ ...testObj, retake: true });
            }

            // now we know that retake is not available but we want to know how much is left
            const availableIn = Math.ceil(((ONE_DAY * 29) - (new Date() - new Date(testCreatedAt))) / ONE_DAY);

            testsHolder.push({ ...testObj, availableIn });
        });

        return res.send(testsHolder);
    } catch (err) {
        return res.status(500).send({ 'Error': 'Could not construct data ' + err });
    }
});

// route to see if the user can take the test
testRouter.get('/start/:nameOfTest', currentUser, auth, async (req, res) => {
    try {
        const nameOfTest = req.params.nameOfTest.toString();

        if (!nameOfTest) return res.status(404).send({ 'Error': 'Not Found' });

        // we check to see if there's such test
        const allTestQuery = await AllTest.findOne({ name: nameOfTest }, { _id: 1 });


        if (!allTestQuery) return res.status(404).send({ 'Error': 'Not Found' });

        // we should check to see if the user has done the test during the last 30 days
        // if yes we don't allow him/her to re - test
        const testQuery = await Test.aggregate([
            {
                $match: {
                    userId: mongoose.Types.ObjectId(req.user.id)
                }
            },
            {
                $unwind: '$tests'
            },
            {
                $match: {
                    'tests.testId': mongoose.Types.ObjectId(allTestQuery._id)
                }
            },
            {
                $sort: {
                    'tests.createdAt':  - 1
                }
            },
            {
                $limit: 1
            },
            {
                $project: {
                    'selectedTests': '$tests'
                }
            }
        ]);

        if (!testQuery.length) {
            // means he/she has not take this test yet
            // we should choose the correct test to send
            let questions;
            if (nameOfTest === 'personality general') questions = personalityGeneralQuestions;
            return res.send({ allowToTest: true, testId: allTestQuery._id, testName: nameOfTest, first: true, questions });
        }

        // now we should calculate the time of the last test that was taken
        let allowToTest = false;
        if (new Date() - new Date(testQuery[0].selectedTests.createdAt) >= ONE_DAY * 29) allowToTest = true;

        if (!allowToTest) {
            const availableIn = Math.ceil(((ONE_DAY * 29) - (new Date() - new Date(testQuery[0].selectedTests.createdAt))) / ONE_DAY);
            return res.send({ allowToTest: false, testId: allTestQuery._id, testName: nameOfTest, availableIn });
        }

        let questions;
        if (nameOfTest === 'personality general') questions = personalityGeneralQuestions;
        return res.send({ allowToTest: true, testId: allTestQuery._id, testName: nameOfTest, retake: true, questions });
    } catch (err) {
        return res.status(500).send({ 'Error': 'Unable to send the data ' + err });
    }
});

// route for handling personality general test submission
testRouter.post('/personality-general', currentUser, auth, async (req, res) => {
    try {
        const { testId, startAt, endAt, answeredArr } = req.body;

        // we should check if the user can take this test base on the last time he/she had taken
        let allowToTest = false;

        const allowTestQuery = await Test.aggregate([
            {
                $match: {
                    userId: mongoose.Types.ObjectId(req.user.id)
                }
            },
            {
                $unwind: '$tests'
            },
            {
                $match: {
                    'tests.testId': mongoose.Types.ObjectId(testId)
                }
            },
            {
                $sort: {
                    'tests.createdAt':  - 1
                }
            },
            {
                $limit: 1
            },
            {
                $project: {
                    'selectedTests': '$tests'
                }
            }
        ]);

        if (!allowTestQuery.length) allowToTest = true;
        else {
            if (new Date() - new Date(allowTestQuery[0].selectedTests.createdAt) >= ONE_DAY * 29) allowToTest = true;
        }

        if (!allowToTest) return res.status(403).send({ 'Error': 'You are not allowed to take this test right now' });

        // shame, selfConsciousness, trustOthers, fantasy, selfLove
        // we need to analyze the responses
        // we keep the information about the questions in questionInfoObj key is the id of the question
        // and the value will be the affected categories with negative or positive change and the coefficient
        const questionsInfoObj = {
            '1': ['extroversion + 3', 'ambitious + 3', 'confidence + 2', 'social + 1'],
            '2': ['stability + 1', 'simplifier + 4'],
            '3': ['emotional + 4', 'empathy + 4', 'softy + 2'],
            '4': ['curiosity - 3', 'stability + 1'],
            '5': ['emotional + 1', 'forgiveness + 4', 'aggressive - 2', 'stability + 1'],
            '6': ['logic + 4', 'stability + 3'],
            '7': ['curiosity - 2', 'ambitious - 2', 'softy + 2', 'aggressive - 2'],
            '8': ['extroversion - 4', 'depressive + 2', 'social - 3'],
            '9': ['empathy - 4', 'softy - 3', 'forgiveness - 3', 'emotional - 1', 'aggressive + 3'],
            '10': ['energy + 4', 'depressive - 4'],
            '11': ['believeInAfterLife + 4'],
            '12': ['emotional + 4', 'softy + 4', 'stability - 4', 'aggressive + 1', 'selfConsciousness + 4'],
            '13': ['stability - 3', 'competence - 2', 'confidence - 2', 'concentration - 4'],
            '14': ['depressive - 4', 'optimism + 4'],
            '15': ['thinkAboutMeaningOfLife + 4', 'stability + 1'],
            '16': ['emotional + 3', 'extroversion + 2', 'stability - 1'],
            '17': ['curiosity + 4', 'ambitious + 4', 'energy + 2'],
            '18': ['confidence + 4', 'riskTaker + 4', 'stability - 1', 'softy - 2'],
            '19': ['abstract - 4', 'logic - 3', 'stability - 1'],
            '20': ['emotional + 4', 'softy + 4', 'depressive + 1', 'stability - 2'],
            '21': ['obsessive + 2', 'workInParallel - 4', 'organized + 3', 'stability + 1'],
            '22': ['competence - 4', 'confidence - 4', 'stability - 2'],
            '23': ['emotional - 4', 'logic + 3', 'stability + 3'],
            '24': ['stability - 3', 'obsessive - 2', 'logic - 2', 'concentration - 3', 'moody + 3'],
            '25': ['confidence - 3', 'stability - 1', 'emotional + 1', 'obsessive + 1', 'aggressive + 1'],
            '26': ['social + 4', 'extroversion + 3'],
            '27': ['organized + 4', 'obsessive + 3', 'stability + 3'],
            '28': ['social - 3', 'extroversion - 4', 'management - 4'],
            '29': ['mentalClarity - 4', 'stability - 2', 'depressive + 2'],
            '30': ['competence + 4', 'confidence + 4', 'ambitious + 3', 'depressive - 1'],
            '31': ['obsessive + 1', 'organized + 2'],
            '32': ['competence + 4', 'obsessive + 3'],
            '33': ['aggressive + 4', 'stability - 4'],
            '34': ['stability - 4', 'concentration - 3', 'moody + 4'],
            '35': ['believeInGod + 4'],
            '36': ['stability - 2', 'concentration - 2', 'organized - 2', 'moody + 2'],
            '37': ['emotional - 3', 'stability - 1'],
            '38': ['exercise + 4', 'depressive - 1'],
            '39': ['obsessive + 2', 'depressive + 3'],
            '40': ['stability + 3', 'aggressive - 2', 'mentalClarity + 1'],
            '41': ['competence - 3', 'softy + 2', 'obsessive - 1'],
            '42': ['extroversion - 2', 'social - 4'],
            '43': ['selfLove - 4', 'depressive + 1'],
            '44': ['stability + 3', 'logic + 2', 'aggressive - 2'],
            '45': ['extroversion - 3', 'social - 1'],
            '46': ['curiosity + 4', 'depressive - 1'],
            '47': ['stability - 2', 'fantasy + 4', 'logic - 4', 'softy + 3'],
            '48': ['trustOthers - 4', 'social - 1', 'aggressive + 1'],
            '49': ['shame + 4', 'stability - 3', 'emotional + 2', 'softy + 3', 'confidence - 4', 'selfConsciousness + 2'],
            '50': ['confidence + 4', 'optimism + 4', 'energy + 3', 'depressive - 2', 'obsessive - 2']
        };

        const detailedPersonalityProperties = [
            'extroversion',
            'competence',
            'curiosity',
            'obsessive',
            'depressive',
            'confidence',
            'social',
            'stability',
            'emotional',
            'aggressive'
        ];

        const abstractPersonalityProperties = [
            'believeInGod',
            'believeInAfterLife',
            'perfectionism',
            'logic',
            'thinkAboutMeaningOfLife',
            'insignificance',
            'forgiveness',
            'optimism',
            'softy',
            'empathy',
            'ambitious',
            'energy',
            'concentration',
            'riskTaker',
            'abstract',
            'workInParallel',
            'simplifier'
        ];

        // will go into db in the tests of the user, property of traitsResult of this test
        const traitsResult = {
            detailed: {},
            abstract: {}
        };

        const resultObj = {};

        const extraTraits = {
            perfectionism: 0,
            insignificance: 0
        };

        // now we iterate over the answers to analyze them
        answeredArr.forEach(({ element, choice }) => {
            if (parseInt(choice) === 1 || parseInt(choice) === 7) extraTraits.perfectionism++;
            if (parseInt(choice) === 4) extraTraits.insignificance++;
            if (element in questionsInfoObj) {
                questionsInfoObj[element].forEach(categorySignCoefficient => {
                    const [category, sign, coefficient] = categorySignCoefficient.split(' ');
                    let categoryValue;
                    if (sign === '-') {
                        categoryValue = (8 - parseInt(choice))  * parseInt(coefficient);
                    } else categoryValue = parseInt(choice) * parseInt(coefficient);
                    if (!resultObj[category]) resultObj[category] = [];
                    resultObj[category].push({ element, value: parseInt(categoryValue), abundance: parseInt(coefficient) });
                });
            }
        });

        // now we calculate the value for each category
        const finalResultObj = {};

        Object.keys(resultObj).forEach(resKey => {
            let value = 0;
            let abundance = 0;
            resultObj[resKey].forEach(categoryObj => {
                value += parseInt(categoryObj.value);
                abundance += parseInt(categoryObj.abundance);
            });

            finalResultObj[resKey] = parseFloat((((value / abundance) - 1) / 6).toFixed(2));
        });

        // we add perfectionism and insignificance traits
        finalResultObj.perfectionism = parseFloat((extraTraits.perfectionism / answeredArr.length).toFixed(2));
        finalResultObj.insignificance = parseFloat((extraTraits.insignificance / answeredArr.length).toFixed(2));

        // we update the traitsResult
        Object.keys(finalResultObj).forEach(resKey => {
            if (detailedPersonalityProperties.includes(resKey)) {
                traitsResult.detailed[resKey] = finalResultObj[resKey]
            } else traitsResult.abstract[resKey] = finalResultObj[resKey]
        });

        // now we should get the data from db
        // first we check to see how many tests our user has taken so far (here in the personality type)
        // so we get the tests that have type of personality then we query to see how many of them the user has taken
        const allTestQuery = await AllTest.aggregate([
            {
                $match: {
                    type: 'personality'
                }
            },
            {
                $project: {
                    _id: 1
                }
            }
        ]);

        const personalityTests = allTestQuery.map(tQ => tQ._id);

        // now we check the number of these tests' abundance
        const testQuery = await Test.aggregate([
            {
                $match: {
                    userId: mongoose.Types.ObjectId(req.user.id)
                }
            },
            {
                $unwind: '$tests'
            },
            {
                $match: {
                    'tests.testId': { $in: personalityTests.map(testId => mongoose.Types.ObjectId(testId)) }
                }
            },
            {
                $count: 'count'
            }
        ]);

        let numberOfTestsInPersonalityType = 0;
        if (testQuery.length) numberOfTestsInPersonalityType = testQuery[0].count;

        // now we should get the current scores of user's personality traits
        const userQuery = await User.aggregate([
            {
                $match: {
                    _id: mongoose.Types.ObjectId(req.user.id)
                }
            },
            {
                $project: {
                    detailedPersonality: '$info.specific.detailed.personality',
                    abstractPersonality: '$info.specific.abstract.personality'
                }
            }
        ]);

        // now we calculate the difference of each trait and then try to update the previous ones base on the new ones
        const detailedPersonalityObj = userQuery[0].detailedPersonality;
        const abstractPersonalityObj = userQuery[0].abstractPersonality;
        const traitsDifference = {
            detailed: {},
            abstract: {}
        };
        const newTraitsData = {
            detailed: {},
            abstract: {}
        };


        // for detailed properties
        Object.keys(detailedPersonalityObj).forEach(detailedPersonalityItem => {
            // calculate the difference
            traitsDifference.detailed[detailedPersonalityItem] = parseFloat(
                (
                    Number(detailedPersonalityObj[detailedPersonalityItem]) - Number(traitsResult.detailed[detailedPersonalityItem])
                ).toFixed(2)
            );
            // calculate new value
            newTraitsData.detailed[detailedPersonalityItem] = parseFloat(
                (
                    (numberOfTestsInPersonalityType * Number(detailedPersonalityObj[detailedPersonalityItem]) + Number(traitsResult.detailed[detailedPersonalityItem]))
                    / (numberOfTestsInPersonalityType + 1)
                ).toFixed(2)
            );
        });

        // for abstract properties
        Object.keys(abstractPersonalityObj).forEach(abstractPersonalityItem => {
            // calculate the difference
            traitsDifference.abstract[abstractPersonalityItem] = parseFloat(
                (
                    Number(abstractPersonalityObj[abstractPersonalityItem]) - Number(traitsResult.abstract[abstractPersonalityItem])
                ).toFixed(2)
            );
            // calculate new value
            newTraitsData.abstract[abstractPersonalityItem] = parseFloat(
                (
                    (numberOfTestsInPersonalityType * Number(abstractPersonalityObj[abstractPersonalityItem]) + Number(traitsResult.abstract[abstractPersonalityItem]))
                    / (numberOfTestsInPersonalityType + 1)
                ).toFixed(2)
            );
        });

        // now we should generate some analysis
        function generateTheAnalysisReport() {
            const { competence, curiosity, depressive, confidence, social, stability, emotional, aggressive, extroversion, obsessive } = newTraitsData.detailed;

            const {
                believeInGod,
                believeInAfterLife,
                thinkAboutMeaningOfLife,
                perfectionism,
                logic,
                insignificance,
                forgiveness,
                optimism,
                softy,
                empathy,
                ambitious,
                energy,
                concentration,
                riskTaker,
                abstract,
                workInParallel,
                simplifier,
                exercise,
                mentalClarity,
                moody,
                organized,
                management,
                shame,
                selfConsciousness,
                trustOthers,
                fantasy,
                selfLove
            } = newTraitsData.abstract;

            let firstSentence = 'You don\'t want to make things complicated and want to get better at your job!';
            let secondSentence = '';

            if (competence >= .7 && confidence >= .7 && obsessive >= .7 && energy >= .7) firstSentence = 'You are on your way to make a difference!';

            else if (emotional >= .7 && empathy >= .7) firstSentence = 'You can feel the world!';

            else if (curiosity >= .7) firstSentence = 'You want to figure everything out!';

            else if (organized >= .7 && obsessive >= .7) firstSentence = 'You want everything to be in it\'s position!';

            else if (stability >= .7 && softy <= .15) firstSentence = 'You are as hard as a Rock!';

            else if (moody >= .7 && curiosity >= .7) firstSentence = 'You can see the world differently!';

            else if (moody >= .7 && curiosity >= .7 && organized >= .7) firstSentence = 'You have your rules to obey and sometimes to disobey';

            else if (competence >= .7 && confidence >= .7 && stability >= .7 && extroversion >= .6 && management >= .8) firstSentence = 'You want to manage everything!';

            else if (aggressive >= .7 && stability <= .4) firstSentence = 'You seem angry!';

            else if (social >= .7 && extroversion >= .65) firstSentence = 'You like to communicate with others and expand your friendship circle!';

            else if (depressive >= .7 && extroversion <= .4) firstSentence = 'You like to walk in the darkness!';


            // second sentence construction
            if (competence >= .7 && obsessive >= .7 && stability >= .7) secondSentence = 'You seem to know what you are doing and with your hard work and persistence you can change the odds; but make sure you care about other aspects of life as well.';

            else if (emotional >= .7 && empathy >= .7) secondSentence = 'You might feel that most people don\'t understand you well.';

            else if (organized >= .7 && obsessive >= .7) firstSentence = 'You believe that discipline is one of the most important things for success!';

            else if (moody >= .6) secondSentence = 'sometimes you want to forget about everything and sit on a chair and enjoy the view with a cup of coffee!';

            return firstSentence + '\n' + secondSentence;
        }

        // to tell about what traits is changed during the last test in comparison to tests before
        function generateDifferenceReport() {
            let sentence = '';
            if (traitsDifference.detailed.competence >= .1) sentence += 'Your Competence is slightly lower than before. \n';
            else if (traitsDifference.detailed.competence <= -.1) sentence += 'Your Competence has slightly improved. \n';

            if (traitsDifference.detailed.curiosity >= .1) sentence += 'You look slightly less Curios than before! \n';
            else if (traitsDifference.detailed.curiosity <= -.1) sentence += 'You seem to have a better Curiosity. \n';

            if (traitsDifference.detailed.depressive >= .1) sentence += 'You seem to be a bit more Depressed than before. \n';
            else if (traitsDifference.detailed.depressive <= -.1) sentence += 'You look less Depressed than before. \n';

            if (traitsDifference.detailed.obsessive >= .1) sentence += 'Your Obsessive result seems to be a little lower than before. \n';
            else if (traitsDifference.detailed.obsessive <= -.1) sentence += 'You look less Obsessive signs than before. \n';

            if (traitsDifference.detailed.confidence >= .1) sentence += 'You look a bit less Confidant than before. \n';
            else if (traitsDifference.detailed.confidence <= -.1) sentence += 'Your Confidence seems has rose up a bit. \n';

            if (traitsDifference.detailed.social >= .1) sentence += 'You look less Social than before. \n';
            else if (traitsDifference.detailed.social <= -.1) sentence += 'You seem to have or want more Social activity than before. \n';

            if (traitsDifference.detailed.stability >= .1) sentence += 'Your Stability looks a bit less than before. \n';
            else if (traitsDifference.detailed.stability <= -.1) sentence += 'Your Stability seems to have improved in comparison to previous tests. \n';

            if (traitsDifference.detailed.emotional >= .1) sentence += 'Your scored less on Emotional this time. \n';
            else if (traitsDifference.detailed.emotional <= -.1) sentence += 'You scored more on Emotional this time. \n';

            if (traitsDifference.detailed.aggressive >= .1) sentence += 'You look more Aggressive than before. \n';
            else if (traitsDifference.detailed.aggressive <= -.1) sentence += 'You look less Aggressive than before. \n';

            if (traitsDifference.detailed.extroversion >= .1) sentence += 'You seem to be more Introvert in comparison to previous test(s). \n';
            else if (traitsDifference.detailed.extroversion <= -.1) sentence += 'You seem to be more Extrovert in comparison to previous test(s). \n';

            if (!sentence) return 'No difference';

            return sentence;
        }

        // now we update the db
        // first we update tests collections
        // constructing data
        const currentTestId = new mongoose.Types.ObjectId();
        const testData = {
            _id: currentTestId,
            testId,
            result: {
                text: generateTheAnalysisReport(),
                testsSoFar: numberOfTestsInPersonalityType + 1
            },
            choices: answeredArr,
            traitsResult,
            traitsDifference: {
                ...traitsDifference,
                result: numberOfTestsInPersonalityType >= 1 ? generateDifferenceReport() : ''
            },
            startAt,
            endAt,
            timeSpent: endAt - startAt
        };
        await Test.updateOne({
            userId: req.user.id
        }, {
            $push: {
                tests: testData
            }
        });

        // we check to see if someone score more than .75 in perfectionism, then his/her stability should get lower
        if (newTraitsData.abstract.perfectionism >= .75 && newTraitsData.detailed.stability >= .5) {
            newTraitsData.detailed.stability = newTraitsData.detailed.stability - .15;
        }

        if (newTraitsData.abstract.perfectionism >= .9 && newTraitsData.detailed.stability >= .55) {
            newTraitsData.detailed.stability = newTraitsData.detailed.stability - .25;
        }

        // now we update the users collection
        await User.updateOne({
            _id: req.user.id
        }, {
            $set: {
                'info.specific.detailed.personality': newTraitsData.detailed,
                'info.specific.abstract.personality': newTraitsData.abstract
            }
        });

        // we need to increase the number of attempts of this test
        await AllTest.updateOne({
            _id: testId,
        }, {
            $inc: {
                attempts: 1
            }
        });

        const dataToSend = {
            newTraitsData: newTraitsData.detailed,
            result: {
                text: generateTheAnalysisReport(),
                testsSoFar: numberOfTestsInPersonalityType + 1 },
            currentTestId
        };

        if (numberOfTestsInPersonalityType >= 1) dataToSend.comparison = generateDifferenceReport();
        else dataToSend.comparison = false;

        // now we want to check if the test was part of the daily assignment, if yes, we want to mark it as completed
        const dailyAssignment = await DailyAssignment.aggregate([
            {
                $match: {
                    userId: mongoose.Types.ObjectId(req.user.id)
                }
            },
            {
                $unwind: '$test'
            },
            {
                $match: {
                    'test.link': '/personality-general',
                    'test.completed': false
                }
            }
        ]);

        if (dailyAssignment[0]) {
            // now we can update it to completed
            await DailyAssignment.updateOne({
                userId: req.user.id
            }, {
                $set: {
                    'test.$[elem].completed': true
                }
            }, {
                arrayFilters: [ { 'elem.link': '/personality-general' } ]
            });
        }

        return res.status(201).send(dataToSend);
    } catch (err) {
        return res.status(500).send({ 'Error': 'Unable to save data' });
    }
});

// route for handling feedback
testRouter.post('/feedback', currentUser, auth, async (req, res) => {
    try {
        const { currentTestId, accuracy, text } = req.body;

        // we update the properties
        await Test.updateOne({
            userId: req.user.id
        }, {
            $set: {
                'tests.$[elem].feedback.accuracy': accuracy,
                'tests.$[elem].feedback.comment': text
            }
        }, {
            arrayFilters: [ { 'elem._id': currentTestId } ]
        });

        return res.send({ 'Message': 'Successfully saved the feedback' });
    } catch (err) {
        return res.status(500).send({ 'Error': 'Could not save the feedback' });
    }
});

// route for handling who am i
testRouter.get('/who-am-i', currentUser, auth, async (req, res) => {
    try {
        // since we only have personality test, we grab the last personality test's result
        // we should first get the tests with type of personality from AllTest
        const allTestQuery = await AllTest.aggregate([
            {
                $match: {
                    type: 'personality'
                }
            },
            {
                $project: {
                    _id: 1
                }
            }
        ]);

        const personalityTestIds = allTestQuery.map(tQ => tQ._id);

        // now we could get the tests with these ids then we should get the last one and grab the result property
        const personalityTestQuery = await Test.aggregate([
            {
                $match: {
                    userId: mongoose.Types.ObjectId(req.user.id)
                }
            },
            {
                $unwind: '$tests'
            },
            {
                $match: {
                    'tests.testId': { $in: personalityTestIds.map(id => mongoose.Types.ObjectId(id)) }
                }
            },
            {
                $sort: {
                    'tests.createdAt': -1
                }
            },
            {
                $limit: 1
            },
            {
                $project: {
                    _id: 0,
                    result: '$tests.result'
                }
            }
        ]);

        // we also need the current scores of the detailed personality
        const userQuery = await User.aggregate([
            {
                $match: {
                    _id: mongoose.Types.ObjectId(req.user.id)
                }
            },
            {
                $project: {
                    personality: '$info.specific.detailed.personality'
                }
            }
        ]);

        const result = personalityTestQuery[0] ? personalityTestQuery[0].result : { testsSoFar: 0 };

        // now we return it to the client
        return res.send({ personality: { result, items: userQuery[0].personality } });
    } catch (err) {
        return res.status(500).send({ 'Error': 'Could not generate the data' });
    }
});

module.exports = testRouter;
