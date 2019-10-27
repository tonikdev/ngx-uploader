/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
import * as tslib_1 from "tslib";
import { EventEmitter } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { mergeMap, finalize } from 'rxjs/operators';
import { UploadStatus } from './interfaces';
/**
 * @param {?} bytes
 * @return {?}
 */
export function humanizeBytes(bytes) {
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
        if (concurrency === void 0) { concurrency = Number.POSITIVE_INFINITY; }
        if (contentTypes === void 0) { contentTypes = ['*']; }
        if (maxUploads === void 0) { maxUploads = Number.POSITIVE_INFINITY; }
        if (maxFileSize === void 0) { maxFileSize = Number.POSITIVE_INFINITY; }
        var _this = this;
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
        function (upload) { return _this.startUpload(upload); }), concurrency))
            .subscribe((/**
         * @param {?} uploadOutput
         * @return {?}
         */
        function (uploadOutput) { return _this.serviceEvents.emit(uploadOutput); }));
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
        var allowedIncomingFiles = [].reduce.call(incomingFiles, (/**
         * @param {?} acc
         * @param {?} checkFile
         * @param {?} i
         * @return {?}
         */
        function (acc, checkFile, i) {
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
        (_a = this.queue).push.apply(_a, tslib_1.__spread([].map.call(allowedIncomingFiles, (/**
         * @param {?} file
         * @param {?} i
         * @return {?}
         */
        function (file, i) {
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
        return input.subscribe((/**
         * @param {?} event
         * @return {?}
         */
        function (event) {
            switch (event.type) {
                case 'uploadFile':
                    /** @type {?} */
                    var uploadFileIndex = _this.queue.findIndex((/**
                     * @param {?} file
                     * @return {?}
                     */
                    function (file) { return file === event.file; }));
                    if (uploadFileIndex !== -1 && event.file) {
                        _this.uploadScheduler.next({ file: _this.queue[uploadFileIndex], event: event });
                    }
                    break;
                case 'uploadAll':
                    /** @type {?} */
                    var files = _this.queue.filter((/**
                     * @param {?} file
                     * @return {?}
                     */
                    function (file) { return file.progress.status === UploadStatus.Queue; }));
                    files.forEach((/**
                     * @param {?} file
                     * @return {?}
                     */
                    function (file) { return _this.uploadScheduler.next({ file: file, event: event }); }));
                    break;
                case 'cancel':
                    /** @type {?} */
                    var id_1 = event.id || null;
                    if (!id_1) {
                        return;
                    }
                    /** @type {?} */
                    var subs = _this.subs.filter((/**
                     * @param {?} sub
                     * @return {?}
                     */
                    function (sub) { return sub.id === id_1; }));
                    subs.forEach((/**
                     * @param {?} sub
                     * @return {?}
                     */
                    function (sub) {
                        if (sub.sub) {
                            sub.sub.unsubscribe();
                            /** @type {?} */
                            var fileIndex = _this.queue.findIndex((/**
                             * @param {?} file
                             * @return {?}
                             */
                            function (file) { return file.id === id_1; }));
                            if (fileIndex !== -1) {
                                _this.queue[fileIndex].progress.status = UploadStatus.Cancelled;
                                _this.serviceEvents.emit({ type: 'cancelled', file: _this.queue[fileIndex] });
                            }
                        }
                    }));
                    break;
                case 'cancelAll':
                    _this.subs.forEach((/**
                     * @param {?} sub
                     * @return {?}
                     */
                    function (sub) {
                        if (sub.sub) {
                            sub.sub.unsubscribe();
                        }
                        /** @type {?} */
                        var file = _this.queue.find((/**
                         * @param {?} uploadFile
                         * @return {?}
                         */
                        function (uploadFile) { return uploadFile.id === sub.id; }));
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
                    var i = _this.queue.findIndex((/**
                     * @param {?} file
                     * @return {?}
                     */
                    function (file) { return file.id === event.id; }));
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
        return new Observable((/**
         * @param {?} observer
         * @return {?}
         */
        function (observer) {
            /** @type {?} */
            var sub = _this.uploadFile(upload.file, upload.event)
                .pipe(finalize((/**
             * @return {?}
             */
            function () {
                if (!observer.closed) {
                    observer.complete();
                }
            })))
                .subscribe((/**
             * @param {?} output
             * @return {?}
             */
            function (output) {
                observer.next(output);
            }), (/**
             * @param {?} err
             * @return {?}
             */
            function (err) {
                observer.error(err);
                observer.complete();
            }), (/**
             * @return {?}
             */
            function () {
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
        return new Observable((/**
         * @param {?} observer
         * @return {?}
         */
        function (observer) {
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
            xhr.upload.addEventListener('progress', (/**
             * @param {?} e
             * @return {?}
             */
            function (e) {
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
            xhr.upload.addEventListener('error', (/**
             * @param {?} e
             * @return {?}
             */
            function (e) {
                observer.error(e);
                observer.complete();
            }));
            xhr.onreadystatechange = (/**
             * @return {?}
             */
            function () {
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
                var uploadFile_1 = (/** @type {?} */ (file.nativeFile));
                /** @type {?} */
                var uploadIndex = _this.queue.findIndex((/**
                 * @param {?} outFile
                 * @return {?}
                 */
                function (outFile) { return outFile.nativeFile === uploadFile_1; }));
                if (_this.queue[uploadIndex].progress.status === UploadStatus.Cancelled) {
                    observer.complete();
                }
                Object.keys(headers).forEach((/**
                 * @param {?} key
                 * @return {?}
                 */
                function (key) { return xhr.setRequestHeader(key, headers[key]); }));
                /** @type {?} */
                var bodyToSend = void 0;
                if (event.sendDataType === 'formdata') {
                    //event.includeWebKitFormBoundary !== false
                    Object.keys(data).forEach((/**
                     * @param {?} key
                     * @return {?}
                     */
                    function (key) { return file.form.append(key, data[key]); }));
                    file.form.append(event.fieldName || 'file', uploadFile_1, uploadFile_1.name);
                    bodyToSend = file.form;
                }
                if (event.sendDataType === 'json') {
                    bodyToSend = JSON.stringify(data);
                }
                if (event.sendDataType === 'blob') {
                    bodyToSend = uploadFile_1;
                }
                _this.serviceEvents.emit({ type: 'start', file: file });
                xhr.send(bodyToSend);
            }
            catch (e) {
                observer.complete();
            }
            return (/**
             * @return {?}
             */
            function () {
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
            if (contentTypes.find((/**
             * @param {?} type
             * @return {?}
             */
            function (type) { return type === '*'; })) !== undefined) {
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
        return this.contentTypes.find((/**
         * @param {?} type
         * @return {?}
         */
        function (type) { return type === '*'; })) !== undefined;
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
        return this.contentTypes.find((/**
         * @param {?} type
         * @return {?}
         */
        function (type) { return type === mimetype; })) !== undefined;
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
            .map((/**
         * @param {?} x
         * @return {?}
         */
        function (x) { return x.split(/: */, 2); }))
            .filter((/**
         * @param {?} x
         * @return {?}
         */
        function (x) { return x[0]; }))
            .reduce((/**
         * @param {?} acc
         * @param {?} x
         * @return {?}
         */
        function (acc, x) {
            acc[x[0]] = x[1];
            return acc;
        }), {});
    };
    return NgUploaderService;
}());
export { NgUploaderService };
if (false) {
    /** @type {?} */
    NgUploaderService.prototype.queue;
    /** @type {?} */
    NgUploaderService.prototype.serviceEvents;
    /** @type {?} */
    NgUploaderService.prototype.uploadScheduler;
    /** @type {?} */
    NgUploaderService.prototype.subs;
    /** @type {?} */
    NgUploaderService.prototype.contentTypes;
    /** @type {?} */
    NgUploaderService.prototype.maxUploads;
    /** @type {?} */
    NgUploaderService.prototype.maxFileSize;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmd4LXVwbG9hZGVyLmNsYXNzLmpzIiwic291cmNlUm9vdCI6Im5nOi8vQHRvbmlrZGV2L25neC11cGxvYWRlci1lbmhhbmNlZC8iLCJzb3VyY2VzIjpbImxpYi9uZ3gtdXBsb2FkZXIuY2xhc3MudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQzdDLE9BQU8sRUFBRSxVQUFVLEVBQUUsT0FBTyxFQUFnQixNQUFNLE1BQU0sQ0FBQztBQUN6RCxPQUFPLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBQ3BELE9BQU8sRUFBeUMsWUFBWSxFQUFZLE1BQU0sY0FBYyxDQUFDOzs7OztBQUU3RixNQUFNLFVBQVUsYUFBYSxDQUFDLEtBQWE7SUFDekMsSUFBSSxLQUFLLEtBQUssQ0FBQyxFQUFFO1FBQ2YsT0FBTyxRQUFRLENBQUM7S0FDakI7O1FBRUssQ0FBQyxHQUFHLElBQUk7O1FBQ1IsS0FBSyxHQUFhLENBQUMsT0FBTyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLENBQUM7O1FBQ3pELENBQUMsR0FBVyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUUzRCxPQUFPLFVBQVUsQ0FBQyxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDMUUsQ0FBQztBQUVEO0lBU0UsMkJBQ0UsV0FBOEMsRUFDOUMsWUFBOEIsRUFDOUIsVUFBNkMsRUFDN0MsV0FBOEM7UUFIOUMsNEJBQUEsRUFBQSxjQUFzQixNQUFN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QUVELE9BQU8sV0FBVyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUM7YUFDM0IsR0FBRzs7OztRQUFDLFVBQUMsQ0FBUyxJQUFLLE9BQUEsQ0FBQyxDQUFDLEtBQUssQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLEVBQWpCLENBQWlCLEVBQUM7YUFDckMsTUFBTTs7OztRQUFDLFVBQUMsQ0FBVyxJQUFLLE9BQUEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFKLENBQUksRUFBQzthQUM3QixNQUFNOzs7OztRQUFDLFVBQUMsR0FBVyxFQUFFLENBQVc7WUFDL0IsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNqQixPQUFPLEdBQUcsQ0FBQztRQUNiLENBQUMsR0FBRSxFQUFFLENBQUMsQ0FBQztJQUNYLENBQUM7SUFDSCx3QkFBQztBQUFELENBQUMsQUE1VUQsSUE0VUM7Ozs7SUEzVUMsa0NBQW9COztJQUNwQiwwQ0FBMEM7O0lBQzFDLDRDQUFtRTs7SUFDbkUsaUNBQTBDOztJQUMxQyx5Q0FBdUI7O0lBQ3ZCLHVDQUFtQjs7SUFDbkIsd0NBQW9CIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgRXZlbnRFbWl0dGVyIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBPYnNlcnZhYmxlLCBTdWJqZWN0LCBTdWJzY3JpcHRpb24gfSBmcm9tICdyeGpzJztcbmltcG9ydCB7IG1lcmdlTWFwLCBmaW5hbGl6ZSB9IGZyb20gJ3J4anMvb3BlcmF0b3JzJztcbmltcG9ydCB7IFVwbG9hZEZpbGUsIFVwbG9hZE91dHB1dCwgVXBsb2FkSW5wdXQsIFVwbG9hZFN0YXR1cywgQmxvYkZpbGUgfSBmcm9tICcuL2ludGVyZmFjZXMnO1xuXG5leHBvcnQgZnVuY3Rpb24gaHVtYW5pemVCeXRlcyhieXRlczogbnVtYmVyKTogc3RyaW5nIHtcbiAgaWYgKGJ5dGVzID09PSAwKSB7XG4gICAgcmV0dXJuICcwIEJ5dGUnO1xuICB9XG5cbiAgY29uc3QgayA9IDEwMjQ7XG4gIGNvbnN0IHNpemVzOiBzdHJpbmdbXSA9IFsnQnl0ZXMnLCAnS0InLCAnTUInLCAnR0InLCAnVEInLCAnUEInXTtcbiAgY29uc3QgaTogbnVtYmVyID0gTWF0aC5mbG9vcihNYXRoLmxvZyhieXRlcykgLyBNYXRoLmxvZyhrKSk7XG5cbiAgcmV0dXJuIHBhcnNlRmxvYXQoKGJ5dGVzIC8gTWF0aC5wb3coaywgaSkpLnRvRml4ZWQoMikpICsgJyAnICsgc2l6ZXNbaV07XG59XG5cbmV4cG9ydCBjbGFzcyBOZ1VwbG9hZGVyU2VydmljZSB7XG4gIHF1ZXVlOiBVcGxvYWRGaWxlW107XG4gIHNlcnZpY2VFdmVudHM6IEV2ZW50RW1pdHRlcjxVcGxvYWRPdXRwdXQ+O1xuICB1cGxvYWRTY2hlZHVsZXI6IFN1YmplY3Q8eyBmaWxlOiBVcGxvYWRGaWxlLCBldmVudDogVXBsb2FkSW5wdXQgfT47XG4gIHN1YnM6IHsgaWQ6IHN0cmluZywgc3ViOiBTdWJzY3JpcHRpb24gfVtdO1xuICBjb250ZW50VHlwZXM6IHN0cmluZ1tdO1xuICBtYXhVcGxvYWRzOiBudW1iZXI7XG4gIG1heEZpbGVTaXplOiBudW1iZXI7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgY29uY3VycmVuY3k6IG51bWJlciA9IE51bWJlci5QT1NJVElWRV9JTkZJTklUWSxcbiAgICBjb250ZW50VHlwZXM6IHN0cmluZ1tdID0gWycqJ10sXG4gICAgbWF4VXBsb2FkczogbnVtYmVyID0gTnVtYmVyLlBPU0lUSVZFX0lORklOSVRZLFxuICAgIG1heEZpbGVTaXplOiBudW1iZXIgPSBOdW1iZXIuUE9TSVRJVkVfSU5GSU5JVFlcbiAgKSB7XG4gICAgdGhpcy5xdWV1ZSA9IFtdO1xuICAgIHRoaXMuc2VydmljZUV2ZW50cyA9IG5ldyBFdmVudEVtaXR0ZXI8VXBsb2FkT3V0cHV0PigpO1xuICAgIHRoaXMudXBsb2FkU2NoZWR1bGVyID0gbmV3IFN1YmplY3QoKTtcbiAgICB0aGlzLnN1YnMgPSBbXTtcbiAgICB0aGlzLmNvbnRlbnRUeXBlcyA9IGNvbnRlbnRUeXBlcztcbiAgICB0aGlzLm1heFVwbG9hZHMgPSBtYXhVcGxvYWRzO1xuICAgIHRoaXMubWF4RmlsZVNpemUgPSBtYXhGaWxlU2l6ZTtcblxuICAgIHRoaXMudXBsb2FkU2NoZWR1bGVyXG4gICAgICAucGlwZShcbiAgICAgICAgbWVyZ2VNYXAodXBsb2FkID0+IHRoaXMuc3RhcnRVcGxvYWQodXBsb2FkKSwgY29uY3VycmVuY3kpXG4gICAgICApXG4gICAgICAuc3Vic2NyaWJlKHVwbG9hZE91dHB1dCA9PiB0aGlzLnNlcnZpY2VFdmVudHMuZW1pdCh1cGxvYWRPdXRwdXQpKTtcbiAgfVxuXG4gIGhhbmRsZUZpbGVzKGluY29taW5nRmlsZXM6IEZpbGVMaXN0KTogdm9pZCB7XG4gICAgY29uc3QgYWxsb3dlZEluY29taW5nRmlsZXM6IEZpbGVbXSA9IFtdLnJlZHVjZS5jYWxsKGluY29taW5nRmlsZXMsIChhY2M6IEZpbGVbXSwgY2hlY2tGaWxlOiBGaWxlLCBpOiBudW1iZXIpID0+IHtcbiAgICAgIGNvbnN0IGZ1dHVyZVF1ZXVlTGVuZ3RoID0gYWNjLmxlbmd0aCArIHRoaXMucXVldWUubGVuZ3RoICsgMTtcbiAgICAgIGlmICh0aGlzLmlzQ29udGVudFR5cGVBbGxvd2VkKGNoZWNrRmlsZS50eXBlKSAmJiBmdXR1cmVRdWV1ZUxlbmd0aCA8PSB0aGlzLm1heFVwbG9hZHMgJiYgdGhpcy5pc0ZpbGVTaXplQWxsb3dlZChjaGVja0ZpbGUuc2l6ZSkpIHtcbiAgICAgICAgYWNjID0gYWNjLmNvbmNhdChjaGVja0ZpbGUpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3QgcmVqZWN0ZWRGaWxlOiBVcGxvYWRGaWxlID0gdGhpcy5tYWtlVXBsb2FkRmlsZShjaGVja0ZpbGUsIGkpO1xuICAgICAgICB0aGlzLnNlcnZpY2VFdmVudHMuZW1pdCh7IHR5cGU6ICdyZWplY3RlZCcsIGZpbGU6IHJlamVjdGVkRmlsZSB9KTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGFjYztcbiAgICB9LCBbXSk7XG5cbiAgICB0aGlzLnF1ZXVlLnB1c2goLi4uW10ubWFwLmNhbGwoYWxsb3dlZEluY29taW5nRmlsZXMsIChmaWxlOiBGaWxlLCBpOiBudW1iZXIpID0+IHtcbiAgICAgIGNvbnN0IHVwbG9hZEZpbGU6IFVwbG9hZEZpbGUgPSB0aGlzLm1ha2VVcGxvYWRGaWxlKGZpbGUsIGkpO1xuICAgICAgdGhpcy5zZXJ2aWNlRXZlbnRzLmVtaXQoeyB0eXBlOiAnYWRkZWRUb1F1ZXVlJywgZmlsZTogdXBsb2FkRmlsZSB9KTtcbiAgICAgIHJldHVybiB1cGxvYWRGaWxlO1xuICAgIH0pKTtcblxuICAgIHRoaXMuc2VydmljZUV2ZW50cy5lbWl0KHsgdHlwZTogJ2FsbEFkZGVkVG9RdWV1ZScgfSk7XG4gIH1cblxuICBpbml0SW5wdXRFdmVudHMoaW5wdXQ6IEV2ZW50RW1pdHRlcjxVcGxvYWRJbnB1dD4pOiBTdWJzY3JpcHRpb24ge1xuICAgIHJldHVybiBpbnB1dC5zdWJzY3JpYmUoKGV2ZW50OiBVcGxvYWRJbnB1dCkgPT4ge1xuICAgICAgc3dpdGNoIChldmVudC50eXBlKSB7XG4gICAgICAgIGNhc2UgJ3VwbG9hZEZpbGUnOlxuICAgICAgICAgIGNvbnN0IHVwbG9hZEZpbGVJbmRleCA9IHRoaXMucXVldWUuZmluZEluZGV4KGZpbGUgPT4gZmlsZSA9PT0gZXZlbnQuZmlsZSk7XG4gICAgICAgICAgaWYgKHVwbG9hZEZpbGVJbmRleCAhPT0gLTEgJiYgZXZlbnQuZmlsZSkge1xuICAgICAgICAgICAgdGhpcy51cGxvYWRTY2hlZHVsZXIubmV4dCh7IGZpbGU6IHRoaXMucXVldWVbdXBsb2FkRmlsZUluZGV4XSwgZXZlbnQ6IGV2ZW50IH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAndXBsb2FkQWxsJzpcbiAgICAgICAgICBjb25zdCBmaWxlcyA9IHRoaXMucXVldWUuZmlsdGVyKGZpbGUgPT4gZmlsZS5wcm9ncmVzcy5zdGF0dXMgPT09IFVwbG9hZFN0YXR1cy5RdWV1ZSk7XG4gICAgICAgICAgZmlsZXMuZm9yRWFjaChmaWxlID0+IHRoaXMudXBsb2FkU2NoZWR1bGVyLm5leHQoeyBmaWxlOiBmaWxlLCBldmVudDogZXZlbnQgfSkpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdjYW5jZWwnOlxuICAgICAgICAgIGNvbnN0IGlkID0gZXZlbnQuaWQgfHwgbnVsbDtcbiAgICAgICAgICBpZiAoIWlkKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuICAgICAgICAgIGNvbnN0IHN1YnMgPSB0aGlzLnN1YnMuZmlsdGVyKHN1YiA9PiBzdWIuaWQgPT09IGlkKTtcbiAgICAgICAgICBzdWJzLmZvckVhY2goc3ViID0+IHtcbiAgICAgICAgICAgIGlmIChzdWIuc3ViKSB7XG4gICAgICAgICAgICAgIHN1Yi5zdWIudW5zdWJzY3JpYmUoKTtcbiAgICAgICAgICAgICAgY29uc3QgZmlsZUluZGV4ID0gdGhpcy5xdWV1ZS5maW5kSW5kZXgoZmlsZSA9PiBmaWxlLmlkID09PSBpZCk7XG4gICAgICAgICAgICAgIGlmIChmaWxlSW5kZXggIT09IC0xKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5xdWV1ZVtmaWxlSW5kZXhdLnByb2dyZXNzLnN0YXR1cyA9IFVwbG9hZFN0YXR1cy5DYW5jZWxsZWQ7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXJ2aWNlRXZlbnRzLmVtaXQoeyB0eXBlOiAnY2FuY2VsbGVkJywgZmlsZTogdGhpcy5xdWV1ZVtmaWxlSW5kZXhdIH0pO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ2NhbmNlbEFsbCc6XG4gICAgICAgICAgdGhpcy5zdWJzLmZvckVhY2goc3ViID0+IHtcbiAgICAgICAgICAgIGlmIChzdWIuc3ViKSB7XG4gICAgICAgICAgICAgIHN1Yi5zdWIudW5zdWJzY3JpYmUoKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY29uc3QgZmlsZSA9IHRoaXMucXVldWUuZmluZCh1cGxvYWRGaWxlID0+IHVwbG9hZEZpbGUuaWQgPT09IHN1Yi5pZCk7XG4gICAgICAgICAgICBpZiAoZmlsZSkge1xuICAgICAgICAgICAgICBmaWxlLnByb2dyZXNzLnN0YXR1cyA9IFVwbG9hZFN0YXR1cy5DYW5jZWxsZWQ7XG4gICAgICAgICAgICAgIHRoaXMuc2VydmljZUV2ZW50cy5lbWl0KHsgdHlwZTogJ2NhbmNlbGxlZCcsIGZpbGU6IGZpbGUgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ3JlbW92ZSc6XG4gICAgICAgICAgaWYgKCFldmVudC5pZCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGNvbnN0IGkgPSB0aGlzLnF1ZXVlLmZpbmRJbmRleChmaWxlID0+IGZpbGUuaWQgPT09IGV2ZW50LmlkKTtcbiAgICAgICAgICBpZiAoaSAhPT0gLTEpIHtcbiAgICAgICAgICAgIGNvbnN0IGZpbGUgPSB0aGlzLnF1ZXVlW2ldO1xuICAgICAgICAgICAgdGhpcy5xdWV1ZS5zcGxpY2UoaSwgMSk7XG4gICAgICAgICAgICB0aGlzLnNlcnZpY2VFdmVudHMuZW1pdCh7IHR5cGU6ICdyZW1vdmVkJywgZmlsZTogZmlsZSB9KTtcbiAgICAgICAgICB9XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ3JlbW92ZUFsbCc6XG4gICAgICAgICAgaWYgKHRoaXMucXVldWUubGVuZ3RoKSB7XG4gICAgICAgICAgICB0aGlzLnF1ZXVlID0gW107XG4gICAgICAgICAgICB0aGlzLnNlcnZpY2VFdmVudHMuZW1pdCh7IHR5cGU6ICdyZW1vdmVkQWxsJyB9KTtcbiAgICAgICAgICB9XG4gICAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBzdGFydFVwbG9hZCh1cGxvYWQ6IHsgZmlsZTogVXBsb2FkRmlsZSwgZXZlbnQ6IFVwbG9hZElucHV0IH0pOiBPYnNlcnZhYmxlPFVwbG9hZE91dHB1dD4ge1xuICAgIHJldHVybiBuZXcgT2JzZXJ2YWJsZShvYnNlcnZlciA9PiB7XG4gICAgICBjb25zdCBzdWIgPSB0aGlzLnVwbG9hZEZpbGUodXBsb2FkLmZpbGUsIHVwbG9hZC5ldmVudClcbiAgICAgICAgLnBpcGUoZmluYWxpemUoKCkgPT4ge1xuICAgICAgICAgIGlmICghb2JzZXJ2ZXIuY2xvc2VkKSB7XG4gICAgICAgICAgICBvYnNlcnZlci5jb21wbGV0ZSgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSkpXG4gICAgICAgIC5zdWJzY3JpYmUob3V0cHV0ID0+IHtcbiAgICAgICAgICBvYnNlcnZlci5uZXh0KG91dHB1dCk7XG4gICAgICAgIH0sIGVyciA9PiB7XG4gICAgICAgICAgb2JzZXJ2ZXIuZXJyb3IoZXJyKTtcbiAgICAgICAgICBvYnNlcnZlci5jb21wbGV0ZSgpO1xuICAgICAgICB9LCAoKSA9PiB7XG4gICAgICAgICAgb2JzZXJ2ZXIuY29tcGxldGUoKTtcbiAgICAgICAgfSk7XG5cbiAgICAgIHRoaXMuc3Vicy5wdXNoKHsgaWQ6IHVwbG9hZC5maWxlLmlkLCBzdWI6IHN1YiB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIHVwbG9hZEZpbGUoZmlsZTogVXBsb2FkRmlsZSwgZXZlbnQ6IFVwbG9hZElucHV0KTogT2JzZXJ2YWJsZTxVcGxvYWRPdXRwdXQ+IHtcbiAgICByZXR1cm4gbmV3IE9ic2VydmFibGUob2JzZXJ2ZXIgPT4ge1xuICAgICAgY29uc3QgdXJsID0gZXZlbnQudXJsIHx8ICcnO1xuICAgICAgY29uc3QgbWV0aG9kID0gZXZlbnQubWV0aG9kIHx8ICdQT1NUJztcbiAgICAgIGNvbnN0IGRhdGEgPSBldmVudC5kYXRhIHx8IHt9O1xuICAgICAgY29uc3QgaGVhZGVycyA9IGV2ZW50LmhlYWRlcnMgfHwge307XG5cbiAgICAgIGNvbnN0IHhociA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuICAgICAgY29uc3QgdGltZTogbnVtYmVyID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XG4gICAgICBsZXQgcHJvZ3Jlc3NTdGFydFRpbWU6IG51bWJlciA9IChmaWxlLnByb2dyZXNzLmRhdGEgJiYgZmlsZS5wcm9ncmVzcy5kYXRhLnN0YXJ0VGltZSkgfHwgdGltZTtcbiAgICAgIGxldCBzcGVlZCA9IDA7XG4gICAgICBsZXQgZXRhOiBudW1iZXIgfCBudWxsID0gbnVsbDtcblxuICAgICAgeGhyLnVwbG9hZC5hZGRFdmVudExpc3RlbmVyKCdwcm9ncmVzcycsIChlOiBQcm9ncmVzc0V2ZW50KSA9PiB7XG4gICAgICAgIGlmIChlLmxlbmd0aENvbXB1dGFibGUpIHtcbiAgICAgICAgICBjb25zdCBwZXJjZW50YWdlID0gTWF0aC5yb3VuZCgoZS5sb2FkZWQgKiAxMDApIC8gZS50b3RhbCk7XG4gICAgICAgICAgY29uc3QgZGlmZiA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpIC0gdGltZTtcbiAgICAgICAgICBzcGVlZCA9IE1hdGgucm91bmQoZS5sb2FkZWQgLyBkaWZmICogMTAwMCk7XG4gICAgICAgICAgcHJvZ3Jlc3NTdGFydFRpbWUgPSAoZmlsZS5wcm9ncmVzcy5kYXRhICYmIGZpbGUucHJvZ3Jlc3MuZGF0YS5zdGFydFRpbWUpIHx8IG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuICAgICAgICAgIGV0YSA9IE1hdGguY2VpbCgoZS50b3RhbCAtIGUubG9hZGVkKSAvIHNwZWVkKTtcblxuICAgICAgICAgIGZpbGUucHJvZ3Jlc3MgPSB7XG4gICAgICAgICAgICBzdGF0dXM6IFVwbG9hZFN0YXR1cy5VcGxvYWRpbmcsXG4gICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgIHBlcmNlbnRhZ2U6IHBlcmNlbnRhZ2UsXG4gICAgICAgICAgICAgIHNwZWVkOiBzcGVlZCxcbiAgICAgICAgICAgICAgc3BlZWRIdW1hbjogYCR7aHVtYW5pemVCeXRlcyhzcGVlZCl9L3NgLFxuICAgICAgICAgICAgICBzdGFydFRpbWU6IHByb2dyZXNzU3RhcnRUaW1lLFxuICAgICAgICAgICAgICBlbmRUaW1lOiBudWxsLFxuICAgICAgICAgICAgICBldGE6IGV0YSxcbiAgICAgICAgICAgICAgZXRhSHVtYW46IHRoaXMuc2Vjb25kc1RvSHVtYW4oZXRhKVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH07XG5cbiAgICAgICAgICBvYnNlcnZlci5uZXh0KHsgdHlwZTogJ3VwbG9hZGluZycsIGZpbGU6IGZpbGUgfSk7XG4gICAgICAgIH1cbiAgICAgIH0sIGZhbHNlKTtcblxuICAgICAgeGhyLnVwbG9hZC5hZGRFdmVudExpc3RlbmVyKCdlcnJvcicsIChlOiBFdmVudCkgPT4ge1xuICAgICAgICBvYnNlcnZlci5lcnJvcihlKTtcbiAgICAgICAgb2JzZXJ2ZXIuY29tcGxldGUoKTtcbiAgICAgIH0pO1xuXG4gICAgICB4aHIub25yZWFkeXN0YXRlY2hhbmdlID0gKCkgPT4ge1xuICAgICAgICBpZiAoeGhyLnJlYWR5U3RhdGUgPT09IFhNTEh0dHBSZXF1ZXN0LkRPTkUpIHtcbiAgICAgICAgICBjb25zdCBzcGVlZEF2ZXJhZ2UgPSBNYXRoLnJvdW5kKGZpbGUuc2l6ZSAvIChuZXcgRGF0ZSgpLmdldFRpbWUoKSAtIHByb2dyZXNzU3RhcnRUaW1lKSAqIDEwMDApO1xuICAgICAgICAgIGZpbGUucHJvZ3Jlc3MgPSB7XG4gICAgICAgICAgICBzdGF0dXM6IFVwbG9hZFN0YXR1cy5Eb25lLFxuICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICBwZXJjZW50YWdlOiAxMDAsXG4gICAgICAgICAgICAgIHNwZWVkOiBzcGVlZEF2ZXJhZ2UsXG4gICAgICAgICAgICAgIHNwZWVkSHVtYW46IGAke2h1bWFuaXplQnl0ZXMoc3BlZWRBdmVyYWdlKX0vc2AsXG4gICAgICAgICAgICAgIHN0YXJ0VGltZTogcHJvZ3Jlc3NTdGFydFRpbWUsXG4gICAgICAgICAgICAgIGVuZFRpbWU6IG5ldyBEYXRlKCkuZ2V0VGltZSgpLFxuICAgICAgICAgICAgICBldGE6IGV0YSxcbiAgICAgICAgICAgICAgZXRhSHVtYW46IHRoaXMuc2Vjb25kc1RvSHVtYW4oZXRhIHx8IDApXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfTtcblxuICAgICAgICAgIGZpbGUucmVzcG9uc2VTdGF0dXMgPSB4aHIuc3RhdHVzO1xuXG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGZpbGUucmVzcG9uc2UgPSBKU09OLnBhcnNlKHhoci5yZXNwb25zZSk7XG4gICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgZmlsZS5yZXNwb25zZSA9IHhoci5yZXNwb25zZTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBmaWxlLnJlc3BvbnNlSGVhZGVycyA9IHRoaXMucGFyc2VSZXNwb25zZUhlYWRlcnMoeGhyLmdldEFsbFJlc3BvbnNlSGVhZGVycygpKTtcblxuICAgICAgICAgIG9ic2VydmVyLm5leHQoeyB0eXBlOiAnZG9uZScsIGZpbGU6IGZpbGUgfSk7XG5cbiAgICAgICAgICBvYnNlcnZlci5jb21wbGV0ZSgpO1xuICAgICAgICB9XG4gICAgICB9O1xuXG4gICAgICB4aHIub3BlbihtZXRob2QsIHVybCwgdHJ1ZSk7XG4gICAgICB4aHIud2l0aENyZWRlbnRpYWxzID0gZXZlbnQud2l0aENyZWRlbnRpYWxzID8gdHJ1ZSA6IGZhbHNlO1xuXG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCB1cGxvYWRGaWxlID0gPEJsb2JGaWxlPmZpbGUubmF0aXZlRmlsZTtcbiAgICAgICAgY29uc3QgdXBsb2FkSW5kZXggPSB0aGlzLnF1ZXVlLmZpbmRJbmRleChvdXRGaWxlID0+IG91dEZpbGUubmF0aXZlRmlsZSA9PT0gdXBsb2FkRmlsZSk7XG5cbiAgICAgICAgaWYgKHRoaXMucXVldWVbdXBsb2FkSW5kZXhdLnByb2dyZXNzLnN0YXR1cyA9PT0gVXBsb2FkU3RhdHVzLkNhbmNlbGxlZCkge1xuICAgICAgICAgIG9ic2VydmVyLmNvbXBsZXRlKCk7XG4gICAgICAgIH1cblxuICAgICAgICBPYmplY3Qua2V5cyhoZWFkZXJzKS5mb3JFYWNoKGtleSA9PiB4aHIuc2V0UmVxdWVzdEhlYWRlcihrZXksIGhlYWRlcnNba2V5XSkpO1xuXG4gICAgICAgIGxldCBib2R5VG9TZW5kOiBGb3JtRGF0YSB8IEJsb2JGaWxlIHwgc3RyaW5nOyAvLyBqc29uIHNob3VsZCBiZSBzdHJpbmdpZmllZFxuXG4gICAgICAgIGlmIChldmVudC5zZW5kRGF0YVR5cGUgPT09ICdmb3JtZGF0YScpIHtcbiAgICAgICAgICAvL2V2ZW50LmluY2x1ZGVXZWJLaXRGb3JtQm91bmRhcnkgIT09IGZhbHNlXG4gICAgICAgICAgT2JqZWN0LmtleXMoZGF0YSkuZm9yRWFjaChrZXkgPT4gZmlsZS5mb3JtLmFwcGVuZChrZXksIGRhdGFba2V5XSkpO1xuICAgICAgICAgIGZpbGUuZm9ybS5hcHBlbmQoZXZlbnQuZmllbGROYW1lIHx8ICdmaWxlJywgdXBsb2FkRmlsZSwgdXBsb2FkRmlsZS5uYW1lKTtcbiAgICAgICAgICBib2R5VG9TZW5kID0gZmlsZS5mb3JtO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGV2ZW50LnNlbmREYXRhVHlwZSA9PT0gJ2pzb24nKSB7XG4gICAgICAgICAgYm9keVRvU2VuZCA9IEpTT04uc3RyaW5naWZ5KGRhdGEpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGV2ZW50LnNlbmREYXRhVHlwZSA9PT0gJ2Jsb2InKSB7XG4gICAgICAgICAgYm9keVRvU2VuZCA9IHVwbG9hZEZpbGU7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnNlcnZpY2VFdmVudHMuZW1pdCh7IHR5cGU6ICdzdGFydCcsIGZpbGU6IGZpbGUgfSk7XG4gICAgICAgIHhoci5zZW5kKGJvZHlUb1NlbmQpO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBvYnNlcnZlci5jb21wbGV0ZSgpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgICB4aHIuYWJvcnQoKTtcbiAgICAgIH07XG4gICAgfSk7XG4gIH1cblxuICBzZWNvbmRzVG9IdW1hbihzZWM6IG51bWJlcik6IHN0cmluZyB7XG4gICAgcmV0dXJuIG5ldyBEYXRlKHNlYyAqIDEwMDApLnRvSVNPU3RyaW5nKCkuc3Vic3RyKDExLCA4KTtcbiAgfVxuXG4gIGdlbmVyYXRlSWQoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gTWF0aC5yYW5kb20oKS50b1N0cmluZygzNikuc3Vic3RyaW5nKDcpO1xuICB9XG5cbiAgc2V0Q29udGVudFR5cGVzKGNvbnRlbnRUeXBlczogc3RyaW5nW10pOiB2b2lkIHtcbiAgICBpZiAodHlwZW9mIGNvbnRlbnRUeXBlcyAhPT0gJ3VuZGVmaW5lZCcgJiYgY29udGVudFR5cGVzIGluc3RhbmNlb2YgQXJyYXkpIHtcbiAgICAgIGlmIChjb250ZW50VHlwZXMuZmluZCgodHlwZTogc3RyaW5nKSA9PiB0eXBlID09PSAnKicpICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgdGhpcy5jb250ZW50VHlwZXMgPSBbJyonXTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuY29udGVudFR5cGVzID0gY29udGVudFR5cGVzO1xuICAgICAgfVxuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLmNvbnRlbnRUeXBlcyA9IFsnKiddO1xuICB9XG5cbiAgYWxsQ29udGVudFR5cGVzQWxsb3dlZCgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5jb250ZW50VHlwZXMuZmluZCgodHlwZTogc3RyaW5nKSA9PiB0eXBlID09PSAnKicpICE9PSB1bmRlZmluZWQ7XG4gIH1cblxuICBpc0NvbnRlbnRUeXBlQWxsb3dlZChtaW1ldHlwZTogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgaWYgKHRoaXMuYWxsQ29udGVudFR5cGVzQWxsb3dlZCgpKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuY29udGVudFR5cGVzLmZpbmQoKHR5cGU6IHN0cmluZykgPT4gdHlwZSA9PT0gbWltZXR5cGUpICE9PSB1bmRlZmluZWQ7XG4gIH1cblxuICBpc0ZpbGVTaXplQWxsb3dlZChmaWxlU2l6ZTogbnVtYmVyKTogYm9vbGVhbiB7XG4gICAgaWYgKCF0aGlzLm1heEZpbGVTaXplKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgcmV0dXJuIGZpbGVTaXplIDw9IHRoaXMubWF4RmlsZVNpemU7XG4gIH1cblxuICBtYWtlVXBsb2FkRmlsZShmaWxlOiBGaWxlLCBpbmRleDogbnVtYmVyKTogVXBsb2FkRmlsZSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGZpbGVJbmRleDogaW5kZXgsXG4gICAgICBpZDogdGhpcy5nZW5lcmF0ZUlkKCksXG4gICAgICBuYW1lOiBmaWxlLm5hbWUsXG4gICAgICBzaXplOiBmaWxlLnNpemUsXG4gICAgICB0eXBlOiBmaWxlLnR5cGUsXG4gICAgICBmb3JtOiBuZXcgRm9ybURhdGEoKSxcbiAgICAgIHByb2dyZXNzOiB7XG4gICAgICAgIHN0YXR1czogVXBsb2FkU3RhdHVzLlF1ZXVlLFxuICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgcGVyY2VudGFnZTogMCxcbiAgICAgICAgICBzcGVlZDogMCxcbiAgICAgICAgICBzcGVlZEh1bWFuOiBgJHtodW1hbml6ZUJ5dGVzKDApfS9zYCxcbiAgICAgICAgICBzdGFydFRpbWU6IG51bGwsXG4gICAgICAgICAgZW5kVGltZTogbnVsbCxcbiAgICAgICAgICBldGE6IG51bGwsXG4gICAgICAgICAgZXRhSHVtYW46IG51bGxcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIGxhc3RNb2RpZmllZERhdGU6IG5ldyBEYXRlKGZpbGUubGFzdE1vZGlmaWVkKSxcbiAgICAgIHN1YjogdW5kZWZpbmVkLFxuICAgICAgbmF0aXZlRmlsZTogZmlsZVxuICAgIH07XG4gIH1cblxuICBwcml2YXRlIHBhcnNlUmVzcG9uc2VIZWFkZXJzKGh0dHBIZWFkZXJzOiBzdHJpbmcpIHtcbiAgICBpZiAoIWh0dHBIZWFkZXJzKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgcmV0dXJuIGh0dHBIZWFkZXJzLnNwbGl0KCdcXG4nKVxuICAgICAgLm1hcCgoeDogc3RyaW5nKSA9PiB4LnNwbGl0KC86ICovLCAyKSlcbiAgICAgIC5maWx0ZXIoKHg6IHN0cmluZ1tdKSA9PiB4WzBdKVxuICAgICAgLnJlZHVjZSgoYWNjOiBPYmplY3QsIHg6IHN0cmluZ1tdKSA9PiB7XG4gICAgICAgIGFjY1t4WzBdXSA9IHhbMV07XG4gICAgICAgIHJldHVybiBhY2M7XG4gICAgICB9LCB7fSk7XG4gIH1cbn1cbiJdfQ==