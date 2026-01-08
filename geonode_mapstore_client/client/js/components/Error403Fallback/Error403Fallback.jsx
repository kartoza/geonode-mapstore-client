/*
* Copyright 2020, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/

import React from 'react';
import PropTypes from 'prop-types';
import HTML from "@mapstore/framework/components/I18N/HTML";
import Message from '@mapstore/framework/components/I18N/Message';
/*
customization of 403 error fallback for geonode
*/
function Error403Fallback({
    fallbackUrl,
    fallbackUrlText
}) {
    return (
        <div className="gn-main-event-container">
            <div className="gn-main-event-text">
                <h1><Message msgId="viewer.errors.error403.title" /></h1>
                <HTML msgId="viewer.errors.error403.subtitle" msgParams={{ fallbackUrl, fallbackUrlText }} />
            </div>
        </div>
    );
}

Error403Fallback.propTypes = {
    fallbackUrl: PropTypes.string,
    fallbackUrlText: PropTypes.string
};

Error403Fallback.defaultProps = {
    fallbackUrl: "/",
    fallbackUrlText: "home page"
};

export default Error403Fallback;
