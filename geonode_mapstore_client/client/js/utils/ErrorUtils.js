/*
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { ProcessTypes } from './ResourceServiceUtils';

export const getUploadErrorMessageFromCode = (code, log) => {
    if (log) {
        // Make the error log more human readable
        const errorMsg = log.replace(/[()]/g, '')?.replace(/[\[\]']+/g, '')?.split('ErrorDetailstring=')?.join(' ');
        return errorMsg;
    }
    switch (code) {
    case 'upload_parallelism_limit_exceeded': {
        return 'parallelLimitError';
    }
    case 'total_upload_size_exceeded': {
        return 'fileExceeds';
    }
    case 'upload_exception':
    default:
        return 'invalidUploadMessageErrorTooltip';
    }
};

/**
 * Extracts a human readable message from an upload request error response,
 * eg. `{ success: false, errors: ['Non-ASCII character found in filename'], code: '...' }`
 * as returned by the `/uploads/upload` endpoint.
 * @param {Object|string} error - the error caught from the upload request
 * @returns {string|null} the extracted message, or null if none could be found
 */
export const getUploadErrorMessage = (error) => {
    if (!error) {
        return null;
    }
    if (typeof error === 'string') {
        return error;
    }
    if (Array.isArray(error.errors) && error.errors.length > 0) {
        return error.errors.join(' ');
    }
    if (typeof error.detail === 'string') {
        return error.detail;
    }
    return null;
};

/**
 * Extracts error information from a process object
 * @param {Object} process - The process or payload object containing error information
 * @param {Object} process.output - The output object with log and error
 * @param {string} process.processType - The type of process (copy, delete, etc.)
 * @param {string} [defaultTitle] - Optional default title to use instead of auto-detected title
 * @param {string} [defaultMessage] - Optional default message to use if no error is found
 * @returns {Object} Object with title and message properties
 */
export const getProcessErrorInfo = (process, { defaultTitle = null, defaultMessage = 'map.mapError.errorDefault' } = {}) => {
    const output = process?.output;
    const processType = process?.processType;

    // Extract error message
    const log = output?.log;
    const errorMessage = log
        ? getUploadErrorMessageFromCode(null, log)
        : output?.error || process?.error || defaultMessage;

    // Determine error title based on process type
    let title = defaultTitle;
    if (!title && processType) {
        const isCopy = ['copy', 'copy_geonode_resource', ProcessTypes.COPY_RESOURCE].includes(processType);
        const isDelete = [ProcessTypes.DELETE_RESOURCE, 'delete'].includes(processType);
        title = isCopy
            ? "gnviewer.errorCloningTitle"
            : isDelete
                ? "gnviewer.errorDeletingTitle"
                : "gnviewer.errorOperationTitle";
    }

    return {
        title: title || "gnviewer.errorOperationTitle",
        message: errorMessage
    };
};
