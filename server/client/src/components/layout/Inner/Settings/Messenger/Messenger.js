import React, { useState, useEffect } from 'react';
import './Messenger.scss';
import { connect } from 'react-redux';
import Button from "../Button/Button";
import Checkbox from "../Checkbox/Checkbox";
import Loading from "../../../utils/Loading/Loading";
import Spinner from "../../../utils/Spinner/Spinner";
import {
    fetchSettingsMessengerData,
    sendSettingsMessengerData,
    wipeSettingsMessengerData
} from "../../../../../actions/settingsAction";
import requireAuth from "../../../../../middlewares/requireAuth";
import pageViewSocketConnection from "../../../../../utility/pageViewSocketConnection";

const Messenger = ({
                       messengerData,
                       fetchSettingsMessengerData,
                       sendSettingsMessengerData,
                       wipeSettingsMessengerData
}) => {
    const [sendError, setSendError] = useState({ show: false, text: '' });
    const [sendSuccess, setSendSuccess] = useState({ show: false, text: '' });
    const [showSendingSpinner, setShowSendingSpinner] = useState(false);

    useEffect(() => {
        document.title = 'Adasik - Settings/Messenger';
        fetchSettingsMessengerData();
        const pageViewSocket = pageViewSocketConnection();

        return () => {
            wipeSettingsMessengerData();
            pageViewSocket.disconnect();
        };
    }, []);

    useEffect(() => {
        if (messengerData) {
            if (messengerData.data) {
                document.querySelectorAll('.messenger--checkbox')
                    .forEach(messengerCheckbox => {
                        messengerCheckbox.checked = messengerData.data.includes(messengerCheckbox.value);
                    });
            }

            if (!messengerData.Error) setSendError({ show: false, text: '' });
            if (!messengerData.messengerSettingsDataSend) setSendSuccess({ show: false, text: '' });

            if (messengerData.Error) {
                setShowSendingSpinner(false);
                setSendError({ show: true, text: 'Did not update your data. Try again' });
            }

            if (messengerData.messengerSettingsDataSend) {
                setShowSendingSpinner(false);
                setSendSuccess({ show: true, text: 'Successfully updated' });
                fetchSettingsMessengerData();
            }
        }
    }, [messengerData]);

    function handleSendBtnClick() {
        const dataArr = [];
        document.querySelectorAll('.messenger--checkbox')
            .forEach(messengerCheckbox => {
                if (messengerCheckbox.checked) dataArr.push({ value: messengerCheckbox.value, bool: true });
                else if (!messengerCheckbox.checked) dataArr.push({ value: messengerCheckbox.value, bool: false });
            });

        sendSettingsMessengerData(dataArr);
        setShowSendingSpinner(true);
    }

    return (
        <div className="settings--messenger-container" style={ !messengerData ? { height: '85vh', overflowY: 'hidden' } : {} }>
            { !messengerData && <Loading text="Fetching data..." /> }
            <ul className="checkbox--group">
                <li>
                    <Checkbox
                        checkboxId="messenger--checkbox-one"
                        checkboxClassName="messenger--checkbox"
                        text="Allow other users to send you message"
                    />
                </li>
                <li>
                    <Checkbox
                        checkboxId="messenger--checkbox-two"
                        checkboxClassName="messenger--checkbox"
                        text="Allow your friends to send you message"
                    />
                </li>
            </ul>
            <div className="settings--messenger__footer-container">
                <div className="upper-container">
                    { sendError.show && <p className="send--error">{ sendError.text }</p> }
                    { showSendingSpinner && <Spinner /> }
                    { sendSuccess.show && <p className="send--success">{ sendSuccess.text }</p> }
                </div>
                <Button
                    value="Edit"
                    onClick={ handleSendBtnClick }
                />
            </div>
        </div>
    );
};

function mapStateToProps(state) {
    return {
        messengerData: state.settings.messenger
    };
}

export default requireAuth(connect(mapStateToProps, {
    fetchSettingsMessengerData,
    sendSettingsMessengerData,
    wipeSettingsMessengerData
})(Messenger));