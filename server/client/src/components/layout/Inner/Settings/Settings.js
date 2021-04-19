import React from 'react';
import './Settings.scss';
import Profile from "./Profile/Profile";
import Nav from "./Nav/Nav";
import Messenger from "./Messenger/Messenger";
import Privacy from "./Privacy/Privacy";
import Other from "./Other/Other";

const Settings = ({ type = 'profile' }) => {
    function renderBody() {
        switch (type) {
            case 'profile':
                return <Profile />;
            case 'messenger':
                return <Messenger />;
            case 'privacy':
                return <Privacy />;
            case 'other':
                return <Other />;
        }
    }

    return (
        <div className="settings--container">
            <Nav />
            { renderBody() }
        </div>
    );
};

export default Settings;