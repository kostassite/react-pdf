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
import React, { useContext, useEffect, useMemo, useRef } from 'react';
import PropTypes from 'prop-types';
import makeCancellable from 'make-cancellable-promise';
import makeEventProps from 'make-event-props';
import clsx from 'clsx';
import mergeRefs from 'merge-refs';
import invariant from 'tiny-invariant';
import warning from 'tiny-warning';
import DocumentContext from './DocumentContext';
import PageContext from './PageContext';
import Message from './Message';
import PageCanvas from './Page/PageCanvas';
import PageSVG from './Page/PageSVG';
import TextLayer from './Page/TextLayer';
import AnnotationLayer from './Page/AnnotationLayer';
import { cancelRunningTask, isProvided, makePageCallback } from './shared/utils';
import { useResolver } from './shared/hooks';
import { eventProps, isClassName, isPageIndex, isPageNumber, isPdf, isRef, isRenderMode, isRotate, } from './shared/propTypes';
const defaultScale = 1;
export default function Page(props) {
    const context = useContext(DocumentContext);
    invariant(context, 'Unable to find Document context. Did you wrap <Page /> in <Document />?');
    const mergedProps = Object.assign(Object.assign({}, context), props);
    const { canvasBackground, canvasRef, children, className, customTextRenderer, devicePixelRatio, error = 'Failed to load the page.', height, inputRef, loading = 'Loading page…', noData = 'No page specified.', onGetAnnotationsError: onGetAnnotationsErrorProps, onGetAnnotationsSuccess: onGetAnnotationsSuccessProps, onGetTextError: onGetTextErrorProps, onGetTextSuccess: onGetTextSuccessProps, onLoadError: onLoadErrorProps, onLoadSuccess: onLoadSuccessProps, onRenderAnnotationLayerError: onRenderAnnotationLayerErrorProps, onRenderAnnotationLayerSuccess: onRenderAnnotationLayerSuccessProps, onRenderError: onRenderErrorProps, onRenderSuccess: onRenderSuccessProps, onRenderTextLayerError: onRenderTextLayerErrorProps, onRenderTextLayerSuccess: onRenderTextLayerSuccessProps, pageIndex: pageIndexProps, pageNumber: pageNumberProps, pdf, registerPage, renderAnnotationLayer: renderAnnotationLayerProps = true, renderForms = false, renderMode = 'canvas', renderTextLayer: renderTextLayerProps = true, rotate: rotateProps, scale: scaleProps = defaultScale, unregisterPage, width } = mergedProps, otherProps = __rest(mergedProps, ["canvasBackground", "canvasRef", "children", "className", "customTextRenderer", "devicePixelRatio", "error", "height", "inputRef", "loading", "noData", "onGetAnnotationsError", "onGetAnnotationsSuccess", "onGetTextError", "onGetTextSuccess", "onLoadError", "onLoadSuccess", "onRenderAnnotationLayerError", "onRenderAnnotationLayerSuccess", "onRenderError", "onRenderSuccess", "onRenderTextLayerError", "onRenderTextLayerSuccess", "pageIndex", "pageNumber", "pdf", "registerPage", "renderAnnotationLayer", "renderForms", "renderMode", "renderTextLayer", "rotate", "scale", "unregisterPage", "width"]);
    const [pageState, pageDispatch] = useResolver();
    const { value: page, error: pageError } = pageState;
    const pageElement = useRef(null);
    invariant(pdf, 'Attempted to load a page, but no document was specified.');
    const pageIndex = isProvided(pageNumberProps) ? pageNumberProps - 1 : pageIndexProps !== null && pageIndexProps !== void 0 ? pageIndexProps : null;
    const pageNumber = pageNumberProps !== null && pageNumberProps !== void 0 ? pageNumberProps : (isProvided(pageIndexProps) ? pageIndexProps + 1 : null);
    const rotate = rotateProps !== null && rotateProps !== void 0 ? rotateProps : (page ? page.rotate : null);
    const scale = useMemo(() => {
        if (!page) {
            return null;
        }
        // Be default, we'll render page at 100% * scale width.
        let pageScale = 1;
        // Passing scale explicitly null would cause the page not to render
        const scaleWithDefault = scaleProps !== null && scaleProps !== void 0 ? scaleProps : defaultScale;
        // If width/height is defined, calculate the scale of the page so it could be of desired width.
        if (width || height) {
            const viewport = page.getViewport({ scale: 1, rotation: rotate });
            if (width) {
                pageScale = width / viewport.width;
            }
            else if (height) {
                pageScale = height / viewport.height;
            }
        }
        return scaleWithDefault * pageScale;
    }, [height, page, rotate, scaleProps, width]);
    function hook() {
        return () => {
            if (pageIndex === null) {
                // Impossible, but TypeScript doesn't know that
                return;
            }
            if (unregisterPage) {
                unregisterPage(pageIndex);
            }
        };
    }
    useEffect(hook, [pdf, pageIndex, unregisterPage]);
    /**
     * Called when a page is loaded successfully
     */
    function onLoadSuccess() {
        if (onLoadSuccessProps) {
            if (!page || !scale) {
                // Impossible, but TypeScript doesn't know that
                return;
            }
            onLoadSuccessProps(makePageCallback(page, scale));
        }
        if (registerPage) {
            if (pageIndex === null || !pageElement.current) {
                // Impossible, but TypeScript doesn't know that
                return;
            }
            registerPage(pageIndex, pageElement.current);
        }
    }
    /**
     * Called when a page failed to load
     */
    function onLoadError() {
        if (!pageError) {
            // Impossible, but TypeScript doesn't know that
            return;
        }
        warning(false, pageError.toString());
        if (onLoadErrorProps) {
            onLoadErrorProps(pageError);
        }
    }
    function resetPage() {
        pageDispatch({ type: 'RESET' });
    }
    useEffect(resetPage, [pageDispatch, pdf, pageIndex]);
    function loadPage() {
        if (!pdf || !pageNumber) {
            return;
        }
        const cancellable = makeCancellable(pdf.getPage(pageNumber));
        const runningTask = cancellable;
        cancellable.promise
            .then((nextPage) => {
            pageDispatch({ type: 'RESOLVE', value: nextPage });
        })
            .catch((error) => {
            pageDispatch({ type: 'REJECT', error });
        });
        return () => cancelRunningTask(runningTask);
    }
    useEffect(loadPage, [pageDispatch, pdf, pageIndex, pageNumber, registerPage]);
    useEffect(() => {
        if (page === undefined) {
            return;
        }
        if (page === false) {
            onLoadError();
            return;
        }
        onLoadSuccess();
    }, 
    // Ommitted callbacks so they are not called every time they change
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [page, scale]);
    const childContext = 
    // Technically there cannot be page without pageIndex, pageNumber, rotate and scale, but TypeScript doesn't know that
    page &&
        isProvided(pageIndex) &&
        isProvided(pageNumber) &&
        isProvided(rotate) &&
        isProvided(scale)
        ? {
            canvasBackground,
            customTextRenderer,
            devicePixelRatio,
            onGetAnnotationsError: onGetAnnotationsErrorProps,
            onGetAnnotationsSuccess: onGetAnnotationsSuccessProps,
            onGetTextError: onGetTextErrorProps,
            onGetTextSuccess: onGetTextSuccessProps,
            onRenderAnnotationLayerError: onRenderAnnotationLayerErrorProps,
            onRenderAnnotationLayerSuccess: onRenderAnnotationLayerSuccessProps,
            onRenderError: onRenderErrorProps,
            onRenderSuccess: onRenderSuccessProps,
            onRenderTextLayerError: onRenderTextLayerErrorProps,
            onRenderTextLayerSuccess: onRenderTextLayerSuccessProps,
            page,
            pageIndex,
            pageNumber,
            renderForms,
            rotate,
            scale,
        }
        : null;
    const eventProps = useMemo(() => makeEventProps(otherProps, () => page ? (scale ? makePageCallback(page, scale) : undefined) : page), [otherProps, page, scale]);
    const pageKey = `${pageIndex}@${scale}/${rotate}`;
    const pageKeyNoScale = `${pageIndex}/${rotate}`;
    function renderMainLayer() {
        switch (renderMode) {
            case 'none':
                return null;
            case 'svg':
                return React.createElement(PageSVG, { key: `${pageKeyNoScale}_svg` });
            case 'canvas':
            default:
                return React.createElement(PageCanvas, { key: `${pageKey}_canvas`, canvasRef: canvasRef });
        }
    }
    function renderTextLayer() {
        if (!renderTextLayerProps) {
            return null;
        }
        return React.createElement(TextLayer, { key: `${pageKey}_text` });
    }
    function renderAnnotationLayer() {
        if (!renderAnnotationLayerProps) {
            return null;
        }
        /**
         * As of now, PDF.js 2.0.943 returns warnings on unimplemented annotations in SVG mode.
         * Therefore, as a fallback, we render "traditional" AnnotationLayer component.
         */
        return React.createElement(AnnotationLayer, { key: `${pageKey}_annotations` });
    }
    function renderChildren() {
        return (React.createElement(PageContext.Provider, { value: childContext },
            renderMainLayer(),
            renderTextLayer(),
            renderAnnotationLayer(),
            children));
    }
    function renderContent() {
        if (!pageNumber) {
            return React.createElement(Message, { type: "no-data" }, typeof noData === 'function' ? noData() : noData);
        }
        if (pdf === null || page === undefined || page === null) {
            return (React.createElement(Message, { type: "loading" }, typeof loading === 'function' ? loading() : loading));
        }
        if (pdf === false || page === false) {
            return React.createElement(Message, { type: "error" }, typeof error === 'function' ? error() : error);
        }
        return renderChildren();
    }
    return (React.createElement("div", Object.assign({ className: clsx('react-pdf__Page', className), "data-page-number": pageNumber, ref: mergeRefs(inputRef, pageElement), style: {
            ['--scale-factor']: `${scale}`,
            backgroundColor: canvasBackground || 'white',
            position: 'relative',
            minWidth: 'min-content',
            minHeight: 'min-content',
        } }, eventProps), renderContent()));
}
const isFunctionOrNode = PropTypes.oneOfType([PropTypes.func, PropTypes.node]);
Page.propTypes = Object.assign(Object.assign({}, eventProps), { canvasBackground: PropTypes.string, canvasRef: isRef, children: PropTypes.node, className: isClassName, customTextRenderer: PropTypes.func, devicePixelRatio: PropTypes.number, error: isFunctionOrNode, height: PropTypes.number, imageResourcesPath: PropTypes.string, inputRef: isRef, loading: isFunctionOrNode, noData: isFunctionOrNode, onGetTextError: PropTypes.func, onGetTextSuccess: PropTypes.func, onLoadError: PropTypes.func, onLoadSuccess: PropTypes.func, onRenderError: PropTypes.func, onRenderSuccess: PropTypes.func, onRenderTextLayerError: PropTypes.func, onRenderTextLayerSuccess: PropTypes.func, pageIndex: isPageIndex, pageNumber: isPageNumber, pdf: isPdf, renderAnnotationLayer: PropTypes.bool, renderForms: PropTypes.bool, renderMode: isRenderMode, renderTextLayer: PropTypes.bool, rotate: isRotate, scale: PropTypes.number, width: PropTypes.number });