import React, { useContext, useEffect, useMemo, useRef } from 'react';
import makeCancellable from 'make-cancellable-promise';
import invariant from 'tiny-invariant';
import warning from 'tiny-warning';
import * as pdfjs from 'pdfjs-dist';
import DocumentContext from '../DocumentContext';
import PageContext from '../PageContext';
import { useResolver } from '../shared/hooks';
import { cancelRunningTask } from '../shared/utils';
export default function AnnotationLayer() {
    const documentContext = useContext(DocumentContext);
    invariant(documentContext, 'Unable to find Document context. Did you wrap <Page /> in <Document />?');
    const pageContext = useContext(PageContext);
    invariant(pageContext, 'Unable to find Page context.');
    const mergedProps = Object.assign(Object.assign({}, documentContext), pageContext);
    const { imageResourcesPath, linkService, onGetAnnotationsError: onGetAnnotationsErrorProps, onGetAnnotationsSuccess: onGetAnnotationsSuccessProps, onRenderAnnotationLayerError: onRenderAnnotationLayerErrorProps, onRenderAnnotationLayerSuccess: onRenderAnnotationLayerSuccessProps, page, renderForms, rotate, scale = 1, } = mergedProps;
    const [annotationsState, annotationsDispatch] = useResolver();
    const { value: annotations, error: annotationsError } = annotationsState;
    const layerElement = useRef(null);
    invariant(page, 'Attempted to load page annotations, but no page was specified.');
    warning(parseInt(window.getComputedStyle(document.body).getPropertyValue('--react-pdf-annotation-layer'), 10) === 1, 'AnnotationLayer styles not found. Read more: https://github.com/wojtekmaj/react-pdf#support-for-annotations');
    function onLoadSuccess() {
        if (!annotations) {
            // Impossible, but TypeScript doesn't know that
            return;
        }
        if (onGetAnnotationsSuccessProps) {
            onGetAnnotationsSuccessProps(annotations);
        }
    }
    function onLoadError() {
        if (!annotationsError) {
            // Impossible, but TypeScript doesn't know that
            return;
        }
        warning(false, annotationsError.toString());
        if (onGetAnnotationsErrorProps) {
            onGetAnnotationsErrorProps(annotationsError);
        }
    }
    function resetAnnotations() {
        annotationsDispatch({ type: 'RESET' });
    }
    useEffect(resetAnnotations, [annotationsDispatch, page]);
    function loadAnnotations() {
        if (!page) {
            return;
        }
        const cancellable = makeCancellable(page.getAnnotations());
        const runningTask = cancellable;
        cancellable.promise
            .then((nextAnnotations) => {
            annotationsDispatch({ type: 'RESOLVE', value: nextAnnotations });
        })
            .catch((error) => {
            annotationsDispatch({ type: 'REJECT', error });
        });
        return () => {
            cancelRunningTask(runningTask);
        };
    }
    useEffect(loadAnnotations, [annotationsDispatch, page, renderForms]);
    useEffect(() => {
        if (annotations === undefined) {
            return;
        }
        if (annotations === false) {
            onLoadError();
            return;
        }
        onLoadSuccess();
    }, 
    // Ommitted callbacks so they are not called every time they change
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [annotations]);
    function onRenderSuccess() {
        if (onRenderAnnotationLayerSuccessProps) {
            onRenderAnnotationLayerSuccessProps();
        }
    }
    function onRenderError(error) {
        warning(false, `${error}`);
        if (onRenderAnnotationLayerErrorProps) {
            onRenderAnnotationLayerErrorProps(error);
        }
    }
    const viewport = useMemo(() => page.getViewport({ scale, rotation: rotate }), [page, rotate, scale]);
    function renderAnnotationLayer() {
        if (!page || !annotations) {
            return;
        }
        const { current: layer } = layerElement;
        if (!layer) {
            return;
        }
        const clonedViewport = viewport.clone({ dontFlip: true });
        const parameters = {
            annotations,
            div: layer,
            downloadManager: null,
            imageResourcesPath,
            linkService,
            page,
            renderForms,
            viewport: clonedViewport,
            annotationStorage: (documentContext === null || documentContext === void 0 ? void 0 : documentContext.pdf) ? documentContext.pdf.annotationStorage : undefined,
        };
        layer.innerHTML = '';
        try {
            pdfjs.AnnotationLayer.render(parameters);
            // Intentional immediate callback
            onRenderSuccess();
        }
        catch (error) {
            onRenderError(error);
        }
        return () => {
            // TODO: Cancel running task?
        };
    }
    useEffect(renderAnnotationLayer, 
    // Ommitted callbacks so they are not called every time they change
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [annotations, imageResourcesPath, linkService, page, renderForms, viewport]);
    return React.createElement("div", { className: "react-pdf__Page__annotations annotationLayer", ref: layerElement });
}