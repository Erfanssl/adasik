const mongoose = require('mongoose');

const dailyAssignmentSchema = new mongoose.Schema({
    userId: mongoose.Schema.Types.ObjectId,
    training: [
        {
            link: String,
            icon: String,
            completed: {
                type: Boolean,
                default: false
            }
        }
    ],
    challenge: [
        {
            started: {
                type: Boolean,
                default: false
            },
            completed: {
                type: Boolean,
                default: false
            }
        }
    ],
    group: [
        {
            link: String,
            completed: {
                type: Boolean,
                default: false
            }
        }
    ],
    test: [
        {
            link: String,
            icon: String,
            completed: {
                type: Boolean,
                default: false
            }
        }
    ]
}, { timestamps: true });

mongoose.model('DailyAssignment', dailyAssignmentSchema);