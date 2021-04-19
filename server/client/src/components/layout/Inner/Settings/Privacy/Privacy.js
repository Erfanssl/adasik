import React, { useState, useEffect } from 'react';
import './Privacy.scss'
import { connect } from 'react-redux';
import {
    fetchSettingsPrivacyData,
    sendSettingsPrivacyData,
    wipeSettingsPrivacyData
} from "../../../../../actions/settingsAction";
import Button from "../Button/Button";
import Checkbox from "../Checkbox/Checkbox";
import Loading from "../../../utils/Loading/Loading";
import Spinner from "../../../utils/Spinner/Spinner";
import requireAuth from "../../../../../middlewares/requireAuth";
import pageViewSocketConnection from "../../../../../utility/pageViewSocketConnection";

const Privacy = ({
                     privacyData,
                     fetchSettingsPrivacyData,
                     sendSettingsPrivacyData,
                     wipeSettingsPrivacyData
}) => {
    const [sendError, setSendError] = useState({ show: false, text: '' });
    const [sendSuccess, setSendSuccess] = useState({ show: false, text: '' });
    const [showSendingSpinner, setShowSendingSpinner] = useState(false);

    useEffect(() => {
        document.title = 'Adasik - Settings/Privacy';
        fetchSettingsPrivacyData();
        const pageViewSocket = pageViewSocketConnection();

        return () => {
            wipeSettingsPrivacyData();
            pageViewSocket.disconnect();
        };
    }, []);
    useEffect(() => {
        if (privacyData) {
            if (privacyData.data) {
                document.querySelectorAll('.privacy--checkbox')
                    .forEach(privacyCheckbox => {
                        privacyCheckbox.checked = privacyData.data.includes(privacyCheckbox.value);
                    });
            }

            if (!privacyData.Error) setSendError({ show: false, text: '' });
            if (!privacyData.privacySettingsDataSend) setSendSuccess({ show: false, text: '' });

            if (privacyData.Error) {
                setShowSendingSpinner(false);
                setSendError({ show: true, text: 'Did not update your data. Try again' });
            }

            if (privacyData.privacySettingsDataSend) {
                setShowSendingSpinner(false);
                setSendSuccess({ show: true, text: 'Successfully updated' });

                setTimeout(() => {
                    fetchSettingsPrivacyData();
                }, 400);
            }
        }
    }, [privacyData]);

    function handleSendBtnClick() {
        const dataArr = [];
        document.querySelectorAll('.privacy--checkbox')
            .forEach(privacyCheckbox => {
                if (privacyCheckbox.checked) dataArr.push({ value: privacyCheckbox.value, bool: true });
                else if (!privacyCheckbox.checked) dataArr.push({ value: privacyCheckbox.value, bool: false });
            });

        sendSettingsPrivacyData(dataArr);
        setShowSendingSpinner(true);
    }

    return (
        <div className="settings--privacy-container">
            { !privacyData && <Loading text="Fetching data..." /> }
            <ul className="checkbox--group">
                <li>
                    <Checkbox
                        checkboxId="privacy--checkbox-one"
                        text="Allow other users to see your personal information (Age, Job, Education, Philosophy and Country)"
                        checkboxClassName="privacy--checkbox"
                    />
                </li>
                <li>
                    <Checkbox
                        checkboxId="privacy--checkbox-two"
                        text="Allow other users to see your brain information (diagram)"
                        checkboxClassName="privacy--checkbox"
                    />
                </li>
                <li>
                    <Checkbox
                        checkboxId="privacy--checkbox-three"
                        text="Allow other users to see your personality information (diagram)"
                        checkboxClassName="privacy--checkbox"
                    />
                </li>
                <li>
                    <Checkbox
                        checkboxId="privacy--checkbox-four"
                        text="Allow other users to see your friends"
                        checkboxClassName="privacy--checkbox"
                    />
                </li>
                <li>
                    <Checkbox
                        checkboxId="privacy--checkbox-five"
                        text="Enable notification"
                        checkboxClassName="privacy--checkbox"
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
        privacyData: state.settings.privacy
    };
}

export default requireAuth(connect(mapStateToProps, {
    fetchSettingsPrivacyData,
    sendSettingsPrivacyData,
    wipeSettingsPrivacyData
})(Privacy));