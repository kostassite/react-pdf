/**
 * Loads a PDF document. Passes it to all children.
 */
import React from 'react';
import type { EventProps } from 'make-event-props';
import type { ClassName, DocumentCallback, ExternalLinkRel, ExternalLinkTarget, File, ImageResourcesPath, NodeOrRenderer, OnDocumentLoadError, OnDocumentLoadProgress, OnDocumentLoadSuccess, OnError, OnItemClickArgs, OnPasswordCallback, Options, PasswordResponse, RenderMode } from './shared/types';
type OnItemClick = (args: OnItemClickArgs) => void;
type OnPassword = (callback: OnPasswordCallback, reason: PasswordResponse) => void;
type OnSourceError = OnError;
type OnSourceSuccess = () => void;
export type DocumentProps = {
    children?: React.ReactNode;
    className?: ClassName;
    error?: NodeOrRenderer;
    externalLinkRel?: ExternalLinkRel;
    externalLinkTarget?: ExternalLinkTarget;
    file?: File;
    imageResourcesPath?: ImageResourcesPath;
    inputRef?: React.Ref<HTMLDivElement>;
    loading?: NodeOrRenderer;
    noData?: NodeOrRenderer;
    onItemClick?: OnItemClick;
    onLoadError?: OnDocumentLoadError;
    onLoadProgress?: OnDocumentLoadProgress;
    onLoadSuccess?: OnDocumentLoadSuccess;
    onPassword?: OnPassword;
    onSourceError?: OnSourceError;
    onSourceSuccess?: OnSourceSuccess;
    options?: Options;
    renderMode?: RenderMode;
    rotate?: number | null;
} & EventProps<DocumentCallback | false | undefined>;
declare const Document: React.ForwardRefExoticComponent<{
    children?: React.ReactNode;
    className?: ClassName;
    error?: NodeOrRenderer;
    externalLinkRel?: string | undefined;
    externalLinkTarget?: ExternalLinkTarget | undefined;
    file?: File | undefined;
    imageResourcesPath?: string | undefined;
    inputRef?: React.Ref<HTMLDivElement> | undefined;
    loading?: NodeOrRenderer;
    noData?: NodeOrRenderer;
    onItemClick?: OnItemClick | undefined;
    onLoadError?: OnError | undefined;
    onLoadProgress?: OnDocumentLoadProgress | undefined;
    onLoadSuccess?: OnDocumentLoadSuccess | undefined;
    onPassword?: OnPassword | undefined;
    onSourceError?: OnError | undefined;
    onSourceSuccess?: OnSourceSuccess | undefined;
    options?: Options | undefined;
    renderMode?: RenderMode | undefined;
    rotate?: number | null | undefined;
} & EventProps<false | import("pdfjs-dist/types/src/display/api").PDFDocumentProxy | undefined> & React.RefAttributes<unknown>>;
export default Document;