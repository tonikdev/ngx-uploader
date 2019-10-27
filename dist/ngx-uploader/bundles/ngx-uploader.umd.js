(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('rxjs'), require('rxjs/operators'), require('@angular/core')) :
    typeof define === 'function' && define.amd ? define('ngx-uploader', ['exports', 'rxjs', 'rxjs/operators', '@angular/core'], factory) :
    (factory((global['ngx-uploader'] = {}),global.rxjs,global.rxjs.operators,global.ng.core));
}(this, (function (exports,rxjs,operators,core) { 'use strict';

    /**
     * @fileoverview added by tsickle
     * @suppress {checkTypes,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
     */
    /** @enum {number} */
    var UploadStatus = {
        Queue: 0,
        Uploading: 1,
        Done: 2,
        Cancelled: 3,
    };
    UploadStatus[UploadStatus.Queue] = 'Queue';
    UploadStatus[UploadStatus.Uploading] = 'Uploading';
    UploadStatus[UploadStatus.Done] = 'Done';
    UploadStatus[UploadStatus.Cancelled] = 'Cancelled';

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation. All rights reserved.
    Licensed under the Apache License, Version 2.0 (the "License"); you may not use
    this file except in compliance with the License. You may obtain a copy of the
    License at http://www.apache.org/licenses/LICENSE-2.0

    THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
    KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
    WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
    MERCHANTABLITY OR NON-INFRINGEMENT.

    See the Apache Version 2.0 License for specific language governing permissions
    and limitations under the License.
    ***************************************************************************** */
    function __read(o, n) {
        var m = typeof Symbol === "function" && o[Symbol.iterator];
        if (!m)
            return o;
        var i = m.call(o), r, ar = [], e;
        try {
            while ((n === void 0 || n-- > 0) && !(r = i.next()).done)
                ar.push(r.value);
        }
        catch (error) {
            e = { error: error };
        }
        finally {
            try {
                if (r && !r.done && (m = i["return"]))
                    m.call(i);
            }
            finally {
                if (e)
                    throw e.error;
            }
        }
        return ar;
    }
    function __spread() {
        for (var ar = [], i = 0; i < arguments.length; i++)
            ar = ar.concat(__read(arguments[i]));
        return ar;
    }

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
        var k = 1024;
        /** @type {?} */
        var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
        /** @type {?} */
        var i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    var NgUploaderService = /** @class */ (function () {
        function NgUploaderService(concurrency, contentTypes, maxUploads, maxFileSize) {
            if (concurrency === void 0) {
                concurrency = Number.POSITIVE_INFINITY;
            }
            if (contentTypes === void 0) {
                contentTypes = ['*'];
            }
            if (maxUploads === void 0) {
                maxUploads = Number.POSITIVE_INFINITY;
            }
            if (maxFileSize === void 0) {
                maxFileSize = Number.POSITIVE_INFINITY;
            }
            var _this = this;
            this.queue = [];
            this.serviceEvents = new core.EventEmitter();
            this.uploadScheduler = new rxjs.Subject();
            this.subs = [];
            this.contentTypes = contentTypes;
            this.maxUploads = maxUploads;
            this.maxFileSize = maxFileSize;
            this.uploadScheduler
                .pipe(operators.mergeMap(( /**
         * @param {?} upload
         * @return {?}
         */function (upload) { return _this.startUpload(upload); }), concurrency))
                .subscribe(( /**
         * @param {?} uploadOutput
         * @return {?}
         */function (uploadOutput) { return _this.serviceEvents.emit(uploadOutput); }));
        }
        /**
         * @param {?} incomingFiles
         * @return {?}
         */
        NgUploaderService.prototype.handleFiles = /**
         * @param {?} incomingFiles
         * @return {?}
         */
            function (incomingFiles) {
                var _this = this;
                var _a;
                /** @type {?} */
                var allowedIncomingFiles = [].reduce.call(incomingFiles, ( /**
                 * @param {?} acc
                 * @param {?} checkFile
                 * @param {?} i
                 * @return {?}
                 */function (acc, checkFile, i) {
                    /** @type {?} */
                    var futureQueueLength = acc.length + _this.queue.length + 1;
                    if (_this.isContentTypeAllowed(checkFile.type) && futureQueueLength <= _this.maxUploads && _this.isFileSizeAllowed(checkFile.size)) {
                        acc = acc.concat(checkFile);
                    }
                    else {
                        /** @type {?} */
                        var rejectedFile = _this.makeUploadFile(checkFile, i);
                        _this.serviceEvents.emit({ type: 'rejected', file: rejectedFile });
                    }
                    return acc;
                }), []);
                (_a = this.queue).push.apply(_a, __spread([].map.call(allowedIncomingFiles, ( /**
                 * @param {?} file
                 * @param {?} i
                 * @return {?}
                 */function (file, i) {
                    /** @type {?} */
                    var uploadFile = _this.makeUploadFile(file, i);
                    _this.serviceEvents.emit({ type: 'addedToQueue', file: uploadFile });
                    return uploadFile;
                }))));
                this.serviceEvents.emit({ type: 'allAddedToQueue' });
            };
        /**
         * @param {?} input
         * @return {?}
         */
        NgUploaderService.prototype.initInputEvents = /**
         * @param {?} input
         * @return {?}
         */
            function (input) {
                var _this = this;
                return input.subscribe(( /**
                 * @param {?} event
                 * @return {?}
                 */function (event) {
                    switch (event.type) {
                        case 'uploadFile':
                            /** @type {?} */
                            var uploadFileIndex = _this.queue.findIndex(( /**
                             * @param {?} file
                             * @return {?}
                             */function (file) { return file === event.file; }));
                            if (uploadFileIndex !== -1 && event.file) {
                                _this.uploadScheduler.next({ file: _this.queue[uploadFileIndex], event: event });
                            }
                            break;
                        case 'uploadAll':
                            /** @type {?} */
                            var files = _this.queue.filter(( /**
                             * @param {?} file
                             * @return {?}
                             */function (file) { return file.progress.status === UploadStatus.Queue; }));
                            files.forEach(( /**
                             * @param {?} file
                             * @return {?}
                             */function (file) { return _this.uploadScheduler.next({ file: file, event: event }); }));
                            break;
                        case 'cancel':
                            /** @type {?} */
                            var id_1 = event.id || null;
                            if (!id_1) {
                                return;
                            }
                            /** @type {?} */
                            var subs = _this.subs.filter(( /**
                             * @param {?} sub
                             * @return {?}
                             */function (sub) { return sub.id === id_1; }));
                            subs.forEach(( /**
                             * @param {?} sub
                             * @return {?}
                             */function (sub) {
                                if (sub.sub) {
                                    sub.sub.unsubscribe();
                                    /** @type {?} */
                                    var fileIndex = _this.queue.findIndex(( /**
                                     * @param {?} file
                                     * @return {?}
                                     */function (file) { return file.id === id_1; }));
                                    if (fileIndex !== -1) {
                                        _this.queue[fileIndex].progress.status = UploadStatus.Cancelled;
                                        _this.serviceEvents.emit({ type: 'cancelled', file: _this.queue[fileIndex] });
                                    }
                                }
                            }));
                            break;
                        case 'cancelAll':
                            _this.subs.forEach(( /**
                             * @param {?} sub
                             * @return {?}
                             */function (sub) {
                                if (sub.sub) {
                                    sub.sub.unsubscribe();
                                }
                                /** @type {?} */
                                var file = _this.queue.find(( /**
                                 * @param {?} uploadFile
                                 * @return {?}
                                 */function (uploadFile) { return uploadFile.id === sub.id; }));
                                if (file) {
                                    file.progress.status = UploadStatus.Cancelled;
                                    _this.serviceEvents.emit({ type: 'cancelled', file: file });
                                }
                            }));
                            break;
                        case 'remove':
                            if (!event.id) {
                                return;
                            }
                            /** @type {?} */
                            var i = _this.queue.findIndex(( /**
                             * @param {?} file
                             * @return {?}
                             */function (file) { return file.id === event.id; }));
                            if (i !== -1) {
                                /** @type {?} */
                                var file = _this.queue[i];
                                _this.queue.splice(i, 1);
                                _this.serviceEvents.emit({ type: 'removed', file: file });
                            }
                            break;
                        case 'removeAll':
                            if (_this.queue.length) {
                                _this.queue = [];
                                _this.serviceEvents.emit({ type: 'removedAll' });
                            }
                            break;
                    }
                }));
            };
        /**
         * @param {?} upload
         * @return {?}
         */
        NgUploaderService.prototype.startUpload = /**
         * @param {?} upload
         * @return {?}
         */
            function (upload) {
                var _this = this;
                return new rxjs.Observable(( /**
                 * @param {?} observer
                 * @return {?}
                 */function (observer) {
                    /** @type {?} */
                    var sub = _this.uploadFile(upload.file, upload.event)
                        .pipe(operators.finalize(( /**
                 * @return {?}
                 */function () {
                        if (!observer.closed) {
                            observer.complete();
                        }
                    })))
                        .subscribe(( /**
                 * @param {?} output
                 * @return {?}
                 */function (output) {
                        observer.next(output);
                    }), ( /**
                     * @param {?} err
                     * @return {?}
                     */function (err) {
                        observer.error(err);
                        observer.complete();
                    }), ( /**
                     * @return {?}
                     */function () {
                        observer.complete();
                    }));
                    _this.subs.push({ id: upload.file.id, sub: sub });
                }));
            };
        /**
         * @param {?} file
         * @param {?} event
         * @return {?}
         */
        NgUploaderService.prototype.uploadFile = /**
         * @param {?} file
         * @param {?} event
         * @return {?}
         */
            function (file, event) {
                var _this = this;
                return new rxjs.Observable(( /**
                 * @param {?} observer
                 * @return {?}
                 */function (observer) {
                    /** @type {?} */
                    var url = event.url || '';
                    /** @type {?} */
                    var method = event.method || 'POST';
                    /** @type {?} */
                    var data = event.data || {};
                    /** @type {?} */
                    var headers = event.headers || {};
                    /** @type {?} */
                    var xhr = new XMLHttpRequest();
                    /** @type {?} */
                    var time = new Date().getTime();
                    /** @type {?} */
                    var progressStartTime = (file.progress.data && file.progress.data.startTime) || time;
                    /** @type {?} */
                    var speed = 0;
                    /** @type {?} */
                    var eta = null;
                    xhr.upload.addEventListener('progress', ( /**
                     * @param {?} e
                     * @return {?}
                     */function (e) {
                        if (e.lengthComputable) {
                            /** @type {?} */
                            var percentage = Math.round((e.loaded * 100) / e.total);
                            /** @type {?} */
                            var diff = new Date().getTime() - time;
                            speed = Math.round(e.loaded / diff * 1000);
                            progressStartTime = (file.progress.data && file.progress.data.startTime) || new Date().getTime();
                            eta = Math.ceil((e.total - e.loaded) / speed);
                            file.progress = {
                                status: UploadStatus.Uploading,
                                data: {
                                    percentage: percentage,
                                    speed: speed,
                                    speedHuman: humanizeBytes(speed) + "/s",
                                    startTime: progressStartTime,
                                    endTime: null,
                                    eta: eta,
                                    etaHuman: _this.secondsToHuman(eta)
                                }
                            };
                            observer.next({ type: 'uploading', file: file });
                        }
                    }), false);
                    xhr.upload.addEventListener('error', ( /**
                     * @param {?} e
                     * @return {?}
                     */function (e) {
                        observer.error(e);
                        observer.complete();
                    }));
                    xhr.onreadystatechange = ( /**
                     * @return {?}
                     */function () {
                        if (xhr.readyState === XMLHttpRequest.DONE) {
                            /** @type {?} */
                            var speedAverage = Math.round(file.size / (new Date().getTime() - progressStartTime) * 1000);
                            file.progress = {
                                status: UploadStatus.Done,
                                data: {
                                    percentage: 100,
                                    speed: speedAverage,
                                    speedHuman: humanizeBytes(speedAverage) + "/s",
                                    startTime: progressStartTime,
                                    endTime: new Date().getTime(),
                                    eta: eta,
                                    etaHuman: _this.secondsToHuman(eta || 0)
                                }
                            };
                            file.responseStatus = xhr.status;
                            try {
                                file.response = JSON.parse(xhr.response);
                            }
                            catch (e) {
                                file.response = xhr.response;
                            }
                            file.responseHeaders = _this.parseResponseHeaders(xhr.getAllResponseHeaders());
                            observer.next({ type: 'done', file: file });
                            observer.complete();
                        }
                    });
                    xhr.open(method, url, true);
                    xhr.withCredentials = event.withCredentials ? true : false;
                    try {
                        /** @type {?} */
                        var uploadFile_1 = ( /** @type {?} */(file.nativeFile));
                        /** @type {?} */
                        var uploadIndex = _this.queue.findIndex(( /**
                         * @param {?} outFile
                         * @return {?}
                         */function (outFile) { return outFile.nativeFile === uploadFile_1; }));
                        if (_this.queue[uploadIndex].progress.status === UploadStatus.Cancelled) {
                            observer.complete();
                        }
                        Object.keys(headers).forEach(( /**
                         * @param {?} key
                         * @return {?}
                         */function (key) { return xhr.setRequestHeader(key, headers[key]); }));
                        /** @type {?} */
                        var bodyToSend = void 0;
                        if (event.includeWebKitFormBoundary !== false) {
                            Object.keys(data).forEach(( /**
                             * @param {?} key
                             * @return {?}
                             */function (key) { return file.form.append(key, data[key]); }));
                            file.form.append(event.fieldName || 'file', uploadFile_1, uploadFile_1.name);
                            bodyToSend = file.form;
                        }
                        else {
                            bodyToSend = uploadFile_1;
                        }
                        _this.serviceEvents.emit({ type: 'start', file: file });
                        xhr.send(bodyToSend);
                    }
                    catch (e) {
                        observer.complete();
                    }
                    return ( /**
                     * @return {?}
                     */function () {
                        xhr.abort();
                    });
                }));
            };
        /**
         * @param {?} sec
         * @return {?}
         */
        NgUploaderService.prototype.secondsToHuman = /**
         * @param {?} sec
         * @return {?}
         */
            function (sec) {
                return new Date(sec * 1000).toISOString().substr(11, 8);
            };
        /**
         * @return {?}
         */
        NgUploaderService.prototype.generateId = /**
         * @return {?}
         */
            function () {
                return Math.random().toString(36).substring(7);
            };
        /**
         * @param {?} contentTypes
         * @return {?}
         */
        NgUploaderService.prototype.setContentTypes = /**
         * @param {?} contentTypes
         * @return {?}
         */
            function (contentTypes) {
                if (typeof contentTypes !== 'undefined' && contentTypes instanceof Array) {
                    if (contentTypes.find(( /**
                     * @param {?} type
                     * @return {?}
                     */function (type) { return type === '*'; })) !== undefined) {
                        this.contentTypes = ['*'];
                    }
                    else {
                        this.contentTypes = contentTypes;
                    }
                    return;
                }
                this.contentTypes = ['*'];
            };
        /**
         * @return {?}
         */
        NgUploaderService.prototype.allContentTypesAllowed = /**
         * @return {?}
         */
            function () {
                return this.contentTypes.find(( /**
                 * @param {?} type
                 * @return {?}
                 */function (type) { return type === '*'; })) !== undefined;
            };
        /**
         * @param {?} mimetype
         * @return {?}
         */
        NgUploaderService.prototype.isContentTypeAllowed = /**
         * @param {?} mimetype
         * @return {?}
         */
            function (mimetype) {
                if (this.allContentTypesAllowed()) {
                    return true;
                }
                return this.contentTypes.find(( /**
                 * @param {?} type
                 * @return {?}
                 */function (type) { return type === mimetype; })) !== undefined;
            };
        /**
         * @param {?} fileSize
         * @return {?}
         */
        NgUploaderService.prototype.isFileSizeAllowed = /**
         * @param {?} fileSize
         * @return {?}
         */
            function (fileSize) {
                if (!this.maxFileSize) {
                    return true;
                }
                return fileSize <= this.maxFileSize;
            };
        /**
         * @param {?} file
         * @param {?} index
         * @return {?}
         */
        NgUploaderService.prototype.makeUploadFile = /**
         * @param {?} file
         * @param {?} index
         * @return {?}
         */
            function (file, index) {
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
                            speedHuman: humanizeBytes(0) + "/s",
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
            };
        /**
         * @private
         * @param {?} httpHeaders
         * @return {?}
         */
        NgUploaderService.prototype.parseResponseHeaders = /**
         * @private
         * @param {?} httpHeaders
         * @return {?}
         */
            function (httpHeaders) {
                if (!httpHeaders) {
                    return;
                }
                return httpHeaders.split('\n')
                    .map(( /**
             * @param {?} x
             * @return {?}
             */function (x) { return x.split(/: */, 2); }))
                    .filter(( /**
             * @param {?} x
             * @return {?}
             */function (x) { return x[0]; }))
                    .reduce(( /**
             * @param {?} acc
             * @param {?} x
             * @return {?}
             */function (acc, x) {
                    acc[x[0]] = x[1];
                    return acc;
                }), {});
            };
        return NgUploaderService;
    }());

    /**
     * @fileoverview added by tsickle
     * @suppress {checkTypes,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
     */
    var NgFileDropDirective = /** @class */ (function () {
        function NgFileDropDirective(elementRef) {
            this.elementRef = elementRef;
            this.stopEvent = ( /**
             * @param {?} e
             * @return {?}
             */function (e) {
                e.stopPropagation();
                e.preventDefault();
            });
            this.uploadOutput = new core.EventEmitter();
        }
        /**
         * @return {?}
         */
        NgFileDropDirective.prototype.ngOnInit = /**
         * @return {?}
         */
            function () {
                var _this = this;
                this._sub = [];
                /** @type {?} */
                var concurrency = this.options && this.options.concurrency || Number.POSITIVE_INFINITY;
                /** @type {?} */
                var allowedContentTypes = this.options && this.options.allowedContentTypes || ['*'];
                /** @type {?} */
                var maxUploads = this.options && this.options.maxUploads || Number.POSITIVE_INFINITY;
                /** @type {?} */
                var maxFileSize = this.options && this.options.maxFileSize || Number.POSITIVE_INFINITY;
                this.upload = new NgUploaderService(concurrency, allowedContentTypes, maxUploads, maxFileSize);
                this.el = this.elementRef.nativeElement;
                this._sub.push(this.upload.serviceEvents.subscribe(( /**
                 * @param {?} event
                 * @return {?}
                 */function (event) {
                    _this.uploadOutput.emit(event);
                })));
                if (this.uploadInput instanceof core.EventEmitter) {
                    this._sub.push(this.upload.initInputEvents(this.uploadInput));
                }
                this.el.addEventListener('drop', this.stopEvent, false);
                this.el.addEventListener('dragenter', this.stopEvent, false);
                this.el.addEventListener('dragover', this.stopEvent, false);
            };
        /**
         * @return {?}
         */
        NgFileDropDirective.prototype.ngOnDestroy = /**
         * @return {?}
         */
            function () {
                this._sub.forEach(( /**
                 * @param {?} sub
                 * @return {?}
                 */function (sub) { return sub.unsubscribe(); }));
            };
        /**
         * @param {?} e
         * @return {?}
         */
        NgFileDropDirective.prototype.onDrop = /**
         * @param {?} e
         * @return {?}
         */
            function (e) {
                e.stopPropagation();
                e.preventDefault();
                /** @type {?} */
                var event = { type: 'drop' };
                this.uploadOutput.emit(event);
                this.upload.handleFiles(e.dataTransfer.files);
            };
        /**
         * @param {?} e
         * @return {?}
         */
        NgFileDropDirective.prototype.onDragOver = /**
         * @param {?} e
         * @return {?}
         */
            function (e) {
                if (!e) {
                    return;
                }
                /** @type {?} */
                var event = { type: 'dragOver' };
                this.uploadOutput.emit(event);
            };
        /**
         * @param {?} e
         * @return {?}
         */
        NgFileDropDirective.prototype.onDragLeave = /**
         * @param {?} e
         * @return {?}
         */
            function (e) {
                if (!e) {
                    return;
                }
                /** @type {?} */
                var event = { type: 'dragOut' };
                this.uploadOutput.emit(event);
            };
        NgFileDropDirective.decorators = [
            { type: core.Directive, args: [{
                        selector: '[ngFileDrop]'
                    },] }
        ];
        /** @nocollapse */
        NgFileDropDirective.ctorParameters = function () {
            return [
                { type: core.ElementRef }
            ];
        };
        NgFileDropDirective.propDecorators = {
            options: [{ type: core.Input }],
            uploadInput: [{ type: core.Input }],
            uploadOutput: [{ type: core.Output }],
            onDrop: [{ type: core.HostListener, args: ['drop', ['$event'],] }],
            onDragOver: [{ type: core.HostListener, args: ['dragover', ['$event'],] }],
            onDragLeave: [{ type: core.HostListener, args: ['dragleave', ['$event'],] }]
        };
        return NgFileDropDirective;
    }());

    /**
     * @fileoverview added by tsickle
     * @suppress {checkTypes,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
     */
    var NgFileSelectDirective = /** @class */ (function () {
        function NgFileSelectDirective(elementRef) {
            var _this = this;
            this.elementRef = elementRef;
            this.fileListener = ( /**
             * @return {?}
             */function () {
                if (_this.el.files) {
                    _this.upload.handleFiles(_this.el.files);
                }
            });
            this.uploadOutput = new core.EventEmitter();
        }
        /**
         * @return {?}
         */
        NgFileSelectDirective.prototype.ngOnInit = /**
         * @return {?}
         */
            function () {
                var _this = this;
                this._sub = [];
                /** @type {?} */
                var concurrency = this.options && this.options.concurrency || Number.POSITIVE_INFINITY;
                /** @type {?} */
                var allowedContentTypes = this.options && this.options.allowedContentTypes || ['*'];
                /** @type {?} */
                var maxUploads = this.options && this.options.maxUploads || Number.POSITIVE_INFINITY;
                /** @type {?} */
                var maxFileSize = this.options && this.options.maxFileSize || Number.POSITIVE_INFINITY;
                this.upload = new NgUploaderService(concurrency, allowedContentTypes, maxUploads, maxFileSize);
                this.el = this.elementRef.nativeElement;
                this.el.addEventListener('change', this.fileListener, false);
                this._sub.push(this.upload.serviceEvents.subscribe(( /**
                 * @param {?} event
                 * @return {?}
                 */function (event) {
                    _this.uploadOutput.emit(event);
                })));
                if (this.uploadInput instanceof core.EventEmitter) {
                    this._sub.push(this.upload.initInputEvents(this.uploadInput));
                }
            };
        /**
         * @return {?}
         */
        NgFileSelectDirective.prototype.ngOnDestroy = /**
         * @return {?}
         */
            function () {
                if (this.el) {
                    this.el.removeEventListener('change', this.fileListener, false);
                    this._sub.forEach(( /**
                     * @param {?} sub
                     * @return {?}
                     */function (sub) { return sub.unsubscribe(); }));
                }
            };
        NgFileSelectDirective.decorators = [
            { type: core.Directive, args: [{
                        selector: '[ngFileSelect]'
                    },] }
        ];
        /** @nocollapse */
        NgFileSelectDirective.ctorParameters = function () {
            return [
                { type: core.ElementRef }
            ];
        };
        NgFileSelectDirective.propDecorators = {
            options: [{ type: core.Input }],
            uploadInput: [{ type: core.Input }],
            uploadOutput: [{ type: core.Output }]
        };
        return NgFileSelectDirective;
    }());

    /**
     * @fileoverview added by tsickle
     * @suppress {checkTypes,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
     */
    var NgxUploaderModule = /** @class */ (function () {
        function NgxUploaderModule() {
        }
        NgxUploaderModule.decorators = [
            { type: core.NgModule, args: [{
                        declarations: [NgFileDropDirective, NgFileSelectDirective],
                        exports: [NgFileDropDirective, NgFileSelectDirective]
                    },] }
        ];
        return NgxUploaderModule;
    }());

    /**
     * @fileoverview added by tsickle
     * @suppress {checkTypes,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
     */

    /**
     * @fileoverview added by tsickle
     * @suppress {checkTypes,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
     */

    exports.UploadStatus = UploadStatus;
    exports.NgFileDropDirective = NgFileDropDirective;
    exports.NgFileSelectDirective = NgFileSelectDirective;
    exports.humanizeBytes = humanizeBytes;
    exports.NgUploaderService = NgUploaderService;
    exports.NgxUploaderModule = NgxUploaderModule;

    Object.defineProperty(exports, '__esModule', { value: true });

})));

//# sourceMappingURL=ngx-uploader.umd.js.map