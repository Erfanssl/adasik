import React, { useEffect, useRef, useCallback } from "react";
import './Button.scss';
import arrow from '../../../assets/left_arrow.svg';

const Button = ({ btnOnClick, disabled = false, delay }) => {
    const yesBtn = useRef();
    const noBtn = useRef();

    function btnMove(btn) {
        if (!disabled) {
            if (btn === 'left' && noBtn.current) {
                noBtn.current.style.transform = 'translateY(0%)';
                setTimeout(() => {
                    noBtn.current.style.transform = 'translateY(-6%)';
                }, 100);
            } else if (btn === 'right' && yesBtn.current) {
                yesBtn.current.style.transform = 'translateY(6%)';
                setTimeout(() => {
                    yesBtn.current.style.transform = 'translateY(0)';
                }, 100);
            }
        }
    }

    // const btnMove2 = useCallback(btnMove, [disabled]);

    useEffect(() => {
        if (!disabled) {
            const fn = e => {
                if (e.keyCode === 37) btnMove('left');
                else if (e.keyCode === 39) btnMove('right');
            };

            window.addEventListener('keydown', fn);

            return () => {
                window.removeEventListener('keydown', fn);
            };
        }
    }, [disabled]);

    function onClick(e) {
        const id = Number(e.target.dataset.id);
        if (id === 1) btnMove('left');
        else if (id === 2) btnMove('right');

        btnOnClick(e);
    }

    return (
        <div className="game--btn-container">
            <button ref={ noBtn } data-id={ 1 } onClick={ onClick } className="game--btn game--btn__no" disabled={ disabled }>
                <div data-id={ 1 } className="game--btn__inner-container">
                    <p data-id={ 1 }>No</p>
                    <img data-id={ 1 } src={ arrow } alt="arrow" />
                </div>
            </button>
            <button ref={ yesBtn } data-id={ 2 } onClick={ onClick } className="game--btn game--btn__yes" disabled={ disabled }>
                <div data-id={ 2 } className="game--btn__inner-container">
                    <img data-id={ 2 } src={ arrow } alt="arrow" />
                    <p data-id={ 2 }>Yes</p>
                </div>
            </button>
        </div>
    );
};

export default Button;