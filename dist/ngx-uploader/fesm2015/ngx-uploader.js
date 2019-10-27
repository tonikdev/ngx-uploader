import { Observable, Subject } from 'rxjs';
import { mergeMap, finalize } from 'rxjs/operators';
import { EventEmitter, Directive, ElementRef, Input, Output, HostListener, NgModule } from '@angular/core';

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
/** @enum {number} */
const UploadStatus = {
    Queue: 0,
    Uploading: 1,
    Done: 2,
    Cancelled: 3,
};
UploadStatus[UploadStatus.Queue] = 'Queue';
UploadStatus[UploadStatus.Uploading] = 'Uploading';
UploadStatus[UploadStatus.Done] = 'Done';
UploadStatus[UploadStatus.Cancelled] = 'Cancelled';

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
/**
 * @param {?} bytes
 * @return {?}
 */
function humanizeBytes(bytes) {
    if (bytes === 0) {
        return '0 Byte';
    }
    /** @type {?} */
    const k = 1024;
    /** @type {?} */
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
    /** @type {?} */
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
class NgUploaderService {
    /**
     * @param {?=} concurrency
     * @param {?=} contentTypes
     * @param {?=} maxUploads
     * @param {?=} maxFileSize
     */
    constructor(concurrency = Number.POSITIVE_INFINITY, contentTypes = ['*'], maxUploads = Number.POSITIVE_INFINITY, maxFileSize = Number.POSITIVE_INFINITY) {
        this.queue = [];
        this.serviceEvents = new EventEmitter();
        this.uploadScheduler = new Subject();
        this.subs = [];
        this.contentTypes = contentTypes;
        this.maxUploads = maxUploads;
        this.maxFileSize = maxFileSize;
        this.uploadScheduler
            .pipe(mergeMap((/**
         * @param {?} upload
         * @return {?}
         */
        upload => this.startUpload(upload)), concurrency))
            .subscribe((/**
         * @param {?} uploadOutput
         * @return {?}
         */
        uploadOutput => this.serviceEvents.emit(uploadOutput)));
    }
    /**
     * @param {?} incomingFiles
     * @return {?}
     */
    handleFiles(incomingFiles) {
        /** @type {?} */
        const allowedIncomingFiles = [].reduce.call(incomingFiles, (/**
         * @param {?} acc
         * @param {?} checkFile
         * @param {?} i
         * @return {?}
         */
        (acc, checkFile, i) => {
            /** @type {?} */
            const futureQueueLength = acc.length + this.queue.length + 1;
            if (this.isContentTypeAllowed(checkFile.type) && futureQueueLength <= this.maxUploads && this.isFileSizeAllowed(checkFile.size)) {
                acc = acc.concat(checkFile);
            }
            else {
                /** @type {?} */
                const rejectedFile = this.makeUploadFile(checkFile, i);
                this.serviceEvents.emit({ type: 'rejected', file: rejectedFile });
            }
            return acc;
        }), []);
        this.queue.push(...[].map.call(allowedIncomingFiles, (/**
         * @param {?} file
         * @param {?} i
         * @return {?}
         */
        (file, i) => {
            /** @type {?} */
            const uploadFile = this.makeUploadFile(file, i);
            this.serviceEvents.emit({ type: 'addedToQueue', file: uploadFile });
            return uploadFile;
        })));
        this.serviceEvents.emit({ type: 'allAddedToQueue' });
    }
    /**
     * @param {?} input
     * @return {?}
     */
    initInputEvents(input) {
        return input.subscribe((/**
         * @param {?} event
         * @return {?}
         */
        (event) => {
            switch (event.type) {
                case 'uploadFile':
                    /** @type {?} */
                    const uploadFileIndex = this.queue.findIndex((/**
                     * @param {?} file
                     * @return {?}
                     */
                    file => file === event.file));
                    if (uploadFileIndex !== -1 && event.file) {
                        this.uploadScheduler.next({ file: this.queue[uploadFileIndex], event: event });
                    }
                    break;
                case 'uploadAll':
                    /** @type {?} */
                    const files = this.queue.filter((/**
                     * @param {?} file
                     * @return {?}
                     */
                    file => file.progress.status === UploadStatus.Queue));
                    files.forEach((/**
                     * @param {?} file
                     * @return {?}
                     */
                    file => this.uploadScheduler.next({ file: file, event: event })));
                    break;
                case 'cancel':
                    /** @type {?} */
                    const id = event.id || null;
                    if (!id) {
                        return;
                    }
                    /** @type {?} */
                    const subs = this.subs.filter((/**
                     * @param {?} sub
                     * @return {?}
                     */
                    sub => sub.id === id));
                    subs.forEach((/**
                     * @param {?} sub
                     * @return {?}
                     */
                    sub => {
                        if (sub.sub) {
                            sub.sub.unsubscribe();
                            /** @type {?} */
                            const fileIndex = this.queue.findIndex((/**
                             * @param {?} file
                             * @return {?}
                             */
                            file => file.id === id));
                            if (fileIndex !== -1) {
                                this.queue[fileIndex].progress.status = UploadStatus.Cancelled;
                                this.serviceEvents.emit({ type: 'cancelled', file: this.queue[fileIndex] });
                            }
                        }
                    }));
                    break;
                case 'cancelAll':
                    this.subs.forEach((/**
                     * @param {?} sub
                     * @return {?}
                     */
                    sub => {
                        if (sub.sub) {
                            sub.sub.unsubscribe();
                        }
                        /** @type {?} */
                        const file = this.queue.find((/**
                         * @param {?} uploadFile
                         * @return {?}
                         */
                        uploadFile => uploadFile.id === sub.id));
                        if (file) {
                            file.progress.status = UploadStatus.Cancelled;
                            this.serviceEvents.emit({ type: 'cancelled', file: file });
                        }
                    }));
                    break;
                case 'remove':
                    if (!event.id) {
                        return;
                    }
                    /** @type {?} */
                    const i = this.queue.findIndex((/**
                     * @param {?} file
                     * @return {?}
                     */
                    file => file.id === event.id));
                    if (i !== -1) {
                        /** @type {?} */
                        const file = this.queue[i];
                        this.queue.splice(i, 1);
                        this.serviceEvents.emit({ type: 'removed', file: file });
                    }
                    break;
                case 'removeAll':
                    if (this.queue.length) {
                        this.queue = [];
                        this.serviceEvents.emit({ type: 'removedAll' });
                    }
                    break;
            }
        }));
    }
    /**
     * @param {?} upload
     * @return {?}
     */
    startUpload(upload) {
        return new Observable((/**
         * @param {?} observer
         * @return {?}
         */
        observer => {
            /** @type {?} */
            const sub = this.uploadFile(upload.file, upload.event)
                .pipe(finalize((/**
             * @return {?}
             */
            () => {
                if (!observer.closed) {
                    observer.complete();
                }
            })))
                .subscribe((/**
             * @param {?} output
             * @return {?}
             */
            output => {
                observer.next(output);
            }), (/**
             * @param {?} err
             * @return {?}
             */
            err => {
                observer.error(err);
                observer.complete();
            }), (/**
             * @return {?}
             */
            () => {
                observer.complete();
            }));
            this.subs.push({ id: upload.file.id, sub: sub });
        }));
    }
    /**
     * @param {?} file
     * @param {?} event
     * @return {?}
     */
    uploadFile(file, event) {
        return new Observable((/**
         * @param {?} observer
         * @return {?}
         */
        observer => {
            /** @type {?} */
            const url = event.url || '';
            /** @type {?} */
            const method = event.method || 'POST';
            /** @type {?} */
            const data = event.data || {};
            /** @type {?} */
            const headers = event.headers || {};
            /** @type {?} */
            const xhr = new XMLHttpRequest();
            /** @type {?} */
            const time = new Date().getTime();
            /** @type {?} */
            let progressStartTime = (file.progress.data && file.progress.data.startTime) || time;
            /** @type {?} */
            let speed = 0;
            /** @type {?} */
            let eta = null;
            xhr.upload.addEventListener('progress', (/**
             * @param {?} e
             * @return {?}
             */
            (e) => {
                if (e.lengthComputable) {
                    /** @type {?} */
                    const percentage = Math.round((e.loaded * 100) / e.total);
                    /** @type {?} */
                    const diff = new Date().getTime() - time;
                    speed = Math.round(e.loaded / diff * 1000);
                    progressStartTime = (file.progress.data && file.progress.data.startTime) || new Date().getTime();
                    eta = Math.ceil((e.total - e.loaded) / speed);
                    file.progress = {
                        status: UploadStatus.Uploading,
                        data: {
                            percentage: percentage,
                            speed: speed,
                            speedHuman: `${humanizeBytes(speed)}/s`,
                            startTime: progressStartTime,
                            endTime: null,
                            eta: eta,
                            etaHuman: this.secondsToHuman(eta)
                        }
                    };
                    observer.next({ type: 'uploading', file: file });
                }
            }), false);
            xhr.upload.addEventListener('error', (/**
             * @param {?} e
             * @return {?}
             */
            (e) => {
                observer.error(e);
                observer.complete();
            }));
            xhr.onreadystatechange = (/**
             * @return {?}
             */
            () => {
                if (xhr.readyState === XMLHttpRequest.DONE) {
                    /** @type {?} */
                    const speedAverage = Math.round(file.size / (new Date().getTime() - progressStartTime) * 1000);
                    file.progress = {
                        status: UploadStatus.Done,
                        data: {
                            percentage: 100,
                            speed: speedAverage,
                            speedHuman: `${humanizeBytes(speedAverage)}/s`,
                            startTime: progressStartTime,
                            endTime: new Date().getTime(),
                            eta: eta,
                            etaHuman: this.secondsToHuman(eta || 0)
                        }
                    };
                    file.responseStatus = xhr.status;
                    try {
                        file.response = JSON.parse(xhr.response);
                    }
                    catch (e) {
                        file.response = xhr.response;
                    }
                    file.responseHeaders = this.parseResponseHeaders(xhr.getAllResponseHeaders());
                    observer.next({ type: 'done', file: file });
                    observer.complete();
                }
            });
            xhr.open(method, url, true);
            xhr.withCredentials = event.withCredentials ? true : false;
            try {
                /** @type {?} */
                const uploadFile = (/** @type {?} */ (file.nativeFile));
                /** @type {?} */
                const uploadIndex = this.queue.findIndex((/**
                 * @param {?} outFile
                 * @return {?}
                 */
                outFile => outFile.nativeFile === uploadFile));
                if (this.queue[uploadIndex].progress.status === UploadStatus.Cancelled) {
                    observer.complete();
                }
                Object.keys(headers).forEach((/**
                 * @param {?} key
                 * @return {?}
                 */
                key => xhr.setRequestHeader(key, headers[key])));
                /** @type {?} */
                let bodyToSend;
                if (event.includeWebKitFormBoundary !== false) {
                    Object.keys(data).forEach((/**
                     * @param {?} key
                     * @return {?}
                     */
                    key => file.form.append(key, data[key])));
                    file.form.append(event.fieldName || 'file', uploadFile, uploadFile.name);
                    bodyToSend = file.form;
                }
                else {
                    bodyToSend = uploadFile;
                }
                this.serviceEvents.emit({ type: 'start', file: file });
                xhr.send(bodyToSend);
            }
            catch (e) {
                observer.complete();
            }
            return (/**
             * @return {?}
             */
            () => {
                xhr.abort();
            });
        }));
    }
    /**
     * @param {?} sec
     * @return {?}
     */
    secondsToHuman(sec) {
        return new Date(sec * 1000).toISOString().substr(11, 8);
    }
    /**
     * @return {?}
     */
    generateId() {
        return Math.random().toString(36).substring(7);
    }
    /**
     * @param {?} contentTypes
     * @return {?}
     */
    setContentTypes(contentTypes) {
        if (typeof contentTypes !== 'undefined' && contentTypes instanceof Array) {
            if (contentTypes.find((/**
             * @param {?} type
             * @return {?}
             */
            (type) => type === '*')) !== undefined) {
                this.contentTypes = ['*'];
            }
            else {
                this.contentTypes = contentTypes;
            }
            return;
        }
        this.contentTypes = ['*'];
    }
    /**
     * @return {?}
     */
    allContentTypesAllowed() {
        return this.contentTypes.find((/**
         * @param {?} type
         * @return {?}
         */
        (type) => type === '*')) !== undefined;
    }
    /**
     * @param {?} mimetype
     * @return {?}
     */
    isContentTypeAllowed(mimetype) {
        if (this.allContentTypesAllowed()) {
            return true;
        }
        return this.contentTypes.find((/**
         * @param {?} type
         * @return {?}
         */
        (type) => type === mimetype)) !== undefined;
    }
    /**
     * @param {?} fileSize
     * @return {?}
     */
    isFileSizeAllowed(fileSize) {
        if (!this.maxFileSize) {
            return true;
        }
        return fileSize <= this.maxFileSize;
    }
    /**
     * @param {?} file
     * @param {?} index
     * @return {?}
     */
    makeUploadFile(file, index) {
        return {
            fileIndex: index,
            id: this.generateId(),
            name: file.name,
            size: file.size,
            type: file.type,
            form: new FormData(),
            progress: {
                status: UploadStatus.Queue,
                data: {
                    percentage: 0,
                    speed: 0,
                    speedHuman: `${humanizeBytes(0)}/s`,
                    startTime: null,
                    endTime: null,
                    eta: null,
                    etaHuman: null
                }
            },
            lastModifiedDate: new Date(file.lastModified),
            sub: undefined,
            nativeFile: file
        };
    }
    /**
     * @private
     * @param {?} httpHeaders
     * @return {?}
     */
    parseResponseHeaders(httpHeaders) {
        if (!httpHeaders) {
            return;
        }
        return httpHeaders.split('\n')
            .map((/**
         * @param {?} x
         * @return {?}
         */
        (x) => x.split(/: */, 2)))
            .filter((/**
         * @param {?} x
         * @return {?}
         */
        (x) => x[0]))
            .reduce((/**
         * @param {?} acc
         * @param {?} x
         * @return {?}
         */
        (acc, x) => {
            acc[x[0]] = x[1];
            return acc;
        }), {});
    }
}

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
class NgFileDropDirective {
    /**
     * @param {?} elementRef
     */
    constructor(elementRef) {
        this.elementRef = elementRef;
        this.stopEvent = (/**
         * @param {?} e
         * @return {?}
         */
        (e) => {
            e.stopPropagation();
            e.preventDefault();
        });
        this.uploadOutput = new EventEmitter();
    }
    /**
     * @return {?}
     */
    ngOnInit() {
        this._sub = [];
        /** @type {?} */
        const concurrency = this.options && this.options.concurrency || Number.POSITIVE_INFINITY;
        /** @type {?} */
        const allowedContentTypes = this.options && this.options.allowedContentTypes || ['*'];
        /** @type {?} */
        const maxUploads = this.options && this.options.maxUploads || Number.POSITIVE_INFINITY;
        /** @type {?} */
        const maxFileSize = this.options && this.options.maxFileSize || Number.POSITIVE_INFINITY;
        this.upload = new NgUploaderService(concurrency, allowedContentTypes, maxUploads, maxFileSize);
        this.el = this.elementRef.nativeElement;
        this._sub.push(this.upload.serviceEvents.subscribe((/**
         * @param {?} event
         * @return {?}
         */
        (event) => {
            this.uploadOutput.emit(event);
        })));
        if (this.uploadInput instanceof EventEmitter) {
            this._sub.push(this.upload.initInputEvents(this.uploadInput));
        }
        this.el.addEventListener('drop', this.stopEvent, false);
        this.el.addEventListener('dragenter', this.stopEvent, false);
        this.el.addEventListener('dragover', this.stopEvent, false);
    }
    /**
     * @return {?}
     */
    ngOnDestroy() {
        this._sub.forEach((/**
         * @param {?} sub
         * @return {?}
         */
        sub => sub.unsubscribe()));
    }
    /**
     * @param {?} e
     * @return {?}
     */
    onDrop(e) {
        e.stopPropagation();
        e.preventDefault();
        /** @type {?} */
        const event = { type: 'drop' };
        this.uploadOutput.emit(event);
        this.upload.handleFiles(e.dataTransfer.files);
    }
    /**
     * @param {?} e
     * @return {?}
     */
    onDragOver(e) {
        if (!e) {
            return;
        }
        /** @type {?} */
        const event = { type: 'dragOver' };
        this.uploadOutput.emit(event);
    }
    /**
     * @param {?} e
     * @return {?}
     */
    onDragLeave(e) {
        if (!e) {
            return;
        }
        /** @type {?} */
        const event = { type: 'dragOut' };
        this.uploadOutput.emit(event);
    }
}
NgFileDropDirective.decorators = [
    { type: Directive, args: [{
                selector: '[ngFileDrop]'
            },] }
];
/** @nocollapse */
NgFileDropDirective.ctorParameters = () => [
    { type: ElementRef }
];
NgFileDropDirective.propDecorators = {
    options: [{ type: Input }],
    uploadInput: [{ type: Input }],
    uploadOutput: [{ type: Output }],
    onDrop: [{ type: HostListener, args: ['drop', ['$event'],] }],
    onDragOver: [{ type: HostListener, args: ['dragover', ['$event'],] }],
    onDragLeave: [{ type: HostListener, args: ['dragleave', ['$event'],] }]
};

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
class NgFileSelectDirective {
    /**
     * @param {?} elementRef
     */
    constructor(elementRef) {
        this.elementRef = elementRef;
        this.fileListener = (/**
         * @return {?}
         */
        () => {
            if (this.el.files) {
                this.upload.handleFiles(this.el.files);
            }
        });
        this.uploadOutput = new EventEmitter();
    }
    /**
     * @return {?}
     */
    ngOnInit() {
        this._sub = [];
        /** @type {?} */
        const concurrency = this.options && this.options.concurrency || Number.POSITIVE_INFINITY;
        /** @type {?} */
        const allowedContentTypes = this.options && this.options.allowedContentTypes || ['*'];
        /** @type {?} */
        const maxUploads = this.options && this.options.maxUploads || Number.POSITIVE_INFINITY;
        /** @type {?} */
        const maxFileSize = this.options && this.options.maxFileSize || Number.POSITIVE_INFINITY;
        this.upload = new NgUploaderService(concurrency, allowedContentTypes, maxUploads, maxFileSize);
        this.el = this.elementRef.nativeElement;
        this.el.addEventListener('change', this.fileListener, false);
        this._sub.push(this.upload.serviceEvents.subscribe((/**
         * @param {?} event
         * @return {?}
         */
        (event) => {
            this.uploadOutput.emit(event);
        })));
        if (this.uploadInput instanceof EventEmitter) {
            this._sub.push(this.upload.initInputEvents(this.uploadInput));
        }
    }
    /**
     * @return {?}
     */
    ngOnDestroy() {
        if (this.el) {
            this.el.removeEventListener('change', this.fileListener, false);
            this._sub.forEach((/**
             * @param {?} sub
             * @return {?}
             */
            sub => sub.unsubscribe()));
        }
    }
}
NgFileSelectDirective.decorators = [
    { type: Directive, args: [{
                selector: '[ngFileSelect]'
            },] }
];
/** @nocollapse */
NgFileSelectDirective.ctorParameters = () => [
    { type: ElementRef }
];
NgFileSelectDirective.propDecorators = {
    options: [{ type: Input }],
    uploadInput: [{ type: Input }],
    uploadOutput: [{ type: Output }]
};

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
class NgxUploaderModule {
}
NgxUploaderModule.decorators = [
    { type: NgModule, args: [{
                declarations: [NgFileDropDirective, NgFileSelectDirective],
                exports: [NgFileDropDirective, NgFileSelectDirective]
            },] }
];

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */

export { UploadStatus, NgFileDropDirective, NgFileSelectDirective, humanizeBytes, NgUploaderService, NgxUploaderModule };

//# sourceMappingURL=ngx-uploader.js.map