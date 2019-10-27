/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
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
    const k = 1024;
    /** @type {?} */
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
    /** @type {?} */
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
export class NgUploaderService {
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
                if (event.sendDataType === 'formdata') {
                    //event.includeWebKitFormBoundary !== false
                    Object.keys(data).forEach((/**
                     * @param {?} key
                     * @return {?}
                     */
                    key => file.form.append(key, data[key])));
                    file.form.append(event.fieldName || 'file', uploadFile, uploadFile.name);
                    bodyToSend = file.form;
                }
                if (event.sendDataType === 'json') {
                    bodyToSend = JSON.stringify(data);
                }
                if (event.sendDataType === 'blob') {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmd4LXVwbG9hZGVyLmNsYXNzLmpzIiwic291cmNlUm9vdCI6Im5nOi8vQHRvbmlrZGV2L25neC11cGxvYWRlci1lbmhhbmNlZC8iLCJzb3VyY2VzIjpbImxpYi9uZ3gtdXBsb2FkZXIuY2xhc3MudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztBQUFBLE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDN0MsT0FBTyxFQUFFLFVBQVUsRUFBRSxPQUFPLEVBQWdCLE1BQU0sTUFBTSxDQUFDO0FBQ3pELE9BQU8sRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFDcEQsT0FBTyxFQUF5QyxZQUFZLEVBQVksTUFBTSxjQUFjLENBQUM7Ozs7O0FBRTdGLE1BQU0sVUFBVSxhQUFhLENBQUMsS0FBYTtJQUN6QyxJQUFJLEtBQUssS0FBSyxDQUFDLEVBQUU7UUFDZixPQUFPLFFBQVEsQ0FBQztLQUNqQjs7VUFFSyxDQUFDLEdBQUcsSUFBSTs7VUFDUixLQUFLLEdBQWEsQ0FBQyxPQUFPLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQzs7VUFDekQsQ0FBQyxHQUFXLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBRTNELE9BQU8sVUFBVSxDQUFDLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUMxRSxDQUFDO0FBRUQsTUFBTSxPQUFPLGlCQUFpQjs7Ozs7OztJQVM1QixZQUNFLGNBQXNCLE1BQU0sQ0FBQyxpQkFBaUIsRUFDOUMsZUFBeUIsQ0FBQyxHQUFHLENB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QUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNqQixPQUFPLEdBQUcsQ0FBQztRQUNiLENBQUMsR0FBRSxFQUFFLENBQUMsQ0FBQztJQUNYLENBQUM7Q0FDRjs7O0lBM1VDLGtDQUFvQjs7SUFDcEIsMENBQTBDOztJQUMxQyw0Q0FBbUU7O0lBQ25FLGlDQUEwQzs7SUFDMUMseUNBQXVCOztJQUN2Qix1Q0FBbUI7O0lBQ25CLHdDQUFvQiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEV2ZW50RW1pdHRlciB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgT2JzZXJ2YWJsZSwgU3ViamVjdCwgU3Vic2NyaXB0aW9uIH0gZnJvbSAncnhqcyc7XG5pbXBvcnQgeyBtZXJnZU1hcCwgZmluYWxpemUgfSBmcm9tICdyeGpzL29wZXJhdG9ycyc7XG5pbXBvcnQgeyBVcGxvYWRGaWxlLCBVcGxvYWRPdXRwdXQsIFVwbG9hZElucHV0LCBVcGxvYWRTdGF0dXMsIEJsb2JGaWxlIH0gZnJvbSAnLi9pbnRlcmZhY2VzJztcblxuZXhwb3J0IGZ1bmN0aW9uIGh1bWFuaXplQnl0ZXMoYnl0ZXM6IG51bWJlcik6IHN0cmluZyB7XG4gIGlmIChieXRlcyA9PT0gMCkge1xuICAgIHJldHVybiAnMCBCeXRlJztcbiAgfVxuXG4gIGNvbnN0IGsgPSAxMDI0O1xuICBjb25zdCBzaXplczogc3RyaW5nW10gPSBbJ0J5dGVzJywgJ0tCJywgJ01CJywgJ0dCJywgJ1RCJywgJ1BCJ107XG4gIGNvbnN0IGk6IG51bWJlciA9IE1hdGguZmxvb3IoTWF0aC5sb2coYnl0ZXMpIC8gTWF0aC5sb2coaykpO1xuXG4gIHJldHVybiBwYXJzZUZsb2F0KChieXRlcyAvIE1hdGgucG93KGssIGkpKS50b0ZpeGVkKDIpKSArICcgJyArIHNpemVzW2ldO1xufVxuXG5leHBvcnQgY2xhc3MgTmdVcGxvYWRlclNlcnZpY2Uge1xuICBxdWV1ZTogVXBsb2FkRmlsZVtdO1xuICBzZXJ2aWNlRXZlbnRzOiBFdmVudEVtaXR0ZXI8VXBsb2FkT3V0cHV0PjtcbiAgdXBsb2FkU2NoZWR1bGVyOiBTdWJqZWN0PHsgZmlsZTogVXBsb2FkRmlsZSwgZXZlbnQ6IFVwbG9hZElucHV0IH0+O1xuICBzdWJzOiB7IGlkOiBzdHJpbmcsIHN1YjogU3Vic2NyaXB0aW9uIH1bXTtcbiAgY29udGVudFR5cGVzOiBzdHJpbmdbXTtcbiAgbWF4VXBsb2FkczogbnVtYmVyO1xuICBtYXhGaWxlU2l6ZTogbnVtYmVyO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIGNvbmN1cnJlbmN5OiBudW1iZXIgPSBOdW1iZXIuUE9TSVRJVkVfSU5GSU5JVFksXG4gICAgY29udGVudFR5cGVzOiBzdHJpbmdbXSA9IFsnKiddLFxuICAgIG1heFVwbG9hZHM6IG51bWJlciA9IE51bWJlci5QT1NJVElWRV9JTkZJTklUWSxcbiAgICBtYXhGaWxlU2l6ZTogbnVtYmVyID0gTnVtYmVyLlBPU0lUSVZFX0lORklOSVRZXG4gICkge1xuICAgIHRoaXMucXVldWUgPSBbXTtcbiAgICB0aGlzLnNlcnZpY2VFdmVudHMgPSBuZXcgRXZlbnRFbWl0dGVyPFVwbG9hZE91dHB1dD4oKTtcbiAgICB0aGlzLnVwbG9hZFNjaGVkdWxlciA9IG5ldyBTdWJqZWN0KCk7XG4gICAgdGhpcy5zdWJzID0gW107XG4gICAgdGhpcy5jb250ZW50VHlwZXMgPSBjb250ZW50VHlwZXM7XG4gICAgdGhpcy5tYXhVcGxvYWRzID0gbWF4VXBsb2FkcztcbiAgICB0aGlzLm1heEZpbGVTaXplID0gbWF4RmlsZVNpemU7XG5cbiAgICB0aGlzLnVwbG9hZFNjaGVkdWxlclxuICAgICAgLnBpcGUoXG4gICAgICAgIG1lcmdlTWFwKHVwbG9hZCA9PiB0aGlzLnN0YXJ0VXBsb2FkKHVwbG9hZCksIGNvbmN1cnJlbmN5KVxuICAgICAgKVxuICAgICAgLnN1YnNjcmliZSh1cGxvYWRPdXRwdXQgPT4gdGhpcy5zZXJ2aWNlRXZlbnRzLmVtaXQodXBsb2FkT3V0cHV0KSk7XG4gIH1cblxuICBoYW5kbGVGaWxlcyhpbmNvbWluZ0ZpbGVzOiBGaWxlTGlzdCk6IHZvaWQge1xuICAgIGNvbnN0IGFsbG93ZWRJbmNvbWluZ0ZpbGVzOiBGaWxlW10gPSBbXS5yZWR1Y2UuY2FsbChpbmNvbWluZ0ZpbGVzLCAoYWNjOiBGaWxlW10sIGNoZWNrRmlsZTogRmlsZSwgaTogbnVtYmVyKSA9PiB7XG4gICAgICBjb25zdCBmdXR1cmVRdWV1ZUxlbmd0aCA9IGFjYy5sZW5ndGggKyB0aGlzLnF1ZXVlLmxlbmd0aCArIDE7XG4gICAgICBpZiAodGhpcy5pc0NvbnRlbnRUeXBlQWxsb3dlZChjaGVja0ZpbGUudHlwZSkgJiYgZnV0dXJlUXVldWVMZW5ndGggPD0gdGhpcy5tYXhVcGxvYWRzICYmIHRoaXMuaXNGaWxlU2l6ZUFsbG93ZWQoY2hlY2tGaWxlLnNpemUpKSB7XG4gICAgICAgIGFjYyA9IGFjYy5jb25jYXQoY2hlY2tGaWxlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnN0IHJlamVjdGVkRmlsZTogVXBsb2FkRmlsZSA9IHRoaXMubWFrZVVwbG9hZEZpbGUoY2hlY2tGaWxlLCBpKTtcbiAgICAgICAgdGhpcy5zZXJ2aWNlRXZlbnRzLmVtaXQoeyB0eXBlOiAncmVqZWN0ZWQnLCBmaWxlOiByZWplY3RlZEZpbGUgfSk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBhY2M7XG4gICAgfSwgW10pO1xuXG4gICAgdGhpcy5xdWV1ZS5wdXNoKC4uLltdLm1hcC5jYWxsKGFsbG93ZWRJbmNvbWluZ0ZpbGVzLCAoZmlsZTogRmlsZSwgaTogbnVtYmVyKSA9PiB7XG4gICAgICBjb25zdCB1cGxvYWRGaWxlOiBVcGxvYWRGaWxlID0gdGhpcy5tYWtlVXBsb2FkRmlsZShmaWxlLCBpKTtcbiAgICAgIHRoaXMuc2VydmljZUV2ZW50cy5lbWl0KHsgdHlwZTogJ2FkZGVkVG9RdWV1ZScsIGZpbGU6IHVwbG9hZEZpbGUgfSk7XG4gICAgICByZXR1cm4gdXBsb2FkRmlsZTtcbiAgICB9KSk7XG5cbiAgICB0aGlzLnNlcnZpY2VFdmVudHMuZW1pdCh7IHR5cGU6ICdhbGxBZGRlZFRvUXVldWUnIH0pO1xuICB9XG5cbiAgaW5pdElucHV0RXZlbnRzKGlucHV0OiBFdmVudEVtaXR0ZXI8VXBsb2FkSW5wdXQ+KTogU3Vic2NyaXB0aW9uIHtcbiAgICByZXR1cm4gaW5wdXQuc3Vic2NyaWJlKChldmVudDogVXBsb2FkSW5wdXQpID0+IHtcbiAgICAgIHN3aXRjaCAoZXZlbnQudHlwZSkge1xuICAgICAgICBjYXNlICd1cGxvYWRGaWxlJzpcbiAgICAgICAgICBjb25zdCB1cGxvYWRGaWxlSW5kZXggPSB0aGlzLnF1ZXVlLmZpbmRJbmRleChmaWxlID0+IGZpbGUgPT09IGV2ZW50LmZpbGUpO1xuICAgICAgICAgIGlmICh1cGxvYWRGaWxlSW5kZXggIT09IC0xICYmIGV2ZW50LmZpbGUpIHtcbiAgICAgICAgICAgIHRoaXMudXBsb2FkU2NoZWR1bGVyLm5leHQoeyBmaWxlOiB0aGlzLnF1ZXVlW3VwbG9hZEZpbGVJbmRleF0sIGV2ZW50OiBldmVudCB9KTtcbiAgICAgICAgICB9XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ3VwbG9hZEFsbCc6XG4gICAgICAgICAgY29uc3QgZmlsZXMgPSB0aGlzLnF1ZXVlLmZpbHRlcihmaWxlID0+IGZpbGUucHJvZ3Jlc3Muc3RhdHVzID09PSBVcGxvYWRTdGF0dXMuUXVldWUpO1xuICAgICAgICAgIGZpbGVzLmZvckVhY2goZmlsZSA9PiB0aGlzLnVwbG9hZFNjaGVkdWxlci5uZXh0KHsgZmlsZTogZmlsZSwgZXZlbnQ6IGV2ZW50IH0pKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnY2FuY2VsJzpcbiAgICAgICAgICBjb25zdCBpZCA9IGV2ZW50LmlkIHx8IG51bGw7XG4gICAgICAgICAgaWYgKCFpZCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cbiAgICAgICAgICBjb25zdCBzdWJzID0gdGhpcy5zdWJzLmZpbHRlcihzdWIgPT4gc3ViLmlkID09PSBpZCk7XG4gICAgICAgICAgc3Vicy5mb3JFYWNoKHN1YiA9PiB7XG4gICAgICAgICAgICBpZiAoc3ViLnN1Yikge1xuICAgICAgICAgICAgICBzdWIuc3ViLnVuc3Vic2NyaWJlKCk7XG4gICAgICAgICAgICAgIGNvbnN0IGZpbGVJbmRleCA9IHRoaXMucXVldWUuZmluZEluZGV4KGZpbGUgPT4gZmlsZS5pZCA9PT0gaWQpO1xuICAgICAgICAgICAgICBpZiAoZmlsZUluZGV4ICE9PSAtMSkge1xuICAgICAgICAgICAgICAgIHRoaXMucXVldWVbZmlsZUluZGV4XS5wcm9ncmVzcy5zdGF0dXMgPSBVcGxvYWRTdGF0dXMuQ2FuY2VsbGVkO1xuICAgICAgICAgICAgICAgIHRoaXMuc2VydmljZUV2ZW50cy5lbWl0KHsgdHlwZTogJ2NhbmNlbGxlZCcsIGZpbGU6IHRoaXMucXVldWVbZmlsZUluZGV4XSB9KTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdjYW5jZWxBbGwnOlxuICAgICAgICAgIHRoaXMuc3Vicy5mb3JFYWNoKHN1YiA9PiB7XG4gICAgICAgICAgICBpZiAoc3ViLnN1Yikge1xuICAgICAgICAgICAgICBzdWIuc3ViLnVuc3Vic2NyaWJlKCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNvbnN0IGZpbGUgPSB0aGlzLnF1ZXVlLmZpbmQodXBsb2FkRmlsZSA9PiB1cGxvYWRGaWxlLmlkID09PSBzdWIuaWQpO1xuICAgICAgICAgICAgaWYgKGZpbGUpIHtcbiAgICAgICAgICAgICAgZmlsZS5wcm9ncmVzcy5zdGF0dXMgPSBVcGxvYWRTdGF0dXMuQ2FuY2VsbGVkO1xuICAgICAgICAgICAgICB0aGlzLnNlcnZpY2VFdmVudHMuZW1pdCh7IHR5cGU6ICdjYW5jZWxsZWQnLCBmaWxlOiBmaWxlIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdyZW1vdmUnOlxuICAgICAgICAgIGlmICghZXZlbnQuaWQpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBjb25zdCBpID0gdGhpcy5xdWV1ZS5maW5kSW5kZXgoZmlsZSA9PiBmaWxlLmlkID09PSBldmVudC5pZCk7XG4gICAgICAgICAgaWYgKGkgIT09IC0xKSB7XG4gICAgICAgICAgICBjb25zdCBmaWxlID0gdGhpcy5xdWV1ZVtpXTtcbiAgICAgICAgICAgIHRoaXMucXVldWUuc3BsaWNlKGksIDEpO1xuICAgICAgICAgICAgdGhpcy5zZXJ2aWNlRXZlbnRzLmVtaXQoeyB0eXBlOiAncmVtb3ZlZCcsIGZpbGU6IGZpbGUgfSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdyZW1vdmVBbGwnOlxuICAgICAgICAgIGlmICh0aGlzLnF1ZXVlLmxlbmd0aCkge1xuICAgICAgICAgICAgdGhpcy5xdWV1ZSA9IFtdO1xuICAgICAgICAgICAgdGhpcy5zZXJ2aWNlRXZlbnRzLmVtaXQoeyB0eXBlOiAncmVtb3ZlZEFsbCcgfSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgc3RhcnRVcGxvYWQodXBsb2FkOiB7IGZpbGU6IFVwbG9hZEZpbGUsIGV2ZW50OiBVcGxvYWRJbnB1dCB9KTogT2JzZXJ2YWJsZTxVcGxvYWRPdXRwdXQ+IHtcbiAgICByZXR1cm4gbmV3IE9ic2VydmFibGUob2JzZXJ2ZXIgPT4ge1xuICAgICAgY29uc3Qgc3ViID0gdGhpcy51cGxvYWRGaWxlKHVwbG9hZC5maWxlLCB1cGxvYWQuZXZlbnQpXG4gICAgICAgIC5waXBlKGZpbmFsaXplKCgpID0+IHtcbiAgICAgICAgICBpZiAoIW9ic2VydmVyLmNsb3NlZCkge1xuICAgICAgICAgICAgb2JzZXJ2ZXIuY29tcGxldGUoKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pKVxuICAgICAgICAuc3Vic2NyaWJlKG91dHB1dCA9PiB7XG4gICAgICAgICAgb2JzZXJ2ZXIubmV4dChvdXRwdXQpO1xuICAgICAgICB9LCBlcnIgPT4ge1xuICAgICAgICAgIG9ic2VydmVyLmVycm9yKGVycik7XG4gICAgICAgICAgb2JzZXJ2ZXIuY29tcGxldGUoKTtcbiAgICAgICAgfSwgKCkgPT4ge1xuICAgICAgICAgIG9ic2VydmVyLmNvbXBsZXRlKCk7XG4gICAgICAgIH0pO1xuXG4gICAgICB0aGlzLnN1YnMucHVzaCh7IGlkOiB1cGxvYWQuZmlsZS5pZCwgc3ViOiBzdWIgfSk7XG4gICAgfSk7XG4gIH1cblxuICB1cGxvYWRGaWxlKGZpbGU6IFVwbG9hZEZpbGUsIGV2ZW50OiBVcGxvYWRJbnB1dCk6IE9ic2VydmFibGU8VXBsb2FkT3V0cHV0PiB7XG4gICAgcmV0dXJuIG5ldyBPYnNlcnZhYmxlKG9ic2VydmVyID0+IHtcbiAgICAgIGNvbnN0IHVybCA9IGV2ZW50LnVybCB8fCAnJztcbiAgICAgIGNvbnN0IG1ldGhvZCA9IGV2ZW50Lm1ldGhvZCB8fCAnUE9TVCc7XG4gICAgICBjb25zdCBkYXRhID0gZXZlbnQuZGF0YSB8fCB7fTtcbiAgICAgIGNvbnN0IGhlYWRlcnMgPSBldmVudC5oZWFkZXJzIHx8IHt9O1xuXG4gICAgICBjb25zdCB4aHIgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcbiAgICAgIGNvbnN0IHRpbWU6IG51bWJlciA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuICAgICAgbGV0IHByb2dyZXNzU3RhcnRUaW1lOiBudW1iZXIgPSAoZmlsZS5wcm9ncmVzcy5kYXRhICYmIGZpbGUucHJvZ3Jlc3MuZGF0YS5zdGFydFRpbWUpIHx8IHRpbWU7XG4gICAgICBsZXQgc3BlZWQgPSAwO1xuICAgICAgbGV0IGV0YTogbnVtYmVyIHwgbnVsbCA9IG51bGw7XG5cbiAgICAgIHhoci51cGxvYWQuYWRkRXZlbnRMaXN0ZW5lcigncHJvZ3Jlc3MnLCAoZTogUHJvZ3Jlc3NFdmVudCkgPT4ge1xuICAgICAgICBpZiAoZS5sZW5ndGhDb21wdXRhYmxlKSB7XG4gICAgICAgICAgY29uc3QgcGVyY2VudGFnZSA9IE1hdGgucm91bmQoKGUubG9hZGVkICogMTAwKSAvIGUudG90YWwpO1xuICAgICAgICAgIGNvbnN0IGRpZmYgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKSAtIHRpbWU7XG4gICAgICAgICAgc3BlZWQgPSBNYXRoLnJvdW5kKGUubG9hZGVkIC8gZGlmZiAqIDEwMDApO1xuICAgICAgICAgIHByb2dyZXNzU3RhcnRUaW1lID0gKGZpbGUucHJvZ3Jlc3MuZGF0YSAmJiBmaWxlLnByb2dyZXNzLmRhdGEuc3RhcnRUaW1lKSB8fCBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcbiAgICAgICAgICBldGEgPSBNYXRoLmNlaWwoKGUudG90YWwgLSBlLmxvYWRlZCkgLyBzcGVlZCk7XG5cbiAgICAgICAgICBmaWxlLnByb2dyZXNzID0ge1xuICAgICAgICAgICAgc3RhdHVzOiBVcGxvYWRTdGF0dXMuVXBsb2FkaW5nLFxuICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICBwZXJjZW50YWdlOiBwZXJjZW50YWdlLFxuICAgICAgICAgICAgICBzcGVlZDogc3BlZWQsXG4gICAgICAgICAgICAgIHNwZWVkSHVtYW46IGAke2h1bWFuaXplQnl0ZXMoc3BlZWQpfS9zYCxcbiAgICAgICAgICAgICAgc3RhcnRUaW1lOiBwcm9ncmVzc1N0YXJ0VGltZSxcbiAgICAgICAgICAgICAgZW5kVGltZTogbnVsbCxcbiAgICAgICAgICAgICAgZXRhOiBldGEsXG4gICAgICAgICAgICAgIGV0YUh1bWFuOiB0aGlzLnNlY29uZHNUb0h1bWFuKGV0YSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9O1xuXG4gICAgICAgICAgb2JzZXJ2ZXIubmV4dCh7IHR5cGU6ICd1cGxvYWRpbmcnLCBmaWxlOiBmaWxlIH0pO1xuICAgICAgICB9XG4gICAgICB9LCBmYWxzZSk7XG5cbiAgICAgIHhoci51cGxvYWQuYWRkRXZlbnRMaXN0ZW5lcignZXJyb3InLCAoZTogRXZlbnQpID0+IHtcbiAgICAgICAgb2JzZXJ2ZXIuZXJyb3IoZSk7XG4gICAgICAgIG9ic2VydmVyLmNvbXBsZXRlKCk7XG4gICAgICB9KTtcblxuICAgICAgeGhyLm9ucmVhZHlzdGF0ZWNoYW5nZSA9ICgpID0+IHtcbiAgICAgICAgaWYgKHhoci5yZWFkeVN0YXRlID09PSBYTUxIdHRwUmVxdWVzdC5ET05FKSB7XG4gICAgICAgICAgY29uc3Qgc3BlZWRBdmVyYWdlID0gTWF0aC5yb3VuZChmaWxlLnNpemUgLyAobmV3IERhdGUoKS5nZXRUaW1lKCkgLSBwcm9ncmVzc1N0YXJ0VGltZSkgKiAxMDAwKTtcbiAgICAgICAgICBmaWxlLnByb2dyZXNzID0ge1xuICAgICAgICAgICAgc3RhdHVzOiBVcGxvYWRTdGF0dXMuRG9uZSxcbiAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgcGVyY2VudGFnZTogMTAwLFxuICAgICAgICAgICAgICBzcGVlZDogc3BlZWRBdmVyYWdlLFxuICAgICAgICAgICAgICBzcGVlZEh1bWFuOiBgJHtodW1hbml6ZUJ5dGVzKHNwZWVkQXZlcmFnZSl9L3NgLFxuICAgICAgICAgICAgICBzdGFydFRpbWU6IHByb2dyZXNzU3RhcnRUaW1lLFxuICAgICAgICAgICAgICBlbmRUaW1lOiBuZXcgRGF0ZSgpLmdldFRpbWUoKSxcbiAgICAgICAgICAgICAgZXRhOiBldGEsXG4gICAgICAgICAgICAgIGV0YUh1bWFuOiB0aGlzLnNlY29uZHNUb0h1bWFuKGV0YSB8fCAwKVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH07XG5cbiAgICAgICAgICBmaWxlLnJlc3BvbnNlU3RhdHVzID0geGhyLnN0YXR1cztcblxuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICBmaWxlLnJlc3BvbnNlID0gSlNPTi5wYXJzZSh4aHIucmVzcG9uc2UpO1xuICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIGZpbGUucmVzcG9uc2UgPSB4aHIucmVzcG9uc2U7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgZmlsZS5yZXNwb25zZUhlYWRlcnMgPSB0aGlzLnBhcnNlUmVzcG9uc2VIZWFkZXJzKHhoci5nZXRBbGxSZXNwb25zZUhlYWRlcnMoKSk7XG5cbiAgICAgICAgICBvYnNlcnZlci5uZXh0KHsgdHlwZTogJ2RvbmUnLCBmaWxlOiBmaWxlIH0pO1xuXG4gICAgICAgICAgb2JzZXJ2ZXIuY29tcGxldGUoKTtcbiAgICAgICAgfVxuICAgICAgfTtcblxuICAgICAgeGhyLm9wZW4obWV0aG9kLCB1cmwsIHRydWUpO1xuICAgICAgeGhyLndpdGhDcmVkZW50aWFscyA9IGV2ZW50LndpdGhDcmVkZW50aWFscyA/IHRydWUgOiBmYWxzZTtcblxuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgdXBsb2FkRmlsZSA9IDxCbG9iRmlsZT5maWxlLm5hdGl2ZUZpbGU7XG4gICAgICAgIGNvbnN0IHVwbG9hZEluZGV4ID0gdGhpcy5xdWV1ZS5maW5kSW5kZXgob3V0RmlsZSA9PiBvdXRGaWxlLm5hdGl2ZUZpbGUgPT09IHVwbG9hZEZpbGUpO1xuXG4gICAgICAgIGlmICh0aGlzLnF1ZXVlW3VwbG9hZEluZGV4XS5wcm9ncmVzcy5zdGF0dXMgPT09IFVwbG9hZFN0YXR1cy5DYW5jZWxsZWQpIHtcbiAgICAgICAgICBvYnNlcnZlci5jb21wbGV0ZSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgT2JqZWN0LmtleXMoaGVhZGVycykuZm9yRWFjaChrZXkgPT4geGhyLnNldFJlcXVlc3RIZWFkZXIoa2V5LCBoZWFkZXJzW2tleV0pKTtcblxuICAgICAgICBsZXQgYm9keVRvU2VuZDogRm9ybURhdGEgfCBCbG9iRmlsZSB8IHN0cmluZzsgLy8ganNvbiBzaG91bGQgYmUgc3RyaW5naWZpZWRcblxuICAgICAgICBpZiAoZXZlbnQuc2VuZERhdGFUeXBlID09PSAnZm9ybWRhdGEnKSB7XG4gICAgICAgICAgLy9ldmVudC5pbmNsdWRlV2ViS2l0Rm9ybUJvdW5kYXJ5ICE9PSBmYWxzZVxuICAgICAgICAgIE9iamVjdC5rZXlzKGRhdGEpLmZvckVhY2goa2V5ID0+IGZpbGUuZm9ybS5hcHBlbmQoa2V5LCBkYXRhW2tleV0pKTtcbiAgICAgICAgICBmaWxlLmZvcm0uYXBwZW5kKGV2ZW50LmZpZWxkTmFtZSB8fCAnZmlsZScsIHVwbG9hZEZpbGUsIHVwbG9hZEZpbGUubmFtZSk7XG4gICAgICAgICAgYm9keVRvU2VuZCA9IGZpbGUuZm9ybTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChldmVudC5zZW5kRGF0YVR5cGUgPT09ICdqc29uJykge1xuICAgICAgICAgIGJvZHlUb1NlbmQgPSBKU09OLnN0cmluZ2lmeShkYXRhKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChldmVudC5zZW5kRGF0YVR5cGUgPT09ICdibG9iJykge1xuICAgICAgICAgIGJvZHlUb1NlbmQgPSB1cGxvYWRGaWxlO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5zZXJ2aWNlRXZlbnRzLmVtaXQoeyB0eXBlOiAnc3RhcnQnLCBmaWxlOiBmaWxlIH0pO1xuICAgICAgICB4aHIuc2VuZChib2R5VG9TZW5kKTtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgb2JzZXJ2ZXIuY29tcGxldGUoKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuICgpID0+IHtcbiAgICAgICAgeGhyLmFib3J0KCk7XG4gICAgICB9O1xuICAgIH0pO1xuICB9XG5cbiAgc2Vjb25kc1RvSHVtYW4oc2VjOiBudW1iZXIpOiBzdHJpbmcge1xuICAgIHJldHVybiBuZXcgRGF0ZShzZWMgKiAxMDAwKS50b0lTT1N0cmluZygpLnN1YnN0cigxMSwgOCk7XG4gIH1cblxuICBnZW5lcmF0ZUlkKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIE1hdGgucmFuZG9tKCkudG9TdHJpbmcoMzYpLnN1YnN0cmluZyg3KTtcbiAgfVxuXG4gIHNldENvbnRlbnRUeXBlcyhjb250ZW50VHlwZXM6IHN0cmluZ1tdKTogdm9pZCB7XG4gICAgaWYgKHR5cGVvZiBjb250ZW50VHlwZXMgIT09ICd1bmRlZmluZWQnICYmIGNvbnRlbnRUeXBlcyBpbnN0YW5jZW9mIEFycmF5KSB7XG4gICAgICBpZiAoY29udGVudFR5cGVzLmZpbmQoKHR5cGU6IHN0cmluZykgPT4gdHlwZSA9PT0gJyonKSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHRoaXMuY29udGVudFR5cGVzID0gWycqJ107XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmNvbnRlbnRUeXBlcyA9IGNvbnRlbnRUeXBlcztcbiAgICAgIH1cbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5jb250ZW50VHlwZXMgPSBbJyonXTtcbiAgfVxuXG4gIGFsbENvbnRlbnRUeXBlc0FsbG93ZWQoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuY29udGVudFR5cGVzLmZpbmQoKHR5cGU6IHN0cmluZykgPT4gdHlwZSA9PT0gJyonKSAhPT0gdW5kZWZpbmVkO1xuICB9XG5cbiAgaXNDb250ZW50VHlwZUFsbG93ZWQobWltZXR5cGU6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIGlmICh0aGlzLmFsbENvbnRlbnRUeXBlc0FsbG93ZWQoKSkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmNvbnRlbnRUeXBlcy5maW5kKCh0eXBlOiBzdHJpbmcpID0+IHR5cGUgPT09IG1pbWV0eXBlKSAhPT0gdW5kZWZpbmVkO1xuICB9XG5cbiAgaXNGaWxlU2l6ZUFsbG93ZWQoZmlsZVNpemU6IG51bWJlcik6IGJvb2xlYW4ge1xuICAgIGlmICghdGhpcy5tYXhGaWxlU2l6ZSkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIHJldHVybiBmaWxlU2l6ZSA8PSB0aGlzLm1heEZpbGVTaXplO1xuICB9XG5cbiAgbWFrZVVwbG9hZEZpbGUoZmlsZTogRmlsZSwgaW5kZXg6IG51bWJlcik6IFVwbG9hZEZpbGUge1xuICAgIHJldHVybiB7XG4gICAgICBmaWxlSW5kZXg6IGluZGV4LFxuICAgICAgaWQ6IHRoaXMuZ2VuZXJhdGVJZCgpLFxuICAgICAgbmFtZTogZmlsZS5uYW1lLFxuICAgICAgc2l6ZTogZmlsZS5zaXplLFxuICAgICAgdHlwZTogZmlsZS50eXBlLFxuICAgICAgZm9ybTogbmV3IEZvcm1EYXRhKCksXG4gICAgICBwcm9ncmVzczoge1xuICAgICAgICBzdGF0dXM6IFVwbG9hZFN0YXR1cy5RdWV1ZSxcbiAgICAgICAgZGF0YToge1xuICAgICAgICAgIHBlcmNlbnRhZ2U6IDAsXG4gICAgICAgICAgc3BlZWQ6IDAsXG4gICAgICAgICAgc3BlZWRIdW1hbjogYCR7aHVtYW5pemVCeXRlcygwKX0vc2AsXG4gICAgICAgICAgc3RhcnRUaW1lOiBudWxsLFxuICAgICAgICAgIGVuZFRpbWU6IG51bGwsXG4gICAgICAgICAgZXRhOiBudWxsLFxuICAgICAgICAgIGV0YUh1bWFuOiBudWxsXG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBsYXN0TW9kaWZpZWREYXRlOiBuZXcgRGF0ZShmaWxlLmxhc3RNb2RpZmllZCksXG4gICAgICBzdWI6IHVuZGVmaW5lZCxcbiAgICAgIG5hdGl2ZUZpbGU6IGZpbGVcbiAgICB9O1xuICB9XG5cbiAgcHJpdmF0ZSBwYXJzZVJlc3BvbnNlSGVhZGVycyhodHRwSGVhZGVyczogc3RyaW5nKSB7XG4gICAgaWYgKCFodHRwSGVhZGVycykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHJldHVybiBodHRwSGVhZGVycy5zcGxpdCgnXFxuJylcbiAgICAgIC5tYXAoKHg6IHN0cmluZykgPT4geC5zcGxpdCgvOiAqLywgMikpXG4gICAgICAuZmlsdGVyKCh4OiBzdHJpbmdbXSkgPT4geFswXSlcbiAgICAgIC5yZWR1Y2UoKGFjYzogT2JqZWN0LCB4OiBzdHJpbmdbXSkgPT4ge1xuICAgICAgICBhY2NbeFswXV0gPSB4WzFdO1xuICAgICAgICByZXR1cm4gYWNjO1xuICAgICAgfSwge30pO1xuICB9XG59XG4iXX0=