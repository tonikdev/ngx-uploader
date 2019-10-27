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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmctZmlsZS1kcm9wLmRpcmVjdGl2ZS5qcyIsInNvdXJjZVJvb3QiOiJuZzovL25neC11cGxvYWRlci8iLCJzb3VyY2VzIjpbImxpYi9uZy1maWxlLWRyb3AuZGlyZWN0aXZlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7QUFBQSxPQUFPLEVBQUUsU0FBUyxFQUFFLFVBQVUsRUFBRSxZQUFZLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBcUIsWUFBWSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBRXBILE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxNQUFNLHNCQUFzQixDQUFDO0FBR3pEO0lBYUUsNkJBQW1CLFVBQXNCO1FBQXRCLGVBQVUsR0FBVixVQUFVLENBQVk7UUFpQ3pDLGNBQVM7Ozs7UUFBRyxVQUFDLENBQVE7WUFDbkIsQ0FBQyxDQUFDLGVBQWUsRUFBRSxDQUFDO1lBQ3BCLENBQUMsQ0FBQyxjQUFjLEVBQUUsQ0FBQztRQUNyQixDQUFDLEVBQUE7UUFuQ0MsSUFBSSxDQUFDLFlBQVksR0FBRyxJQUFJLFlBQVksRUFBZ0IsQ0FBQztJQUN2RCxDQUFDOzs7O0lBRUQsc0NBQVE7OztJQUFSO1FBQUEsaUJBdUJDO1FBdEJDLElBQUksQ0FBQyxJQUFJLEdBQUcsRUFBRSxDQUFDOztZQUNULFdBQVcsR0FBRyxJQUFJLENBQUMsT0FBTyxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsV0FBVyxJQUFJLE1BQU0sQ0FBQyxpQkFBaUI7O1lBQ2xGLG1CQUFtQixHQUFHLElBQUksQ0FBQyxPQUFPLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxtQkFBbUIsSUFBSSxDQUFDLEdBQUcsQ0FBQzs7WUFDL0UsVUFBVSxHQUFHLElBQUksQ0FBQyxPQUFPLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxVQUFVLElBQUksTUFBTSxDQUFDLGlCQUFpQjs7WUFDaEYsV0FBVyxHQUFHLElBQUksQ0FBQyxPQUFPLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxXQUFXLElBQUksTUFBTSxD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bkQscUNBQTBCOztJQUMxQixpQ0FBcUI7O0lBRXJCLG1DQUFxQjs7SUFtQ3JCLHdDQUdDOztJQXBDVyx5Q0FBNkIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBEaXJlY3RpdmUsIEVsZW1lbnRSZWYsIEV2ZW50RW1pdHRlciwgSW5wdXQsIE91dHB1dCwgT25Jbml0LCBPbkRlc3Ryb3ksIEhvc3RMaXN0ZW5lciB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgVXBsb2FkT3V0cHV0LCBVcGxvYWRJbnB1dCwgVXBsb2FkZXJPcHRpb25zIH0gZnJvbSAnLi9pbnRlcmZhY2VzJztcbmltcG9ydCB7IE5nVXBsb2FkZXJTZXJ2aWNlIH0gZnJvbSAnLi9uZ3gtdXBsb2FkZXIuY2xhc3MnO1xuaW1wb3J0IHsgU3Vic2NyaXB0aW9uIH0gZnJvbSAncnhqcyc7XG5cbkBEaXJlY3RpdmUoe1xuICBzZWxlY3RvcjogJ1tuZ0ZpbGVEcm9wXSdcbn0pXG5leHBvcnQgY2xhc3MgTmdGaWxlRHJvcERpcmVjdGl2ZSBpbXBsZW1lbnRzIE9uSW5pdCwgT25EZXN0cm95IHtcbiAgQElucHV0KCkgb3B0aW9uczogVXBsb2FkZXJPcHRpb25zO1xuICBASW5wdXQoKSB1cGxvYWRJbnB1dDogRXZlbnRFbWl0dGVyPFVwbG9hZElucHV0PjtcbiAgQE91dHB1dCgpIHVwbG9hZE91dHB1dDogRXZlbnRFbWl0dGVyPFVwbG9hZE91dHB1dD47XG5cbiAgdXBsb2FkOiBOZ1VwbG9hZGVyU2VydmljZTtcbiAgZWw6IEhUTUxJbnB1dEVsZW1lbnQ7XG5cbiAgX3N1YjogU3Vic2NyaXB0aW9uW107XG5cbiAgY29uc3RydWN0b3IocHVibGljIGVsZW1lbnRSZWY6IEVsZW1lbnRSZWYpIHtcbiAgICB0aGlzLnVwbG9hZE91dHB1dCA9IG5ldyBFdmVudEVtaXR0ZXI8VXBsb2FkT3V0cHV0PigpO1xuICB9XG5cbiAgbmdPbkluaXQoKSB7XG4gICAgdGhpcy5fc3ViID0gW107XG4gICAgY29uc3QgY29uY3VycmVuY3kgPSB0aGlzLm9wdGlvbnMgJiYgdGhpcy5vcHRpb25zLmNvbmN1cnJlbmN5IHx8IE51bWJlci5QT1NJVElWRV9JTkZJTklUWTtcbiAgICBjb25zdCBhbGxvd2VkQ29udGVudFR5cGVzID0gdGhpcy5vcHRpb25zICYmIHRoaXMub3B0aW9ucy5hbGxvd2VkQ29udGVudFR5cGVzIHx8IFsnKiddO1xuICAgIGNvbnN0IG1heFVwbG9hZHMgPSB0aGlzLm9wdGlvbnMgJiYgdGhpcy5vcHRpb25zLm1heFVwbG9hZHMgfHwgTnVtYmVyLlBPU0lUSVZFX0lORklOSVRZO1xuICAgIGNvbnN0IG1heEZpbGVTaXplID0gdGhpcy5vcHRpb25zICYmIHRoaXMub3B0aW9ucy5tYXhGaWxlU2l6ZSB8fCBOdW1iZXIuUE9TSVRJVkVfSU5GSU5JVFk7XG4gICAgdGhpcy51cGxvYWQgPSBuZXcgTmdVcGxvYWRlclNlcnZpY2UoY29uY3VycmVuY3ksIGFsbG93ZWRDb250ZW50VHlwZXMsIG1heFVwbG9hZHMsIG1heEZpbGVTaXplKTtcblxuICAgIHRoaXMuZWwgPSB0aGlzLmVsZW1lbnRSZWYubmF0aXZlRWxlbWVudDtcblxuICAgIHRoaXMuX3N1Yi5wdXNoKFxuICAgICAgdGhpcy51cGxvYWQuc2VydmljZUV2ZW50cy5zdWJzY3JpYmUoKGV2ZW50OiBVcGxvYWRPdXRwdXQpID0+IHtcbiAgICAgICAgdGhpcy51cGxvYWRPdXRwdXQuZW1pdChldmVudCk7XG4gICAgICB9KVxuICAgICk7XG5cbiAgICBpZiAodGhpcy51cGxvYWRJbnB1dCBpbnN0YW5jZW9mIEV2ZW50RW1pdHRlcikge1xuICAgICAgdGhpcy5fc3ViLnB1c2godGhpcy51cGxvYWQuaW5pdElucHV0RXZlbnRzKHRoaXMudXBsb2FkSW5wdXQpKTtcbiAgICB9XG5cbiAgICB0aGlzLmVsLmFkZEV2ZW50TGlzdGVuZXIoJ2Ryb3AnLCB0aGlzLnN0b3BFdmVudCwgZmFsc2UpO1xuICAgIHRoaXMuZWwuYWRkRXZlbnRMaXN0ZW5lcignZHJhZ2VudGVyJywgdGhpcy5zdG9wRXZlbnQsIGZhbHNlKTtcbiAgICB0aGlzLmVsLmFkZEV2ZW50TGlzdGVuZXIoJ2RyYWdvdmVyJywgdGhpcy5zdG9wRXZlbnQsIGZhbHNlKTtcbiAgfVxuXG4gIG5nT25EZXN0cm95KCkge1xuICAgIHRoaXMuX3N1Yi5mb3JFYWNoKHN1YiA9PiBzdWIudW5zdWJzY3JpYmUoKSk7XG4gIH1cblxuICBzdG9wRXZlbnQgPSAoZTogRXZlbnQpID0+IHtcbiAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgfVxuXG4gIEBIb3N0TGlzdGVuZXIoJ2Ryb3AnLCBbJyRldmVudCddKVxuICBwdWJsaWMgb25Ecm9wKGU6IGFueSkge1xuICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgY29uc3QgZXZlbnQ6IFVwbG9hZE91dHB1dCA9IHsgdHlwZTogJ2Ryb3AnIH07XG4gICAgdGhpcy51cGxvYWRPdXRwdXQuZW1pdChldmVudCk7XG4gICAgdGhpcy51cGxvYWQuaGFuZGxlRmlsZXMoZS5kYXRhVHJhbnNmZXIuZmlsZXMpO1xuICB9XG5cbiAgQEhvc3RMaXN0ZW5lcignZHJhZ292ZXInLCBbJyRldmVudCddKVxuICBwdWJsaWMgb25EcmFnT3ZlcihlOiBFdmVudCkge1xuICAgIGlmICghZSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IGV2ZW50OiBVcGxvYWRPdXRwdXQgPSB7IHR5cGU6ICdkcmFnT3ZlcicgfTtcbiAgICB0aGlzLnVwbG9hZE91dHB1dC5lbWl0KGV2ZW50KTtcbiAgfVxuXG4gIEBIb3N0TGlzdGVuZXIoJ2RyYWdsZWF2ZScsIFsnJGV2ZW50J10pXG4gIHB1YmxpYyBvbkRyYWdMZWF2ZShlOiBFdmVudCkge1xuICAgIGlmICghZSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IGV2ZW50OiBVcGxvYWRPdXRwdXQgPSB7IHR5cGU6ICdkcmFnT3V0JyB9O1xuICAgIHRoaXMudXBsb2FkT3V0cHV0LmVtaXQoZXZlbnQpO1xuICB9XG59XG4iXX0=