import React, { useState, useEffect, useRef } from 'react';
import './ImagePicker.scss';
import { connect } from 'react-redux';
import Loading from "../../../../utils/Loading/Loading";
import {
    sendSettingsProfileAvatar
} from "../../../../../../actions/settingsAction";
import Spinner from "../../../../utils/Spinner/Spinner";


import user from "../../../../../../assets/icons/user.svg";
import accept from '../../../../../../assets/check.svg';
import close from '../../../../../../assets/icons/close.svg';

const ImagePicker = ({
                         setShowPopUp,
                         settingsProfileData,
                         sendSettingsProfileAvatar,
                         avatar,
                         setAvatar
}) => {
    const [pic, setPic] = useState('');
    const [picBuffer, setPicBuffer] = useState('');
    const [imageLoading, setImageLoading] = useState(false);
    const [imageLocation, setImageLocation] = useState({ x: 0, y: 0 });
    const [e, setE] = useState('');
    const [squareMovePermission, setSquareMovePermission] = useState(true);
    const [finalSquareLocation, setFinalSquareLocation] = useState({ left: null, top: null, imageWidth: null, imageHeight: null, squareWidth: null, squareHeight: null });
    const [warning, setWarning] = useState({ show: false, text: '' });
    const [showLoadingAvatarSpinner, setShowLoadingAvatarSpinner] = useState(false);
    const [loadInterval, setLoadInterval] = useState('');

    useEffect(() => {
        return () => {
            if (loadInterval) clearInterval(loadInterval);
        };
    }, []);

    useEffect(() => {
        if (settingsProfileData && settingsProfileData.url && !settingsProfileData.Error) {
            const loadInterval = setInterval(() => {
                const image = new Image();
                image.src = settingsProfileData.url;

                image.onload = () => {
                    setAvatar(settingsProfileData.url);
                    setShowLoadingAvatarSpinner(false);
                    clearInterval(loadInterval);
                };
            }, 300);

            setLoadInterval(loadInterval);
        }

        if (settingsProfileData && settingsProfileData.Error) {
            setWarning({ show: true, text: 'Upload was failed. Try again.' });
            setShowLoadingAvatarSpinner(false);
        }
    }, [settingsProfileData]);

    // refs
    const square = useRef();
    const tempContainer = useRef();
    const imageEl = useRef();
    const imagePickerInput = useRef();
    const imageUp = useRef();

    console.log(settingsProfileData)

    useEffect(() => {
        if (imageEl && imageEl.current) {
            const imageX = imageEl.current.getClientRects()[0].x;
            const imageY = imageEl.current.getClientRects()[0].y;
            setImageLocation({ x: imageX, y: imageY });
        }

        if (pic.length) {
            setImageLoading(false);
            // we get width and the height of the image and pick the minimum
            const imageWidth = imageEl.current.offsetWidth;
            const imageHeight = imageEl.current.offsetHeight;
            const min = Math.min(imageWidth, imageHeight);
            // now we set it for width and height of the square
            square.current.style.width = (min - 10) + 'px';
            square.current.style.height = (min - 10) + 'px';
        }
    }, [imageEl, pic])

    // useEffect(() => {
    //     console.log(imageLoading);
    // }, [imageLoading]);

    useEffect(() => {
        if (squareMovePermission && imageLocation.x !== 0) {
            if (e.clientX > imageLocation.x + square.current.offsetWidth / 2 && e.clientX < imageLocation.x + imageEl.current.getClientRects()[0].width - (square.current.offsetWidth / 2 - 2)) {
                square.current.style.left = e.clientX - (imageLocation.x + square.current.offsetWidth / 2 + 2) + 'px';
            }

            if (e.clientY > imageLocation.y + square.current.offsetHeight / 2 && e.clientY < imageLocation.y + imageEl.current.getClientRects()[0].height - square.current.offsetHeight / 2 - 2) {
                square.current.style.top = e.clientY - (imageLocation.y + square.current.offsetHeight / 2 + 2) + 'px';
            }
        }
    }, [squareMovePermission, e, imageLocation]);

    function handleTempMouseMove(e) {
        setE(e);
    }

    function handleImagePicker(e) {
        const file = e.target.files[0];
        setWarning({ show: false, text: '' });

        if (file.size >= 4 * 1024 * 1024) {
            setWarning({ show: true, text: 'The size of the image should be lower than 4MB' });

            setTimeout(() => {
                setWarning({ show: false, text: 'The size of the image should be lower than 4MB' });
            }, 800);

            setTimeout(() => {
                setWarning({ show: true, text: 'The size of the image should be lower than 4MB' });
            }, 1300);

            setTimeout(() => {
                setWarning({ show: false, text: '' });
            }, 3000);

            return;
        }

        setShowPopUp(true);
        setPicBuffer(file);
        setImageLoading(true);
        const reader = new FileReader();

        reader.onload = (e) => {
            setPic(e.target.result);
        };

        reader.readAsDataURL(file);
    }

    function handlePopUpCloseBtn(e) {
        setShowPopUp(false);
        setPic('');
        setPicBuffer('');
        setImageLocation({ x: 0, y: 0 });
        setE('');
        setSquareMovePermission(true);
        imagePickerInput.current.value = '';
    }

    function handlePopUpSendAvatar(e) {
        if (finalSquareLocation.left === null) {
            setWarning({ show: true, text: 'Please click on the red square first' });

            setTimeout(() => {
                setWarning({ show: false, text: '' });
            }, 2500);
        }

        if (finalSquareLocation.left !== null) {
            // we send the request via our action
            sendSettingsProfileAvatar(finalSquareLocation, picBuffer);

            setShowPopUp(false);
            setPic('');
            setPicBuffer('');
            setImageLocation({ x: 0, y: 0 });
            setE('');
            setSquareMovePermission(true);
            setFinalSquareLocation({ left: null, top: null, imageWidth: null, imageHeight: null, squareWidth: null, squareHeight: null });
            imagePickerInput.current.value = '';
            setAvatar('');
            setShowLoadingAvatarSpinner(true);
        }
    }

    function handleSquareClick(e) {
        const left = square.current.offsetLeft;
        const top = square.current.offsetTop;
        const imageWidth = imageEl.current.offsetWidth;
        const imageHeight = imageEl.current.offsetHeight;
        const squareWidth = square.current.offsetWidth;
        const squareHeight = square.current.offsetHeight;
        console.log({ left, top, imageWidth, imageHeight, squareWidth, squareHeight });
        setFinalSquareLocation({ left, top, imageWidth, imageHeight, squareWidth, squareHeight });
        setSquareMovePermission(false);
    }

    return (
        <>
            {
                pic.length > 0 &&
                <div className="avatar--pop-up">
                    <div className="pop-up--header__container">
                        <p>Click on the part of the image you want to set as you avatar</p>
                        <div className="btn--container">
                            <img onClick={ handlePopUpCloseBtn } src={ close } alt="close" />
                            <img style={ !squareMovePermission ? { filter: 'brightness(1)' } : {} } className="accept" onClick={ handlePopUpSendAvatar } src={ accept } alt="accept" />
                        </div>
                        { warning.show && <p className="warning">{ warning.text }</p> }
                    </div>
                    <div onMouseMove={ handleTempMouseMove } onMouseDown={ handleTempMouseMove } ref={ tempContainer } className="temp">
                        <img ref={ imageEl } src={ pic } alt="temp" />
                        <div onClick={ handleSquareClick  } ref={ square } className="square" />
                    </div>
                </div>
            }
            {
                imageLoading &&
                    <Loading
                        text="Loading the Image..."
                    />
            }
            <div className="settings--profile__avatar-container">
                <div className="image--container">
                    <img ref={ imageUp } src={ (settingsProfileData && avatar) ? avatar : user } alt="avatar" />
                    {
                        showLoadingAvatarSpinner &&
                        <div className="spinner--container">
                            <Spinner />
                        </div>
                    }
                </div>
                { warning.show && <div className="warning--size">{ warning.text }</div> }
                <input ref={ imagePickerInput } type="file" id="settings--profile__avatar-picker" onChange={ handleImagePicker } accept="image/jpeg, image/png" />
                <label htmlFor="settings--profile__avatar-picker">
                    Upload a Photo
                </label>
            </div>
        </>
    );
};

function mapStateToProps(state) {
    return {
        settingsProfileData: state.settings.profile
    };
}

export default connect(mapStateToProps, {
    sendSettingsProfileAvatar
})(ImagePicker);