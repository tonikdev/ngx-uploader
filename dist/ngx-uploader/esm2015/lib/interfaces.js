/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
/**
 * @record
 */
export function UploaderOptions() { }
if (false) {
    /** @type {?} */
    UploaderOptions.prototype.concurrency;
    /** @type {?|undefined} */
    UploaderOptions.prototype.allowedContentTypes;
    /** @type {?|undefined} */
    UploaderOptions.prototype.maxUploads;
    /** @type {?|undefined} */
    UploaderOptions.prototype.maxFileSize;
}
/**
 * @record
 */
export function BlobFile() { }
if (false) {
    /** @type {?} */
    BlobFile.prototype.name;
}
/** @enum {number} */
const UploadStatus = {
    Queue: 0,
    Uploading: 1,
    Done: 2,
    Cancelled: 3,
};
export { UploadStatus };
UploadStatus[UploadStatus.Queue] = 'Queue';
UploadStatus[UploadStatus.Uploading] = 'Uploading';
UploadStatus[UploadStatus.Done] = 'Done';
UploadStatus[UploadStatus.Cancelled] = 'Cancelled';
/**
 * @record
 */
export function UploadProgress() { }
if (false) {
    /** @type {?} */
    UploadProgress.prototype.status;
    /** @type {?|undefined} */
    UploadProgress.prototype.data;
}
/**
 * @record
 */
export function UploadFile() { }
if (false) {
    /** @type {?} */
    UploadFile.prototype.id;
    /** @type {?} */
    UploadFile.prototype.fileIndex;
    /** @type {?} */
    UploadFile.prototype.lastModifiedDate;
    /** @type {?} */
    UploadFile.prototype.name;
    /** @type {?} */
    UploadFile.prototype.size;
    /** @type {?} */
    UploadFile.prototype.type;
    /** @type {?} */
    UploadFile.prototype.form;
    /** @type {?} */
    UploadFile.prototype.progress;
    /** @type {?|undefined} */
    UploadFile.prototype.response;
    /** @type {?|undefined} */
    UploadFile.prototype.responseStatus;
    /** @type {?|undefined} */
    UploadFile.prototype.sub;
    /** @type {?|undefined} */
    UploadFile.prototype.nativeFile;
    /** @type {?|undefined} */
    UploadFile.prototype.responseHeaders;
}
/**
 * @record
 */
export function UploadOutput() { }
if (false) {
    /** @type {?} */
    UploadOutput.prototype.type;
    /** @type {?|undefined} */
    UploadOutput.prototype.file;
    /** @type {?|undefined} */
    UploadOutput.prototype.nativeFile;
}
/**
 * @record
 */
export function UploadInput() { }
if (false) {
    /** @type {?} */
    UploadInput.prototype.type;
    /** @type {?|undefined} */
    UploadInput.prototype.url;
    /** @type {?|undefined} */
    UploadInput.prototype.method;
    /** @type {?|undefined} */
    UploadInput.prototype.id;
    /** @type {?|undefined} */
    UploadInput.prototype.fieldName;
    /** @type {?|undefined} */
    UploadInput.prototype.fileIndex;
    /** @type {?|undefined} */
    UploadInput.prototype.file;
    /** @type {?|undefined} */
    UploadInput.prototype.data;
    /** @type {?|undefined} */
    UploadInput.prototype.headers;
    /** @type {?|undefined} */
    UploadInput.prototype.includeWebKitFormBoundary;
    /** @type {?|undefined} */
    UploadInput.prototype.withCredentials;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW50ZXJmYWNlcy5qcyIsInNvdXJjZVJvb3QiOiJuZzovL25neC11cGxvYWRlci8iLCJzb3VyY2VzIjpbImxpYi9pbnRlcmZhY2VzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFFQSxxQ0FLQzs7O0lBSkMsc0NBQW9COztJQUNwQiw4Q0FBK0I7O0lBQy9CLHFDQUFvQjs7SUFDcEIsc0NBQXFCOzs7OztBQUd2Qiw4QkFFQzs7O0lBREMsd0JBQWE7Ozs7SUFJYixRQUFLO0lBQ0wsWUFBUztJQUNULE9BQUk7SUFDSixZQUFTOzs7Ozs7Ozs7O0FBR1gsb0NBV0M7OztJQVZDLGdDQUFxQjs7SUFDckIsOEJBUUU7Ozs7O0FBR0osZ0NBY0M7OztJQWJDLHdCQUFXOztJQUNYLCtCQUFrQjs7SUFDbEIsc0NBQXVCOztJQUN2QiwwQkFBYTs7SUFDYiwwQkFBYTs7SUFDYiwwQkFBYTs7SUFDYiwwQkFBZTs7SUFDZiw4QkFBeUI7O0lBQ3pCLDhCQUFlOztJQUNmLG9DQUF3Qjs7SUFDeEIseUJBQXlCOztJQUN6QixnQ0FBa0I7O0lBQ2xCLHFDQUE0Qzs7Ozs7QUFHOUMsa0NBS0M7OztJQUpDLDRCQUNpRTs7SUFDakUsNEJBQWtCOztJQUNsQixrQ0FBa0I7Ozs7O0FBR3BCLGlDQVlDOzs7SUFYQywyQkFBbUY7O0lBQ25GLDBCQUFhOztJQUNiLDZCQUFnQjs7SUFDaEIseUJBQVk7O0lBQ1osZ0NBQW1COztJQUNuQixnQ0FBbUI7O0lBQ25CLDJCQUFrQjs7SUFDbEIsMkJBQXdDOztJQUN4Qyw4QkFBb0M7O0lBQ3BDLGdEQUFvQzs7SUFDcEMsc0NBQTBCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgU3Vic2NyaXB0aW9uIH0gZnJvbSAncnhqcyc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgVXBsb2FkZXJPcHRpb25zIHtcbiAgY29uY3VycmVuY3k6IG51bWJlcjtcbiAgYWxsb3dlZENvbnRlbnRUeXBlcz86IHN0cmluZ1tdO1xuICBtYXhVcGxvYWRzPzogbnVtYmVyO1xuICBtYXhGaWxlU2l6ZT86IG51bWJlcjtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBCbG9iRmlsZSBleHRlbmRzIEJsb2Ige1xuICBuYW1lOiBzdHJpbmc7XG59XG5cbmV4cG9ydCBlbnVtIFVwbG9hZFN0YXR1cyB7XG4gIFF1ZXVlLFxuICBVcGxvYWRpbmcsXG4gIERvbmUsXG4gIENhbmNlbGxlZFxufVxuXG5leHBvcnQgaW50ZXJmYWNlIFVwbG9hZFByb2dyZXNzIHtcbiAgc3RhdHVzOiBVcGxvYWRTdGF0dXM7XG4gIGRhdGE/OiB7XG4gICAgcGVyY2VudGFnZTogbnVtYmVyO1xuICAgIHNwZWVkOiBudW1iZXI7XG4gICAgc3BlZWRIdW1hbjogc3RyaW5nO1xuICAgIHN0YXJ0VGltZTogbnVtYmVyIHwgbnVsbDtcbiAgICBlbmRUaW1lOiBudW1iZXIgfCBudWxsO1xuICAgIGV0YTogbnVtYmVyIHwgbnVsbDtcbiAgICBldGFIdW1hbjogc3RyaW5nIHwgbnVsbDtcbiAgfTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBVcGxvYWRGaWxlIHtcbiAgaWQ6IHN0cmluZztcbiAgZmlsZUluZGV4OiBudW1iZXI7XG4gIGxhc3RNb2RpZmllZERhdGU6IERhdGU7XG4gIG5hbWU6IHN0cmluZztcbiAgc2l6ZTogbnVtYmVyO1xuICB0eXBlOiBzdHJpbmc7XG4gIGZvcm06IEZvcm1EYXRhO1xuICBwcm9ncmVzczogVXBsb2FkUHJvZ3Jlc3M7XG4gIHJlc3BvbnNlPzogYW55O1xuICByZXNwb25zZVN0YXR1cz86IG51bWJlcjtcbiAgc3ViPzogU3Vic2NyaXB0aW9uIHwgYW55O1xuICBuYXRpdmVGaWxlPzogRmlsZTtcbiAgcmVzcG9uc2VIZWFkZXJzPzogeyBba2V5OiBzdHJpbmddOiBzdHJpbmcgfTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBVcGxvYWRPdXRwdXQge1xuICB0eXBlOiAnYWRkZWRUb1F1ZXVlJyB8ICdhbGxBZGRlZFRvUXVldWUnIHwgJ3VwbG9hZGluZycgfCAnZG9uZScgfCAnc3RhcnQnIHwgJ2NhbmNlbGxlZCcgfCAnZHJhZ092ZXInXG4gICAgICB8ICdkcmFnT3V0JyB8ICdkcm9wJyB8ICdyZW1vdmVkJyB8ICdyZW1vdmVkQWxsJyB8ICdyZWplY3RlZCc7XG4gIGZpbGU/OiBVcGxvYWRGaWxlO1xuICBuYXRpdmVGaWxlPzogRmlsZTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBVcGxvYWRJbnB1dCB7XG4gIHR5cGU6ICd1cGxvYWRBbGwnIHwgJ3VwbG9hZEZpbGUnIHwgJ2NhbmNlbCcgfCAnY2FuY2VsQWxsJyB8ICdyZW1vdmUnIHwgJ3JlbW92ZUFsbCc7XG4gIHVybD86IHN0cmluZztcbiAgbWV0aG9kPzogc3RyaW5nO1xuICBpZD86IHN0cmluZztcbiAgZmllbGROYW1lPzogc3RyaW5nO1xuICBmaWxlSW5kZXg/OiBudW1iZXI7XG4gIGZpbGU/OiBVcGxvYWRGaWxlO1xuICBkYXRhPzogeyBba2V5OiBzdHJpbmddOiBzdHJpbmcgfCBCbG9iIH07XG4gIGhlYWRlcnM/OiB7IFtrZXk6IHN0cmluZ106IHN0cmluZyB9O1xuICBpbmNsdWRlV2ViS2l0Rm9ybUJvdW5kYXJ5PzogYm9vbGVhbjsgLy8gSWYgZmFsc2UsIG9ubHkgdGhlIGZpbGUgaXMgc2VuZCB0cm91Z2ggeGhyLnNlbmQgKFdlYktpdEZvcm1Cb3VuZGFyeSBpcyBvbWl0KVxuICB3aXRoQ3JlZGVudGlhbHM/OiBib29sZWFuO1xufVxuIl19