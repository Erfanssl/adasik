import React, { useEffect } from 'react';
import './Other.scss';
import requireAuth from "../../../../../middlewares/requireAuth";
import pageViewSocketConnection from "../../../../../utility/pageViewSocketConnection";
import Account from "./Account/Account";

const Other = () => {
    useEffect(() => {
        document.title = 'Adasik - Settings/Other';
        const pageViewSocket = pageViewSocketConnection();

        return () => {
            pageViewSocket.disconnect();
        };
    }, []);

    return (
        <div className="settings--other-container">
            <Account />
        </div>
    );
};

export default requireAuth(
    Other
);