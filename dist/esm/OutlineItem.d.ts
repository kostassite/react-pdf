import React from 'react';
import PropTypes from 'prop-types';
import type { PDFDocumentProxy } from 'pdfjs-dist';
type PDFOutline = Awaited<ReturnType<PDFDocumentProxy['getOutline']>>;
type PDFOutlineItem = PDFOutline[number];
type OutlineItemProps = {
    item: PDFOutlineItem;
};
declare function OutlineItem(props: OutlineItemProps): React.JSX.Element;
declare namespace OutlineItem {
    var propTypes: {
        item: PropTypes.Validator<NonNullable<PropTypes.InferProps<{
            dest: PropTypes.Requireable<NonNullable<string | any[] | null | undefined>>;
            items: PropTypes.Requireable<(PropTypes.InferProps<{
                dest: PropTypes.Requireable<NonNullable<string | any[] | null | undefined>>;
                title: PropTypes.Requireable<string>;
            }> | null | undefined)[]>;
            title: PropTypes.Requireable<string>;
        }>>>;
    };
}
export default OutlineItem;