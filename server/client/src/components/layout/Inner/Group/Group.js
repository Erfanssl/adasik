import React, { useEffect } from 'react';
import './Group.scss';
import requireAuth from "../../../../middlewares/requireAuth";
import pageViewSocketConnection from "../../../../utility/pageViewSocketConnection";

const Group = () => {
    useEffect(() => {
        document.title = 'Adasik - Group';
        const pageViewSocket = pageViewSocketConnection();

        return () => {
            pageViewSocket.disconnect();
        };
    }, []);

    return (
        <div className="group--container">
            <div className="group--big-el">
                <div className="group--small-el" />
                <div className="group--smallest-el" />
            </div>
            <div className="group--shadow1" />
            <div className="group--shadow2" />
            <div className="group--text-container">
                <p>UNDER</p>
                <p>CONSTRUCTION</p>
                <div className="group--divide-line" />
                <p>Will be available until</p>
                <p>September 2022</p>
            </div>
            <div className="group--bottom__big-el">
                <div className="group--bottom__small-el" />
            </div>
        </div>
    );
};

export default requireAuth(Group);


