import React from 'react';
type PageCanvasProps = {
    canvasRef?: React.Ref<HTMLCanvasElement>;
};
declare function PageCanvas(props: PageCanvasProps): React.JSX.Element;
declare namespace PageCanvas {
    var propTypes: {
        canvasRef: import("prop-types").Requireable<NonNullable<((...args: any[]) => any) | Required<import("prop-types").InferProps<{
            current: import("prop-types").Requireable<any>;
        }>> | null | undefined>>;
    };
}
export default PageCanvas;