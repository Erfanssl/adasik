import React, { useEffect } from 'react';
import './Training.scss';
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import { fetchTrainings } from "../../../../actions/trainingAction";
import person2 from '../../../../assets/brain-char.svg';
import requireAuth from "../../../../middlewares/requireAuth";
import pageViewSocketConnection from "../../../../utility/pageViewSocketConnection";

const Training = ({ trainingsData, fetchTrainings }) => {
    useEffect(() => {
        document.title = 'Adasik - Training';
        fetchTrainings();
        const pageViewSocket = pageViewSocketConnection();

        return () => {
            pageViewSocket.disconnect();
        };
    }, []);

    function renderTrainings() {
        const trainingsObj = {};

        trainingsData.data.forEach(training => {
            const type = training.type;
            trainingsObj[type] = trainingsObj[type] ? [ ...trainingsObj[type], training ] : [training];
        });

        return Object.keys(trainingsObj).map(trainingType => {
            return (
                <div className="training--group-container">
                    <div className="training--group__header-container">
                        <h2>{ trainingType }</h2>
                    </div>
                    <div className="training--items-container">
                        {
                            trainingsObj[trainingType].map(({ _id, name, icon }) => {
                                return (
                                    <Link target="_blank" to={ `/training/${ name.toLowerCase().split(' ').join('-') }` } key={ _id } className="training--item-container">
                                        <img src={ icon || person2 } alt={ name }/>
                                        <div className="training--item__name-container">
                                            <p>{ name }</p>
                                        </div>
                                    </Link>
                                );
                            })
                        }
                    </div>
                </div>
            );
        });
    }

    return (
        <div className="training--container">
            { trainingsData && trainingsData.data && renderTrainings() }
        </div>
    );
};

function mapStateToProps(state) {
    return {
        trainingsData: state.trainings
    }
}

export default requireAuth(connect(mapStateToProps, { fetchTrainings })(Training));