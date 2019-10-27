/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
import { Directive, ElementRef, EventEmitter, Input, Output, HostListener } from '@angular/core';
import { NgUploaderService } from './ngx-uploader.class';
var NgFileDropDirective = /** @class */ (function () {
    function NgFileDropDirective(elementRef) {
        this.elementRef = elementRef;
        this.stopEvent = (/**
         * @param {?} e
         * @return {?}
         */
        function (e) {
            e.stopPropagation();
            e.preventDefault();
        });
        this.uploadOutput = new EventEmitter();
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
        this._sub.push(this.upload.serviceEvents.subscribe((/**
         * @param {?} event
         * @return {?}
         */
        function (event) {
            _this.uploadOutput.emit(event);
        })));
        if (this.uploadInput instanceof EventEmitter) {
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
        this._sub.forEach((/**
         * @param {?} sub
         * @return {?}
         */
        function (sub) { return sub.unsubscribe(); }));
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
        { type: Directive, args: [{
                    selector: '[ngFileDrop]'
                },] }
    ];
    /** @nocollapse */
    NgFileDropDirective.ctorParameters = function () { return [
        { type: ElementRef }
    ]; };
    NgFileDropDirective.propDecorators = {
        options: [{ type: Input }],
        uploadInput: [{ type: Input }],
        uploadOutput: [{ type: Output }],
        onDrop: [{ type: HostListener, args: ['drop', ['$event'],] }],
        onDragOver: [{ type: HostListener, args: ['dragover', ['$event'],] }],
        onDragLeave: [{ type: HostListener, args: ['dragleave', ['$event'],] }]
    };
    return NgFileDropDirective;
}());
export { NgFileDropDirective };
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmctZmlsZS1kcm9wLmRpcmVjdGl2ZS5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0B0b25pa2Rldi9uZ3gtdXBsb2FkZXItZW5oYW5jZWQvIiwic291cmNlcyI6WyJsaWIvbmctZmlsZS1kcm9wLmRpcmVjdGl2ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O0FBQUEsT0FBTyxFQUFFLFNBQVMsRUFBRSxVQUFVLEVBQUUsWUFBWSxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQXFCLFlBQVksRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUVwSCxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSxzQkFBc0IsQ0FBQztBQUd6RDtJQWFFLDZCQUFtQixVQUFzQjtRQUF0QixlQUFVLEdBQVYsVUFBVSxDQUFZO1FBaUN6QyxjQUFTOzs7O1FBQUcsVUFBQyxDQUFRO1lBQ25CLENBQUMsQ0FBQyxlQUFlLEVBQUUsQ0FBQztZQUNwQixDQUFDLENBQUMsY0FBYyxFQUFFLENBQUM7UUFDckIsQ0FBQyxFQUFBO1FBbkNDLElBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxZQUFZLEVBQWdCLENBQUM7SUFDdkQsQ0FBQzs7OztJQUVELHNDQUFROzs7SUFBUjtRQUFBLGlCQXVCQztRQXRCQyxJQUFJLENBQUMsSUFBSSxHQUFHLEVBQUUsQ0FBQzs7WUFDVCxXQUFXLEdBQUcsSUFBSSxDQUFDLE9BQU8sSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLFdBQVcsSUFBSSxNQUFNLENBQUMsaUJBQWlCOztZQUNsRixtQkFBbUIsR0FBRyxJQUFJLENBQUMsT0FBTyxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsbUJBQW1CLElBQUksQ0FBQyxHQUFHLENBQUM7O1lBQy9FLFVBQVUsR0FBRyxJQUFJLENBQUMsT0FBTyxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsVUFBVSxJQUFJLE1BQU0sQ0FBQyxpQkFBaUI7O1lBQ2hGLFdBQVcsR0FBRyxJQUFJLENBQUMsT0FBTyxJQUFJLElBQUksQ0FBQyxPQUFPLENB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OztJQUNoRCwyQ0FBbUQ7O0lBRW5ELHFDQUEwQjs7SUFDMUIsaUNBQXFCOztJQUVyQixtQ0FBcUI7O0lBbUNyQix3Q0FHQzs7SUFwQ1cseUNBQTZCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgRGlyZWN0aXZlLCBFbGVtZW50UmVmLCBFdmVudEVtaXR0ZXIsIElucHV0LCBPdXRwdXQsIE9uSW5pdCwgT25EZXN0cm95LCBIb3N0TGlzdGVuZXIgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IFVwbG9hZE91dHB1dCwgVXBsb2FkSW5wdXQsIFVwbG9hZGVyT3B0aW9ucyB9IGZyb20gJy4vaW50ZXJmYWNlcyc7XG5pbXBvcnQgeyBOZ1VwbG9hZGVyU2VydmljZSB9IGZyb20gJy4vbmd4LXVwbG9hZGVyLmNsYXNzJztcbmltcG9ydCB7IFN1YnNjcmlwdGlvbiB9IGZyb20gJ3J4anMnO1xuXG5ARGlyZWN0aXZlKHtcbiAgc2VsZWN0b3I6ICdbbmdGaWxlRHJvcF0nXG59KVxuZXhwb3J0IGNsYXNzIE5nRmlsZURyb3BEaXJlY3RpdmUgaW1wbGVtZW50cyBPbkluaXQsIE9uRGVzdHJveSB7XG4gIEBJbnB1dCgpIG9wdGlvbnM6IFVwbG9hZGVyT3B0aW9ucztcbiAgQElucHV0KCkgdXBsb2FkSW5wdXQ6IEV2ZW50RW1pdHRlcjxVcGxvYWRJbnB1dD47XG4gIEBPdXRwdXQoKSB1cGxvYWRPdXRwdXQ6IEV2ZW50RW1pdHRlcjxVcGxvYWRPdXRwdXQ+O1xuXG4gIHVwbG9hZDogTmdVcGxvYWRlclNlcnZpY2U7XG4gIGVsOiBIVE1MSW5wdXRFbGVtZW50O1xuXG4gIF9zdWI6IFN1YnNjcmlwdGlvbltdO1xuXG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBlbGVtZW50UmVmOiBFbGVtZW50UmVmKSB7XG4gICAgdGhpcy51cGxvYWRPdXRwdXQgPSBuZXcgRXZlbnRFbWl0dGVyPFVwbG9hZE91dHB1dD4oKTtcbiAgfVxuXG4gIG5nT25Jbml0KCkge1xuICAgIHRoaXMuX3N1YiA9IFtdO1xuICAgIGNvbnN0IGNvbmN1cnJlbmN5ID0gdGhpcy5vcHRpb25zICYmIHRoaXMub3B0aW9ucy5jb25jdXJyZW5jeSB8fCBOdW1iZXIuUE9TSVRJVkVfSU5GSU5JVFk7XG4gICAgY29uc3QgYWxsb3dlZENvbnRlbnRUeXBlcyA9IHRoaXMub3B0aW9ucyAmJiB0aGlzLm9wdGlvbnMuYWxsb3dlZENvbnRlbnRUeXBlcyB8fCBbJyonXTtcbiAgICBjb25zdCBtYXhVcGxvYWRzID0gdGhpcy5vcHRpb25zICYmIHRoaXMub3B0aW9ucy5tYXhVcGxvYWRzIHx8IE51bWJlci5QT1NJVElWRV9JTkZJTklUWTtcbiAgICBjb25zdCBtYXhGaWxlU2l6ZSA9IHRoaXMub3B0aW9ucyAmJiB0aGlzLm9wdGlvbnMubWF4RmlsZVNpemUgfHwgTnVtYmVyLlBPU0lUSVZFX0lORklOSVRZO1xuICAgIHRoaXMudXBsb2FkID0gbmV3IE5nVXBsb2FkZXJTZXJ2aWNlKGNvbmN1cnJlbmN5LCBhbGxvd2VkQ29udGVudFR5cGVzLCBtYXhVcGxvYWRzLCBtYXhGaWxlU2l6ZSk7XG5cbiAgICB0aGlzLmVsID0gdGhpcy5lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQ7XG5cbiAgICB0aGlzLl9zdWIucHVzaChcbiAgICAgIHRoaXMudXBsb2FkLnNlcnZpY2VFdmVudHMuc3Vic2NyaWJlKChldmVudDogVXBsb2FkT3V0cHV0KSA9PiB7XG4gICAgICAgIHRoaXMudXBsb2FkT3V0cHV0LmVtaXQoZXZlbnQpO1xuICAgICAgfSlcbiAgICApO1xuXG4gICAgaWYgKHRoaXMudXBsb2FkSW5wdXQgaW5zdGFuY2VvZiBFdmVudEVtaXR0ZXIpIHtcbiAgICAgIHRoaXMuX3N1Yi5wdXNoKHRoaXMudXBsb2FkLmluaXRJbnB1dEV2ZW50cyh0aGlzLnVwbG9hZElucHV0KSk7XG4gICAgfVxuXG4gICAgdGhpcy5lbC5hZGRFdmVudExpc3RlbmVyKCdkcm9wJywgdGhpcy5zdG9wRXZlbnQsIGZhbHNlKTtcbiAgICB0aGlzLmVsLmFkZEV2ZW50TGlzdGVuZXIoJ2RyYWdlbnRlcicsIHRoaXMuc3RvcEV2ZW50LCBmYWxzZSk7XG4gICAgdGhpcy5lbC5hZGRFdmVudExpc3RlbmVyKCdkcmFnb3ZlcicsIHRoaXMuc3RvcEV2ZW50LCBmYWxzZSk7XG4gIH1cblxuICBuZ09uRGVzdHJveSgpIHtcbiAgICB0aGlzLl9zdWIuZm9yRWFjaChzdWIgPT4gc3ViLnVuc3Vic2NyaWJlKCkpO1xuICB9XG5cbiAgc3RvcEV2ZW50ID0gKGU6IEV2ZW50KSA9PiB7XG4gICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gIH1cblxuICBASG9zdExpc3RlbmVyKCdkcm9wJywgWyckZXZlbnQnXSlcbiAgcHVibGljIG9uRHJvcChlOiBhbnkpIHtcbiAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcblxuICAgIGNvbnN0IGV2ZW50OiBVcGxvYWRPdXRwdXQgPSB7IHR5cGU6ICdkcm9wJyB9O1xuICAgIHRoaXMudXBsb2FkT3V0cHV0LmVtaXQoZXZlbnQpO1xuICAgIHRoaXMudXBsb2FkLmhhbmRsZUZpbGVzKGUuZGF0YVRyYW5zZmVyLmZpbGVzKTtcbiAgfVxuXG4gIEBIb3N0TGlzdGVuZXIoJ2RyYWdvdmVyJywgWyckZXZlbnQnXSlcbiAgcHVibGljIG9uRHJhZ092ZXIoZTogRXZlbnQpIHtcbiAgICBpZiAoIWUpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBldmVudDogVXBsb2FkT3V0cHV0ID0geyB0eXBlOiAnZHJhZ092ZXInIH07XG4gICAgdGhpcy51cGxvYWRPdXRwdXQuZW1pdChldmVudCk7XG4gIH1cblxuICBASG9zdExpc3RlbmVyKCdkcmFnbGVhdmUnLCBbJyRldmVudCddKVxuICBwdWJsaWMgb25EcmFnTGVhdmUoZTogRXZlbnQpIHtcbiAgICBpZiAoIWUpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBldmVudDogVXBsb2FkT3V0cHV0ID0geyB0eXBlOiAnZHJhZ091dCcgfTtcbiAgICB0aGlzLnVwbG9hZE91dHB1dC5lbWl0KGV2ZW50KTtcbiAgfVxufVxuIl19