var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
import React, { useContext, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import makeCancellable from 'make-cancellable-promise';
import makeEventProps from 'make-event-props';
import clsx from 'clsx';
import invariant from 'tiny-invariant';
import warning from 'tiny-warning';
import DocumentContext from './DocumentContext';
import OutlineContext from './OutlineContext';
import OutlineItem from './OutlineItem';
import { cancelRunningTask } from './shared/utils';
import { useResolver } from './shared/hooks';
import { eventProps, isClassName, isPdf, isRef } from './shared/propTypes';
export default function Outline(props) {
    const context = useContext(DocumentContext);
    invariant(context, 'Unable to find Document context. Did you wrap <Outline /> in <Document />?');
    const mergedProps = Object.assign(Object.assign({}, context), props);
    const { className, inputRef, onItemClick: onItemClickProps, onLoadError: onLoadErrorProps, onLoadSuccess: onLoadSuccessProps, pdf } = mergedProps, otherProps = __rest(mergedProps, ["className", "inputRef", "onItemClick", "onLoadError", "onLoadSuccess", "pdf"]);
    invariant(pdf, 'Attempted to load an outline, but no document was specified.');
    const [outlineState, outlineDispatch] = useResolver();
    const { value: outline, error: outlineError } = outlineState;
    /**
     * Called when an outline is read successfully
     */
    function onLoadSuccess() {
        if (typeof outline === 'undefined' || outline === false) {
            return;
        }
        if (onLoadSuccessProps) {
            onLoadSuccessProps(outline);
        }
    }
    /**
     * Called when an outline failed to read successfully
     */
    function onLoadError() {
        if (!outlineError) {
            // Impossible, but TypeScript doesn't know that
            return;
        }
        warning(false, outlineError.toString());
        if (onLoadErrorProps) {
            onLoadErrorProps(outlineError);
        }
    }
    function onItemClick({ dest, pageIndex, pageNumber }) {
        if (onItemClickProps) {
            onItemClickProps({
                dest,
                pageIndex,
                pageNumber,
            });
        }
    }
    function resetOutline() {
        outlineDispatch({ type: 'RESET' });
    }
    useEffect(resetOutline, [outlineDispatch, pdf]);
    function loadOutline() {
        if (!pdf) {
            // Impossible, but TypeScript doesn't know that
            return;
        }
        const cancellable = makeCancellable(pdf.getOutline());
        const runningTask = cancellable;
        cancellable.promise
            .then((nextOutline) => {
            outlineDispatch({ type: 'RESOLVE', value: nextOutline });
        })
            .catch((error) => {
            outlineDispatch({ type: 'REJECT', error });
        });
        return () => cancelRunningTask(runningTask);
    }
    useEffect(loadOutline, [outlineDispatch, pdf]);
    useEffect(() => {
        if (outline === undefined) {
            return;
        }
        if (outline === false) {
            onLoadError();
            return;
        }
        onLoadSuccess();
    }, 
    // Ommitted callbacks so they are not called every time they change
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [outline]);
    const childContext = {
        onClick: onItemClick,
    };
    const eventProps = useMemo(() => makeEventProps(otherProps, () => outline), [otherProps, outline]);
    if (!outline) {
        return null;
    }
    function renderOutline() {
        if (!outline) {
            return null;
        }
        return (React.createElement("ul", null, outline.map((item, itemIndex) => (React.createElement(OutlineItem, { key: typeof item.dest === 'string' ? item.dest : itemIndex, item: item })))));
    }
    return (React.createElement("div", Object.assign({ className: clsx('react-pdf__Outline', className), ref: inputRef }, eventProps),
        React.createElement(OutlineContext.Provider, { value: childContext }, renderOutline())));
}
Outline.propTypes = Object.assign(Object.assign({}, eventProps), { className: isClassName, inputRef: isRef, onItemClick: PropTypes.func, onLoadError: PropTypes.func, onLoadSuccess: PropTypes.func, pdf: isPdf });