"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importStar(require("react"));
const prop_types_1 = __importDefault(require("prop-types"));
const make_cancellable_promise_1 = __importDefault(require("make-cancellable-promise"));
const make_event_props_1 = __importDefault(require("make-event-props"));
const clsx_1 = __importDefault(require("clsx"));
const merge_refs_1 = __importDefault(require("merge-refs"));
const tiny_invariant_1 = __importDefault(require("tiny-invariant"));
const tiny_warning_1 = __importDefault(require("tiny-warning"));
const DocumentContext_1 = __importDefault(require("./DocumentContext"));
const PageContext_1 = __importDefault(require("./PageContext"));
const Message_1 = __importDefault(require("./Message"));
const PageCanvas_1 = __importDefault(require("./Page/PageCanvas"));
const PageSVG_1 = __importDefault(require("./Page/PageSVG"));
const TextLayer_1 = __importDefault(require("./Page/TextLayer"));
const AnnotationLayer_1 = __importDefault(require("./Page/AnnotationLayer"));
const utils_1 = require("./shared/utils");
const hooks_1 = require("./shared/hooks");
const propTypes_1 = require("./shared/propTypes");
const defaultScale = 1;
function Page(props) {
    const context = (0, react_1.useContext)(DocumentContext_1.default);
    (0, tiny_invariant_1.default)(context, 'Unable to find Document context. Did you wrap <Page /> in <Document />?');
    const mergedProps = Object.assign(Object.assign({}, context), props);
    const { canvasBackground, canvasRef, children, className, customTextRenderer, devicePixelRatio, error = 'Failed to load the page.', height, inputRef, loading = 'Loading page…', noData = 'No page specified.', onGetAnnotationsError: onGetAnnotationsErrorProps, onGetAnnotationsSuccess: onGetAnnotationsSuccessProps, onGetTextError: onGetTextErrorProps, onGetTextSuccess: onGetTextSuccessProps, onLoadError: onLoadErrorProps, onLoadSuccess: onLoadSuccessProps, onRenderAnnotationLayerError: onRenderAnnotationLayerErrorProps, onRenderAnnotationLayerSuccess: onRenderAnnotationLayerSuccessProps, onRenderError: onRenderErrorProps, onRenderSuccess: onRenderSuccessProps, onRenderTextLayerError: onRenderTextLayerErrorProps, onRenderTextLayerSuccess: onRenderTextLayerSuccessProps, pageIndex: pageIndexProps, pageNumber: pageNumberProps, pdf, registerPage, renderAnnotationLayer: renderAnnotationLayerProps = true, renderForms = false, renderMode = 'canvas', renderTextLayer: renderTextLayerProps = true, rotate: rotateProps, scale: scaleProps = defaultScale, unregisterPage, width } = mergedProps, otherProps = __rest(mergedProps, ["canvasBackground", "canvasRef", "children", "className", "customTextRenderer", "devicePixelRatio", "error", "height", "inputRef", "loading", "noData", "onGetAnnotationsError", "onGetAnnotationsSuccess", "onGetTextError", "onGetTextSuccess", "onLoadError", "onLoadSuccess", "onRenderAnnotationLayerError", "onRenderAnnotationLayerSuccess", "onRenderError", "onRenderSuccess", "onRenderTextLayerError", "onRenderTextLayerSuccess", "pageIndex", "pageNumber", "pdf", "registerPage", "renderAnnotationLayer", "renderForms", "renderMode", "renderTextLayer", "rotate", "scale", "unregisterPage", "width"]);
    const [pageState, pageDispatch] = (0, hooks_1.useResolver)();
    const { value: page, error: pageError } = pageState;
    const pageElement = (0, react_1.useRef)(null);
    (0, tiny_invariant_1.default)(pdf, 'Attempted to load a page, but no document was specified.');
    const pageIndex = (0, utils_1.isProvided)(pageNumberProps) ? pageNumberProps - 1 : pageIndexProps !== null && pageIndexProps !== void 0 ? pageIndexProps : null;
    const pageNumber = pageNumberProps !== null && pageNumberProps !== void 0 ? pageNumberProps : ((0, utils_1.isProvided)(pageIndexProps) ? pageIndexProps + 1 : null);
    const rotate = rotateProps !== null && rotateProps !== void 0 ? rotateProps : (page ? page.rotate : null);
    const scale = (0, react_1.useMemo)(() => {
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
    (0, react_1.useEffect)(hook, [pdf, pageIndex, unregisterPage]);
    /**
     * Called when a page is loaded successfully
     */
    function onLoadSuccess() {
        if (onLoadSuccessProps) {
            if (!page || !scale) {
                // Impossible, but TypeScript doesn't know that
                return;
            }
            onLoadSuccessProps((0, utils_1.makePageCallback)(page, scale));
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
        (0, tiny_warning_1.default)(false, pageError.toString());
        if (onLoadErrorProps) {
            onLoadErrorProps(pageError);
        }
    }
    function resetPage() {
        pageDispatch({ type: 'RESET' });
    }
    (0, react_1.useEffect)(resetPage, [pageDispatch, pdf, pageIndex]);
    function loadPage() {
        if (!pdf || !pageNumber) {
            return;
        }
        const cancellable = (0, make_cancellable_promise_1.default)(pdf.getPage(pageNumber));
        const runningTask = cancellable;
        cancellable.promise
            .then((nextPage) => {
            pageDispatch({ type: 'RESOLVE', value: nextPage });
        })
            .catch((error) => {
            pageDispatch({ type: 'REJECT', error });
        });
        return () => (0, utils_1.cancelRunningTask)(runningTask);
    }
    (0, react_1.useEffect)(loadPage, [pageDispatch, pdf, pageIndex, pageNumber, registerPage]);
    (0, react_1.useEffect)(() => {
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
        (0, utils_1.isProvided)(pageIndex) &&
        (0, utils_1.isProvided)(pageNumber) &&
        (0, utils_1.isProvided)(rotate) &&
        (0, utils_1.isProvided)(scale)
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
    const eventProps = (0, react_1.useMemo)(() => (0, make_event_props_1.default)(otherProps, () => page ? (scale ? (0, utils_1.makePageCallback)(page, scale) : undefined) : page), [otherProps, page, scale]);
    const pageKey = `${pageIndex}@${scale}/${rotate}`;
    const pageKeyNoScale = `${pageIndex}/${rotate}`;
    function renderMainLayer() {
        switch (renderMode) {
            case 'none':
                return null;
            case 'svg':
                return react_1.default.createElement(PageSVG_1.default, { key: `${pageKeyNoScale}_svg` });
            case 'canvas':
            default:
                return react_1.default.createElement(PageCanvas_1.default, { key: `${pageKey}_canvas`, canvasRef: canvasRef });
        }
    }
    function renderTextLayer() {
        if (!renderTextLayerProps) {
            return null;
        }
        return react_1.default.createElement(TextLayer_1.default, { key: `${pageKey}_text` });
    }
    function renderAnnotationLayer() {
        if (!renderAnnotationLayerProps) {
            return null;
        }
        /**
         * As of now, PDF.js 2.0.943 returns warnings on unimplemented annotations in SVG mode.
         * Therefore, as a fallback, we render "traditional" AnnotationLayer component.
         */
        return react_1.default.createElement(AnnotationLayer_1.default, { key: `${pageKey}_annotations` });
    }
    function renderChildren() {
        return (react_1.default.createElement(PageContext_1.default.Provider, { value: childContext },
            renderMainLayer(),
            renderTextLayer(),
            renderAnnotationLayer(),
            children));
    }
    function renderContent() {
        if (!pageNumber) {
            return react_1.default.createElement(Message_1.default, { type: "no-data" }, typeof noData === 'function' ? noData() : noData);
        }
        if (pdf === null || page === undefined || page === null) {
            return (react_1.default.createElement(Message_1.default, { type: "loading" }, typeof loading === 'function' ? loading() : loading));
        }
        if (pdf === false || page === false) {
            return react_1.default.createElement(Message_1.default, { type: "error" }, typeof error === 'function' ? error() : error);
        }
        return renderChildren();
    }
    return (react_1.default.createElement("div", Object.assign({ className: (0, clsx_1.default)('react-pdf__Page', className), "data-page-number": pageNumber, ref: (0, merge_refs_1.default)(inputRef, pageElement), style: {
            ['--scale-factor']: `${scale}`,
            backgroundColor: canvasBackground || 'white',
            position: 'relative',
            minWidth: 'min-content',
            minHeight: 'min-content',
        } }, eventProps), renderContent()));
}
exports.default = Page;
const isFunctionOrNode = prop_types_1.default.oneOfType([prop_types_1.default.func, prop_types_1.default.node]);
Page.propTypes = Object.assign(Object.assign({}, propTypes_1.eventProps), { canvasBackground: prop_types_1.default.string, canvasRef: propTypes_1.isRef, children: prop_types_1.default.node, className: propTypes_1.isClassName, customTextRenderer: prop_types_1.default.func, devicePixelRatio: prop_types_1.default.number, error: isFunctionOrNode, height: prop_types_1.default.number, imageResourcesPath: prop_types_1.default.string, inputRef: propTypes_1.isRef, loading: isFunctionOrNode, noData: isFunctionOrNode, onGetTextError: prop_types_1.default.func, onGetTextSuccess: prop_types_1.default.func, onLoadError: prop_types_1.default.func, onLoadSuccess: prop_types_1.default.func, onRenderError: prop_types_1.default.func, onRenderSuccess: prop_types_1.default.func, onRenderTextLayerError: prop_types_1.default.func, onRenderTextLayerSuccess: prop_types_1.default.func, pageIndex: propTypes_1.isPageIndex, pageNumber: propTypes_1.isPageNumber, pdf: propTypes_1.isPdf, renderAnnotationLayer: prop_types_1.default.bool, renderForms: prop_types_1.default.bool, renderMode: propTypes_1.isRenderMode, renderTextLayer: prop_types_1.default.bool, rotate: propTypes_1.isRotate, scale: prop_types_1.default.number, width: prop_types_1.default.number });