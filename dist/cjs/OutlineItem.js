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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
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
const tiny_invariant_1 = __importDefault(require("tiny-invariant"));
const DocumentContext_1 = __importDefault(require("./DocumentContext"));
const OutlineContext_1 = __importDefault(require("./OutlineContext"));
const Ref_1 = __importDefault(require("./Ref"));
const utils_1 = require("./shared/utils");
function useCachedValue(getter) {
    const ref = (0, react_1.useRef)();
    const currentValue = ref.current;
    if ((0, utils_1.isDefined)(currentValue)) {
        return () => currentValue;
    }
    return () => {
        const value = getter();
        ref.current = value;
        return value;
    };
}
function OutlineItem(props) {
    const documentContext = (0, react_1.useContext)(DocumentContext_1.default);
    (0, tiny_invariant_1.default)(documentContext, 'Unable to find Document context. Did you wrap <Outline /> in <Document />?');
    const outlineContext = (0, react_1.useContext)(OutlineContext_1.default);
    (0, tiny_invariant_1.default)(outlineContext, 'Unable to find Outline context.');
    const mergedProps = Object.assign(Object.assign(Object.assign({}, documentContext), outlineContext), props);
    const { item, onClick: onClickProps, pdf } = mergedProps, otherProps = __rest(mergedProps, ["item", "onClick", "pdf"]);
    (0, tiny_invariant_1.default)(pdf, 'Attempted to load an outline, but no document was specified.');
    const getDestination = useCachedValue(() => {
        if (typeof item.dest === 'string') {
            return pdf.getDestination(item.dest);
        }
        return item.dest;
    });
    const getPageIndex = useCachedValue(() => __awaiter(this, void 0, void 0, function* () {
        const destination = yield getDestination();
        if (!destination) {
            throw new Error('Destination not found.');
        }
        const [ref] = destination;
        return pdf.getPageIndex(new Ref_1.default(ref));
    }));
    const getPageNumber = useCachedValue(() => __awaiter(this, void 0, void 0, function* () {
        const pageIndex = yield getPageIndex();
        return pageIndex + 1;
    }));
    function onClick(event) {
        event.preventDefault();
        if (!onClickProps) {
            return false;
        }
        return Promise.all([getDestination(), getPageIndex(), getPageNumber()]).then(([dest, pageIndex, pageNumber]) => {
            onClickProps({
                dest,
                pageIndex,
                pageNumber,
            });
        });
    }
    function renderSubitems() {
        if (!item.items || !item.items.length) {
            return null;
        }
        const { items: subitems } = item;
        return (react_1.default.createElement("ul", null, subitems.map((subitem, subitemIndex) => (react_1.default.createElement(OutlineItem, Object.assign({ key: typeof subitem.dest === 'string' ? subitem.dest : subitemIndex, item: subitem }, otherProps))))));
    }
    return (react_1.default.createElement("li", null,
        react_1.default.createElement("a", { href: "#", onClick: onClick }, item.title),
        renderSubitems()));
}
exports.default = OutlineItem;
const isDestination = prop_types_1.default.oneOfType([prop_types_1.default.string, prop_types_1.default.arrayOf(prop_types_1.default.any)]);
OutlineItem.propTypes = {
    item: prop_types_1.default.shape({
        dest: isDestination,
        items: prop_types_1.default.arrayOf(prop_types_1.default.shape({
            dest: isDestination,
            title: prop_types_1.default.string,
        })),
        title: prop_types_1.default.string,
    }).isRequired,
};
