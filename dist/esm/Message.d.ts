import React from 'react';
import PropTypes from 'prop-types';
type MessageProps = {
    children: React.ReactNode;
    type: 'error' | 'loading' | 'no-data';
};
declare function Message({ children, type }: MessageProps): React.JSX.Element;
declare namespace Message {
    var propTypes: {
        children: PropTypes.Requireable<PropTypes.ReactNodeLike>;
        type: PropTypes.Validator<string>;
    };
}
export default Message;