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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importStar(require("react"));
const make_cancellable_promise_1 = __importDefault(require("make-cancellable-promise"));
const tiny_invariant_1 = __importDefault(require("tiny-invariant"));
const tiny_warning_1 = __importDefault(require("tiny-warning"));
const pdfjs = __importStar(require("pdfjs-dist"));
const PageContext_1 = __importDefault(require("../PageContext"));
const hooks_1 = require("../shared/hooks");
const utils_1 = require("../shared/utils");
function isTextItem(item) {
    return 'str' in item;
}
function TextLayer() {
    const context = (0, react_1.useContext)(PageContext_1.default);
    (0, tiny_invariant_1.default)(context, 'Unable to find Page context.');
    const { customTextRenderer, onGetTextError, onGetTextSuccess, onRenderTextLayerError, onRenderTextLayerSuccess, page, pageIndex, pageNumber, rotate, scale, } = context;
    const [textContentState, textContentDispatch] = (0, hooks_1.useResolver)();
    const { value: textContent, error: textContentError } = textContentState;
    const layerElement = (0, react_1.useRef)(null);
    const endElement = (0, react_1.useRef)();
    (0, tiny_invariant_1.default)(page, 'Attempted to load page text content, but no page was specified.');
    (0, tiny_warning_1.default)(parseInt(window.getComputedStyle(document.body).getPropertyValue('--react-pdf-text-layer'), 10) === 1, 'TextLayer styles not found. Read more: https://github.com/wojtekmaj/react-pdf#support-for-text-layer');
    /**
     * Called when a page text content is read successfully
     */
    function onLoadSuccess() {
        if (!textContent) {
            // Impossible, but TypeScript doesn't know that
            return;
        }
        if (onGetTextSuccess) {
            onGetTextSuccess(textContent);
        }
    }
    /**
     * Called when a page text content failed to read successfully
     */
    function onLoadError() {
        if (!textContentError) {
            // Impossible, but TypeScript doesn't know that
            return;
        }
        (0, tiny_warning_1.default)(false, textContentError.toString());
        if (onGetTextError) {
            onGetTextError(textContentError);
        }
    }
    function resetTextContent() {
        textContentDispatch({ type: 'RESET' });
    }
    (0, react_1.useEffect)(resetTextContent, [page, textContentDispatch]);
    function loadTextContent() {
        if (!page) {
            return;
        }
        const cancellable = (0, make_cancellable_promise_1.default)(page.getTextContent());
        const runningTask = cancellable;
        cancellable.promise
            .then((nextTextContent) => {
            textContentDispatch({ type: 'RESOLVE', value: nextTextContent });
        })
            .catch((error) => {
            textContentDispatch({ type: 'REJECT', error });
        });
        return () => (0, utils_1.cancelRunningTask)(runningTask);
    }
    (0, react_1.useEffect)(loadTextContent, [page, textContentDispatch]);
    (0, react_1.useEffect)(() => {
        if (textContent === undefined) {
            return;
        }
        if (textContent === false) {
            onLoadError();
            return;
        }
        onLoadSuccess();
    }, 
    // Ommitted callbacks so they are not called every time they change
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [textContent]);
    /**
     * Called when a text layer is rendered successfully
     */
    const onRenderSuccess = (0, react_1.useCallback)(() => {
        if (onRenderTextLayerSuccess) {
            onRenderTextLayerSuccess();
        }
    }, [onRenderTextLayerSuccess]);
    /**
     * Called when a text layer failed to render successfully
     */
    const onRenderError = (0, react_1.useCallback)((error) => {
        (0, tiny_warning_1.default)(false, error.toString());
        if (onRenderTextLayerError) {
            onRenderTextLayerError(error);
        }
    }, [onRenderTextLayerError]);
    function onMouseDown() {
        const end = endElement.current;
        if (!end) {
            return;
        }
        end.classList.add('active');
    }
    function onMouseUp() {
        const end = endElement.current;
        if (!end) {
            return;
        }
        end.classList.remove('active');
    }
    const viewport = (0, react_1.useMemo)(() => page.getViewport({ scale, rotation: rotate }), [page, rotate, scale]);
    function renderTextLayer() {
        if (!page || !textContent) {
            return;
        }
        const { current: layer } = layerElement;
        if (!layer) {
            return;
        }
        layer.innerHTML = '';
        const textContentSource = page.streamTextContent();
        const parameters = {
            container: layer,
            textContentSource,
            viewport,
        };
        const cancellable = pdfjs.renderTextLayer(parameters);
        const runningTask = cancellable;
        cancellable.promise
            .then(() => {
            const end = document.createElement('div');
            end.className = 'endOfContent';
            layer.append(end);
            endElement.current = end;
            if (customTextRenderer) {
                let index = 0;
                textContent.items.forEach((item, itemIndex) => {
                    if (!isTextItem(item)) {
                        return;
                    }
                    const child = layer.children[index];
                    if (!child) {
                        return;
                    }
                    const content = customTextRenderer(Object.assign({ pageIndex,
                        pageNumber,
                        itemIndex }, item));
                    child.innerHTML = content;
                    index += item.str && item.hasEOL ? 2 : 1;
                });
            }
            // Intentional immediate callback
            onRenderSuccess();
        })
            .catch(onRenderError);
        return () => (0, utils_1.cancelRunningTask)(runningTask);
    }
    (0, react_1.useLayoutEffect)(renderTextLayer, [
        customTextRenderer,
        onRenderError,
        onRenderSuccess,
        page,
        pageIndex,
        pageNumber,
        textContent,
        viewport,
    ]);
    return (
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions
    react_1.default.createElement("div", { className: "react-pdf__Page__textContent textLayer", onMouseUp: onMouseUp, onMouseDown: onMouseDown, ref: layerElement }));
}
exports.default = TextLayer;