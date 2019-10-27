/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
import { Directive, ElementRef, EventEmitter, Input, Output, HostListener } from '@angular/core';
import { NgUploaderService } from './ngx-uploader.class';
export class NgFileDropDirective {
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
if (false) {
    /** @type {?} */
    NgFileDropDirective.prototype.options;
    /** @type {?} */
    NgFileDropDirective.prototype.uploadInput;
    /** @type {?} */
    NgFileDropDirective.prototype.uploadOutput;
    /** @type {?} */
    NgFileDropDirective.prototype.upload;
    /** @type {?} */
    NgFileDropDirective.prototype.el;
    /** @type {?} */
    NgFileDropDirective.prototype._sub;
    /** @type {?} */
    NgFileDropDirective.prototype.stopEvent;
    /** @type {?} */
    NgFileDropDirective.prototype.elementRef;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmctZmlsZS1kcm9wLmRpcmVjdGl2ZS5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0B0b25pa2Rldi9uZ3gtdXBsb2FkZXItZW5oYW5jZWQvIiwic291cmNlcyI6WyJsaWIvbmctZmlsZS1kcm9wLmRpcmVjdGl2ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O0FBQUEsT0FBTyxFQUFFLFNBQVMsRUFBRSxVQUFVLEVBQUUsWUFBWSxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQXFCLFlBQVksRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUVwSCxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSxzQkFBc0IsQ0FBQztBQU16RCxNQUFNLE9BQU8sbUJBQW1COzs7O0lBVTlCLFlBQW1CLFVBQXNCO1FBQXRCLGVBQVUsR0FBVixVQUFVLENBQVk7UUFpQ3pDLGNBQVM7Ozs7UUFBRyxDQUFDLENBQVEsRUFBRSxFQUFFO1lBQ3ZCLENBQUMsQ0FBQyxlQUFlLEVBQUUsQ0FBQztZQUNwQixDQUFDLENBQUMsY0FBYyxFQUFFLENBQUM7UUFDckIsQ0FBQyxFQUFBO1FBbkNDLElBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxZQUFZLEVBQWdCLENBQUM7SUFDdkQsQ0FBQzs7OztJQUVELFFBQVE7UUFDTixJQUFJLENBQUMsSUFBSSxHQUFHLEVBQUUsQ0FBQzs7Y0FDVCxXQUFXLEdBQUcsSUFBSSxDQUFDLE9BQU8sSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLFdBQVcsSUFBSSxNQUFNLENBQUMsaUJBQWlCOztjQUNsRixtQkFBbUIsR0FBRyxJQUFJLENBQUMsT0FBTyxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsbUJBQW1CLElBQUksQ0FBQyxHQUFHLENBQUM7O2NBQy9FLFVBQVUsR0FBRyxJQUFJLENBQUMsT0FBTyxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsVUFBVSxJQUFJLE1BQU0sQ0FBQyxpQkFBaUI7O2NBQ2hGLFdBQVcsR0FBRyxJQUFJLENBQUMsT0FBTyxJQUFJLElBQUksQ0FB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Q1cseUNBQTZCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgRGlyZWN0aXZlLCBFbGVtZW50UmVmLCBFdmVudEVtaXR0ZXIsIElucHV0LCBPdXRwdXQsIE9uSW5pdCwgT25EZXN0cm95LCBIb3N0TGlzdGVuZXIgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IFVwbG9hZE91dHB1dCwgVXBsb2FkSW5wdXQsIFVwbG9hZGVyT3B0aW9ucyB9IGZyb20gJy4vaW50ZXJmYWNlcyc7XG5pbXBvcnQgeyBOZ1VwbG9hZGVyU2VydmljZSB9IGZyb20gJy4vbmd4LXVwbG9hZGVyLmNsYXNzJztcbmltcG9ydCB7IFN1YnNjcmlwdGlvbiB9IGZyb20gJ3J4anMnO1xuXG5ARGlyZWN0aXZlKHtcbiAgc2VsZWN0b3I6ICdbbmdGaWxlRHJvcF0nXG59KVxuZXhwb3J0IGNsYXNzIE5nRmlsZURyb3BEaXJlY3RpdmUgaW1wbGVtZW50cyBPbkluaXQsIE9uRGVzdHJveSB7XG4gIEBJbnB1dCgpIG9wdGlvbnM6IFVwbG9hZGVyT3B0aW9ucztcbiAgQElucHV0KCkgdXBsb2FkSW5wdXQ6IEV2ZW50RW1pdHRlcjxVcGxvYWRJbnB1dD47XG4gIEBPdXRwdXQoKSB1cGxvYWRPdXRwdXQ6IEV2ZW50RW1pdHRlcjxVcGxvYWRPdXRwdXQ+O1xuXG4gIHVwbG9hZDogTmdVcGxvYWRlclNlcnZpY2U7XG4gIGVsOiBIVE1MSW5wdXRFbGVtZW50O1xuXG4gIF9zdWI6IFN1YnNjcmlwdGlvbltdO1xuXG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBlbGVtZW50UmVmOiBFbGVtZW50UmVmKSB7XG4gICAgdGhpcy51cGxvYWRPdXRwdXQgPSBuZXcgRXZlbnRFbWl0dGVyPFVwbG9hZE91dHB1dD4oKTtcbiAgfVxuXG4gIG5nT25Jbml0KCkge1xuICAgIHRoaXMuX3N1YiA9IFtdO1xuICAgIGNvbnN0IGNvbmN1cnJlbmN5ID0gdGhpcy5vcHRpb25zICYmIHRoaXMub3B0aW9ucy5jb25jdXJyZW5jeSB8fCBOdW1iZXIuUE9TSVRJVkVfSU5GSU5JVFk7XG4gICAgY29uc3QgYWxsb3dlZENvbnRlbnRUeXBlcyA9IHRoaXMub3B0aW9ucyAmJiB0aGlzLm9wdGlvbnMuYWxsb3dlZENvbnRlbnRUeXBlcyB8fCBbJyonXTtcbiAgICBjb25zdCBtYXhVcGxvYWRzID0gdGhpcy5vcHRpb25zICYmIHRoaXMub3B0aW9ucy5tYXhVcGxvYWRzIHx8IE51bWJlci5QT1NJVElWRV9JTkZJTklUWTtcbiAgICBjb25zdCBtYXhGaWxlU2l6ZSA9IHRoaXMub3B0aW9ucyAmJiB0aGlzLm9wdGlvbnMubWF4RmlsZVNpemUgfHwgTnVtYmVyLlBPU0lUSVZFX0lORklOSVRZO1xuICAgIHRoaXMudXBsb2FkID0gbmV3IE5nVXBsb2FkZXJTZXJ2aWNlKGNvbmN1cnJlbmN5LCBhbGxvd2VkQ29udGVudFR5cGVzLCBtYXhVcGxvYWRzLCBtYXhGaWxlU2l6ZSk7XG5cbiAgICB0aGlzLmVsID0gdGhpcy5lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQ7XG5cbiAgICB0aGlzLl9zdWIucHVzaChcbiAgICAgIHRoaXMudXBsb2FkLnNlcnZpY2VFdmVudHMuc3Vic2NyaWJlKChldmVudDogVXBsb2FkT3V0cHV0KSA9PiB7XG4gICAgICAgIHRoaXMudXBsb2FkT3V0cHV0LmVtaXQoZXZlbnQpO1xuICAgICAgfSlcbiAgICApO1xuXG4gICAgaWYgKHRoaXMudXBsb2FkSW5wdXQgaW5zdGFuY2VvZiBFdmVudEVtaXR0ZXIpIHtcbiAgICAgIHRoaXMuX3N1Yi5wdXNoKHRoaXMudXBsb2FkLmluaXRJbnB1dEV2ZW50cyh0aGlzLnVwbG9hZElucHV0KSk7XG4gICAgfVxuXG4gICAgdGhpcy5lbC5hZGRFdmVudExpc3RlbmVyKCdkcm9wJywgdGhpcy5zdG9wRXZlbnQsIGZhbHNlKTtcbiAgICB0aGlzLmVsLmFkZEV2ZW50TGlzdGVuZXIoJ2RyYWdlbnRlcicsIHRoaXMuc3RvcEV2ZW50LCBmYWxzZSk7XG4gICAgdGhpcy5lbC5hZGRFdmVudExpc3RlbmVyKCdkcmFnb3ZlcicsIHRoaXMuc3RvcEV2ZW50LCBmYWxzZSk7XG4gIH1cblxuICBuZ09uRGVzdHJveSgpIHtcbiAgICB0aGlzLl9zdWIuZm9yRWFjaChzdWIgPT4gc3ViLnVuc3Vic2NyaWJlKCkpO1xuICB9XG5cbiAgc3RvcEV2ZW50ID0gKGU6IEV2ZW50KSA9PiB7XG4gICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gIH1cblxuICBASG9zdExpc3RlbmVyKCdkcm9wJywgWyckZXZlbnQnXSlcbiAgcHVibGljIG9uRHJvcChlOiBhbnkpIHtcbiAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcblxuICAgIGNvbnN0IGV2ZW50OiBVcGxvYWRPdXRwdXQgPSB7IHR5cGU6ICdkcm9wJyB9O1xuICAgIHRoaXMudXBsb2FkT3V0cHV0LmVtaXQoZXZlbnQpO1xuICAgIHRoaXMudXBsb2FkLmhhbmRsZUZpbGVzKGUuZGF0YVRyYW5zZmVyLmZpbGVzKTtcbiAgfVxuXG4gIEBIb3N0TGlzdGVuZXIoJ2RyYWdvdmVyJywgWyckZXZlbnQnXSlcbiAgcHVibGljIG9uRHJhZ092ZXIoZTogRXZlbnQpIHtcbiAgICBpZiAoIWUpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBldmVudDogVXBsb2FkT3V0cHV0ID0geyB0eXBlOiAnZHJhZ092ZXInIH07XG4gICAgdGhpcy51cGxvYWRPdXRwdXQuZW1pdChldmVudCk7XG4gIH1cblxuICBASG9zdExpc3RlbmVyKCdkcmFnbGVhdmUnLCBbJyRldmVudCddKVxuICBwdWJsaWMgb25EcmFnTGVhdmUoZTogRXZlbnQpIHtcbiAgICBpZiAoIWUpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBldmVudDogVXBsb2FkT3V0cHV0ID0geyB0eXBlOiAnZHJhZ091dCcgfTtcbiAgICB0aGlzLnVwbG9hZE91dHB1dC5lbWl0KGV2ZW50KTtcbiAgfVxufVxuIl19