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
function PageSVG() {
    const context = (0, react_1.useContext)(PageContext_1.default);
    (0, tiny_invariant_1.default)(context, 'Unable to find Page context.');
    const { onRenderSuccess: onRenderSuccessProps, onRenderError: onRenderErrorProps, page, rotate, scale, } = context;
    const [svgState, svgDispatch] = (0, hooks_1.useResolver)();
    const { value: svg, error: svgError } = svgState;
    (0, tiny_invariant_1.default)(page, 'Attempted to render page SVG, but no page was specified.');
    /**
     * Called when a page is rendered successfully
     */
    function onRenderSuccess() {
        if (!page) {
            // Impossible, but TypeScript doesn't know that
            return;
        }
        if (onRenderSuccessProps) {
            onRenderSuccessProps((0, utils_1.makePageCallback)(page, scale));
        }
    }
    /**
     * Called when a page fails to render
     */
    function onRenderError() {
        if (!svgError) {
            // Impossible, but TypeScript doesn't know that
            return;
        }
        if ((0, utils_1.isCancelException)(svgError)) {
            return;
        }
        (0, tiny_warning_1.default)(false, svgError.toString());
        if (onRenderErrorProps) {
            onRenderErrorProps(svgError);
        }
    }
    const viewport = (0, react_1.useMemo)(() => page.getViewport({ scale, rotation: rotate }), [page, rotate, scale]);
    function resetSVG() {
        svgDispatch({ type: 'RESET' });
    }
    (0, react_1.useEffect)(resetSVG, [page, svgDispatch, viewport]);
    function renderSVG() {
        if (!page) {
            return;
        }
        const cancellable = (0, make_cancellable_promise_1.default)(page.getOperatorList());
        cancellable.promise
            .then((operatorList) => {
            const svgGfx = new pdfjs.SVGGraphics(page.commonObjs, page.objs);
            svgGfx
                .getSVG(operatorList, viewport)
                .then((nextSvg) => {
                svgDispatch({ type: 'RESOLVE', value: nextSvg });
            })
                .catch((error) => {
                svgDispatch({ type: 'REJECT', error });
            });
        })
            .catch((error) => {
            svgDispatch({ type: 'REJECT', error });
        });
        return () => (0, utils_1.cancelRunningTask)(cancellable);
    }
    (0, react_1.useEffect)(renderSVG, [page, svgDispatch, viewport]);
    (0, react_1.useEffect)(() => {
        if (svg === undefined) {
            return;
        }
        if (svg === false) {
            onRenderError();
            return;
        }
        onRenderSuccess();
    }, 
    // Ommitted callbacks so they are not called every time they change
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [svg]);
    function drawPageOnContainer(element) {
        if (!element || !svg) {
            return;
        }
        // Append SVG element to the main container, if this hasn't been done already
        if (!element.firstElementChild) {
            element.appendChild(svg);
        }
        const { width, height } = viewport;
        svg.setAttribute('width', `${width}`);
        svg.setAttribute('height', `${height}`);
    }
    const { width, height } = viewport;
    return (react_1.default.createElement("div", { className: "react-pdf__Page__svg", 
        // Note: This cannot be shortened, as we need this function to be called with each render.
        ref: (ref) => drawPageOnContainer(ref), style: {
            display: 'block',
            backgroundColor: 'white',
            overflow: 'hidden',
            width,
            height,
            userSelect: 'none',
        } }));
}
exports.default = PageSVG;