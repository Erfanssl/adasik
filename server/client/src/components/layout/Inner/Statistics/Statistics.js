import React, { useRef, useEffect, useState } from 'react';
import './Statistics.scss';
import { connect } from 'react-redux';
import { fetchStatisticsData } from "../../../../actions/statisticsAction";
import Loading from "../../utils/Loading/Loading";
import requireAuth from "../../../../middlewares/requireAuth";

import createRadar from "./Radar/createRadar";
import renderMultiLineChart from "./createMultiLineChart";
import renderBarChart from "./createBarChart";
import renderPieChart from "./createPieChart";
import renderDataHierarchy from "./createDataHierarchy";
import wordCapitalize from "../../../../utility/wordCapitalize";
import pageViewSocketConnection from "../../../../utility/pageViewSocketConnection";

const Statistics = ({
                        statisticsData,
                        fetchStatisticsData
}) => {
    const [progress, setProgress] = useState('total');

    const canvas1 = useRef();
    const canvas2 = useRef();
    const barChart = useRef();
    const games = useRef();
    const strength = useRef();

    useEffect(() => {
        document.title = 'Adasik - Statistics';
        fetchStatisticsData();
        const pageViewSocket = pageViewSocketConnection();

        return () => {
            pageViewSocket.disconnect();
        };
    }, []);

    useEffect(() => {
        if (statisticsData && statisticsData.history) {
            const barChartData = [];
            for (let i = 0; i < statisticsData.history.assignment.length; i++) {
                barChartData.push({ name: i + 1, percent: (statisticsData.history.assignment[i]) * 100 });
            }
            if (barChart && barChart.current) {
                const svg = document.querySelector('.statistics--bar-chart-container svg');
                if (svg) svg.parentNode.removeChild(svg);
            }
            renderBarChart(barChart, barChartData, true);
        }

        if (statisticsData && statisticsData.games) {
            const pieChartData = [];
            Object.keys(statisticsData.games).forEach(gameDataKey => {
                if (gameDataKey !== 'total') pieChartData.push({ name: gameDataKey, orders: statisticsData.games[gameDataKey] });
            });
            if (games && games.current) {
                const svg = document.querySelector('.statistics--games-container svg');
                if (svg) svg.parentNode.removeChild(svg);
            }
            renderPieChart(games, pieChartData, null, true);
        }

        if (statisticsData && statisticsData.gamesData && statisticsData.gamesData?.length) {
            const gamesDataArr = [ { name: 'games', parent: '' } ];
            statisticsData.gamesData.forEach(gameDataObj => {
                if (!gamesDataArr.find(gObj => gObj.name === gameDataObj.type)) gamesDataArr.push({ name: gameDataObj.type, parent: 'games' });
                gamesDataArr.push({ name: gameDataObj.name, parent: gameDataObj.type, amount: gameDataObj.count });
            });
            if (strength && strength.current) {
                const svg = document.querySelector('.statistics--strength-container svg');
                if (svg) svg.parentNode.removeChild(svg);
            }
            renderDataHierarchy(strength, gamesDataArr);
        } else if (statisticsData && statisticsData.gamesData && !statisticsData.gamesData.length) {
            if (strength && strength.current) {
                const svg = document.querySelector('.statistics--strength-container svg');
                if (svg) svg.parentNode.removeChild(svg);
            }
            renderDataHierarchy(strength, undefined, true);
        }
    }, [statisticsData]);

    useEffect(() => {
        if (statisticsData && statisticsData.brain && canvas1 && canvas1.current) {
            const brainData = [[]];

            Object.keys(statisticsData.brain).forEach(dataKey => {
                brainData[0].push({ axis: wordCapitalize(dataKey), value: statisticsData.brain[dataKey] });
            });

            createRadar(canvas1, brainData, 'big', true);
        }
    }, [canvas1, statisticsData]);

    useEffect(() => {
        if (statisticsData && statisticsData.personality && canvas2 && canvas2.current) {
            const personalityData = [[]];

            Object.keys(statisticsData.personality).forEach(dataKey => {
                personalityData[0].push({ axis: wordCapitalize(dataKey), value: statisticsData.personality[dataKey] });
            });

            createRadar(canvas2, personalityData, 'big', true);
        }
    }, [canvas2, statisticsData]);

    useEffect(() => {
        if (statisticsData && statisticsData.history) {
            function dataArrMaker(dataArr) {
                const arr = [];
                for (let i = 0; i < dataArr.length; i++) {
                    arr.push({ date: i + 1, value: dataArr[i] });
                }

                return arr;
            }

            switch (progress) {
                case 'total':
                    const totalScore = dataArrMaker(statisticsData.history.totalScore);
                    renderMultiLineChart(totalScore);
                    break;
                case 'training':
                    const trainingScore = dataArrMaker(statisticsData.history.trainingScore);
                    renderMultiLineChart(trainingScore);
                    break;
                case 'rank':
                    const rank = dataArrMaker(statisticsData.history.rank);
                    renderMultiLineChart(rank);
                    break;
            }
        }
    }, [progress, statisticsData]);

    function handleProgressItemClick(event) {
        const itemName = event.target.dataset.name;
        setProgress(itemName);
        document.querySelector('.active--progress-item')?.classList.remove('active--progress-item');
        event.target.classList.add('active--progress-item');
    }

    function renderRadarInside() {
        return (
            <>
                <div className="statistics--radar-container">
                    <div ref={ canvas1 } className="statistics--radar-one">
                        <h2>Brain</h2>
                    </div>
                    <div ref={ canvas2 } className="statistics--radar-two">
                        <h2>Personality</h2>
                    </div>
                </div>
            </>
        );
    }

    function renderLineChartSection() {
        return (
            <div className="statistics--line-chart-container">
                {
                    statisticsData && statisticsData.history && statisticsData.history.totalScore.length <= 1 &&
                    <div className="insufficient--data">
                        You should play more challenges to use this section
                    </div>
                }
                <div className="statistics--line-chart__header-container">
                    <h2>Your Progress During the Last 30 Records</h2>
                    <ul className="statistics--line-chart__items-group">
                        <li className="active--progress-item" data-name="total" onClick={ handleProgressItemClick }>Total Score</li>
                        <li data-name="training" onClick={ handleProgressItemClick }>Training Score</li>
                        <li data-name="rank" onClick={ handleProgressItemClick }>Rank</li>
                    </ul>
                </div>
                <div className="wrapper">
                    <div className="chart-wrapper">
                        <div id="totalChart" className="draw_graph_container" />
                    </div>
                </div>
            </div>
        );
    }

    function renderBarChartSection() {
        return (
            <div ref={ barChart } className="statistics--bar-chart-container">
                <h2>Your Assignment's Completion During the Last 30 Records</h2>
            </div>
        );
    }

    return (
        <div className="statistics--container">
            { (!statisticsData || (statisticsData && !statisticsData.brain)) && <Loading />  }
            { statisticsData && renderRadarInside() }
            { statisticsData && renderLineChartSection() }
            { statisticsData && renderBarChartSection() }
            <svg width="0" height="0">
                <defs>
                    <linearGradient id="bar-chart--gr" gradientUnits="userSpaceOnUse" x1="499.7742" y1="1396.9193" x2="499.7742" y2="11.8453">
                        <stop offset="0%" style={{ stopColor: '#ffffff' }} />
                        <stop offset="50%" style={{ stopColor: '#ffffff' }} />
                        <stop offset="60%" style={{ stopColor: '#ffffff' }} />
                        <stop offset="100%" style={{ stopColor: '#55EFC4' }} />
                    </linearGradient>
                </defs>
            </svg>
            <div className="statistics--games-strength-container">
                <div ref={ games } className="statistics--games-container">
                    {
                        statisticsData && statisticsData.games && statisticsData.games.total === 0 &&
                        <div className="no--games">
                            <p>You've Completed no Challenges!</p>
                        </div>
                    }
                    <h2>Challenges</h2>
                </div>
                <div ref={ strength } className="statistics--strength-container">
                    <h2>Games Based on Number of Times You Have Played</h2>
                </div>
            </div>
        </div>
    );
};

function mapStateToProps(state) {
    return {
        statisticsData: state.statistics
    };
}

export default requireAuth(connect(mapStateToProps, {
    fetchStatisticsData
})(Statistics));