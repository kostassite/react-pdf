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
import React, { useContext, useRef } from 'react';
import PropTypes from 'prop-types';
import invariant from 'tiny-invariant';
import DocumentContext from './DocumentContext';
import OutlineContext from './OutlineContext';
import Ref from './Ref';
import { isDefined } from './shared/utils';
function useCachedValue(getter) {
    const ref = useRef();
    const currentValue = ref.current;
    if (isDefined(currentValue)) {
        return () => currentValue;
    }
    return () => {
        const value = getter();
        ref.current = value;
        return value;
    };
}
export default function OutlineItem(props) {
    const documentContext = useContext(DocumentContext);
    invariant(documentContext, 'Unable to find Document context. Did you wrap <Outline /> in <Document />?');
    const outlineContext = useContext(OutlineContext);
    invariant(outlineContext, 'Unable to find Outline context.');
    const mergedProps = Object.assign(Object.assign(Object.assign({}, documentContext), outlineContext), props);
    const { item, onClick: onClickProps, pdf } = mergedProps, otherProps = __rest(mergedProps, ["item", "onClick", "pdf"]);
    invariant(pdf, 'Attempted to load an outline, but no document was specified.');
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
        return pdf.getPageIndex(new Ref(ref));
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
        return (React.createElement("ul", null, subitems.map((subitem, subitemIndex) => (React.createElement(OutlineItem, Object.assign({ key: typeof subitem.dest === 'string' ? subitem.dest : subitemIndex, item: subitem }, otherProps))))));
    }
    return (React.createElement("li", null,
        React.createElement("a", { href: "#", onClick: onClick }, item.title),
        renderSubitems()));
}
const isDestination = PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.any)]);
OutlineItem.propTypes = {
    item: PropTypes.shape({
        dest: isDestination,
        items: PropTypes.arrayOf(PropTypes.shape({
            dest: isDestination,
            title: PropTypes.string,
        })),
        title: PropTypes.string,
    }).isRequired,
};