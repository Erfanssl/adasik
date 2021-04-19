import { combineReducers } from 'redux';
import dashboardReducer from "./dashboardReducer";
import profileReducer from "./profileReducer";
import messengerReducer from "./messengerReducer";
import socketsReducer from "./socketsReducer";
import trainingReducer from "./trainingReducer";
import challengeReducer from "./challengeReducer";
import friendReducer from "./friendReducer";
import statisticsReducer from "./statisticsReducer";
import settingsReducer from "./settingsReducer";
import authReducer from "./authReducer";
import requireAuthReducer from "./requireAuthReducer";
import usersProfileReducer from "./usersProfileReducer";
import tempMessageReducer from "./tempMessageReducer";
import testReducer from "./testReducer";
import identifierReducer from "./identifierReducer";
import innerReducer from "./innerReducer";
import isLoggedInReducer from "./isLoggedInReducer";


export default combineReducers({
    dashboard: dashboardReducer,
    profile: profileReducer,
    messenger: messengerReducer,
    sockets: socketsReducer,
    trainings: trainingReducer,
    challenges: challengeReducer,
    friends: friendReducer,
    statistics: statisticsReducer,
    settings: settingsReducer,
    auth: authReducer,
    requireAuth: requireAuthReducer,
    usersProfile: usersProfileReducer,
    tempMessage: tempMessageReducer,
    tests: testReducer,
    identifier: identifierReducer,
    appNotification: innerReducer,
    isLoggedIn: isLoggedInReducer
});