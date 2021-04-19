import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import {
    requireAuthFetchData,
    requireAuthWipeData
} from "../actions/requireAuthAction";
import Loading from "../components/layout/utils/Loading/Loading";
import history from "../history";

const requireAuth = (Component, isProfile = false) => {
    function NewComponent({
                              requireAuthData,
                              requireAuthFetchData,
                              requireAuthWipeData,
                              ...props
    }) {
        useEffect(() => {
            requireAuthFetchData();

            return () => {
                requireAuthWipeData();
            };
        }, []);

        if (requireAuthData.NotAuthorizedError) {
            history.push('/sign-in');
            return <div>Redirecting...</div>;
        }
        if (requireAuthData.IncompleteProfileError && !isProfile) {
            history.push('/settings/profile');
            return <div>Redirecting...</div>
        }
        if (requireAuthData.FetchError) return <Loading text="Unable to fetch data. Try again" />;
        if (requireAuthData.done || (requireAuthData.IncompleteProfileError && isProfile)) return <Component { ...props } />

        return <Loading text="Fetching data..." />;
    }

    function mapStateToProps(state) {
        return {
            requireAuthData: state.requireAuth
        };
    }

    return connect(mapStateToProps, {
        requireAuthFetchData,
        requireAuthWipeData
    })(NewComponent);
}

export default requireAuth;