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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmd4LXVwbG9hZGVyLmNsYXNzLmpzIiwic291cmNlUm9vdCI6Im5nOi8vbmd4LXVwbG9hZGVyLyIsInNvdXJjZXMiOlsibGliL25neC11cGxvYWRlci5jbGFzcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O0FBQUEsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUM3QyxPQUFPLEVBQUUsVUFBVSxFQUFFLE9BQU8sRUFBZ0IsTUFBTSxNQUFNLENBQUM7QUFDekQsT0FBTyxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUNwRCxPQUFPLEVBQXlDLFlBQVksRUFBWSxNQUFNLGNBQWMsQ0FBQzs7Ozs7QUFFN0YsTUFBTSxVQUFVLGFBQWEsQ0FBQyxLQUFhO0lBQ3pDLElBQUksS0FBSyxLQUFLLENBQUMsRUFBRTtRQUNmLE9BQU8sUUFBUSxDQUFDO0tBQ2pCOztVQUVLLENBQUMsR0FBRyxJQUFJOztVQUNSLEtBQUssR0FBYSxDQUFDLE9BQU8sRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDOztVQUN6RCxDQUFDLEdBQVcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFFM0QsT0FBTyxVQUFVLENBQUMsQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzFFLENBQUM7QUFFRCxNQUFNLE9BQU8saUJBQWlCOzs7Ozs7O0lBUzVCLFlBQ0UsY0FBc0IsTUFBTSxDQUFDLGlCQUFpQixFQUM5QyxlQUF5QixDQUFDLEdBQUcsQ0FBQyxFQUM5QixhQUFxQixNQUFN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O0lBQzFDLHlDQUF1Qjs7SUFDdkIsdUNBQW1COztJQUNuQix3Q0FBb0IiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBFdmVudEVtaXR0ZXIgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IE9ic2VydmFibGUsIFN1YmplY3QsIFN1YnNjcmlwdGlvbiB9IGZyb20gJ3J4anMnO1xuaW1wb3J0IHsgbWVyZ2VNYXAsIGZpbmFsaXplIH0gZnJvbSAncnhqcy9vcGVyYXRvcnMnO1xuaW1wb3J0IHsgVXBsb2FkRmlsZSwgVXBsb2FkT3V0cHV0LCBVcGxvYWRJbnB1dCwgVXBsb2FkU3RhdHVzLCBCbG9iRmlsZSB9IGZyb20gJy4vaW50ZXJmYWNlcyc7XG5cbmV4cG9ydCBmdW5jdGlvbiBodW1hbml6ZUJ5dGVzKGJ5dGVzOiBudW1iZXIpOiBzdHJpbmcge1xuICBpZiAoYnl0ZXMgPT09IDApIHtcbiAgICByZXR1cm4gJzAgQnl0ZSc7XG4gIH1cblxuICBjb25zdCBrID0gMTAyNDtcbiAgY29uc3Qgc2l6ZXM6IHN0cmluZ1tdID0gWydCeXRlcycsICdLQicsICdNQicsICdHQicsICdUQicsICdQQiddO1xuICBjb25zdCBpOiBudW1iZXIgPSBNYXRoLmZsb29yKE1hdGgubG9nKGJ5dGVzKSAvIE1hdGgubG9nKGspKTtcblxuICByZXR1cm4gcGFyc2VGbG9hdCgoYnl0ZXMgLyBNYXRoLnBvdyhrLCBpKSkudG9GaXhlZCgyKSkgKyAnICcgKyBzaXplc1tpXTtcbn1cblxuZXhwb3J0IGNsYXNzIE5nVXBsb2FkZXJTZXJ2aWNlIHtcbiAgcXVldWU6IFVwbG9hZEZpbGVbXTtcbiAgc2VydmljZUV2ZW50czogRXZlbnRFbWl0dGVyPFVwbG9hZE91dHB1dD47XG4gIHVwbG9hZFNjaGVkdWxlcjogU3ViamVjdDx7IGZpbGU6IFVwbG9hZEZpbGUsIGV2ZW50OiBVcGxvYWRJbnB1dCB9PjtcbiAgc3ViczogeyBpZDogc3RyaW5nLCBzdWI6IFN1YnNjcmlwdGlvbiB9W107XG4gIGNvbnRlbnRUeXBlczogc3RyaW5nW107XG4gIG1heFVwbG9hZHM6IG51bWJlcjtcbiAgbWF4RmlsZVNpemU6IG51bWJlcjtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBjb25jdXJyZW5jeTogbnVtYmVyID0gTnVtYmVyLlBPU0lUSVZFX0lORklOSVRZLFxuICAgIGNvbnRlbnRUeXBlczogc3RyaW5nW10gPSBbJyonXSxcbiAgICBtYXhVcGxvYWRzOiBudW1iZXIgPSBOdW1iZXIuUE9TSVRJVkVfSU5GSU5JVFksXG4gICAgbWF4RmlsZVNpemU6IG51bWJlciA9IE51bWJlci5QT1NJVElWRV9JTkZJTklUWVxuICApIHtcbiAgICB0aGlzLnF1ZXVlID0gW107XG4gICAgdGhpcy5zZXJ2aWNlRXZlbnRzID0gbmV3IEV2ZW50RW1pdHRlcjxVcGxvYWRPdXRwdXQ+KCk7XG4gICAgdGhpcy51cGxvYWRTY2hlZHVsZXIgPSBuZXcgU3ViamVjdCgpO1xuICAgIHRoaXMuc3VicyA9IFtdO1xuICAgIHRoaXMuY29udGVudFR5cGVzID0gY29udGVudFR5cGVzO1xuICAgIHRoaXMubWF4VXBsb2FkcyA9IG1heFVwbG9hZHM7XG4gICAgdGhpcy5tYXhGaWxlU2l6ZSA9IG1heEZpbGVTaXplO1xuXG4gICAgdGhpcy51cGxvYWRTY2hlZHVsZXJcbiAgICAgIC5waXBlKFxuICAgICAgICBtZXJnZU1hcCh1cGxvYWQgPT4gdGhpcy5zdGFydFVwbG9hZCh1cGxvYWQpLCBjb25jdXJyZW5jeSlcbiAgICAgIClcbiAgICAgIC5zdWJzY3JpYmUodXBsb2FkT3V0cHV0ID0+IHRoaXMuc2VydmljZUV2ZW50cy5lbWl0KHVwbG9hZE91dHB1dCkpO1xuICB9XG5cbiAgaGFuZGxlRmlsZXMoaW5jb21pbmdGaWxlczogRmlsZUxpc3QpOiB2b2lkIHtcbiAgICBjb25zdCBhbGxvd2VkSW5jb21pbmdGaWxlczogRmlsZVtdID0gW10ucmVkdWNlLmNhbGwoaW5jb21pbmdGaWxlcywgKGFjYzogRmlsZVtdLCBjaGVja0ZpbGU6IEZpbGUsIGk6IG51bWJlcikgPT4ge1xuICAgICAgY29uc3QgZnV0dXJlUXVldWVMZW5ndGggPSBhY2MubGVuZ3RoICsgdGhpcy5xdWV1ZS5sZW5ndGggKyAxO1xuICAgICAgaWYgKHRoaXMuaXNDb250ZW50VHlwZUFsbG93ZWQoY2hlY2tGaWxlLnR5cGUpICYmIGZ1dHVyZVF1ZXVlTGVuZ3RoIDw9IHRoaXMubWF4VXBsb2FkcyAmJiB0aGlzLmlzRmlsZVNpemVBbGxvd2VkKGNoZWNrRmlsZS5zaXplKSkge1xuICAgICAgICBhY2MgPSBhY2MuY29uY2F0KGNoZWNrRmlsZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zdCByZWplY3RlZEZpbGU6IFVwbG9hZEZpbGUgPSB0aGlzLm1ha2VVcGxvYWRGaWxlKGNoZWNrRmlsZSwgaSk7XG4gICAgICAgIHRoaXMuc2VydmljZUV2ZW50cy5lbWl0KHsgdHlwZTogJ3JlamVjdGVkJywgZmlsZTogcmVqZWN0ZWRGaWxlIH0pO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gYWNjO1xuICAgIH0sIFtdKTtcblxuICAgIHRoaXMucXVldWUucHVzaCguLi5bXS5tYXAuY2FsbChhbGxvd2VkSW5jb21pbmdGaWxlcywgKGZpbGU6IEZpbGUsIGk6IG51bWJlcikgPT4ge1xuICAgICAgY29uc3QgdXBsb2FkRmlsZTogVXBsb2FkRmlsZSA9IHRoaXMubWFrZVVwbG9hZEZpbGUoZmlsZSwgaSk7XG4gICAgICB0aGlzLnNlcnZpY2VFdmVudHMuZW1pdCh7IHR5cGU6ICdhZGRlZFRvUXVldWUnLCBmaWxlOiB1cGxvYWRGaWxlIH0pO1xuICAgICAgcmV0dXJuIHVwbG9hZEZpbGU7XG4gICAgfSkpO1xuXG4gICAgdGhpcy5zZXJ2aWNlRXZlbnRzLmVtaXQoeyB0eXBlOiAnYWxsQWRkZWRUb1F1ZXVlJyB9KTtcbiAgfVxuXG4gIGluaXRJbnB1dEV2ZW50cyhpbnB1dDogRXZlbnRFbWl0dGVyPFVwbG9hZElucHV0Pik6IFN1YnNjcmlwdGlvbiB7XG4gICAgcmV0dXJuIGlucHV0LnN1YnNjcmliZSgoZXZlbnQ6IFVwbG9hZElucHV0KSA9PiB7XG4gICAgICBzd2l0Y2ggKGV2ZW50LnR5cGUpIHtcbiAgICAgICAgY2FzZSAndXBsb2FkRmlsZSc6XG4gICAgICAgICAgY29uc3QgdXBsb2FkRmlsZUluZGV4ID0gdGhpcy5xdWV1ZS5maW5kSW5kZXgoZmlsZSA9PiBmaWxlID09PSBldmVudC5maWxlKTtcbiAgICAgICAgICBpZiAodXBsb2FkRmlsZUluZGV4ICE9PSAtMSAmJiBldmVudC5maWxlKSB7XG4gICAgICAgICAgICB0aGlzLnVwbG9hZFNjaGVkdWxlci5uZXh0KHsgZmlsZTogdGhpcy5xdWV1ZVt1cGxvYWRGaWxlSW5kZXhdLCBldmVudDogZXZlbnQgfSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICd1cGxvYWRBbGwnOlxuICAgICAgICAgIGNvbnN0IGZpbGVzID0gdGhpcy5xdWV1ZS5maWx0ZXIoZmlsZSA9PiBmaWxlLnByb2dyZXNzLnN0YXR1cyA9PT0gVXBsb2FkU3RhdHVzLlF1ZXVlKTtcbiAgICAgICAgICBmaWxlcy5mb3JFYWNoKGZpbGUgPT4gdGhpcy51cGxvYWRTY2hlZHVsZXIubmV4dCh7IGZpbGU6IGZpbGUsIGV2ZW50OiBldmVudCB9KSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ2NhbmNlbCc6XG4gICAgICAgICAgY29uc3QgaWQgPSBldmVudC5pZCB8fCBudWxsO1xuICAgICAgICAgIGlmICghaWQpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG4gICAgICAgICAgY29uc3Qgc3VicyA9IHRoaXMuc3Vicy5maWx0ZXIoc3ViID0+IHN1Yi5pZCA9PT0gaWQpO1xuICAgICAgICAgIHN1YnMuZm9yRWFjaChzdWIgPT4ge1xuICAgICAgICAgICAgaWYgKHN1Yi5zdWIpIHtcbiAgICAgICAgICAgICAgc3ViLnN1Yi51bnN1YnNjcmliZSgpO1xuICAgICAgICAgICAgICBjb25zdCBmaWxlSW5kZXggPSB0aGlzLnF1ZXVlLmZpbmRJbmRleChmaWxlID0+IGZpbGUuaWQgPT09IGlkKTtcbiAgICAgICAgICAgICAgaWYgKGZpbGVJbmRleCAhPT0gLTEpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnF1ZXVlW2ZpbGVJbmRleF0ucHJvZ3Jlc3Muc3RhdHVzID0gVXBsb2FkU3RhdHVzLkNhbmNlbGxlZDtcbiAgICAgICAgICAgICAgICB0aGlzLnNlcnZpY2VFdmVudHMuZW1pdCh7IHR5cGU6ICdjYW5jZWxsZWQnLCBmaWxlOiB0aGlzLnF1ZXVlW2ZpbGVJbmRleF0gfSk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnY2FuY2VsQWxsJzpcbiAgICAgICAgICB0aGlzLnN1YnMuZm9yRWFjaChzdWIgPT4ge1xuICAgICAgICAgICAgaWYgKHN1Yi5zdWIpIHtcbiAgICAgICAgICAgICAgc3ViLnN1Yi51bnN1YnNjcmliZSgpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjb25zdCBmaWxlID0gdGhpcy5xdWV1ZS5maW5kKHVwbG9hZEZpbGUgPT4gdXBsb2FkRmlsZS5pZCA9PT0gc3ViLmlkKTtcbiAgICAgICAgICAgIGlmIChmaWxlKSB7XG4gICAgICAgICAgICAgIGZpbGUucHJvZ3Jlc3Muc3RhdHVzID0gVXBsb2FkU3RhdHVzLkNhbmNlbGxlZDtcbiAgICAgICAgICAgICAgdGhpcy5zZXJ2aWNlRXZlbnRzLmVtaXQoeyB0eXBlOiAnY2FuY2VsbGVkJywgZmlsZTogZmlsZSB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAncmVtb3ZlJzpcbiAgICAgICAgICBpZiAoIWV2ZW50LmlkKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgY29uc3QgaSA9IHRoaXMucXVldWUuZmluZEluZGV4KGZpbGUgPT4gZmlsZS5pZCA9PT0gZXZlbnQuaWQpO1xuICAgICAgICAgIGlmIChpICE9PSAtMSkge1xuICAgICAgICAgICAgY29uc3QgZmlsZSA9IHRoaXMucXVldWVbaV07XG4gICAgICAgICAgICB0aGlzLnF1ZXVlLnNwbGljZShpLCAxKTtcbiAgICAgICAgICAgIHRoaXMuc2VydmljZUV2ZW50cy5lbWl0KHsgdHlwZTogJ3JlbW92ZWQnLCBmaWxlOiBmaWxlIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAncmVtb3ZlQWxsJzpcbiAgICAgICAgICBpZiAodGhpcy5xdWV1ZS5sZW5ndGgpIHtcbiAgICAgICAgICAgIHRoaXMucXVldWUgPSBbXTtcbiAgICAgICAgICAgIHRoaXMuc2VydmljZUV2ZW50cy5lbWl0KHsgdHlwZTogJ3JlbW92ZWRBbGwnIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIHN0YXJ0VXBsb2FkKHVwbG9hZDogeyBmaWxlOiBVcGxvYWRGaWxlLCBldmVudDogVXBsb2FkSW5wdXQgfSk6IE9ic2VydmFibGU8VXBsb2FkT3V0cHV0PiB7XG4gICAgcmV0dXJuIG5ldyBPYnNlcnZhYmxlKG9ic2VydmVyID0+IHtcbiAgICAgIGNvbnN0IHN1YiA9IHRoaXMudXBsb2FkRmlsZSh1cGxvYWQuZmlsZSwgdXBsb2FkLmV2ZW50KVxuICAgICAgICAucGlwZShmaW5hbGl6ZSgoKSA9PiB7XG4gICAgICAgICAgaWYgKCFvYnNlcnZlci5jbG9zZWQpIHtcbiAgICAgICAgICAgIG9ic2VydmVyLmNvbXBsZXRlKCk7XG4gICAgICAgICAgfVxuICAgICAgICB9KSlcbiAgICAgICAgLnN1YnNjcmliZShvdXRwdXQgPT4ge1xuICAgICAgICAgIG9ic2VydmVyLm5leHQob3V0cHV0KTtcbiAgICAgICAgfSwgZXJyID0+IHtcbiAgICAgICAgICBvYnNlcnZlci5lcnJvcihlcnIpO1xuICAgICAgICAgIG9ic2VydmVyLmNvbXBsZXRlKCk7XG4gICAgICAgIH0sICgpID0+IHtcbiAgICAgICAgICBvYnNlcnZlci5jb21wbGV0ZSgpO1xuICAgICAgICB9KTtcblxuICAgICAgdGhpcy5zdWJzLnB1c2goeyBpZDogdXBsb2FkLmZpbGUuaWQsIHN1Yjogc3ViIH0pO1xuICAgIH0pO1xuICB9XG5cbiAgdXBsb2FkRmlsZShmaWxlOiBVcGxvYWRGaWxlLCBldmVudDogVXBsb2FkSW5wdXQpOiBPYnNlcnZhYmxlPFVwbG9hZE91dHB1dD4ge1xuICAgIHJldHVybiBuZXcgT2JzZXJ2YWJsZShvYnNlcnZlciA9PiB7XG4gICAgICBjb25zdCB1cmwgPSBldmVudC51cmwgfHwgJyc7XG4gICAgICBjb25zdCBtZXRob2QgPSBldmVudC5tZXRob2QgfHwgJ1BPU1QnO1xuICAgICAgY29uc3QgZGF0YSA9IGV2ZW50LmRhdGEgfHwge307XG4gICAgICBjb25zdCBoZWFkZXJzID0gZXZlbnQuaGVhZGVycyB8fCB7fTtcblxuICAgICAgY29uc3QgeGhyID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG4gICAgICBjb25zdCB0aW1lOiBudW1iZXIgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcbiAgICAgIGxldCBwcm9ncmVzc1N0YXJ0VGltZTogbnVtYmVyID0gKGZpbGUucHJvZ3Jlc3MuZGF0YSAmJiBmaWxlLnByb2dyZXNzLmRhdGEuc3RhcnRUaW1lKSB8fCB0aW1lO1xuICAgICAgbGV0IHNwZWVkID0gMDtcbiAgICAgIGxldCBldGE6IG51bWJlciB8IG51bGwgPSBudWxsO1xuXG4gICAgICB4aHIudXBsb2FkLmFkZEV2ZW50TGlzdGVuZXIoJ3Byb2dyZXNzJywgKGU6IFByb2dyZXNzRXZlbnQpID0+IHtcbiAgICAgICAgaWYgKGUubGVuZ3RoQ29tcHV0YWJsZSkge1xuICAgICAgICAgIGNvbnN0IHBlcmNlbnRhZ2UgPSBNYXRoLnJvdW5kKChlLmxvYWRlZCAqIDEwMCkgLyBlLnRvdGFsKTtcbiAgICAgICAgICBjb25zdCBkaWZmID0gbmV3IERhdGUoKS5nZXRUaW1lKCkgLSB0aW1lO1xuICAgICAgICAgIHNwZWVkID0gTWF0aC5yb3VuZChlLmxvYWRlZCAvIGRpZmYgKiAxMDAwKTtcbiAgICAgICAgICBwcm9ncmVzc1N0YXJ0VGltZSA9IChmaWxlLnByb2dyZXNzLmRhdGEgJiYgZmlsZS5wcm9ncmVzcy5kYXRhLnN0YXJ0VGltZSkgfHwgbmV3IERhdGUoKS5nZXRUaW1lKCk7XG4gICAgICAgICAgZXRhID0gTWF0aC5jZWlsKChlLnRvdGFsIC0gZS5sb2FkZWQpIC8gc3BlZWQpO1xuXG4gICAgICAgICAgZmlsZS5wcm9ncmVzcyA9IHtcbiAgICAgICAgICAgIHN0YXR1czogVXBsb2FkU3RhdHVzLlVwbG9hZGluZyxcbiAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgcGVyY2VudGFnZTogcGVyY2VudGFnZSxcbiAgICAgICAgICAgICAgc3BlZWQ6IHNwZWVkLFxuICAgICAgICAgICAgICBzcGVlZEh1bWFuOiBgJHtodW1hbml6ZUJ5dGVzKHNwZWVkKX0vc2AsXG4gICAgICAgICAgICAgIHN0YXJ0VGltZTogcHJvZ3Jlc3NTdGFydFRpbWUsXG4gICAgICAgICAgICAgIGVuZFRpbWU6IG51bGwsXG4gICAgICAgICAgICAgIGV0YTogZXRhLFxuICAgICAgICAgICAgICBldGFIdW1hbjogdGhpcy5zZWNvbmRzVG9IdW1hbihldGEpXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfTtcblxuICAgICAgICAgIG9ic2VydmVyLm5leHQoeyB0eXBlOiAndXBsb2FkaW5nJywgZmlsZTogZmlsZSB9KTtcbiAgICAgICAgfVxuICAgICAgfSwgZmFsc2UpO1xuXG4gICAgICB4aHIudXBsb2FkLmFkZEV2ZW50TGlzdGVuZXIoJ2Vycm9yJywgKGU6IEV2ZW50KSA9PiB7XG4gICAgICAgIG9ic2VydmVyLmVycm9yKGUpO1xuICAgICAgICBvYnNlcnZlci5jb21wbGV0ZSgpO1xuICAgICAgfSk7XG5cbiAgICAgIHhoci5vbnJlYWR5c3RhdGVjaGFuZ2UgPSAoKSA9PiB7XG4gICAgICAgIGlmICh4aHIucmVhZHlTdGF0ZSA9PT0gWE1MSHR0cFJlcXVlc3QuRE9ORSkge1xuICAgICAgICAgIGNvbnN0IHNwZWVkQXZlcmFnZSA9IE1hdGgucm91bmQoZmlsZS5zaXplIC8gKG5ldyBEYXRlKCkuZ2V0VGltZSgpIC0gcHJvZ3Jlc3NTdGFydFRpbWUpICogMTAwMCk7XG4gICAgICAgICAgZmlsZS5wcm9ncmVzcyA9IHtcbiAgICAgICAgICAgIHN0YXR1czogVXBsb2FkU3RhdHVzLkRvbmUsXG4gICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgIHBlcmNlbnRhZ2U6IDEwMCxcbiAgICAgICAgICAgICAgc3BlZWQ6IHNwZWVkQXZlcmFnZSxcbiAgICAgICAgICAgICAgc3BlZWRIdW1hbjogYCR7aHVtYW5pemVCeXRlcyhzcGVlZEF2ZXJhZ2UpfS9zYCxcbiAgICAgICAgICAgICAgc3RhcnRUaW1lOiBwcm9ncmVzc1N0YXJ0VGltZSxcbiAgICAgICAgICAgICAgZW5kVGltZTogbmV3IERhdGUoKS5nZXRUaW1lKCksXG4gICAgICAgICAgICAgIGV0YTogZXRhLFxuICAgICAgICAgICAgICBldGFIdW1hbjogdGhpcy5zZWNvbmRzVG9IdW1hbihldGEgfHwgMClcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9O1xuXG4gICAgICAgICAgZmlsZS5yZXNwb25zZVN0YXR1cyA9IHhoci5zdGF0dXM7XG5cbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgZmlsZS5yZXNwb25zZSA9IEpTT04ucGFyc2UoeGhyLnJlc3BvbnNlKTtcbiAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICBmaWxlLnJlc3BvbnNlID0geGhyLnJlc3BvbnNlO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGZpbGUucmVzcG9uc2VIZWFkZXJzID0gdGhpcy5wYXJzZVJlc3BvbnNlSGVhZGVycyh4aHIuZ2V0QWxsUmVzcG9uc2VIZWFkZXJzKCkpO1xuXG4gICAgICAgICAgb2JzZXJ2ZXIubmV4dCh7IHR5cGU6ICdkb25lJywgZmlsZTogZmlsZSB9KTtcblxuICAgICAgICAgIG9ic2VydmVyLmNvbXBsZXRlKCk7XG4gICAgICAgIH1cbiAgICAgIH07XG5cbiAgICAgIHhoci5vcGVuKG1ldGhvZCwgdXJsLCB0cnVlKTtcbiAgICAgIHhoci53aXRoQ3JlZGVudGlhbHMgPSBldmVudC53aXRoQ3JlZGVudGlhbHMgPyB0cnVlIDogZmFsc2U7XG5cbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHVwbG9hZEZpbGUgPSA8QmxvYkZpbGU+ZmlsZS5uYXRpdmVGaWxlO1xuICAgICAgICBjb25zdCB1cGxvYWRJbmRleCA9IHRoaXMucXVldWUuZmluZEluZGV4KG91dEZpbGUgPT4gb3V0RmlsZS5uYXRpdmVGaWxlID09PSB1cGxvYWRGaWxlKTtcblxuICAgICAgICBpZiAodGhpcy5xdWV1ZVt1cGxvYWRJbmRleF0ucHJvZ3Jlc3Muc3RhdHVzID09PSBVcGxvYWRTdGF0dXMuQ2FuY2VsbGVkKSB7XG4gICAgICAgICAgb2JzZXJ2ZXIuY29tcGxldGUoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIE9iamVjdC5rZXlzKGhlYWRlcnMpLmZvckVhY2goa2V5ID0+IHhoci5zZXRSZXF1ZXN0SGVhZGVyKGtleSwgaGVhZGVyc1trZXldKSk7XG5cbiAgICAgICAgbGV0IGJvZHlUb1NlbmQ6IEZvcm1EYXRhIHwgQmxvYkZpbGU7XG5cbiAgICAgICAgaWYgKGV2ZW50LmluY2x1ZGVXZWJLaXRGb3JtQm91bmRhcnkgIT09IGZhbHNlKSB7XG4gICAgICAgICAgT2JqZWN0LmtleXMoZGF0YSkuZm9yRWFjaChrZXkgPT4gZmlsZS5mb3JtLmFwcGVuZChrZXksIGRhdGFba2V5XSkpO1xuICAgICAgICAgIGZpbGUuZm9ybS5hcHBlbmQoZXZlbnQuZmllbGROYW1lIHx8ICdmaWxlJywgdXBsb2FkRmlsZSwgdXBsb2FkRmlsZS5uYW1lKTtcbiAgICAgICAgICBib2R5VG9TZW5kID0gZmlsZS5mb3JtO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGJvZHlUb1NlbmQgPSB1cGxvYWRGaWxlO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5zZXJ2aWNlRXZlbnRzLmVtaXQoeyB0eXBlOiAnc3RhcnQnLCBmaWxlOiBmaWxlIH0pO1xuICAgICAgICB4aHIuc2VuZChib2R5VG9TZW5kKTtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgb2JzZXJ2ZXIuY29tcGxldGUoKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuICgpID0+IHtcbiAgICAgICAgeGhyLmFib3J0KCk7XG4gICAgICB9O1xuICAgIH0pO1xuICB9XG5cbiAgc2Vjb25kc1RvSHVtYW4oc2VjOiBudW1iZXIpOiBzdHJpbmcge1xuICAgIHJldHVybiBuZXcgRGF0ZShzZWMgKiAxMDAwKS50b0lTT1N0cmluZygpLnN1YnN0cigxMSwgOCk7XG4gIH1cblxuICBnZW5lcmF0ZUlkKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIE1hdGgucmFuZG9tKCkudG9TdHJpbmcoMzYpLnN1YnN0cmluZyg3KTtcbiAgfVxuXG4gIHNldENvbnRlbnRUeXBlcyhjb250ZW50VHlwZXM6IHN0cmluZ1tdKTogdm9pZCB7XG4gICAgaWYgKHR5cGVvZiBjb250ZW50VHlwZXMgIT09ICd1bmRlZmluZWQnICYmIGNvbnRlbnRUeXBlcyBpbnN0YW5jZW9mIEFycmF5KSB7XG4gICAgICBpZiAoY29udGVudFR5cGVzLmZpbmQoKHR5cGU6IHN0cmluZykgPT4gdHlwZSA9PT0gJyonKSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHRoaXMuY29udGVudFR5cGVzID0gWycqJ107XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmNvbnRlbnRUeXBlcyA9IGNvbnRlbnRUeXBlcztcbiAgICAgIH1cbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5jb250ZW50VHlwZXMgPSBbJyonXTtcbiAgfVxuXG4gIGFsbENvbnRlbnRUeXBlc0FsbG93ZWQoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuY29udGVudFR5cGVzLmZpbmQoKHR5cGU6IHN0cmluZykgPT4gdHlwZSA9PT0gJyonKSAhPT0gdW5kZWZpbmVkO1xuICB9XG5cbiAgaXNDb250ZW50VHlwZUFsbG93ZWQobWltZXR5cGU6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIGlmICh0aGlzLmFsbENvbnRlbnRUeXBlc0FsbG93ZWQoKSkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmNvbnRlbnRUeXBlcy5maW5kKCh0eXBlOiBzdHJpbmcpID0+IHR5cGUgPT09IG1pbWV0eXBlKSAhPT0gdW5kZWZpbmVkO1xuICB9XG5cbiAgaXNGaWxlU2l6ZUFsbG93ZWQoZmlsZVNpemU6IG51bWJlcik6IGJvb2xlYW4ge1xuICAgIGlmICghdGhpcy5tYXhGaWxlU2l6ZSkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIHJldHVybiBmaWxlU2l6ZSA8PSB0aGlzLm1heEZpbGVTaXplO1xuICB9XG5cbiAgbWFrZVVwbG9hZEZpbGUoZmlsZTogRmlsZSwgaW5kZXg6IG51bWJlcik6IFVwbG9hZEZpbGUge1xuICAgIHJldHVybiB7XG4gICAgICBmaWxlSW5kZXg6IGluZGV4LFxuICAgICAgaWQ6IHRoaXMuZ2VuZXJhdGVJZCgpLFxuICAgICAgbmFtZTogZmlsZS5uYW1lLFxuICAgICAgc2l6ZTogZmlsZS5zaXplLFxuICAgICAgdHlwZTogZmlsZS50eXBlLFxuICAgICAgZm9ybTogbmV3IEZvcm1EYXRhKCksXG4gICAgICBwcm9ncmVzczoge1xuICAgICAgICBzdGF0dXM6IFVwbG9hZFN0YXR1cy5RdWV1ZSxcbiAgICAgICAgZGF0YToge1xuICAgICAgICAgIHBlcmNlbnRhZ2U6IDAsXG4gICAgICAgICAgc3BlZWQ6IDAsXG4gICAgICAgICAgc3BlZWRIdW1hbjogYCR7aHVtYW5pemVCeXRlcygwKX0vc2AsXG4gICAgICAgICAgc3RhcnRUaW1lOiBudWxsLFxuICAgICAgICAgIGVuZFRpbWU6IG51bGwsXG4gICAgICAgICAgZXRhOiBudWxsLFxuICAgICAgICAgIGV0YUh1bWFuOiBudWxsXG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBsYXN0TW9kaWZpZWREYXRlOiBuZXcgRGF0ZShmaWxlLmxhc3RNb2RpZmllZCksXG4gICAgICBzdWI6IHVuZGVmaW5lZCxcbiAgICAgIG5hdGl2ZUZpbGU6IGZpbGVcbiAgICB9O1xuICB9XG5cbiAgcHJpdmF0ZSBwYXJzZVJlc3BvbnNlSGVhZGVycyhodHRwSGVhZGVyczogc3RyaW5nKSB7XG4gICAgaWYgKCFodHRwSGVhZGVycykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHJldHVybiBodHRwSGVhZGVycy5zcGxpdCgnXFxuJylcbiAgICAgIC5tYXAoKHg6IHN0cmluZykgPT4geC5zcGxpdCgvOiAqLywgMikpXG4gICAgICAuZmlsdGVyKCh4OiBzdHJpbmdbXSkgPT4geFswXSlcbiAgICAgIC5yZWR1Y2UoKGFjYzogT2JqZWN0LCB4OiBzdHJpbmdbXSkgPT4ge1xuICAgICAgICBhY2NbeFswXV0gPSB4WzFdO1xuICAgICAgICByZXR1cm4gYWNjO1xuICAgICAgfSwge30pO1xuICB9XG59XG4iXX0=