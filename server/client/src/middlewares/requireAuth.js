import React from 'react';
import { connect } from 'react-redux';

import Loading from "../components/layout/utils/Loading/Loading";
import history from "../history";

const requireAuth = (Component, isProfile = false) => {
    function NewComponent({
                              identifier,
                              ...props
                          }) {
        if (!identifier) return <Loading />;

        if (identifier.NotAuthorizedError) {
            history.push('/sign-in');
            return <div>Redirecting...</div>;
        }

        if (identifier.FetchError) return <Loading text="Unable to fetch data. Try again" />;

        if (!identifier.name && !isProfile) {
            history.push('/settings/profile');
            return <div>Redirecting...</div>
        }

        if (identifier.text || (!identifier.name && isProfile)) return <Component { ...props } />;

        return <Loading />;
    }

    function mapStateToProps(state) {
        return {
            identifier: state.identifier
        };
    }

    return connect(mapStateToProps, null)(React.memo(NewComponent));
}

export default requireAuth;
